import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { url } from "../../contextes/UrlContext";
import nProgress from "nprogress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faTruck,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import countriesData from "../../data/countries.json";
import {
  calculatePricetoNewDevise,
  formatPrice,
} from "../../utils/formatPrice";
import { useDevise } from "../../contextes/DeviseContext";

export default function ShowCommande() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [load, setLoad] = useState(false);
  const [commande, setCommande] = useState([]);
  const [demandeRemboursement, setDemandeRemboursement] = useState(false);
  const [editStatut, setEditStatut] = useState(false);
  const [newStatut, setNewStatut] = useState(
    commande?.orderDokan?.order_status || ""
  );
  const [statutLoading, setStatutLoading] = useState(false);

  const { devise, listDevise } = useDevise();

  useEffect(() => {
    const fetchCommande = async () => {
      setLoad(true);
      let link;
      if (id) {
        link = `${url}/get_one_commande/${id}`;
      }
      try {
        nProgress.start();
        const response = await axios.get(link, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCommande(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoad(false);
        nProgress.done();
      }
    };
    fetchCommande();
    // On rend fetchCommande accessible ailleurs
    ShowCommande.fetchCommande = fetchCommande;
  }, []);
  function formatDate(dateFr) {
    if (!dateFr) return "";
    const date = new Date(dateFr);
    const jour = String(date.getDate()).padStart(2, "0");
    const mois = String(date.getMonth() + 1).padStart(2, "0");
    const annee = date.getFullYear();
    const heures = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const secondes = String(date.getSeconds()).padStart(2, "0");
    return `${jour}-${mois}-${annee} ${heures}:${minutes}:${secondes}`;
  }
  const billingCountryCode = commande?.meta?._billing_country;
  const billinggCountryName =
    countriesData.countries[billingCountryCode] || billingCountryCode || "";

  const shippingCountryCode = commande?.meta?._shipping_country;
  const shippingCountryName =
    countriesData.countries[shippingCountryCode] || shippingCountryCode || "";

  const statusMap = {
    "wc-pending": "En attente",
    "wc-failed": "Échoué",
    "wc-on-hold": "En attente",
    "wc-processing": "En cours",
    "wc-completed": "Terminée",
    "wc-cancelled": "Annulée",
    "wc-refunded": "Remboursée",
    "wc-draft": "Brouillon",
    "wc-trash": "Supprimée",
  };
  const statutCommande =
    statusMap[commande?.commande?.post_status] ||
    commande?.commande?.post_status;
  const handleUpdateStatut = async () => {
    setStatutLoading(true);
    try {
      await axios.put(
        `${url}/commande/statut/${id}`,
        { post_status: newStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditStatut(false);
      await ShowCommande.fetchCommande();
    } catch (error) {
      alert("Erreur lors de la modification du statut");
    } finally {
      setStatutLoading(false);
    }
  };
  // Générer dynamiquement les options à partir de statusMap
  const statusOptions = Object.entries(statusMap).map(([value, label]) => ({
    value,
    label,
  }));

  // Mapping couleur badge par label (valeur traduite)
  const statutCouleurs = {
    Terminée: "bg-green-500",
    "En cours": "bg-blue-500",
    Annulée: "bg-gray-500",
    Remboursée: "bg-purple-500",
    Échoué: "bg-red-500",
    "En attente": "bg-yellow-500",
    Brouillon: "bg-gray-400",
    Supprimée: "bg-gray-500",
  };

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 underline hover:text-blue-800"
      >
        ← Retour
      </button>
      <div className="block md:flex w-full gap-6 p-4 bg-gray-50">
        {/* Partie gauche */}
        <motion.div
          className="w-full md:w-2/3 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Articles de commande */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <div className="flex items-center gap-2 p-4 bg-gray-100 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">
                #CMD{commande?.commande?.ID}
              </h2>
              <FontAwesomeIcon icon={faArrowRight} className="text-gray-500" />
              <span className="text-gray-600">Articles de Commande</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      colSpan={2}
                      className="px-4 py-2 border text-center font-semibold"
                    >
                      Article
                    </th>
                    <th className="px-4 py-2 border font-semibold">Coût</th>
                    <th className="px-4 py-2 border font-semibold">Qté</th>
                    <th className="px-4 py-2 border font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {commande?.order_items?.map(
                    (com, index) =>
                      com?.product && (
                        <motion.tr
                          key={index}
                          className="hover:bg-gray-50 transition"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {/* Image */}
                          <td className="border px-4 py-2">
                            {com?.product?.metaNow?._thumbnail_id?.map(
                              (img, indexImg) => (
                                <img
                                  key={indexImg}
                                  src={img?.url}
                                  alt={`image-${indexImg}`}
                                  className="w-16 h-16 rounded-lg object-cover shadow-sm"
                                />
                              )
                            )}
                          </td>

                          {/* Infos produit */}
                          <td className="border px-4 py-2">
                            <p className="font-medium">
                              {com?.product?.metaNow?._sku}
                              {commande?.commande?.order_item[index]
                                ?.order_item_name && (
                                <Link
                                  to={`/products/edit/${
                                    com?.metas?._variation_id == 0
                                      ? com?.product?.ID
                                      : com?.metas?._variation_id
                                  }`}
                                  className="ml-2 text-blue-500 hover:underline"
                                >
                                  {
                                    commande?.commande?.order_item[index]
                                      ?.order_item_name
                                  }
                                </Link>
                              )}
                            </p>
                            <div className="text-xs text-gray-500 space-y-1 mt-1">
                              {com?.metas?.shipping_fee_recipient && (
                                <p>
                                  Frais expédition :{" "}
                                  {com?.metas?.shipping_fee_recipient}
                                </p>
                              )}
                              {com?.metas?.tax_fee_recipient && (
                                <p>Taxe : {com?.metas?.tax_fee_recipient}</p>
                              )}
                              {com?.metas?.shipping_tax_fee_recipient && (
                                <p>
                                  Taxe expédition :{" "}
                                  {com?.metas?.shipping_tax_fee_recipient}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Prix unité */}
                          <td className="border px-4 py-2 font-semibold">
                            {(() => {
                              const prixEUR =
                                parseFloat(
                                  com?.metas?._line_subtotal?.replace(
                                    ",",
                                    "."
                                  ) || 0
                                ) /
                                parseFloat(
                                  com?.metas?._qty?.replace(",", ".") || 1
                                );
                              const prixConverti = calculatePricetoNewDevise(
                                prixEUR,
                                "EUR",
                                devise
                              );
                              return formatPrice(
                                prixConverti,
                                listDevise[devise]
                              );
                            })()}
                          </td>

                          {/* Quantité */}
                          <td className="border px-4 py-2 text-center">
                            {com?.metas?._qty}
                          </td>

                          {/* Total */}
                          <td className="border px-4 py-2 font-semibold">
                            {(() => {
                              const totalEUR = parseFloat(
                                com?.metas?._line_subtotal?.replace(",", ".") ||
                                  0
                              );
                              const totalConverti = calculatePricetoNewDevise(
                                totalEUR,
                                "EUR",
                                devise
                              );
                              return formatPrice(
                                totalConverti,
                                listDevise[devise]
                              );
                            })()}
                          </td>
                        </motion.tr>
                      )
                  )}

                  {/* Frais de livraison */}
                  {commande?.meta?.shipping_fee_recipient &&
                    commande?.meta?.shipping_tax_fee_recipient && (
                      <tr className="bg-gray-50">
                        <td className="border px-4 py-2 text-center">
                          <FontAwesomeIcon
                            icon={faTruck}
                            className="text-gray-500"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          Livraison à domicile sur RDV
                        </td>
                        <td className="border"></td>
                        <td className="border"></td>
                        <td className="border px-4 py-2 font-semibold">
                          {commande?.meta?._order_shipping?.replace(",", ".")} €
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloc Remboursement ou Total */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {demandeRemboursement ? (
              <div className="p-4 space-y-4">
                <p className="font-semibold">Formulaire de remboursement</p>
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                    Soumettre
                  </button>
                  <button
                    onClick={() => setDemandeRemboursement(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {/* Remise */}
                <div className="flex justify-between">
                  <span>Remise :</span>
                  <span className="text-red-500">
                    -{" "}
                    {(() => {
                      const remiseEUR = parseFloat(
                        commande?.meta?._discount_amount?.replace(",", ".") || 0
                      );
                      const remiseConvertie = calculatePricetoNewDevise(
                        remiseEUR,
                        "EUR",
                        devise
                      );
                      return formatPrice(remiseConvertie, listDevise[devise]);
                    })()}
                  </span>
                </div>

                {/* Livraison */}
                <div className="flex justify-between">
                  <span>Livraison :</span>
                  <span>
                    {(() => {
                      const livraisonEUR = parseFloat(
                        commande?.meta?._order_shipping?.replace(",", ".") || 0
                      );
                      const livraisonConvertie = calculatePricetoNewDevise(
                        livraisonEUR,
                        "EUR",
                        devise
                      );
                      return formatPrice(
                        livraisonConvertie,
                        listDevise[devise]
                      );
                    })()}
                  </span>
                </div>

                {/* Total de la commande */}
                <div className="flex justify-between">
                  <span>Total de la commande :</span>
                  <span className="font-semibold">
                    {(() => {
                      const totalEUR = parseFloat(
                        commande?.meta?._order_total?.replace(",", ".") || 0
                      );
                      const totalConverti = calculatePricetoNewDevise(
                        totalEUR,
                        "EUR",
                        devise
                      );
                      return formatPrice(totalConverti, listDevise[devise]);
                    })()}
                  </span>
                </div>

                {/* Bouton remboursement */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setDemandeRemboursement(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Demander le remboursement
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Adresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Adresse de facturation",
                data: [
                  `${commande?.meta?._billing_first_name} ${commande?.meta?._billing_last_name}`,
                  commande?.meta?._billing_address_1,
                  commande?.meta?._billing_address_2,
                  commande?.meta?._billing_city,
                  commande?.meta?._billing_state,
                  commande?.meta?._billing_postcode,
                  billinggCountryName,
                ],
              },
              {
                title: "Adresse de livraison",
                data: [
                  `${commande?.meta?._shipping_first_name || ""} ${
                    commande?.meta?._shipping_last_name || ""
                  }`,
                  commande?.meta?._shipping_address_1,
                  commande?.meta?._shipping_address_2,
                  commande?.meta?._shipping_city,
                  commande?.meta?._shipping_state,
                  commande?.meta?._shipping_postcode,
                  shippingCountryName,
                ],
              },
            ].map((block, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  {block.title}
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  {block.data.map((line, i) => line && <p key={i}>{line}</p>)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Partie droite - Détails généraux */}
        <motion.div
          className="w-full md:w-1/3 space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Détails généraux
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <strong>Statut :</strong>
              {editStatut ? (
                <span>
                  <select
                    className="border rounded px-2 py-1 mr-2"
                    value={newStatut}
                    onChange={(e) => setNewStatut(e.target.value)}
                    disabled={statutLoading}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-1"
                    onClick={handleUpdateStatut}
                    disabled={statutLoading}
                  >
                    {statutLoading ? "..." : "Valider"}
                  </button>
                  <button
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
                    onClick={() => setEditStatut(false)}
                    disabled={statutLoading}
                  >
                    Annuler
                  </button>
                </span>
              ) : (
                <>
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      statutCouleurs[statutCommande] || "bg-gray-400"
                    }`}
                  >
                    {statutCommande}
                  </span>
                  <button
                    className="ml-2 text-xs text-blue-600 underline hover:text-blue-800"
                    onClick={() => {
                      setEditStatut(true);
                      setNewStatut(commande?.commande?.post_status || "");
                    }}
                    title="Modifier le statut"
                  >
                    <FontAwesomeIcon icon={faPen} /> Modifier
                  </button>
                </>
              )}
            </div>
            <p className="mt-2">
              <strong>Date :</strong>{" "}
              {formatDate(
                commande?.commande?.post_date || commande?.meta?._paid_date
              )}
            </p>
            <p className="mt-2">
              <strong>Client :</strong> {commande?.meta?._billing_first_name}{" "}
              {commande?.meta?._billing_last_name}
            </p>
            <p className="mt-2">
              <strong>Email :</strong> {commande?.meta?._billing_email}
            </p>
            <p className="mt-2">
              <strong>Téléphone :</strong> {commande?.meta?._billing_phone}
            </p>
            {commande?.commande?.post_excerpt && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h6 className="text-green-700 font-bold">Note client :</h6>
                <p className="text-green-600">
                  {commande?.commande?.post_excerpt}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
