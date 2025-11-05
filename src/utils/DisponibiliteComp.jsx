import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function DisponibiliteComp({ register, errors, hideBufferOptions, productData, defaultOpen, watch, setValue }) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
  const [showDays, setShowDays] = useState(false);
  const [selectedRangeType, setSelectedRangeType] = useState('Plage des dates');
  const [ranges, setRanges] = useState([]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const initialized = useRef(false);
  const [isRestricted, setIsRestricted] = useState(false);

  // Initialiser ranges avec les données du produit si disponibles
  useEffect(() => {
    if (productData && productData.metaNow && Array.isArray(productData.metaNow._wc_booking_availability)) {
      const apiToTable = (item) => {
        const extractDate = (val) => {
          if (!val) return '';
          const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
          return match ? match[1] : '';
        };

        const extractTime = (val) => {
          if (!val) return '';
          const match = val.match(/(\d{2}:\d{2})$/);
          return match ? match[1] : '';
        };

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
        } else {
          type = item.type || '';
        }

        return {
          type,
          debut: item.debut || extractDate(item.from_date || item.from) || '',
          fin: item.fin || extractDate(item.to_date || item.to) || '',
          heureDebut: item.heureDebut ?? extractTime(item.from) ?? '',
          heureFin: item.heureFin ?? extractTime(item.to) ?? '',
          reservable: item.reservable || (item.bookable === 'yes' ? 'oui' : 'non'),
          priorite: item.priorite || item.priority || ''
        };
      };

      const initialRanges = productData.metaNow._wc_booking_availability.map(apiToTable);
      setRanges(initialRanges);
      if (setValue) setValue('_wc_booking_availability', initialRanges);
    }
  }, [productData, setValue]);

  useEffect(() => {
    const availability = watch && watch('_wc_booking_availability');
    let mapped = [];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const daysArray = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    if (Array.isArray(availability) && availability.length > 0) {
      mapped = availability.map(item => {
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
    } else if (!availability || availability.length === 0) {
      // Si le tableau est vide, on met une plage par défaut avec des valeurs vides
      const defaultRange = [{
        type: '',
        debut: '',
        fin: '',
        heureDebut: '',
        heureFin: '',
        reservable: '',
        priorite: ''
      }];
      setRanges(defaultRange);
      if (setValue) setValue('_wc_booking_availability', defaultRange);
    }
  }, [watch && watch('_wc_booking_availability')]);

  useEffect(() => {
    if (productData && productData.metaNow && typeof productData.metaNow._wc_booking_has_restricted_days === 'string') {
      const isYes = productData.metaNow._wc_booking_has_restricted_days === 'yes';
      setIsRestricted(isYes);
      setShowDays(isYes);
      if (setValue) setValue('_wc_booking_has_restricted_days', isYes ? 'yes' : 'no');
    }
    if (productData && productData.metaNow && productData.metaNow._wc_booking_restricted_days) {
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const restricted = {};
      days.forEach((day, idx) => {
        restricted[day] =
          productData.metaNow._wc_booking_restricted_days[day] === true ||
          productData.metaNow._wc_booking_restricted_days[day] === 'true' ||
          productData.metaNow._wc_booking_restricted_days[idx] === true ||
          productData.metaNow._wc_booking_restricted_days[idx] === 'true';
      });
      if (setValue) setValue('_wc_booking_restricted_days', restricted);
    }
  }, [productData, setValue]);

  useEffect(() => {
    const hasRestricted = watch && watch('_wc_booking_has_restricted_days');
    const isRestrictedValue = hasRestricted === 'yes';
    setIsRestricted(isRestrictedValue);
    setShowDays(isRestrictedValue);
  }, [watch && watch('_wc_booking_has_restricted_days')]);

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setIsRestricted(isChecked);
    setShowDays(isChecked);
    if (setValue) {
      setValue('_wc_booking_has_restricted_days', isChecked ? 'yes' : 'no');
      if (isChecked) {
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const restricted = days.reduce((acc, day) => {
          acc[day] = true;
          return acc;
        }, {});
        setValue('_wc_booking_restricted_days', restricted);
      }
    }
  };

  const handleDayCheckboxChange = (day) => (e) => {
    const isChecked = e.target.checked;
    if (setValue) {
      setValue(`_wc_booking_restricted_days.${day}`, isChecked);
    }
  };

  const handleAddRange = () => {
    const newRanges = [
      ...ranges,
      {
        type: '',
        debut: '',
        fin: '',
        heureDebut: '',
        heureFin: '',
        reservable: '',
        priorite: ''
      }
    ];
    setRanges(newRanges);
    if (setValue) setValue('_wc_booking_availability', newRanges);
  };

  const handleRangeChange = (idx, field, value) => {
    const newRanges = ranges.map((row, i) => i === idx ? { ...row, [field]: value } : row);
    setRanges(newRanges);
    if (setValue) setValue('_wc_booking_availability', newRanges);
  };

  const handleRemoveRange = (idx) => {
    const newRanges = ranges.filter((_, i) => i !== idx);
    setRanges(newRanges);
    if (setValue) setValue('_wc_booking_availability', newRanges);
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
    if (setValue) setValue('_wc_booking_availability', newRows);
  };

  const handleDrop = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full justify-between"
        >
          <span className="flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-3" />
            Disponibilité
            <span className="text-base font-normal text-gray-600 ml-2 self-center">
              Définir les options de disponibilité
            </span>
          </span>
          <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
        </button>
      </div>
      {isOpen && (
        <div className="grid grid-cols-1 gap-4">
          {hideBufferOptions ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de chambres disponibles</label>
              <input
                type="number"
                min="0"
                {...register('_wc_booking_qty')}
                className="p-2 border rounded border-gray-300 w-full"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Réservation maximimum par bloc</label>
              <input
                type="number"
                min="1"
                defaultValue={1}
                {...register('_wc_booking_qty')}
                className="p-2 border rounded border-gray-300 w-full"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fenêtre de réservation maximale (dans le futur)</label>
              <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                <input
                  type="number"
                  min="0"
                  defaultValue={0}
                  {...register('_wc_booking_max_date')}
                  className="p-3 border rounded border-gray-300 w-full md:w-full sm:w-32"
                />
                <select {...register('_wc_booking_max_date_unit')} className="p-3 border rounded border-gray-300 w-full md:w-full sm:w-32">
                  <option value="day">Jour</option>
                  <option value="month">Mois</option>
                  <option value="week">Semaine</option>
                  <option value="hour">Heure</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fenêtre de réservation minimale (dans le futur)</label>
              <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                <input
                  type="number"
                  defaultValue={0}
                  min="1"
                  {...register('_wc_booking_min_date')}
                  className="p-3 border rounded border-gray-300 w-full md:w-full sm:w-32"
                />
                <select {...register('_wc_booking_min_date_unit')} className="p-3 border rounded border-gray-300 w-full md:w-full sm:w-32">
                  <option value="day">Jour</option>
                  <option value="month">Mois</option>
                  <option value="week">Semaine</option>
                  <option value="hour">Heure</option>
                </select>
              </div>
            </div>
          </div>
          {!hideBufferOptions && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exiger une période tampon de (jour(s)) entre les réservations
                </label>
                <input
                  type="number"
                  min="0"
                  defaultValue={0}
                  {...register('_wc_booking_buffer_period')}
                  className="p-2 border rounded border-gray-300 w-full"
                />
              </div>

              <div className="mb-4 flex items-center gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('_wc_booking_apply_adjacent_buffer')}
                    checked={watch('_wc_booking_apply_adjacent_buffer') === 'yes'}
                    onChange={e => setValue('_wc_booking_apply_adjacent_buffer', e.target.checked ? 'yes' : 'no')}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm">Tampon adjacent ?</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Toutes les dates sont...</label>
                <select {...register('_wc_booking_default_date_availability')} className="p-3 border rounded border-gray-300 w-full md:w-full sm:w-32">
                  <option value="available">disponible par défaut</option>
                  <option value="unavailable">non disponible par défaut</option>
                </select>
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                  <span className="text-sm text-gray-500">Cette option affecte la façon dont vous utilisez les règles ci-dessous.</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vérifiez les règles par rapport à...</label>
                <select {...register('_wc_booking_check_availability_against')} className="p-3 border rounded border-gray-300 w-full md:w-full sm:w-32">
                  <option value="all_blocks">Tous les blocs en cours de réservation</option>
                  <option value="start_block">Le bloc de départ uniquement</option>
                </select>
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                  <span className="text-sm text-gray-500">Cette option affecte la manière dont la disponibilité des réservations est vérifiée.</span>
                </div>
              </div>
            </>
          )}
          <div className="mb-4 flex flex-col gap-2">
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={watch('_wc_booking_has_restricted_days') === 'yes'}
                  onChange={handleCheckboxChange}
                />
                <input type="hidden" {...register('_wc_booking_has_restricted_days')} value={watch('_wc_booking_has_restricted_days') || 'no'} />
                <span className="ml-2 text-sm">Restreindre les jours de début et de fin ?</span>
              </label>
            </div>
            {showDays && (
              <div className="border border-gray-300 p-4 rounded w-full">
                <div className="w-full overflow-auto">
                  <div className="flex justify-between min-w-[500px]">
                    {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day) => (
                      <div key={day} className="flex items-center">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            {...register(`_wc_booking_restricted_days.${day}`)}
                            className="form-checkbox h-4 w-4 text-blue-600"
                            checked={
                              watch && (
                                watch(`_wc_booking_restricted_days.${day}`) === true ||
                                watch(`_wc_booking_restricted_days.${day}`) === "true" ||
                                watch(`_wc_booking_restricted_days.${day}`) === true
                              )
                            }
                            onChange={handleDayCheckboxChange(day)}
                          />
                          <span className="ml-2 text-sm">{day}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mb-4 flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Définir la plage de disponibilité:</label>
          </div>
          <div className="mb-4 flex flex-col gap-2">
            <div className="w-full overflow-auto min-h-48">
              <div className="border border-gray-300 rounded w-full min-w-[600px]">
                <div className="flex">
                  <div className="w-10 p-2 border-b border-gray-300"></div>
                  <div className="w-2/5 p-2 font-bold text-center border-b border-gray-300">Type de plage</div>
                  <div className="w-2/5 p-2 font-bold text-center border-b border-gray-300 border-l border-gray-300">Plage</div>
                  <div className="w-1/5 p-2 font-bold text-center border-b border-gray-300 border-l border-gray-300">Réservable</div>
                  <div className="w-1/5 p-2 font-bold text-center border-b border-gray-300 border-l border-gray-300">Priorité</div>
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
                      <select className="w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.type} onChange={e => handleRangeChange(idx, 'type', e.target.value)}>
                        <option value="">Sélectionner</option>
                        {[
                          'Plage des dates',
                          'Plage des mois',
                          'Plage des semaines',
                          'Plage des jours'
                        ].map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                        <optgroup label="Plages de temps">
                          {[
                            'Plage de temps (toute semaine)',
                            'Plage de temps avec horaire',
                            'Lundi',
                            'Mardi',
                            'Mercredi',
                            'Jeudi',
                            'Vendredi',
                            'Samedi',
                            'Dimanche'
                          ].map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </optgroup>
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
                              <input type="date" className="custom-date w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.debut} onChange={e => handleRangeChange(idx, 'debut', e.target.value)} placeholder="Début" />
                            ) : (
                              <select className="w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.debut} onChange={e => handleRangeChange(idx, 'debut', e.target.value)}>
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
                              <input type="date" className="custom-date w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.fin} onChange={e => handleRangeChange(idx, 'fin', e.target.value)} placeholder="Fin" />
                            ) : (
                              <select className="w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.fin} onChange={e => handleRangeChange(idx, 'fin', e.target.value)}>
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
                          <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureDebut} onChange={e => handleRangeChange(idx, 'heureDebut', e.target.value)} placeholder="Début" />
                          <div className="flex items-center justify-center px-2">à</div>
                          <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureFin} onChange={e => handleRangeChange(idx, 'heureFin', e.target.value)} placeholder="Fin" />
                        </div>
                      )}
                      {row.type === 'Plage de temps avec horaire' && (
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex flex-row gap-2 w-full">
                            <input type="date" className="custom-date w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.debut} onChange={e => handleRangeChange(idx, 'debut', e.target.value)} placeholder="Date début" />
                            <div className="flex items-center justify-center px-2">à</div>
                            <input type="date" className="custom-date w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.fin} onChange={e => handleRangeChange(idx, 'fin', e.target.value)} placeholder="Date fin" />
                          </div>
                          <div className="flex flex-row gap-2 w-full">
                            <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureDebut} onChange={e => handleRangeChange(idx, 'heureDebut', e.target.value)} placeholder="Heure début" />
                            <div className="flex items-center justify-center px-2">à</div>
                            <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureFin} onChange={e => handleRangeChange(idx, 'heureFin', e.target.value)} placeholder="Heure fin" />
                          </div>
                        </div>
                      )}
                      {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].includes(row.type) && (
                        <div className="flex flex-row gap-2 w-full">
                          <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureDebut} onChange={e => handleRangeChange(idx, 'heureDebut', e.target.value)} placeholder="Début" />
                          <div className="flex items-center justify-center px-2">à</div>
                          <input type="time" className="custom-time w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.heureFin} onChange={e => handleRangeChange(idx, 'heureFin', e.target.value)} placeholder="Fin" />
                        </div>
                      )}
                    </div>
                    <div className="w-1/5 p-2 border-l border-gray-300">
                      <select className="w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.reservable} onChange={e => handleRangeChange(idx, 'reservable', e.target.value)}>
                        <option value="">Sélectionner</option>
                        <option value="oui">Oui</option>
                        <option value="non">Non</option>
                      </select>
                    </div>
                    <div className="w-1/5 p-2 border-l border-gray-300">
                      <input type="number" className="w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.priorite} onChange={e => handleRangeChange(idx, 'priorite', e.target.value)} />
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
            {/* Affichage du bouton Ajouter une plage toujours visible */}
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="w-full mb-2 md:mb-0 flex justify-center">
                <label className="block text-sm font-bold text-gray-700 text-center">
                  Les règles avec des nombres inférieurs seront exécutées en premier. Les règles plus bas dans ce tableau avec la même priorité seront également exécutées en premier.
                </label>
              </div>
              <div className="w-full md:w-1/4 flex justify-end">
                <button type="button" className="bg-[#f6858b] hover:bg-[#b92b32] text-white font-bold py-2 px-4 rounded text-sm w-full md:w-auto" onClick={handleAddRange}>
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