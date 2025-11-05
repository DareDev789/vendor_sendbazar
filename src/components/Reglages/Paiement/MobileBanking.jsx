import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Notiflix from 'notiflix';
import { url } from '../../../contextes/UrlContext';

export default function MobileBanking() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${url}/get-info-store`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const metaData = response.data.meta || {};
        setMeta(metaData);
        const bank = metaData?.dokan_profile_settings?.payment?.bank || {};
        setPhone(bank.mobile_banking || '');
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || phone.length < 8) {
      setMessage("Veuillez entrer un numéro de téléphone valide.");
      return;
    }

    if (!meta) return;

    try {
      const metaToSend = {
          payment: {
            // Conserver les autres moyens (paypalEmail, champs bank existants)
            ...((meta?.dokan_profile_settings && meta.dokan_profile_settings.payment) || {}),
            bank: {
              ...((meta?.dokan_profile_settings?.payment?.bank) || {}),
              mobile_banking: phone,
            },
          },
      };
      const response = await axios.post(
        `${url}/edit-info-store`,
        metaToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        Notiflix.Notify.success("Mobile Banking mis à jour avec succès !");
        setMessage(`✅ Mobile Banking mis à jour : ${phone}`);
      } else {
        Notiflix.Notify.failure(response.data.message || "Erreur lors de la mise à jour");
        setMessage(response.data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      Notiflix.Notify.failure("Erreur lors de la mise à jour");
      setMessage("Erreur lors de la mise à jour");
      
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">

          Paramètres de paiement personnalisés
        </h1>
        <Link
          to="/show-boutique"
          className="mt-2 md:mt-0 inline-block px-4 py-2 text-base font-medium text-white bg-gray-400 rounded hover:bg-gray-800 transition"
        >
          Voir la boutique
        </Link>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-red-500 hover:text-pink-600 transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Retour
      </button>
      <form onSubmit={handleSubmit} className="max-w-full mx-auto p-6 pr-10 bg-white rounded shadow">
        <label className="block text-gray-700 font-semibold text-lg mb-2">
          Mobile banking (OrangeMoney, MVola, AirtelMoney, ...) :
        </label>
        <PhoneInput
          country={'mg'}
          value={phone}
          onChange={setPhone}
          inputProps={{
            name: 'phone',
            required: true,
            autoFocus: true,
            className: 'w-full rounded-lg border border-gray-300 p-3 ml-8 focus:outline-none focus:ring-2 focus:ring-pink-500'
          }}
        />
        <button
          type="submit"
          className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Mettre à jour les paramètres
        </button>
        {message && (
          <p className={`mt-3 text-sm font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
