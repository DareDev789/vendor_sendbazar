import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGoogle,
  faFacebookF,
  faApple,
} from "@fortawesome/free-brands-svg-icons";
import { Capacitor } from "@capacitor/core";
import Notiflix from "notiflix";
import nProgress from "nprogress";

export default function LoginNative({
  handleSubmitTiers,
  connectSansCompte,
  verifIdToken,
}) {
  const demanderEmail = async (nomPlateforme) => {
    return new Promise((resolve, reject) => {
      Notiflix.Confirm.prompt(
        `Connexion ${nomPlateforme}`,
        "Veuillez entrer votre adresse e-mail pour compléter la connexion :",
        "",
        "Confirmer",
        "Annuler",
        (email) => {
          if (!email || !email.includes("@")) {
            Notiflix.Notify.failure("Adresse e-mail invalide.");
            reject(new Error("Email invalide"));
          } else {
            resolve(email);
          }
        },
        () => {
          reject(new Error("Saisie annulée"));
        }
      );
    });
  };

  // 🔹 Apple
  const signInWithApple = async () => {
    try {
      nProgress.start();
      const result = await FirebaseAuthentication.signInWithApple();

      if (!result?.user) {
        Notiflix.Notify.failure("Erreur : aucun utilisateur détecté.");
        return;
      }

      const { email, name, uid } = result.user;
      const existant = await verifIdToken(uid, "Apple");

      if (existant) {
        return handleSubmitTiers(email, name);
      }

      const finalEmail = email || (await demanderEmail("Apple"));
      await connectSansCompte(name || "Utilisateur Apple", finalEmail, "Apple");
    } catch (err) {
      console.error("Apple Sign-In Error:", err);
      Notiflix.Notify.failure(
        `Erreur Apple : ${err.message || "Impossible de se connecter."}`
      );
    } finally {
      nProgress.done();
    }
  };

  const signInWithGoogle = async () => {
    try {
      nProgress.start();

      const result = await FirebaseAuthentication.signInWithGoogle();

      if (result.user) {
        const { email, displayName } = result.user;
        console.log("Utilisateur:", { email, displayName });
        return handleSubmitTiers(email, displayName);
      } else {
        console.error(
          "Aucun utilisateur retourné par FirebaseAuthentication.signInWithGoogle()"
        );
        Notiflix.Notify.failure("Erreur : aucun utilisateur détecté.");
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        console.log("User cancelled Google Sign-In");
      } else {
        Notiflix.Notify.failure(`Une erreur s'est produite.`);
      }
    } finally {
      nProgress.done();
    }
  };

  // 🔹 Facebook
  const signInWithFacebook = async () => {
    try {
      nProgress.start();
      const result = await FirebaseAuthentication.signInWithFacebook();

      if (!result?.user) {
        Notiflix.Notify.failure("Erreur : aucun utilisateur détecté.");
        return;
      }

      const { email, displayName, uid } = result.user;
      const existant = await verifIdToken(uid, "Facebook");

      if (existant) {
        return handleSubmitTiers(email, displayName);
      }

      // Si pas d’email, on le demande
      const finalEmail = email || (await demanderEmail("Facebook"));
      await connectSansCompte(
        displayName || "Utilisateur Facebook",
        finalEmail,
        "Facebook"
      );
    } catch (err) {
      console.error("Facebook Sign-In Error:", err);
      Notiflix.Notify.failure(
        `Erreur Facebook : ${err.message || "Impossible de se connecter."}`
      );
    } finally {
      nProgress.done();
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          signInWithGoogle();
        }}
        className="w-full bg-white border text-gray-900 text-sm py-2 px-2 rounded mb-2"
      >
        <FontAwesomeIcon icon={faGoogle} className="mr-2" /> Se connecter avec
        Google
      </button>

      {/* <button
        onClick={signInWithFacebook}
        className="w-full bg-blue-600 text-white text-sm py-2 px-2 rounded mb-2"
      >
        <FontAwesomeIcon icon={faFacebookF} className="mr-2" /> Se connecter
        avec Facebook
      </button> */}

      {Capacitor.getPlatform() === "ios" && (
        <button
          onClick={signInWithApple}
          className="w-full bg-black text-white text-sm py-2 px-2 rounded mb-2"
        >
          <FontAwesomeIcon icon={faApple} className="mr-2" /> Se connecter avec
          Apple
        </button>
      )}
    </>
  );
}
