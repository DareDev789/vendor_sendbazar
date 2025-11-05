import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import GeolocalisationComp from '../../utils/GeolocalisationComp';
import countriesData from '../../data/countries.json';
import axios from 'axios';
import Notiflix from 'notiflix';
import { url } from '../../contextes/UrlContext';
const SetupVendorBoutique = ({ onNext, onBack }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    if (countriesData.countries) {
      const countriesList = Object.entries(countriesData.countries).map(([code, name]) => ({
        code,
        name
      }));
      setCountries(countriesList);
    }
  }, []);
  const validateForm = () => {
    return true;
  };
  const handleContinue = () => {
  };
  const handleSkip = () => {
    onNext({
      rue: '',
      rue2: '',
      ville: '',
      codePostal: '',
      pays: '',
      etat: '',
    });
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    const debugData = {};
    formData.forEach((value, key) => { debugData[key] = value; });
    try {
      const response = await axios.post(`${url}/setup-vendor-boutique`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        Notiflix.Notify.success('Boutique enregistrée avec succès !');
        console.log('Boutique setup data:', debugData);
        onNext();
      } else {
        Notiflix.Notify.failure(response.data.message || 'Erreur lors de l’enregistrement');
      }
    } catch (error) {
      Notiflix.Notify.failure('Erreur lors de l’enregistrement');
      
    }
  };
  return (
    <div className="w-full max-w-3xl p-8 mx-auto bg-white rounded-md shadow">
      <h2 className="mb-6 text-2xl font-semibold">Configuration de la boutique</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
        <div>
          <label className="block font-medium">
            Rue <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('rue', { required: 'La rue est requise' })}
            className={`w-full border rounded-md px-3 py-2 mt-1 ${errors.rue ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.rue && <p className="mt-1 text-sm text-red-500">{errors.rue.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Rue 2</label>
          <input
            type="text"
            {...register('rue2')}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block font-medium">
            Ville <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('ville', { required: 'La ville est requise' })}
            className={`w-full border rounded-md px-3 py-2 mt-1 ${errors.ville ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.ville && <p className="mt-1 text-sm text-red-500">{errors.ville.message}</p>}
        </div>
        <div>
          <label className="block font-medium">
            Code postal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('codePostal', { required: 'Le code postal est requis' })}
            className={`w-full border rounded-md px-3 py-2 mt-1 ${errors.codePostal ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.codePostal && <p className="mt-1 text-sm text-red-500">{errors.codePostal.message}</p>}
        </div>
        <div>
          <label className="block font-medium">
            Pays <span className="text-red-500">*</span>
          </label>
          <select
            {...register('pays', { required: 'Le pays est requis' })}
            className={`w-full border rounded-md px-3 py-2 mt-1 ${errors.pays ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            <option value="">Sélectionner un pays</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.pays && <p className="mt-1 text-sm text-red-500">{errors.pays.message}</p>}
        </div>
        <div>
          <label className="block font-medium">
            État <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('etat', { required: 'L\'état est requis' })}
            className={`w-full border rounded-md px-3 py-2 mt-1 ${errors.etat ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.etat && <p className="mt-1 text-sm text-red-500">{errors.etat.message}</p>}
        </div>
        <div>
          <label className="block font-medium">Carte</label>
          <GeolocalisationComp
            register={register}
            setValue={setValue}
            defaultLat={null}
            defaultLng={null}
            defaultAddress={null}
          />
        </div>
      </form>
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          className="px-6 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700"
          onClick={handleSubmit(onSubmit)}
        >
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
    </div>
  );
};
export default SetupVendorBoutique;
