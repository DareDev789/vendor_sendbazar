import React, { useState, useEffect } from 'react';
import PopupCategorieComp from './PopupCategorieComp';
import { url } from '../contextes/UrlContext';

export default function GroupEditModalComp({ open, onClose, selectedProducts = [], onRemoveProduct }) {
  // --- Ajout logique catégorie ---
  const [categories, setCategories] = useState([]); // liste complète
  const [categorieSelected, setCategorieSelected] = useState([]); // ids sélectionnés (vide par défaut)
  const [showCategories, setShowCategories] = useState(false);
  const [catIdToChange, setCatIdToChange] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${url}/categories-produits`);
        if (!response.ok) throw new Error('Erreur API catégories');
        const data = await response.json();
        setCategories(data);
      } catch (e) {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  function getCategoryNameFromId(id) {
    for (let cat of categories) {
      if (String(cat.id) === String(id) || cat.name === id) return cat.name;
      if (cat.children && Array.isArray(cat.children)) {
        const child = cat.children.find(child => String(child.id) === String(id) || child.name === id);
        if (child) return `${cat.name} > ${child.name}`;
      }
    }
    return "Catégorie inconnue";
  }
  // --- Fin logique catégorie ---

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto relative text-sm">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
          aria-label="Fermer"
        >
          ×
        </button>
        {/* Popup catégorie en overlay */}
        {showCategories && (
          <PopupCategorieComp
            categorieSelected={categorieSelected}
            categories={categories}
            setCategorieSelected={setCategorieSelected}
            setShowPopup={setShowCategories}
            catIdToChange={catIdToChange}
            setCatIdToChange={setCatIdToChange}
            getCategoryNameFromId={getCategoryNameFromId}
          />
        )}
        {/* BULK EDIT + CATEGORIES */}
        <div className="flex flex-col gap-4 mb-6">
          {/* En-tête aligné */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <h2 className="font-semibold text-center">BULK EDIT</h2>
            <h2 className="font-semibold text-center">CATÉGORIES DES OEUVRES</h2>
          </div>
          {/* Bulk Edit Section + Catégories sélectionnées côte à côte */}
          <div className="w-full flex flex-col lg:flex-row gap-4">
            {/* Titres produits sélectionnés */}
            <div className="w-full lg:w-1/3 border p-3 rounded bg-gray-50 flex flex-col h-48">
              <div className="space-y-2 w-full max-h-40 overflow-y-auto pr-1">
                {selectedProducts.length === 0 && (
                  <div className="text-gray-400 italic text-sm">Aucun produit sélectionné</div>
                )}
                {selectedProducts.map(prod => (
                  <div key={prod.id} className="bg-white border px-4 py-2 rounded text-base flex items-center justify-between">
                    <span className="truncate">{prod.title}</span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                      onClick={() => onRemoveProduct(prod.id)}
                      title="Supprimer ce produit"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Catégories sélectionnées, prend toute la largeur restante */}
            <div className="flex-1 border p-3 rounded bg-gray-50 flex flex-col h-48">
              <div className="space-y-2 w-full max-h-40 overflow-y-auto pr-1">
                {categorieSelected.length === 0 && (
                  <div className="text-gray-400 italic text-sm">Aucune catégorie sélectionnée</div>
                )}
                {categorieSelected.map((catId, index) => (
                  <div key={index} className="cursor-pointer bg-gray-200 text-gray-800 px-3 py-1 text-sm relative flex items-center rounded">
                    <span onClick={() => { setCatIdToChange(catId); setShowCategories(true); }} className="truncate">{getCategoryNameFromId(catId)}</span>
                    <button
                      type="button"
                      onClick={() => setCategorieSelected(categorieSelected.filter(id => id !== catId))}
                      className="ml-2 text-red-500 hover:text-red-700 right-2 top-1 absolute focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => { setCatIdToChange(null); setShowCategories(true); }}
                  className="w-full lg:w-48 mt-2 flex text-sm items-center px-3 py-1 border rounded border-gray-300 cursor-pointer bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent select-none"
                >
                  Ajouter une catégorie <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Statut, Étiquettes, etc. */}
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="font-semibold text-sm mb-1 text-left">STATUT</label>
            <select className="border rounded px-2 py-1 w-full text-sm">
              <option>— No change —</option>
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-sm mb-1 text-left">ÉTIQUETTES DU PRODUIT</label>
            <input
              type="text"
              placeholder="Select tags"
              className="border rounded px-2 py-1 w-full text-sm"
            />
          </div>
        </div>
        {/* Données du produit */}
        <div className="mt-6">
          <h3 className="text-pink-500 font-bold text-lg mb-4 text-center">DONNÉES DU PRODUIT</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {[
              'Prix',
              'Vente',
              'Statut de la TVA',
              'Taux de TVA',
              'Poids',
              'L/L/H',
              'Classe de livraison',
              'Visibilité',
              'In stock?',
              'Gérer le stock ?',
              'Stock qty',
              'Les pré-commandes?',
              'Sold individually?'
            ].map((label) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="font-semibold text-xs">{label}</label>
                <select className="border rounded px-2 py-1 w-full text-sm">
                  <option>— No change —</option>
                </select>
              </div>
            ))}
          </div>
        </div>
        {/* Boutons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
          <button className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 w-full sm:w-auto" onClick={onClose}>Annuler</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto">Mettre à jour</button>
        </div>
      </div>
    </div>
  );
}
