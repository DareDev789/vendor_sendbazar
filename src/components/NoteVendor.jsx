import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "./Login/LoginContext";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";

const NoteVendor = () => {
  const { deconnecter } = useLogin();
  const [onMetPadding, setOnMetPadding] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const PADDING_THRESHOLD = 15;

  useEffect(() => {
    const checkAndroidVersion = async () => {
      try {
        const info = await Device.getInfo();
        if (info.operatingSystem === "android") {
          const version = parseInt(info.osVersion?.split(".")[0] || "0", 10);
          setOnMetPadding(version >= PADDING_THRESHOLD);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des infos du device :",
          error
        );
        setOnMetPadding(false);
      }
    };
    checkAndroidVersion();
  }, []);

  const getPaddingClass = () => (isNative && onMetPadding ? "pt-[27px]" : "");
  const getMarginClass = () => (isNative && onMetPadding ? "mt-[27px]" : "");

  const handleLogout = async () => {
    await deconnecter();
  };

  return (
    <>
      <div
        className={`w-full bg-[#752275] z-[110] top-0 fixed ${getPaddingClass()}`}
      />
      <div
        className={`flex items-center justify-center min-h-screen p-4 bg-gray-100 ${getMarginClass()}`}
      >
        <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-md">
          {/* <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#6C2483] text-white flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 15.25a3.25 3.25 0 106.5 0v-3.5a3.25 3.25 0 00-6.5 0v3.5zm8.75-3.5v.3a8.249 8.249 0 01-8.25 8.25h-.5A8.249 8.249 0 013 12.05v-.3A8.25 8.25 0 0111.25 3.5h1.5A8.25 8.25 0 0120 11.75z"
              />
            </svg>
          </div> */}
          <img
            src="/Log_sbz.png"
            alt="Logo Sendbazar"
            className="object-contain h-7 mx-auto mb-4 md:h-20"
          />
          <h2 className="mt-10 text-3xl md:text-4xl font-extrabold tracking-tight text-[#6C2483]">
            Votre compte n'est pas vendeur !
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            Vous devez devenir vendeur pour accéder à cette fonctionnalité.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 mt-8 sm:flex-row">
            <Link
              to="/completer-profil"
              className="px-5 py-3 rounded-lg bg-[#6C2483] text-white font-semibold shadow hover:bg-[#5a1f6c] focus:outline-none focus:ring-2 focus:ring-purple-300 text-lg"
            >
              Devenir Vendeur
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-3 rounded-lg border border-[#6C2483] text-[#6C2483] font-semibold hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-200 text-lg"
            >
              Se déconnecter
            </button>
          </div>
          <div className="mt-10 select-none">
            <svg
              viewBox="0 0 400 120"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full text-purple-200"
            >
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e9d5ff" />
                  <stop offset="100%" stopColor="#fecdd3" />
                </linearGradient>
              </defs>
              <path
                d="M0,80 C80,20 160,120 240,60 C300,20 340,50 400,30 L400,120 L0,120 Z"
                fill="url(#g)"
              />
            </svg>
          </div>
        </div>
      </div>
      <div
        className={`w-full bg-[#752275] z-[110] shadow-xl fixed bottom-0 left-0 ${
          isNative && onMetPadding ? "pt-[48px]" : ""
        }`}
      />
    </>
  );
};

export default NoteVendor;
