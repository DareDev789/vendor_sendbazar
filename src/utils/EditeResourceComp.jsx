import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { url } from '../contextes/UrlContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTrash, faList, faTasks, faCalendarAlt, faCogs } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Notiflix from 'notiflix';
import nProgress from 'nprogress';
import ClipLoader from 'react-spinners/ClipLoader';

export default function EditeResourceComp(props) {
  const params = useParams();
  const id = props.id || params.id;
  const onSaved = props.onSaved;
  const [ranges, setRanges] = useState([
    {
      type: 'Plage des dates',
      debut: '',
      fin: '',
      heureDebut: '',
      heureFin: '',
      reservable: 'oui',
      priorite: ''
    }
  ]);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [selectedRangeType, setSelectedRangeType] = useState('Plage des dates');
  const [resourceTitle, setResourceTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Onglet actif simulé pour EditResourceComp
  const activeTab = 'ressources';

  useEffect(() => {
    const fetchAndPopulate = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem('token');
        setIsFetching(true);
        const response = await axios.get(`${url}/resource/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = response?.data;
        const found = (data?.resource || data);
        
        if (!found) {
          setResourceTitle('-');
          setQuantity(1);
          return;
        }

        const metaNow = found.metaNow || {};
        setResourceTitle(found.post_title || found.name || '-');
        setQuantity(metaNow.qty ? String(metaNow.qty) : '');

        const availabilityRaw = metaNow.wc_booking_availability ?? metaNow._wc_booking_availability ?? [];
        const availability = Array.isArray(availabilityRaw) ? availabilityRaw : [];
        const mapped = availability.map((item) => {
          const bookable = (item.bookable || '').toString().toLowerCase() === 'yes' ? 'oui' : 'non';
          const priorite = item.priority != null ? String(item.priority) : '';
          const from = item.from || '';
          const to = item.to || '';
          const type = item.type || '';

          // Date range
          if (type === 'custom') {
            return {
              type: 'Plage des dates',
              debut: from,
              fin: to,
              heureDebut: '',
              heureFin: '',
              reservable: bookable,
              priorite
            };
          }
          // Time range for a specific weekday (time:1 -> Lundi ... time:7 -> Dimanche)
          const timeDayMatch = /^time:(\d+)/.exec(type);
          if (timeDayMatch) {
            const dayIndex = Number(timeDayMatch[1]);
            const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
            const dayLabel = days[dayIndex - 1] || 'Lundi';
            return {
              type: dayLabel,
              debut: '',
              fin: '',
              heureDebut: from,
              heureFin: to,
              reservable: bookable,
              priorite
            };
          }
          // Time range any week
          if (type === 'time' || type.startsWith('time')) {
            return {
              type: 'Plage de temps (toute semaine)',
              debut: '',
              fin: '',
              heureDebut: from,
              heureFin: to,
              reservable: bookable,
              priorite
            };
          }
          // Fallback to generic dates
          return {
            type: 'Plage des dates',
            debut: from,
            fin: to,
            heureDebut: '',
            heureFin: '',
            reservable: bookable,
            priorite
          };
        });
        if (mapped.length > 0) setRanges(mapped);

        
      } catch (e) {
        setResourceTitle('-');
        setQuantity('');
      } finally {
        setIsFetching(false);
      }
    };
    fetchAndPopulate();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    try {
      setIsSaving(true);
      nProgress.start();
      const token = localStorage.getItem('token');

      const availability = ranges.map((row) => {
        const reservable = (row.reservable || '').toString().toLowerCase() === 'oui' ? 'yes' : 'no';
        const priorityNum = row.priorite ? Number(row.priorite) : undefined;

        if (['Plage des dates', 'Plage des mois', 'Plage des semaines', 'Plage des jours'].includes(row.type)) {
          return {
            type: 'custom',
            bookable: reservable,
            priority: priorityNum ?? 10,
            from: row.debut || '',
            to: row.fin || ''
          };
        }
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const dayIdx = days.indexOf(row.type);
        if (dayIdx !== -1) {
          return {
            type: `time:${dayIdx + 1}`,
            bookable: reservable,
            priority: priorityNum ?? 10,
            from: row.heureDebut || '',
            to: row.heureFin || ''
          };
        }
        if (row.type === 'Plage de temps (toute semaine)') {
          return {
            type: 'time',
            bookable: reservable,
            priority: priorityNum ?? 10,
            from: row.heureDebut || '',
            to: row.heureFin || ''
          };
        }
        return {
          type: 'custom',
          bookable: reservable,
          priority: priorityNum ?? 10,
          from: row.debut || '',
          to: row.fin || ''
        };
      });

      const payload = {
        post_title: resourceTitle,
        // Align with backend meta keys seen in response: qty, wc_booking_availability
        qty: String(quantity ?? 1),
        wc_booking_availability: availability,
        // Some backends expect this alias
        booking_avalability: availability
      };
      

      const putResponse = await axios.put(`${url}/resource/${id}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      Notiflix.Notify.success('Ressource mise à jour avec succès');
      if (typeof onSaved === 'function') {
        onSaved();
      }
    } catch (e) {
      if (e.response) {
        console.error('Erreur lors de la mise à jour de la ressource (response)', e.response.status, e.response.data);
      } else {
        console.error('Erreur lors de la mise à jour de la ressource', e);
      }
      Notiflix.Notify.failure('Échec de la mise à jour de la ressource');
    } finally {
      nProgress.done();
      setIsSaving(false);
    }
  };

  const handleAddRange = () => {
    setRanges([
      ...ranges,
      {
        type: selectedRangeType,
        debut: '',
        fin: '',
        heureDebut: '',
        heureFin: '',
        reservable: 'oui',
        priorite: ''
      }
    ]);
  };

  const handleRangeChange = (idx, field, value) => {
    setRanges(ranges.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleRemoveRange = (idx) => {
    setRanges(ranges.filter((_, i) => i !== idx));
  };

  const handleDragStart = (idx) => setDraggedIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newRows = [...ranges];
    const draggedRow = newRows[draggedIdx];
    newRows.splice(draggedIdx, 1);
    newRows.splice(idx, 0, draggedRow);
    setDraggedIdx(idx);
    setRanges(newRows);
  };
  const handleDrop = () => setDraggedIdx(null);

  return (
    <div className="w-full bg-white p-6 rounded shadow-md mx-auto">
      {isFetching ? (
        <div className="w-full py-16 flex items-center justify-center">
          <ClipLoader color="#ec4899" size={42} />
        </div>
      ) : (
      <>
      <h1 className="text-4xl font-bold text-pink-400 mb-6">Edit Resource</h1>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1">Titre de la ressource</label>
        <input
          type="text"
          value={resourceTitle}
          onChange={e => setResourceTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1">Quantité disponible</label>
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      {/* Tableau de plages et bouton Ajouter une plage ici */}
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
                    {['Plage des dates', 'Plage des mois', 'Plage des semaines', 'Plage des jours'].includes(row.type) && (
                      <div className="flex flex-row gap-2 w-full">
                        <div className="w-full">
                          {row.type === 'Plage des dates' ? (
                            <input type="date" className="custom-date w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.debut} onChange={e => handleRangeChange(idx, 'debut', e.target.value)} placeholder="Début" />
                          ) : (
                            <select className="w-full md:w-full sm:w-32 py-3 px-2 border rounded" value={row.debut} onChange={e => handleRangeChange(idx, 'debut', e.target.value)}>
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
      <button
        className={`w-full ${isSaving ? 'bg-purple-400' : 'bg-purple-700 hover:bg-purple-800'} text-white py-3 rounded-md transition disabled:opacity-60`}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <span className="flex items-center gap-2 justify-center">
            <ClipLoader color="#fff" size={18} />
            Enregistrement...
          </span>
        ) : 'Save Resource'}
      </button>
      </>
      )}
    </div>
  );
}
