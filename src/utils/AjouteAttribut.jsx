import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from "react";
import { url } from '../contextes/UrlContext';
import Notiflix from 'notiflix';

export default function AjouteAttribut({name2, setAttributes, attributes, variations, setVariations, extendedAttributes, slugify, product }) {
    const [listeAttributsDefault, setListeAttributsDefault] = useState([]);
    const [valeursOptionsDefault, setValeursOptionsDefault] = useState([]);
    const [suggestionsOptionsValid, setSuggestionsOptionsValid] = useState([]);

    const [selectedValueListeAttribut, setSelectedValueListeAttribut] = useState("newAttribut");
    const [showChampNewAttribut, sethowChampNewAttribut] = useState(false);
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [selectedValue, setSelectedValue] = useState([]);
    const [desactiveCreat, setDesactiveCreat] = useState(false);
    const [useExistantAttribut, setUseExistingAttribut] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);

    useEffect(() => {
        const fetchAttributsPersonalised = async () => {
            try {
                const res = await fetch(`${url}/getallttributes`);
                const data = await res.json();
                setListeAttributsDefault(data.listeAttribut);
                setValeursOptionsDefault(data.valeursOptions);
            } catch (e) {
                console.error("Erreur tags", e);
            }
        };
        fetchAttributsPersonalised();
    }, []);

    const handleAddAttribut = () => {
        if (selectedValueListeAttribut) {
            setDesactiveCreat(true);
            sethowChampNewAttribut(true);
            if (selectedValueListeAttribut === 'newAttribut') {
                setUseExistingAttribut(false);
                setName('');
                setSelectedValue([]);
                setSuggestionsOptionsValid([]);
            } else {
                setUseExistingAttribut(true);
                const nametemp = listeAttributsDefault.find(attr => attr.value === selectedValueListeAttribut);
                setName(nametemp.value);

                const valuesTemp = valeursOptionsDefault[selectedValueListeAttribut] || [];
                setSuggestionsOptionsValid(valuesTemp.map(val => val.value));
            }
        }
    }

    const handleFermeNewAttribut = () => {
        sethowChampNewAttribut(false);
        setDesactiveCreat(false);
        setName('');
        setValue('');
        setSelectedValue([]);
        setSelectedValueListeAttribut('newAttribut');
    }

    const saveAttributAndValue = () => {
        if (!name.trim() || selectedValue.length === 0) {
            Notiflix.Notify.failure("Veuillez remplir tous les champs.");
            return;
        }

        const newAttribut = {
            is_taxonomy: 0,
            is_variation: 1,
            name: name.trim(),
            position: 1,
            value: selectedValue,
        };

        setAttributes([newAttribut]);
        const newVariations = selectedValue.map((value, index) => {
            const num = index + 1;
            return {
                ID: Date.now() + index,
                post_content: "",
                post_title: `${product?.post_title || name2 || ''}-${value}`,
                post_name: slugify(`product-${product?.ID || 'unknown'}-variation-${num}`),
                post_status: 'publish',
                post_excerpt: '',
                metaNow: {
                    ['attribute_' + slugify(name.trim())]: value,
                    total_sales: "0",
                    _backorders: "no",
                    _download_expiry: '',
                    _download_limit: '',
                    _downloadable: "no",
                    _downloadable_files: "",
                    _height: "",
                    _length: "",
                    _manage_stock: "no",
                    _price: "",
                    _product_version: "9.8.4",
                    _regular_price: "",
                    _sku: "",
                    _sold_individually: "no",
                    _stock: null,
                    _stock_status: "instock",
                    _tax_class: "parent",
                    _tax_status: "none",
                    _variation_description: "",
                    _virtual: "no",
                    _wc_average_rating: "0",
                    _wc_review_count: "0",
                    _weight: "",
                    _width: "",
                }
            };
        });
        setVariations(newVariations);
    };


    const handleAdd = (val) => {
        const trimmed = val.trim();

        if (useExistantAttribut) {
            const normalizedSuggestions = suggestionsOptionsValid.map(v => v.trim());

            if (!trimmed || !normalizedSuggestions.includes(trimmed)) {
                setValue('');
                return;
            }
        }

        if (trimmed && !selectedValue.includes(trimmed)) {
            setSelectedValue([...selectedValue, trimmed]);
        }

        setValue('');
    };

    const handleKeyDown = (e) => {
        e.preventDefault
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd(value);
        }
    };

    const handleRemove = (index) => {
        setSelectedValue(prev => prev.filter((_, i) => i !== index));
    };

    const InitialiseAll = () => {
        const newAttributs = [];

        Object.values(attributes).forEach(attr => {
            const label = attr.name?.trim();
            const slug = slugify(label);
            const metaKey = `attribute_${slug}`;

            variations.forEach(variation => {
                if (!variation.metaNow) return;

                const value = variation.metaNow[metaKey];
                if (value) {

                    if (!newAttributs.includes(variation)) {
                        newAttributs.push(variation);
                    }

                    const attrKey = Object.keys(attributes).find(key => attributes[key].name === attr.name);
                    if (attrKey) {
                        const currentValues = extendedAttributes[attrKey].value || [];
                        const alreadyHas = currentValues.some(v => v.toLowerCase() === value.toLowerCase());
                        if (!alreadyHas) {
                            extendedAttributes[attrKey].value = [...currentValues, value];
                        }
                    }
                }
            });
        });
        setVariations([newAttributs]);
        setAttributes(extendedAttributes);
    }

    return (
        <>
            <div className="md:flex-row md:items-center w-full">
                {showChampNewAttribut && (
                    <div className="relative border p-4 rounded bg-gray-100 mt-4 space-y-4 w-full">
                        <button
                            type="button"
                            onClick={handleFermeNewAttribut}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
                            title="Fermer"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/2 w-full">
                                <label className="block mb-1 text-sm text-gray-700">Nom de l'attribut</label>
                                <input
                                    type="text"
                                    value={name}
                                    readOnly={useExistantAttribut}
                                    onChange={(e) => setName(e.target.value)}
                                    className="p-2 border border-gray-300 rounded w-full"
                                />
                            </div>

                            <div className="md:w-1/2 w-full"
                                onMouseEnter={() => setInputFocused(true)}
                                onMouseLeave={() => setInputFocused(false)}>
                                <label className="block mb-1 text-sm text-gray-700">Valeurs</label>
                                <div
                                    className="border border-gray-300 rounded px-2 py-2 bg-white">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedValue.map((val, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                            >
                                                {val}
                                                <button
                                                    onClick={(e) => {
                                                        handleRemove(index);
                                                        e.preventDefault();
                                                    }}
                                                    className="ml-2 text-sm text-red-500 hover:text-red-700"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </span>
                                        ))}

                                        <input
                                            type="text"
                                            value={value}
                                            onFocus={() => setInputFocused(true)}
                                            onChange={(e) => setValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="border-0 bg-transparent px-2 py-1 text-sm min-w-[100px] flex-grow outline-none"
                                            placeholder="Entrée"
                                        />

                                    </div>

                                    {inputFocused && (useExistantAttribut || (value.trim() && !selectedValue.includes(value.trim()))) && (
                                        <ul className="absolute z-20 bg-white border border-gray-300 rounded mt-1 shadow-md w-[250px]">
                                            {useExistantAttribut ? (
                                                <>
                                                    {suggestionsOptionsValid
                                                        .filter((suggestion) => {
                                                            const normalizedSuggestion = suggestion.trim().toLowerCase();

                                                            const isNotSelected = !selectedValue.some(
                                                                (v) => v.trim().toLowerCase() === normalizedSuggestion
                                                            );

                                                            const matchesValue = value.trim()
                                                                ? normalizedSuggestion.includes(value.trim().toLowerCase())
                                                                : true;

                                                            return isNotSelected && matchesValue;
                                                        })
                                                        .map((suggestion, index) => (
                                                            <li
                                                                key={index}
                                                                onClick={() => handleAdd(suggestion)}
                                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                            >
                                                                {suggestion.trim()}
                                                            </li>
                                                        ))}
                                                </>
                                            ) : (
                                                <>
                                                    <li
                                                        onClick={() => handleAdd(value)}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        {value}
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                {useExistantAttribut ? (
                                    <>
                                        <div className="flex gap-2 items-center mt-4">
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedValue([])}
                                                    className={`px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition ${selectedValue.length === 0 ? 'cursor-not-allowed' : ''}`}
                                                >
                                                    Effacer Tout
                                                </button>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedValue(suggestionsOptionsValid)}
                                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                                                >
                                                    Selectionner tout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex gap-2 items-center mt-4">
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedValue([])}
                                                    className={`px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition ${selectedValue.length === 0 ? 'cursor-not-allowed' : ''}`}
                                                >
                                                    Effacer Tout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={saveAttributAndValue}
                                className="px-7 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
                            >
                                Enrégistrer
                            </button>
                        </div>
                    </div>
                )}

                {!showChampNewAttribut && (
                    <div className="w-full md:flex items-end mb-5">
                        <div className='w-full md:w-2/3'>
                            <label htmlFor="attribut" className="block text-sm font-medium text-gray-700 mb-1">
                                Sélectionner un attribut
                            </label>
                            <select
                                id="attribut"
                                value={selectedValueListeAttribut}
                                onChange={(e) => setSelectedValueListeAttribut(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                <option value="newAttribut">Attribut personnalisé</option>
                                {listeAttributsDefault.map((opt, index) => (
                                    <option
                                        key={`${opt.value}-${opt.ID ?? index}`}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={handleAddAttribut}
                                className={`text-white font-semibold py-2 px-5 rounded transition ml-5
                                ${desactiveCreat
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-600 text-gray-800 hover:bg-gray-400'}`
                                }
                            >
                                Créer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}