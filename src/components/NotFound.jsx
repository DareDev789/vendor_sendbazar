import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="relative w-full max-w-2xl mx-auto text-center bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-purple-100 p-8 md:p-12">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#6C2483] text-white grid place-items-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM10.28 8.97a.75.75 0 1 0-1.06 1.06l1.69 1.69-1.69 1.69a.75.75 0 1 0 1.06 1.06l1.69-1.69 1.69 1.69a.75.75 0 1 0 1.06-1.06l-1.69-1.69 1.69-1.69a.75.75 0 1 0-1.06-1.06L12 10.69l-1.72-1.72Z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="mt-2 text-6xl md:text-7xl font-extrabold tracking-tight text-[#6C2483]">404</h1>
        <p className="mt-3 text-lg md:text-xl text-gray-700">Oups, cette page est introuvable.</p>
        <p className="mt-1 text-sm text-gray-500">Elle a peut-être été déplacée, renommée ou n’existe plus.</p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/tableau-de-bord"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#6C2483] text-white font-medium shadow hover:bg-[#5a1f6c] focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            Retour au tableau de bord
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#6C2483] text-[#6C2483] font-medium hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            Revenir à la page précédente
          </button>
        </div>

        <div className="mt-8 select-none">
          <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" className="w-full text-purple-200">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="100%" stopColor="#fecdd3" />
              </linearGradient>
            </defs>
            <path d="M0,80 C80,20 160,120 240,60 C300,20 340,50 400,30 L400,120 L0,120 Z" fill="url(#g)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

