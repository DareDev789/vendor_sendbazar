import ProfileProgress from "../../../utils/ProfileProgress";
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import { faUniversity, faMobileAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../../contextes/UrlContext';

export default function IndexPaiement() {
  const [profilCompletion, setProfilCompletion] = useState(0);
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const options = [
    {
      value: 'paypal',
      label: 'Directement à PayPal',
      icon: faPaypal,
      url: '/reglages/paiement/parametre-paypal'
    },
    {
      value: 'virement',
      label: 'Directement à virement bancaire',
      icon: faUniversity,
      url: '/reglages/paiement/parametre-virement-bancaire'
    },
    {
      value: 'mobile',
      label: 'Directement à Mobile banking (OrangeMoney, Mvola, AirtelMoney...)',
      icon: faMobileAlt,
      url: '/reglages/paiement/parametre-mobile-banking'
    }
  ];

  // Charger et calculer la complétion de paiement depuis /get-info-store
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${url}/get-info-store`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const meta = data?.meta || {};
        const bank = meta?.dokan_profile_settings?.payment?.bank || {};
        const fields = [
          'ac_name','ac_type','ac_number','routing_number','bank_name','bank_addr','iban','swift','mobile_banking','paypalEmail'
        ];
        const total = fields.length;
        const filled = fields.map(k => (bank[k] ?? '')).filter(v => (v || '').toString().trim() !== '').length;
        setProfilCompletion(Math.round((filled / total) * 100));
      } catch (e) {
        setProfilCompletion(0);
      }
    };
    fetchData();
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    setOpen(false);
    navigate(option.url);
  };
  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Méthode de paiement</h1>
        <a href="#" className="mt-2 md:mt-0 inline-block px-4 py-2 text-base font-medium text-white bg-gray-400 rounded hover:bg-gray-800 transition">
          Voir boutique
        </a>
      </div>
      <p className="border-t border-b border-gray-300 py-3 mb-5">
        <i>
          Ce sont les méthodes disponibles pour vos retraits. Veuillez mettre à jour vos informations de paiement ci-dessous pour soumettre les demandes de retraits et obtenir vos paiements de façon transparente.
        </i>
      </p>

      <ProfileProgress 
        percentage={profilCompletion}
        label={`Complétion des informations de paiement : ${profilCompletion}%`} 
      />

      <div className="w-full relative mt-8 mb-4 bg-gray-50 rounded-xl p-4 shadow-md">
        <label className="block mb-2 text-xl font-bold text-gray-800">
          Méthode de paiement :
        </label>
        <div
          className="flex justify-between items-center p-3 border border-gray-300 rounded-lg bg-white hover:border-pink-400 transition duration-300 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <span className="flex items-center gap-3 text-gray-700 font-medium">
            {selected ? (
              <>
                <FontAwesomeIcon icon={selected.icon} className="text-pink-500 w-5 h-5" />
                {selected.label}
              </>
            ) : (
              '— Sélectionner une méthode de paiement —'
            )}
          </span>
          <FontAwesomeIcon icon={faChevronDown} className="text-gray-500 w-4 h-4" />
        </div>

        {open && (
          <ul className="absolute z-20 mt-2 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-200">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3 text-gray-700"
              >
                <FontAwesomeIcon icon={option.icon} className="text-pink-500 w-5 h-5" />
                {option.label}
              </li>
            ))}
          </ul>
        )}

        <p className="text-gray-600 italic mt-2">
          Il n'y a aucun moyen de paiement à afficher.
        </p>
      </div>
    </div>
  );
}
