import React, { useState, useEffect } from 'react';

export default function DeleteShopModal({ open, onClose, onConfirm }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  if (!open) return null;

  const canConfirm = typed.trim().toUpperCase() === 'DELETE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Supprimer définitivement la boutique</h2>
        <p className="text-sm text-gray-700 mb-3">
          Cette action est <b>IRRÉVERSIBLE</b>. Elle entraînera la suppression:
        </p>
        <ul className="list-disc pl-6 text-sm text-gray-700 mb-3">
          <li>De tous vos produits</li>
          <li>Des images associées et configurations</li>
          <li>Votre compte aussi</li>
        </ul>
        <p className="text-sm text-gray-700 mb-4">
          Pour confirmer, tapez <span className="font-mono font-bold">DELETE</span> ci-dessous.
        </p>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Tapez DELETE pour confirmer"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => canConfirm && onConfirm()}
            className={`px-4 py-2 rounded text-white ${canConfirm ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
          >
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>
  );
}
