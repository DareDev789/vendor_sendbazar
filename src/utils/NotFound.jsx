import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center text-pink-500 bg-white">
      <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] mb-2">Page non trouvée</h2>
      <p className="text-[clamp(1rem,2.5vw,1.25rem)] mb-6">
        La page que vous recherchez n’existe pas.
      </p>
      <Link
        to="/tableau-de-bord"
        className="px-6 py-3 text-[clamp(1rem,2.5vw,1.2rem)] font-bold rounded-lg bg-pink-500 text-white shadow-lg hover:bg-pink-600 transition-colors duration-300"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
