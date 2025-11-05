import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faHome, faSearch, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

function BottomNav({ isNative, onMetPadding }) {
  return (
    <div className={`md:hidden fixed bottom-0 left-0 w-full z-20 `}>
      <div
        className={`w-full flex py-2 px-3 justify-between bg-[#752275] ${
          isNative && onMetPadding && "pb-[37px] md:pb-0"
        }`}
      >
        <Link to="/tableau-de-bord">
          <div className="p-1">
            <FontAwesomeIcon className="text-lg text-white" icon={faHome} />
          </div>
        </Link>
        <Link to="/billeterie/scan">
          <div className="p-1">
            <FontAwesomeIcon className="text-lg text-white" icon={faSearch} />
          </div>
        </Link>
        <Link to="/commandes">
          <div className="p-1">
            <FontAwesomeIcon
              className="text-white text-lg"
              icon={faShoppingCart}
            />
          </div>
        </Link>
        <Link to="/reglages/boutique">
          <div className="p-1">
            <FontAwesomeIcon className="text-lg text-white" icon={faGear} />
          </div>
        </Link>
      </div>
    </div>
  );
}

export default BottomNav;


