import React, { useEffect, useState } from "react";
import { useLogin } from "../../Login/LoginContext";
import axios from "axios";
import Notiflix from "notiflix";
import ClipLoader from "react-spinners/ClipLoader";
import { url } from "../../../contextes/UrlContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function IndexMonCompte() {
  const { loginInfo, deconnecter, fetchInfoLogin, load } = useLogin();

  const [prenom, setPrenom] = useState(loginInfo?.firstName || "");
  const [nom, setNom] = useState(loginInfo?.lastName || "");
  const [email, setEmail] = useState(loginInfo?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPrenom(loginInfo?.firstName || "");
    setNom(loginInfo?.lastName || "");
    setEmail(loginInfo?.email || "");
  }, [loginInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmNewPassword) {
      Notiflix.Notify.failure(
        "Les nouveaux mots de passe ne correspondent pas."
      );
      return;
    }
    try {
      setLoading(true);
      const payload = {
        firstName: prenom,
        lastName: nom,
        email,
        ...(currentPassword && newPassword
          ? { currentPassword, newPassword }
          : {}),
      };
      const res = await axios.put(`${url}/update_user_info`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(res);
      if (res.data.success) {
        Notiflix.Notify.success("Modifications enregistrées !");
        if (typeof fetchInfoLogin === "function") fetchInfoLogin();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        Notiflix.Notify.failure(
          "Erreur : " + (res.data.message || "Échec de la mise à jour.")
        );
      }
    } catch (err) {
      Notiflix.Notify.failure("Impossible d'enregistrer les modifications.");
      console.error("Erreur lors de la mise à jour:", err);
    } finally {
      setLoading(false);
    }
  };

  if (load) {
    return (
      <div className="w-full min-h-[30vh] flex items-center justify-center">
        <ClipLoader
          color="#3b82f6"
          loading={true}
          size={50}
          speedMultiplier={1.5}
        />
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-full p-6 bg-white rounded-md shadow-md"
      >
        <div className="flex items-center justify-between mb-6 sm:justify-start sm:gap-3">
          <h2 className="text-xl font-bold text-gray-800 transition cursor-pointer hover:text-blue-700">
            Modifier les informations du compte
          </h2>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Prénom *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-gray-800 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Nom *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 text-gray-800 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Adresse e-mail *
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 text-gray-800 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="relative my-8">
          <div className="absolute px-2 bg-white -top-3 left-4">
            <span className="font-semibold tracking-wide text-gray-800 bg-white text-md">
              Changement de mot de passe
            </span>
          </div>
          <div className="p-4 pt-6 border border-gray-300 rounded-md bg-gray-50">
            <div className="mb-2">
              <label className="block mb-1 text-sm text-gray-700">
                Mot de passe actuel (laisser vide pour le conserver)
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 text-gray-800 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="mb-2">
              <label className="block mb-1 text-sm text-gray-700">
                Nouveau mot de passe (laisser vide pour conserver l'actuel)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 text-gray-800 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="mb-2">
              <label className="block mb-1 text-sm text-gray-700">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 text-gray-800 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#f6858b] text-white rounded hover:bg-pink-700 transition disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
