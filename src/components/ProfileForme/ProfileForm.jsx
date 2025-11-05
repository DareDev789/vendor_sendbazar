import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Notiflix from "notiflix";
import { url } from "../../contextes/UrlContext";
import countriesData from "../../data/countries.json";
import ProfileHeader from "./ProfileHeader";
import BannerSection from "./BannerSection";
import ProfilePhotoSection from "./ProfilePhotoSection";
import StoreInfoSection from "./StoreInfoSection";
import OpeningHoursSection from "./OpeningHoursSection";
import EditorComp from "../../utils/EditorComp";
import GeolocalisationComp from "../../utils/GeolocalisationComp";
import SelectImagesProduct from "../../utils/SelectImagesProduct";
import { useLogin } from "../Login/LoginContext";

const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const countryNames = Object.values(countriesData.countries || {});
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

export default function ProfileForm({ onSlugLoaded, fullWidth = false }) {
  const { setIsVendor: setIsVendorCtx, isVendor } = useLogin();
  const { register, setValue } = useForm();
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleHorairesToggle = (checked) => {
    setShowHoraires(checked);
    if (!checked) {
      setForm(prev => ({ ...prev, horaires: { ...savedHoraires } }));
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
    const newPlages = form.horaires[jour].plages.filter((_, i) => i !== indexToRemove);
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const fetchImageDetails = async (imageId) => {
    try {
      const response = await axios.get(`${url}/mesimages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
      return { id: imageId, url: "", alt: "Image non trouvée" };
    }
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/get-info-store`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const metaData = response.data.meta || {};
      const settings = metaData.dokan_profile_settings || {};
      const address = settings.address || {};
      setMeta(metaData);
      const storeName = settings.store_name || "";
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
      if (settings.banner && settings.banner !== 0) {
        if (typeof settings.banner === 'object' && settings.banner.url) {
          setThumbnail(settings.banner);
        } else if (typeof settings.banner === 'number') {
          const bannerDetails = await fetchImageDetails(settings.banner);
          setThumbnail(bannerDetails);
        } else {
          setThumbnail(settings.banner);
        }
      } else {
        setThumbnail(null);
      }
      if (settings.gravatar && settings.gravatar !== 0) {
        if (typeof settings.gravatar === 'object' && settings.gravatar.url) {
          setForm(prev => ({ ...prev, photo: settings.gravatar }));
        } else if (typeof settings.gravatar === 'number') {
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
        setForm((prev) => ({ ...prev, horaires: horairesFromDokan, }));
        setSavedHoraires(horairesFromDokan);
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
        setGeoDefaults(prev => ({
          ...prev,
          lat: parseFloat(metaData.dokan_geo_latitude),
          lng: parseFloat(metaData.dokan_geo_longitude),
          address: metaData.dokan_geo_address || `${address.city || 'Tananarive'}, ${address.country || 'Madagascar'}`
        }));
      }
      setProfileLoaded(true);
    } catch (error) {
      Notiflix.Notify.failure("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isVendor) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isVendor]);
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
  
  // calcul du profileCompletion
  const computeProfileCompletion = () => {
    const stringFields = [
      form.name,
      form.rue1,
      form.ville,
      form.codePostal,
      form.pays,
      form.telephone
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
    const total = stringFields.length + 4;
    setProfileCompletion(Math.round((filled / total) * 100));
  };
  useEffect(() => {
    computeProfileCompletion();
    // eslint-disable-next-line
  }, [form, thumbnail, bioDefault]);
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
  
  return (
    <div className={`p-6 mx-auto ${fullWidth ? 'w-full' : 'max-w-6xl w-full'} space-y-6 rounded shadow`}>
      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6858b] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Profil de la Boutique</h2>
          {isVendor && (
            <>
              <ProfileHeader percentage={profileCompletion} />
              <BannerSection
                thumbnail={thumbnail}
                setThumbnail={setThumbnail}
                setShowBannerSelector={setShowBannerSelector}
              />
              <ProfilePhotoSection
                photo={form.photo}
                setPhoto={(photo) => setForm(prev => ({ ...prev, photo }))}
                setShowProfileSelector={setShowProfileSelector}
              />
            </>
          )}
          <StoreInfoSection
            form={form}
            handleChange={handleChange}
            countryNames={countryNames}
          />
          {!loading && (
            <GeolocalisationComp
              register={register}
              setValue={setValue}
              defaultLat={geoDefaults.lat}
              defaultLng={geoDefaults.lng}
              defaultAddress={geoDefaults.address}
            />
          )}
          <OpeningHoursSection
            showHoraires={showHoraires}
            handleHorairesToggle={handleHorairesToggle}
            form={form}
            toggleJourOuvert={toggleJourOuvert}
            addPlageHoraire={addPlageHoraire}
            updatePlageHoraire={updatePlageHoraire}
            removePlageHoraire={removePlageHoraire}
            jours={jours}
          />
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
