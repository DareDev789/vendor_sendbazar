"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import nProgress from "nprogress";
import axios from "axios";

const DeviseContext = createContext();

export function DeviseProvider({ children }) {
  const [devise, setDevise] = useState(null);
  const countryToCurrency = {
    FR: "Eur",
    MG: "Mga",
    SN: "Xof",
    CI: "Xof",
    BJ: "Xof",
    BF: "Xof",
    TG: "Xof",
    NE: "Xof",
    ML: "Xof",
  };

  const listDevise = { Eur: "€", Mga: "Ar", Xof: "CFA" };

  const changeDevise = async (newDevise) => {
    nProgress.start();
    setDevise(newDevise);
    await Cookies.set("devise", devise, { expires: 7 });
    window.location.reload();
    nProgress.done();
  };

  const initDevise = async () => {
    const savedDevise = Cookies.get("devise");

    if (savedDevise) {
      setDevise(savedDevise);
      return;
    }

    try {
      const res = await axios.get("https://ipapi.co/json/");
      const countryCode = res.data?.country || "FR";
      const defaultDevise = countryToCurrency[countryCode] || "Eur";

      setDevise(defaultDevise);
      Cookies.set("devise", defaultDevise, { expires: 7 });
    } catch (error) {
      console.error("Erreur de détection du pays :", error);
      setDevise("Eur");
      Cookies.set("devise", "Eur", { expires: 7 });
    }
  };

  useEffect(() => {
    initDevise();
  }, []);

  useEffect(() => {
    if (devise) {
      Cookies.set("devise", devise, { expires: 7 });
    }
  }, [devise]);

  return (
    <DeviseContext.Provider
      value={{
        devise,
        setDevise,
        listDevise,
        changeDevise,
      }}
    >
      {children}
    </DeviseContext.Provider>
  );
}

export const useDevise = () => {
  const context = useContext(DeviseContext);
  if (!context) {
    throw new Error("useDevise doit être utilisé dans un DeviseProvider");
  }
  return context;
};
