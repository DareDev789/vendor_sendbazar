import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import TableauActionGroup from "../../utils/TableauActionGroup";
import axios from "axios";
import nProgress from "nprogress";
import Notiflix from 'notiflix';
import { url } from '../../contextes/UrlContext';
import { motion } from "framer-motion";
import ClipLoader from 'react-spinners/ClipLoader';
import PaginationProduct from "../../utils/PaginationProduct";
import FiltreCommandes from "../../utils/FiltreCommandes";
import { useDevise } from '../../contextes/DeviseContext';

function traduireStatut(statut) {
  const statusMap = {
    'wc-pending': 'En attente',
    'wc-processing': 'En cours',
    'wc-on-hold': 'En attente',
    'wc-completed': 'Terminée',
    'wc-cancelled': 'Annulée',
    'wc-refunded': 'Remboursée',
    'wc-failed': 'Échoué',
    'wc-draft': 'Brouillon',
    'wc-trash': 'Supprimée',
    // Ajout des statuts sans préfixe wc-
    'pending': 'En attente',
    'processing': 'En cours',
    'on-hold': 'En attente',
    'completed': 'Terminée',
    'cancelled': 'Annulée',
    'refunded': 'Remboursée',
    'failed': 'Échoué',
    'draft': 'Brouillon',
    'trash': 'Supprimée',
  };
  return statusMap[statut] || statut || 'Autre';
}
function formatCommandes(liste) {
  return (liste || []).map(cmd => ({
    id: cmd.id,
    code: `#CMD${String(cmd.id).padStart(3, '0')}`,
    total: cmd.total,
    revenus: cmd.revenus,
    statut: traduireStatut(cmd.statut),
    client: cmd.client?.trim() || '',
    date: cmd.date?.split(' ')[0] || ''
  }));
}
export default function IndexCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [rawCommandes, setRawCommandes] = useState([]);
  const [ongletActif, setOngletActif] = useState('Toutes');
  const [load, setLoad] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const { page } = useParams();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const link = '/commandes/';
  const filtreRef = useRef(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1
  });

  const { devise, listDevise } = useDevise();
  // Fonction pour regrouper les commandes par statut
  const regroupByStatus = (liste) => {
    const data = {
      'En attente': [],
      'En cours': [],
      'Terminée': [],
      'Annulée': [],
      'Remboursée': [],
      'Supprimée': [],
      'Échoué': [],
      'Brouillon': []
    };
    liste.forEach(cmd => {
      const statut = traduireStatut(cmd.statut);
      if (data[statut]) data[statut].push(cmd);
    });
    return data;
  };
  const getOnglets = () => {
    const dataCommandes = regroupByStatus(commandes);
    const all = commandes;
    return [
      { key: 'Toutes', label: `Toutes (${all.length})` },
      ...Object.entries(dataCommandes).map(([key, value]) => ({
        key,
        label: `${key} (${value.length})`
      }))
    ];
  };
  const onglets = getOnglets();
  const [selectedIds, setSelectedIds] = useState([]);
  const handleOngletChange = (key) => {
    setOngletActif(key);
  };
  const commandesAffichees = ongletActif === 'Toutes'
    ? commandes
    : commandes.filter(cmd => traduireStatut(cmd.statut) === ongletActif);
  const statutCouleurs = {
    'En attente': 'bg-yellow-500',
    'En cours': 'bg-blue-500',
    'Terminée': 'bg-green-500',
    'Annulée': 'bg-gray-500',
    'Remboursée': 'bg-purple-500',
    'Échoué': 'bg-red-500',
    'Brouillon': 'bg-gray-400',
    'Supprimée': 'bg-gray-500',
  };
  const colonnes = [
    { key: "code", label: "Commande" },
    { key: "total", label: "Total" },
    { key: "revenus", label: "Revenus" },
    {
      key: "statut",
      label: "Statut",
      render: (item) => (
        (() => {
          const statutTraduit = traduireStatut(item?.statut);
          const colorClass = statutCouleurs[statutTraduit] || 'bg-gray-500';
          return (
            <motion.span
              className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded ${colorClass}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {statutTraduit}
            </motion.span>
          );
        })()
      )
    },
    { key: "client", label: "Client" },
    { key: "date", label: "Date" },
    {
      key: "action",
      label: "Action",
      render: (item) => {
        const sp = new URLSearchParams((location.search || '').replace(/^\?/, ''));
        if (ongletActif !== 'Toutes') {
          sp.set('onglet', ongletActif);
        } else {
          sp.delete('onglet');
        }
        const searchStr = sp.toString();
        const toHref = searchStr ? `/commandes/${item.id}?${searchStr}` : `/commandes/${item.id}`;
        return (
          <Link
            to={toHref}
            className="text-pink-600 hover:underline"
          >
            Voir
          </Link>
        );
      }
    }
  ];
  const actionOptions = [
    { value: "wc-pending", label: "Changer en attente" },
    { value: "wc-processing", label: "Changer en cours" },
    { value: "wc-completed", label: "Changer en terminée" },
    { value: "wc-cancelled", label: "Changer en annulée" },
    { value: "wc-refunded", label: "Changer en remboursée" },
    { value: "wc-failed", label: "Changer en échoué" },
    { value: "wc-draft", label: "Changer en brouillon" },
    { value: "wc-trash", label: "Changer en supprimée" },
  ];
  const fetchData = async () => {
    setLoad(true);
    let link;
    if (page) {
      link = `${url}/mes-commandes?page=${page}`;
    } else {
      link = `${url}/mes-commandes`;
    }
    try {
      nProgress.start();
      const response = await axios.get(link, {
        params: { ordre: 'desc' },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = response.data || {};
      const list = data.allcommandes || [];
      const current = data?.pagination?.current_page || Number(page) || 1;
      const lastPageValue = data?.pagination?.last_page ?? 10;
      setPagination({ currentPage: current, lastPage: lastPageValue });
      setRawCommandes(list);
      setCommandes(formatCommandes(list).sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error);
    } finally {
      nProgress.done();
      setLoad(false);
    }
  };
  useEffect(() => {
    const hasFilters = (location.search || "").replace(/^\?/, "").length > 0;
    if (!hasFilters) {
      fetchData();
    }
  }, [page]);

  useEffect(() => {
    const search = (location.search || "").replace(/^\?/, "");
    const hasFilters = search.length > 0;
    if (!hasFilters) return;
    const sp = new URLSearchParams(search);
    const match = location.pathname.match(/\/page\/(\d+)/);
    const pageFromPath = match ? parseInt(match[1], 10) : 1;
    const params = {
      client: sp.get("client") || " ",
      ordre: sp.get("ordre") || " ",
      dateStart: sp.get("dateStart") || " ",
      dateEnd: sp.get("dateEnd") || " ",
      page: pageFromPath || 1,
    };
    (async () => {
      try {
        setLoad(true);
        nProgress.start();
        const response = await axios.get(`${url}/mes-commandes`, {
          params,
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = response.data || {};
        const list = data.allcommandes || [];
        const current = data?.pagination?.current_page || pageFromPath || 1;
        const lastPageValue = data?.pagination?.last_page ?? 10;
        setRawCommandes(list);
        setCommandes(formatCommandes(list));
        setPagination({ currentPage: Number(current) || 1, lastPage: lastPageValue });
      } catch (e) {
        console.error('[IndexCommandes] Erreur fetch via filtres URL:', e);
        setCommandes([]);
        setPagination({ currentPage: 1, lastPage: 1 });
      } finally {
        nProgress.done();
        setLoad(false);
      }
    })();
  }, [location.search, location.pathname]);
  useEffect(() => {
    const match = location.pathname.match(/\/page\/(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10) || 1;
      setCurrentPage(n);
    } else {
      setCurrentPage(1);
    }
    console.log(commandesAffichees);
    
  }, [location.pathname]);
  if (load) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <ClipLoader
          color="#3b82f6"
          loading={true}
          size={90}
          speedMultiplier={1.5}
        />
      </div>
    );
  }
  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold mb-6">Gestion des commandes</h1>
      <motion.div className="overflow-x-auto mb-6">
        <div className="flex gap-2 border-b pb-2">
          {onglets.map(({ label, key }) => (
            <motion.button
              key={key}
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${ongletActif === key
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              onClick={() => handleOngletChange(key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>
      <FiltreCommandes
        ref={filtreRef}
        currentPage={currentPage}
        displayedData={commandesAffichees}
        rawData={rawCommandes}
        selectedIds={selectedIds}
        onFiltrer={(liste, current, last) => {
          const formatted = formatCommandes(liste).sort((a, b) => new Date(b.date) - new Date(a.date));
          setRawCommandes(liste);
          setCommandes(formatted);
          if (current) setCurrentPage(current);
          if (last) setLastPage(last);
        }}
        onPaginationChange={({ currentPage: cp, lastPage: lp }) => {
          if (cp) setCurrentPage(cp);
          if (lp) setLastPage(lp);
        }}
      />
      {/* Filtre retiré temporairement */}
      <TableauActionGroup
        colonnes={colonnes}
        donnees={commandesAffichees}
        actionOptions={actionOptions}
        onSelectedIdsChange={setSelectedIds}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        devise={devise}
        listDevise={listDevise}
      />
      <div className="mt-6">
        <PaginationProduct
          link={link}
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
        />
      </div>
    </motion.div>
  );
}