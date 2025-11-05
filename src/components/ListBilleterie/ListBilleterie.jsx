import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ClipLoader from 'react-spinners/ClipLoader';
import PaginationProduct from "../../utils/PaginationProduct";
import Notiflix from "notiflix";
import nProgress from "nprogress";
import ProductTableComp from "../../utils/ProductTableComp";
import { url } from '../../contextes/UrlContext';
import { motion, AnimatePresence } from "framer-motion";
import FilterProductComp from "../../utils/FilterProductComp";
import { useDevise } from "../../contextes/DeviseContext";

export default function ListBilleterie() {
    const navigate = useNavigate();
    const location = useLocation();
    const { page } = useParams();
    const [load, setLoad] = useState(false);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLatPage] = useState(1);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const { devise } = useDevise();
    const token = localStorage.getItem('token');

    const link = '/billeterie/';

    const fetchProducts = async () => {
        setLoad(true);
        setError(null);
        let apiLink = page 
            ? `${url}/products/getAllProductBilleterie?page=${page}&devise=${devise}` 
            : `${url}/products/getAllProductBilleterie?devise=${devise}`;

        try {
            nProgress.start();
            const response = await axios.get(apiLink, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProducts(response.data.products);
            setFilteredProducts(response.data.products);
            setCurrentPage(response.data.current_page);
            setLatPage(response.data.last_page);
        } catch (error) {
            console.error('Error fetching billets:', error);
            setError(error);
        } finally {
            setLoad(false);
            nProgress.done();
        }
    };
    useEffect(() => {
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

    const handleDeleteProduct = async (id) => {
        nProgress.start();
        try {
            await axios.delete(`${url}/products/delete/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            Notiflix.Notify.success('Produit effacé avec succès !');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            setError(error);
        } finally {
            nProgress.done();
        }
    };

    const deleteProduit = (id) => {
        if (confirm('Voulez-vous vraiment effacer ce produit ?')) {
            handleDeleteProduct(id);
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
            Notiflix.Notify.success('Produit dupliqué avec succès !');
            fetchProducts();
        } catch (error) {
            console.error('Erreur lors de la duplication:', error);
            Notiflix.Notify.failure('Erreur lors de la duplication du produit');
        } finally {
            nProgress.done();
            setIsDuplicating(false);
        }
    };

    if (load) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <ClipLoader
                    color="#3b82f6"
                    loading={true}
                    size={40}
                    speedMultiplier={1.5}
                />
            </div>
        ); 
    }

    return (
        <motion.div
            className="flex flex-col items-center w-full min-h-screen p-6 bg-white shadow-lg rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <FilterProductComp
                onAddProduct={() => navigate("/billeterie/add")}
                products={products}
                onProductsFiltered={setFilteredProducts}
                deleteProduit={deleteProduit}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                productType="Billeterie"
                onPaginationChange={({ currentPage, lastPage }) => {
                    if (currentPage) setCurrentPage(currentPage);
                    if (lastPage) setLatPage(lastPage);
                }}
            />

            <AnimatePresence mode="wait">
                {filteredProducts.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-10 text-center"
                    >
                        <p className="text-gray-600">Aucune billeterie n'est disponible pour le moment.</p>
                        <p className="text-gray-600">Veuillez contacter l'administrateur pour plus d'informations.</p>
                        {error && <p className="mt-4 font-bold text-red-600">{error?.message || 'Une erreur est survenue !'}</p>}
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full overflow-auto min-h-96"
                    >
                        <ProductTableComp
                            products={filteredProducts}
                            link={link}
                            deleteProduit={deleteProduit}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            onDuplicate={duplicateProduct}
                            isDuplicating={isDuplicating}
                        />
                        <div className="mt-6">
                            <PaginationProduct link={link} currentPage={currentPage} lastPage={lastPage} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}