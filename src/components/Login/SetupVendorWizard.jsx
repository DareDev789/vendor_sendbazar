import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SetupVendorBoutique from './SetupVendorBoutique';
import SetupVendorPaiement from './SetupVendorPaiement';
import SetupVendorPret from './SetupVendorPret';
import axios from 'axios';
import nProgress from 'nprogress';
import Notiflix from 'notiflix';

const SetupVendorWizard = () => {
  const [currentStep, setCurrentStep] = useState('welcome'); // 'welcome', 'boutique', 'paiement', 'pret'
  const navigate = useNavigate();
  // Je retire les states boutiqueData, paiementData, handleBoutiqueNext, handlePaiementNext, handleFinish, loading, et tout ce qui concerne la centralisation ou l'envoi des données.
  // Je garde uniquement la navigation entre les étapes.

  const renderStepContent = () => {
    switch (currentStep) {
      case 'boutique':
        return <SetupVendorBoutique onNext={() => setCurrentStep('paiement')} onBack={() => setCurrentStep('welcome')} />;
      case 'paiement':
        return <SetupVendorPaiement onNext={() => setCurrentStep('pret')} onBack={() => setCurrentStep('boutique')} />;
      case 'pret':
        return <SetupVendorPret />;
      default:
        return (
          <div className="bg-white w-full max-w-3xl p-8 shadow rounded-b-md text-center">
            <h2 className="text-xl font-semibold mb-4">Bienvenue sur votre espace de vente !</h2>

            <p className="mb-4 text-gray-700">
              Thank you for choosing The Marketplace to power your online store! This quick setup wizard will help you configure the basic settings.
              <strong> It's completely optional and shouldn't take longer than two minutes.</strong>
            </p>
            <p className="mb-6 text-gray-600">
              Pas le temps pour le moment ? Si vous ne voulez pas accéder à l'assistant de configuration,
              vous pouvez passer cette étape et revenir ensuite.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentStep('boutique')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold"
              >
                C'est parti !
              </button>
              <button
                onClick={() => navigate('/tableau-de-bord')}
                className="border border-gray-400 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-100"
              >
                Pas maintenant
              </button>
            </div>
          </div>
        );
    }
  };
  const getStepStatus = (step) => {
    if (currentStep === 'welcome') {
      return step === 'boutique' ? 'current' : 'inactive';
    }
    const stepOrder = ['boutique', 'paiement', 'pret'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'inactive';
  };
  const getStepStyles = (step) => {
    const status = getStepStatus(step);
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-600',
          text: 'text-green-600 font-semibold'
        };
      case 'current':
        return {
          circle: 'bg-purple-600',
          text: 'text-purple-600 font-semibold'
        };
      default:
        return {
          circle: 'bg-gray-400',
          text: 'text-gray-500'
        };
    }
  };

  const handleStepClick = (step) => {
    if (step === 'boutique' || getStepStatus(step) === 'completed') {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/* Barre de progression */}
      <div className="bg-white w-full max-w-3xl rounded-t-md shadow p-6">
        <h1 className="text-center text-2xl font-semibold mb-6">Sendbazar</h1>
        <div className="flex justify-between items-center mb-6 px-10">
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleStepClick('boutique')}
          >
            <div className={`w-4 h-4 rounded-full mb-1 ${getStepStyles('boutique').circle}`}></div>
            <span className={`text-sm ${getStepStyles('boutique').text}`}>Boutique</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleStepClick('paiement')}
          >
            <div className={`w-4 h-4 rounded-full mb-1 ${getStepStyles('paiement').circle}`}></div>
            <span className={`text-sm ${getStepStyles('paiement').text}`}>Paiement</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleStepClick('pret')}
          >
            <div className={`w-4 h-4 rounded-full mb-1 ${getStepStyles('pret').circle}`}></div>
            <span className={`text-sm ${getStepStyles('pret').text}`}>Prêt !</span>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      {renderStepContent()}
    </div>
  );
};

export default SetupVendorWizard; 