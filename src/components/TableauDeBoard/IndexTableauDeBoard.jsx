import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faComments, faBriefcase, faCalendarAlt, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";

import Camember from "../../utils/Camember";
import ProfileProgress from "../../utils/ProfileProgress";
import BarreDeProgression from "../../utils/BarreDeProgression";
import LineChartComponent from "../../utils/LineChartComponent";
import axios from "axios";
import nProgress from "nprogress";
import { url } from '../../contextes/UrlContext';
import { formatPrice, calculatePricetoNewDevise } from '../../utils/formatPrice';

export default function IndexTableauDeBoard({ devise, listDevise}) {
  console.log(devise);
  const navigate = useNavigate();
  const [productsCount, setProductsCount] = useState(null)
  const [productsOnline, setProductsOnline] = useState(null)
  const [productsDraft, setProductsDraft] = useState(null)
  const [commandesTotal, setCommandesTotal] = useState(null)
  const [commandeTerminees, setCommandeTerminees] = useState(null)
  const [commandeEnCours, setCommandeEnCours] = useState(null)
  const [commandeAnnulees, setCommandeAnnulees] = useState(null)
  const [commandeRemboursees, setCommandeRemboursees] = useState(null)
  const [commandeEnAttente, setCommandeEnAttente] = useState(null)
  const [commandeEnCoursDePreparation, setCommandeEnCoursDePreparation] = useState(null)
  const [ventesNet, setVentesNet] = useState(0)
  const [revenus, setRevenus] = useState(0)
  const [annoucement, setAnnoucement] = useState(null);

  const profilCompletion = 85;
  const [chartData, setChartData] = useState([
    { name: "Terminée", value: 0, url: "/commandes" },
    { name: "En cours de vérification", value: 0, url: "/commandes" },
    { name: "En cours de traitement", value: 0, url: "/commandes" },
    { name: "Annulée", value: 0, url: "/commandes" },
    { name: "Remboursée", value: 0, url: "/commandes" },
    { name: "En attente", value: 0, url: "/commandes" },
  ]);

  const liensAvis = [
    { mot: "Tous", valeur: 1688, url: `/avis/${"Tous"}` },
    { mot: "En cours de vérification", valeur: 1681, url: `/avis/${"En-cours-de-verification"}` },
    { mot: "Indésirable", valeur: 7, url: `/avis/${"Indesirable"}` },
    { mot: "Corbeille", valeur: 0, url: `/avis/${"Corbeille"}` },
  ];

  const [liensProduits, setLiensProduits] = useState([
    { mot: "Total", valeur: 0, url: "/products" },
    { mot: "En ligne", valeur: 0, url: "/products" },
    { mot: "Hors ligne", valeur: 0, url: "/products" },
    { mot: "Révision en attente", valeur: 0, url: "/products" },
  ]);

  const progresData = [
    { value: 90, color: "bg-green-500", label: "Nombre d'articles vendus" },
    { value: 75, color: "bg-emerald-900", label: "Nombre de commandes" },
    { value: 60, color: "bg-yellow-400", label: "Montant brut moyen des ventes" },
    { value: 45, color: "bg-orange-400", label: "Montant net moyen des ventes" },
    { value: 30, color: "bg-red-400", label: "Montant du code promo" },
    { value: 15, color: "bg-red-600", label: "Montant de l'expédition" },
    { value: 50, color: "bg-blue-500", label: "Montant brut des ventes" },
    { value: 80, color: "bg-indigo-500", label: "Montant des ventes nettes" },
    { value: 100, color: "bg-purple-600", label: "Montant du remboursement" },
  ];

  const [dataRecharts, setDataRecharts] = useState([]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const generatedData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      generatedData.push({
        x: day,
        y: Math.floor(Math.random() * 100),
      });
    }

    setDataRecharts(generatedData);
  }, []);


  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      nProgress.start();
      const response = await axios.get(`${url}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProductsCount(response.data.data.productsCount);
      setProductsOnline(response.data.data.productsOnline);
      setProductsDraft(response.data.data.productsDraft);
      setCommandesTotal(response.data.data.commandesTotal);
      setCommandeTerminees(response.data.data.commandeTerminees);
      setCommandeEnCours(response.data.data.commandeEnCours);
      setCommandeAnnulees(response.data.data.commandeAnnulees);
      setCommandeRemboursees(response.data.data.commandeRemboursees);
      setCommandeEnAttente(response.data.data.commandeEnAttente);
      setCommandeEnCoursDePreparation(response.data.data.commandeEnCoursDePreparation);
      setVentesNet(response.data.data.ventesNet);
      setRevenus(response.data.data.revenus);
      setAnnoucement(response.data.data.annoucement);

      setChartData([
        { name: "Terminée", value: response.data.data.commandeTerminees, url: "/commandes" },
        { name: "En cours de vérification", value: response.data.data.commandeEnCoursDePreparation, url: "/commandes" },
        { name: "En cours de traitement", value: response.data.data.commandeEnCours, url: "/commandes" },
        { name: "Annulée", value: response.data.data.commandeAnnulees, url: "/commandes" },
        { name: "Remboursée", value: response.data.data.commandeRemboursees, url: "/commandes" },
        { name: "En attente", value: response.data.data.commandeEnAttente, url: "/commandes" },
      ]);

      setLiensProduits([
        { mot: "Total", valeur: response.data.data.productsCount, url: "/products" },
        { mot: "En ligne", valeur: response.data.data.productsOnline, url: "/products" },
        { mot: "Hors ligne", valeur: response.data.data.productsDraft, url: "/products" },
        { mot: "Révision en attente", valeur: response?.data?.data?.productsPendingReview || 0, url: "/products" },
      ])
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      nProgress.done();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const truncateHtmlContent = (html, wordLimit = 100) => {
    const textOnly = html.replace(/<[^>]+>/g, '');
    const words = textOnly.split(/\s+/).slice(0, wordLimit).join(' ');

    return words + '...';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 bg-white p-2 md:p-5">
      <h1 className="text-xl md:text-4xl font-bold text-gray-800 mb-5">Tableau de bord</h1>

      <ProfileProgress percentage={profilCompletion} />

      <div className="flex flex-col lg:flex-row mt-10 items-stretch">
        <div className="w-full lg:w-1/2">
          <div className="p-6 w-full mb-5 h-full shadow-xl rounded-md">
            <div className="mb-6 text-center">
              <h3 className="text-md md:text-lg font-semibold text-gray-800">Ventes nettes</h3>
              <p className="text-gray-600 mt-1 text-sm">{formatPrice(calculatePricetoNewDevise(ventesNet, 'Eur' , devise), listDevise[devise])}</p>
              <hr className="border-gray-300 mt-4" />
            </div>
            <div className="mb-6 text-center">
              <h3 className="text-md md:text-lg font-semibold text-gray-800">Revenus</h3>
              <p className="text-gray-600 mt-1 text-sm">{formatPrice(calculatePricetoNewDevise(revenus, 'Eur' , devise), listDevise[devise])}</p>
              <hr className="border-gray-300 mt-4" />
            </div>
            <div className="mb-6 text-center">
              <h3 className="text-md md:text-lg font-semibold text-gray-800">Commandes</h3>
              <p className="text-gray-600 mt-1 text-sm">{commandeTerminees}</p>
              <hr className="border-gray-300 mt-4" />
            </div>

          </div>

          <div className="p-6 w-full mb-5 shadow-xl rounded-md">
            <h3 className="text-md md:text-lg font-semibold text-red-500 mb-4 text-center">
              <FontAwesomeIcon icon={faShoppingCart} /> Commandes
            </h3>
            <hr className="border-gray-300 mb-4" />
            <Link
              to="/commandes"
              className="lex items-center gap-2 mb-4 text-lg font-semibold text-blue-600 hover:underline"
            >
              <span className="text-xl font-medium text-gray-700">Total : </span>
              {chartData.reduce((total, item) => total + item.value, 0)}
            </Link>
            <Camember data={chartData} />

          </div>

          {/* <div className="border border-gray-400 p-6 w-full mb-5">
            <h3 className="text-lg font-semibold text-red-500 mb-4 text-center">
              <FontAwesomeIcon icon={faComments} /> Avis
            </h3>
            <hr className="border-gray-300 mb-4" />
            {liensAvis.map(({ mot, valeur, url }, i) => (
              <Link
                key={i}
                to={url}
                className="flex justify-between items-center px-2 py-1 rounded hover:bg-gray-100 transition text-black"
              >
                <span>{mot}</span>
                <span>{valeur}</span>
              </Link>
            ))}
          </div> */}

          <div className="p-4 w-full mb-5 shadow-xl rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="text-md md:text-lg  font-semibold text-red-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faBriefcase} /> Produits
              </h3>
              <button
                className="bg-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-600 transition"
                onClick={() => navigate("/products/ajouter-produit")}
              >
                ➕ Ajouter un produit
              </button>
            </div>
            <hr className="border-gray-300 mb-4" />
            {liensProduits.map(({ mot, valeur, url }, i) => (
              <Link
                key={i}
                to={url}
                className="flex justify-between items-center px-2 py-1 rounded hover:bg-gray-100 transition text-black"
              >
                <span>{mot}</span>
                <span>{valeur}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2 rounded-lg h-full">
          <div className="p-4 w-full mb-5 shadow-xl rounded-md">
            <h3 className="text-lg font-semibold text-red-500 text-center mb-6">
              <FontAwesomeIcon icon={faCalendarAlt} /> Ventes de ce mois
            </h3>
            <hr className="border-gray-300 mb-4" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {Array.from({ length: Math.ceil(progresData.length / 2) }).map((_, rowIndex) => {
                    const left = progresData[rowIndex * 2];
                    const right = progresData[rowIndex * 2 + 1];
                    return (
                      <tr key={rowIndex}>
                        <td className="border p-2 min-w-[100px] max-w-[150px]">
                          <BarreDeProgression percentage={left.value} color={left.color} />
                        </td>
                        <td className="border p-2">{left.label}</td>
                        {right ? (
                          <>
                            <td className="border p-2 min-w-[100px] max-w-[150px]">
                              <BarreDeProgression percentage={right.value} color={right.color} />
                            </td>
                            <td className="border p-2">{right.label}</td>
                          </>
                        ) : (
                          <td className="border p-2 text-center" colSpan={2}></td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-10">
              <LineChartComponent data={dataRecharts} />
            </div>
          </div>

          <div className="mb-6 p-4 w-full shadow-xl rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faBullhorn} /> Dernier communiqué
              </h3>
              <Link
                to="/tout-afficher"
                className="bg-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-600 transition inline-block text-center"
              >
                Tout afficher
              </Link>
            </div>
            <hr className="border-gray-300 mb-4" />

            <div className="space-y-2">
              {annoucement && annoucement.length > 0 ? (
                <>
                  {annoucement.map((item, i) => (
                    <div key={i}>
                      <div className="flex flex-col sm:flex-row sm:items-stretch items-center overflow-hidden border rounded-md">
                        <Link
                          to={`/annonce-detail/${item.id}`}
                          className="sm:w-2/3 p-4 flex flex-col justify-between hover:bg-gray-100 transition"
                        >
                          <h2 className="text-md md:text-xl font-bold">{item?.post?.post_title}</h2>
                          <p className="text-sm mt-2">{truncateHtmlContent(item?.post?.post_content, 7)}</p>

                        </Link>

                        <div className="sm:w-full bg-[#f6858b] p-4 flex flex-col justify-center items-center space-y-1 text-white font-bold">
                          <span className="text-md md:text-lg">{new Date(item?.post?.post_date).getDate()}</span>
                          <span className="text-md uppercase">{new Date(item?.post?.post_date).toLocaleString('default', { month: 'long' })}</span>
                          <span className="text-sm">{new Date(item?.post?.post_date).getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-center text-gray-500">Aucun communiqué disponible.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}