import React, { useState } from 'react';
// import ProfileProgress from "../../../utils/ProfileProgress";
import ProfileForm from "../../ProfileForme/ProfileForm";
import { url, url_frontend } from '../../../contextes/UrlContext';
import Notiflix from "notiflix";

import axios from "axios";
import { useLogin } from "../../Login/LoginContext";
import DeleteShopModal from "./DeleteShopModal";

export default function IndexBoutique() {
    const [slug, setSlug] = useState("");
    const [showDelete, setShowDelete] = useState(false);
    const { deconnecter } = useLogin();

    const handleDeleteConfirm = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${url}/delete-my-shop`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
            Notiflix.Notify.success('Boutique supprimée avec succès.');
            setShowDelete(false);
            await deconnecter();
        } catch (e) {
            Notiflix.Notify.failure('Erreur lors de la suppression de la boutique.');
        }
    };

    return (
        <div>
            <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
                <h1 className="text-4xl font-bold text-gray-800">
                    Réglages
                </h1>
                {slug && (
                    <a 
                        href={`${url_frontend}/fr/boutique/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 mt-2 text-base font-medium text-white transition bg-gray-400 rounded md:mt-0 hover:bg-gray-800">
                        Voir la boutique
                    </a>
                )}
                <button
                  className="inline-block px-4 py-2 mt-4 ml-4 text-base font-medium text-white transition bg-red-600 rounded md:mt-0 hover:bg-red-800"
                  onClick={() => setShowDelete(true)}
                  >
                  Supprimer la boutique
                </button>
                </div>
            <ProfileForm onSlugLoaded={setSlug} fullWidth />
            <DeleteShopModal
              open={showDelete}
              onClose={() => setShowDelete(false)}
              onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}
