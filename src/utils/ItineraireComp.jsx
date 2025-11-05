import { useState, useRef, useEffect } from 'react';
import EditorComp from './EditorComp';
import Notiflix from 'notiflix';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faChevronDown, faChevronUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import ImageGallery from "./ImageGallery";

export default function ItineraireComp({ circuit_duree, onChangeItineraire }) {
  const [itineraire, setItineraire] = useState([]);
  const [itineraireOuvert, setItineraireOuvert] = useState(true);
  const [joursOuverts, setJoursOuverts] = useState([]);
  const galleryRefs = useRef([]);
  const itineraireEditorRefs = useRef([]);

  useEffect(() => {
    // Ajout d'une journée par défaut si itineraire vide au premier rendu
    if (itineraire.length === 0) {
      setItineraire([{ titre: '', description: '', gallery: [], thumbnail: null }]);
    }
    setJoursOuverts(Array(itineraire.length).fill(true));
    if (onChangeItineraire) {
      // On transmet la valeur à l'extérieur si besoin
      const newItineraire = itineraire.map((jour, i) => ({
        ...jour,
        description: itineraireEditorRefs.current[i]?.getContent?.() || jour.description
      }));
      onChangeItineraire(newItineraire);
    }
  }, [itineraire.length]);

  const handleItineraireChange = (index, field, value) => {
    setItineraire(prev => prev.map((j, i) => i === index ? { ...j, [field]: value } : j));
  };

  const addJour = () => {
    if (!circuit_duree || itineraire.length < Number(circuit_duree)) {
      setItineraire(prev => [...prev, { titre: '', description: '', gallery: [], thumbnail: null }]);
    } else {
      Notiflix.Notify.warning('Vous avez atteint le nombre maximum de jours pour la durée choisie.');
    }
  };

  const removeJour = (index) => {
    setItineraire(prev => prev.filter((_, i) => i !== index));
  };

  const handleGalleryUpload = (jourIndex, e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setItineraire(prev => prev.map((j, i) => i === jourIndex ? { ...j, gallery: [...j.gallery, { file, url: ev.target.result, id: Date.now() + Math.random() }] } : j));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveGalleryImage = (jourIndex, imgId) => {
    setItineraire(prev => prev.map((j, i) => i === jourIndex ? { ...j, gallery: j.gallery.filter(img => img.id !== imgId) } : j));
  };

  return (
    <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setItineraireOuvert(o => !o)}
          className="flex items-center text-[#f6858b] text-2xl font-bold mb-0 w-full justify-between"
        >
          <span className="flex items-center">
            <FontAwesomeIcon icon={faRoute} className="mr-3" />
            Itinéraire
            <span className="text-base font-normal text-gray-600 ml-2 self-center">
              Définir les étapes du circuit
            </span>
          </span>
          <span className="text-base text-gray-600">{itineraireOuvert ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}</span>
        </button>       
      </div>
      {itineraireOuvert && (
        <>
          {itineraire.map((jour, i) => (
        <div key={i} className="border p-4 mb-4 rounded bg-gray-50">
          <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setJoursOuverts(joursOuverts => joursOuverts.map((open, idx) => idx === i ? !open : open))}>
            <div className="flex items-center">
              <svg className={`w-4 h-4 mr-2 transition-transform ${joursOuverts[i] ? '' : 'rotate-[-90deg]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              <span className="font-semibold text-xs">Jour {i + 1}</span>
            </div>
                <button type="button" onClick={e => { e.stopPropagation(); removeJour(i); }} className="text-red-600 text-xs underline ml-2 flex items-center"><FontAwesomeIcon icon={faTrash} className="mr-1" />Supprimer ce jour</button>
          </div>
          {joursOuverts[i] && (
            <div className="flex flex-col md:flex-row gap-4 items-start mt-2">
              <div className="flex-1 w-full">
                <div className="mb-2">
                  <label className="block text-xs font-semibold mb-1">Titre de l'étape</label>
                  <input
                    type="text"
                    value={jour.titre}
                    onChange={e => handleItineraireChange(i, 'titre', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Titre de l'étape"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-semibold mb-1">Description</label>
                  <EditorComp Ref={el => (itineraireEditorRefs.current[i] = el)} height={200} />
                </div>
              </div>
              <div className="md:w-60 w-full flex-shrink-0 flex flex-col items-center">
                <div className="bg-white p-6 rounded-lg shadow-md w-full">
                  <ImageGallery
                    gallery={jour.gallery}
                    setGallery={g => setItineraire(prev => prev.map((j, idx) => idx === i ? { ...j, gallery: g } : j))}
                    thumbnail={jour.thumbnail}
                    setThumbnail={t => setItineraire(prev => prev.map((j, idx) => idx === i ? { ...j, thumbnail: t } : j))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
          <div className="flex flex-col md:flex-row items-center justify-between mt-2">
            <div className="w-full mb-2 md:mb-0 flex justify-center">
              <label className="block text-sm font-bold text-gray-700 text-center">
                Ajouter un jour pour chaque étape du circuit.
              </label>
            </div>
            <div className="w-full md:w-1/4 flex justify-end">
              <button type="button" className="bg-[#f6858b] hover:bg-[#b92b32] text-white font-bold py-2 px-4 rounded text-sm w-full md:w-auto" onClick={addJour}>
        + Ajouter un jour
      </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}