import React from 'react';
import { useNavigate } from 'react-router-dom';
import { url_frontend } from '../../contextes/UrlContext';

const SetupVendorPret = ({ onBack, onFinish }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white w-full max-w-3xl p-8 shadow rounded-md text-center mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414L8.5 11.086l6.793-6.793a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-6">Votre espace de vente est prêt!</h2>
      <button
        onClick={() => navigate('/tableau-de-bord')}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-semibold mb-4"
      >
        Aller au tableau de bord !
      </button>
      <div>
        <button
          onClick={() => window.location.href = url_frontend}
          className="text-blue-600 hover:underline text-sm"
        >
          Retour sur l’espace de vente
        </button>
      </div>
    </div>
  );
};

export default SetupVendorPret;
