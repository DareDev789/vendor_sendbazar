import React from 'react';

export default function DevisCircuit_2({ 
    formData, 
    handleInputChange,
    showErrors
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos coordonnées</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ma civilité *</label>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input 
                            type="radio" 
                            name="civilite" 
                            value="Monsieur" 
                            checked={formData.civilite === 'Monsieur'} 
                            onChange={(e) => handleInputChange('civilite', e.target.value)} 
                            className="w-4 h-4 text-[#f6858b] border-gray-300 focus:ring-[#f6858b]" 
                        />
                        <span className="ml-2 text-sm text-gray-700">Monsieur</span>
                    </label>
                    <label className="flex items-center">
                        <input 
                            type="radio" 
                            name="civilite" 
                            value="Madame" 
                            checked={formData.civilite === 'Madame'} 
                            onChange={(e) => handleInputChange('civilite', e.target.value)} 
                            className="w-4 h-4 text-[#f6858b] border-gray-300 focus:ring-[#f6858b]" 
                        />
                        <span className="ml-2 text-sm text-gray-700">Madame</span>
                    </label>
                </div>
                {showErrors && !formData.civilite && (
                    <p className="text-red-500 text-sm mt-1">Veuillez sélectionner votre civilité</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input 
                        type="text" 
                        value={formData.prenom} 
                        onChange={(e) => handleInputChange('prenom', e.target.value)} 
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent ${
                            showErrors && !formData.prenom ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required 
                    />
                    {showErrors && !formData.prenom && (
                        <p className="text-red-500 text-sm mt-1">Le prénom est requis</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input 
                        type="text" 
                        value={formData.nom} 
                        onChange={(e) => handleInputChange('nom', e.target.value)} 
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent ${
                            showErrors && !formData.nom ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required 
                    />
                    {showErrors && !formData.nom && (
                        <p className="text-red-500 text-sm mt-1">Le nom est requis</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input 
                        type="tel" 
                        value={formData.telephone} 
                        onChange={(e) => handleInputChange('telephone', e.target.value)} 
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent ${
                            showErrors && !formData.telephone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required 
                    />
                    {showErrors && !formData.telephone && (
                        <p className="text-red-500 text-sm mt-1">Le téléphone est requis</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)} 
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent ${
                            showErrors && !formData.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required 
                    />
                    {showErrors && !formData.email && (
                        <p className="text-red-500 text-sm mt-1">L'email est requis</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quel est le moment le plus opportun pour vous joindre ?</label>
                <select 
                    value={formData.momentContact} 
                    onChange={(e) => handleInputChange('momentContact', e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent"
                >
                    <option value="">Sélectionnez</option>
                    <option value="matin">Matin (9h-12h)</option>
                    <option value="apres-midi">Après-midi (14h-17h)</option>
                    <option value="soir">Soir (18h-20h)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment nous avez-vous connu ?</label>
                <select 
                    value={formData.source} 
                    onChange={(e) => handleInputChange('source', e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f6858b] focus:border-transparent"
                >
                    <option value="">Sélectionnez</option>
                    <option value="recherche">Recherche Google</option>
                    <option value="reseau">Réseaux sociaux</option>
                    <option value="recommandation">Recommandation</option>
                    <option value="publicite">Publicité</option>
                    <option value="autre">Autre</option>
                </select>
            </div>

            <div className="flex items-center">
                <input 
                    type="checkbox" 
                    id="newsletter" 
                    checked={formData.newsletter} 
                    onChange={(e) => handleInputChange('newsletter', e.target.checked)} 
                    className="w-4 h-4 text-[#f6858b] border-gray-300 rounded focus:ring-[#f6858b]" 
                />
                <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                    Je souhaite recevoir les communications de SendBazar
                </label>
            </div>
        </div>
    );
} 