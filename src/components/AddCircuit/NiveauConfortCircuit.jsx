import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { useDevise } from "../../contextes/DeviseContext";

const niveauxConfig = [
  { key: "basic", label: "🟢 Basic", desc: "Formule économique avec services essentiels", color: "green" },
  { key: "confort", label: "🔵 Confort", desc: "Formule intermédiaire avec services améliorés", color: "blue" },
  { key: "premium", label: "🟣 Premium", desc: "Formule haut de gamme avec services exclusifs", color: "purple" }
];

export default function NiveauConfortCircuit({ register, watch,errors }) {
  const { devise, listDevise } = useDevise();
  return (
    <div className="my-6">
      <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <span className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full">
            <FontAwesomeIcon icon={faStar} className="mr-3" />
            Formules de confort
            <span className="text-base font-normal text-gray-600 ml-2 self-center">
              (Sélectionner les formules disponibles et renseigner les prix)
            </span>
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {niveauxConfig.map(({ key, label, desc, color }) => {
            const isSelected = watch(`_circuit_niveau_${key}`);
            return (
              <div key={key} className={`p-4 border border-gray-200 rounded-lg ${isSelected ? `bg-${color}-50 border-${color}-300` : "hover:bg-gray-50"}`}>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    {...register(`_circuit_niveau_${key}`)}
                    className={`form-checkbox h-5 w-5 text-${color}-600 mt-1`}
                  />
                  <div>
                    <label className="text-lg font-semibold text-gray-800 cursor-pointer">
                      {label}
                    </label>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix {label} ({listDevise[devise]}) / Personne
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      {...register(`_circuit_prix_${key}`, {
                        required: isSelected ? `Le prix ${label} est requis` : false,
                        min: { value: 0, message: "Le prix doit être positif" }
                      })}
                      className="w-full p-2 border rounded border-gray-300"
                    />
                    {isSelected && (
                      <span className="text-red-500 text-xs">
                        {errors && errors[`_circuit_prix_${key}`]?.message}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
