import { faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import Notiflix from 'notiflix';
import axios from 'axios';
import { url } from '../contextes/UrlContext';
import { useDevise } from '../contextes/DeviseContext';

export default function ResourceAddComp({ register, errors, setValue, productData, watch, id, forceEmptyResources }) {
    const [isOpen, setIsOpen] = useState(true);
    const [resources, setResources] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [linkValue, setLinkValue] = useState('');
    const [productName, setProductName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [availableResources, setAvailableResources] = useState([]);
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
    const [selectedResourceId, setSelectedResourceId] = useState('');
    const { devise, listDevise } = useDevise();

    // Initialisation dynamique à partir des données du produit
    useEffect(() => {
        if (forceEmptyResources) {
            setResources([]);
            return;
        }
        if (productData && Array.isArray(productData.resources_details)) {
            const baseCosts = productData.metaNow?._resource_base_costs || {};
            const blockCosts = productData.metaNow?._resource_block_costs || {};
            const validResources = productData.resources_details.filter(detail => {
                const resourceName = detail.resource?.name || detail.resource?.post_title;
                return resourceName && resourceName !== 'sans nom' && !resourceName.includes('sans nom');
            });           
            const initialResources = validResources.map(detail => {
                const id = detail.resource.id || detail.resource.ID;
                // On force l'arrondi à deux décimales dès l'initialisation
                const prixBaseRaw = baseCosts[id] ?? detail.resource.base_cost ?? 0;
                const coutBlocRaw = blockCosts[id] ?? detail.resource.block_cost ?? 0;
                return {
                    id,
                    label: detail.resource.name || detail.resource.post_title,
                    prixBase: prixBaseRaw === '' || prixBaseRaw === null || isNaN(prixBaseRaw) ? '' : Number(prixBaseRaw).toFixed(2),
                    coutBloc: coutBlocRaw === '' || coutBlocRaw === null || isNaN(coutBlocRaw) ? '' : Number(coutBlocRaw).toFixed(2)
                };
            });
            setResources(initialResources);
            if (validResources.length !== productData.resources_details.length) {
                const backendResources = validResources.map((res, idx) => ({
                    sort_order: idx,
                    resource: {
                        id: res.resource.id || res.resource.ID,
                        name: res.resource.name || res.resource.post_title,
                        base_cost: res.resource.base_cost,
                        block_cost: res.resource.block_cost,
                        qty: res.resource.qty
                    }
                }));
                setValue('resources_details', backendResources);
                const updatedBaseCosts = {};
                const updatedBlockCosts = {};
                validResources.forEach(res => {
                    const id = res.resource.id || res.resource.ID;
                    if (id && baseCosts[id] !== undefined) {
                        updatedBaseCosts[id] = baseCosts[id];
                    }
                    if (id && blockCosts[id] !== undefined) {
                        updatedBlockCosts[id] = blockCosts[id];
                    }
                });
                setValue('_resource_base_costs', updatedBaseCosts);
                setValue('_resource_block_costs', updatedBlockCosts);
            }
        }
    }, [productData, forceEmptyResources, setValue]);
    const handleAddResource = () => {
        const newId = Date.now(); 
        const newResources = [
            ...resources,
            { id: newId, label: 'Nouvelle ressource', prixBase: '', coutBloc: '' }
        ];
        setResources(newResources);
    };
    const handleChange = (id, field, value) => {
        const newResources = resources.map(res => (
            res.id === id ? { ...res, [field]: value } : res
        ));
        setResources(newResources);
    };

    useEffect(() => {
        if (productData && productData.metaNow && typeof productData.metaNow._wc_booking_resources_assignment === 'string') {
            if (setValue) setValue('_wc_booking_resources_assignment', productData.metaNow._wc_booking_resources_assignment);
        }
    }, [productData, setValue]);
    useEffect(() => {
      const backendResources = resources.map((res, idx) => ({
        sort_order: idx,
        resource: {
          id: res.id ?? null,
          name: res.label ?? "",
          base_cost: res.prixBase !== undefined && res.prixBase !== "" ? String(res.prixBase) : null,
          block_cost: res.coutBloc !== undefined && res.coutBloc !== "" ? String(res.coutBloc) : null,
          qty: res.qty !== undefined && res.qty !== "" ? res.qty : null
        }
      }));
      setValue('resources_details', backendResources);
      // Synchronisation des coûts globaux pour le backend
      const baseCosts = {};
      const blockCosts = {};
      resources.forEach(res => {
        if (res.id !== undefined && res.id !== null && res.prixBase !== undefined) {
          baseCosts[res.id] = res.prixBase;
        }
        if (res.id !== undefined && res.id !== null && res.coutBloc !== undefined) {
          blockCosts[res.id] = res.coutBloc;
        }
      });
      setValue('_resource_base_costs', baseCosts);
      setValue('_resource_block_costs', blockCosts);
    }, [resources, setValue]);
    const handleAddLink = async () => {
        if (linkValue.trim() !== '') {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                // Appel API pour enregistrer la ressource côté serveur
                const response = await axios.post(`${url}/save-resources`, { post_title: linkValue }, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });               
                
                if (response.data && response.data.success) {
                    await handleAvailableFocus();
                    const token2 = localStorage.getItem('token');
                    const resourcesResponse = await axios.get(`${url}/resources`, {
                        headers: { 'Authorization': `Bearer ${token2}` }
                    });
                    
                    let allResources = [];
                    if (resourcesResponse && resourcesResponse.data) {
                        if (Array.isArray(resourcesResponse.data.resources)) {
                            allResources = resourcesResponse.data.resources;
                        } else if (resourcesResponse.data.resources && typeof resourcesResponse.data.resources === 'object') {
                            allResources = [resourcesResponse.data.resources];
                        } else if (Array.isArray(resourcesResponse.data)) {
                            allResources = resourcesResponse.data;
                        } else if (resourcesResponse.data && typeof resourcesResponse.data === 'object') {
                            allResources = [resourcesResponse.data];
                        }
                    }
                    
                    // Trouver la nouvelle ressource par son nom
                    const newResource = allResources.find(r => 
                        (r.name === linkValue || r.post_title === linkValue) &&
                        !resources.some(existing => String(existing.id) === String(r.id || r.ID))
                    );
                    
                    if (newResource) {
                        const resourceToAdd = {
                            id: newResource.id || newResource.ID,
                            label: newResource.name || newResource.post_title,
                            prixBase:'',
                            coutBloc:''
                        };
                        setResources(prev => [...prev, resourceToAdd]);
                    }
                    
                    Notiflix.Notify.success('Lien ajouté avec succès !');
                } else {
                    Notiflix.Notify.failure('Erreur lors de l\'ajout du lien.');
                }
            } catch (e) {
                console.error('Erreur lors de l\'enregistrement:', e);
                Notiflix.Notify.failure('Erreur de connexion lors de l\'ajout du lien.');
            }
            setLinkValue('');
            setIsModalOpen(false);
            setIsLoading(false);
        } else {
            Notiflix.Notify.failure('Veuillez entrer un lien.');
        }
    };
    const handleAvailableFocus = async () => {
        setIsLoadingAvailable(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${url}/resources`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let allResources = [];
            if (response && response.data) {
                if (Array.isArray(response.data.resources)) {
                    allResources = response.data.resources;
                } else if (response.data.resources && typeof response.data.resources === 'object') {
                    allResources = [response.data.resources];
                } else if (Array.isArray(response.data)) {
                    allResources = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    allResources = [response.data];
                }
            }
            const alreadyIds = resources.map(r => String(r.id));
            const filtered = allResources.filter(r => !alreadyIds.includes(String(r.id || r.ID)));
            setAvailableResources(filtered);
        } catch (e) {
            setAvailableResources([]);
        } finally {
            setIsLoadingAvailable(false);
        }
    };
    // Quand on clique sur Add link
    const handleAddLinkButton = async () => {
        if (selectedResourceId) {
            const found = availableResources.find(r => String(r.id || r.ID) === selectedResourceId);
            if (found) {
                const newResource = {
                    id: found.id || found.ID,
                    label: found.name || found.post_title,
                    prixBase: '',
                    coutBloc: ''
                };
                setResources(prev => [...prev, newResource]);
                setSelectedResourceId('');
                Notiflix.Notify.success('Ressource ajoutée avec succès !');
                return;
            }
        }
        setIsModalOpen(true);
    };

    const handleDeleteResource = async (id) => {
        const newResources = resources.filter(res => res.id !== id);
        setResources(newResources);
    };
    return (
        <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
            <button
                type="button"
                className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
                disabled
            >
                <span><FontAwesomeIcon icon={faSquarePlus} className="mr-3" /> Ressources additionnelles</span>
                <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
            </button>
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Étiquette</label>
                    <input
                        type="text"
                        placeholder="Type"
                        {...register('_wc_booking_resource_label')}
                        className="p-2 border rounded border-gray-300 w-full"
                    />
                </div>
                <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Les ressources sont...</label>
                    <select {...register('_wc_booking_resources_assignment')} className="p-3 border rounded border-gray-300 w-full">
                        <option value="customer">Selectionné par le client</option>
                        <option value="client">Attribué automatiquement</option>
                    </select>
                </div>

                <div className="pt-6">
                    <span className="text-[#f6858b] text-2xl font-bold">Resources</span>
                    <div className="flex flex-col gap-6 mt-4">
                        {resources.map((res, index) => (
                            <div key={res.id} className="border p-4 bg-white rounded shadow-sm">
                                <button
                                    onClick={() => handleDeleteResource(res.id)}
                                    type="button"
                                    className="bg-[#00e4ec] hover:bg-[#00c0c7] text-white text-xs font-bold py-1 px-3 rounded mb-2"
                                >
                                    RETIRER
                                </button>
                                <div className="text-[#f6858b] text-lg font-bold mb-4">
                                    #{res.id} — {res.label}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm">Prix de base:</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 text-sm text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l h-[42px]">
                                                {listDevise[devise]}
                                            </span>
                                            <input
                                                type="number"
                                                step="any"
                                                {...register(`resources.${index}.prixBase`)}
                                                value={res.prixBase === null || res.prixBase === undefined ? '' : res.prixBase}
                                                onChange={e => {
                                                    handleChange(res.id, 'prixBase', e.target.value);
                                                }}
                                                onBlur={e => {
                                                    let value = e.target.value.replace(',', '.');
                                                    if (value !== '' && !isNaN(value)) {
                                                        value = (Math.round(parseFloat(value) * 100) / 100).toFixed(2);
                                                        handleChange(res.id, 'prixBase', value);
                                                    }
                                                }}
                                                className="border p-2 w-full rounded border-gray-300"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm">Coût du bloc:</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 text-sm text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l h-[42px]">
                                                {listDevise[devise]}
                                            </span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`resources.${index}.coutBloc`)}
                                                value={res.coutBloc === null || res.coutBloc === undefined ? '' : res.coutBloc}
                                                onChange={e => {
                                                    handleChange(res.id, 'coutBloc', e.target.value);
                                                }}
                                                onBlur={e => {
                                                    let value = e.target.value.replace(',', '.');
                                                    if (value !== '' && !isNaN(value)) {
                                                        value = (Math.round(parseFloat(value) * 100) / 100).toFixed(2);
                                                        handleChange(res.id, 'coutBloc', value);
                                                    }
                                                }}
                                                className="border p-2 w-full rounded border-gray-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

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
                                    <option key={r.id || r.ID} value={r.id || r.ID}>
                                        {r.name || r.post_title}{r.isLocal ? ' (local)' : ''}
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
        </div>
    );
}
