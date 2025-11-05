import { faTags, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useRef } from 'react';
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';
import AttributsCompVariationForm from './AttributsCompVariationForm';
import { url } from '../contextes/UrlContext';

export default function AttributsComp({ register, errors, watch, initialVariations, variations, title, setValue }) {
  const [isOpen, setIsOpen] = useState(true);
  const [attributs, setAttributs] = useState([]);
  const [listeAttribut, setListeAttributs] = useState([]);
  const [valeursOptions, setValeursOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customValues, setCustomValues] = useState('');
  const [customUsedForVariation, setCustomUsedForVariation] = useState(false);
  const [hasValidatedVariations, setHasValidatedVariations] = useState(false);
  const [showVariationBlocks, setShowVariationBlocks] = useState(false);
  const [expandedVariationKeys, setExpandedVariationKeys] = useState({});
  const normalize = str => str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, '_');
  const [selectedValuesOnClick, setSelectedValuesOnClick] = useState([]);
  const [newOptionForValeursSelect, setNewOptionForValeursSelect] = useState(null);
  const selectRef = useRef(null);
  const tomSelectInstance = useRef(null);

  useEffect(() => {
    const fetchAttributsPersonalised = async () => {
      try {
        const res = await fetch(`${url}/getallttributes`);
        const data = await res.json();
        setListeAttributs(data.listeAttribut);
        setValeursOptions(data.valeursOptions);
      } catch (e) {
        console.error("Erreur tags", e);
      }
    };
    fetchAttributsPersonalised();
  }, []);

  useEffect(() => {
    if (
      initialVariations &&
      typeof initialVariations === 'object' &&
      Object.keys(initialVariations).length &&
      listeAttribut.length &&
      Object.keys(valeursOptions).length
    ) {
      const loadedAttributs = [];
      const expandedKeys = [];

      Object.entries(initialVariations).forEach(([key, data]) => {
        const type = key.trim().toLowerCase().replace(/\s+/g, '_');
        const rawValues = Array.isArray(data.value) ? data.value.map(v => v.trim()) : [];

        if (!listeAttribut.find(attr => attr.value === type)) {
          setListeAttributs(prev => [...prev, { value: type, label: key }]);
        }

        const optionValues = rawValues.map(val => ({
          value: val.toLowerCase().replace(/\s+/g, '_'),
          label: val
        }));

        if (!valeursOptions[type]) {
          setValeursOptions(prev => ({ ...prev, [type]: optionValues }));
        } else {
          const existingVals = valeursOptions[type].map(opt => opt.value);
          const newOptions = optionValues.filter(opt => !existingVals.includes(opt.value));
          if (newOptions.length) {
            setValeursOptions(prev => ({
              ...prev,
              [type]: [...prev[type], ...newOptions]
            }));
          }
        }

        const valeurSlugs = rawValues.map(val => val.toLowerCase().replace(/\s+/g, '_'));

        if (data.is_variation === 1 && valeurSlugs.length) {
          valeurSlugs.forEach(val => expandedKeys.push(`${type}_${val}`));
        }

        loadedAttributs.push({
          id: Date.now() + Math.random(),
          type,
          visible: data.is_visible === 1,
          used_for_variations: data.is_variation === 1,
          valeurs: valeurSlugs.join(',')
        });
      });

      setAttributs(loadedAttributs);

      if (loadedAttributs.some(attr => attr.used_for_variations && attr.valeurs)) {
        setHasValidatedVariations(true);
        setShowVariationBlocks(true);
        setExpandedVariationKeys(
          expandedKeys.reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {})
        );
      }
    }
  }, [initialVariations, listeAttribut, valeursOptions]);

  useEffect(() => {
    if (attributs.length > 0 && Array.isArray(variations) && variations.length > 0) {
      const allValues = [];

      attributs.forEach(attr => {
        if (attr.used_for_variations && attr.valeurs) {
          const attrLabel = listeAttribut.find(opt => opt.value === attr.type)?.label || attr.type;
          const valueName = `attribute_${normalize(attrLabel).replace(/_/g, '-')}`;
          const valeurList = attr.valeurs.split(',').map(val => val.trim());

          valeurList.forEach(valeur => {
            const correspondance = variations.find(variation =>
              normalize(variation.metaNow?.[valueName]) === normalize(valeur)
            );
            if (correspondance) allValues.push(valeur);
          });
        }
      });

      if (allValues.length > 0) {
        setSelectedValuesOnClick(allValues);
        setShowVariationBlocks(true);
        setHasValidatedVariations(true);
      }
    }
  }, [attributs, variations, listeAttribut]);

  const handleAdd = () => {
    if (attributs.length > 0 || !selectedValue) return;
    if (selectedValue === 'custom') {
      setShowCustomForm(true);
    } else {
      const label = listeAttribut.find(opt => opt.value === selectedValue)?.label || selectedValue;
      setAttributs([
        {
          id: Date.now(),
          type: selectedValue,
          label: label,
          visible: false,
          used_for_variations: false,
          valeurs: ''
        }
      ]);
      setSelectedValue('');
    }
  };

 const handleRemove = (id) => {
  const attrToRemove = attributs.find(attr => attr.id === id);
  if (!attrToRemove) return;

  setValue(`attributs.${id}.type`, '');
  setValue(`attributs.${id}.valeurs`, '');

  if (attrToRemove.used_for_variations && attrToRemove.valeurs) {
    const sluggedValues = attrToRemove.valeurs.split(',').map(v => v.trim());
    setValue('variations', (prevVariations) => {
      const updated = { ...prevVariations };
      sluggedValues.forEach(val => {
        const key = `${attrToRemove.type}_${val}`;
        delete updated[key];
      });
      return updated;
    });
  }

  // Mettre à jour les attributs
  const newList = attributs.filter(attr => attr.id !== id);
  setAttributs(newList);
  setValue("attributs", newList);
};


