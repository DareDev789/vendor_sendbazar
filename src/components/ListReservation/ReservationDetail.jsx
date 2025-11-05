import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../contextes/UrlContext';
import ClipLoader from 'react-spinners/ClipLoader';
import Notiflix from 'notiflix';

export default function ReservationDetail({ id: idProp }) {
    const { id: idFromParams } = useParams();
    const id = idProp || idFromParams;
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [statusDraft, setStatusDraft] = useState('');
    const token = localStorage.getItem('token');


    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/get-one-reservation-store/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = response?.data?.data || response?.data || null;
            setBooking(data);
            const current = (data?.post_status || '').toString().toLowerCase();
            setStatusDraft(current || 'pending-confirmation');
        } catch (e) {
            Notiflix.Notify.failure('Impossible de charger la réservation');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchDetail();
    }, [id]);

    const formatCompactDate = (compact) => {
        if (!compact || String(compact).length < 8) return '-';
        const s = String(compact);
        const y = s.slice(0, 4), m = s.slice(4, 6), d = s.slice(6, 8);
        return `${d}/${m}/${y}`;
    };

    if (loading || !booking) {
        return (
            <div className="flex items-center justify-center py-20">
                <ClipLoader color="#3b82f6" loading={true} size={60} speedMultiplier={1.5} />
            </div>
        );
    }

    const orderLabel = booking?.parent?.ID ? `#${booking.parent.ID}` : '-';
    const orderDate = booking?.post_date ? new Date(booking.post_date).toLocaleString('fr-FR', { hour12: false }) : '-';
    const mapStatusToLabel = (status) => {
        const s = String(status || '').toLowerCase();
        const mapping = {
            'unpaid': 'Impayée',
            'pending-confirmation': 'En attente de confirmation',
            'confirmed': 'Confirmée',
            'paid': 'Payée',
            'cancelled': 'Annulée',
            'complete': 'Achevée',
        };
        return mapping[s] || status || '-';
    };
    const statusLabel = mapStatusToLabel(booking?.post_status);
    const getStatusPillClasses = (status) => {
        const s = String(status || '').toLowerCase();
        const colors = {
            'unpaid': 'bg-orange-100 text-orange-800',
            'pending-confirmation': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'paid': 'bg-indigo-100 text-indigo-800',
            'cancelled': 'bg-red-100 text-red-800',
            'complete': 'bg-green-100 text-green-800',
        };
        return colors[s] || 'bg-gray-100 text-gray-800';
    };
    const clientFirst = booking?.parent?.meta?._billing_first_name || '';
    const clientLast = booking?.parent?.meta?._billing_last_name || '';
    const address1 = booking?.parent?.meta?._billing_address_1 || '';
    const city = booking?.parent?.meta?._billing_city || '';
    const postcode = booking?.parent?.meta?._billing_postcode || '';
    const email = booking?.parent?.meta?._billing_email || '';
    const phone = booking?.parent?.meta?._billing_phone || '';
    const resourceName = booking?.meta?.resource_name || '';
    // Duration now comes directly from `_booking_all_day` meta
    const handleViewOrder = () => {
        const orderId = booking?.parent?.ID;
        if (orderId) {
            navigate(`/commandes/${orderId}`);
        } else {
            Notiflix.Notify.failure('Aucune commande liée à cette réservation');
        }
    };
    const handleSaveStatus = async () => {
        try {
            // À connecter à l'API si un endpoint de mise à jour existe
            setBooking(prev => ({ ...prev, post_status: statusDraft }));
            setIsEditingStatus(false);
            Notiflix.Notify.success('Statut mis à jour (localement)');
        } catch (e) {
            Notiflix.Notify.failure('Échec de la mise à jour du statut');
        }
    };

    return (
        <div className="w-full mx-auto">
            <div className="mb-4 flex justify-between items-center">
                <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                    onClick={() => navigate('/reservation?tab=gerer')}
                >
                    Retour aux réservations
                </button>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm mb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Détails de la réservation</h2>
                        <p className="text-gray-600 mt-1">
                            Numéro de réservation : <span className="font-semibold">#{booking?.ID}</span>
                            <span className="mx-2">·</span>
                            Numéro de commande : <span className="font-semibold">{orderLabel}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
                    <h3 className="text-lg font-semibold mb-4">Détails</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-gray-600 md:w-56">Statut de la réservation :</span>
                            {!isEditingStatus ? (
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusPillClasses(booking?.post_status)}`}>{statusLabel}</span>
                                    <button className="text-xs text-blue-600 hover:underline" onClick={() => setIsEditingStatus(true)}>Modifier</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <select
                                        className="border rounded px-2 py-1 text-sm"
                                        value={statusDraft}
                                        onChange={(e) => setStatusDraft(e.target.value)}
                                    >
                                        <option value="unpaid">Impayée</option>
                                        <option value="pending-confirmation">En attente de confirmation</option>
                                        <option value="confirmed">Confirmée</option>
                                        <option value="paid">Payée</option>
                                        <option value="cancelled">Annulée</option>
                                        <option value="complete">Achevée</option>
                                    </select>
                                    <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded" onClick={handleSaveStatus}>Enregistrer</button>
                                    <button className="text-xs px-2 py-1 rounded border" onClick={() => { setIsEditingStatus(false); setStatusDraft(booking?.post_status || 'pending-confirmation'); }}>Annuler</button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-gray-600 md:w-56">Date de commande :</span>
                            <span className="font-medium">{orderDate}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-gray-600 md:w-56">Produit réservé :</span>
                            <span className="font-medium">{booking?.meta?.product_name || '-'}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-gray-600 md:w-56">Ressource(s) :</span>
                            <span className="font-medium">{resourceName || '-'}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-gray-600 md:w-56">Date de début :</span>
                            <span className="font-medium">{formatCompactDate(booking?.meta?._booking_start)}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-gray-600 md:w-56">Date de fin :</span>
                            <span className="font-medium">{formatCompactDate(booking?.meta?._booking_end)}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-gray-600 md:w-56">Durée :</span>
                            <span className="font-medium">{booking?.meta?._booking_all_day ? `${booking.meta._booking_all_day} Jour(s)` : '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
                    <h3 className="text-lg font-semibold mb-4">Détails du client</h3>
                    <div className="space-y-4 text-sm">
                        <div>
                            <span className="text-gray-600 block mb-1">Adresse :</span>
                            <div className="font-medium whitespace-pre-line bg-gray-50 p-3 rounded border">
                                {clientFirst} {clientLast}
                                {"\n"}
                                {address1}
                                {"\n"}
                                {postcode} {city && city.toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-600 block mb-1">Email :</span>
                            <span className="font-medium">{email || '-'}</span>
                        </div>
                        <div>
                            <span className="text-gray-600 block mb-1">Téléphone :</span>
                            <span className="font-medium">{phone || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-center">
                <button
                    type="button"
                    onClick={handleViewOrder}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                >
                    Voir la commande
                </button>
            </div>
        </div>
    );
}


