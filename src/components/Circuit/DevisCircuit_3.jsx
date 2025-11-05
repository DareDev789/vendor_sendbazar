import React from 'react';

export default function DevisCircuit_3({ 
    formData, 
    circuit 
}) {
    // Fonction pour calculer le prix total avec remises groupes
    const calculateTotalPrice = () => {
        // Vérifier d'abord le prix du circuit
        if (circuit.circuit_price && parseFloat(circuit.circuit_price) > 0) {
            const basePrice = parseFloat(circuit.circuit_price);
            const totalAdults = formData.voyageurs.adultes;
            const totalChildren = formData.voyageurs.enfants;
            
            // Calcul simple : prix de base × nombre total de personnes
            let totalPrice = basePrice * (totalAdults + totalChildren);
            
            // Appliquer les remises groupes si disponibles
            if (circuit.remise_enfants_pourcentage && totalChildren > 5) {
                const remiseEnfants = parseFloat(circuit.remise_enfants_pourcentage) / 100;
                totalPrice -= (basePrice * totalChildren * remiseEnfants);
            }
            
            if (circuit.remise_adultes_pourcentage && totalAdults > 5) {
                const remiseAdultes = parseFloat(circuit.remise_adultes_pourcentage) / 100;
                totalPrice -= (basePrice * totalAdults * remiseAdultes);
            }
            
            return totalPrice;
        }

        // Sinon, calculer basé sur les prix de base des ressources
        const selectedNiveau = Object.keys(formData.niveauxConfort).find(niveau => formData.niveauxConfort[niveau]);
        if (!selectedNiveau) return 0;

        const niveauResources = circuit[`ressources_${selectedNiveau}`];
        if (!niveauResources?.resources) return 0;

        let totalPrice = 0;

        // Parcourir les types de voyageurs sélectionnés
        Object.entries(formData.typesVoyageurs).forEach(([typeName, isSelected]) => {
            if (!isSelected) return;

            // Trouver la ressource correspondante
            const resource = niveauResources.resources.find(res => res.name === typeName);
            if (!resource) return;

            // Calculer le prix pour cette ressource selon son type
            const baseCost = parseFloat(resource.base_cost) || 0;
            const nombreMin = parseInt(resource.nombre_min) || 1;
            const nombreMax = parseInt(resource.nombre_max) || 999;
            const totalPersonnes = formData.voyageurs.adultes + formData.voyageurs.enfants;

            // Vérifier si le nombre total de personnes (adultes + enfants) est dans la plage autorisée
            if (totalPersonnes >= nombreMin && totalPersonnes <= nombreMax) {
                if (resource.type === 'individuel') {
                    // Pour les ressources individuelles : prix par personne
                    totalPrice += baseCost * totalPersonnes;
                } else {
                    // Pour les ressources en groupe/famille : prix fixe
                    totalPrice += baseCost;
                }
            } else {
                // Si le nombre de personnes n'est pas dans la plage, ne pas inclure cette ressource
                
            }
        });

        // Appliquer les remises groupes si disponibles
        if (circuit.remise_enfants_pourcentage && formData.voyageurs.enfants > 5) {
            const remiseEnfants = parseFloat(circuit.remise_enfants_pourcentage) / 100;
            totalPrice -= (totalPrice * remiseEnfants * 0.3); // 30% du prix pour les enfants
        }
        
        if (circuit.remise_adultes_pourcentage && formData.voyageurs.adultes > 5) {
            const remiseAdultes = parseFloat(circuit.remise_adultes_pourcentage) / 100;
            totalPrice -= (totalPrice * remiseAdultes * 0.7); // 70% du prix pour les adultes
        }

        return totalPrice;
    };
    const totalPrice = calculateTotalPrice();
    const selectedNiveau = Object.keys(formData.niveauxConfort).find(niveau => formData.niveauxConfort[niveau]);

    // Fonction pour vérifier les ressources applicables
    const getApplicableResources = () => {
        if (!selectedNiveau) return [];
        
        const niveauResources = circuit[`ressources_${selectedNiveau}`];
        if (!niveauResources?.resources) return [];

        const totalPersonnes = formData.voyageurs.adultes + formData.voyageurs.enfants;
        const applicableResources = [];
        const nonApplicableResources = [];

        Object.entries(formData.typesVoyageurs).forEach(([typeName, isSelected]) => {
            if (!isSelected) return;

            const resource = niveauResources.resources.find(res => res.name === typeName);
            if (!resource) return;

            const nombreMin = parseInt(resource.nombre_min) || 1;
            const nombreMax = parseInt(resource.nombre_max) || 999;

            if (totalPersonnes >= nombreMin && totalPersonnes <= nombreMax) {
                applicableResources.push(resource);
            } else {
                nonApplicableResources.push({ ...resource, nombreMin, nombreMax });
            }
        });

        return { applicableResources, nonApplicableResources };
    };

    const { applicableResources, nonApplicableResources } = getApplicableResources();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Récapitulatif et envoi</h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif de votre demande</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations du voyage */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Voyage</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Destination :</span> {formData.destination}</div>
                            <div><span className="font-medium">Date de départ :</span> {formData.dates.depart}</div>
                            <div><span className="font-medium">Date de retour :</span> {formData.dates.retour}</div>
                            <div><span className="font-medium">Ville de départ :</span> {formData.villeDepart}</div>
                            <div><span className="font-medium">Adultes :</span> {formData.voyageurs.adultes}</div>
                            <div><span className="font-medium">Enfants :</span> {formData.voyageurs.enfants}</div>
                            {formData.budget && <div><span className="font-medium">Budget :</span> {formData.budget}</div>}
                        </div>
                        
                        {/* Moyens de déplacement */}
                        {circuit.transport_vehicule_prive || circuit.transport_quad || circuit.transport_vtt || circuit.transport_marche ? (
                            <div className="mt-4">
                                <h5 className="font-medium text-gray-900 mb-2">Moyens de déplacement</h5>
                                <div className="flex flex-wrap gap-2">
                                    {circuit.transport_vehicule_prive && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Véhicule privé (4x4 ou minibus)</span>
                                    )}
                                    {circuit.transport_quad && (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Quad</span>
                                    )}
                                    {circuit.transport_vtt && (
                                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">VTT</span>
                                    )}
                                    {circuit.transport_marche && (
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Marche</span>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                    {/* Informations personnelles */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Coordonnées</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Civilité :</span> {formData.civilite}</div>
                            <div><span className="font-medium">Nom :</span> {formData.nom}</div>
                            <div><span className="font-medium">Prénom :</span> {formData.prenom}</div>
                            <div><span className="font-medium">Téléphone :</span> {formData.telephone}</div>
                            <div><span className="font-medium">Email :</span> {formData.email}</div>
                        </div>
                    </div>
                </div>

                {/* Options sélectionnées */}
                <div className="mt-6 space-y-3">
                    <h4 className="font-medium text-gray-900">Options sélectionnées</h4>
                    <div className="flex flex-wrap gap-2">
                        {formData.volInclus && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Sans vol</span>
                        )}
                        {formData.voyageNoces && (
                            <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">Voyage de noces</span>
                        )}
                        {Object.entries(formData.niveauxConfort).map(([niveau, checked]) => 
                            checked && (
                                <span key={niveau} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm capitalize">
                                    {niveau === 'Basic' ? '🟢 Basic' : niveau === 'Confort' ? '🔵 Confort' : '🟣 Premium'}
                                </span>
                            )
                        )}
                        {Object.entries(formData.typesVoyageurs).map(([type, checked]) => 
                            checked && (
                                <span key={type} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                    {type}
                                </span>
                            )
                        )}
                    </div>
                </div>
                {/* Projet */}
                {formData.projet && (
                    <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-2">Votre projet</h4>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {formData.projet}
                        </p>
                    </div>
                )}
            </div>

            {/* Tarifs et remises */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Tarifs et remises</h3>
                <div className="space-y-3">
                    {/* Remises groupes */}
                    {!circuit.a_de_remise ? (
                        <div className="space-y-2">
                            <h4 className="font-medium text-green-800">Remises groupes</h4>
                            <div className="text-sm text-green-700">
                                Aucune remise applicable pour ce circuit
                            </div>
                        </div>
                    ) : (circuit.remise_enfants_pourcentage || circuit.remise_adultes_pourcentage) ? (
                        <div className="space-y-2">
                            <h4 className="font-medium text-green-800">Remises groupes</h4>
                            {circuit.remise_enfants_pourcentage && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-green-700">Remise enfants :</span>
                                    <span className="font-semibold text-green-900">
                                        {circuit.remise_enfants_pourcentage}% (si groupe {'>'} 5 personnes)
                                    </span>
                                </div>
                            )}
                            {circuit.remise_adultes_pourcentage && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-green-700">Remise adultes :</span>
                                    <span className="font-semibold text-green-900">
                                        {circuit.remise_adultes_pourcentage}% (si groupe {'>'} 5 adultes)
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : null}
                    
                    {/* Application des remises */}
                    {circuit.a_de_remise && ((circuit.remise_enfants_pourcentage && formData.voyageurs.enfants > 5) || 
                      (circuit.remise_adultes_pourcentage && formData.voyageurs.adultes > 5)) && (
                        <div className="mt-3 p-3 bg-green-100 rounded border border-green-300">
                            <h5 className="font-medium text-green-800 mb-2">Remises appliquées</h5>
                            <div className="space-y-1 text-sm">
                                {circuit.remise_enfants_pourcentage && formData.voyageurs.enfants > 5 && (
                                    <div className="text-green-700">
                                        ✓ Remise enfants : {circuit.remise_enfants_pourcentage}% appliquée ({formData.voyageurs.enfants} enfants)
                                    </div>
                                )}
                                {circuit.remise_adultes_pourcentage && formData.voyageurs.adultes > 5 && (
                                    <div className="text-green-700">
                                        ✓ Remise adultes : {circuit.remise_adultes_pourcentage}% appliquée ({formData.voyageurs.adultes} adultes)
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Estimation de prix */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Estimation de prix</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-blue-800">Niveau de confort :</span>
                        <span className="font-semibold text-blue-900 capitalize">
                            {selectedNiveau === 'Basic' ? '🟢 Basic' : selectedNiveau === 'Confort' ? '🔵 Confort' : '🟣 Premium'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-800">Nombre de personnes :</span>
                        <span className="font-semibold text-blue-900">
                            {formData.voyageurs.adultes + formData.voyageurs.enfants} 
                            ({formData.voyageurs.adultes} adulte{formData.voyageurs.adultes > 1 ? 's' : ''}, 
                            {formData.voyageurs.enfants} enfant{formData.voyageurs.enfants > 1 ? 's' : ''})
                        </span>
                    </div>
                    <div className="border-t border-blue-300 pt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-blue-900">Prix estimé :</span>
                            <span className="text-2xl font-bold text-blue-900">
                                {totalPrice > 0 ? `${totalPrice.toFixed(2)}€` : 'Sur devis'}
                            </span>
                        </div>
                        {totalPrice === 0 && (
                            <p className="text-sm text-blue-700 mt-2">
                                * Le prix exact sera calculé par nos conseillers selon vos besoins spécifiques
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Confirmation de votre demande
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>
                                Votre demande de devis a été préparée. En cliquant sur "Valider votre devis", 
                                vous confirmez l'envoi de votre demande. Un conseiller vous contactera sous 48h 
                                pour finaliser votre projet de voyage.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 