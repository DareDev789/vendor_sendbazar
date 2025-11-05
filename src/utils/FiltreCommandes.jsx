import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { FaUser, FaFilter, FaSortAmountDown, FaCalendarAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { url } from "../contextes/UrlContext";
import Notiflix from 'notiflix';
import { exportJsonToXlsx, fetchAllCommandes, exportCommandesXlsx, exportCommandesXlsxFR, exportCommandesExcelJSFR } from './ExportFichierXl';

export default forwardRef(function FiltreCommandes({ onFiltrer, onPaginationChange, currentPage: parentPage = 1, selectedIds = [], onApplyAction, displayedData = [], rawData = [] }, ref) {
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState("");
  const [ordre, setOrdre] = useState("desc");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [currentPage, setCurrentPage] = useState(parentPage);
  const [lastPage, setLastPage] = useState(1);
  const [groupAction, setGroupAction] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    client: "",
    ordre: "desc",
    dateStart: "",
    dateEnd: ""
  });
  useImperativeHandle(ref, () => ({
    applyGroupAction: async (action, ids) => {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${url}/commandes/bulk-statut`,
          {
            commande_ids: ids,
            post_status: action,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        Notiflix.Notify.success("Statut mis à jour avec succès !");
        await filterByParams({ page: currentPage });
      } catch (error) {
        console.error("[FiltreCommandes] Erreur lors de l'application de l'action groupée :", error);
        Notiflix.Notify.failure('Erreur lors de la mise à jour du statut.');
      }
    }
  }));
  useEffect(() => {
    const sp = new URLSearchParams((location.search || "").replace(/^\?/, ""));
    const urlClient = sp.get("client") || "";
    const urlOrdre = sp.get("ordre") || "desc";
    const urlDateStart = sp.get("dateStart") || "";
    const urlDateEnd = sp.get("dateEnd") || "";
    setClient(urlClient);
    setOrdre(urlOrdre);
    setDateStart(urlDateStart);
    setDateEnd(urlDateEnd);
  }, [location.search, location.pathname]);

  // Fonction principale de filtrage avec appel API et synchro URL
  async function filterByParams(overrides = {}) {
    try {
    const selectedClient = overrides.client ?? client;
    const selectedOrdre = overrides.ordre ?? ordre;
    const selectedDateStart = overrides.dateStart ?? dateStart;
    const selectedDateEnd = overrides.dateEnd ?? dateEnd;
      const forceFirstPage = overrides.forceFirstPage ?? false;
      const match = location.pathname.match(/^(.*?)(?:\/page\/(\d+))\/?$/);
      const basePath = match ? match[1] || "/" : location.pathname;
      const currentPageFromPath = match ? parseInt(match[2], 10) : 1;
      const pageNumber = forceFirstPage ? 1 : (overrides.page ?? currentPageFromPath);
    // Ne pas inclure 'ordre' dans l'URL si c'est la valeur par défaut 'desc'
    const rawSearchParams = {
      client: selectedClient || "",
      ordre: selectedOrdre !== 'desc' ? selectedOrdre : "",
      dateStart: selectedDateStart || "",
      dateEnd: selectedDateEnd || "",
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
        client: searchParams.client,
        ordre: selectedOrdre || 'desc',
        dateStart: searchParams.dateStart,
        dateEnd: searchParams.dateEnd,
        page: pageNumber
      };
      const response = await axios.get(`${url}/mes-commandes`, {
        params: apiParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiData = response.data;
      const list = Array.isArray(apiData?.allcommandes)
        ? apiData.allcommandes
        : Array.isArray(apiData?.data)
        ? apiData.data
        : Array.isArray(apiData)
        ? apiData
        : Array.isArray(apiData?.allcommandes?.data)
        ? apiData.allcommandes.data
        : [];
      const current = (
        apiData?.current_page ??
        apiData?.allcommandes?.current_page ??
        apiData?.data?.current_page ??
        pageNumber
      );
      const last = (
        apiData?.last_page ??
        apiData?.allcommandes?.last_page ??
        apiData?.data?.last_page ??
        1
      );
      setFilteredCommandes(list);
      setCurrentPage(Number(current) || 1);
      setLastPage(Number(last) || 1);
      if (onFiltrer) {
        onFiltrer(list, Number(current) || 1, Number(last) || 1);
      }
      if (onPaginationChange) onPaginationChange({ currentPage: Number(current) || 1, lastPage: Number(last) || 1 });
    } catch (error) {
      console.error("[FiltreCommandes] Erreur lors du filtrage des commandes:", error);
      setFilteredCommandes([]);
      if (onFiltrer) onFiltrer([], 1, 1);
      if (onPaginationChange) onPaginationChange({ currentPage: 1, lastPage: 1 });
    }
  }
  // Exporter uniquement la page courante (données déjà chargées)
  const exportCurrentPageXLSX = async () => {
    // Utiliser les données brutes de l'API pour la page courante afin d'exporter tous les champs
    const pageData = (Array.isArray(rawData) && rawData.length > 0)
      ? rawData
      : (Array.isArray(filteredCommandes) && filteredCommandes.length > 0 ? filteredCommandes : (Array.isArray(displayedData) ? displayedData : []));
    if (pageData.length === 0) {
      Notiflix.Notify.warning('Aucune commande sur cette page.');
      return;
    }
    try {
      await exportCommandesExcelJSFR({ commandes: pageData, fileName: 'commandes.xlsx' });
      Notiflix.Notify.success('Export de la page actuel terminé.');
    } catch (e) {
      console.error('[Export XLSX] Erreur:', e);
      Notiflix.Notify.failure("L'export a échoué.");
    }
  };

  // Exporter uniquement les éléments sélectionnés sur la page courante
  const exportFilteredSelectionXLSX = async () => {
    const pageData = (Array.isArray(rawData) && rawData.length > 0)
      ? rawData
      : (Array.isArray(filteredCommandes) && filteredCommandes.length > 0 ? filteredCommandes : (Array.isArray(displayedData) ? displayedData : []));
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      Notiflix.Notify.warning('Veuillez sélectionner au moins une commande.');
      return;
    }
    const subset = pageData.filter((cmd) => selectedIds.includes(cmd?.id));
    if (subset.length === 0) {
      Notiflix.Notify.warning('Aucune commande sélectionnée sur cette page.');
      return;
    }
    try {
      await exportCommandesExcelJSFR({ commandes: subset, fileName: 'commandes_filtrees.xlsx' });
      Notiflix.Notify.success('Export des commandes sélectionnées terminé.');
    } catch (e) {
      console.error('[Export XLSX Filtré] Erreur:', e);
      Notiflix.Notify.failure("L'export filtré a échoué.");
    }
  };
  // Ancienne fonction (export toutes pages) remplacée par export de la page courante

  const handleApply = () => {
    filterByParams({ forceFirstPage: true });
  };
  const handleReset = () => {
    setClient("");
    setOrdre("desc");
    setDateStart("");
    setDateEnd("");
    const basePath = (location.pathname || "").replace(/\/page\/[0-9]+\/?$/, "");
    navigate({ pathname: basePath, search: "" }, { replace: true });
    // Appeler l'API avec les valeurs par défaut
    filterByParams({ client: "", ordre: "desc", dateStart: "", dateEnd: "", forceFirstPage: true });
  };

  return (
    <div className="mb-6 relative z-0 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
      {/* Filtres + Actions groupées dans la même barre */}
      <div className="w-full sm:w-auto flex flex-wrap gap-4 items-center">
        {/* Client */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            Client
          </label>
          <input
            type="text"
            className="p-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none"
            placeholder="Nom du client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />
        </div>
        {/* Ordre */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            Ordre
          </label>
          <select
            className="p-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-pink-400 focus:outline-none"
            value={ordre}
            onChange={(e) => setOrdre(e.target.value)}
          >
            <option value="asc">Ascendant</option>
            <option value="desc">Descendant</option>
          </select>
        </div>
        {/* Date */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
            Intervalle de date
          </label>
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
        {/* Actions Filtrer / Reset */}
        <div className="flex gap-2 mt-6">
          <button
            className="bg-gradient-to-r from-pink-500 to-red-400 hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg w-full transition-all duration-200"
            onClick={handleApply}
            type="button"
          >
            Filtrer
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg w-full transition-all duration-200"
            onClick={handleReset}
            type="button"
          >
            Réinitialiser
          </button>
        </div>
        {/* Actions groupées */}
        <div className="flex flex-col sm:flex-row gap-2 mt-6 items-center w-full sm:w-auto">
          {(() => {
            // Déterminer si des filtres sont actifs pour renommer le bouton d'export
            const hasActiveFilters = Boolean((client && client.trim()) || (dateStart && dateStart.trim()) || (dateEnd && dateEnd.trim()) || (ordre && ordre !== 'desc'));
            const exportAllLabel = hasActiveFilters ? 'Export filtré' : 'Export tout';
            return null;
          })()}
          <span className="text-sm text-gray-600 w-full sm:w-auto">Sélection: {Array.isArray(selectedIds) ? selectedIds.length : 0}</span>
          <select
            className="p-2 border rounded-lg text-sm w-full sm:w-auto"
            value={groupAction}
            onChange={(e) => setGroupAction(e.target.value)}
          >
            <option value="">-- Actions groupées --</option>
            <option value="wc-pending">Changer en attente</option>
            <option value="wc-processing">Changer en cours</option>
            <option value="wc-completed">Changer en terminée</option>
            <option value="wc-cancelled">Changer en annulée</option>
            <option value="wc-refunded">Changer en remboursée</option>
            <option value="wc-failed">Changer en échoué</option>
            <option value="wc-draft">Changer en brouillon</option>
            <option value="wc-trash">Changer en supprimée</option>
          </select>
          <button
            type="button"
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
            onClick={async () => {
              if (!groupAction) return Notiflix.Notify.warning('Veuillez choisir une action.');
              if (!Array.isArray(selectedIds) || selectedIds.length === 0) return Notiflix.Notify.warning('Veuillez sélectionner au moins une commande.');
              if (typeof onApplyAction === 'function') {
                await onApplyAction(groupAction, selectedIds);
                setGroupAction("");
              } else if (ref && typeof ref.current?.applyGroupAction === 'function') {
                await ref.current.applyGroupAction(groupAction, selectedIds);
                setGroupAction("");
              }
            }}
          >
            Appliquer
          </button>
          {/* Boutons Export tout / Export filtré */}
          {(() => {
            const hasActiveFilters = Boolean((client && client.trim()) || (dateStart && dateStart.trim()) || (dateEnd && dateEnd.trim()) || (ordre && ordre !== 'desc'));
            const exportAllLabel = hasActiveFilters ? 'Export filtré' : 'Export tout';
            return (
          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
            style={{ minWidth: 110 }}
            onClick={exportCurrentPageXLSX}
          >
            {exportAllLabel}
          </button>
            );
          })()}
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
            style={{ minWidth: 110 }}
            onClick={exportFilteredSelectionXLSX}
          >
            Export sélectionné
          </button>
        </div>
      </div>
    </div>
  );
})
