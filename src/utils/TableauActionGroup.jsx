import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, calculatePricetoNewDevise } from "./formatPrice";

export default function TableauActionGroup({
  colonnes,
  donnees,
  actionOptions,
  onApplyAction,
  idKey = "id",
  extraRender,
  hideActions = false,
  onSelectedIdsChange,
  getRowClassName,
  devise,
  listDevise,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [action, setAction] = useState("");  

  useEffect(() => {
    if (typeof onSelectedIdsChange === "function") {
      onSelectedIdsChange(Array.from(selectedIds));
    }
  }, [selectedIds, onSelectedIdsChange]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === donnees.length
        ? new Set()
        : new Set(donnees.map((d) => d[idKey]))
    );
  };
  const appliquerAction = () => {
    if (!action) return alert("Veuillez choisir une action.");
    if (selectedIds.size === 0)
      return alert("Veuillez sélectionner au moins un élément.");
    onApplyAction(action, Array.from(selectedIds));
    setSelectedIds(new Set());
    setAction("");
  };
  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-4 overflow-x-auto">
      {/* Actions groupées */}
      {!hideActions &&
        Array.isArray(actionOptions) &&
        actionOptions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <select
              className="border rounded px-3 py-2 w-full sm:w-auto"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="">Actions groupées</option>
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={appliquerAction}
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto"
            >
              Appliquer
            </button>
          </div>
        )}
      {/* Table */}
      {donnees.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 italic text-center text-lg py-6"
        >
          Aucun résultat trouvé.
        </motion.p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1024px] table-auto text-sm text-left text-gray-700 border rounded-xl overflow-hidden">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 uppercase font-semibold">
              <tr>
                <th className="p-3 w-10 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === donnees.length && donnees.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                {colonnes.map(({ key, label, thClassName }) => (
                  <th
                    key={key}
                    className={`p-3 whitespace-nowrap ${thClassName || ""}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <AnimatePresence>
              <tbody>
                {donnees.map((item) => (
                  <motion.tr
                    key={item[idKey]}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`border-b transition-colors ${
                      typeof getRowClassName === "function"
                        ? getRowClassName(item)
                        : ""
                    }`}
                  >
                    <td className="p-3 w-10 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item[idKey])}
                        onChange={() => toggleSelect(item[idKey])}
                      />
                    </td>

                    {colonnes.map(({ key, render, tdClassName }) => {
                      let valeur = render ? render(item) : item[key];

                      if (['total', 'revenus'].includes(key) && valeur) {
                        const montantConverti = calculatePricetoNewDevise(valeur, 'EUR', devise);
                        valeur = formatPrice(montantConverti, listDevise[devise]);
                      }

                      return (
                        <td
                          key={key}
                          className={`p-3 whitespace-nowrap ${
                            tdClassName || ""
                          }`}
                        >
                          {valeur}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </AnimatePresence>
          </table>
        </div>
      )}
      {/* Extra content */}
      {extraRender && (
        <div className="mt-4">
          {typeof extraRender === "function" ? extraRender() : extraRender}
        </div>
      )}
    </div>
  );
}
