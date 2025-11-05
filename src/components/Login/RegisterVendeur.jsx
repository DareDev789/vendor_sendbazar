import React, { useEffect, useState } from "react";
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
// Link removed; using a modal popup instead of navigation
import axios from "axios";
import {
  url,
  url_frontend,
  url_prod,
  FACEBOOK_CLIENT_ID,
  APPLE_CLIENT_ID,
  APPLE_REDIRECT_URI,
} from "../../contextes/UrlContext";
import nProgress from "nprogress";
import Notiflix from "notiflix";
import BoutiqueCreeeSucces from "./BoutiqueCreeeSucces";
import logoSBZ from "../../assets/Log_sbz.png";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../Login/LoginContext";
import { GoogleLogin } from "@react-oauth/google";
import Confidentialite from "./politique-de-confidentialite";
import { Capacitor } from "@capacitor/core";
import LoginNative from "./LoginNative";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faAppleAlt } from "@fortawesome/free-solid-svg-icons";
import { saveToken, getToken, removeToken } from "../../utils/formatPrice";

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

export default function RegisterVendeur({ setPage }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    prenom: "",
    nom: "",
    boutique: "",
    url: "",
    url_prod: url_prod,
    tel: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isPolicyVisible, setIsPolicyVisible] = useState(false);

  const isNative = Capacitor.isNativePlatform();
  const { Connecter, fetchInfoLogin, setCookie, getCookieToken, deconnecter } = useLogin();

  const openPolicy = () => {
    setIsPolicyOpen(true);
    setTimeout(() => setIsPolicyVisible(true), 10);
  };
  const closePolicy = () => {
    setIsPolicyVisible(false);
    setTimeout(() => setIsPolicyOpen(false), 200);
  };

  // Fonction pour parser le JWT Google
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

  // Initialisation Facebook SDK
  useEffect(() => {
    console.log(FACEBOOK_CLIENT_ID);
    if (!FACEBOOK_CLIENT_ID) {
      console.warn("FACEBOOK_CLIENT_ID non défini");
      return;
    }
    if (window.FB) return;

    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId: FACEBOOK_CLIENT_ID,
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
      } catch (error) {
        console.error("Facebook SDK initialization failed:", error);
      }
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/fr_FR/sdk.js";
    script.async = true;
    script.defer = true;
    script.onerror = () =>
      console.error("Erreur de chargement du script Facebook");
    document.body.appendChild(script);
  }, []);

  // Initialisation Apple SDK
  useEffect(() => {
    if (!APPLE_CLIENT_ID || !APPLE_REDIRECT_URI) return;
    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => {
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: "name email",
          redirectURI: APPLE_REDIRECT_URI,
          usePopup: true,
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  // Si un utilisateur est déjà connecté, proposer la déconnexion avant de poursuivre
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;
  //   Notiflix.Confirm.show(
  //     "Déconnexion requise",
  //     "Vous allez vous déconnecter pour créer votre boutique. Continuer ?",
  //     "Oui",
  //     "Non",
  //     async () => {
  //       try {
  //         await deconnecter();
  //       } catch (error) {
  //         console.error("Erreur lors de la déconnexion :", error);
  //       }
  //     },
  //     () => {
  //       navigate("/tableau-de-bord");
  //     }
  //   );
  // }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "boutique") {
      const slug = slugify(value);
      setForm((f) => ({ ...f, boutique: value, url: slug }));
    } else if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.push("Adresse email invalide");
    }

    if (!form.prenom || form.prenom.trim().length < 2) {
      errors.push("Prénom requis (minimum 2 caractères)");
    }

    if (!form.nom || form.nom.trim().length < 2) {
      errors.push("Nom de famille requis (minimum 2 caractères)");
    }

    if (!form.tel || form.tel.length < 1) {
      errors.push("Numéro de téléphone requis (minimum 1 chiffres)");
    }

    if (!form.boutique || form.boutique.trim().length < 1) {
      errors.push("Nom de la boutique requis (minimum 1 caractères)");
    }

    if (!form.url || form.url.trim().length < 1) {
      errors.push("URL de la boutique requise (minimum 1 caractères)");
    }

    return errors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    try {
      nProgress.start();
      const formData = {
        email: form.email.trim().toLowerCase(),
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        boutique: form.boutique.trim(),
        url: form.url.trim(),
        tel: form.tel,
        url_prod: url_prod,
      };
      const response = await axios.post(`${url}/create-boutique`, formData);
      if (response.data.success) {
        setSuccess("Boutique créée avec succès !");
        setShowSuccessPage(true);
        return true;
      } else {
        const errorMessage =
          response.data.message || "Erreur lors de la création de la boutique";
        Notiflix.Notify.failure(errorMessage);
        setError(errorMessage);
        console.error("Erreur serveur:", response.data);
        return false;
      }
    } catch (error) {
      let errorMessage = "Erreur lors de la création de la boutique";

      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage =
          "Erreur de connexion au serveur. Vérifiez votre connexion internet.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      Notiflix.Notify.failure(errorMessage);
      setError(errorMessage);
      console.error("Erreur lors de la création de la boutique", error);
      return false;
    } finally {
      nProgress.done();
    }
  };

  const connectSansCompte = (name, id, type) => {
    if (type === "Facebook") {
      Notiflix.Confirm.prompt(
        "Email requis",
        "Veuillez entrer votre adresse email pour votre première connexion avec votre compte Facebook :",
        "",
        "Valider",
        "Annuler",
        async (email) => {
          if (email) {
            await handleSubmitTiersWithToken(email, name, id, "Facebook");
          }
        },
        () => {
          Notiflix.Notify.warning("Inscription annulée");
        }
      );
    } else {
      Notiflix.Confirm.prompt(
        "Email requis",
        "Veuillez entrer votre adresse email et votre nom pour votre première connexion avec votre compte Apple :",
        "",
        "Valider",
        "Annuler",
        async (email, name) => {
          if (email && name) {
            await handleSubmitTiersWithToken(email, name, userInfo.id, "Apple");
          }
        },
        () => {
          Notiflix.Notify.warning(
            <TranslatedText text="Inscription annulée" />
          );
        }
      );
    }
  };

  const verifIdToken = async (id, type) => {
    if (!id) {
      Notiflix.Notify.failure(
        `Id Token absent ! La connexion avec ${type} n'est pas prêt sur ce site !`
      );
      return false;
    }

    try {
      const res = await fetch(`${url}/verifIdToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      const data = await res.json();
      if (!data.success || !data.data?.token) {
        return false;
      }
      localStorage.setItem("token", data.data.token);
      await Connecter(data.data);
      await fetchInfoLogin();
      navigate("/tableau-de-bord");
      return true;
    } catch (err) {
      Notiflix.Notify.failure(err.message || "Erreur inconnue");
      return false;
    }
  };

  const handleSubmitTiers = async (email, name) => {
    setLoading(true);
    setError(null);
    console.log(email);
    try {
      const res = await fetch(`${url}/loginTiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      console.log(data);
      if (data.success && data.data?.token) {
        localStorage.setItem("token", data.data.token);
        isNative && saveToken(data.data.token); 
        Notiflix.Notify.success("Connexion réussie !");
        await fetchInfoLogin();
      } else {
        setError(data.message || "Erreur lors de la connexion");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTiersWithToken = async (email, name, id, type) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${url}/loginTiersWithToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, id, type }),
      });
      const data = await res.json();
      if (data.success && data?.data?.token) {
        localStorage.setItem("token", data?.data?.token);
        await Connecter(data.data);
        await fetchInfoLogin();
        navigate("/tableau-de-bord");
      } else {
        setError(data.message || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

  // Afficher la page de succès si la boutique a été créée
  if (showSuccessPage) {
    return <BoutiqueCreeeSucces email={form.email} />;
  }
  return (
    <div className="max-w-2xl p-6 mx-auto bg-white rounded shadow">
      <img
        src={logoSBZ}
        alt="Logo Sendbazar"
        className="object-contain h-12 mx-auto mb-2 md:h-20"
      />
      <h1 className="mb-1 text-2xl font-bold text-center md:text-3xl">
        Créer ma boutique
      </h1>
      <p className="mb-4 text-center text-gray-600">
        Renseignez vos informations pour commencer à vendre
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informations personnelles */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">
              Prénom <span className="text-[#f6858b]">*</span>
            </label>
            <input
              type="text"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f6858b] focus:border-[#f6858b] transition"
              placeholder="Votre prénom"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">
              Nom de famille <span className="text-[#f6858b]">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f6858b] focus:border-[#f6858b] transition"
              placeholder="Votre nom de famille"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-semibold">
            Adresse email <span className="text-[#f6858b]">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f6858b] focus:border-[#f6858b] transition"
            placeholder="votre@email.com"
          />
          <p className="mt-1 text-xs text-gray-500">
            Un lien pour définir un nouveau mot de passe sera envoyé à votre
            adresse e-mail.
          </p>
        </div>
        <div>
          <label className="block mb-1 font-semibold">
            N° téléphone <span className="text-[#f6858b]">*</span>
          </label>
          <PhoneInput
            country={"mg"}
            value={form.tel}
            onChange={(phone) => setForm((f) => ({ ...f, tel: phone }))}
            containerClass="w-full"
            inputClass="w-full rounded-lg border border-gray-300 p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f6858b] focus:border-[#f6858b] transition"
            inputProps={{
              name: "tel",
              required: true,
            }}
          />
        </div>
        {/* Informations boutique */}
        <div>
          <label className="block mb-1 font-semibold">
            Nom de la boutique <span className="text-[#f6858b]">*</span>
          </label>
          <input
            type="text"
            name="boutique"
            value={form.boutique}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f6858b] focus:border-[#f6858b] transition"
            placeholder="Nom de votre boutique"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">
            URL de la boutique <span className="text-[#f6858b]">*</span>
          </label>
          <input
            type="text"
            name="url"
            value={form.url}
            readOnly
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            {url_frontend}/store/{form.url || ""}
          </p>
        </div>
        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="px-4 py-3 text-red-700 border border-red-200 rounded bg-red-50">
            <p className="text-sm font-medium">❌ {error}</p>
          </div>
        )}
        {success && (
          <div className="px-4 py-3 text-green-700 border border-green-200 rounded bg-green-50">
            <p className="text-sm font-medium">✅ {success}</p>
          </div>
        )}
        <p className="mt-2 text-xs text-gray-600">
          Vos données personnelles seront utilisées pour vous accompagner au
          cours de votre visite du site web, gérer l'accès à votre compte, et
          pour d'autres raisons décrites dans notre{" "}
          <button
            type="button"
            onClick={openPolicy}
            className="text-[#f6858b] underline hover:text-[#e06a74]"
          >
            politique de confidentialité
          </button>
          .
        </p>
        {isPolicyOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
          >
            <div
              className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
                isPolicyVisible ? "opacity-100" : "opacity-0"
              }`}
              onClick={closePolicy}
            />
            <div
              className={`relative z-10 w-[95vw] lg:w-[80vw] max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-200 ${
                isPolicyVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b md:px-6">
                <button
                  type="button"
                  onClick={closePolicy}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              <div className="w-full h-[70vh] bg-gray-50 px-4 md:px-6 py-3 overflow-auto">
                <Confidentialite />
              </div>
              <div className="flex justify-end px-4 py-3 border-t md:px-6">
                <button
                  type="button"
                  onClick={closePolicy}
                  className="px-4 py-2 text-white bg-[#f6858b] rounded hover:shadow-md"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-3 rounded-lg mt-2 shadow-sm transition ${
            loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#f6858b] text-white hover:shadow-md hover:-translate-y-0.5 duration-150"
          }`}
        >
          {loading ? "Création en cours..." : "CRÉER MA BOUTIQUE"}
        </button>
        {/* Séparateur */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">Ou</span>
          </div>
        </div>
        {/* Boutons de connexion sociale */}
        <div className="space-y-3">
          {Capacitor.isNativePlatform() ? (
            <>
              <LoginNative
                handleSubmitTiers={handleSubmitTiers}
                connectSansCompte={connectSansCompte}
                verifIdToken={verifIdToken}
              />
            </>
          ) : (
            <>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const user = parseJwt(credentialResponse.credential);
                  handleSubmitTiers(user.email, user.name);
                }}
                onError={() => {
                  Notiflix.Notify.failure("Échec de la connexion");
                }}
              />
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (!window.FB) {
                      console.error("Facebook SDK n'est pas encore chargé");
                      return;
                    }

                    window.FB.login(
                      (response) => {
                        if (response.authResponse) {
                          window.FB.api(
                            "/me",
                            { fields: "name,email" },
                            async function (userInfo) {
                              setLoading(true);

                              if (userInfo.id) {
                                const result = await verifIdToken(
                                  userInfo.id,
                                  "Facebook"
                                );
                                if (!result) {
                                  Notiflix.Confirm.prompt(
                                    "Email requis",
                                    "Veuillez entrer votre adresse email pour votre première connexion avec votre compte Facebook :",
                                    "",
                                    "Valider",
                                    "Annuler",
                                    async (email) => {
                                      if (email) {
                                        await handleSubmitTiersWithToken(
                                          email,
                                          userInfo.name,
                                          userInfo.id,
                                          "Facebook"
                                        );
                                      }
                                    },
                                    () => {
                                      Notiflix.Notify.warning(
                                        "Inscription annulée"
                                      );
                                    }
                                  );
                                }
                              }
                              setLoading(false);
                            }
                          );
                        }
                      },
                      { scope: "public_profile,email" }
                    );
                  }}
                  className="flex items-center justify-center w-full py-2 text-sm text-white bg-blue-600 rounded"
                >
                  <FontAwesomeIcon icon={faFacebook} className="mr-2" /> Se
                  connecter avec Facebook
                </button>
              </div>

              <div className="w-full mt-4">
                <div
                  onClick={() => {
                    if (!window.AppleID?.auth) {
                      Notiflix.Notify.failure("Apple Sign-In non initialisé");
                      return;
                    }

                    window.AppleID.auth
                      .signIn()
                      .then(async (response) => {
                        const { email, fullName } = response.user;
                        const { id_token } = response.authorization;
                        const name =
                          fullName?.givenName + " " + fullName?.familyName;
                        if (email && name) {
                          handleSubmitTiers(userInfo.email, userInfo.name);
                        } else if (id_token) {
                          setLoading(true);
                          const result = await verifIdToken(
                            userInfo.id,
                            "Apple"
                          );
                          if (!result) {
                            Notiflix.Confirm.prompt(
                              "Email requis",
                              "Veuillez entrer votre adresse email et votre nom pour votre première connexion avec votre compte Apple :",
                              "",
                              "Valider",
                              "Annuler",
                              async (email, name) => {
                                if (email && name) {
                                  await handleSubmitTiersWithToken(
                                    email,
                                    name,
                                    userInfo.id,
                                    "Apple"
                                  );
                                }
                              },
                              () => {
                                Notiflix.Notify.warning("Inscription annulée");
                              }
                            );
                          }
                          setLoading(false);
                        } else {
                          Notiflix.Notify.failure(
                            "La connexion avec Apple Information n'est pas prêt sur ce site !"
                          );
                        }
                      })
                      .catch((error) => {
                        console.error("Apple Sign-in error", error);
                      });
                  }}
                  className="flex items-center justify-center w-full py-2 text-sm text-white transition bg-black rounded cursor-pointer hover:bg-gray-800"
                >
                  <FontAwesomeIcon icon={faAppleAlt} className="mr-2 h-7" /> Se
                  connecter avec Apple
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-4 text-sm text-center">
          Si vous avez déjà un compte,{" "}
          <a href="/login" className="text-[#f6858b] hover:underline">
            connectez-vous ici.
          </a>
        </div>
      </form>
    </div>
  );
}
