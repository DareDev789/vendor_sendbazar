import { useEffect, useState } from "react";
import ProfileProgress from "../../../utils/ProfileProgress";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Notiflix from 'notiflix';
import { url } from '../../../contextes/UrlContext';
import {
  faFacebookF, faTwitter, faPinterestP, faLinkedinIn,
  faYoutube, faInstagram, faFlickr, faThreads
} from '@fortawesome/free-brands-svg-icons';

const socialMediaFields = [
  { name: "Facebook", icon: faFacebookF, key: "facebook" },
  { name: "Twitter", icon: faTwitter, key: "twitter" },
  { name: "Pinterest", icon: faPinterestP, key: "pinterest" },
  { name: "LinkedIn", icon: faLinkedinIn, key: "linkedin" },
  { name: "YouTube", icon: faYoutube, key: "youtube" },
  { name: "Instagram", icon: faInstagram, key: "instagram" },
  { name: "Flickr", icon: faFlickr, key: "flickr" },
  { name: "Threads", icon: faThreads, key: "threads" },
];

export default function IndexReseauxSociaux() {
  const [profilCompletion, setProfilCompletion] = useState(0);

  const [form, setForm] = useState({
    facebook: '',
    twitter: '',
    pinterest: '',
    linkedin: '',
    youtube: '',
    instagram: '',
    flickr: '',
    threads: '',
  });

  // GET: récupérer meta depuis /get-info-store
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${url}/get-info-store`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const meta = response.data?.meta || {};
        const social = meta?.dokan_profile_settings?.social || {};
        const nextForm = {
          facebook: social.facebook || '',
          twitter: social.twitter || '',
          pinterest: social.pinterest || '',
          linkedin: social.linkedin || '',
          youtube: social.youtube || '',
          instagram: social.instagram || '',
          flickr: social.flickr || '',
          threads: social.threads || ''
        };
        setForm(nextForm);
        // calculer la complétion: % de champs non vides
        const total = Object.keys(nextForm).length;
        const filled = Object.values(nextForm).filter(v => (v || '').trim() !== '').length;
        setProfilCompletion(Math.round((filled / total) * 100));
      } catch (e) {
      }
    };
    fetchData();
  }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST: edit-info-store en fusionnant la structure attendue
      const payload = {
        social: {
          ...form
        }
      };
      const response = await axios.post(`${url}/edit-info-store`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data?.success) {
        Notiflix.Notify.success('Réseaux sociaux mis à jour !');
        const total = Object.keys(form).length;
        const filled = Object.values(form).filter(v => (v || '').trim() !== '').length;
        setProfilCompletion(Math.round((filled / total) * 100));
      } else {
        Notiflix.Notify.failure(response.data?.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      Notiflix.Notify.failure('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="p-4 mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Réseaux sociaux</h1>
        <a
          href="#"
          className="mt-2 md:mt-0 inline-block px-4 py-2 text-base font-medium text-white bg-gray-400 rounded hover:bg-gray-800 transition"
        >
          Voir
        </a>
      </div>

      <h1 className="text-xl font-bold mb-2">Boutique</h1>
      <p className="border-t border-b border-gray-300 py-3 mb-5">
        <i>
          Les réseaux sociaux vous aident à gagner plus de public.
          Pensez à ajouter vos liens de réseaux sociaux pour une meilleure interaction avec l'utilisateur.
        </i>
      </p>

      <ProfileProgress
        percentage={profilCompletion}
        label={`Complétion des informations de Réseaux sociaux : ${profilCompletion}%`}
      />

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialMediaFields.map((field) => (
            <div key={field.key} className="bg-gray-100 p-3 rounded shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={field.icon} className="text-pink-600 mr-2" />
                {field.name}
              </label>
              <input
                type="url"
                placeholder="http://"
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          ))}
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="px-4 py-2 bg-[#f6858b] text-white rounded hover:bg-pink-700 transition"
          >
            Mettre à jour les paramètres
          </button>
        </div>
      </form>
    </div>
  );
}
