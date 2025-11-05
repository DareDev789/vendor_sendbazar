import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faClock, faUsers, faStar, faCheck, faTimes, faArrowLeft, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const getLocalCircuits = () => {
    try {
        const circuits = localStorage.getItem('local_circuits');
        return circuits ? JSON.parse(circuits) : [];
    } catch (error) {
        console.error('Erreur lors de la récupération des circuits locaux:', error);
        return [];
    }
};

export default function CircuitDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [circuit, setCircuit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const loadCircuit = () => {
            // Essayer d'abord de récupérer depuis location.state
            if (location.state?.circuit) {
                setCircuit(location.state.circuit);
                setLoading(false);
                return;
            }

            // Sinon chercher dans localStorage
            const circuits = getLocalCircuits();
            const foundCircuit = circuits.find(c => c.id.toString() === id);
            
            if (foundCircuit) {
                setCircuit(foundCircuit);
            }
            setLoading(false);
        };

        loadCircuit();
    }, [id, location.state]);
    const getCircuitImage = (index = 0) => {
        // Pour la première image, vérifier d'abord le thumbnail
        if (index === 0 && circuit.thumbnail) {
            // Si thumbnail est un objet avec une propriété url
            if (typeof circuit.thumbnail === 'object' && circuit.thumbnail.url) {
                return circuit.thumbnail.url;
            }
            // Si thumbnail est directement une URL
            if (typeof circuit.thumbnail === 'string') {
                return circuit.thumbnail;
            }
        }
        // Vérifier la galerie
        if (circuit.gallery && circuit.gallery[index]) {
            const image = circuit.gallery[index];
            // Si l'image est un objet avec une propriété url
            if (typeof image === 'object' && image.url) {
                return image.url;
            }
            // Si l'image est directement une URL
            if (typeof image === 'string') {
                return image;
            }
        }
        
        return '/placeholder-circuit.jpg';
    };

    const getPriceRange = (niveau) => {
        // Vérifier d'abord le prix du circuit
        if (circuit.circuit_price && parseFloat(circuit.circuit_price) > 0) {
            return `À partir de ${parseFloat(circuit.circuit_price).toFixed(2)}€`;
        }
        
        // Sinon, utiliser les prix de base des ressources
        if (circuit[`ressources_${niveau}`]?.resources) {
            const allPrices = [];
            circuit[`ressources_${niveau}`].resources.forEach(resource => {
                const price = parseFloat(resource.base_cost) || 0;
                if (price > 0) {
                    if (resource.type === 'individuel') {
                        // Pour les ressources individuelles : prix par personne (minimum 1 personne)
                        allPrices.push(price);
                    } else {
                        // Pour les ressources en groupe/famille : prix fixe
                        allPrices.push(price);
                    }
                }
            });           
            if (allPrices.length > 0) {
                const min = Math.min(...allPrices);
                return `À partir de ${min}€`;
            }
        }
        return 'Prix sur demande';
    };

    const getNiveauConfort = () => {
        const niveaux = [];
        if (circuit.niveauBasic) niveaux.push('🟢 Basic');
        if (circuit.niveauConfort) niveaux.push('🔵 Confort');
        if (circuit.niveauPremium) niveaux.push('🟣 Premium');
        return niveaux;
    };

    const getDepartures = () => {
        return circuit.circuit_departures || [];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6858b] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement du circuit...</p>
                </div>
            </div>
        );
    }

    if (!circuit) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Circuit non trouvé</h3>
                    <p className="text-gray-600 mb-4">Le circuit que vous recherchez n'existe pas</p>
                    <button
                        onClick={() => navigate('/circuits')}
                        className="bg-[#f6858b] text-white px-6 py-2 rounded-lg hover:bg-[#b92b32] transition-colors"
                    >
                        Retour aux circuits
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header avec navigation */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/circuits')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Retour aux circuits
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{circuit.name}</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2">
                        {/* Galerie d'images */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                            <div className="relative h-[500px]">
                                <img
                                    src={getCircuitImage(selectedImage)}
                                    alt={circuit.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay avec titre */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 w-full">
                                    <h2 className="text-3xl font-bold text-white line-clamp-2 w-full break-words max-w-none">
                                        {circuit.name}
                                    </h2>
                                </div>
                            </div>
                            {circuit.gallery && circuit.gallery.length > 1 && (
                                <div className="p-4 flex gap-2 overflow-x-auto">
                                    {circuit.gallery.map((image, index) => {
                                        const imageUrl = typeof image === 'object' && image.url ? image.url : 
                                                       typeof image === 'string' ? image : null;
                                        return imageUrl ? (
                                            <img
                                                key={index}
                                                src={imageUrl}
                                                alt={`${circuit.name} - Image ${index + 1}`}
                                                className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                                                    selectedImage === index ? 'border-[#f6858b]' : 'border-gray-200'
                                                }`}
                                                onClick={() => setSelectedImage(index)}
                                            />
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Onglets */}
                        <div className="bg-white rounded-lg shadow-sm mb-8">
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8 px-6">
                                    {['description', 'itineraire', 'inclus', 'tarifs', 'transport', 'departures'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === tab
                                                    ? 'border-[#f6858b] text-[#f6858b]'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {tab === 'description' && 'Description'}
                                            {tab === 'itineraire' && 'Itinéraire'}
                                            {tab === 'inclus' && 'Inclus/Non inclus'}
                                            {tab === 'tarifs' && 'Tarifs'}
                                            {tab === 'transport' && 'Moyens de déplacement'}
                                            {tab === 'departures' && 'Départs'}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                                {activeTab === 'description' && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Description du circuit</h3>
                                        <div 
                                            className="prose max-w-none"
                                            dangerouslySetInnerHTML={{ 
                                                __html: circuit.circuit_description || 'Aucune description disponible' 
                                            }}
                                        />
                                    </div>
                                )}

                                {activeTab === 'itineraire' && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Itinéraire détaillé</h3>
                                        <div 
                                            className="prose max-w-none"
                                            dangerouslySetInnerHTML={{ 
                                                __html: circuit.circuit_itineraire || 'Itinéraire non disponible' 
                                            }}
                                        />
                                    </div>
                                )}

                                {activeTab === 'inclus' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
                                                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                                Ce qui est inclus
                                            </h4>
                                            <div 
                                                className="prose max-w-none"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: circuit.circuit_inclus || 'Aucune information disponible' 
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
                                                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                                Ce qui n'est pas inclus
                                            </h4>
                                            <div 
                                                className="prose max-w-none"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: circuit.circuit_non_inclus || 'Aucune information disponible' 
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'tarifs' && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Tarifs par niveau de confort</h3>
                                        <div className="space-y-4">
                                            {getNiveauConfort().map((niveau) => (
                                                <div key={niveau} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="text-lg font-semibold text-[#f6858b] mb-2">
                                                        Niveau {niveau}
                                                    </h4>
                                                    <div className="text-2xl font-bold text-gray-900 mb-2">
                                                        {getPriceRange(niveau.toLowerCase())}
                                                    </div>
                                                    {circuit[`ressources_${niveau.toLowerCase()}`]?.resources && (
                                                        <div className="mt-4">
                                                            <h5 className="font-semibold mb-2">Ressources incluses :</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                                {circuit[`ressources_${niveau.toLowerCase()}`].resources.map((resource, index) => (
                                                                    <div key={index} className="flex justify-between">
                                                                        <span>{resource.name}</span>
                                                                        <span className="font-semibold">
                                                                            {resource.base_cost ? 
                                                                                `${resource.base_cost}€ ${resource.type === 'individuel' ? '/personne' : 'fixe'}` : 
                                                                                'Inclus'
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            {/* Remises groupes */}
                                            {!circuit.a_de_remise ? (
                                                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                                    <h4 className="text-lg font-semibold text-green-800 mb-3">Remises groupes</h4>
                                                    <div className="text-green-700">
                                                        Aucune remise applicable pour ce circuit
                                                    </div>
                                                </div>
                                            ) : (circuit.remise_enfants_pourcentage || circuit.remise_adultes_pourcentage) && (
                                                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                                    <h4 className="text-lg font-semibold text-green-800 mb-3">Remises groupes</h4>
                                                    <div className="space-y-2">
                                                        {circuit.remise_enfants_pourcentage && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-green-700">Remise enfants :</span>
                                                                <span className="font-semibold text-green-900">
                                                                    {circuit.remise_enfants_pourcentage}% (si groupe {'>'} 5 personnes)
                                                                </span>
                                                            </div>
                                                        )}
                                                        {circuit.remise_adultes_pourcentage && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-green-700">Remise adultes :</span>
                                                                <span className="font-semibold text-green-900">
                                                                    {circuit.remise_adultes_pourcentage}% (si groupe {'>'} 5 adultes)
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'transport' && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Moyens de déplacement</h3>
                                        {circuit.transport_vehicule_prive || circuit.transport_quad || circuit.transport_vtt || circuit.transport_marche ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {circuit.transport_vehicule_prive && (
                                                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                                        <div className="flex items-center">
                                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                                                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-blue-900">Véhicule privé</h4>
                                                                <p className="text-sm text-blue-700">4x4 ou minibus</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {circuit.transport_quad && (
                                                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                                        <div className="flex items-center">
                                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                                                <FontAwesomeIcon icon={faUsers} className="text-green-600 text-xl" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-green-900">Quad</h4>
                                                                <p className="text-sm text-green-700">Exploration en quad</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {circuit.transport_vtt && (
                                                    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                                                        <div className="flex items-center">
                                                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                                                <FontAwesomeIcon icon={faUsers} className="text-orange-600 text-xl" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-orange-900">VTT</h4>
                                                                <p className="text-sm text-orange-700">Randonnée à vélo</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {circuit.transport_marche && (
                                                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                                        <div className="flex items-center">
                                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                                                <FontAwesomeIcon icon={faUsers} className="text-purple-600 text-xl" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-purple-900">Marche</h4>
                                                                <p className="text-sm text-purple-700">Randonnée pédestre</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-600">Aucun moyen de déplacement spécifié pour ce circuit.</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'departures' && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Dates de départ programmées</h3>
                                        {getDepartures().length > 0 ? (
                                            <div className="space-y-4">
                                                {getDepartures().map((departure, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="font-semibold">
                                                                    {new Date(departure.date).toLocaleDateString('fr-FR', {
                                                                        weekday: 'long',
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    Départ à {departure.time}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm text-gray-600">
                                                                    {departure.confirmedCapacity}/{departure.maxCapacity} personnes
                                                                </div>
                                                                <div className={`text-sm font-semibold ${
                                                                    departure.status === 'confirmed' ? 'text-green-600' :
                                                                    departure.status === 'pending' ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                                }`}>
                                                                    {departure.status === 'confirmed' ? 'Confirmé' :
                                                                     departure.status === 'pending' ? 'En attente' :
                                                                     'Annulé'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-600">Aucune date de départ programmée pour le moment.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            {/* Informations principales */}
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <div className="text-3xl font-bold text-[#f6858b] mb-4">
                                    {getPriceRange('simple')}
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-600">
                                        <FontAwesomeIcon icon={faClock} className="mr-3 w-4" />
                                        <span>
                                            {circuit.duree_jour && circuit.duree_nuit ? 
                                                `${circuit.duree_jour} jour${circuit.duree_jour > 1 ? 's' : ''}, ${circuit.duree_nuit} nuit${circuit.duree_nuit > 1 ? 's' : ''}` :
                                                circuit.duree_jour ? 
                                                    `${circuit.duree_jour} jour${circuit.duree_jour > 1 ? 's' : ''}` :
                                                    'Durée non spécifiée'
                                            }
                                        </span>
                                    </div>

                                    <div className="flex items-center text-gray-600">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 w-4" />
                                        <span>{circuit.type}</span>
                                    </div>

                                    {circuit.circuit_max_capacity && (
                                        <div className="flex items-center text-gray-600">
                                            <FontAwesomeIcon icon={faUsers} className="mr-3 w-4" />
                                            <span>Max {circuit.circuit_max_capacity} personnes</span>
                                        </div>
                                    )}

                                    {getNiveauConfort().length > 0 && (
                                        <div className="flex items-center text-gray-600">
                                            <FontAwesomeIcon icon={faStar} className="mr-3 w-4" />
                                            <span>{getNiveauConfort().join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                <button className="w-full bg-[#f6858b] text-white py-3 rounded-lg hover:bg-[#b92b32] transition-colors font-semibold mb-4">
                                    Réserver ce circuit
                                </button>

                                <button 
                                    onClick={() => navigate(`/circuit/${circuit.id}/devis`, { state: { circuit } })}
                                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    Demander un devis
                                </button>
                            </div>

                            {/* Point de rendez-vous */}
                            {circuit.circuit_meeting_point && (
                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <h4 className="font-semibold mb-3 flex items-center">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                        Point de rendez-vous
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                        {circuit.circuit_meeting_point}
                                    </p>
                                </div>
                            )}

                            {/* Conditions d'annulation */}
                            {circuit.circuit_cancellation_policy && (
                                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                    <h4 className="font-semibold mb-3">Conditions d'annulation</h4>
                                    <p className="text-gray-600 text-sm">
                                        {circuit.circuit_cancellation_policy}
                                    </p>
                                </div>
                            )}

                            {/* Contact */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h4 className="font-semibold mb-3">Nous contacter</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <FontAwesomeIcon icon={faPhone} className="mr-2 w-4" />
                                        <span>+33 1 23 45 67 89</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 w-4" />
                                        <span>contact@sendbazar.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 