import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { faMoneyBillWaveAlt, faTrash, faBars } from '@fortawesome/free-solid-svg-icons';
import { useDevise } from '../contextes/DeviseContext';

// Fonction utilitaire pour formater la date en jj/mm/aaaa
function formatDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
}

// Fonction utilitaire pour forcer le format ISO (aaaa-mm-jj) pour input type='date'
function toISODateString(dateStr) {
    if (!dateStr) return "";
    // Si déjà au bon format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Si format jj/mm/aaaa
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    // Sinon, retourne vide
    return "";
}

export default function TarifsComp({ register, errors, watch, setValue, defaultOpen, productData }) {
    const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
    const [ranges, setRanges] = useState([]);
    const [draggedIdx, setDraggedIdx] = useState(null);
    const { devise, listDevise } = useDevise();

    // Ajout de logs pour diagnostiquer les données reçues
    useEffect(() => {
    }, [productData]);

    // Synchronisation améliorée avec productData
    useEffect(() => {
        if (productData && productData.metaNow && Array.isArray(productData.metaNow._wc_booking_pricing)) {
            const apiToTable = (item) => {
                let type = '';
                if (item.type?.startsWith('time:')) {
                    type = 'Plage de temps (toute semaine)';
                } else if (item.type === 'time:range') {
                    type = 'Plage de temps avec horaire';
                } else if (item.type === 'custom') {
                    type = 'Plage des dates';
                } else if (item.type === 'months') {
                    type = 'Plage des mois';
                } else if (item.type === 'weeks') {
                    type = 'Plage des semaines';
                } else if (item.type === 'days') {
                    type = 'Plage des jours';
                } else if (["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].includes(item.type)) {
                    type = item.type;
                } else if (item.type === 'time') {
                    type = 'Plage de temps (toute semaine)';
                } else if (item.type === 'persons') {
                    type = 'Plage de personnes';
                } else if (item.type === 'blocks') {
                    type = 'Plage de blocs';
                } else {
                    type = item.type || '';
                }

                return {
                    type,
                    debut: item.debut || item.from_date || item.from || '',
                    fin: item.fin || item.to_date || item.to || '',
                    heureDebut: item.heureDebut ?? item.from ?? null,
                    heureFin: item.heureFin ?? item.to ?? null,
                    cost: item.cost || '',
                    base_cost: item.base_cost || '',
                    cost_sign: item.modifier || item.cost_sign || '+',
                    base_cost_sign: item.base_modifier || item.base_cost_sign || '+',
                };
            };
            const initialRanges = productData.metaNow._wc_booking_pricing.map(apiToTable);
            setRanges(initialRanges);
            if (setValue) setValue('_wc_booking_pricing', initialRanges);
        } else if (productData && productData.metaNow && (!Array.isArray(productData.metaNow._wc_booking_pricing) || productData.metaNow._wc_booking_pricing.length === 0)) {
            // Si le tableau est vide, on met une plage par défaut avec des valeurs vides
            const defaultRange = [{
                type: '',
                debut: '',
                fin: '',
                heureDebut: '',
                heureFin: '',
                cost: '',
                base_cost: ''
            }];
            setRanges(defaultRange);
            if (setValue) setValue('_wc_booking_pricing', defaultRange);
        }
    }, [productData, setValue]);

    // Synchronisation avec le formulaire (watch)
    useEffect(() => {
        const pricing = watch && watch('_wc_booking_pricing');
        let mapped = [];
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const daysArray = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        if (Array.isArray(pricing) && pricing.length > 0) {
            mapped = pricing.map(item => {
                if (item.type === 'Plage des dates') {
                    return {
                        ...item,
                        debut: item.debut ?? item.from ?? '',
                        fin: item.fin ?? item.to ?? '',
                        heureDebut: item.heureDebut ?? '',
                        heureFin: item.heureFin ?? '',
                    };
                }
                if (item.type === 'Plage des mois') {
                    return {
                        ...item,
                        debut: item.debut ?? months[parseInt(item.from, 10) - 1],
                        fin: item.fin ?? months[parseInt(item.to, 10) - 1],
                        heureDebut: item.heureDebut ?? '',
                        heureFin: item.heureFin ?? '',
                    };
                }
                if (item.type === 'Plage des semaines') {
                    return {
                        ...item,
                        debut: item.debut ?? `Semaine ${item.from}`,
                        fin: item.fin ?? `Semaine ${item.to}`,
                        heureDebut: item.heureDebut ?? '',
                        heureFin: item.heureFin ?? '',
                    };
                }
                if (item.type === 'Plage des jours') {
                    return {
                        ...item,
                        debut: item.debut ?? daysArray[parseInt(item.from, 10)],
                        fin: item.fin ?? daysArray[parseInt(item.to, 10)],
                        heureDebut: item.heureDebut ?? '',
                        heureFin: item.heureFin ?? '',
                    };
                }
                if (item.type === 'Plage de temps (toute semaine)') {
                    return {
                        ...item,
                        debut: '',
                        fin: '',
                        heureDebut: item.heureDebut ?? item.from ?? '',
                        heureFin: item.heureFin ?? item.to ?? '',
                    };
                }
                if (item.type === 'Plage de temps avec horaire') {
                    return {
                        ...item,
                        debut: item.debut ?? item.from_date ?? '',
                        fin: item.fin ?? item.to_date ?? '',
                        heureDebut: item.heureDebut ?? item.from ?? '',
                        heureFin: item.heureFin ?? item.to ?? '',
                    };
                }
                return {
                    ...item,
                    debut: item.debut ?? '',
                    fin: item.fin ?? '',
                    heureDebut: item.heureDebut ?? '',
                    heureFin: item.heureFin ?? '',
                };
            });
            setRanges(mapped);
        } else if (!pricing || pricing.length === 0) {
            // Si le tableau est vide, on met une plage par défaut avec des valeurs vides
            const defaultRange = [{
                type: '',
                debut: '',
                fin: '',
                heureDebut: '',
                heureFin: '',
                cost: '',
                base_cost: ''
            }];
            setRanges(defaultRange);
            if (setValue) setValue('_wc_booking_pricing', defaultRange);
        }
    }, [watch && watch('_wc_booking_pricing')]);

    // Log pour vérifier les valeurs juste avant le rendu
    useEffect(() => {

    }, [watch && watch('_wc_booking_pricing'), watch && watch('_wc_booking_cost'), watch && watch('_wc_booking_block_cost'), watch && watch('_price')]);

    // Synchronisation stricte du state ranges avec le formulaire
    useEffect(() => {
        const pricing = watch && watch('_wc_booking_pricing');
        if (Array.isArray(pricing)) {
            setRanges(pricing);
        }
    }, [watch && watch('_wc_booking_pricing')]);

    const handleAddRange = () => {
        setRanges([
            ...ranges,
            {
                type: '',
                debut: '',
                fin: '',
                heureDebut: '',
                heureFin: '',
                cost: '',
                base_cost: ''
            }
        ]);
    };

    const handleRangeChange = (idx, field, value) => {
        const updatedRanges = ranges.map((row, i) => i === idx ? { ...row, [field]: value } : row);
        setRanges(updatedRanges);
        if (setValue) setValue('_wc_booking_pricing', updatedRanges);
    };

    const handleRemoveRange = (idx) => {
        const newRanges = ranges.filter((_, i) => i !== idx);
        setRanges(newRanges);
        if (setValue) setValue('_wc_booking_pricing', newRanges);
    };

    const handleDragStart = (idx) => {
        setDraggedIdx(idx);
    };

    const handleDragOver = (e, idx) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === idx) return;
        const newRows = [...ranges];
        const draggedRow = newRows[draggedIdx];
        newRows.splice(draggedIdx, 1);
        newRows.splice(idx, 0, draggedRow);
        setDraggedIdx(idx);
        setRanges(newRows);
        if (setValue) setValue('_wc_booking_pricing', newRows);
    };

    const handleDrop = () => {
        setDraggedIdx(null);
    };

    const allTypes = [
        'Plage des dates',
        'Plage des mois',
        'Plage des semaines',
        'Plage des jours',
        'Plage de temps (toute semaine)',
        'Plage de temps avec horaire',
        'Plage de personnes',
        'Plage de blocs',
        'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    ];

    return (
        <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
            <div className="mb-4">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
                >
                    <span className="flex items-center">
                        <FontAwesomeIcon icon={faMoneyBillWaveAlt} className="mr-3" />
                        Tarifs
                        <span className="text-base font-normal text-gray-600 ml-2 self-center">
                            Définir les options de coûts
                        </span>
                    </span>
                    <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
                </button>
            </div>
            {isOpen && (
                <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tarif de base</label>
                            <div className="flex">
                                <span className="inline-flex items-center justify-center px-3 text-sm text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l h-[42px] w-12 min-w-[48px]">
                                    {listDevise[devise]}
                                </span>
                                <input
                                    type="number"
                                    min={0}  
                                    step="any"
                                    {...register('_wc_booking_cost')}
                                    value={(watch('_wc_booking_cost') ?? '').toString().replace(',', '.')}
                                    onChange={e => setValue('_wc_booking_cost', e.target.value.replace(',', '.'))}
                                    onBlur={e => {
                                        let value = e.target.value.replace(',', '.');
                                        if (value !== '' && !isNaN(value)) {
                                            value = (Math.round(parseFloat(value) * 100) / 100).toFixed(2);
                                            setValue('_wc_booking_cost', value);
                                        }
                                    }}
                                    className="p-3 border rounded border-gray-300 w-full"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Coût du bloc</label>
                            <div className="flex">
                                <span className="inline-flex items-center justify-center px-3 text-sm text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l h-[42px] w-12 min-w-[48px]">
                                    {listDevise[devise]}
                                </span>
                                <input
                                    type="number"
                                    step="any"
                                    min={0}
                                    {...register('_wc_booking_block_cost')}
                                    value={(watch('_wc_booking_block_cost') || '').replace(',', '.')}
                                    onChange={e => setValue('_wc_booking_block_cost', e.target.value.replace(',', '.'))}
                                    className="p-3 border rounded border-gray-300 w-full"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Afficher le coût</label>
                        <div className="flex">
                            <span className="inline-flex items-center justify-center px-3 text-sm text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l h-[42px] w-12 min-w-[48px]">
                                {listDevise[devise]}
                            </span>
                            <input
                                type="number"
                                step="any"
                                min={0}
                                {...register('_price')}
                                value={(watch('_price') || '').replace(',', '.')}
                                onChange={e => setValue('_price', e.target.value.replace(',', '.'))}
                                onBlur={e => {
                                    let value = e.target.value.replace(',', '.');
                                    if (value !== '' && !isNaN(value)) {
                                        value = (Math.round(parseFloat(value) * 100) / 100).toFixed(2);
                                        setValue('_price', value);
                                    }
                                }}
                                className="p-2 border rounded border-gray-300 w-full"
                            />
                        </div>
                    </div>
                    <div className="mb-2 flex flex-col gap-2">
                        <div className="w-full overflow-auto min-h-48">
                            <div className="border border-gray-300 rounded w-full min-w-[1000px]">
                                <div className="flex">
                                    <div className="w-10 p-2 border-b border-gray-300"></div>
                                    <div className="w-2/5 p-2 font-bold text-center border-b border-gray-300">Type de plage</div>
                                    <div className="w-2/5 p-2 font-bold text-center border-b border-gray-300 border-l border-gray-300">Plage</div>
                                    <div className="w-1/5 p-2 font-bold text-center border-b border-gray-300 border-l border-gray-300">Tarif de base</div>
                                    <div className="w-1/5 p-2 font-bold text-center border-b border-gray-300 border-l border-gray-300">Coût du bloc</div>
                                    <div className="w-10 p-2 border-b border-gray-300"></div>
                                </div>
                                {ranges.map((row, idx) => (
                                    <div
                                        className={`flex border-t border-gray-300 items-center ${draggedIdx === idx ? 'bg-gray-100' : ''}`}
                                        key={"range-" + idx}
                                        draggable
                                        onDragStart={() => handleDragStart(idx)}
                                        onDragOver={e => handleDragOver(e, idx)}
                                        onDrop={handleDrop}
                                        onDragEnd={handleDrop}
                                    >
                                        <div className="w-10 p-2 flex items-center justify-center cursor-grab text-gray-400">
                                            <FontAwesomeIcon icon={faBars} />
                                        </div>
                                        <div className="w-2/5 p-2">
                                            <select className="w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.type || ""} onChange={e => handleRangeChange(idx, 'type', e.target.value)}>
                                                <option value="">Sélectionner</option>
                                                {allTypes.map((item) => (
                                                    <option key={item} value={item}>{item}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-2/5 p-2 border-l border-gray-300 flex flex-col gap-2 items-center justify-center">
                                            {!row.type && (
                                                <div className="flex flex-row gap-2 w-full items-center justify-center text-gray-400">
                                                    <span>----</span>
                                                    <span>à</span>
                                                    <span>----</span>
                                                </div>
                                            )}
                                            {['Plage des dates', 'Plage des mois', 'Plage des semaines', 'Plage des jours'].includes(row.type) && (
                                                <div className="flex flex-row gap-2 w-full">
                                                    <div className="w-full">
                                                        {row.type === 'Plage des dates' ? (
                                                            <input type="date" className="custom-date w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={toISODateString(row.debut)} onChange={e => handleRangeChange(idx, 'debut', e.target.value)} placeholder="Début" />
                                                        ) : (
                                                            <select className="w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.debut || ""} onChange={e => handleRangeChange(idx, 'debut', e.target.value)}>
                                                                <option value="">Sélectionner</option>
                                                                {row.type === 'Plage des mois' && ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map(mois => (
                                                                    <option key={mois} value={mois}>{mois}</option>
                                                                ))}
                                                                {row.type === 'Plage des semaines' && Array.from({ length: 53 }, (_, i) => `Semaine ${i + 1}`).map(semaine => (
                                                                    <option key={semaine} value={semaine}>{semaine}</option>
                                                                ))}
                                                                {row.type === 'Plage des jours' && ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(jour => (
                                                                    <option key={jour} value={jour}>{jour}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-center px-2">à</div>
                                                    <div className="w-full">
                                                        {row.type === 'Plage des dates' ? (
                                                            <input type="date" className="custom-date w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={toISODateString(row.fin)} onChange={e => handleRangeChange(idx, 'fin', e.target.value)} placeholder="Fin" />
                                                        ) : (
                                                            <select className="w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.fin || ""} onChange={e => handleRangeChange(idx, 'fin', e.target.value)}>
                                                                <option value="">Sélectionner</option>
                                                                {row.type === 'Plage des mois' && ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map(mois => (
                                                                    <option key={mois} value={mois}>{mois}</option>
                                                                ))}
                                                                {row.type === 'Plage des semaines' && Array.from({ length: 53 }, (_, i) => `Semaine ${i + 1}`).map(semaine => (
                                                                    <option key={semaine} value={semaine}>{semaine}</option>
                                                                ))}
                                                                {row.type === 'Plage des jours' && ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(jour => (
                                                                    <option key={jour} value={jour}>{jour}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {row.type === 'Plage de temps (toute semaine)' && (
                                                <div className="flex flex-row gap-2 w-full">
                                                    <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureDebut || ""} onChange={e => handleRangeChange(idx, 'heureDebut', e.target.value)} placeholder="Début" />
                                                    <div className="flex items-center justify-center px-2">à</div>
                                                    <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureFin || ""} onChange={e => handleRangeChange(idx, 'heureFin', e.target.value)} placeholder="Fin" />
                                                </div>
                                            )}
                                            {row.type === 'Plage de temps avec horaire' && (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <div className="flex flex-row gap-2 w-full">
                                                        <input type="date" className="custom-date w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.debut || ""} onChange={e => handleRangeChange(idx, 'debut', e.target.value)} placeholder="Date début" />
                                                        <div className="flex items-center justify-center px-2">à</div>
                                                        <input type="date" className="custom-date w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.fin || ""} onChange={e => handleRangeChange(idx, 'fin', e.target.value)} placeholder="Date fin" />
                                                    </div>
                                                    <div className="flex flex-row gap-2 w-full">
                                                        <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureDebut || ""} onChange={e => handleRangeChange(idx, 'heureDebut', e.target.value)} placeholder="Heure début" />
                                                        <div className="flex items-center justify-center px-2">à</div>
                                                        <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureFin || ""} onChange={e => handleRangeChange(idx, 'heureFin', e.target.value)} placeholder="Heure fin" />
                                                    </div>
                                                </div>
                                            )}
                                            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].includes(row.type) && (
                                                <div className="flex flex-row gap-2 w-full">
                                                    <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureDebut || ""} onChange={e => handleRangeChange(idx, 'heureDebut', e.target.value)} placeholder="Début" />
                                                    <div className="flex items-center justify-center px-2">à</div>
                                                    <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureFin || ""} onChange={e => handleRangeChange(idx, 'heureFin', e.target.value)} placeholder="Fin" />
                                                </div>
                                            )}
                                            {['Plage de personnes', 'Plage de blocs'].includes(row.type) && (
                                                <div className="flex flex-row gap-2 w-full">
                                                    <input
                                                        type="number"
                                                        className="w-full md:w-full sm:w-32 py-3 px-2 border rounded"
                                                        value={row.debut || ''}
                                                        onChange={e => handleRangeChange(idx, 'debut', e.target.value)}
                                                        placeholder="Début"
                                                        min="0"
                                                    />
                                                    <div className="flex items-center justify-center px-2">à</div>
                                                    <input
                                                        type="number"
                                                        className="w-full md:w-full sm:w-32 py-3 px-2 border rounded"
                                                        value={row.fin || ''}
                                                        onChange={e => handleRangeChange(idx, 'fin', e.target.value)}
                                                        placeholder="Fin"
                                                        min="0"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-1/5 p-2 border-l border-gray-300 flex flex-col items-center justify-center gap-1">
                                            <select
                                                className="p-2 border rounded w-full md:w-full sm:w-32 mb-1"
                                                value={row.base_cost_sign || "+"}
                                                onChange={e => handleRangeChange(idx, 'base_cost_sign', e.target.value)}
                                            >
                                                <option value="+">+</option>
                                                <option value="-">-</option>
                                                <option value="*">*</option>
                                                <option value="/">÷</option>
                                            </select>
                                            <div className="flex w-full">
                                                <span className="inline-flex items-center justify-center px-2 text-xs text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l w-10 min-w-[40px]">
                                                    {listDevise[devise]}
                                                </span>
                                                <input type="number" value={row.base_cost || ""} onChange={e => handleRangeChange(idx, 'base_cost', e.target.value)} className="w-full py-3 px-2 border rounded" step="0.001" min="0" placeholder="Tarif de base" />
                                            </div>
                                        </div>
                                        <div className="w-1/5 p-2 border-l border-gray-300 flex flex-col items-center justify-center gap-1">
                                            <select
                                                className="p-2 border rounded w-full md:w-full sm:w-32 mb-1"
                                                value={row.cost_sign || "+"}
                                                onChange={e => handleRangeChange(idx, 'cost_sign', e.target.value)}
                                            >
                                                <option value="+">+</option>
                                                <option value="-">-</option>
                                                <option value="*">*</option>
                                                <option value="/">÷</option>
                                            </select>
                                            <div className="flex w-full">
                                                <span className="inline-flex items-center justify-center px-2 text-xs text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l w-10 min-w-[40px]">
                                                    {listDevise[devise]}
                                                </span>
                                                <input type="number" value={row.cost || ""} onChange={e => handleRangeChange(idx, 'cost', e.target.value)} className="w-full py-3 px-2 border rounded" step="0.001" min="0" placeholder="Coût du bloc" />
                                            </div>
                                        </div>
                                        <div className="w-10 p-2 flex items-center justify-center">
                                            <button type="button" onClick={() => handleRemoveRange(idx)} className="text-red-500 hover:text-red-700">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between mt-2">
                            <div className="w-full mb-2 md:mb-0 flex justify-center">
                                <label className="block text-sm font-bold text-gray-700 text-center">
                                    Toutes les règles de correspondance seront appliquées à la réservation.
                                </label>
                            </div>
                            <div className="w-full md:w-1/4 flex justify-end">
                                <button type="button" className="mt-2 px-4 py-2 bg-[#f6858b] text-white rounded hover:bg-[#b92b32] self-end" onClick={handleAddRange}>
                                    Ajouter une plage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
