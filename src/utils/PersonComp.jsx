import { faPeopleRoof, faTrash, faLink, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';

export default function PersonComp({ register, errors, watch, setValue }) {
    const [isOpen, setIsOpen] = useState(true);
    const id = 59819;
    const type = "Type de personne #1";
    const [rows, setRows] = useState([
        { nom1: '', nom2: '', coutFixe1: '', coutFixe2: '', bloc1: '', bloc2: '' }
    ]);
    const [draggedIdx, setDraggedIdx] = useState(null);
    const [enablePersonTypes, setEnablePersonTypes] = useState(false);

    // Synchroniser l'état initial avec le formulaire (reset)
    useEffect(() => {
        if (watch) {
            setEnablePersonTypes(!!watch('_wc_booking_has_person_types'));
        }
    }, [watch]);

    const handleAddRow = () => {
        setRows([...rows, { nom1: '', nom2: '', coutFixe1: '', coutFixe2: '', bloc1: '', bloc2: '' }]);
    };

    const handleRemoveRow = (idx) => {
        setRows(rows.filter((_, i) => i !== idx));
    };

    const handleRowChange = (idx, field, value) => {
        setRows(rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };

    const handleDragStart = (idx) => setDraggedIdx(idx);

    const handleDragOver = (e, idx) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === idx) return;
        const newRows = [...rows];
        const draggedRow = newRows[draggedIdx];
        newRows.splice(draggedIdx, 1);
        newRows.splice(idx, 0, draggedRow);
        setDraggedIdx(idx);
        setRows(newRows);
    };

    const handleDrop = () => setDraggedIdx(null);

    return (
        <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
            >
                <span><FontAwesomeIcon icon={faPeopleRoof} className="mr-3" /> Persons</span>
                <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
            </button>

            {isOpen && (
                <div className="flex flex-col mb-4">
                    <div className="flex flex-col gap-2 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min persons</label>
                            <input
                                type="number"
                                min="1"
                                {...register('_wc_booking_min_persons_group')}
                                className="p-2 border rounded border-gray-300 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max persons</label>
                            <input
                                type="number"
                                min="1"
                                {...register('_wc_booking_max_persons_group')}
                                className="p-2 border rounded border-gray-300 w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={watch('_wc_booking_person_cost_multiplier') == 1}
                                    onChange={e => setValue('_wc_booking_person_cost_multiplier', e.target.checked ? 1 : 0)}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm">Multiply all costs by person count</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={watch('_wc_booking_person_qty_multiplier') == 1}
                                    onChange={e => setValue('_wc_booking_person_qty_multiplier', e.target.checked ? 1 : 0)}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm">Count persons as bookings</span>
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={enablePersonTypes}
                                    onChange={e => {
                                        setEnablePersonTypes(e.target.checked);
                                        if (setValue) setValue('_wc_booking_has_person_types', e.target.checked ? 1 : 0);
                                    }}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm">Enable person types</span>
                            </label>
                        </div>
                    </div>
                    {enablePersonTypes && (
                        <div className="mb-4 flex flex-col gap-2">
                            <label className="text-[#f6858b] text-2xl font-bold">Person types</label>
                            <div>
                                <div className="border border-gray-300 rounded w-full">
                                    <div className="flex">
                                        <div className="w-10 p-2 border-b border-gray-300"></div>
                                        <div className="w-2/5 p-2 font-bold text-center border-b border-gray-300">Nom du type de personne:</div>
                                        <div className="w-2/5 p-2 font-bold text-center border-b border-gray-300 border-l border-gray-300">Coût fixe:</div>
                                        <div className="w-1/5 p-2 font-bold text-center border-b border-gray-300 border-l border-gray-300">Coût d'un bloc:</div>
                                        <div className="w-10 p-2 border-b border-gray-300"></div>
                                    </div>
                                    {rows.map((row, idx) => (
                                        <div
                                            className={`flex border-t border-gray-300 items-center ${draggedIdx === idx ? 'bg-gray-100' : ''}`}
                                            key={"form-" + idx}
                                            draggable
                                            onDragStart={() => handleDragStart(idx)}
                                            onDragOver={e => handleDragOver(e, idx)}
                                            onDrop={handleDrop}
                                            onDragEnd={handleDrop}
                                        >
                                            <div className="w-10 p-2 flex items-center justify-center cursor-grab text-gray-400">
                                                <FontAwesomeIcon icon={faBars} />
                                            </div>
                                            <div className="w-2/5 p-2 text-center text-sm flex flex-col gap-1">
                                                <input
                                                    type="text"
                                                    className="w-full p-1 border rounded"
                                                    placeholder="Nom 1"
                                                    value={row.nom1}
                                                    onChange={e => handleRowChange(idx, 'nom1', e.target.value)}
                                                    {...register(`_wc_booking_has_person_types.${idx}.nom1`)}
                                                />
                                                <div className="flex items-center gap-1 w-full">
                                                    <span className="text-xs text-gray-500">Description:</span>
                                                    <input
                                                        type="text"
                                                        className="w-full p-1 border rounded"
                                                        placeholder="Nom 2"
                                                        value={row.nom2}
                                                        onChange={e => handleRowChange(idx, 'nom2', e.target.value)}
                                                        {...register(`_wc_booking_has_person_types.${idx}.nom2`)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-2/5 p-2 border-l border-gray-300 text-center text-sm flex flex-col gap-1">
                                                <input
                                                    type="number"
                                                    className="w-full p-1 border rounded"
                                                    placeholder="Coût fixe 1"
                                                    step="0.01"
                                                    min="0"
                                                    value={row.coutFixe1}
                                                    onChange={e => handleRowChange(idx, 'coutFixe1', e.target.value)}
                                                    {...register(`_wc_booking_has_person_types.${idx}.coutFixe1`)}
                                                />
                                                <div className="flex items-center gap-1 w-full">
                                                    <span className="text-xs text-gray-500">Min:</span>
                                                    <input
                                                        type="number"
                                                        className="w-full p-1 border rounded"
                                                        placeholder="Coût fixe 2"
                                                        step="0.01"
                                                        min="0"
                                                        value={row.coutFixe2}
                                                        onChange={e => handleRowChange(idx, 'coutFixe2', e.target.value)}
                                                        {...register(`_wc_booking_has_person_types.${idx}.coutFixe2`)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-1/5 p-2 border-l border-gray-300 text-center text-sm flex flex-col gap-1">
                                                <input
                                                    type="number"
                                                    className="w-full p-1 border rounded"
                                                    placeholder="Bloc 1"
                                                    step="0.01"
                                                    min="0"
                                                    value={row.bloc1}
                                                    onChange={e => handleRowChange(idx, 'bloc1', e.target.value)}
                                                    {...register(`_wc_booking_has_person_types.${idx}.bloc1`)}
                                                />
                                                <div className="flex items-center gap-1 w-full">
                                                    <span className="text-xs text-gray-500">Max:</span>
                                                    <input
                                                        type="number"
                                                        className="w-full p-1 border rounded"
                                                        placeholder="Bloc 2"
                                                        step="0.01"
                                                        min="0"
                                                        value={row.bloc2}
                                                        onChange={e => handleRowChange(idx, 'bloc2', e.target.value)}
                                                        {...register(`_wc_booking_has_person_types.${idx}.bloc2`)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-10 p-2 flex items-center justify-center">
                                                <button type="button" onClick={() => handleRemoveRow(idx)} className="text-red-500 hover:text-red-700">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end mt-2">
                                        <button type="button" onClick={handleAddRow} className="bg-[#f6858b] hover:bg-[#b92b32] text-white font-bold py-1 px-4 rounded text-sm">
                                            Ajouter personne type
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
