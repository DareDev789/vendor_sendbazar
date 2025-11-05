import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faBars, faXmark, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import React from "react";

function TopBar({ isNative, onMetPadding, navigate, logoSBZ, showDevisePopupRef, listDevise, devise, setShowDevisePopup, changeDevise, loginInfo, menuOpen, toggleMenu, showDevisePopup }) {
  const isPaddignable = isNative && onMetPadding;
  return (
    <div
      className={`w-full bg-[#752275] shadow-xl top-0 text-white z-[110] border-b-2 text-sm border-white ${
        isPaddignable ? "pt-[28px] md:pt-0 fixed left-0" : "sticky"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 w-full px-4">
        <img
          onClick={() => navigate("/tableau-de-bord")}
          src={logoSBZ}
          alt="Logo Sendbazar"
          className="object-contain w-24 h-auto py-1 cursor-pointer"
        />
        <div className="flex items-center space-x-4">
          <div
            className="text-white relative py-1 px-2 rounded border hover:border-gray-300 transition-all cursor-pointer"
            ref={showDevisePopupRef}
          >
            <span
              onClick={(e) => {
                e.preventDefault();
                setShowDevisePopup(true);
              }}
            >
              {listDevise[devise]}{" "}
              <FontAwesomeIcon icon={faAngleDown} className="ml-1 text-xs" />
            </span>
            {showDevisePopup && (
              <div className="absolute right-0 mt-1 w-24 bg-white rounded-lg shadow-lg z-50">
                {Object.keys(listDevise).map((dev, index) => (
                  <>
                    {devise !== dev && (
                      <button
                        key={index}
                        onClick={() => {
                          setShowDevisePopup(false);
                          changeDevise(dev);
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {listDevise[dev]}
                      </button>
                    )}
                  </>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-200 p-2 rounded-xl shadow">
            <FontAwesomeIcon
              icon={faUserCircle}
              className="text-2xl text-purple-700 mr-2"
            />
            <span className="hidden sm:block font-semibold text-sm text-gray-700">
              {loginInfo?.firstName && loginInfo.firstName.slice(0, 1)}
              {loginInfo?.firstName && ". "}
              {loginInfo?.lastName || "User"}
            </span>
          </div>
        </div>

        <button
          className="block md:hidden text-2xl text-pink-500"
          onClick={() => toggleMenu()}
        >
          <FontAwesomeIcon icon={!menuOpen ? faBars : faXmark} />
        </button>
      </div>
    </div>
  );
}

export default TopBar;


