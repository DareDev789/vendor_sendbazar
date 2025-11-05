import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faDesktop } from '@fortawesome/free-solid-svg-icons';
import Notiflix from 'notiflix';
import nProgress from 'nprogress';

// Fonction utilitaire pour récupérer tous les circuits locaux
const getLocalCircuits = () => {
    try {
        const circuits = localStorage.getItem('local_circuits');
        return circuits ? JSON.parse(circuits) : [];
    } catch (error) {
        console.error('Erreur lors de la récupération des circuits locaux:', error);
        return [];
    }
};
// Fonction utilitaire pour sauvegarder les circuits locaux
const saveLocalCircuits = (circuits) => {
    try {
        localStorage.setItem('local_circuits', JSON.stringify(circuits));
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des circuits locaux:', error);
    }
};
const getLocalResources = () => {
    try {
        const resources = localStorage.getItem('local_circuit_resources');
        return resources ? JSON.parse(resources) : [];
    } catch (error) {
        console.error('Erreur lors de la récupération des ressources locales:', error);
        return [];
    }
};
// Fonction utilitaire pour sauvegarder les ressources locales
const saveLocalResources = (resources) => {
    try {
        localStorage.setItem('local_circuit_resources', JSON.stringify(resources));
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des ressources locales:', error);
    }
};

// Fonction utilitaire pour générer un ID unique
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Fonction pour extraire les ressources des circuits locaux
const extractResourcesFromCircuits = (circuits) => {
    const resourceMap = new Map();
    
    circuits.forEach(circuit => {
        // Vérifier les ressources simples
        if (circuit.ressources_Basic && Object.keys(circuit.ressources_Basic).length > 0) {
            const resourceKey = 'ressources_Basic';
            if (!resourceMap.has(resourceKey)) {
                resourceMap.set(resourceKey, {
                    id: resourceKey,
                    name: 'Ressources Simple',
                    type: 'simple',
                    circuits: []
                });
            }
            resourceMap.get(resourceKey).circuits.push(circuit);
        }       
        // Vérifier les ressources confort
        if (circuit.ressources_Confort && Object.keys(circuit.ressources_Confort).length > 0) {
            const resourceKey = 'ressources_Confort';
            if (!resourceMap.has(resourceKey)) {
                resourceMap.set(resourceKey, {
                    id: resourceKey,
                    name: 'Ressources Confort',
                    type: 'confort',
                    circuits: []
                });
            }
            resourceMap.get(resourceKey).circuits.push(circuit);
        }
        
        // Vérifier les ressources VIP
        if (circuit.ressources_Premium && Object.keys(circuit.ressources_Premium).length > 0) {
            const resourceKey = 'ressources_Premium';
            if (!resourceMap.has(resourceKey)) {
                resourceMap.set(resourceKey, {
                    id: resourceKey,
                    name: 'Ressources VIP',
                    type: 'vip',
                    circuits: []
                });
            }
            resourceMap.get(resourceKey).circuits.push(circuit);
        }
    });
    
    return Array.from(resourceMap.values());
};

