import { useEffect, useState } from "react";
import Add from "../../components/Products/AddProduct/AddProduct";
import AddNewLocalisation from "./AddNewLocalisation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default function MultiLocalisation({
  autresLocalisations = [],
  onChange,
}) {
  const [localisations, setLocalisations] = useState(autresLocalisations);

  useEffect(() => {
    setLocalisations(autresLocalisations);
  }, [autresLocalisations]);

  // 🔹 Ajouter une nouvelle localisation vide
  const ajouterLocalisation = () => {
    const nouvelle = {
      dokan_geo_address: "",
      dokan_geo_latitude: "",
      dokan_geo_longitude: "",
    };
    const updated = [...localisations, nouvelle];
    setLocalisations(updated);
    onChange?.(updated);
  };

  const modifierLocalisation = (index, field, value) => {
    const updated = [...localisations];
    updated[index][field] = value;
    setLocalisations(updated);
    onChange?.(updated);
  };

  // 🔹 Supprimer une localisation
  const supprimerLocalisation = (index) => {
    const updated = localisations.filter((_, i) => i !== index);
    setLocalisations(updated);
    onChange?.(updated);
  };

  return (
    <div className="overflow-auto p-2 bg-white rounded-2xl shadow-sm w-full flex gap-2 items-center">
      {localisations.map((loc, index) => (
        <div
          key={index}
          className="rounded-xl p-2 mb-3 bg-white shadow-sm min-w-96 max-w-full relative"
        >
          <AddNewLocalisation
            modifierLocalisation={modifierLocalisation}
            supprimerLocalisation={supprimerLocalisation}
            index={index}
            loc={loc}
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              supprimerLocalisation(index);
            }}
            className="mt-3 hover:underline absolute top-0 right-2 flex items-center z-[2000] bg-red-700/50 hover:bg-red-800 text-white rounded-full p-2 text-center text-xs"
          >
            <FontAwesomeIcon icon={faTrash} className="" />
          </button>
        </div>
      ))}

      {autresLocalisations && (
        <div
          onClick={(e) => {
            e.preventDefault();
            ajouterLocalisation();
          }}
          className="border-2 border-dashed border-gray-300 rounded-lg h-64 md:h-72 w-64  flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition"
        >
          <svg
            className="h-7 min-w-72 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="mt-2 text-gray-600">+ Ajouter une localisation</span>
        </div>
      )}
    </div>
  );
}
