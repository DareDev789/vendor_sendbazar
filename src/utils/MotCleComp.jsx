import { useEffect, useState, useRef } from "react";
import { url } from '../contextes/UrlContext';
import { url_frontend } from '../contextes/UrlContext';

export default function MotCleComp({ register, errors, setValue, tagsChoosed, setTagsChoosed }) {
    const [keywords, setKeywords] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);


    useEffect(() => {
        const fetchKeywords = async () => {
            try {
                const res = await fetch(`${url}/tags-produits`);
                const data = await res.json();
                setKeywords(data);
            } catch (e) {
                console.error("Erreur tags", e);
            }
        };
        fetchKeywords();
    }, []);

    const updateSuggestions = (value) => {
        const search = value.trim().toLowerCase();
        if (!search) {
            setSuggestions([]);
            return;
        }
        const filtered = keywords.filter(tag =>
            tag.name.toLowerCase().includes(search) &&
            !tagsChoosed.find(t => t.name.toLowerCase() === tag.name.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
    };

    const addTag = (tag) => {
        setInputValue("");
        setSuggestions([]);
        setShowSuggestions(false);

        const newTag = typeof tag === "string"
            ? { id: null, name: tag }
            : { id: tag.id, name: tag.name };

        if (!tagsChoosed.find(t => t.name.toLowerCase() === newTag.name.toLowerCase())) {
            const updated = [...tagsChoosed, newTag];
            setTagsChoosed(updated);
            setValue("tags", updated);
        }
    };

    const removeTag = (name) => {
        const updated = tagsChoosed.filter(tag => tag.name !== name);
        setTagsChoosed(updated);
        setValue("tags", updated);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        updateSuggestions(value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const trimmed = inputValue.trim();
            if (trimmed) addTag(trimmed);
        } else if (e.key === "Backspace" && inputValue === "") {
            removeTag(tagsChoosed[tagsChoosed.length - 1]?.name);
        }
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2"><b>Mots-clés</b></label>

            <div
                className={`flex flex-wrap items-center border rounded px-2 py-1 cursor-text ${errors?.tags ? "border-red-500" : "border-gray-300"}`}
                onClick={() => inputRef.current?.focus()}
            >
                {tagsChoosed?.map((tag, i) => (
                    <span key={i} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-sm text-sm mr-1 mb-1 flex items-center">
                        {tag.name}
                        <button
                            type="button"
                            onClick={() => removeTag(tag.name)}
                            className="ml-1 text-red-600 hover:text-red-800"
                        >
                            ×
                        </button>
                    </span>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-grow min-w-[150px] border-none outline-none focus:ring-0 p-1"
                    placeholder="Ajouter vos mot-clés et appuyez sur Entrée ou la virgule"
                />
            </div>

            {errors?.tags && <p className="text-red-500 text-xs mt-1">{errors.tags.message}</p>}

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute bg-white border border-gray-300 w-full mt-1 max-h-40 overflow-y-auto z-10 shadow-md">
                    {suggestions.map((sugg, i) => (
                        <li
                            key={i}
                            onClick={() => addTag(sugg)}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                        >
                            {sugg.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
