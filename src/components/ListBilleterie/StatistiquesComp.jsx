import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import nProgress from "nprogress";
import { url } from '../../contextes/UrlContext';

export default function StatistiquesComp() {
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [load, setLoad] = useState(false);
    const token = localStorage.getItem("token");

    const fetchTickets = async () => {
        setLoad(true);
        setError(null);
        let link = page
            ? `${url}/get-stat-billet?page=${page}`
            : `${url}/get-stat-billet`;

        try {
            nProgress.start();
            const response = await axios.get(link, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTickets(response.data.data.data); 
            setCurrentPage(response.data.data.current_page);
            setLastPage(response.data.data.last_page);
        } catch (err) {
            console.error("Erreur récupération billets:", err);
            setError(err.message);
        } finally {
            setLoad(false);
            nProgress.done();
        }
    };

    useEffect(() => {
        fetchTickets();

    }, [page]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Statistiques Billets</h2>

            {error && (
                <div className="text-red-500 mb-4">
                    Erreur : {error}
                </div>
            )}

            {load && <p>Chargement...</p>}

            <AnimatePresence>
                {!load &&
                    tickets.map((ticket) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 rounded-lg shadow mb-3 flex justify-between items-center ${
                                ticket.validated ? "bg-green-100" : "bg-red-100"
                            }`}
                        >
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {ticket.post?.post_title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {ticket.validated
                                        ? "✅ Validé"
                                        : "❌ Non validé"}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {ticket.verified_at
                                    ? new Date(ticket.verified_at).toLocaleTimeString()
                                    : "Non vérifié"}
                            </div>
                        </motion.div>
                    ))}
            </AnimatePresence>

            {/* Pagination simple */}
            <div className="flex gap-2 mt-4">
                <button
                    disabled={currentPage <= 1}
                    onClick={() =>
                        setPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Précédent
                </button>
                <span>
                    Page {currentPage} / {lastPage}
                </span>
                <button
                    disabled={currentPage >= lastPage}
                    onClick={() =>
                        setPage((prev) =>
                            Math.min(prev + 1, lastPage)
                        )
                    }
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}
