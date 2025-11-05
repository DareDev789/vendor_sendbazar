import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Notiflix from 'notiflix';
import { url } from '../../../contextes/UrlContext';

export default function Paypal() {
    const [paypalEmail, setPaypalEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState(null);
    const navigate = useNavigate();

    // Récupérer les données existantes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${url}/get-info-store`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
        const metaData = response.data.meta || {};
                setMeta(metaData);
                const bank = metaData?.dokan_profile_settings?.payment?.bank || {};
                setPaypalEmail(bank.paypalEmail || '');
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!paypalEmail || !paypalEmail.includes('@')) {
            setMessage("Veuillez entrer une adresse e-mail valide.");
            return;
        }
        try {
            const metaToSend = {
                payment: {
                    // Conserver les autres moyens et champs bank existants
                    ...((meta?.dokan_profile_settings && meta.dokan_profile_settings.payment) || {}),
                    bank: {
                        ...((meta?.dokan_profile_settings?.payment?.bank) || {}),
                        paypalEmail: paypalEmail,
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
                Notiflix.Notify.success("Les paramètres PayPal ont été mis à jour !");
                setMessage("Les paramètres PayPal ont été mis à jour !");
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
                    <FontAwesomeIcon icon={faPaypal} className="text-pink-500 w-8 h-8" />
                    Paramètres PayPal
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
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md w-full"
            >
                <label className="block text-gray-700 font-semibold text-lg mb-2">
                    PayPal :
                </label>
                <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                />
                <button
                    type="submit"
                    className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded transition"
                >
                    Mettre à jour les paramètres
                </button>

                {message && (
                    <p className={`mt-3 text-sm font-medium ${message.includes('mis à jour') ? 'text-green-600' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}