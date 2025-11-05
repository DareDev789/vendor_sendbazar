import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faTasks, faCalendarAlt, faCogs } from "@fortawesome/free-solid-svg-icons";
import ProductTableComp from "../../utils/ProductTableComp";
import FilterProductComp from '../../utils/FilterProductComp';
import axios from "axios";
import Notiflix from "notiflix";
import nProgress from "nprogress";
import { showConfirmModal } from '../../utils/ConfirmDeleteProduct';
import { url } from '../../contextes/UrlContext';
import ManageResourceCircuit from '../AddCircuit/ManageResourceCircuit';
import ClipLoader from 'react-spinners/ClipLoader';
import PaginationProduct from "../../utils/PaginationProduct";
import { useDevise } from "../../contextes/DeviseContext";

export default function ListCircuit() {
  const navigate = useNavigate();
  const { page } = useParams();
  const [activeTab, setActiveTab] = useState("circuits");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [load, setLoad] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const { devise } = useDevise();
  const token = localStorage.getItem('token');
  const link = '/circuit/';

  // Fonction pour récupérer les circuits depuis l'API
  const fetchCircuits = async () => {
    setLoad(true);
    let link;
    if (page) {
      link = `${url}/products/getAllCircuit?page=${page}&devise=${devise}`;
    } else {
      link = `${url}/products/getAllCircuit?devise=${devise}`;
    }
    try {
      const response = await axios.get(link, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProducts(response.data.products);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (error) {
      console.error('Error fetching circuits:', error);
      Notiflix.Notify.failure("Erreur lors du chargement des circuits");
    } finally {
      setLoad(false);
    }
  };

  // Fonction de suppression identique à ListReservation
  const supprimerCircuit = async (id, skipConfirm = false) => {
    if (!skipConfirm) {
      const confirmed = await showConfirmModal("Voulez-vous vraiment supprimer ce circuit ?", "Confirmation");
      if (!confirmed) return;
    }
    try {
      nProgress.start();
      await axios.delete(`${url}/products/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!skipConfirm) {
        Notiflix.Notify.success("Circuit supprimé avec succès !");
      }
      fetchCircuits();
    } catch (error) {
      Notiflix.Notify.failure("Erreur lors de la suppression !");
    } finally {
      nProgress.done();
    }
  };

  // Fonction de duplication pour les circuits
  const duplicateCircuit = async (id) => {
    if (isDuplicating) return;
    setIsDuplicating(true);
    try {
      nProgress.start();
      // Récupérer le circuit à dupliquer
      const response = await axios.get(`${url}/products/getOneProduct/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const originalProduct = response.data.product;
      // Créer une copie avec un nouveau titre
      const duplicatedProduct = {
        ...originalProduct,
        post_title: `Copie de ${originalProduct.post_title}`,
        post_name: `copie-de-${originalProduct.post_name}`,
        post_status: 'draft',
        ID: undefined,
        id: undefined
      };
      // Envoyer la copie
      const createResponse = await axios.post(`${url}/products/add-product`, duplicatedProduct, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      Notiflix.Notify.success('Circuit dupliqué avec succès !');
      fetchCircuits();
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      Notiflix.Notify.failure('Erreur lors de la duplication du circuit');
    } finally {
      nProgress.done();
      setIsDuplicating(false);
    }
  };

  // Charger les circuits au montage et quand la page change
  useEffect(() => {
    fetchCircuits();
  }, [page]);

  // Quand products change, on met à jour filteredProducts
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Affichage du loader pendant le chargement
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
    <div className="flex w-full bg-white rounded-md shadow-sm flex-col relative p-2 md:p-6">
      <div className="w-full flex flex-col md:flex-row items-center justify-between mb-6 gap-2">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full border-b border-gray-300 pb-1">
          <button
            className={`px-4 py-2 font-semibold rounded-t transition-colors relative ${activeTab === "circuits" ? 'text-[#f6858b]' : ''}`}
            style={{ borderBottom: activeTab === "circuits" ? '4px solid #f6858b' : '4px solid transparent' }}
            onClick={() => setActiveTab("circuits")}
          >
            <FontAwesomeIcon icon={faList} className="mr-2" />
            Tous les circuits
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-t transition-colors relative ${activeTab === "gerer" ? 'text-[#f6858b]' : ''}`}
            style={{ borderBottom: activeTab === "gerer" ? '4px solid #f6858b' : '4px solid transparent' }}
            onClick={() => setActiveTab("gerer")}
          >
            <FontAwesomeIcon icon={faTasks} className="mr-2" />
            Gérer les circuits
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-t transition-colors relative ${activeTab === "calendrier" ? 'text-[#f6858b]' : ''}`}
            style={{ borderBottom: activeTab === "calendrier" ? '4px solid #f6858b' : '4px solid transparent' }}
            onClick={() => setActiveTab("calendrier")}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
            Calendrier
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-t transition-colors relative ${activeTab === "ressources" ? 'text-[#f6858b]' : ''}`}
            style={{ borderBottom: activeTab === "ressources" ? '4px solid #f6858b' : '4px solid transparent' }}
            onClick={() => setActiveTab("ressources")}
          >
            <FontAwesomeIcon icon={faCogs} className="mr-2" />
            Gérer les ressources
          </button>
        </div>
      </div>
      {activeTab === "circuits" ? (
        <>
          <FilterProductComp
            onAddProduct={() => navigate("/circuit/add")}
            products={products}
            onProductsFiltered={setFilteredProducts}
            deleteProduit={supprimerCircuit}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            productType="Circuit"
            onPaginationChange={({ currentPage, lastPage }) => {
              setCurrentPage(currentPage);
              setLastPage(lastPage);
            }}
          />
          <div className="w-full overflow-auto min-h-96">
            <ProductTableComp
              products={filteredProducts}
              link={'/circuit/'}
              deleteProduit={supprimerCircuit}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onDuplicate={duplicateCircuit}
              isDuplicating={isDuplicating}
            />
          </div>
          <PaginationProduct
            link={link}
            currentPage={currentPage}
            lastPage={lastPage}
          />
        </>
      ) : activeTab === "ressources" ? (
        <ManageResourceCircuit />
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-center text-gray-500">Bientôt disponible</h2>
        </div>
      )}
    </div>
  );
}
