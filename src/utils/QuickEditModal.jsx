import React, { useState, useEffect } from 'react';
import PopupCategorieComp from './PopupCategorieComp';
import { url } from '../contextes/UrlContext';
import { faAngleRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function QuickEditModal({ open, onClose, product }) {
  const [categories, setCategories] = useState([]); // ids sélectionnés
  const [categoriesList, setCategoriesList] = useState([]); // liste complète
  const [showCategories, setShowCategories] = useState(false);
  const [catIdToChange, setCatIdToChange] = useState(null);
  // Ajout des états pour poids et dimensions
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  // Charger les catégories depuis l'API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${url}/categories-produits`);
        if (!response.ok) throw new Error('Erreur API catégories');
        const data = await response.json();
        setCategoriesList(data);
      } catch (e) {
        setCategoriesList([]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (open && product) {
      setWeight(product.weight ?? product.meta?._weight ?? '');
      setLength(product.length ?? product.meta?._length ?? '');
      setWidth(product.width ?? product.meta?._width ?? '');
      setHeight(product.height ?? product.meta?._height ?? '');
      const ids = product.categories.map(cat =>
        typeof cat === 'object'
          ? (cat.term_id !== undefined ? String(cat.term_id) : (cat.id !== undefined ? String(cat.id) : String(cat)))
          : String(cat)
      );
      setCategories(ids);
      setTimeout(() => {
      }, 100);
    }
  }, [open, product]);

  // Trouver le nom d'une catégorie ou sous-catégorie à partir de son id
  function getCategoryNameFromId(id) {
    for (let cat of categoriesList) {
      if (String(cat.id) === String(id) || cat.name === id) return cat.name;
      if (cat.children && Array.isArray(cat.children)) {
        const child = cat.children.find(child => String(child.id) === String(id) || child.name === id);
        if (child) return `${cat.name} > ${child.name}`;
      }
    }
    return "Catégorie inconnue";
  }

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-4xl relative text-sm">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
          aria-label="Fermer"
        >
          ×
        </button>

        {/* Popup catégorie */}
        {showCategories && (
          <PopupCategorieComp
            categorieSelected={categories}
            categories={categoriesList}
            setCategorieSelected={setCategories}
            setShowPopup={setShowCategories}
            catIdToChange={catIdToChange}
            setCatIdToChange={setCatIdToChange}
            getCategoryNameFromId={getCategoryNameFromId}
          />
        )}

        {/* Contenu en deux colonnes */}
        <div className="grid grid-cols-2 gap-6">
          {/* Colonne 1 : Titre & Catégorie */}
          <div>
            <h3 className="font-semibold mb-2">MODIFICATION RAPIDE</h3>

            <label className="block mb-1">Titre</label>
            <input
              type="text"
              defaultValue={product?.title || ''}
              className="w-full border p-1 rounded mb-3"
            />
            <div className="mt-4 flex flex-col gap-2">
              <label className="block mb-1">Catégorie</label>
              {categories.length > 0 ? (
                <div>
                  {categories.map((catId, index) => (
                    <div key={index} className="cursor-pointer bg-gray-200 text-gray-800 px-3 my-1 py-1 text-sm relative flex items-center rounded">
                      <span onClick={() => { setCatIdToChange(catId); setShowCategories(true); }}>{getCategoryNameFromId(catId)}</span>
                      <button
                        type="button"
                        onClick={() => setCategories(categories.filter(id => id !== catId))}
                        className="ml-2 text-red-500 hover:text-red-700 right-2 top-1 absolute focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => { setCatIdToChange(null); setShowCategories(true); }}
                    className="w-48 mt-2 flex text-sm items-center px-3 py-1 border rounded border-gray-300 cursor-pointer bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f6858b] focus:border-transparent select-none"
                  >
                    Ajouter une catégorie <FontAwesomeIcon icon={faAngleRight} className="ml-2 mt-1" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => { setCatIdToChange(null); setShowCategories(true); }}
                  className="w-full flex text-sm items-center px-3 py-1 border rounded border-gray-300 cursor-pointer bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f6858b] focus:border-transparent select-none"
                >Choisir une catégorie  <FontAwesomeIcon icon={faAngleRight} className="ml-2" /></div>
              )}
            </div>
          </div>
          <div>
            <label className="block mb-1">Étiquettes du produit</label>
            <input
              type="text"
              placeholder="Select tags"
              className="w-full border p-1 rounded mb-3"
            />
            <div className="flex items-center mb-2">
              <input type="checkbox" defaultChecked className="mr-2" />
              <label>Activer les avis</label>
            </div>

            <label className="block mb-1">Statut</label>
            <select className="w-full border p-1 rounded mb-3">
              <option>Brouillon</option>
              <option>Publié</option>
            </select>

            <h3 className="font-semibold mb-2">DONNÉES DU PRODUIT</h3>

            <label className="block mb-1">UGS</label>
            <input
              type="text"
              defaultValue={product?.ugs || ''}
              className="w-full border p-1 rounded mb-2"
            />

            <label className="block mb-1">Poids</label>
            <input
              type="number"
              step="0.01"
              className="w-full border p-1 rounded mb-2"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="Poids en kg"
            />

            <label className="block mb-1">L/L/H</label>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                step="0.1"
                placeholder="Longueur"
                className="w-1/3 border p-1 rounded"
                value={length}
                onChange={e => setLength(e.target.value)}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Largeur"
                className="w-1/3 border p-1 rounded"
                value={width}
                onChange={e => setWidth(e.target.value)}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Hauteur"
                className="w-1/3 border p-1 rounded"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            </div>
            <label className="block mb-1">Visibilité</label>
            <select className="w-full border p-1 rounded">
              <option>Visible</option>
              <option>Masqué</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="border px-4 py-1 rounded">
            Annuler
          </button>
          <button className="bg-blue-500 text-white px-4 py-1 rounded">
            Mettre à jour
          </button>
        </div>
      </div>
    </div>
  );
}
