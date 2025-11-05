import { useState, useRef, useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ImageGallery from "./ImageGallery";
import SelectImagesProduct from "./SelectImagesProduct";
import EditorComp from "./EditorComp";
import GeolocalisationComp from "./GeolocalisationComp";
import countriesData from "../data/countries.json";
import axios from "axios";
import Notiflix from "notiflix";
import { url } from "../contextes/UrlContext";
import { useForm } from "react-hook-form";
import ProfileProgress from "./ProfileProgress";
import { useLogin } from "../components/Login/LoginContext";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
const countryMapping = {};
const countryNames = [];
Object.entries(countriesData.countries || {}).forEach(([code, name]) => {
  countryMapping[code] = name;
  countryMapping[name] = code;
  countryNames.push(name);
});
const jours = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const frenchToEnglishDay = {
  Lundi: "monday",
  Mardi: "tuesday",
  Mercredi: "wednesday",
  Jeudi: "thursday",
  Vendredi: "friday",
  Samedi: "saturday",
  Dimanche: "sunday",
};

function dokanToHoraires(dokanStoreTime) {
  const horaires = {};
  jours.forEach((jour) => {
    const englishKey = frenchToEnglishDay[jour];
    const day = (dokanStoreTime && dokanStoreTime[englishKey]) || {};
    const openingArray = Array.isArray(day.opening_time) ? day.opening_time : [];
    const closingArray = Array.isArray(day.closing_time) ? day.closing_time : [];
    const length = Math.min(openingArray.length, closingArray.length);
    const plages = [];
    for (let i = 0; i < length; i += 1) {
      if (openingArray[i] || closingArray[i]) {
        plages.push({ debut: openingArray[i] || "", fin: closingArray[i] || "" });
      }
    }
    const normalizedStatus = (day.status || "").toLowerCase();
    const isOpen = normalizedStatus === "open" || (plages.length > 0 && normalizedStatus !== "close");
    horaires[jour] = { isOpen, plages };
  });
  return horaires;
}

function horairesToDokan(horaires) {
  const result = {};
  
  jours.forEach((frenchDay) => {
    const englishKey = frenchToEnglishDay[frenchDay];
    const dayData = horaires[frenchDay] || { isOpen: false, plages: [] };
    const openings = [];
    const closings = [];
    
    (dayData.plages || []).forEach((plage) => {
      if (plage && (plage.debut || plage.fin)) {
        openings.push(plage.debut || "");
        closings.push(plage.fin || "");
      }
    });
    
    const open = Boolean(dayData.isOpen && openings.length > 0);
    
    result[englishKey] = {
      status: open ? "open" : "close",
      opening_time: open ? openings : [],
      closing_time: open ? closings : [],
    };
  });
  
  return result;
}
function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const search = async () => {
    if (!query) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url);
    const data = await res.json();
    setResults(data);
  };
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Rechercher un lieu..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search();
        }}
        className="w-full p-2 border rounded"
      />
      {results.length > 0 && (
        <ul className="overflow-auto bg-white border rounded max-h-48">
          {results.map((item) => (
            <li
              key={item.place_id}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                onSelect({
                  lat: parseFloat(item.lat),
                  lng: parseFloat(item.lon),
                });
                setResults([]);
                setQuery(item.display_name);
              }}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}
export default function ProfileForm({ onSlugLoaded }) {
  const { setIsVendor: setIsVendorCtx } = useLogin();
  const { register, setValue, getValues } = useForm();
  const initialHoraires = {};
  jours.forEach((jour) => {
    initialHoraires[jour] = { isOpen: false, plages: [] };
  });
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    photo: "",
    name: "",
    rue1: "",
    rue2: "",
    ville: "",
    codePostal: "",
    pays: "",
    telephone: "",
    avisOuverture: "",
    avisFermeture: "",
    horaires: initialHoraires,
  });
  const [geoDefaults, setGeoDefaults] = useState({
    lat: -18.8792,
    lng: 47.5079,
    address: "Tananarive, Madagascar",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [showHoraires, setShowHoraires] = useState(false);
  const [savedHoraires, setSavedHoraires] = useState({});
  const [showBannerSelector, setShowBannerSelector] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const editorRef = useRef(null);
  const [bioDefault, setBioDefault] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Fonction pour récupérer les détails d'une image par ID
  const fetchImageDetails = async (imageId) => {
    try {
      // Utiliser l'endpoint mesimages pour récupérer toutes les images
      const response = await axios.get(`${url}/mesimages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // Trouver l'image par ID
      const image = response.data.find(img => img.id === imageId);
      
      if (image) {
        return {
          id: image.id,
          url: image.url || image.source_url || "",
          alt: image.alt || "Image"
        };
      } else {
        return { id: imageId, url: "", alt: "Image non trouvée" };
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'image ${imageId}:`, error);
      return { id: imageId, url: "", alt: "Image non trouvée" };
    }
  };

  // fetchData est disponible mais non appelé automatiquement
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/get-info-store`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Données de la boutique :", response.data);
      const metaData = response.data.meta || {};
      const settings = metaData.dokan_profile_settings || {};
      const address = settings.address || {};     
      setMeta(metaData);
      // Récupération du nom de la boutique depuis dokan_profile_settings.store_name
      const storeName = settings.store_name || "";
      
      // Ajout: remonte le slug au parent si besoin
      if (onSlugLoaded && response.data.slug) {
        onSlugLoaded(response.data.slug);
      }
      
      setForm(prev => ({
        ...prev,
        name: storeName,
        telephone: settings.phone || "",
        rue1: address.street_1 || "",
        rue2: address.street_2 || "",
        ville: address.city || "",
        codePostal: address.zip || "",
        pays: address.country || "",
        avisOuverture: address.avis_ouverture || "",
        avisFermeture: address.avis_fermeture || "",
      }));
      setBioDefault(settings.vendor_biography || "");

      // Gestion du banner
      if (settings.banner && settings.banner !== 0) {
        if (typeof settings.banner === 'object' && settings.banner.url) {
          setThumbnail(settings.banner);
        } else if (typeof settings.banner === 'number') {
          // Récupérer les détails de l'image par ID
          const bannerDetails = await fetchImageDetails(settings.banner);
          setThumbnail(bannerDetails);
        } else {
          setThumbnail(settings.banner);
        }
      } else {
        setThumbnail(null);
      }

      // Gestion du gravatar (photo de profil)
      if (settings.gravatar && settings.gravatar !== 0) {
        if (typeof settings.gravatar === 'object' && settings.gravatar.url) {
          setForm(prev => ({ ...prev, photo: settings.gravatar }));
        } else if (typeof settings.gravatar === 'number') {
          // Récupérer les détails de l'image par ID
          const gravatarDetails = await fetchImageDetails(settings.gravatar);
          setForm(prev => ({ ...prev, photo: gravatarDetails }));
        } else {
          setForm(prev => ({ ...prev, photo: settings.gravatar }));
        }
      } else {
        setForm(prev => ({ ...prev, photo: "" }));
      }

      if (settings.dokan_store_time) {
        const horairesFromDokan = dokanToHoraires(settings.dokan_store_time);
        setForm((prev) => ({
          ...prev,
          horaires: horairesFromDokan,
        }));
        
        // Sauvegarder les horaires initiaux
        setSavedHoraires(horairesFromDokan);
        
        // Vérifier s'il y a des heures valides pour cocher automatiquement
        const hasValidHours = Object.values(horairesFromDokan).some(
          (day) => day && day.isOpen && Array.isArray(day.plages) && day.plages.length > 0
        );
        
        if (hasValidHours) {
          setShowHoraires(true);
        }
      }

      if (settings.location && settings.location !== "") {
        const coords = settings.location.split(',');
        if (coords.length === 2) {
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            setGeoDefaults(prev => ({
              ...prev,
              lat: lat,
              lng: lng,
              address: metaData.dokan_geo_address || `${address.city || 'Tananarive'}, ${address.country || 'Madagascar'}`
            }));
          }
        }
      } else if (metaData.dokan_geo_latitude && metaData.dokan_geo_longitude) {
        // Fallback pour l'ancien format
        setGeoDefaults(prev => ({
          ...prev,
          lat: parseFloat(metaData.dokan_geo_latitude),
          lng: parseFloat(metaData.dokan_geo_longitude),
          address: metaData.dokan_geo_address || `${address.city || 'Tananarive'}, ${address.country || 'Madagascar'}`
        }));
      }
    } catch (error) {
      Notiflix.Notify.failure("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (geoDefaults.lat && geoDefaults.lng) {
      setValue('latitude', geoDefaults.lat);
      setValue('longitude', geoDefaults.lng);
      setValue('address', geoDefaults.address);
    }
  }, [geoDefaults, setValue]);

  useEffect(() => {
    if (editorRef.current && typeof editorRef.current.setData === 'function') {
      editorRef.current.setData(bioDefault || '');
    }
  }, [bioDefault]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHorairesToggle = (checked) => {
    setShowHoraires(checked);
    
    if (!checked) {
      // Si on décoche, remettre les horaires à l'état initial
      setForm(prev => ({
        ...prev,
        horaires: { ...savedHoraires }
      }));
    }
  };

  const handleProfilePhotoSelect = (img) => {
    setForm(prev => ({ ...prev, photo: img }));
    setShowProfileSelector(false);
  };

  const toggleJourOuvert = (jour) => {
    setForm((prev) => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        [jour]: {
          ...prev.horaires[jour],
          isOpen: !prev.horaires[jour].isOpen,
        },
      },
    }));
  };
  const addPlageHoraire = (jour) => {
    setForm((prev) => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        [jour]: {
          ...prev.horaires[jour],
          plages: [...prev.horaires[jour].plages, { debut: "", fin: "" }],
        },
      },
    }));
  };
  const updatePlageHoraire = (jour, index, field, value) => {
    const newPlages = [...form.horaires[jour].plages];
    newPlages[index][field] = value;
    setForm((prev) => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        [jour]: {
          ...prev.horaires[jour],
          plages: newPlages,
        },
      },
    }));
  };
  const removePlageHoraire = (jour, indexToRemove) => {
    const newPlages = form.horaires[jour].plages.filter(
      (_, i) => i !== indexToRemove
    );
    setForm((prev) => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        [jour]: {
          ...prev.horaires[jour],
          plages: newPlages,
        },
      },
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');
    const address = formData.get('address');
    const bioContent = editorRef.current && typeof editorRef.current.getData === 'function'
      ? editorRef.current.getData()
      : (bioDefault || "");
    const anyOpen = Object.values(form.horaires || {}).some(
      (d) => d && d.isOpen && Array.isArray(d.plages) && d.plages.length > 0
    );
    const dokanStoreTime = horairesToDokan(form.horaires);
    const metaToSend = {
        address: {
          street_1: form.rue1,
          street_2: form.rue2,
          city: form.ville,
          zip: form.codePostal,
          country: form.pays,
          avis_ouverture: form.avisOuverture,
          avis_fermeture: form.avisFermeture,
        },
        store_name: form.name,
        dokan_store_name: form.name,
        phone: form.telephone,
        location: `${latitude},${longitude}`,
        banner: thumbnail ? {
          id: thumbnail.id || 0,
          url: thumbnail.url || "",
          alt: thumbnail.alt || "Bannière de la boutique"
        } : 0,
        gravatar: form.photo ? {
          id: form.photo.id || 0,
          url: form.photo.url || "",
          alt: form.photo.alt || "Photo de profil"
        } : 0,
        dokan_store_time: dokanStoreTime,
        dokan_store_time_enabled: anyOpen ? "yes" : "no",
        vendor_biography: bioContent,
        dokan_geo_address: address,
    };
    try {
      const response = await axios.post(`${url}/edit-info-store`,
        metaToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        Notiflix.Notify.success("Boutique mise à jour avec succès !");
        setIsVendorCtx(true); 
        setTimeout(() => {
          window.location.href = '/tableau-de-bord';
        }, 1000);
        computeProfileCompletion();
      } else {
        Notiflix.Notify.failure(
          response.data.message || "Erreur lors de la mise à jour"
        );
      }
    } catch (error) {
      Notiflix.Notify.failure("Erreur lors de la mise à jour");
    }
  };

  // Calcul de complétion du profil
  const computeProfileCompletion = () => {
    const stringFields = [
      form.name,
      form.rue1,
      form.ville,
      form.codePostal,
      form.pays,
      form.telephone,
    ];
    const isPhotoSet = Boolean(form.photo && (form.photo.url || typeof form.photo === 'string'));
    const isBannerSet = Boolean(thumbnail && thumbnail.url);
    const bioFilled = Boolean((bioDefault || '').trim());
    const horairesFilled = Object.values(form.horaires || {}).some(
      (d) => d && d.isOpen && Array.isArray(d.plages) && d.plages.length > 0
    );
    let filled = stringFields.filter(v => (v || '').toString().trim() !== '').length;
    filled += isPhotoSet ? 1 : 0;
    filled += isBannerSet ? 1 : 0;
    filled += bioFilled ? 1 : 0;
    filled += horairesFilled ? 1 : 0;
    const total = stringFields.length + 4; // 6 text + photo + banner + bio + horaires
    setProfileCompletion(Math.round((filled / total) * 100));
  };

  // Recalculer la complétion dès que les données visibles changent
  useEffect(() => {
    computeProfileCompletion();
  }, [form, thumbnail, bioDefault]);
  return (
    <div className="p-6 mx-auto space-y-6 rounded shadow">
      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6858b] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Profil de la Boutique</h2>
          <ProfileProgress percentage={profileCompletion} label={`Complétion du profil : ${profileCompletion}%`} />
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-700">
              Image de la bannière
            </h2>

            <div className="w-full mb-4">
              {thumbnail && thumbnail.url ? (
                <div className="relative">
                  <img
                    src={thumbnail.url}
                    alt="Bannière de la boutique"
                    className="object-cover w-full h-64 border-2 border-gray-300 rounded-lg shadow-lg md:h-80 lg:h-96"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnail(null)}
                    className="absolute flex items-center justify-center w-8 h-8 text-white transition-colors bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                    title="Supprimer la bannière"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setShowBannerSelector(true)}
                  className="flex flex-col items-center justify-center w-full h-64 text-gray-500 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer md:h-80 lg:h-96 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center w-20 h-20 mb-3 transition-colors bg-blue-100 rounded-full hover:bg-blue-200">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Aucune bannière sélectionnée</p>
                  <p className="mt-1 text-xs text-gray-400">Cliquez sur le + pour sélectionner une image</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="relative mb-6 ml-6 -mt-24">
              {form.photo && (form.photo.url || typeof form.photo === 'string') ? (
                <div className="relative">
                  <img
                    src={typeof form.photo === 'string' ? form.photo : form.photo.url}
                    alt="Photo de profil"
                    className="object-cover w-40 h-40 border-4 border-white rounded-full shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, photo: "" }))}
                    className="absolute flex items-center justify-center w-6 h-6 text-sm text-white transition-colors bg-red-500 rounded-full -top-1 -right-1 hover:bg-red-600"
                    title="Supprimer la photo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setShowProfileSelector(true)}
                  className="flex items-center justify-center w-40 h-40 text-gray-500 transition-colors border-2 border-gray-300 border-dashed rounded-full shadow-lg cursor-pointer bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center w-20 h-20 transition-colors bg-blue-100 rounded-full hover:bg-blue-200">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-xl font-bold">Nom de la boutique</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <h1 className="text-2xl font-bold">Adresse :</h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              name="rue1"
              value={form.rue1}
              onChange={handleChange}
              placeholder="Rue 1"
              className="p-2 border rounded"
            />
            <input
              name="rue2"
              value={form.rue2}
              onChange={handleChange}
              placeholder="Rue 2"
              className="p-2 border rounded"
            />
            <input
              name="ville"
              value={form.ville}
              onChange={handleChange}
              placeholder="Ville"
              className="p-2 border rounded"
            />
            <input
              name="codePostal"
              value={form.codePostal}
              onChange={handleChange}
              placeholder="Code postal"
              className="p-2 border rounded"
            />
            <select
              name="pays"
              value={form.pays}
              onChange={handleChange}
              className="w-full col-span-2 p-2 border rounded"
            >
              <option value="">-- Pays --</option>
              {countryNames.map((paysNom, i) => (
                <option key={i} value={paysNom}>
                  {paysNom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xl font-bold">Téléphone</label>
            <input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {!loading && (
            <GeolocalisationComp
              register={register}
              setValue={setValue}
              defaultLat={geoDefaults.lat}
              defaultLng={geoDefaults.lng}
              defaultAddress={geoDefaults.address}
              weShow={false}
            />
          )}

          <div>
            <label className="flex items-center gap-2 mb-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={showHoraires}
                onChange={(e) => handleHorairesToggle(e.target.checked)}
              />
              Horaire du magasin
            </label>
            {showHoraires && (
              <div className="space-y-2">
                {jours.map((jour) => (
                  <div key={jour} className="p-4 mb-2 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{jour}</span>
                      <label className="flex items-center gap-3">
                        <span className="w-16 text-sm font-medium">
                          {form.horaires[jour].isOpen ? "Ouvert" : "Fermé"}
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={form.horaires[jour].isOpen}
                            onChange={() => toggleJourOuvert(jour)}
                            className="sr-only peer"
                          />
                          <div className="h-6 transition-colors duration-300 bg-gray-300 rounded-full w-11 peer-checked:bg-green-500"></div>
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                        </div>
                      </label>
                    </div>
                    {form.horaires[jour].isOpen && (
                      <div className="space-y-2">
                        {form.horaires[jour].plages.map((plage, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={plage.debut}
                              onChange={(e) =>
                                updatePlageHoraire(
                                  jour,
                                  index,
                                  "debut",
                                  e.target.value
                                )
                              }
                              className="p-1 border rounded"
                            />
                            <span>à</span>
                            <input
                              type="time"
                              value={plage.fin}
                              onChange={(e) =>
                                updatePlageHoraire(
                                  jour,
                                  index,
                                  "fin",
                                  e.target.value
                                )
                              }
                              className="p-1 border rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removePlageHoraire(jour, index)}
                              className="px-2 py-1 ml-2 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                              title="Supprimer cette plage"
                              aria-label="Supprimer cette plage"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addPlageHoraire(jour)}
                          className="text-sm text-blue-600 underline"
                        >
                          + Ajouter une plage d'heure
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="mt-5">
                    <label className="block mb-1 text-sm font-semibold">
                      Avis d'ouverture de la boutique
                    </label>
                    <input
                      type="text"
                      name="avisOuverture"
                      value={form.avisOuverture || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="La boutique est ouverte"
                    />
                  </div>
                  <div className="mt-5">
                    <label className="block mb-1 text-sm font-semibold">
                      Avis de fermeture de la boutique
                    </label>
                    <input
                      type="text"
                      name="avisFermeture"
                      value={form.avisFermeture || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      placeholder="Boutique fermée"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block mb-2 text-xl font-bold">Biographie</label>
            <EditorComp Ref={editorRef} height={250} defaultvalue={bioDefault} />
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-[#f6858b] text-white rounded hover:bg-pink-700"
            >
              Mettre à jour les paramètres
            </button>
          </div>
        </form>
      )}

      {showBannerSelector && (
        <SelectImagesProduct
          setShowMap={setShowBannerSelector}
          showMap={showBannerSelector}
          selecteOne={true}
          setGallery={() => { }}
          setThumbnail={setThumbnail}
        />
      )}

      {showProfileSelector && (
        <SelectImagesProduct
          setShowMap={setShowProfileSelector}
          showMap={showProfileSelector}
          selecteOne={true}
          setGallery={() => { }}
          setThumbnail={handleProfilePhotoSelect}
        />
      )}
    </div>
  );
}