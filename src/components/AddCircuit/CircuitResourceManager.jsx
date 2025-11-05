import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import Notiflix from 'notiflix';

export default function CircuitResourceManager({ niveau, register, setValue, watch }) {
    const [isOpen, setIsOpen] = useState(true);
    const [resources, setResources] = useState([]);

    const [availableResources, setAvailableResources] = useState([]);
    const [selectedResourceId, setSelectedResourceId] = useState('');
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [linkValue, setLinkValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const watchedResources = watch(`_circuit_ressources_${niveau.toLowerCase()}.resources`);
    useEffect(() => {
        if (watchedResources !== undefined) {
            setResources(watchedResources || []);
        }
    }, [watchedResources]);
    const getNiveauLabel = (niveau) => {
        const labels = {
            simple: 'Simple',
            confort: 'Confort',
            vip: 'VIP'
        };
        return labels[niveau] || niveau;
    };
    const handleResourceChange = (resourceId, field, value) => {
        const updatedResources = resources.map(res =>
            res.id === resourceId ? { ...res, [field]: value } : res
        );
        setResources(updatedResources);
        if (setValue) setValue(`_circuit_ressources_${niveau.toLowerCase()}.resources`, updatedResources);
    };

    const handleRemoveResource = (resourceId) => {
        const newResources = resources.filter(res => res.id !== resourceId);
        setResources(newResources);
        if (setValue) setValue(`_circuit_ressources_${niveau.toLowerCase()}.resources`, newResources);
    };

    // Charger les ressources disponibles au focus du select
    const handleAvailableFocus = async () => {
        setIsLoadingAvailable(true);
        try {
            // Créer les options de types de ressources
            const resourceTypeOptions = [
                { id: 'individuel', name: 'Individuel', type: 'individuel' },
                { id: 'groupe', name: 'En groupe', type: 'groupe' },
                { id: 'famille', name: 'En famille', type: 'famille' }
            ];

            // Filtrer celles déjà attribuées
            const alreadyTypes = resources.map(r => r.type);
            const filtered = resourceTypeOptions.filter(r => !alreadyTypes.includes(r.type));
            setAvailableResources(filtered);
        } catch (e) {
            console.error('Erreur lors du chargement des ressources:', e);
            setAvailableResources([]);
        } finally {
            setIsLoadingAvailable(false);
        }
    };

    // Quand on clique sur Add link
    const handleAddLinkButton = async () => {
        if (selectedResourceId) {
            // Ajouter la ressource sélectionnée depuis la liste
            const found = availableResources.find(r => String(r.id) === selectedResourceId);
            if (found) {
                const newResource = {
                    id: Date.now(), // ID unique pour chaque ressource
                    name: found.name,
                    type: found.type, // Utiliser le type sélectionné
                    base_cost: '',
                    nombre_min: '',
                    nombre_max: ''
                };
                setResources(prev => [...prev, newResource]);
                if (setValue) setValue(`_circuit_ressources_${niveau.toLowerCase()}.resources`, [...resources, newResource]);
                setSelectedResourceId('');
                Notiflix.Notify.success(`${found.name} ajouté avec succès !`);
                return;
            }
        }
        // Si aucune ressource sélectionnée, ouvrir le modal (comme dans ResourceAddComp)
        setIsModalOpen(true);
    };

    const handleAddLink = async () => {
        if (linkValue.trim() !== '') {
            setIsLoading(true);
            try {
                // Créer une nouvelle ressource avec le nom saisi
                const newResource = {
                    id: Date.now(),
                    name: linkValue.trim(),
                    type: 'custom',
                    base_cost: '',
                    nombre_min: '',
                    nombre_max: ''
                };
                setResources(prev => [...prev, newResource]);
                if (setValue) setValue(`ressources_${niveau}.resources`, [...resources, newResource]);

                Notiflix.Notify.success('Lien ajouté avec succès !');
            } catch (e) {
                console.error('Erreur lors de l\'enregistrement:', e);
                Notiflix.Notify.failure('Erreur lors de l\'ajout du lien.');
            }
            setLinkValue('');
            setIsModalOpen(false);
            setIsLoading(false);
        } else {
            Notiflix.Notify.failure('Veuillez entrer un lien.');
        }
    };
    return (
        <div className="mt-6 border-t pt-6">
            <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
                >
                    <span><FontAwesomeIcon icon={faSquarePlus} className="mr-3" /> Ressources - {getNiveauLabel(niveau)}</span>
                    <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                    <div className="pt-6">
                        <div className="flex flex-col gap-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Les ressources sont...</label>
                                <select
                                    {...register(`ressources_${niveau}.assignment`)}
                                    className="p-2 border rounded border-gray-300 w-full"
                                >
                                    <option value="customer">Sélectionné par le client</option>
                                </select>
                            </div>
                            {resources.map((resource, resourceIndex) => (
                                <div key={resource.id} className="border p-4 bg-white rounded shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-[#f6858b] text-lg font-bold">
                                            {resource.name || `Ressource #${resource.id}`}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveResource(resource.id)}
                                            type="button"
                                            className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded"
                                        >
                                            RETIRER
                                        </button>
                                    </div>
                                    <div className="mb-6">
                                        <div className="mb-4">
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Prix de base:</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={resource.base_cost || ''}
                                                onChange={(e) => handleResourceChange(resource.id, 'base_cost', e.target.value)}
                                                className="border p-2 w-full rounded border-gray-300"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Nombre minimum de personnes:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={resource.nombre_min || ''}
                                                    onChange={(e) => handleResourceChange(resource.id, 'nombre_min', e.target.value)}
                                                    className="border p-2 w-full rounded border-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Nombre maximum de personnes:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={resource.nombre_max || ''}
                                                    onChange={(e) => handleResourceChange(resource.id, 'nombre_max', e.target.value)}
                                                    className="border p-2 w-full rounded border-gray-300"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                        {/* Système de sélection de ressources */}
                        <div className="flex items-center justify-between mt-6 gap-2">
                            <div className="w-1/3 min-w-[180px]">
                                <select
                                    className="w-full p-2 border rounded border-gray-300 text-sm"
                                    onFocus={handleAvailableFocus}
                                    onChange={e => setSelectedResourceId(e.target.value)}
                                    value={selectedResourceId}
                                >
                                    <option value="">Nouvelle ressource...</option>
                                    {isLoadingAvailable ? (
                                        <option disabled>Chargement...</option>
                                    ) : (
                                        availableResources.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <button
                                type="button"
                                className="px-4 py-2 text-sm text-white font-semibold rounded bg-[#00e4ec] hover:bg-[#00c0c7]"
                                onClick={handleAddLinkButton}
                            >
                                Add link
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Modale pour ajouter un lien */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Ajouter un lien</h2>
                        <input
                            type="text"
                            value={linkValue}
                            onChange={e => setLinkValue(e.target.value)}
                            placeholder="Entrez le lien ici"
                            className="w-full p-2 border rounded mb-4 border-gray-300"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setIsModalOpen(false); setLinkValue(''); }}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddLink}
                                className="px-4 py-2 bg-[#00e4ec] text-white rounded hover:bg-[#00c0c7]"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Chargement...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 