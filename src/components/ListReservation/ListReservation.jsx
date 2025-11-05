import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faTasks, faCalendarAlt, faCogs } from "@fortawesome/free-solid-svg-icons";
import ProductTableComp from "../../utils/ProductTableComp";
import axios from "axios";
import ClipLoader from 'react-spinners/ClipLoader';
import PaginationProduct from "../../utils/PaginationProduct";
import { url } from '../../contextes/UrlContext';
import Notiflix from "notiflix";
import nProgress from "nprogress";
import { showConfirmModal } from '../../utils/ConfirmDeleteProduct';
import FilterProduct from '../../utils/FilterProductComp';
import ManageResourceComp from '../../utils/ManageResourceComp';
import ManageReservationComp from './ManageReservationComp';
import CalendarReservation from './CalendarReservation';
import { useDevise } from "../../contextes/DeviseContext";

export default function ListReservation() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("produits");
    const date = new Date();
    const mois = date.toLocaleString('fr-FR', { month: 'long' });
    const annee = date.getFullYear();
    const moisAnnee = `${mois} ${annee}`;
    const [products, setProducts] = useState([]);
    const [load, setLoad] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const token = localStorage.getItem('token');
    const link = '/reservation/';
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const { devise } = useDevise();

    const { page } = useParams();

    const fetchProducts = async () => {
        setLoad(true);
        let link;
        if (page) {
            link = `${url}/products/getAllProductBooking?page=${page}&devise=${devise}`;
        } else {
            link = `${url}/products/getAllProductBooking?devise=${devise}`;
        }
        try {
            const response = await axios.get(link, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data.products);
            setProducts(response.data.products);
            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        } finally {
            setLoad(false);
        }
    };

    useEffect(() => {
        const sp = new URLSearchParams(location.search || "");
        const urlTab = sp.get("tab");
        if (urlTab && ["produits", "gerer", "calendrier", "ressources"].includes(urlTab)) {
            setActiveTab(urlTab);
        } else {
            setActiveTab("produits");
        }
        const hasFilters = (location.search || "").replace(/^\?/, "").length > 0;
        if (!hasFilters) {
            fetchProducts();
        }
    }, [page, location.search]);

    useEffect(() => {
        const match = location.pathname.match(/\/page\/(\d+)/);
        if (match) {
            const n = parseInt(match[1], 10) || 1;
            setCurrentPage(n);
        } else {
            setCurrentPage(1);
        }
    }, [location.pathname]);

    useEffect(() => {
        setFilteredProducts(products);
    }, [products]);
    const handleTitleClick = async (id) => {
        try {
            const response = await axios.get(`${url}/products/getOneProduct/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            navigate(`/reservation/add`, { state: { product: response.data.product } });
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const deleteProduit = async (id, skipConfirm = false) => {
        if (!skipConfirm) {
            const confirmed = await showConfirmModal("Voulez-vous vraiment supprimer ce produit ?", "Confirmation");
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
                Notiflix.Notify.success("Produit supprimé avec succès !");
            }
            fetchProducts();
        } catch (error) {
            Notiflix.Notify.failure("Erreur lors de la suppression !");
        } finally {
            nProgress.done();
        }
    };

    const duplicateProduct = async (id) => {
        if (isDuplicating) return;
        setIsDuplicating(true);
        try {
            nProgress.start();
            await axios.post(`${url}/products/duplicate/${id}`, null, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            Notiflix.Notify.success('Réservation dupliquée avec succès !');
            fetchProducts();
        } catch (error) {
            console.error('Erreur lors de la duplication:', error);
            Notiflix.Notify.failure('Erreur lors de la duplication de la réservation');
        } finally {
            nProgress.done();
            setIsDuplicating(false);
        }
    };
    if (load) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <ClipLoader
                    color="#3b82f6"
                    loading={true}
                    size={40}
                    speedMultiplier={1.5}
                />
            </div>
        );
    }
    const changeTab = (tab) => {
        setActiveTab(tab);
        const sp = new URLSearchParams(location.search || "");
        sp.set("tab", tab);
        navigate({ pathname: location.pathname, search: `?${sp.toString()}` }, { replace: false });
    };
    return (
        <div className="flex w-full bg-white rounded-md shadow-sm flex-col relative p-2 md:p-6">
            <div className="w-full flex flex-col md:flex-row items-center justify-between mb-6 gap-2">
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full border-b border-gray-300 pb-1">
                    <button
                        className={`px-4 py-2 font-semibold rounded-t transition-colors relative ${activeTab === "produits" ? 'text-[#f6858b]' : ''}`}
                        style={{ borderBottom: activeTab === "produits" ? '4px solid #f6858b' : '4px solid transparent' }}
                        onClick={() => changeTab("produits")}
                    >
                        <FontAwesomeIcon icon={faList} className="mr-2" />
                        Tous les produits de réservation
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t transition-colors relative ${activeTab === "gerer" ? 'text-[#f6858b]' : ''}`}
                        style={{ borderBottom: activeTab === "gerer" ? '4px solid #f6858b' : '4px solid transparent' }}
                        onClick={() => changeTab("gerer")}
                    >
                        <FontAwesomeIcon icon={faTasks} className="mr-2" />
                        Gérer les réservations
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t transition-colors relative ${activeTab === "calendrier" ? 'text-[#f6858b]' : ''}`}
                        style={{ borderBottom: activeTab === "calendrier" ? '4px solid #f6858b' : '4px solid transparent' }}
                        onClick={() => changeTab("calendrier")}
                    >
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                        Calendrier
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t transition-colors relative ${activeTab === "ressources" ? 'text-[#f6858b]' : ''}`}
                        style={{ borderBottom: activeTab === "ressources" ? '4px solid #f6858b' : '4px solid transparent' }}
                        onClick={() => changeTab("ressources")}
                    >
                        <FontAwesomeIcon icon={faCogs} className="mr-2" />
                        Gérer les ressources
                    </button>
                </div>
            </div>
            {activeTab === "produits" ? (
                <>
                    <div className="w-full overflow-auto min-h-96">
                        <FilterProduct
                            onAddProduct={() => navigate("/reservation/add")}
                            productType="réservation"
                            products={products}
                            onProductsFiltered={setFilteredProducts}
                            deleteProduit={deleteProduit}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                        />
                        <ProductTableComp
                            products={filteredProducts}
                            link={link}
                            deleteProduit={deleteProduit}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            onDuplicate={duplicateProduct}
                            isDuplicating={isDuplicating}
                            showRubrique={true}
                        />
                    </div>
                    <div className="mt-6">
                        <PaginationProduct link={link}
                            currentPage={currentPage}
                            lastPage={lastPage} />
                    </div>
                    {products.length === 0 && (
                        <>
                            <div>
                                <p className="text-gray-600 text-center pt-5">Aucune Reservation n'est disponible pour le moment.</p>
                            </div>
                            <div>
                                <p className="text-gray-600 mt-4 text-center">Veuillez contacter l'administrateur pour plus d'informations.</p>
                            </div>
                        </>
                    )}
                </>
            ) : activeTab === "gerer" ? (
                <ManageReservationComp />
            ) : activeTab === "calendrier" ? (
                <CalendarReservation />
            ) : activeTab === "ressources" ? (
                <ManageResourceComp />
            ) : (
                <div className="w-full flex flex-col items-center justify-center py-20">
                    <h2 className="text-2xl font-bold text-center text-gray-500">Bientôt disponible</h2>
                </div>
            )}
        </div>
    );
}