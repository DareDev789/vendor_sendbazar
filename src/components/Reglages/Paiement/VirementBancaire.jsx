import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUniversity,
  faArrowLeft,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Notiflix from "notiflix";
import { url } from "../../../contextes/UrlContext";

export default function VirementBancaire() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ac_name: "",
    ac_type: "",
    ac_number: "",
    routing_number: "",
    bank_name: "",
    bank_addr: "",
    iban: "",
    swift: "",
    declaration: false,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileSettings, setProfileSettings] = useState(null);
  const [meta, setMeta] = useState(null);
  const fetchData = async () => {
    try {
      const response = await axios.get(`${url}/get-info-store`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const metaData = response.data.meta || {};
      setMeta(metaData);
      const bank = metaData?.dokan_profile_settings?.payment?.bank || {};
      setForm({
        ac_name: bank.ac_name || "",
        ac_type: bank.ac_type || "",
        ac_number: bank.ac_number || "",
        routing_number: bank.routing_number || "",
        bank_name: bank.bank_name || "",
        bank_addr: bank.bank_addr || "",
        iban: bank.iban || "",
        swift: bank.swift || "",
        declaration: false,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.declaration) {
      setMessage("Vous devez confirmer que vous êtes propriétaire du compte.");
      return;
    }
    try {
      const metaToSend = {
        payment: {
          // Conserver les autres moyens de paiement déjà présents (ex: paypalEmail, mobile_banking)
          ...((meta?.dokan_profile_settings && meta.dokan_profile_settings.payment) || {}),
          bank: {
            // Préserver les champs existants de bank (ex: paypalEmail, mobile_banking) puis écraser par les nouveaux
            ...((meta?.dokan_profile_settings?.payment?.bank) || {}),
            ac_name: form.ac_name,
            ac_type: form.ac_type,
            ac_number: form.ac_number,
            routing_number: form.routing_number,
            bank_name: form.bank_name,
            bank_addr: form.bank_addr,
            iban: form.iban,
            swift: form.swift,
          },
        },
      };
      const response = await axios.post(
        `${url}/edit-info-store`,
        metaToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        Notiflix.Notify.success(
          "Informations bancaires mises à jour avec succès !"
        );
        setMessage("Informations bancaires mises à jour avec succès !");
      } else {
        Notiflix.Notify.failure(
          response.data.message || "Erreur lors de la mise à jour"
        );
        setMessage(response.data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      
      Notiflix.Notify.failure("Erreur lors de la mise à jour");
      setMessage("Erreur lors de la mise à jour");
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <FontAwesomeIcon
            icon={faUniversity}
            className="text-pink-500 w-8 h-8"
          />
          Paramètres de virement bancaire
        </h1>
        <Link
          to="/show-boutique"
          className="mt-2 md:mt-0 inline-block px-4 py-2 text-base font-medium text-white bg-gray-400 rounded hover:bg-gray-800 transition"
        >
          Voir la boutique
        </Link>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-red-500 hover:text-pink-600 transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Retour
      </button>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-full space-y-4"
      >
        <div>
          <label className="block text-gray-700 font-semibold">
            Titulaire de compte :
          </label>
          <input
            type="text"
            name="ac_name"
            value={form.ac_name}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-pink-500"
            placeholder="Nom de votre compte en banque"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            Type de compte :
          </label>
          <select
            name="ac_type"
            value={form.ac_type}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-pink-500"
          >
            <option value="">Veuillez sélectionner...</option>
            <option value="personnel">Compte personnel</option>
            <option value="entreprise">Compte entreprise</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            Numéro de compte :
          </label>
          <input
            type="text"
            name="ac_number"
            value={form.ac_number}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-pink-500"
            placeholder="Numéro de votre compte bancaire"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            Numéro de routage :
          </label>
          <input
            type="text"
            name="routing_number"
            value={form.routing_number}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-pink-500"
            placeholder="Code de routage bancaire"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            Nom de la banque :
          </label>
          <input
            type="text"
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-pink-500"
            placeholder="Nom de votre banque"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            Adresse de la banque :
          </label>
          <input
            type="text"
            name="bank_addr"
            value={form.bank_addr}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-pink-500"
            placeholder="Adresse de votre banque"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            IBAN bancaire :
          </label>
          <input
            type="text"
            name="iban"
            value={form.iban}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-pink-500"
            placeholder="Code IBAN de votre compte"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            Code SWIFT de la banque :
          </label>
          <input
            type="text"
            name="swift"
            value={form.swift}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-pink-500"
            placeholder="Code SWIFT/BIC de votre banque"
          />
        </div>
        {/* Checkbox */}
        <div className="flex items-start gap-2 mt-4">
          <input
            type="checkbox"
            name="declaration"
            checked={form.declaration}
            onChange={handleChange}
            className="mt-1"
          />
          <label className="text-gray-700 text-sm">
            J'atteste que je suis le propriétaire et que j'ai l'autorisation
            complète sur ce compte bancaire.
          </label>
        </div>
        {/* Boîte d'information */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6 flex items-start gap-3">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="text-blue-500 mt-1 w-5 h-5"
          />
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-1">
              Veuillez vérifier les informations de votre compte !
            </h3>
            <p className="text-sm text-blue-700">
              Un nom et un numéro de compte incorrects ou incompatibles peuvent
              entraîner des retards et des frais de retrait.
            </p>
          </div>
        </div>
        {/* Boutons */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded"
          >
            Mettre à jour les informations
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Annuler
          </button>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-sm font-medium ${message.includes("succès") ? "text-green-600" : "text-red-500"
              }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
