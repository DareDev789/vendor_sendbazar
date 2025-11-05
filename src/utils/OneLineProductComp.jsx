import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloud,
  faLeaf,
  faBan,
  faRecycle,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QuickEditModal from "./QuickEditModal";
import { url_frontend } from "../contextes/UrlContext";
import PriceDisplay from "./PriceDisplay";

export default function OneLineProductComp({
  product,
  link,
  deleteProduit,
  checked = false,
  onCheck,
  onDuplicate,
  onEdit,
  showAntigaspiIcon = false,
  showRubrique,
}) {
  const [isBlock, setIsBlock] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  let dateStr = product.post_modified || product.post_date;
  let dateAffiche = dateStr;
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d)) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      dateAffiche = `${day}/${month}/${year}`;
    }
  }
  const isBookable = product.booking;

  const durationType = product?.booking?._wc_booking_duration_type;
  const enableRangePicker =
    product?.booking?._wc_booking_enable_range_picker === "1";

  const allowRange = enableRangePicker && durationType === "customer";

  const isAntigaspi = product.is_anti_gaspillage;

  const navigate = useNavigate();

  const handleEdit = (e) => {
    e.preventDefault();
    if (product.isLocal && onEdit) {
      onEdit(product);
    } else {
      navigate(`${link}edit/${product.id}`);
    }
  };

  const publicSlug = product.post_name || product.slug || product.id;

  const rubriqueList = {
    soins_et_beaute: "Réservations des soins et beauté",
    prestations_services: "Prestations des services",
    locations_vehicule: "Location des véhicules",
  };
  return (
    <>
      <td className="px-2 py-1 border w-8">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck && onCheck(e.target.checked)}
        />
      </td>
      <td className={`px-2 py-1 border w-24 text-center relative`}>
        {showAntigaspiIcon && isAntigaspi && (
          <div
            className="absolute top-1 right-1 bg-green-600 shadow-md p-1 rounded-md"
            title={isAntigaspi && "Produit Anti_gaspillage"}
            aria-label={isAntigaspi && "Produit Anti_gaspillage"}
          >
            <FontAwesomeIcon className="text-white" icon={faRecycle} />
          </div>
        )}
        {product.images && product.images.length !== 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-12 mx-auto object-cover rounded"
          />
        ) : (
          <span>-</span>
        )}
      </td>
      <td className="px-2 py-1 border w-64 group">
        <div
          className={`flex gap-2 ${
            showAntigaspiIcon && isAntigaspi && "text-green-600"
          }`}
        >
          <Link to={`${link}edit/${product.id}`}>
            <b>{product.title}</b>
          </Link>
        </div>
        <div className="w-full">
          <div className="text-xs text-gray-600">
            <div className="flex flex-wrap">
              <span
                className="hover:underline cursor-pointer hover:text-red-600"
                title="Modifier"
                onClick={handleEdit}
              >
                Modifier
              </span>
              <span className="mx-1">|</span>
              <span
                className="hover:underline cursor-pointer hover:text-red-600"
                title="Effacer définitivement"
                onClick={() => deleteProduit(product.id)}
              >
                Supprimer Définitivement
              </span>
              <span className="mx-1">|</span>
              <span
                className="hover:underline cursor-pointer hover:text-red-600"
                title="Voir"
              >
                <a
                  href={`${url_frontend}/produit/${publicSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir
                </a>
              </span>
              <span className="mx-1">|</span>
              <span
                className="hover:underline cursor-pointer hover:text-red-600"
                title="Dupliquer"
                onClick={() => onDuplicate(product.id)}
              >
                Dupliquer
                <span className="mx-1">|</span>
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-2 py-1 border w-16 text-center relative">
        <div className="inline-block w-full">
          {product.post_status === "publish" ? (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-semibold text-nowrap">
              En ligne
            </span>
          ) : (
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md text-xs font-semibold">
              Brouillon
            </span>
          )}
        </div>
        {/* Badge anti-gaspillage dans le coin supérieur droit de la cellule */}
      </td>
      {/* <td className="px-2 py-1 border w-32 text-center">
        {product.ugs || "-"}
      </td> */}
      <td className="px-2 py-1 text-xs border w-24 font-bold">
        {product?.stock_status === "instock"
          ? "En stock"
          : "En rupture de stock"}
      </td>
      <td className="px-2 py-1 border w-12">
        <PriceDisplay
          product={product}
          selectedVariation={null}
          selectedNiveauTour={null}
          isProductCard={true}
        />
      </td>
      <td className="px-2 py-1 border w-16 text-center text-xs">
        {showRubrique && product?.rubrique && rubriqueList[product?.rubrique]}
      </td>
      <td className="px-2 py-1 border w-20">{dateAffiche}</td>
      <td className="px-2 py-1 border w-32 text-xs">
        {product?.address} <br />
        {product?.addresses &&
          product.addresses.length > 0 &&
          product.addresses.map((loc, index) => (
            <>
              <span key={index}>{loc}</span>
              <br />
            </>
          ))}
      </td>

      <QuickEditModal
        open={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
        product={product}
      />
    </>
  );
}
