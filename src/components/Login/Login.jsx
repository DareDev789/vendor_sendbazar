import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faAppleAlt } from "@fortawesome/free-solid-svg-icons";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import Notiflix from "notiflix";
import logoSBZ from "../../assets/Log_sbz.png";
import { useLogin } from "./LoginContext";
import {
  url,
  FACEBOOK_CLIENT_ID,
  APPLE_CLIENT_ID,
  APPLE_REDIRECT_URI,
} from "../../contextes/UrlContext";
import { Capacitor } from "@capacitor/core";
import LoginNative from "./LoginNative";
import { saveToken, getToken, removeToken } from "../../utils/formatPrice";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  const { Connecter, fetchInfoLogin, setCookie, getCookieToken } = useLogin();

  useEffect(() => {
    if (window.FB) return;
    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId: "1751920238796605",
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
      } catch (error) {}
    };
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/fr_FR/sdk.js";
    script.async = true;
    script.defer = true;
    script.onerror = () =>
      console.error("Erreur de chargement du script Facebook");
    document.body.appendChild(script);
  }, []);

  if (!APPLE_CLIENT_ID || !APPLE_REDIRECT_URI) {
    console.error("Apple Sign-In configuration manquante !");
    return;
  }
  useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        email: email,
        password: password,
      };

      const result = await Connecter(payload);
      if (result.success) {
        navigate("/tableau-de-bord");
      } else {
        console.log(result);
        throw new Error(result?.message || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
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
    try {
      const res = await fetch(`${url}/loginTiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
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

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <img
          src={logoSBZ}
          alt="Logo Sendbazar"
          className="object-contain h-12 mx-auto mb-4 md:h-20"
        />
        <h1 className="mb-6 text-3xl font-bold text-center">Connexion</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-center text-red-600">{error}</p>}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            En cliquant sur « Se connecter », vous acceptez la
            <Link
              to="/politique-de-confidentialite"
              className="ml-1 text-[#f6858b] hover:underline"
            >
              politique de confidentialité
            </Link>
            <span className="mx-1">et</span>
            <Link
              to="/conditions-generale-de-vente"
              className="text-[#f6858b] hover:underline"
            >
              conditions générales
            </Link>{" "}
            de ce site.
          </p>
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition-colors bg-purple-700 rounded hover:bg-purple-800"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-[#f6858b] hover:underline"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">Ou</span>
          </div>
        </div>
        <div className="mb-4">
          {Capacitor.isNativePlatform() ? (
            <>
              <LoginNative handleSubmitTiers={handleSubmitTiers} connectSansCompte={connectSansCompte} verifIdToken={verifIdToken}/>
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
        <div className="flex items-center mt-4 text-sm">
          <Link
            to="/create-my-store"
            className="bg-[#f6858b] w-full text-white text-center py-2 rounded-md  hover:underline"
          >
            Devenir vendeur
          </Link>
        </div>
      </div>
    </div>
  );
}
