import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Notiflix from 'notiflix';
import Cookies from 'js-cookie';
import { url } from '../../contextes/UrlContext';
import { useLogin } from './LoginContext';

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserData } = useLogin();
  const [status, setStatus] = useState({ loading: true, success: false, message: '' });

  useEffect(() => {
    const token = searchParams.get('auth');
    if (!token) return setStatus({ loading: false, success: false, message: 'Token invalide ou manquant.' });

    axios.post(`${url}/activer-mon-compte`, { auth: token })
      .then(res => {
        const data = res.data?.data;
        if (!res.data.success || !data?.token) throw new Error(res.data.message || 'Échec activation');

        localStorage.setItem('token', data.token);
        Cookies.set('token', data.token);
        Cookies.set('login', JSON.stringify(data));
        setUserData?.(data);

        Notiflix.Notify.success('Compte activé avec succès !');
        setStatus({ loading: false, success: true, message: 'Compte activé avec succès.' });
        setTimeout(() => navigate('/register-vendor-password'), 1000);
      })
      .catch(err => {
        const msg = err.response?.data?.message || err.message || 'Erreur inconnue';
        Notiflix.Notify.failure(msg);
        setStatus({ loading: false, success: false, message: msg });
        setTimeout(() => navigate('/login'), 3000);
      });
  }, [searchParams, navigate, setUserData]);

  if (status.loading)
    return <div className="flex items-center justify-center min-h-screen"><p>Activation en cours...</p></div>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 text-center bg-white rounded shadow-md">
        <h2 className={`text-xl font-bold mb-4 ${status.success ? 'text-green-600' : 'text-red-600'}`}>
          {status.success ? '✅ Activation réussie' : '❌ Échec de l’activation'}
        </h2>
        <p>{status.message}</p>
      </div>
    </div>
  );
};

export default ActivateAccount;
