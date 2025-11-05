import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faCalendarAlt, faClock, faUsers, faStar } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { url } from '../../contextes/UrlContext';
import nProgress from 'nprogress';
import { useDevise } from '../../contextes/DeviseContext';

export default function ListCircuits() {
    const [circuits, setCircuits] = useState([]);
    const [filteredCircuits, setFilteredCircuits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const { devise } = useDevise();
    const navigate = useNavigate();

    useEffect(() => {
        const loadCircuits = async () => {
            try {
                nProgress.start();
                const response = await axios.get(`${url}/products/getCircuits?devise=${devise}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });              
                // Filtrer seulement les produits qui sont des circuits
                const circuitProducts = response.data.products.filter(product => 
                    product.metaNow && product.metaNow._is_circuit_product === 'yes'
                );
                
                setCircuits(circuitProducts);
                setFilteredCircuits(circuitProducts);
            } catch (error) {
                console.error('Erreur lors du chargement des circuits:', error);
                setCircuits([]);
                setFilteredCircuits([]);
            } finally {
                setLoading(false);
                nProgress.done();
            }
        };

        loadCircuits();
    }, []);

    useEffect(() => {
        let filtered = circuits;

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(circuit =>
                circuit.post_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                circuit.post_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                circuit.metaNow?._circuit_description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par type
        if (selectedType) {
            filtered = filtered.filter(circuit => circuit.metaNow?._circuit_type === selectedType);
        }

        // Filtre par catégorie
        if (selectedCategory) {
            filtered = filtered.filter(circuit => 
                circuit.categories?.some(cat => cat.name === selectedCategory)
            );
        }

        setFilteredCircuits(filtered);
    }, [searchTerm, selectedType, selectedCategory, circuits]);

    const getCircuitImage = (circuit) => {
        // Vérifier d'abord le thumbnail
        if (circuit.metaNow?._thumbnail_id && circuit.metaNow._thumbnail_id.length > 0) {
            return circuit.metaNow._thumbnail_id[0];
        }       
        // Vérifier la galerie
        if (circuit.metaNow?._product_image_gallery && circuit.metaNow._product_image_gallery.length > 0) {
            const firstImage = circuit.metaNow._product_image_gallery[0];
            return firstImage;
        }
        
        return '/placeholder-circuit.jpg'; // Image par défaut
    };

    const getCategories = () => {
        const allCategories = new Set();
        circuits.forEach(circuit => {
            if (circuit.categories) {
                circuit.categories.forEach(cat => allCategories.add(cat.name));
            }
        });
        return Array.from(allCategories);
    };

    const getPriceRange = (circuit) => {
        // Vérifier d'abord le prix du circuit
        if (circuit.metaNow?._circuit_price && parseFloat(circuit.metaNow._circuit_price) > 0) {
            return `À partir de ${parseFloat(circuit.metaNow._circuit_price).toFixed(2)}€`;
        }       
        // Sinon, utiliser les prix de base des ressources
        const allPrices = [];
        
        // Vérifier tous les niveaux de confort
        ['Basic', 'Confort', 'Premium'].forEach(niveau => {
            const niveauKey = `_circuit_ressources_${niveau.toLowerCase()}`;
            if (circuit.metaNow?.[niveauKey]?.resources) {
                circuit.metaNow[niveauKey].resources.forEach(resource => {
                    const price = parseFloat(resource.base_cost) || 0;
                    if (price > 0) {
                        allPrices.push(price);
                    }
                });
            }
        });
        if (allPrices.length > 0) {
            const min = Math.min(...allPrices);
            return `À partir de ${min}€`;
        }
        return 'Prix sur demande';
    };
    const getNiveauConfort = (circuit) => {
        const niveaux = [];
        if (circuit.niveauBasic) niveaux.push('🟢 Basic');
        if (circuit.niveauConfort) niveaux.push('🔵 Confort');
        if (circuit.niveauPremium) niveaux.push('🟣 Premium');
        return niveaux.join(', ');
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6858b] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des circuits...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Circuits Touristiques (Test Local)</h1>
                    <p className="text-gray-600">Affichage de tous les circuits stockés dans le localStorage pour les tests</p>
                </div>
            </div>
            {/* Filtres */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Recherche */}
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un circuit..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent"
                            />
                        </div>

                        {/* Type de circuit */}
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent"
                        >
                            <option value="">Tous les types</option>
                            <option value="Exursion">Excursion</option>
                            <option value="Terrestre">Terrestre</option>
                            <option value="Maritime">Maritime</option>
                        </select>

                        {/* Catégorie */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent"
                        >
                            <option value="">Toutes les catégories</option>
                            {getCategories().map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        {/* Bouton reset */}
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedType('');
                                setSelectedCategory('');
                            }}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>

                {/* Résultats */}
                <div className="mb-4">
                    <p className="text-gray-600">
                        {filteredCircuits.length} circuit{filteredCircuits.length > 1 ? 's' : ''} trouvé{filteredCircuits.length > 1 ? 's' : ''}
                    </p>
                </div>

                {/* Liste des circuits */}
                {filteredCircuits.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun circuit trouvé</h3>
                        <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCircuits.map((circuit) => (
                            <div
                                key={circuit.id}
                                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/circuit/${circuit.id}`, { state: { circuit } })}
                            >
                                {/* Image */}
                                <div className="relative h-64 bg-gray-200">
                                    <img
                                        src={getCircuitImage(circuit)}
                                        alt={circuit.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-circuit.jpg';
                                        }}
                                    />
                                    {/* Overlay avec titre */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 w-full">
                                        <h3 className="text-xl font-bold text-white line-clamp-2 w-full break-words">
                                            {circuit.name}
                                        </h3>
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-[#f6858b] text-white px-2 py-1 rounded-full text-xs font-semibold">
                                            {circuit.type}
                                        </span>
                                    </div>
                                    {circuit.categories && circuit.categories.length > 0 && (
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-white text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                {circuit.categories[0].name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Contenu */}
                                <div className="p-6">
                                    {/* Description courte */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {circuit.circuit_description ? 
                                            circuit.circuit_description.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : 
                                            'Aucune description disponible'
                                        }
                                    </p>

                                    {/* Informations */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <FontAwesomeIcon icon={faClock} className="mr-2" />
                                            <span>
                                                {circuit.duree_jour && circuit.duree_nuit ? 
                                                    `${circuit.duree_jour} jour${circuit.duree_jour > 1 ? 's' : ''}, ${circuit.duree_nuit} nuit${circuit.duree_nuit > 1 ? 's' : ''}` :
                                                    circuit.duree_jour ? 
                                                        `${circuit.duree_jour} jour${circuit.duree_jour > 1 ? 's' : ''}` :
                                                        'Durée non spécifiée'
                                                }
                                            </span>
                                        </div>

                                        {circuit.niveauBasic || circuit.niveauConfort || circuit.niveauPremium ? (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <FontAwesomeIcon icon={faStar} className="mr-2" />
                                                <span>{getNiveauConfort(circuit)}</span>
                                            </div>
                                        ) : null}

                                        {circuit.circuit_max_capacity && (
                                            <div className="flex items-center text-sm text-gray-500">
                                                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                                                <span>Max {circuit.circuit_max_capacity} personnes</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Prix et bouton */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-lg font-bold text-[#f6858b]">
                                            {getPriceRange(circuit)}
                                        </div>
                                        <button className="bg-[#f6858b] text-white px-6 py-2 rounded-lg hover:bg-[#b92b32] transition-colors text-sm font-semibold">
                                            Voir détails
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 