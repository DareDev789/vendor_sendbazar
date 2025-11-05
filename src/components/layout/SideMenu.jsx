import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faBriefcase,
  faCalendarCheck,
  faChartLine,
  faChevronDown,
  faChevronUp,
  faCreditCard,
  faShareNodes,
  faGear,
  faRoute,
  faShop,
  faShoppingCart,
  faTicket,
  faUserCircle,
  faTachometerAlt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";

function SideMenu({ menuOpen, toggleMenu, SauterdUnObglet, location, reglagesOpen, toggleReglages, deconnecter }) {
  return (
    <aside
      className={`
          fixed top-0 right-0 h-full w-[300px] md:w-1/6 max-w-full bg-[#6C2483] text-white p-4 z-20
          transition-all duration-300 overflow-y-auto
          md:relative md:block md:h-auto md:translate-x-0 text-sm
          ${menuOpen ? "translate-x-0 z-[100]" : "translate-x-full"}
        `}
    >
      <div className="flex justify-end mb-4 md:hidden">
        <button onClick={toggleMenu} className="text-2xl text-white">
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <nav className="flex flex-col gap-2 md:block md:space-y-2 w-full list-none select-none">
        <li
          onClick={() => SauterdUnObglet("/tableau-de-bord")}
          className={`w-[100%] md:w-full p-2 rounded hover:bg-[#6C2483] cursor-pointer ${
            location.pathname.startsWith("/tableau-de-bord")
              ? "bg-[#f68] font-bold"
              : ""
          }`}
        >
          <FontAwesomeIcon className="mr-2" icon={faTachometerAlt} />
          Tableau de bord
        </li>
        <li
          onClick={() => SauterdUnObglet("/products")}
          className={`w-[100%] md:w-full p-2 rounded hover:bg-[#6C2483] cursor-pointer ${
            location.pathname.startsWith("/products")
              ? "bg-[#f68] font-bold"
              : ""
          }`}
        >
          <FontAwesomeIcon className="mr-2" icon={faBriefcase} />
          Produits
        </li>
        <li
          onClick={() => SauterdUnObglet("/commandes")}
          className={`w-[100%] md:w-full p-2 rounded hover:bg-[#6C2483] cursor-pointer ${
            location.pathname.startsWith("/commandes")
              ? "bg-[#f68] font-bold"
              : ""
          }`}
        >
          <FontAwesomeIcon className="mr-2" icon={faShoppingCart} />
          Commandes
        </li>
        <li
          onClick={() => SauterdUnObglet("/rapports")}
          className={`w-[100%] md:w-full p-2 rounded hover:bg-[#6C2483] cursor-pointer ${
            location.pathname.startsWith("/rapports")
              ? "bg-[#f68] font-bold"
              : ""
          }`}
        >
          <FontAwesomeIcon className="mr-2" icon={faChartLine} />
          Rapports
        </li>
        <li
          onClick={() => SauterdUnObglet("/annonces")}
          className={`w-[100%] md:w-full p-2 rounded hover:bg-[#6C2483] cursor-pointer ${
            location.pathname.startsWith("/annonces")
              ? "bg-[#f68] font-bold"
              : ""
          }`}
        >
          <FontAwesomeIcon className="mr-2" icon={faBell} />
          Annonces
        </li>
        <li
          onClick={() => SauterdUnObglet("/billeterie")}
          className={`w-[100%] md:w-full p-2 rounded hover:bg-[#6C2483] cursor-pointer ${
            location.pathname.startsWith("/billeterie")
              ? "bg-[#f68] font-bold"
              : ""
          }`}
        >
          <FontAwesomeIcon className="mr-2" icon={faTicket} />
          Billeteries
        </li>
        <li
          onClick={() => SauterdUnObglet("/circuit")}
          className={`w-[100%] md:w-full p-2 rounded hover:bg-[#6C2483] cursor-pointer ${
            location.pathname.startsWith("/circuit")
              ? "bg-[#f68] font-bold"
              : ""
          }`}
        >
          <FontAwesomeIcon className="mr-2" icon={faRoute} />
          Circuits
        </li>
        <li
          onClick={() => SauterdUnObglet("/reservation")}
          className={`w-[100%] md:w-full p-2 rounded hover:bg-[#6C2483] cursor-pointer ${
            location.pathname.startsWith("/reservation")
              ? "bg-[#f68] font-bold"
              : ""
          }`}
        >
          <FontAwesomeIcon className="mr-2" icon={faCalendarCheck} />
          Reservations
        </li>
        <li
          className="w-[100%] md:w/full p-2 rounded cursor-pointer select-none"
          onClick={toggleReglages}
        >
          <div className="flex items-center justify-between">
            <span>
              <FontAwesomeIcon className="mr-2" icon={faGear} />
              Réglages
            </span>
            <FontAwesomeIcon
              icon={reglagesOpen ? faChevronUp : faChevronDown}
            />
          </div>
          {reglagesOpen && (
            <ul className="mt-2 ml-6 space-y-4 text-white p-0 m-0">
              <li
                className={`cursor-pointer flex items-center gap-2 rounded hover:bg-[#6C2483] ${
                  location.pathname === "/reglages/boutique"
                    ? "font-bold  bg-[#f68]"
                    : ""
                }`}
                onClick={() => SauterdUnObglet("/reglages/boutique")}
              >
                <FontAwesomeIcon icon={faShop} />
                Boutique
              </li>
              <li
                className={`cursor-pointer flex items-center gap-2 rounded hover:bg-[#6C2483] ${
                  location.pathname === "/reglages/paiement"
                    ? "font-bold  bg-[#f68]"
                    : ""
                }`}
                onClick={() => SauterdUnObglet("/reglages/paiement")}
              >
                <FontAwesomeIcon icon={faCreditCard} />
                Paiement
              </li>
              <li
                className={`cursor-pointer flex items-center gap-2 rounded hover:bg-[#6C2483] ${
                  location.pathname === "/reglages/reseauxsociaux"
                    ? "font-bold  bg-[#f68]"
                    : ""
                }`}
                onClick={() => SauterdUnObglet("/reglages/reseauxsociaux")}
              >
                <FontAwesomeIcon icon={faShareNodes} />
                Réseaux Sociaux
              </li>
              <li
                className={`cursor-pointer flex items-center gap-2 rounded hover:bg-[#6C2483] ${
                  location.pathname === "/reglages/moncompte"
                    ? "font-bold  bg-[#f68]"
                    : ""
                }`}
                onClick={() => SauterdUnObglet("/reglages/moncompte")}
              >
                <FontAwesomeIcon icon={faUserCircle} />
                Mon Compte
              </li>
            </ul>
          )}
        </li>
      </nav>
      <button
        className="mt-8 w-full bg-white text-[#6C2483] font-bold py-2 rounded hover:bg-gray-100 border border-[#6C2483]"
        onClick={deconnecter}
      >
        Se déconnecter
      </button>
    </aside>
  );
}

export default SideMenu;


