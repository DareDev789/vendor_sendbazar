import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Notiflix from "notiflix";
import { url } from "../../contextes/UrlContext";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
const SetupVendorPaiement = ({ onNext, onBack }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [phone, setPhone] = useState('');
  const handleSkip = () => {
    onNext({
      paypalEmail: "",
      nomCompte: "",
      typeCompte: "",
      numeroCompte: "",
      numeroRoutage: "",
      nomBanque: "",
      adresseBanque: "",
      iban: "",
      swift: "",
      attestation: false,
      phone: "",
    });
  };
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    formData.append('phone', phone);
    try {
      const response = await axios.post(`${url}/setup-vendor-paiement`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, 
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        Notiflix.Notify.success("Paiement enregistré avec succès !");
        console.log('Paiement setup data:', response.data);
        onNext();
      } else {
        Notiflix.Notify.failure(response.data.message || "Erreur lors de l’enregistrement");
      }
    } catch (error) {
      Notiflix.Notify.failure("Erreur lors de l’enregistrement");
    }
  };
  return (
    <div className="w-full max-w-3xl p-8 mx-auto bg-white rounded-md shadow">
      <h2 className="mb-6 text-2xl font-semibold">Configuration des paiements</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">      
        <div className="mb-6">
          <label className="block mb-2 font-semibold">PayPal</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="w-24">Email</span>
            <input
              type="email"
              {...register("paypalEmail", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Veuillez entrer une adresse email valide"
                }
              })}
              placeholder="you@domain.com"
              className={`flex-1 border rounded-md px-3 py-2 ${
                errors.paypalEmail ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.paypalEmail && (
            <p className="mt-1 text-sm text-red-500">{errors.paypalEmail.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium">Titulaire de compte</label>
          <input
            type="text"
            {...register("nomCompte")}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Nom de votre compte en banque"
          />
        </div>
        <div>
          <label className="block font-medium">Type de compte</label>
          <select
            {...register("typeCompte")}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          >
            <option value="">Veuillez sélectionner...</option>
            <option value="personnel">Compte personnel</option>
            <option value="entreprise">Compte entreprise</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Numéro de compte</label>
          <input
            type="text"
            {...register("numeroCompte")}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Numéro de votre compte bancaire"
          />
        </div>
        <div>
          <label className="block font-medium">Numéro de routage</label>
          <input
            type="text"
            {...register("numeroRoutage")}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Code de routage"
          />
        </div>
        <div>
          <label className="block font-medium">Nom de la banque</label>
          <input
            type="text"
            {...register("nomBanque")}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Nom de votre banque"
          />
        </div>
        <div>
          <label className="block font-medium">Adresse de la banque</label>
          <input
            type="text"
            {...register("adresseBanque")}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Adresse de votre banque"
          />
        </div>
        <div>
          <label className="block font-medium">IBAN bancaire</label>
          <input
            type="text"
            {...register("iban")}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Code IBAN de votre compte"
          />
        </div>
        <div>
          <label className="block font-medium">Code SWIFT de la banque</label>
          <input
            type="text"
            {...register("swift")}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="Code SWIFT de votre banque"
          />
        </div>
        <div className="mt-4">
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register("attestation")} className="mt-1" />
            <span>
              J'atteste que je suis le propriétaire et que j'ai l'autorisation complète sur ce compte bancaire
            </span>
          </label>
        </div>
        <div className="p-3 mt-4 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md">
          <strong className="block mb-1 text-gray-800">Veuillez vérifier les informations de votre compte !</strong>
          Un nom et un numéro de compte incorrects ou incompatibles peuvent entraîner des retards et des frais de retrait.
        </div>
        <div className="mt-4">
          <label className="block mb-2 text-lg font-semibold text-gray-700">
            Mobile banking (OrangeMoney, MVola, AirtelMoney, ...) :
          </label>
          <PhoneInput
            country={'mg'}
            value={phone}
            onChange={setPhone}
            inputProps={{
              name: 'phone',
              required: true,
              autoFocus: false,
              className: 'w-full rounded-lg border border-gray-300 p-3 ml-8 focus:outline-none focus:ring-2 focus:ring-purple-500'
            }}
          />
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button type="submit" className="px-6 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700">
            Continuer
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="px-6 py-2 font-semibold text-gray-700 border border-gray-400 rounded-md hover:bg-gray-100"
          >
            Passer cette étape
          </button>
        </div>
      </form>
    </div>
  );
};
export default SetupVendorPaiement;