import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPhone, faEnvelope, faArrowRight, faArrowLeft as faArrowLeftIcon } from '@fortawesome/free-solid-svg-icons';
import DevisCircuit_1 from './DevisCircuit_1.jsx';
import DevisCircuit_2 from './DevisCircuit_2.jsx';
import DevisCircuit_3 from './DevisCircuit_3.jsx';

const getLocalCircuits = () => {
    try {
        const circuits = localStorage.getItem('local_circuits');
        return circuits ? JSON.parse(circuits) : [];
    } catch (error) {
        console.error('Erreur lors de la récupération des circuits locaux:', error);
        return [];
    }
};

export default function DevisCircuit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [circuit, setCircuit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [showErrors, setShowErrors] = useState(false);
    const [formData, setFormData] = useState({
        destination: 'Madagascar',
        dates: { depart: '', retour: '' },
        villeDepart: '',
        volInclus: false,
        voyageNoces: false,
        niveauxConfort: { Basic: false, Confort: false, Premium: false },
        voyageurs: { adultes: 2, enfants: 0 },
        typesVoyageurs: {},
        budget: '',
        projet: '',
        civilite: '',
        prenom: '',
        nom: '',
        telephone: '',
        email: '',
        momentContact: '',
        source: '',
        newsletter: false
    });
    useEffect(() => {
        const loadCircuit = () => {
            if (location.state?.circuit) {
                setCircuit(location.state.circuit);
                setFormData(prev => ({ 
                    ...prev, 
                    destination: 'Madagascar',
                    typesVoyageurs: getTypesVoyageursFromCircuit(location.state.circuit)
                }));
                setLoading(false);
                return;
            }
            const circuits = getLocalCircuits();
            const foundCircuit = circuits.find(c => c.id.toString() === id);
            if (foundCircuit) {
                setCircuit(foundCircuit);
                setFormData(prev => ({ 
                    ...prev, 
                    destination: 'Madagascar',
                    typesVoyageurs: getTypesVoyageursFromCircuit(foundCircuit)
                }));
            }
            setLoading(false);
        };
        loadCircuit();
    }, [id, location.state]);

    const getTypesVoyageursFromCircuit = (circuit) => {
        const types = {};
        if (circuit.ressources_Basic?.resources) {
            circuit.ressources_Basic.resources.forEach(resource => {
                if (resource.name) {
                    types[resource.name] = false;
                }
            });
        }
        if (circuit.ressources_Confort?.resources) {
            circuit.ressources_Confort.resources.forEach(resource => {
                if (resource.name) {
                    types[resource.name] = false;
                }
            });
        }
        if (circuit.ressources_Premium?.resources) {
            circuit.ressources_Premium.resources.forEach(resource => {
                if (resource.name) {
                    types[resource.name] = false;
                }
            });
        }
        return types;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleDateChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            dates: { ...prev.dates, [field]: value }
        }));

        // Calculer automatiquement la date de retour si c'est la date de départ
        if (field === 'depart' && value && circuit) {
            const departDate = new Date(value);
            const dureeJours = parseInt(circuit.duree_jour) || 0;
            const retourDate = new Date(departDate);
            retourDate.setDate(departDate.getDate() + dureeJours);
            
            setFormData(prev => ({
                ...prev,
                dates: { 
                    ...prev.dates, 
                    depart: value,
                    retour: retourDate.toISOString().split('T')[0]
                }
            }));
        }
    };

    const handleNiveauConfortChange = (niveau) => {
        setFormData(prev => ({
            ...prev,
            niveauxConfort: { 
                Basic: false, 
                Confort: false, 
                Premium: false,
                [niveau]: true 
            },
            // Réinitialiser les types de voyageurs quand on change de niveau
            typesVoyageurs: {}
        }));
    };

    const handleTypeVoyageurChange = (type) => {
        setFormData(prev => ({
            ...prev,
            typesVoyageurs: { ...prev.typesVoyageurs, [type]: !prev.typesVoyageurs[type] }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Votre demande de devis a été envoyée ! Un conseiller vous contactera sous 48h.');
        navigate('/circuits');
    };

    const getNiveauxConfortDisponibles = () => {
        const niveaux = [];
        if (circuit?.niveauBasic) niveaux.push('Basic');
        if (circuit?.niveauConfort) niveaux.push('Confort');
        if (circuit?.niveauPremium) niveaux.push('Premium');
        return niveaux;
    };

    const getTypesVoyageursDisponibles = () => {
        const types = [];
        if (circuit?.ressources_Basic?.resources) {
            circuit.ressources_Basic.resources.forEach(resource => {
                if (resource.name && !types.includes(resource.name)) {
                    types.push(resource.name);
                }
            });
        }
        if (circuit?.ressources_Confort?.resources) {
            circuit.ressources_Confort.resources.forEach(resource => {
                if (resource.name && !types.includes(resource.name)) {
                    types.push(resource.name);
                }
            });
        }
        if (circuit?.ressources_Premium?.resources) {
            circuit.ressources_Premium.resources.forEach(resource => {
                if (resource.name && !types.includes(resource.name)) {
                    types.push(resource.name);
                }
            });
        }
        return types;
    };

    // Validation des étapes
    const isStep1Valid = () => {
        // Validation de base des champs requis
        const basicValidation = (
            formData.dates.depart &&
            formData.dates.retour &&
            formData.villeDepart &&
            formData.voyageurs.adultes > 0 &&
            formData.voyageurs.enfants >= 0 &&
            Object.values(formData.niveauxConfort).some(val => val) &&
            Object.values(formData.typesVoyageurs).some(val => val)
        );

        if (!basicValidation) return false;

        // Validation des plages min/max pour le nombre de personnes
        const selectedNiveau = Object.keys(formData.niveauxConfort).find(niveau => formData.niveauxConfort[niveau]);
        if (!selectedNiveau || !circuit) return false;

        const niveauResources = circuit[`ressources_${selectedNiveau}`];
        if (!niveauResources?.resources) return false;

        // Calculer les limites pour les ressources sélectionnées
        const selectedResources = Object.entries(formData.typesVoyageurs)
            .filter(([_, isSelected]) => isSelected)
            .map(([typeName, _]) => niveauResources.resources.find(res => res.name === typeName))
            .filter(resource => resource);

        if (selectedResources.length === 0) return false;

        // Prendre le plus grand des minimums et le plus petit des maximums
        const mins = selectedResources.map(res => parseInt(res.nombre_min) || 1);
        const maxs = selectedResources.map(res => parseInt(res.nombre_max) || 999);
        
        const minPersonnes = Math.max(...mins);
        const maxPersonnes = Math.min(...maxs);

        // Vérifier si le total est dans la plage
        const totalPersonnes = formData.voyageurs.adultes + formData.voyageurs.enfants;
        const isTotalInRange = totalPersonnes >= minPersonnes && totalPersonnes <= maxPersonnes;

        return isTotalInRange;
    };

    const isStep2Valid = () => {
        return (
            formData.civilite &&
            formData.prenom &&
            formData.nom &&
            formData.telephone &&
            formData.email
        );
    };

    const canGoToNextStep = () => {
        if (currentStep === 1) return isStep1Valid();
        if (currentStep === 2) return isStep2Valid();
        return true;
    };

    const handleNextStep = () => {
        if (canGoToNextStep() && currentStep < 3) {
            setCurrentStep(currentStep + 1);
            setShowErrors(false);
        } else {
            setShowErrors(true);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setShowErrors(false);
        }
    };

    const handleStepClick = (step) => {
        // Permettre de revenir en arrière, mais pas d'aller en avant sans validation
        if (step <= currentStep || (step === 2 && isStep1Valid()) || (step === 3 && isStep1Valid() && isStep2Valid())) {
            setCurrentStep(step);
            setShowErrors(false);
        } else {
            setShowErrors(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6858b] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
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
                    <button onClick={() => navigate('/circuits')} className="bg-[#f6858b] text-white px-6 py-2 rounded-lg hover:bg-[#b92b32] transition-colors">
                        Retour aux circuits
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button onClick={() => navigate(`/circuit/${circuit.id}`, { state: { circuit } })} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Retour au circuit
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Demander un devis</h1>
                    <p className="text-gray-600 mt-2">Faites-nous part de vos envies de voyage, vous êtes entre de bonnes mains</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Étapes */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-12">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <button
                                    onClick={() => handleStepClick(step)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                                        currentStep >= step 
                                            ? 'bg-[#f6858b] text-white shadow-lg scale-110' 
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                >
                                    {step}
                                </button>
                                {step < 3 && (
                                    <div className={`w-24 h-1 mx-6 rounded-full transition-all duration-200 ${
                                        currentStep > step ? 'bg-[#f6858b]' : 'bg-gray-200'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-6 space-x-20">
                        <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-[#f6858b]' : 'text-gray-500'}`}>
                            Voyage
                        </span>
                        <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-[#f6858b]' : 'text-gray-500'}`}>
                            Coordonnées
                        </span>
                        <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-[#f6858b]' : 'text-gray-500'}`}>
                            Envoi
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    {/* Étape 1: Voyage */}
                    {currentStep === 1 && (
                        <DevisCircuit_1
                            circuit={circuit}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleNestedChange={handleNestedChange}
                            handleDateChange={handleDateChange}
                            handleNiveauConfortChange={handleNiveauConfortChange}
                            handleTypeVoyageurChange={handleTypeVoyageurChange}
                            getNiveauxConfortDisponibles={getNiveauxConfortDisponibles}
                            getTypesVoyageursDisponibles={getTypesVoyageursDisponibles}
                            navigate={navigate}
                            showErrors={showErrors}
                        />
                    )}

                    {/* Étape 2: Coordonnées */}
                    {currentStep === 2 && (
                        <DevisCircuit_2
                            formData={formData}
                            handleInputChange={handleInputChange}
                            showErrors={showErrors}
                        />
                    )}

                    {/* Étape 3: Envoi */}
                    {currentStep === 3 && (
                        <form onSubmit={handleSubmit}>
                            <DevisCircuit_3
                                formData={formData}
                                circuit={circuit}
                            />
                            
                            {/* Bouton de soumission pour l'étape 3 */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                                <button 
                                    type="button"
                                    onClick={handlePreviousStep}
                                    className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    <FontAwesomeIcon icon={faArrowLeftIcon} className="mr-2" />
                                    Précédent
                                </button>
                                
                                <button 
                                    type="submit" 
                                    className="px-8 py-3 bg-[#f6858b] text-white rounded-lg hover:bg-[#b92b32] transition-colors font-semibold"
                                >
                                    Valider votre devis
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Boutons de navigation pour les étapes 1 et 2 */}
                    {currentStep < 3 && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                            {currentStep > 1 && (
                                <button 
                                    type="button"
                                    onClick={handlePreviousStep}
                                    className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    <FontAwesomeIcon icon={faArrowLeftIcon} className="mr-2" />
                                    Précédent
                                </button>
                            )}
                            
                            <button 
                                type="button"
                                onClick={handleNextStep}
                                className="flex items-center px-6 py-3 bg-[#f6858b] text-white rounded-lg hover:bg-[#b92b32] transition-colors font-semibold"
                            >
                                Suivant
                                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nous contacter</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-600">
                            <FontAwesomeIcon icon={faPhone} className="mr-3 w-4" />
                            <span>+33 1 23 45 67 89</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <FontAwesomeIcon icon={faEnvelope} className="mr-3 w-4" />
                            <span>contact@sendbazar.com</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Cet été, nos spécialistes sont à votre écoute du lundi au vendredi de 10h à 19h, et le samedi de 10h à 18h
                    </p>
                </div>
            </div>
        </div>
    );
} 