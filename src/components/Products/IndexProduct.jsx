import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ClipLoader from 'react-spinners/ClipLoader';
import PaginationProduct from "../../utils/PaginationProduct";
import Notiflix from "notiflix";
import nProgress from "nprogress";
import ProductTableComp from "../../utils/ProductTableComp";
import { url } from '../../contextes/UrlContext';
import FilterProductComp from "../../utils/FilterProductComp";
import { useDevise } from "../../contextes/DeviseContext";

export default function IndexProduct() {
    const navigate = useNavigate();
    const location = useLocation();
    const [load, setLoad] = useState(false);
    const { page } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLatPage] = useState(1);
    const token = localStorage.getItem('token');
    const link = '/products/';
    const [isDuplicating, setIsDuplicating] = useState(false);
    const { devise } = useDevise();

    //endpoint produit normale : /products/getAllProductNormale
    //endpoint produit Reservation : /products/getAllProductBooking
    //endpoint avoir un produit avec tout complet : /products/getOneProduct

    const fetchProducts = async () => {
        setLoad(true);
        let link;
        if (page) {
            link = `${url}/products/getAllProductNormale?page=${page}&devise=${devise}`;
        }else{
            link = `${url}/products/getAllProductNormale?devise=${devise}`;
        }
        try {
            nProgress.start();
            const response = await axios.get(link, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data);
            setProducts(response.data.products);
            setFilteredProducts(response.data.products); 
            setCurrentPage(response.data.current_page);
            setLatPage(response.data.last_page);
        } catch (error) {
            console.error('Error fetching categories:', error);
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
            const response = await axios.delete(`${url}/products/delete/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            Notiflix.Notify.success('Produit effacé avec succès !');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        } finally {
            nProgress.done();
        }
    }
    const deleteProduit = async (id) => {
        if (confirm('Voulez-vous vraiment effacer ce produit ?')) {
            handleDeleteProduct(id);
        };
    }

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
        <div className="relative flex flex-col items-center w-full min-h-screen p-6 bg-white rounded-md shadow-sm">
            <div className="sticky top-0 z-20 w-full bg-white">
                <FilterProductComp
                    onAddProduct={() => navigate("/products/ajouter-produit")}
                    products={products}
                    onProductsFiltered={setFilteredProducts}
                    deleteProduit={deleteProduit}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    productType="Produit"
                    onPaginationChange={({ currentPage, lastPage }) => {
                        if (currentPage) setCurrentPage(currentPage);
                        if (lastPage) setLatPage(lastPage);
                    }}
                />
            </div>
            {filteredProducts.length === 0 ? (
                <div>
                    <p className="text-gray-600">Aucun produit trouvé !</p>
                    <p className="text-gray-600">Prêt à commencer à vendre quelque chose de génial ?</p>
                </div>
            ) : (
                <div className="w-full overflow-auto min-h-96">
                    <ProductTableComp 
                        products={filteredProducts} 
                        link={link} 
                        deleteProduit={deleteProduit} 
                        selectedIds={selectedIds} 
                        setSelectedIds={setSelectedIds}
                        onDuplicate={duplicateProduct}
                        isDuplicating={isDuplicating}
                        showAntigaspiIcon={true}
                        showRubrique={true}
                    />
                </div>
            )}
            <div className="mt-6">
                <PaginationProduct link={link} currentPage={currentPage} lastPage={lastPage} />
            </div>
        </div>
    );
}