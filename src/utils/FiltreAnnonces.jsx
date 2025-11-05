import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { url } from "../contextes/UrlContext";

export default forwardRef(function FiltreAnnonces({ onFiltrer, onPaginationChange, currentPage: parentPage = 1, selectedIds = [], onApplyAction, displayedData = [], rawData = [], onLoadingChange }, ref) {
  const navigate = useNavigate();
  const location = useLocation();
  const [titre, setTitre] = useState("");
  const [status, setStatus] = useState(""); // '' | 'read' | 'unread'
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(parentPage);
  const [lastPage, setLastPage] = useState(1);
  const [groupAction, setGroupAction] = useState("");

  useImperativeHandle(ref, () => ({})); // Placeholder for future group actions

  useEffect(() => {
    const sp = new URLSearchParams((location.search || "").replace(/^\?/, ""));
    setTitre(sp.get("titre") || "");
    setStatus(sp.get("status") || "");
    setDateStart(sp.get("dateStart") || "");
    setDateEnd(sp.get("dateEnd") || "");
  }, [location.search, location.pathname]);

  // Appliquer automatiquement les filtres présents dans l'URL au montage
  useEffect(() => {
    const sp = new URLSearchParams((location.search || "").replace(/^\?/, ""));
    filterByParams({
      titre: sp.get("titre") || "",
      status: sp.get("status") || "",
      dateStart: sp.get("dateStart") || "",
      dateEnd: sp.get("dateEnd") || "",
      // ne pas forcer la première page ici
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function filterByParams(overrides = {}) {
    try {
      if (typeof onLoadingChange === 'function') onLoadingChange(true);
      const selectedTitre = overrides.titre ?? titre;
      const selectedStatus = overrides.status ?? status;
      const selectedDateStart = overrides.dateStart ?? dateStart;
      const selectedDateEnd = overrides.dateEnd ?? dateEnd;
      const forceFirstPage = overrides.forceFirstPage ?? false;
      const match = location.pathname.match(/^(.*?)(?:\/page\/(\d+))\/?$/);
      const basePath = match ? match[1] || "/" : location.pathname;
      const currentPageFromPath = match ? parseInt(match[2], 10) : 1;
      const pageNumber = forceFirstPage ? 1 : (overrides.page ?? currentPageFromPath);
      const rawSearchParams = {
        titre: selectedTitre || "",
        status: selectedStatus || "",
        dateStart: selectedDateStart || "",
        dateEnd: selectedDateEnd || "",
        page: pageNumber
      };
      const searchParams = Object.fromEntries(
        Object.entries(rawSearchParams).filter(([_, v]) => v !== "" && v != null)
      );
      const newSearch = new URLSearchParams(searchParams).toString();
      const desiredPathname = forceFirstPage ? basePath : location.pathname;
      const needPathChange = desiredPathname !== location.pathname;
      const needSearchChange = newSearch !== (location.search || "").replace(/^\?/, "");
      if (needPathChange || needSearchChange) {
        navigate({ pathname: desiredPathname, search: newSearch ? `?${newSearch}` : "" }, { replace: true });
      }
      const token = localStorage.getItem("token");
      const apiParams = {
        titre: searchParams.titre,
        status: searchParams.status,
        dateStart: searchParams.dateStart,
        dateEnd: searchParams.dateEnd,
        page: pageNumber
      };
      const response = await axios.get(`${url}/get_all_communique`, {
        params: apiParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiData = response.data;
      const list = Array.isArray(apiData?.annoucement?.data)
        ? apiData.annoucement.data
        : [];
      const cleaned = list.filter((it) => it && it.post);

      const current = apiData?.annoucement?.current_page || pageNumber;
      const last = apiData?.annoucement?.last_page ?? 1;
      setCurrentPage(Number(current) || 1);
      setLastPage(Number(last) || 1);
      if (onFiltrer) {
        onFiltrer(cleaned, Number(current) || 1, Number(last) || 1);
      }
      if (onPaginationChange) onPaginationChange({ currentPage: Number(current) || 1, lastPage: Number(last) || 1 });
    } catch (error) {
      if (onFiltrer) onFiltrer([], 1, 1);
      if (onPaginationChange) onPaginationChange({ currentPage: 1, lastPage: 1 });
    } finally {
      if (typeof onLoadingChange === 'function') onLoadingChange(false);
    }
  }

  const handleApply = () => {
    filterByParams({ forceFirstPage: true });
  };
  const handleReset = () => {
    setTitre("");
    setStatus("");
    setDateStart("");
    setDateEnd("");
    const basePath = (location.pathname || "").replace(/\/page\/[0-9]+\/?$/, "");
    navigate({ pathname: basePath, search: "" }, { replace: true });
    filterByParams({ titre: "", status: "", dateStart: "", dateEnd: "", forceFirstPage: true });
  };
  // Actions groupées (delete, mark_read)
  const handleGroupAction = async () => {
    if (!groupAction) return alert('Veuillez choisir une action.');
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) return alert('Veuillez sélectionner au moins une annonce.');
    const token = localStorage.getItem("token");
    try {
      if (groupAction === 'delete') {
        await axios.delete(`${url}/communicate/bulk-delete`, { data: { annonces_ids: selectedIds }, headers: { Authorization: `Bearer ${token}` } });
      }
      if (groupAction === 'mark_read') {
        await axios.post(`${url}/communicate/bulk-read`, { annonces_ids: selectedIds }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setGroupAction("");

      filterByParams({ forceFirstPage: true });
    } catch (e) {
      alert("Erreur lors de l'action groupée");
    }
  };
  return (
    <div className="mb-6 relative z-0 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
      <div className="w-full sm:w-auto flex flex-wrap gap-4 items-center">
        {/* Titre */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            className="p-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none"
            placeholder="Titre de l'annonce"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        </div>
        {/* Statut */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">Statut</label>
          <select
            className="p-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Toutes</option>
            <option value="read">Lue</option>
            <option value="unread">Non lue</option>
          </select>
        </div>
        {/* Date intervalle */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1">Intervalle de date</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              className="p-2 border rounded-lg text-sm flex-grow min-w-0 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
            <span className="text-center text-gray-500 sm:pt-2">à</span>
            <input
              type="date"
              className="p-2 border rounded-lg text-sm flex-grow min-w-0 focus:ring-2 focus:ring-pink-400 focus:outline-none"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
        </div>
        {/* Boutons Filtrer / Reset */}
        <div className="flex gap-2 mt-6">
          <button
            className="bg-gradient-to-r from-pink-500 to-red-400 hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg w-full transition-all duration-200"
            type="button"
            onClick={handleApply}
          >
            Filtrer
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg w-full transition-all duration-200"
            type="button"
            onClick={handleReset}
          >
            Réinitialiser
          </button>
        </div>
        {/* Actions groupées */}
        <div className="flex flex-col sm:flex-row gap-2 mt-6 items-center w-full sm:w-auto">
          <span className="text-sm text-gray-600 w-full sm:w-auto">Sélection: {Array.isArray(selectedIds) ? selectedIds.length : 0}</span>
          <select
            className="p-2 border rounded-lg text-sm w-full sm:w-auto"
            value={groupAction}
            onChange={(e) => setGroupAction(e.target.value)}
          >
            <option value="">-- Actions groupées --</option>
            <option value="delete">Supprimer</option>
            <option value="mark_read">Marquer comme lue</option>
          </select>
          <button
            type="button"
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
            onClick={handleGroupAction}
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
});