const handleUpdate = (id, field, value) => {
  const updatedAttributs = attributs.map(attr =>
    attr.id === id ? { ...attr, [field]: value } : attr
  );
  setAttributs(updatedAttributs);

  setValue(`attributs.${id}.${field}`, value);

  const attrToUpdate = attributs.find(attr => attr.id === id);

  if (attrToUpdate?.used_for_variations && attrToUpdate.valeurs) {
    const prevVariations = watch('variations') || {};
    const updatedVariations = { ...prevVariations };

    const normalize = (str) =>
      str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    Object.keys(updatedVariations).forEach((key) => {
      const prefix = key.split('_-_')[0] + '_-_';

      const matches = value
        .split(',')
        .some((val) => normalize(key) === normalize(`${prefix}${val}`));

      if (!matches) {
        delete updatedVariations[key];
      }
    });

    setValue('variations', updatedVariations);
  }

  setValue('attributs', updatedAttributs);
};

  function ValeursSelect({ attr, newOption }) {
    useEffect(() => {
      if (selectRef.current && !tomSelectInstance.current) {
        tomSelectInstance.current = new TomSelect(selectRef.current, {
          plugins: ['remove_button'],
          persist: true,
          create: (input) => {
            const slug = input.toLowerCase().replace(/\s+/g, '_');
            const newOpt = { value: slug, label: input };

            setValeursOptions(prev => {
              const updated = { ...prev };
              if (!updated[attr.type]) updated[attr.type] = [];
              updated[attr.type] = [...updated[attr.type], newOpt];
              return updated;
            });

            tomSelectInstance.current.addOption(newOpt);
            tomSelectInstance.current.addItem(newOpt.value);

            const updatedValues = [
              ...(attr.valeurs ? attr.valeurs.split(',') : []),
              newOpt.value
            ];

            handleUpdate(attr.id, 'valeurs', [...new Set(updatedValues)].join(','));
            return newOpt;
          },
          maxItems: null,
          valueField: 'value',
          labelField: 'label',
          searchField: ['label'],
          options: valeursOptions[attr.type] || [],
          items: attr.valeurs ? attr.valeurs.split(',') : [],
          onChange: (values) => {
            handleUpdate(attr.id, 'valeurs', values.join(','));
          }
        });
      }

      return () => {
        if (tomSelectInstance.current) {
          tomSelectInstance.current.destroy();
          tomSelectInstance.current = null;
        }
      };
    }, []);

    useEffect(() => {
      if (!tomSelectInstance.current) return;
      const current = tomSelectInstance.current;

      const currentOptions = current.options;
      const newOptions = valeursOptions[attr.type] || [];

      newOptions.forEach(opt => {
        if (!currentOptions[opt.value]) {
          current.addOption(opt);
        }
      });

      const expectedItems = attr.valeurs ? attr.valeurs.split(',') : [];
      const currentItems = current.items;
      const itemsAreDifferent = JSON.stringify([...currentItems].sort()) !== JSON.stringify([...expectedItems].sort());

      if (itemsAreDifferent) {
        current.setValue(expectedItems);
      }
    }, [valeursOptions, attr.valeurs]);

    useEffect(() => {
      if (
        newOption &&
        newOption.type === attr.type &&
        tomSelectInstance.current &&
        Array.isArray(newOption.options)
      ) {
        const current = tomSelectInstance.current;

        newOption.options.forEach(opt => {
          if (!current.options[opt.value]) {
            current.addOption(opt);
          }
          if (!current.items.includes(opt.value)) {
            current.addItem(opt.value);
          }
        });

        handleUpdate(attr.id, 'valeurs', newOption.options.map(opt => opt.value).join(','));
        setNewOptionForValeursSelect(null);
      }
    }, [newOption]);

    const selectAll = () => {
      const allValues = (valeursOptions[attr.type] || []).map(opt => opt.value);
      tomSelectInstance.current.setValue(allValues);
      handleUpdate(attr.id, 'valeurs', allValues.join(','));
    };

    const deselectAll = () => {
      tomSelectInstance.current.clear();
      handleUpdate(attr.id, 'valeurs', '');
    };

    return (
      <div className="overflow-x-auto">
        <select ref={selectRef} multiple className="w-full p-2 border border-gray-300 rounded"></select>
        <div className="flex gap-2 mt-2 flex-wrap">
          <button type="button" onClick={selectAll} className="px-3 py-1 bg-gray-400 text-white rounded text-sm">Tout sélectionner</button>
          <button type="button" onClick={deselectAll} className="px-3 py-1 bg-gray-400 text-white rounded text-sm">Tout désélectionner</button>
        </div>
      </div>
    );
  }


  return (
    <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-[#f6858b] text-xl md:text-2xl font-bold mb-4 w-full justify-between"
      >
        <span><FontAwesomeIcon icon={faTags} className="mr-3" /> Attributs</span>
        <span className="text-base text-gray-600">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="space-y-4">
          {attributs.map((attr) => {
            const label = listeAttribut.find(opt => opt.value === attr.type)?.label || attr.type;
            return (
              <div key={attr.id} className="border rounded p-4 bg-gray-50 relative shadow-sm">
                {/* En-tête avec bouton supprimer */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemove(attr.id)}
                    className="text-gray-500 hover:text-red-500"
                    title="Supprimer"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:gap-6 space-y-4 md:space-y-0">
                  {/* Checkbox visibilité */}
                  <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        {...register(`attributs.${attr.id}.used_for_variations`)}
                        checked={attr.used_for_variations}
                        onChange={(e) => handleUpdate(attr.id, 'used_for_variations', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Utilisé pour les variations</span>
                    </label>
                  </div>

                  <div className="md:flex-1 w-full overflow-x-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valeur(s) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="hidden"
                      {...register(`attributs.${attr.id}.type`)}
                      value={attr.type}
                    />
                    <input
                      type="hidden"
                      {...register(`attributs.${attr.id}.valeurs`)}
                      value={attr.valeurs}
                    />
                    <ValeursSelect key={attr.id} attr={attr} newOption={newOptionForValeursSelect} />
                  </div>
                </div>
              </div>
            );
          })}

          {showCustomForm && (
            <div className="relative border p-4 rounded bg-gray-100 mt-4 space-y-4 max-w-screen-md mx-auto">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
                title="Fermer"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <div className="flex flex-col md:flex-row gap-4 px-2 md:px-0">
                <div className="md:w-1/2 w-full">
                  <label className="block mb-1 text-sm text-gray-700">Nom de l'attribut</label>
                  <input
                    type="text"
                    //{...register('customName')}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                </div>

                <div className="md:w-1/2 w-full">
                  <label className="block mb-1 text-sm text-gray-700">Valeurs (séparées par une virgule)</label>
                  <input
                    type="text"
                    //{...register('customValues')}
                    value={customValues}
                    onChange={(e) => setCustomValues(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                </div>
              </div>

              <div className="mt-2 px-2 md:px-0">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    {...register('customUsedForVariation')}
                    // checked={customUsedForVariation}
                    // onChange={(e) => setCustomUsedForVariation(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Utilisé pour les variations</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center gap-4 px-2 md:px-0">
            <div className="w-full md:w-auto">
              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                disabled={attributs.length > 0}
                className={`w-full md:w-auto p-2 border border-gray-300 rounded ${
                  attributs.length > 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">-- Sélectionner un attribut --</option>
                <option value="custom">Attribut personnalisé</option>
                {listeAttribut.map((opt, index) => (
                  <option
                    key={`${opt.value}-${opt.ID ?? index}`}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={handleAdd}
                className={`w-full sm:w-auto px-3 py-2 rounded ${
                  attributs.length > 0 || showCustomForm
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                }`}
                disabled={attributs.length > 0 || showCustomForm}
              >
                Ajouter un attribut
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedValue === 'custom') {
                    if (attributs.length > 0 || !customName || !customValues) return;

                    const customKey = customName.toLowerCase().replace(/\s+/g, '_');

                    const newOptions = customValues.split(',').map(val => ({
                      value: val.trim().toLowerCase().replace(/\s+/g, '_'),
                      label: val.trim()
                    }));

                    setListeAttributs(prev => [
                      ...prev,
                      { value: customKey, label: customName }
                    ]);

                    setValeursOptions(prev => ({
                      ...prev,
                      [customKey]: newOptions
                    }));

                    setAttributs([
                      {
                        id: Date.now(),
                        type: customKey,
                        label: customName,
                        visible: false,
                        used_for_variations: customUsedForVariation,
                        valeurs: ''
                      }
                    ]);

                    if (newOptions.length > 0) {
                      setNewOptionForValeursSelect({ type: customKey, options: newOptions });
                    }

                    setCustomName('');
                    setCustomValues('');
                    setSelectedValue('');
                    setShowCustomForm(false);
                    setCustomUsedForVariation(false);
                  }

                  const hasUsedForVariations = attributs.some(attr => attr.used_for_variations)
                    || (selectedValue === 'custom' && customUsedForVariation);

                  setHasValidatedVariations(hasUsedForVariations);
                }}
                className="w-full sm:w-auto px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Enregistrer
              </button>
            </div>
          </div>

          {hasValidatedVariations && attributs.some(attr => attr.valeurs) && (
            <div className="mt-6 border-t pt-4">
              <div className="flex flex-col md:flex-row gap-x-4 gap-y-4">
                <div className="md:w-1/2 w-full flex flex-col">
                  <button
                    type="button"
                    className="p-2 border border-gray-300 rounded w-full bg-white text-gray-800 hover:bg-gray-100 hover:border-gray-400 transition duration-150"
                    onClick={() => {
                      setShowVariationBlocks(true);

                      const allSelectedValues = attributs
                        .filter(attr => attr.used_for_variations && attr.valeurs)
                        .flatMap(attr => attr.valeurs.split(',').map(val => val.trim()));

                      setSelectedValuesOnClick(allSelectedValues);
                    }}
                  >
                    Ajouter des variations
                  </button>
                </div>
              </div>

              {showVariationBlocks && (
                  <div className="mt-4 space-y-4">

                    {selectedValuesOnClick.map((valeurSeule, index) => {
                      const attr = attributs.find(a => 
                        a.used_for_variations && 
                        a.valeurs.split(',').map(v => v.trim()).includes(valeurSeule.trim())
                      );

                      if (!attr) return null;

                      const type = attr.type;
                      const labelAttr = listeAttribut.find(opt => opt.value === type)?.label || type;
                      const label = `${labelAttr} - ${valeurSeule.trim()}`;
                      const key = `${type}_${valeurSeule.trim()}`;

                      const [attrLabel, valCompare] = label.split(' - ');
                      const valueName = `attribute_${normalize(attrLabel).replace(/_/g, '-')}`;

                      const filteredVariations = Array.isArray(variations)
                        ? variations.filter(v =>
                            normalize(v.metaNow?.[valueName]) === normalize(valCompare)
                          )
                        : [];
                      return (
                        <div key={`${key}-${index}`} className="border rounded p-4 bg-white shadow">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedVariationKeys(prev => ({
                                ...prev,
                                [key]: !prev[key]
                              }))
                            }
                            className="w-full text-left text-gray-800 font-semibold flex justify-between items-center"
                          >
                            <span>{label}</span>
                            <span>{expandedVariationKeys[key] ? '−' : '+'}</span>
                          </button>

                          {expandedVariationKeys[key] && filteredVariations.length > 0 && (
                            <AttributsCompVariationForm
                              register={register}
                              errors={errors}
                              watch={watch}
                              label={label}
                              variation={filteredVariations}
                              title={title}
                              setValue={setValue}
                            />
                          )}

                          {expandedVariationKeys[key] && filteredVariations.length === 0 && (
                            <AttributsCompVariationForm
                              register={register}
                              errors={errors}
                              watch={watch}
                              label={label}
                              title={title}
                              setValue={setValue}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
