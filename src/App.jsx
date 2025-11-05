import "./App.css";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
//import IndexLivraison from './components/Reglages/Livraison/IndexLivraison.jsx';
import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { useLogin } from "./components/Login/LoginContext";
import logoSBZ from "./assets/Log_sbz.png";
import SetupVendorWizard from "./components/Login/SetupVendorWizard.jsx";
import RegisterVendorPassword from "./components/Login/RegisterVendorPassword.jsx";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import TopBar from "./components/layout/TopBar.jsx";
import SideMenu from "./components/layout/SideMenu.jsx";
import AppRoutes from "./components/layout/AppRoutes.jsx";
import BottomNav from "./components/layout/BottomNav.jsx";
import { useDevise } from "./contextes/DeviseContext.jsx";

function App() {
  const navigate = useNavigate();
  const [reglagesOpen, setReglagesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleReglages = () => setReglagesOpen(!reglagesOpen);
  const { devise, setDevise, listDevise, changeDevise } = useDevise();
  const [showDevisePopup, setShowDevisePopup] = useState(false);
  const [androidVersion, setAndroidVersion] = useState('');
  const isNative = Capacitor.isNativePlatform();
  const [onMetPadding, setOnMetPadding] = useState(false);
  const showDevisePopupRef = useRef(null);
  const { deconnecter, loginInfo } = useLogin();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showDevisePopupRef.current &&
        !showDevisePopupRef.current.contains(event.target)
      ) {
        setShowDevisePopup(false);
      }
    }

    if (showDevisePopup) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [showDevisePopup]);

  useEffect(() => {
    const loadDeviceInfo = async () => {
      const info = await Device.getInfo();
      if (info.operatingSystem === "android") {
        const version = info.osVersion || "0";

        const major = parseInt(version.split(".")[0], 10);
        console.log(version);
        if (version >= 15) {
          setOnMetPadding(true);
        } else {
          setOnMetPadding(false);
        }
      } else {
        setAndroidVersion("Non Android");
        setOnMetPadding(false);
      }
    };
    loadDeviceInfo();
  }, []);

  
  useEffect(() => {
    if (location.pathname.startsWith("/reglages")) {
      setReglagesOpen(true);
    }
  }, [location.pathname]);
  const SauterdUnObglet = (onglet) => {
    setMenuOpen(!menuOpen);
    navigate(onglet);
  };
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  if (location.pathname === "/setup-vendor") {
    return <SetupVendorWizard />;
  }
  if (location.pathname === "/register-vendor-password") {
    return <RegisterVendorPassword />;
  }
  return (
    <>
      <TopBar
        isNative={isNative}
        onMetPadding={onMetPadding}
        navigate={navigate}
        logoSBZ={logoSBZ}
        showDevisePopupRef={showDevisePopupRef}
        listDevise={listDevise}
        devise={devise}
        setShowDevisePopup={setShowDevisePopup}
        changeDevise={changeDevise}
        loginInfo={loginInfo}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        showDevisePopup={showDevisePopup}
      />
      <div className="relative flex flex-col w-full min-h-screen mx-auto md:flex-row">
        <SideMenu
          menuOpen={menuOpen}
          toggleMenu={toggleMenu}
          SauterdUnObglet={SauterdUnObglet}
          location={location}
          reglagesOpen={reglagesOpen}
          toggleReglages={toggleReglages}
          deconnecter={deconnecter}
        />
        <main className={`flex-1 p-2 md:p-6 bg-gray-100 relative overflow-hidden py-6 ${onMetPadding && "py-5 mt-16"}`}>
          <AppRoutes devise={devise} listDevise={listDevise} />
        </main>
      </div>
      <div className="py-4 bg-white w-full md:hidden block"></div>
      <BottomNav isNative={isNative} onMetPadding={onMetPadding} />
    </>
  );
}

export default App;