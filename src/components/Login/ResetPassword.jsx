import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { url } from "../../contextes/UrlContext";
import axios from "axios";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenUrl = searchParams.get("key");
    const emailUrl = searchParams.get("email");
    if (!tokenUrl || !emailUrl) {
      setError("Lien de réinitialisation invalide.");
    } else {
      setToken(tokenUrl);
      setEmail(emailUrl);
    }
  }, [searchParams]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== password1) {
      setError("Les mots de passe ne sont pas identiques");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${url}/resetPassWord`, {
        token,
        email,
        new_password: password,
      });
      console.log(response);
      if (response.data.success) {
        setSuccess(
          response.data.message || "Mot de passe modifié avec succès !"
        );
      } else {
        setError(response.data.message || "Erreur lors de la réinitialisation");
      }
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) {
        const data = err.response.data;

        if (data.errors) {
          const messages = Object.values(data.errors).flat().join("\n");
          setError(messages);
        } else if (data.message) {
          setError(data.message.toString());
        } else {
          setError("Erreur lors de la réinitialisation");
        }
      } else {
        setError(err.message || "Erreur inconnue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-md"
      >
        <h1 className="mb-4 text-2xl font-bold text-center">
          Réinitialiser votre mot de passe
        </h1>
        {error && <p className="mb-2 text-center text-red-600">{error}</p>}
        {success && (
          <p className="mb-2 text-center text-green-600">{success}</p>
        )}
        <div className="relative mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Nouveau mot de passe
          </label>
          <input
            type={showPassword1 ? "text" : "password"}
            className="w-full p-3 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2"
            onClick={() => setShowPassword1((v) => !v)}
            tabIndex={-1}
          >
            {showPassword1 ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className="relative mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Retaper le mot de passe
          </label>
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
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full py-3 font-semibold text-white transition-colors bg-purple-700 rounded hover:bg-purple-800"
          disabled={loading}
        >
          {loading ? "Modification..." : "Modifier mon mot de passe"}
        </button>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="bg-[#f5848c] text-white px-6 py-2 rounded hover:bg-pink-400 transition"
          >
            Se connecter
          </button>
        </div>
      </form>
    </div>
  );
}
