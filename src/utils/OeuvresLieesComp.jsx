import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

export default function OeuvresLieesComp({ register, errors }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
      {/* Titre cliquable */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
        >
          <span className="flex items-center">
            <FontAwesomeIcon icon={faLink} className="mr-3" />
            Œuvres liées
            <span className="text-base font-normal text-gray-600 ml-2">
              Définissez vos produits liés pour les ventes croisées et les ventes incitatives
            </span>
          </span>
          <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
        </button>
      </div>
      {/* Contenu repliable */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ventes incitatives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ventes incitatives
            </label>
            <input
              type="text"
              placeholder="Recherche d'oeuvres ..."
              {...register('upsell_works')}
              className={`w-full p-2 border rounded ${errors.upsell_works ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.upsell_works && (
              <p className="text-red-500 text-xs mt-1">{errors.upsell_works.message}</p>
            )}
          </div>

          {/* Ventes croisées */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ventes croisées
            </label>
            <input
              type="text"
              placeholder="Recherche d'oeuvres ..."
              {...register('crosssell_works')}
              className={`w-full p-2 border rounded ${errors.crosssell_works ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.crosssell_works && (
              <p className="text-red-500 text-xs mt-1">{errors.crosssell_works.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