export default function ManageResourceCircuit() {
    const [resources, setResources] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resourceName, setResourceName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editResourceId, setEditResourceId] = useState(null);

    // Charger les ressources au montage du composant
    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = () => {
        const localCircuits = getLocalCircuits();
        const extractedResources = extractResourcesFromCircuits(localCircuits);
        
        // Combiner avec les ressources manuelles existantes
        const manualResources = getLocalResources();
        const allResources = [...extractedResources, ...manualResources];
        
        setResources(allResources);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setResourceName('');
        setEditResourceId(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setResourceName('');
        setEditResourceId(null);
    };

    const handleEditResource = (resource) => {
        setEditResourceId(resource.id);
        setResourceName(resource.name || '');
        setIsModalOpen(true);
    };

    const handleSaveResource = async () => {
        if (!resourceName.trim()) {
            Notiflix.Notify.warning('Le nom de la ressource est requis');
            return;
        }

        setIsLoading(true);
        try {
            const localResources = getLocalResources();
            const newResource = {
                id: editResourceId || generateId(),
                name: resourceName.trim(),
                type: 'manual', // Type manuel pour les ressources ajoutées manuellement
                created_at: editResourceId ? undefined : new Date().toISOString(),
                updated_at: new Date().toISOString(),
                isLocal: true,
                circuits: []
            };

            let updatedResources;
            if (editResourceId) {
                // Mode édition
                updatedResources = localResources.map(resource => 
                    resource.id === editResourceId ? newResource : resource
                );
                Notiflix.Notify.success('Ressource mise à jour avec succès !');
            } else {
                // Mode création
                updatedResources = [newResource, ...localResources];
                Notiflix.Notify.success('Ressource créée avec succès !');
            }

            saveLocalResources(updatedResources);
            loadResources(); // Recharger toutes les ressources

            

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            Notiflix.Notify.failure('Erreur lors de la sauvegarde de la ressource');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteResource = async (id) => {
        const confirmed = await Notiflix.Confirm.show(
            'Confirmation',
            'Voulez-vous vraiment supprimer cette ressource ?',
            'Oui',
            'Non'
        );

        if (!confirmed) return;

        try {
            nProgress.start();
            
            // Supprimer seulement les ressources manuelles
            const localResources = getLocalResources();
            const updatedResources = localResources.filter(resource => resource.id !== id);
            saveLocalResources(updatedResources);
            
            // Recharger toutes les ressources
            loadResources();

            Notiflix.Notify.success('Ressource supprimée avec succès !');
            
            

        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            Notiflix.Notify.failure('Erreur lors de la suppression de la ressource');
        } finally {
            nProgress.done();
        }
    };

    const getResourceTypeLabel = (type) => {
        switch (type) {
            case 'simple': return 'Simple';
            case 'confort': return 'Confort';
            case 'vip': return 'VIP';
            case 'manual': return 'Manuel';
            default: return type;
        }
    };

    const getResourceTypeColor = (type) => {
        switch (type) {
            case 'simple': return 'bg-blue-100 text-blue-800';
            case 'confort': return 'bg-green-100 text-green-800';
            case 'vip': return 'bg-purple-100 text-purple-800';
            case 'manual': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="w-full bg-white p-6 rounded shadow-md mx-auto">
            <div className="overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-[#f6858b] flex items-center gap-2">
                        <FontAwesomeIcon icon={faDesktop} />
                        Gérer les ressources des circuits
                    </h2>
                    <button 
                        className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded text-sm font-semibold flex items-center gap-2" 
                        onClick={handleOpenModal}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Ajouter une ressource
                    </button>
                </div>

                <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="px-4 py-2 font-bold">Nom</th>
                            <th className="px-4 py-2 font-bold">Type</th>
                            <th className="px-4 py-2 font-bold">Circuits utilisant</th>
                            <th className="px-4 py-2 font-bold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-400">
                                    Aucune ressource trouvée.
                                </td>
                            </tr>
                        ) : (
                            resources.map((resource, index) => (
                                <tr key={resource.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-2">
                                        <div className="font-medium">{resource.name}</div>
                                        <div className="text-xs text-gray-500">ID: {resource.id}</div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-xs ${getResourceTypeColor(resource.type)}`}>
                                            {getResourceTypeLabel(resource.type)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        {resource.circuits && resource.circuits.length > 0 ? (
                                            <div className="text-xs space-y-1">
                                                {resource.circuits.map(circuit => (
                                                    <div key={circuit.id} className="text-blue-600 font-medium">
                                                        {circuit.name || circuit.title || 'Circuit sans nom'}
                                                        <div className="text-gray-500 text-xs">
                                                            {circuit.type} - {circuit.status || 'draft'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Aucun circuit</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-3 items-center">
                                            {resource.type === 'manual' && (
                                                <button 
                                                    className="text-purple-700 hover:text-purple-900 text-lg" 
                                                    title="Modifier" 
                                                    onClick={() => handleEditResource(resource)}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {resource.type === 'manual' && (
                                                <button 
                                                    className="text-red-600 hover:text-red-800 text-lg" 
                                                    title="Supprimer"
                                                    onClick={() => handleDeleteResource(resource.id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            )}
                                            {resource.type !== 'manual' && (
                                                <span className="text-gray-400 text-xs">Automatique</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal d'ajout/édition de ressource */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">
                            {editResourceId ? 'Modifier la ressource' : 'Ajouter une ressource'}
                        </h2>
                        <input
                            type="text"
                            value={resourceName}
                            onChange={e => setResourceName(e.target.value)}
                            placeholder="Nom de la ressource"
                            className="w-full p-2 border rounded mb-4 border-gray-300"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveResource}
                                className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Chargement...' : (editResourceId ? 'Modifier' : 'Ajouter')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 