import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TableauActionGroup from "../../utils/TableauActionGroup";

const dataAvis = {
  'Approuvée': [
    { id: 1, auteur: "Alice", contenu: "Très bon produit.", lieA: "Produit A", evaluation: 5 },
    { id: 2, auteur: "Bob", contenu: "Satisfait du service.", lieA: "Service B", evaluation: 2 },
  ],
  'En cours de vérification': [
    { id: 3, auteur: "Charlie", contenu: "Avis en attente de validation.", lieA: "Produit C", evaluation: 3 },
  ],
  'Spam': [
    { id: 4, auteur: "SpamBot", contenu: "Cliquez ici pour gagner!", lieA: "-", evaluation: 1 },
  ],
  'Corbeille': [],
};

function Etoiles({ count }) {
  const max = 5;
  return (
    <span aria-label={`${count} étoiles`} role="img">
      {Array.from({ length: max }, (_, i) => i < count ? "⭐" : "☆").join('')}
    </span>
  );
}

function normaliserOnglet(name) {
  if (!name) return "";

  const n = name.toLowerCase().replace(/-/g, '').replace(/\s/g, '');

  if (['encoursdeverification', 'encoursverification'].includes(n)) return 'En cours de vérification';
  if (n === 'indesirable' || n === 'spam') return 'Spam';
  if (n === 'corbeille') return 'Corbeille';
  if (n === 'approuvee' || n === 'approuvée') return 'Approuvée';

  return "";
}

export default function IndexAvis() {
  const { name } = useParams();
  const ongletFromParam = normaliserOnglet(name);

  const ongletInitial = Object.keys(dataAvis).includes(ongletFromParam)
    ? ongletFromParam
    : 'Approuvée';

  const [ongletActif, setOngletActif] = useState(ongletInitial);

  useEffect(() => {
    if (ongletFromParam && ongletFromParam !== ongletActif && Object.keys(dataAvis).includes(ongletFromParam)) {
      setOngletActif(ongletFromParam);
    }
  }, [name, ongletFromParam, ongletActif]);

  const avis = dataAvis[ongletActif] || [];

  const colonnes = [
    { key: "auteur", label: "Auteur" },
    { key: "contenu", label: "Commentaire" },
    { key: "lieA", label: "Lier à", render: (item) => <a href="#" className="text-pink-600 hover:underline">{item.lieA}</a> },
    { key: "evaluation", label: "Évaluation", render: (item) => <Etoiles count={item.evaluation} /> },
  ];

  const actionOptions = [
    { value: "attente", label: "Marquer En Attente" },
    { value: "spam", label: "Marquer Spam" },
    { value: "corbeille", label: "Marquer Corbeille" },
  ];

  const appliquerAction = (action, ids) => {
    
    // Ici la logique d'application (API, état global...)
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Avis - {ongletActif}</h1>

      <div className="overflow-x-auto mb-4">
        <div className="flex flex-nowrap gap-2 border-b pb-2 mb-4 w-max sm:w-full">
          {Object.keys(dataAvis).map((key) => (
            <button
              key={key}
              className={`whitespace-nowrap px-4 py-2 rounded-t font-semibold transition-colors ${
                ongletActif === key
                  ? 'bg-[#f6858b] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => setOngletActif(key)}
            >
              {key} ({dataAvis[key].length})
            </button>
          ))}
        </div>
      </div>

      <TableauActionGroup
        colonnes={colonnes}
        donnees={avis}
        actionOptions={actionOptions}
        onApplyAction={appliquerAction}
      />
    </div>
  );
}
