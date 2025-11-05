import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClipLoader from 'react-spinners/ClipLoader';
import { url } from '../contextes/UrlContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import EditeResourceComp from './EditeResourceComp';
import Notiflix from 'notiflix';
import nProgress from 'nprogress';
import { showConfirmModal } from './ConfirmDeleteProduct';

export default function ManageResourceComp() {
  const [resources, setResources] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editResourceId, setEditResourceId] = useState(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => { setIsModalOpen(false); setLinkValue(''); };

  const handleDeleteResource = async (id) => {
    nProgress.start();
    try {
      const token = localStorage.getItem('token');
      const productsResponse = await axios.get(`${url}/products/getAllProductBooking`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const productsWithResource = [];
      if (productsResponse.data && productsResponse.data.products) {
        productsResponse.data.products.forEach(product => {
          if (product.resources_details && Array.isArray(product.resources_details)) {
            const hasResource = product.resources_details.some(resource =>
              resource.resource && (resource.resource.id === id || resource.resource.ID === id)
            );
            if (hasResource) {
              productsWithResource.push(product);
            }
          }
        });
      }
      // 2. Supprimer la ressource de tous les produits qui l'utilisent
      for (const product of productsWithResource) {
        try {
          // Filtrer la ressource à supprimer
          const updatedResources = product.resources_details.filter(resource =>
            resource.resource && (resource.resource.id !== id && resource.resource.ID !== id)
          );

          // Mettre à jour les coûts de base et de bloc
          const updatedBaseCosts = { ...product.metaNow?._resource_base_costs };
          const updatedBlockCosts = { ...product.metaNow?._resource_block_costs };
          delete updatedBaseCosts[id];
          delete updatedBlockCosts[id];

          // Préparer les données de mise à jour
          const updateData = {
            resources_details: updatedResources,
            _resource_base_costs: updatedBaseCosts,
            _resource_block_costs: updatedBlockCosts
          };

          // Mettre à jour le produit
          await axios.post(`${url}/products/edit-product/${product.id}`, {
            metaNow: updateData
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

        } catch (productError) {
          console.error(`Erreur lors de la mise à jour du produit ${product.post_title}:`, productError);
        }
      }

      // 3. Supprimer la ressource elle-même
      const response = await axios.delete(`${url}/products/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      Notiflix.Notify.success(`Ressource supprimée avec succès ! ${productsWithResource.length > 0 ? `Supprimée de ${productsWithResource.length} produit(s).` : ''}`);

      // Recharger la liste des ressources
      const fetchResources = async () => {
        try {
          setIsFetching(true);
          const token = localStorage.getItem('token');
          const response = await axios.get(`${url}/resources`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          let resList = [];
          if (response && response.data) {
            if (Array.isArray(response.data.resources)) {
              resList = response.data.resources;
            } else if (response.data.resources && typeof response.data.resources === 'object') {
              resList = [response.data.resources];
            } else if (Array.isArray(response.data)) {
              resList = response.data;
            } else if (response.data && typeof response.data === 'object') {
              resList = [response.data];
            } else {
              console.warn('Réponse inattendue de l\'API /resources:', response.data);
            }
          }
          setResources(resList);
        } catch (e) {
          if (e.response) {
            console.error('Erreur lors de la récupération des ressources:', e.message, e.response.status, e.response.data);
          } else {
            console.error('Erreur lors de la récupération des ressources:', e);
          }
        } finally {
          setIsFetching(false);
        }
      };
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      Notiflix.Notify.failure('Erreur lors de la suppression de la ressource !');
    } finally {
      nProgress.done();
    }
  };

  const deleteResource = async (id) => {
    const confirmed = await showConfirmModal("Voulez-vous vraiment supprimer cette ressource ?", "Confirmation");
    if (!confirmed) return;
    handleDeleteResource(id);
  };

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
          // Succès : fermer le modal et recharger la liste (sans quitter la page)
          setIsModalOpen(false);
          await fetchResources();
        } else {
          console.error('Erreur lors de l\'enregistrement de la ressource sur le serveur');
          Notiflix.Notify.failure('Erreur lors de l\'ajout de la ressource.');
        }
      } catch (e) {
        console.error('Erreur lors de l\'enregistrement de la ressource sur le serveur:', e);
        Notiflix.Notify.failure('Erreur de connexion lors de l\'ajout de la ressource.');
      }
      setIsLoading(false);
      setLinkValue('');
    }
  };

  const fetchResources = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${url}/resources`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      let resList = [];
      if (response && response.data) {
        if (Array.isArray(response.data.resources)) {
          resList = response.data.resources;
        } else if (response.data.resources && typeof response.data.resources === 'object') {
          resList = [response.data.resources];
        } else if (Array.isArray(response.data)) {
          resList = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Si data est directement un objet unique
          resList = [response.data];
        } else {
          console.warn('Réponse inattendue de l’API /resources:', response.data);
        }
      }
      setResources(resList);
    } catch (e) {
      if (e.response) {
        console.error('Erreur lors de la récupération des ressources:', e.message, e.response.status, e.response.data);
      } else {
        console.error('Erreur lors de la récupération des ressources:', e);
      }
    } finally {
      setIsFetching(false);
    }
  };
  useEffect(() => {
    fetchResources();
  }, []);
  return (
    <div className="w-full bg-white p-6 rounded shadow-md mx-auto">
      {editResourceId ? (
        <>
          <div className="mb-4 flex justify-between items-center">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
              onClick={() => setEditResourceId(null)}
            >
              Retour à la liste
            </button>
          </div>
          <EditeResourceComp
            key={editResourceId}
            id={editResourceId}
            onClose={() => setEditResourceId(null)}
            onSaved={() => { fetchResources(); }}
          />
        </>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-[#f6858b]">Gérer les ressources</h2>
            <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded text-sm font-semibold flex items-center gap-2" onClick={handleOpenModal}>
              Ajouter une nouvelle ressource
            </button>
          </div>
          <AnimatePresence mode="wait">
            {isFetching ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full py-16 flex items-center justify-center"
              >
                <ClipLoader color="#ec4899" size={42} />
              </motion.div>
            ) : (
              <motion.table
                key={`table-${resources.length}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="min-w-full border border-gray-200 text-sm"
              >
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-bold">Nom</th>
                    <th className="px-4 py-2 font-bold">Parent</th>
                    <th className="px-4 py-2 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-400">Aucune ressource trouvée.</td>
                    </tr>
                  ) : (
                    resources.map((res, index) => (
                      <tr key={res.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2">{res.name || res.post_title || '-'}</td>
                        <td className="px-4 py-2">{(res.productressources && res.productressources.length > 0) ? (
                          <>
                            <ul className='space-x-4 space-y-2'>
                              {res.productressources.map((resP, index) => (
                                <Link key={index} to={`/reservation/edit/${resP?.product_id || ''}`}>{resP?.product?.post_title || ''}</Link>
                              ))}
                            </ul>
                          </>
                        ) : '-'}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-3 items-center">
                            <button className="text-purple-700 hover:text-purple-900 text-lg" title="Modifier" onClick={() => setEditResourceId(res.id || res.ID || res._id)}>
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="text-purple-700 hover:text-purple-900 text-lg"
                              title="Supprimer"
                              onClick={() => deleteResource(res.id || res.ID || res._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </motion.table>
            )}
          </AnimatePresence>
        </div>
      )}
      {/* Modal d'ajout de lien */}
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
                onClick={handleCloseModal}
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