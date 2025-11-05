import { faTruckFast } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { url } from '../contextes/UrlContext';
import axios from 'axios';

export default function LivraisonEtTva({ register, errors, watch, isVirtuel, setValue }) {
  const [isOpen, setIsOpen] = useState(true);
  const tvaEnabled = watch('enable_tva');
  const [AllShippingClass, setAllShippingClass] = useState([]);

  const getAllShippingClass = async () => {
    try {
      const response = await axios.get(`${url}/getall-shipping-class`);
      setAllShippingClass(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  useEffect(() => {
    getAllShippingClass();
  }, []);


  const resetDimensions = () => {
    setValue('weight', '');
    setValue('length', '');
    setValue('width', '');
    setValue('height', '');
  };

  useEffect(() => {
    if (!tvaEnabled) {
      resetDimensions();
    }
  }, [tvaEnabled]);

  return (
    <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
        >
          <span className="flex items-center">
            <FontAwesomeIcon icon={faTruckFast} className="mr-3" />
            {isVirtuel === 'yes' ? 'TVA' : 'Livraison et TVA'}
            <span className="text-base font-normal text-gray-600 ml-2">
              {isVirtuel === 'yes' ? 'Gérer les taxes pour ce produit' : 'Définir les options de livraison et de TVA pour cette œuvre'}
            </span>
          </span>
          <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
        </button>
      </div>
      {isOpen && (
        <>
          {isVirtuel === 'no' && (
            <>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    {...register('enable_tva')}
                    className="mr-2"
                  />
                  Cette œuvre doit être livrée
                </label>
              </div>
              {tvaEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['Poids (kg)', 'Longueur (cm)', 'Largeur (cm)', 'Hauteur (cm)'].map((label, index) => {
                      const name = ['weight', 'length', 'width', 'height'][index];
                      return (
                        <div key={name}>
                          <input
                            type="number"
                            step="any"
                            placeholder={label}
                            {...register(name, {
                              required: `${label} est requis`,
                              min: { value: 0, message: `${label} ne peut pas être négatif` }
                            })}
                            className={`w-full p-2 border rounded ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {errors[name] && (
                            <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="delivery_class" className="block text-sm font-medium text-gray-700 mb-2">
                      Classe de livraison
                    </label>
                    <select
                      id="delivery_class"
                      {...register('delivery_class')}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue=""
                    >
                      <option value="">Aucune classe d'expédition (€0)</option>
                      {AllShippingClass?.map((allShippingClas, index) => (
                        <option key={index} value={allShippingClas.term_taxonomy_id}>
                          {allShippingClas.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-sm mt-2">
                    Les classes d'expédition sont utilisées par certaines méthodes d'expédition pour regrouper des produits similaires.
                    Avant d'ajouter un produit, veuillez configurer <a href="#" className="text-red-600 hover:underline">les paramètres d'expédition</a>.
                  </p>
                </>
              )}
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label htmlFor="etat_tva" className="block text-sm font-medium text-gray-700 mb-2">
                État de la TVA
              </label>
              <select
                id="etat_tva"
                {...register('etat_tva')}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choisir --</option>
                <option value="taxable">Taxable</option>
                <option value="livraison">Livraison seulement</option>
                <option value="none">Aucune</option>
              </select>
            </div>

            <div>
              <label htmlFor="taux_tva" className="block text-sm font-medium text-gray-700 mb-2">
                Taux de TVA
              </label>
              <select
                id="taux_tva"
                {...register('taux_tva')}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Standard</option>
                <option value="taux-reduit">Taux réduit</option>
                <option value="taux-zero">Taux zéro</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}