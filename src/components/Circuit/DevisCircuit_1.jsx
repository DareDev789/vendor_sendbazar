import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
export default function DevisCircuit_1({ 
    circuit, 
    formData, 
    handleInputChange, 
    handleNestedChange, 
    handleDateChange, 
    handleNiveauConfortChange, 
    handleTypeVoyageurChange,
    getNiveauxConfortDisponibles,
    getTypesVoyageursDisponibles,
    navigate,
    showErrors
}) {
    // Fonction pour obtenir les types de voyageurs selon le niveau de confort sélectionné
    const getTypesVoyageursForNiveau = (niveauConfort) => {
        if (!niveauConfort || !circuit) return [];
        const types = [];
        if (circuit[`ressources_${niveauConfort}`]?.resources) {
            circuit[`ressources_${niveauConfort}`].resources.forEach(resource => {
                if (resource.name && !types.includes(resource.name)) {
                    types.push(resource.name);
                }
            });
        }
        return types;
    };
    // Fonction pour obtenir les limites min/max de personnes selon le niveau de confort
    const getLimitesVoyageurs = (niveauConfort) => {
        if (!circuit || !niveauConfort) return { minPersonnes: 1, maxPersonnes: 999 };
        
        const ressourcesKey = `ressources_${niveauConfort}`;
        const ressources = circuit[ressourcesKey];
        
        if (!ressources || !ressources.resources) return { minPersonnes: 1, maxPersonnes: 999 };
        
        let minPersonnes = 1;
        let maxPersonnes = 999;
        
        // Trouver les plages min/max parmi toutes les ressources sélectionnées
        const selectedResources = Object.entries(formData.typesVoyageurs)
            .filter(([_, isSelected]) => isSelected)
            .map(([typeName, _]) => ressources.resources.find(res => res.name === typeName))
            .filter(resource => resource);
        
        if (selectedResources.length > 0) {
            // Prendre le minimum des min et le maximum des max
            const mins = selectedResources.map(res => parseInt(res.nombre_min) || 1);
            const maxs = selectedResources.map(res => parseInt(res.nombre_max) || 999);
            
            minPersonnes = Math.max(...mins); // Le plus grand des minimums
            maxPersonnes = Math.min(...maxs); // Le plus petit des maximums
        }
        
        return { minPersonnes, maxPersonnes };
    };
    // Obtenir le niveau de confort actuellement sélectionné
    const selectedNiveau = Object.keys(formData.niveauxConfort).find(niveau => formData.niveauxConfort[niveau]);
    
    // Obtenir les limites pour le niveau sélectionné
    const limites = getLimitesVoyageurs(selectedNiveau);
    
    // Calculer le nombre total de personnes
    const totalPersonnes = formData.voyageurs.adultes + formData.voyageurs.enfants;
    
    // Vérifier si le total est dans la plage autorisée ET qu'il y a au moins un adulte
    const isTotalInRange = totalPersonnes >= limites.minPersonnes && totalPersonnes <= limites.maxPersonnes;
    const hasAtLeastOneAdult = formData.voyageurs.adultes > 0;
    const isValidationValid = isTotalInRange && hasAtLeastOneAdult;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Votre voyage</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ma destination *</label>
                <input 
                    type="text" 
                    value="Madagascar" 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" 
                    readOnly 
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de départ *</label>
                    <input 
                        type="date" 
                        value={formData.dates.depart} 
                        onChange={(e) => handleDateChange('depart', e.target.value)} 
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent ${
                            showErrors && !formData.dates.depart ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required 
                    />
                    {showErrors && !formData.dates.depart && (
                        <p className="text-red-500 text-sm mt-1">La date de départ est requise</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de retour</label>
                    <input 
                        type="date" 
                        value={formData.dates.retour} 
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" 
                        readOnly 
                    />
                    {circuit.duree_jour && (
                        <p className="text-xs text-gray-500 mt-1">
                            Durée du circuit : {circuit.duree_jour} jour{circuit.duree_jour > 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville de départ *</label>
                <input 
                    type="text" 
                    value={formData.villeDepart} 
                    onChange={(e) => handleInputChange('villeDepart', e.target.value)} 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent ${
                        showErrors && !formData.villeDepart ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required 
                />
                {showErrors && !formData.villeDepart && (
                    <p className="text-red-500 text-sm mt-1">La ville de départ est requise</p>
                )}
            </div>
            <div className="space-y-4">
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        id="volInclus" 
                        checked={formData.volInclus} 
                        onChange={(e) => handleInputChange('volInclus', e.target.checked)} 
                        className="w-4 h-4 text-[#f6858b] border-gray-300 rounded focus:ring-[#f6858b]" 
                    />
                    <label htmlFor="volInclus" className="ml-2 text-sm text-gray-700">Je n'ai pas besoin de vol</label>
                </div>
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        id="voyageNoces" 
                        checked={formData.voyageNoces} 
                        onChange={(e) => handleInputChange('voyageNoces', e.target.checked)} 
                        className="w-4 h-4 text-[#f6858b] border-gray-300 rounded focus:ring-[#f6858b]" 
                    />
                    <label htmlFor="voyageNoces" className="ml-2 text-sm text-gray-700">Voyage de noces</label>
                </div>
            </div>
            {/* Niveaux de confort - Radio buttons */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Niveaux de confort disponibles *</label>
                <div className="space-y-2">
                    {getNiveauxConfortDisponibles().map((niveau) => (
                        <div key={niveau} className="flex items-center">
                            <input 
                                type="radio" 
                                name="niveauConfort"
                                id={`niveau-${niveau}`} 
                                checked={formData.niveauxConfort[niveau]} 
                                onChange={() => handleNiveauConfortChange(niveau)} 
                                className="w-4 h-4 text-[#f6858b] border-gray-300 focus:ring-[#f6858b]" 
                                required
                            />
                            <label htmlFor={`niveau-${niveau}`} className="ml-2 text-sm text-gray-700 capitalize">
                                {niveau === 'Basic' ? 'Basic' : niveau === 'Confort' ? 'Confort' : 'Premium'}
                            </label>
                        </div>
                    ))}
                </div>
                {showErrors && !Object.values(formData.niveauxConfort).some(val => val) && (
                    <p className="text-red-500 text-sm mt-1">Veuillez sélectionner un niveau de confort</p>
                )}
            </div>
            {/* Types de voyageurs - Dynamique selon le niveau sélectionné */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Types de voyageurs disponibles *</label>
                {!selectedNiveau ? (
                    <div className="text-gray-500 text-sm italic">
                        Sélectionnez un niveau de confort pour voir les types de voyage disponibles
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {getTypesVoyageursForNiveau(selectedNiveau).map((type) => (
                            <div key={type} className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id={`type-${type}`} 
                                    checked={formData.typesVoyageurs[type] || false} 
                                    onChange={() => handleTypeVoyageurChange(type)} 
                                    className="w-4 h-4 text-[#f6858b] border-gray-300 rounded focus:ring-[#f6858b]" 
                                    required
                                />
                                <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                                    {type}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                {showErrors && selectedNiveau && !Object.values(formData.typesVoyageurs).some(val => val) && (
                    <p className="text-red-500 text-sm mt-1">Veuillez sélectionner au moins un type de voyageur</p>
                )}
            </div>

            {/* Nombre de voyageurs */}
            <div>
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de voyageurs *
                        {selectedNiveau && (
                            <span className="text-xs text-gray-500 ml-2">
                                (Plage autorisée : {limites.minPersonnes}-{limites.maxPersonnes} personnes)
                            </span>
                        )}                  
                    </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adultes (+12 ans) *
                        </label>
                        <input 
                            type="number" 
                            min="1" 
                            value={formData.voyageurs.adultes} 
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                handleNestedChange('voyageurs', 'adultes', value);
                            }} 
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent ${
                                showErrors && formData.voyageurs.adultes <= 0 ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enfants (0 à 12 ans) *
                        </label>
                        <input 
                            type="number" 
                            min="0" 
                            value={formData.voyageurs.enfants} 
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                handleNestedChange('voyageurs', 'enfants', value);
                            }} 
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent ${
                                showErrors && formData.voyageurs.enfants < 0 ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required 
                        />
                    </div>
                </div>
                {/* Validation du nombre de voyageurs */}
                {selectedNiveau && (
                    <div className="mt-3">
                        {!isValidationValid && (
                            <div className="p-2 bg-orange-100 border border-orange-300 rounded text-sm text-orange-700 mb-2">
                                ⚠️ Validation requise :
                                {!hasAtLeastOneAdult && (
                                    <div>• Au moins un adulte est requis</div>
                                )}
                                {!isTotalInRange && (
                                    <div>• Le nombre total de personnes ({totalPersonnes}) doit être entre {limites.minPersonnes} et {limites.maxPersonnes} pour les ressources sélectionnées</div>
                                )}
                            </div>
                        )}
                        <div className="text-sm text-gray-600">
                            Total : {totalPersonnes} personne{totalPersonnes > 1 ? 's' : ''}
                            <span className={`ml-2 ${isValidationValid ? 'text-green-600' : 'text-red-600'}`}>
                                {isValidationValid ? '✓' : '✗'} Validation OK
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Je précise mon projet</label>
                <textarea 
                    value={formData.projet} 
                    onChange={(e) => handleInputChange('projet', e.target.value)} 
                    rows="4" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent" 
                    placeholder="Décrivez vos envies, vos préférences, vos contraintes..."
                ></textarea>
            </div>
        </div>
    );
} 