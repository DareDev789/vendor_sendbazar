import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../contextes/UrlContext';
import ClipLoader from 'react-spinners/ClipLoader';
import Notiflix from "notiflix";
import ReservationDetail from './ReservationDetail';

export default function ManageReservationComp() {
    const location = useLocation();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState(null);
    const token = localStorage.getItem('token');
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const spPage = new URLSearchParams(location.search || '').get('page');
    const page = parseInt(spPage || '1', 10);
    const fetchReservations = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/get-all-reservation-store?page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.data;
            setReservations(result.data.data);
            setLastPage(result.data.last_page);
            setTotal(result.data.total);
        } catch (error) {
            console.error('Erreur lors de la récupération des réservations:', error);
            Notiflix.Notify.failure("Erreur lors de la récupération des réservations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [page]);
    useEffect(() => {
        const sp = new URLSearchParams(location.search || "");
        const id = sp.get("id");
        if (id) {
            setSelectedReservationId(id);
        }
    }, [location.search]);

     const mapping = {
        "confirmed": { label: "Confirmé", color: "bg-blue-100 text-blue-700" },
                "pending": { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
                "failed": { label: "Échoué", color: "bg-red-100 text-red-700" },
                "on-hold": { label: "Attente de paiement", color: "bg-orange-100 text-orange-700" },
                "processing": { label: "En cours", color: "bg-blue-100 text-blue-700" },
                "completed": { label: "Terminée", color: "bg-green-100 text-green-700" },
                "cancelled": { label: "Annulée", color: "bg-gray-200 text-gray-600" },
                "refunded": { label: "Remboursée", color: "bg-purple-100 text-purple-700" },
                "draft": { label: "Brouillon", color: "bg-gray-100 text-gray-500" },
              };

    const formatCompactDate = (compact) => {
        // Ex: 20240808000000 -> 08/08/2024
        if (!compact || String(compact).length < 8) return '-';
        const s = String(compact);
        const y = s.slice(0, 4);
        const m = s.slice(4, 6);
        const d = s.slice(6, 8);
        return `${d}/${m}/${y}`;
    };
    const formatUnixDate = (seconds) => {
        const num = Number(seconds);
        if (!Number.isFinite(num) || num <= 0) return '-';
        const date = new Date(num * 1000);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('fr-FR');
    };
    

    const getClientName = (parent) => {
        const first = parent?.meta?._billing_first_name || '';
        const last = parent?.meta?._billing_last_name || '';
        const full = `${first} ${last}`.trim();
        const isGuest = (parent?.meta?._customer_user || '0') === '0';
        return full ? `${full}${isGuest ? ' (Invité)' : ''}` : (isGuest ? 'Invité' : '-');
    };

    const getPersons = (meta) => {
        const persons = meta?._booking_persons;
        if (!Array.isArray(persons) || persons.length === 0) return 'N/A';
        try {
            const total = persons.reduce((acc, p) => acc + (Number(p) || 0), 0);
            return total || 'N/A';
        } catch {
            return 'N/A';
        }
    };

    const handleView = (id) => {
        navigate(`/reservation/detail/${id}`);
    };
    const goToPage = (nextPage) => {
        const sp = new URLSearchParams(location.search || '');
        if (nextPage <= 1) {
            sp.delete('page');
        } else {
            sp.set('page', String(nextPage));
        }
        navigate({ pathname: location.pathname, search: `?${sp.toString()}` });
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <ClipLoader
                    color="#3b82f6"
                    loading={true}
                    size={50}
                    speedMultiplier={1.5}
                />
            </div>
        );
    }

    return (
        <div className="w-full">
            {selectedReservationId ? (
                <>
                    <div className="mb-4 flex justify-between items-center">
                        <button
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                            onClick={() => {
                                setSelectedReservationId(null);
                                const sp = new URLSearchParams(location.search || "");
                                sp.delete("id");
                                sp.set("tab", "gerer");
                                navigate({ pathname: location.pathname, search: `?${sp.toString()}` }, { replace: false });
                            }}
                        >
                            Retour à la liste
                        </button>
                    </div>
                    <ReservationDetail id={selectedReservationId} />
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Gérer les réservations</h2>
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut de réservation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Identifiant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Produit réservé
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre de personnes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Commande
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date de début
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date de fin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reservations.length > 0 ? (
                            reservations.map((reservation) => (
                                <tr key={reservation.ID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${mapping[reservation.post_status]?.color || 'bg-gray-100 text-gray-500'}`}>
                                            {mapping[reservation.post_status]?.label || reservation.post_status || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {`Booking # ${reservation.ID}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {reservation?.meta?.product_name ? (
                                            <button
                                                type="button"
                                                onClick={() => handleView(reservation.ID)}
                                                className="text-gray-900 hover:underline"
                                            >
                                                {reservation.meta.product_name}
                                            </button>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getClientName(reservation.parent)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getPersons(reservation.meta)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {reservation?.parent?.ID ? `#${reservation.parent.ID} - ${mapping[reservation?.parent?.post_status]?.label || reservation?.parent?.post_status || '-'}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatUnixDate(reservation?.meta?._booking_start)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatUnixDate(reservation?.meta?._booking_end)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleView(reservation.ID)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs"
                                        >
                                            Voir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                    Aucune réservation trouvée
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                {lastPage > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                        <button
                            onClick={() => goToPage(Math.max(page - 1, 1))}
                            className={`px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            Précédent
                        </button>
                        <span className="px-4 py-2 bg-gray-100 rounded-lg">Page {page} / {lastPage}</span>
                        <button
                            onClick={() => goToPage(Math.min(page + 1, lastPage))}
                            className={`px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition ${page >= lastPage ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            Suivant
                        </button>
                    </div>
                )}
                </>
            )}
        </div>
    );
}