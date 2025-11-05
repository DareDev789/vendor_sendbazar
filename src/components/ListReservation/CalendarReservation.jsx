import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { url } from '../../contextes/UrlContext';
import ClipLoader from 'react-spinners/ClipLoader';
import Notiflix from 'notiflix';
import { useNavigate } from 'react-router-dom';

const monthNamesFr = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

export default function CalendarReservation() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [loading, setLoading] = useState(false);
    const [eventsByDay, setEventsByDay] = useState({});
    const [viewMode, setViewMode] = useState('month'); 
    const [selectedDate, setSelectedDate] = useState(() => {
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    });
    const navigate = useNavigate();

    const [allMonthReservations, setAllMonthReservations] = useState([]);
    const [dayReservations, setDayReservations] = useState([]);
    // Filtres
    const [filterProductId, setFilterProductId] = useState('');
    const [filterResourceId, setFilterResourceId] = useState('');
    // Options globales (depuis backend)
    const [allProductsOptions, setAllProductsOptions] = useState([]); 
    const [allResourcesOptions, setAllResourcesOptions] = useState([]); 
    const [reservationsByHour, setReservationsByHour] = useState({});


    const reservationOptions = useMemo(() => {
        if (!Array.isArray(allMonthReservations)) return [];
        const seen = new Set();
        const opts = [];
        for (const it of allMonthReservations) {
            const id = String(it?.ID || it?.id || '');
            if (!id || seen.has(id)) continue;
            seen.add(id);
            const name = it?.meta?.product_name || it?.product_name || it?.title || `Réservation ${id}`;
            opts.push({ id, name });
        }
        return opts;
    }, [allMonthReservations]);

    const firstDayOfMonth = useMemo(() => new Date(year, month, 1), [year, month]);
    const startDay = useMemo(() => {
        const d = firstDayOfMonth.getDay();
        return (d + 6) % 7;
    }, [firstDayOfMonth]);
    const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

    const daysGrid = useMemo(() => {
        const cells = [];
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            cells.push({ key: `p-${i}`, day: prevMonthDays - i, outside: true });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ key: `c-${d}`, day: d, outside: false });
        }
        while (cells.length % 7 !== 0) {
            const next = cells.length - (startDay + daysInMonth) + 1;
            cells.push({ key: `n-${next}`, day: next, outside: true });
        }
        while (cells.length < 42) {
            const next = cells.length - (startDay + daysInMonth) + 1;
            cells.push({ key: `n2-${next}`, day: next, outside: true });
        }
        return cells;
    }, [startDay, daysInMonth, month, year]);

    const parseAnyDate = (val, withTime = false) => {
        if (val == null) return null;
        const s = String(val).trim();
        if (!s) return null;
        // Epoch seconds (10 digits or generally numeric >= 1e9)
        if (/^\d+$/.test(s)) {
            const num = Number(s);
            if (Number.isFinite(num) && num > 1e9) {
                const dt = new Date(num * 1000);
                if (!withTime) return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
                return dt;
            }
        }
        // Compact full datetime YYYYMMDDHHMMSS (14 chars)
        if (s.length === 14 && /^\d{14}$/.test(s)) {
            const y = Number(s.slice(0, 4));
            const m = Number(s.slice(4, 6)) - 1;
            const d = Number(s.slice(6, 8));
            const h = Number(s.slice(8, 10));
            const min = Number(s.slice(10, 12));
            const sec = Number(s.slice(12, 14));
            if (withTime) return new Date(y, m, d, h, min, sec);
            return new Date(y, m, d);
        }
        // Compact date YYYYMMDD (>=8)
        if (s.length >= 8 && /^\d{8}/.test(s)) {
        const y = Number(s.slice(0, 4));
        const m = Number(s.slice(4, 6)) - 1;
        const d = Number(s.slice(6, 8));
        return new Date(y, m, d);
        }
        return null;
    };

    const eachDateInRange = (start, end) => {
        const list = [];
        if (!start || !end) return list;
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        for (let dt = new Date(s); dt <= e; dt.setDate(dt.getDate() + 1)) {
            list.push(new Date(dt));
        }
        return list;
    };


    const fetchCalendar = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const requestUrl = `${url}/get-calendar-reservation-store`;
            const allDatesInMonth = Array.from({ length: daysInMonth }, (_, i) => {
                const day = String(i + 1).padStart(2, '0');
                const mm = String(month + 1).padStart(2, '0');
                return `${year}-${mm}-${day}`;
            });
            const params = {
                year: year,
                month: String(month + 1).padStart(2, '0'),
                start_date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
                end_date: `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`,
                'date[]': allDatesInMonth,
                product_id: filterProductId || "",
                resource_id: filterResourceId || ""
            };
            console.log('[fetchCalendar] filterProductId:', filterProductId, 'filterResourceId:', filterResourceId);
            console.log('[fetchCalendar] params envoyés:', params);
            const response = await axios.get(requestUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
                params
            });
            console.log('[Calendar] raw payload (month):', response?.data);
            const payload = response?.data;
            let items = [];
            if (Array.isArray(payload?.data)) items = payload.data;
            else if (Array.isArray(payload?.reservations)) items = payload.reservations;
            else if (Array.isArray(payload)) items = payload;
            else if (payload?.data && typeof payload.data === 'object') {
                const collected = [];
                for (const [dateKey, list] of Object.entries(payload.data)) {
                    if (Array.isArray(list)) {
                        for (const it of list) {
                            collected.push({ ...it, _date_key: dateKey });
                        }
                    }
                }
                items = collected;
            }
            if (Array.isArray(items) && items.length === 0) {
                console.warn('Calendar: backend returned empty list for params', params);
            }
            const map = {};
            for (const it of items) {
                const id = it?.ID || it?.id;
                const prod = it?.meta?.product_name || it?.product_name || it?.title || 'Réservation';
                const productId = String(it?.meta?._booking_product_id || it?._booking_product_id || '');
                const resourceId = String(it?.meta?._booking_resource_id || it?._booking_resource_id || '');
                const start = parseAnyDate(it?.meta?._booking_start || it?._booking_start, false);
                const end = parseAnyDate(it?.meta?._booking_end || it?._booking_end, false);
                const dates = eachDateInRange(start, end);
                for (const d of dates) {
                    if (d.getMonth() !== month || d.getFullYear() !== year) continue;
                    const key = d.getDate();
                    if (!map[key]) map[key] = [];
                    map[key].push({ id, label: prod, productId, resourceId });
                }
            }
            setEventsByDay(map);
            setAllMonthReservations(items); // <-- stocke toutes les réservations du mois
        } catch (e) {
            try {
                console.error('Calendar fetch error:', e?.response?.status, e?.response?.data || e?.message);
                const backendMsg = e?.response?.data?.message || e?.response?.data?.error || '';
                Notiflix.Notify.failure(backendMsg ? `Erreur: ${backendMsg}` : "Impossible de charger le calendrier");
            } catch {
                Notiflix.Notify.failure("Impossible de charger le calendrier");
            }
            setEventsByDay({});
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCalendar();
    }, [month, year, filterProductId, filterResourceId]);

    // Fonction utilitaire pour vérifier si deux dates sont le même jour
    const isSameDay = (date, selected) =>
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate();

    // Fonction utilitaire pour vérifier si une date est comprise dans une journée
    const isDateInDay = (date, selected) =>
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate();

    useEffect(() => {
        if (viewMode !== 'day') return;
        if (!selectedDate) return;
        const fetchDay = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const [yyyy, mm, dd] = selectedDate.split('-');
                const start = `${yyyy}${mm}${dd}000000`;
                const end = `${yyyy}${mm}${dd}235959`;
                const requestUrl = `${url}/get-calendar-reservation-store`;
                const params = {
                    start_date: start,
                    end_date: end,
                    product_id: filterProductId || "",
                    resource_id: filterResourceId || "",
                };
                console.log('params envoyés:', params);
                const response = await axios.get(requestUrl, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params
                });
                console.log('[Calendar] raw payload (day):', response?.data);
                let items = [];
                const payload = response?.data;
                if (Array.isArray(payload?.data)) items = payload.data;
                else if (Array.isArray(payload?.reservations)) items = payload.reservations;
                else if (Array.isArray(payload)) items = payload;
                else if (payload?.data && typeof payload.data === 'object') {
                    const collected = [];
                    for (const [dateKey, list] of Object.entries(payload.data)) {
                        if (Array.isArray(list)) {
                            for (const it of list) {
                                collected.push({ ...it, _date_key: dateKey });
                            }
                        }
                    }
                    items = collected;
                }
                console.log('[Calendar] day items count:', Array.isArray(items) ? items.length : 0);
                // Correction : afficher toutes les réservations qui couvrent ce jour, dans toutes les heures concernées
                const parseFull = (val) => parseAnyDate(val, true);
                const [yyyy2, mm2, dd2] = selectedDate.split('-');
                const selected = new Date(Number(yyyy2), Number(mm2) - 1, Number(dd2));
                // Filtrage principal : ne garder que celles qui couvrent ce jour
                const itemsFiltered = items.filter(ev => {
                    const start = parseFull(ev?.meta?._booking_start || ev?._booking_start);
                    const end = parseFull(ev?.meta?._booking_end || ev?._booking_end);
                    if (!start || !end) return false;
                    const allDay = ev?._booking_all_day === "1" || ev?.meta?._booking_all_day === "1";
                    const selectedStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 0, 0, 0);
                    const selectedEnd = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 23, 59, 59, 999);
                    if (allDay) {
                        // All-day: couvre toutes les heures du jour si le jour est inclus dans la plage
                        return selectedStart <= end && selectedEnd >= start;
                    }
                    // Non all-day: même logique d’inclusion de jour
                    return selectedStart <= end && selectedEnd >= start;
                });
                console.log('[Calendar] itemsFiltered count:', itemsFiltered.length);
                if (itemsFiltered.length > 0) {
                    const s0 = parseFull(itemsFiltered[0]?.meta?._booking_start || itemsFiltered[0]?._booking_start);
                    const e0 = parseFull(itemsFiltered[0]?.meta?._booking_end || itemsFiltered[0]?._booking_end);
                    console.log('[Calendar] first filtered parsed start/end:', s0, e0);
                }
                setDayReservations(itemsFiltered);
  
                    // Si all day, on l'affiche dans toutes les heures              const byHour = {};
                for (let h = 0; h < 24; h++) byHour[h] = [];
                itemsFiltered.forEach(ev => {
                    const start = parseFull(ev?.meta?._booking_start || ev?._booking_start);
                    const end = parseFull(ev?.meta?._booking_end || ev?._booking_end);
                    if (!start || !end) return;
                    const allDay = ev?._booking_all_day === "1" || ev?.meta?._booking_all_day === "1";
                    if (allDay) {
                        for (let h = 0; h < 24; h++) byHour[h].push(ev);
                    } else {
                        const selectedStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 0, 0, 0);
                        const selectedEnd = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 23, 59, 59, 999);
                        const visibleStart = start < selectedStart ? selectedStart : start;
                        const visibleEnd = end > selectedEnd ? selectedEnd : end;
                        let startHour = visibleStart.getHours();
                        let endHour = Math.max(startHour, visibleEnd.getHours());
                        for (let h = startHour; h <= endHour; h++) {
                            byHour[h].push(ev);
                        }
                    }
                });
                setReservationsByHour(byHour);
            } catch (e) {
                setDayReservations([]);
                setReservationsByHour({});
            } finally {
                setLoading(false);
            }
        };
        fetchDay();
    }, [selectedDate, viewMode, filterProductId, filterResourceId]);

    const handlePrevMonth = () => {
        const newMonth = month - 1;
        if (newMonth < 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(newMonth);
        }
    };
    const handleNextMonth = () => {
        const newMonth = month + 1;
        if (newMonth > 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(newMonth);
        }
    };
    const handlePrevDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    };
    const handleNextDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    };
    const yearsRange = useMemo(() => {
        const base = today.getFullYear();
        return Array.from({ length: 11 }, (_, i) => base - 5 + i);
    }, [today]);
    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const token = localStorage.getItem('token');
                // Produits réservables
                const prodResp = await axios.get(`${url}/products/getAllProductBooking`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const prodItems = prodResp?.data?.products || prodResp?.data || [];
                const prodOptions = Array.isArray(prodItems)
                    ? prodItems.map(p => {
                        const id = String(p?.id || p?.ID || '');
                        const name = p?.post_title || p?.name || p?.title || p?.post_name || (id ? `Produit ${id}` : 'Produit');
                        return { id, name };
                    })
                    : [];
                setAllProductsOptions(prodOptions.filter(o => o.id));
            } catch (e) {
                setAllProductsOptions([]);
            }
            try {
                const token = localStorage.getItem('token');
                const resResp = await axios.get(`${url}/resources`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let resList = [];
                if (Array.isArray(resResp?.data?.resources)) resList = resResp.data.resources;
                else if (Array.isArray(resResp?.data)) resList = resResp.data;
                else if (resResp?.data && typeof resResp.data === 'object') resList = [resResp.data];
                const resOptions = resList.map(r => ({ id: String(r?.id || r?.ID || r?._id || ''), name: r?.name || r?.post_title || `Ressource ${r?.id}` }));
                setAllResourcesOptions(resOptions.filter(o => o.id));
            } catch (e) {
                setAllResourcesOptions([]);
            }
        };
        fetchFiltersData();
    }, [url]);
    // Helpers pour la sélection jour/mois/année
    const selectedDay = Number(selectedDate.split('-')[2]);
    const selectedMonth = Number(selectedDate.split('-')[1]) - 1;
    const selectedYear = Number(selectedDate.split('-')[0]);
    const daysInSelectedMonth = useMemo(() => new Date(selectedYear, selectedMonth + 1, 0).getDate(), [selectedYear, selectedMonth]);
    const daysList = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

    // Utilitaire pour grouper les réservations par heure de début
    function groupReservationsByHour(reservations, selected) {
        const parseFull = (val) => parseAnyDate(val, true);
        const byHour = {};
        for (let h = 0; h < 24; h++) byHour[h] = [];
        reservations.forEach(ev => {
            const start = parseFull(ev?.meta?._booking_start || ev?._booking_start);
            if (!start) return;
            if (
                start.getFullYear() === selected.getFullYear() &&
                start.getMonth() === selected.getMonth() &&
                start.getDate() === selected.getDate()
            ) {
                byHour[start.getHours()].push(ev);
            }
        });
        return byHour;
    }

    return (
        <div className="w-full min-h-[70vh] bg-white rounded-xl shadow border border-gray-200 p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-2">Calendrier</h2>
            {viewMode === 'month' ? (
                <>
                    <p className="text-gray-600 mb-4">Réservations par mois</p>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Filtrer les réservations</span>
                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={filterProductId}
                                onChange={(e) => setFilterProductId(e.target.value)}
                            >
                                <option value="">Tous les reservations</option>
                                {allProductsOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                ))}
                            </select>
                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={filterResourceId}
                                onChange={(e) => setFilterResourceId(e.target.value)}
                            >
                                <option value="">Toutes les ressources</option>
                                {allResourcesOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-2 py-1 border rounded" onClick={handlePrevMonth}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <select className="border rounded px-2 py-1" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                                {monthNamesFr.map((m, idx) => (
                                    <option key={m} value={idx}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                                ))}
                            </select>
                            <select className="border rounded px-2 py-1" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                                {yearsRange.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <button className="px-2 py-1 border rounded" onClick={handleNextMonth}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
                                </svg>
                            </button>
                        </div>
                        <div>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => setViewMode('day')}>Voir les jours</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs md:text-sm font-semibold text-gray-600 border-b pb-2">
                        <div>lundi</div>
                        <div>mardi</div>
                        <div>mercredi</div>
                        <div>jeudi</div>
                        <div>vendredi</div>
                        <div>samedi</div>
                        <div>dimanche</div>
                    </div>
                    {loading ? (
                        <div className="w-full py-16 flex items-center justify-center">
                            <ClipLoader color="#3b82f6" size={48} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2 md:gap-3 mt-3 min-h-[60vh]">
                            {daysGrid.map((cell) => (
                                <div
                                    key={cell.key}
                                    className={`border rounded p-2 md:p-3 h-24 md:h-40 overflow-auto ${cell.outside ? 'bg-gray-50 text-gray-400' : 'bg-white'} hover:shadow`}
                                >
                                    <div className="text-right font-medium">{cell.day.toString().padStart(2, '0')}</div>
                                    {!cell.outside && eventsByDay[cell.day] && (
                                        <div className="mt-2 space-y-1">
                                            {eventsByDay[cell.day]
                                                .map((ev, idx) => (
                                                <button
                                                    key={`${ev.id}-${idx}`}
                                                    onClick={() => navigate(`/reservation/detail/${ev.id}`)}
                                                    className="w-full text-left text-xs md:text-sm px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 truncate"
                                                    title={ev.label}
                                                >
                                                    {ev.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <p className="text-gray-600 mb-4">Réservations par jour</p>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Filtrer les réservations</span>
                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={filterProductId}
                                onChange={(e) => setFilterProductId(e.target.value)}
                            >
                                <option value="">Tous les reservations</option>
                                {allProductsOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                ))}
                            </select>
                            <select
                                className="border rounded px-2 py-1 text-sm"
                                value={filterResourceId}
                                onChange={(e) => setFilterResourceId(e.target.value)}
                            >
                                <option value="">Toutes les ressources</option>
                                {allResourcesOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-2 py-1 border rounded" onClick={handlePrevDay}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <select
                                className="border rounded px-2 py-1"
                                value={selectedDay}
                                onChange={e => {
                                    const newDay = String(e.target.value).padStart(2, '0');
                                    setSelectedDate(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${newDay}`);
                                }}
                            >
                                {daysList.map((d) => (
                                    <option key={d} value={d}>{d.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                            <select
                                className="border rounded px-2 py-1"
                                value={selectedMonth}
                                onChange={e => {
                                    const newMonth = Number(e.target.value);
                                    const newDay = Math.min(selectedDay, new Date(selectedYear, newMonth + 1, 0).getDate());
                                    setSelectedDate(`${selectedYear}-${String(newMonth + 1).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`);
                                }}
                            >
                                {monthNamesFr.map((m, idx) => (
                                    <option key={m} value={idx}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                                ))}
                            </select>
                            <select
                                className="border rounded px-2 py-1"
                                value={selectedYear}
                                onChange={e => {
                                    const newYear = Number(e.target.value);
                                    const newDay = Math.min(selectedDay, new Date(newYear, selectedMonth + 1, 0).getDate());
                                    setSelectedDate(`${newYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`);
                                }}
                            >
                                {yearsRange.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <button className="px-2 py-1 border rounded" onClick={handleNextDay}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
                                </svg>
                            </button>
                        </div>
                        <div>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => setViewMode('month')}>Voir les mois</button>
                        </div>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="w-full py-16 flex items-center justify-center">
                                <ClipLoader color="#3b82f6" size={48} />
                            </div>
                        ) : (
                            (() => {
                                if (viewMode !== 'day') return null;
                                const [yyyy, mm, dd] = selectedDate.split('-');
                                const selected = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
                                const filtered = dayReservations;
                                // Appliquer filtres produit / ressource
                                const filteredBySelect = filtered;
                                // Parser epoch seconds ou format compact YYYYMMDDHHMMSS
                                const parseFull = (val) => parseAnyDate(val, true);
                                // Ne garder que les réservations qui couvrent le jour sélectionné
                                const coversSelectedDay = (start, end) => {
                                    if (!start || !end) return false;
                                    const dayStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
                                    const dayEnd = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 23, 59, 59, 999);
                                    return end >= dayStart && start <= dayEnd;
                                };
                                const segments = filteredBySelect
                                    .map(ev => {
                                        const start = parseFull(ev?.meta?._booking_start || ev?._booking_start);
                                        const end = parseFull(ev?.meta?._booking_end || ev?._booking_end);
                                        if (!coversSelectedDay(start, end)) return null;
                                        const id = ev?.ID || ev?.id;
                                        const label = ev?.meta?.product_name || ev?.product_name || ev?.title || 'Réservation';
                                        const allDay = ev?._booking_all_day === "1" || ev?.meta?._booking_all_day === "1";
                                        // Heure début/fin clampées au jour sélectionné
                                        let startHour = 0;
                                        let endHour = 23;
                                        if (!allDay) {
                                            const dayStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 0, 0, 0);
                                            const dayEnd = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 23, 59, 59, 999);
                                            const visibleStart = start < dayStart ? dayStart : start;
                                            const visibleEnd = end > dayEnd ? dayEnd : end;
                                            startHour = visibleStart.getHours();
                                            endHour = Math.max(startHour, visibleEnd.getHours());
                                            if (endHour < startHour) endHour = startHour; // garde-fou
                                        }
                                        return { id, label, startHour, endHour };
                                    })
                                    .filter(Boolean);
                                const hours = Array.from({ length: 24 }, (_, i) => i);
                                const ROW_PX = 32; // h-8
                                return (
                                    <div>
                                        {/* Conteneur scrollable (X et Y) */}
                                        <div className="max-h-[70vh] overflow-y-auto overflow-x-auto pr-2 relative">
                                            {/* Ligne: colonne heures (flex-1) + colonne réservations (étroite) */}
                                            <div className="flex w-full min-w-[420px]">
                                                {/* Colonne des heures sticky, largeur fixe */}
                                                <div className="w-14 sticky left-0 bg-white z-10">
                                                    {hours.map((h) => (
                                                        <div key={h} className="h-8 flex items-center text-[11px] text-gray-500 border-b pr-2">{h.toString().padStart(2, '0')}h</div>
                                                    ))}
                                                </div>
                                                {/* Colonne des réservations, prend le reste et commence juste à côté des heures */}
                                                <div className="relative flex-1">
                                                    {/* Lignes continues sur la colonne réservations pour aligner avec les heures */}
                                                    <div className="flex flex-col pointer-events-none select-none">
                                                        {hours.map((h) => (
                                                            <div key={h} className="h-8 border-b" />
                                                        ))}
                                                    </div>
                                                    {/* Barres des réservations */}
                                                    <div className="absolute inset-0 z-20">
                                                        {/* Debug: compteur de segments */}
                                                        {segments.length > 0 && (
                                                            <div className="absolute top-0 right-1 text-[10px] text-red-600 bg-white/70 px-1 rounded z-50">{`segments: ${segments.length}`}</div>
                                                        )}
                                                        {segments.map((seg, idx) => {
                                                            const top = seg.startHour * ROW_PX;
                                                            const height = Math.max(ROW_PX, (seg.endHour - seg.startHour + 1) * ROW_PX);
                                                            return (
                                                                <button
                                                                    key={`${seg.id}-${idx}`}
                                                                    onClick={() => navigate(`/reservation/detail/${seg.id}`)}
                                                                    className="absolute rounded bg-blue-500/90 hover:bg-blue-600 border border-blue-700 text-white text-[13px] px-2 py-1 text-left overflow-hidden shadow flex flex-col justify-start items-start z-30"
                                                                    style={{ top: `${top}px`, height: `${height}px`, left: `8px`, right: `8px` }}
                                                                    title={seg.label}
                                                                >
                                                                    <div className="font-medium leading-tight self-start">{seg.label}</div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
