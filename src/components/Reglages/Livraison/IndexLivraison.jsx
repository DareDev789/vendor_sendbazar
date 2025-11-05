import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { url } from '../../../contextes/UrlContext';

export default function IndexLivraison() {
  const [meta, setMeta] = useState(null);

  // Récupérer les données existantes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${url}/get-info-store`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const metaData = response.data.meta || {};
        setMeta(metaData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
        <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
            <h1 className="text-4xl font-bold text-gray-800">
              Paramètres de livraison
            </h1>
            <a href="#" className="inline-block px-4 py-2 mt-2 text-base font-medium text-white transition bg-gray-400 rounded md:mt-0 hover:bg-gray-800">
              Voir
            </a>
        </div>

        <a href="#" className="inline-block px-4 py-2 mt-2 mb-5 text-base font-medium text-white transition bg-gray-400 rounded md:mt-0 hover:bg-gray-800">
          <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-2" />
          Cliquez ici pour ajouter des politiques d'expédition
        </a>

        <h1 className="mb-2 text-xl font-bold">Boutique</h1>

        <div className="px-4 py-4 mb-5 border-t border-b border-gray-300 rounded-md bg-gray-50">
          <i className="block space-y-3 leading-relaxed text-gray-700">
            <p>
              Une zone d'expédition est une région géographique où un certain ensemble de méthodes d'expédition sont proposées. Nous associerons un client à une seule zone en utilisant son adresse de livraison et lui présenterons les méthodes d'expédition dans cette zone.
            </p>
            <p>
              Si vous souhaitez utiliser l'ancien système de livraison ,cliquez ici
            </p>
            <p>
              <a
                href="https://preprod.sendbazar.net/tableau-de-bord/settings/regular-shipping/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 underline hover:text-pink-800"
              >
                https://preprod.sendbazar.net/tableau-de-bord/settings/regular-shipping/
              </a>
            </p>
          </i>
        </div>
        <table className="w-full text-left border border-collapse border-gray-300 table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border border-gray-300">Nom de la zone</th>
              <th className="px-4 py-2 border border-gray-300">Région(s)</th>
              <th className="px-4 py-2 border border-gray-300">Méthode(s) d'expédition</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border border-gray-300" colSpan="3">Aucune zone d'expédition trouvée pour la configuration. Veuillez contacter l'administrateur pour gérer les paramètres d'expédition de votre boutique. </td>
            </tr>
          </tbody>
        </table>
    </div>
  );
}
