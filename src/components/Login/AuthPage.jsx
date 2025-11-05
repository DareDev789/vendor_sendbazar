import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import RegisterVendeur from "./RegisterVendeur";
import ActivateAccount from "./ActivateAccount";
import Confidentialite from "./politique-de-confidentialite";
import Conditions from "./conditions-generale-de-vente";

const PADDING_THRESHOLD = 15;

const routes = [
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/create-my-store", element: <RegisterVendeur /> },
  { path: "/activer-mon-compte", element: <ActivateAccount /> },
  { path: "/politique-de-confidentialite", element: <Confidentialite /> },
  { path: "/conditions-generale-de-vente", element: <Conditions /> },
];

export default function AuthPage() {
  const [onMetPadding, setOnMetPadding] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const checkAndroidVersion = async () => {
      try {
        const info = await Device.getInfo();
        if (info.operatingSystem === "android") {
          const version = parseInt(info.osVersion?.split(".")[0] || "0", 10);
          setOnMetPadding(version >= PADDING_THRESHOLD);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des infos du device :", error);
        setOnMetPadding(false);
      }
    };
    checkAndroidVersion();
  }, []);

  const getPaddingClass = () => (isNative && onMetPadding ? "pt-[27px]" : "");
  const getMarginClass = () => (isNative && onMetPadding ? "mt-[27px]" : "");

  return (
    <>
      <div className={`w-full bg-[#752275] z-[110] top-0 fixed ${getPaddingClass()}`} />
      <div className={`w-full relative py-20 sm:py-0 ${getMarginClass()}`}>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* Route par défaut : redirige vers "/" si l'URL ne correspond à rien */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      <div
        className={`w-full bg-[#752275] z-[110] shadow-xl fixed bottom-0 left-0 ${
          isNative && onMetPadding ? "pt-[48px]" : ""
        }`}
      />
    </>
  );
}
