import nProgress from "nprogress";
import Notiflix from "notiflix";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";
import { url } from "../../contextes/UrlContext";
import { saveToken, getToken, removeToken } from "../../utils/formatPrice";
import { Capacitor } from "@capacitor/core";

function setCookie(name, value) {
  document.cookie = name + "=" + encodeURIComponent(value) + "; path=/";
}

function getCookie(name) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}
function removeCookie(name) {
  document.cookie = name + "=; Max-Age=0; path=/";
}
const LoginContext = createContext();
export function LoginProvider({ children }) {
  const [userName, setUserName] = useState(
    () => localStorage.getItem("sbz_admin_name") || ""
  );
  const [loginInfo, setLoginInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [cookieToken, setCookieToken] = useState(null);
  const [load, setLoad] = useState(false);
  const [isVendor, setIsVendor] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  const Connecter = async (data) => {
    try {
      nProgress.start();
      const response = await axios.post(`${url}/login`, data);
      if (response.data.success && response.data.data?.token) {
        setLoginInfo(response.data.data);
        setUserName(response.data.data?.nicename);
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("loginInfo", JSON.stringify(response.data.data));
        await setCookie("token", response.data.data.token);
        isNative && saveToken(response.data.data.token);
        await setCookie("login", JSON.stringify(response.data.data));
        Notiflix.Notify.success("Connexion réussie !");
        return { success: true, data: response.data.data };
      } else {
        Notiflix.Notify.failure(
          response.data.message || "Erreur lors de la connexion"
        );
        return {
          success: false,
          message: response.data.message || "Erreur lors de la connexion",
        };
      }
    } catch (error) {
      Notiflix.Notify.failure("Erreur lors de la connexion");
      console.error("Erreur lors de la connexion", error);
      return { success: false, message: "Erreur lors de la connexion" };
    } finally {
      nProgress.done();
    }
  };
  const deconnecter = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("loginInfo");
      removeCookie("token");
      removeCookie("login");
      setLoginInfo(null);
      setCookieToken(null);
      isNative && removeToken();
    } catch (err) {
      Notiflix.Notify.failure("Erreur lors de la déconnexion !");
      console.error("Erreur lors de la déconnexion :", err);
    }
  };
  

  const fetchInfoLogin = async () => {
    try {
      const token = isNative ? await getToken() : localStorage.getItem("token");
      if (!token) {
        deconnecter();
        return false;
      }
      nProgress.start();

      const res = await axios.get(`${url}/get_user_info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = res.data;
      if (!data.success || !data.data) {
        deconnecter();
        return false;
      }

      setLoginInfo(data?.data);
      if (data?.data) {
        setIsVendor(data.data.isVendor || false);
        localStorage.setItem("loginInfo", JSON.stringify(data.data));
        localStorage.setItem("token", token);
        setLoginInfo(data.data);
        setUserName(data.data?.name);
        await setCookie("login", JSON.stringify(data.data));
        return true;
      }
      deconnecter();
      return false;
    } catch (err) {
      console.error(
        "Erreur lors du chargement des informations du login :",
        err
      );
      if (
        err.response &&(err.response.status === 401 || err.response.status === 403)
      ) {
        console.warn("Token invalide ou expiré, déconnexion forcée !");
        deconnecter();
      }
      return false;
    } finally {
      nProgress.done();
    }
  };

  return (
    <LoginContext.Provider
      value={{
        Connecter,
        deconnecter,
        loginInfo,
        cookieToken,
        load,
        userName,
        setLoginInfo,
        setUserName,
        setCookieToken,
        setLoad,
        setCookie,
        fetchInfoLogin,
        isVendor,
        setIsVendor,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}
export const useLogin = () => useContext(LoginContext);