import { faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

export default function OptionsPromotionsComp({ register, errors, watch }) {
  const [isOpen, setIsOpen] = useState(false);

  const allowBulkDiscount = watch('allow_bulk_discount', false);

  return (
    <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
      {/* Titre cliquable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
      >
        <span><FontAwesomeIcon icon={faTags} className="mr-3" /> Options des promotions</span>
        <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <>

          {/* ✅ Checkbox pour activer la remise sur quantité */}
          <div className="mt-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('allow_bulk_discount')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Permettre des remises sur des grandes quantités</span>
            </label>
          </div>

          {/* ✅ Champs conditionnels */}
          {allowBulkDiscount && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Quantité minimale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité minimale
                </label>
                <input
                  type="number"
                  placeholder="Ex : 50"
                  min="1"
                  {...register('bulk_min_quantity')}
                  className={`w-full p-2 border rounded ${errors.bulk_min_quantity ? 'border-red-500' : 'border-gray-300'}`}
                  defaultValue={0}
                />
                {errors.bulk_min_quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.bulk_min_quantity.message}</p>
                )}
              </div>

              {/* Remise sur quantité (%) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remise %
                </label>
                <div className="flex w-full">
                    <input
                    type="number"
                    placeholder="Pourcentage"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register('bulk_discount_percentage')}
                    className={`flex-1 p-2 border rounded-l ${errors.bulk_discount_percentage ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r text-gray-700 text-sm">
                    %
                    </span>
                </div>
                {errors.bulk_discount_percentage && (
                    <p className="text-red-500 text-xs mt-1">{errors.bulk_discount_percentage.message}</p>
                )}
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
