import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { url } from '../../contextes/UrlContext';
import { useLogin } from './LoginContext';
export default function RegisterVendorPassword() {
  const navigate = useNavigate();
  const { loginInfo } = useLogin();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password.trim().length < 8) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      setLoading(true);
      const headers = {};
      const token = localStorage.getItem('token');
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await axios.post(`${url}/register-vendor-password`, { password }, { headers });
      if (response.data?.success) {
        setSuccess('Mot de passe défini avec succès !');
        setTimeout(() => navigate('/setup-vendor'), 800);
      } else {
        setError(response.data?.message || 'Erreur lors de l’enregistrement du mot de passe');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de l’enregistrement du mot de passe');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">Définir votre mot de passe</h1>
        {loginInfo?.email && (
          <p className="mb-4 text-center text-gray-600 text-md">Compte: <span className="font-medium">{loginInfo.email}</span></p>
        )}
        {error && <p className="mb-3 text-center text-red-600">{error}</p>}
        {success && <p className="mb-3 text-center text-green-600">{success}</p>}
        <div className="relative mb-4">
          <label className="block mb-1 font-medium text-gray-700 text-md">Nouveau mot de passe</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full p-3 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
        <div className="relative mb-4">
          <label className="block mb-1 font-medium text-gray-700 text-md">Confirmer le mot de passe</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="w-full p-3 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2"
            onClick={() => setShowConfirmPassword((v) => !v)}
            tabIndex={-1}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full py-3 font-semibold text-white transition-colors bg-purple-700 rounded hover:bg-purple-800"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Valider'}
        </button>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/setup-vendor')}
            className="text-[#f6858b] hover:underline"
          >
            Ignorer pour l’instant
          </button>
        </div>
      </form>
    </div>
  );
}
