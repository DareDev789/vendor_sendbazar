import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowRight, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import logoSBZ from '../../assets/Log_sbz.png';
const BoutiqueCreeeSucces = ({ email }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <img 
          src={logoSBZ}
          alt="Logo Sendbazar" 
          className="h-16 mx-auto mb-6 object-contain" 
        />
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon 
              icon={faCheckCircle} 
              className="text-5xl text-green-600" 
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Boutique créée avec succès !
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Félicitations ! Votre boutique a été créée avec succès. 
          Un email de confirmation a été envoyé à votre adresse.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <FontAwesomeIcon icon={faEnvelope} className="text-lg" />
            <span className="font-medium">{email}</span>
          </div>
        </div>       
      </div>
    </div>
  );
};
export default BoutiqueCreeeSucces;
