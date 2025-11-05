import React, { useState } from 'react';
import Apercu from "./Apercu";
import VenteParJour from "./VenteParJour";
import TopVentes from "./TopVentes";
import TopDesGains from "./TopDesGains";
import Resume from "./Resume";

export default function IndexRapports() {
  const [ongletActif, setOngletActif] = useState("apercu");

  const onglets = [
    { key: 'apercu', label: 'Aperçu' },
    { key: 'ventesParJour', label: 'Ventes par jour' },
    { key: 'topVentes', label: 'Top ventes' },
    { key: 'topDesGains', label: 'Top des gains' },
    { key: 'resume', label: 'Résumé' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Rapports</h1>

      <div className="overflow-x-auto mb-4">
        <div className="flex flex-nowrap gap-2 border-b pb-2 mb-4 w-max sm:w-full">
          {onglets.map(({ label, key }) => (
            <button
              key={key}
              className={`whitespace-nowrap px-4 py-2 rounded-t font-semibold transition-colors ${
                ongletActif === key
                  ? 'bg-[#f6858b] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => setOngletActif(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {ongletActif === 'apercu' && <Apercu />}
        {ongletActif === 'ventesParJour' && <VenteParJour />}
        {ongletActif === 'topVentes' && <TopVentes />}
        {ongletActif === 'topDesGains' && <TopDesGains />}
        {ongletActif === 'resume' && <Resume />}
      </div>
    </div>
  );
}
