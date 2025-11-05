import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import BarreDeProgression from "../../utils/BarreDeProgression";
import LineChartComponent from "../../utils/LineChartComponent";
import { useDevise } from '../../contextes/DeviseContext';
import { calculatePricetoNewDevise, formatPrice } from '../../utils/formatPrice';

export default function VenteParJour() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilter = () => {};
  const progresData = [
    { value: 90, color: "bg-green-500", label: "Nombre d'articles vendus" },
    { value: 75, color: "bg-emerald-900", label: "Nombre de commandes" },
    {
      value: 60,
      color: "bg-yellow-400",
      label: "Montant brut moyen des ventes",
    },
    {
      value: 45,
      color: "bg-orange-400",
      label: "Montant net moyen des ventes",
    },
    { value: 30, color: "bg-red-400", label: "Montant du code promo" },
    { value: 15, color: "bg-red-600", label: "Montant de l'expédition" },
    { value: 50, color: "bg-blue-500", label: "Montant brut des ventes" },
    { value: 80, color: "bg-indigo-500", label: "Montant des ventes nettes" },
    { value: 100, color: "bg-purple-600", label: "Montant du remboursement" },
  ];

  const [grossSales, setGrossSales] = useState("0,00");
  const [netSales, setNetSales] = useState("0,00");
  const [refunded, setRefunded] = useState("0,00");
  const [billed, setBilled] = useState("0,00");
  const [promoAmount, setPromoAmount] = useState("0,00");
  const [dataRecharts, setDataRecharts] = useState([]);

  const { devise, listDevise } = useDevise();

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
  return (
    <>
      <div className="flex items-center gap-2">
        <label>
          Du :
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ml-1 border rounded px-2 py-1"
          />
        </label>
        <label>
          Au :
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-1 border rounded px-2 py-1"
          />
        </label>
        <button
          onClick={handleFilter}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Afficher
        </button>
      </div>
      <div className="flex gap-4 p-4">
        <div className="w-1/4 bg-white p-4 rounded-lg shadow">
          <div className="border-b border-gray-300 pb-2 mb-4">
            <h1 className="text-4xl font-bold mb-2">{formatPrice(calculatePricetoNewDevise(grossSales, 'Eur' , devise), listDevise[devise])}</h1>
            <p className="text-sm text-gray-500">
              ventes brutes au cours de cette période
            </p>
          </div>
          <div className="border-b border-gray-300 pb-2 mb-4">
            <h1 className="text-4xl font-bold mb-2">{formatPrice(calculatePricetoNewDevise(netSales, 'Eur' , devise), listDevise[devise])}</h1>
            <p className="text-sm text-gray-500">
              ventes nettes au cours de cette période
            </p>
          </div>
          <div className="border-b border-gray-300 pb-2 mb-4">
            <h1 className="text-4xl font-bold mb-2">0</h1>
            <p className="text-sm text-gray-500">commandes passées</p>
          </div>
          <div className="border-b border-gray-300 pb-2 mb-4">
            <h1 className="text-4xl font-bold mb-2">0</h1>
            <p className="text-sm text-gray-500">articles achetés</p>
          </div>
          <div className="border-b border-gray-300 pb-2 mb-4">
            <h1 className="text-4xl font-bold mb-2">{formatPrice(calculatePricetoNewDevise(refunded, 'Eur' , devise), listDevise[devise])}</h1>
            <p className="text-sm text-gray-500">
              remboursé 0 commandes (0 articles)
            </p>
          </div>
          <div className="border-b border-gray-300 pb-2 mb-4">
            <h1 className="text-4xl font-bold mb-2">{formatPrice(calculatePricetoNewDevise(billed, 'Eur' , devise), listDevise[devise])}</h1>
            <p className="text-sm text-gray-500">facturés pour la livraison</p>
          </div>
          <div className="border-b border-gray-300 pb-2 mb-4">
            <h1 className="text-4xl font-bold mb-2">{formatPrice(calculatePricetoNewDevise(promoAmount, 'Eur' , devise), listDevise[devise])}</h1>
            <p className="text-sm text-gray-500">
              montant des codes promo utilisés
            </p>
          </div>
        </div>

        <div className="w-3/4 bg-white p-4 rounded-lg shadow">
          <div className="border border-gray-400 p-6 w-full mb-5">
            <h3 className="text-lg font-semibold text-red-500 text-center mb-6">
              Ventes quotidiennes
            </h3>
            <hr className="border-gray-300 mb-4" />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {Array.from({
                    length: Math.ceil(progresData.length / 2),
                  }).map((_, rowIndex) => {
                    const left = progresData[rowIndex * 2];
                    const right = progresData[rowIndex * 2 + 1];
                    return (
                      <tr key={rowIndex}>
                        <td className="border p-2 min-w-[100px] max-w-[150px]">
                          <BarreDeProgression
                            percentage={left.value}
                            color={left.color}
                          />
                        </td>
                        <td className="border p-2">{left.label}</td>
                        {right ? (
                          <>
                            <td className="border p-2 min-w-[100px] max-w-[150px]">
                              <BarreDeProgression
                                percentage={right.value}
                                color={right.color}
                              />
                            </td>
                            <td className="border p-2">{right.label}</td>
                          </>
                        ) : (
                          <td
                            className="border p-2 text-center"
                            colSpan={2}
                          ></td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-10">
                <LineChartComponent data={dataRecharts} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
