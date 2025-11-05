import { faUndo, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

export default function OptionRetourMarchandiseComp({ register, errors, watch, setValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const overrideRma = watch('override_rma', false);
  const rmaType = watch('rma_type', '');
  const [guarantees, setGuarantees] = useState([
    { cost: '', duration: '', unit: 'mois' },
    { cost: '', duration: '', unit: 'mois' },
  ]);

  const handleAddRow = () => {
    setGuarantees([...guarantees, { cost: '', duration: '', unit: 'mois' }]);
  };

  const handleRemoveRow = (index) => {
    const newRows = guarantees.filter((_, i) => i !== index);
    setGuarantees(newRows);
  };

  const handleChange = (index, field, value) => {
    const updated = guarantees.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setGuarantees(updated);
    setValue('rma_complementary_guarantees', updated);
  };

  return (
    <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
      {/* Titre cliquable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
      >
        <span>
          <FontAwesomeIcon icon={faUndo} className="mr-3" />
          Option d'autorisation de retour
        </span>
        <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <>
          {/* Checkbox */}
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                {...register('override_rma')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Remplacez vos paramètres RMA par défaut pour ce produit
              </span>
            </label>
          </div>

          {/* Champs conditionnels */}
          {overrideRma && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Étiquette */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Étiquette
                </label>
                <input
                  type="text"
                  placeholder="Étiquette"
                  {...register('rma_label')}
                  className={`w-full p-2 border rounded ${errors.rma_label ? 'border-red-500' : 'border-gray-300'}`}
                  defaultValue="Garantie"
                />
                {errors.rma_label && (
                  <p className="text-red-500 text-xs mt-1">{errors.rma_label.message}</p>
                )}
              </div>

              {/* Type de garantie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  {...register('rma_type')}
                  className={`w-full p-2 border rounded ${errors.rma_type ? 'border-red-500' : 'border-gray-300'}`}
                  defaultValue=""
                >
                  <option value="">-- Sélectionnez --</option>
                  <option value="aucune">Aucune garantie</option>
                  <option value="incluse">Garantie incluse</option>
                  <option value="complement">Garantie en complément</option>
                </select>
                {errors.rma_type && (
                  <p className="text-red-500 text-xs mt-1">{errors.rma_type.message}</p>
                )}
              </div>

              {/* Longueur si "incluse" */}
              {rmaType === 'incluse' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longueur</label>
                  <select
                    {...register('rma_duration')}
                    className={`w-full p-2 border rounded ${errors.rma_duration ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">-- Sélectionnez la durée --</option>
                    <option value="limite">Limitée</option>
                    <option value="vie">À vie</option>
                  </select>
                  {errors.rma_duration && (
                    <p className="text-red-500 text-xs mt-1">{errors.rma_duration.message}</p>
                  )}
                </div>
              )}

              {/* Tableau si "complement" */}
              {rmaType === 'complement' && (
                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ajout des paramètres de garantie
                  </label>
                  <div className="overflow-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Coût (€)</th>
                          <th className="p-2 text-left">Durée</th>
                          <th className="p-2 text-left">Unité</th>
                          <th className="p-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guarantees.map((row, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">
                              <input
                                type="number"
                                value={row.cost}
                                onChange={(e) => handleChange(index, 'cost', e.target.value)}
                                className="w-full p-1 border rounded"
                                placeholder="€"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={row.duration}
                                onChange={(e) => handleChange(index, 'duration', e.target.value)}
                                className="w-full p-1 border rounded"
                                placeholder="Durée"
                                min="1"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={row.unit}
                                onChange={(e) => handleChange(index, 'unit', e.target.value)}
                                className="w-full p-1 border rounded"
                              >
                                <option value="jours">Journées</option>
                                <option value="semaines">Semaines</option>
                                <option value="mois">Mois</option>
                                <option value="annees">Année</option>
                              </select>
                            </td>
                            <td className="p-2 text-right space-x-2">
                              <button type="button" onClick={handleAddRow} className="text-green-600 hover:text-green-800">
                                <FontAwesomeIcon icon={faPlus} />
                              </button>
                              {guarantees.length > 1 && (
                                <button type="button" onClick={() => handleRemoveRow(index)} className="text-red-600 hover:text-red-800">
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
