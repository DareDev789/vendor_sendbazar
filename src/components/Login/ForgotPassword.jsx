import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { url, url_frontend, url_prod } from "../../contextes/UrlContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() === "") {
      setError("Email obligatoire");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${url}/forgotPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          url: url_prod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi du mail");
      }
      if (data.success) {
        setEmail("");
        setSuccess(data.message || "Mail de récupération envoyé avec succès");
      } else {
        setError(data.message || "Erreur lors de l'envoi du mail");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-4 bg-white rounded-lg shadow-md"
      >
        <h1 className="mb-4 text-2xl font-bold text-center">
          Mot de passe oublié
        </h1>
        <p className="mb-4 text-center text-gray-700">
          Veuillez saisir votre adresse e-mail. Vous recevrez par e-mail un lien
          pour créer un nouveau mot de passe.
        </p>
        {error && <p className="mb-2 text-center text-red-600">{error}</p>}
        {success && (
          <p className="mb-2 text-center text-green-600">{success}</p>
        )}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 font-semibold text-white transition-colors bg-purple-700 rounded hover:bg-purple-800"
          disabled={loading}
        >
          {loading ? "Envoi..." : "Obtenir un nouveau mot de passe"}
        </button>
        <div className="mt-6">
          <span
            onClick={() => navigate("/")}
            className="px-6 py-2 transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faAngleLeft} className="mr-1" /> Révenir à la
            page de connexion
          </span>
        </div>
      </form>
    </div>
  );
}
