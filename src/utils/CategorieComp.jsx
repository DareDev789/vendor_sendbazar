import { faAngleRight, faXmark, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import PopupCategorieComp from "./PopupCategorieComp";
import { url } from '../contextes/UrlContext';
import { url_frontend } from '../contextes/UrlContext';

export default function CategorieComp({register, errors, categorieSelected, setCategorieSelected }) {
    const [categories, setCategories] = useState([]);
    const [load, setLoad] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [catIdToChange, setCatIdToChange] = useState(null);

    function getCategoryNameFromId(id) {
        for (let cat of categories) {
            if (cat.id === id) return cat.name;
            if (cat.children && Array.isArray(cat.children)) {
                const child = cat.children.find(child => child.id === id);
                if (child) return `${cat.name} > ${child.name}`;
            }
        }
        return "Catégorie inconnue";
    }

    useEffect(() => {
        if (categories.length !== 0) {
            if (!Array.isArray(categorieSelected) || categorieSelected.length === 0) {
                setCategorieSelected([categories[0]?.id]);
            }
        }
    }, [categorieSelected, categories]);


    const fetchCategories = async () => {
        setLoad(true);
        try {
            const response = await fetch(`${url}/categories-produits`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        } finally {
            setLoad(false);
        }
    };

    useEffect(() => {
        const loadCategories = async () => {
            const data = await fetchCategories();
            setCategories(data);
        };
        loadCategories();
    }, []);

    if (load) {
        return <></>;
    }

    return (
        <>
            {showCategories && (
                <PopupCategorieComp
                    categorieSelected={categorieSelected}
                    categories={categories}
                    setCategorieSelected={setCategorieSelected}
                    setShowPopup={setShowCategories}
                    catIdToChange={catIdToChange}
                    setCatIdToChange={setCatIdToChange}
                    getCategoryNameFromId={getCategoryNameFromId}
                />
            )}

            <div className="mb-6">
                <div className="w-full mb-4">
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Choix des catégories</label>
                        {categorieSelected.length > 0 ? (
                            <div className="">
                                {categorieSelected.map((catId, index) => (
                                    <div key={index} className="cursor-pointer bg-gray-200 text-gray-800 px-3 my-1 py-1 text-sm relative">
                                        <span onClick={() => { setCatIdToChange(catId); setShowCategories(true) }}>{getCategoryNameFromId(catId)}</span>
                                        <button
                                            type="button"
                                            onClick={() => setCategorieSelected(categorieSelected.filter(id => id !== catId))}
                                            className="ml-2 text-red-500 hover:text-red-700 right-2 top-1 absolute focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
                                ))}

                                <div
                                    onClick={
                                        () => {
                                            setShowCategories(true);
                                        }
                                    }
                                    className="w-48 mt-2 flex text-sm items-center px-3 py-1 border rounded border-gray-300 cursor-pointer bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f6858b] focus:border-transparent select-none"
                                >
                                    Ajouter une catégorie <FontAwesomeIcon icon={faAngleRight} className="ml-2 mt-1" />
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={
                                    () => {
                                        setShowCategories(true);
                                    }
                                }
                                className="w-full flex text-sm items-center px-3 py-1 border rounded border-gray-300 cursor-pointer bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f6858b] focus:border-transparent select-none"
                            >Choisir une catégorie  <FontAwesomeIcon icon={faAngleRight} className="ml-2" /></div>
                        )}

                    </div>
                </div>
            </div >
        </>
    );
}