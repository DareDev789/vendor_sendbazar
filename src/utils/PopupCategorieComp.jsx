import { useEffect, useRef, useState } from "react";

export default function PopupCategorieComp({
    categorieSelected,
    categories,
    setCategorieSelected,
    setShowPopup,
    catIdToChange,
    setCatIdToChange,
    getCategoryNameFromId
}) {
    const popup = useRef(null);
    const [idCat, setIdCat] = useState(categories[0]?.id || null);
    const [idChildCat, setIdChildCat] = useState(null);
    const [catChoiseNow, setCatChoiseNow] = useState([]);

    // 🧠 Si on ouvre pour modifier une catégorie, on préremplit
    useEffect(() => {
        if (catIdToChange) {
            let foundParent = null;
            for (const cat of categories) {
                if (cat.id === catIdToChange) {
                    setIdCat(cat.id);
                    return;
                }
                if (cat.children) {
                    const child = cat.children.find(c => c.id === catIdToChange);
                    if (child) {
                        foundParent = cat;
                        setIdCat(cat.id);
                        setIdChildCat(child.id);
                        return;
                    }
                }
            }
        } else {
            setIdCat(categories[0]?.id || null);
            setIdChildCat(null);
        }
    }, [catIdToChange, categories]);

    useEffect(() => {
        setCatChoiseNow(categories.filter(cat => cat.id === idCat));
        setIdChildCat(null);
    }, [idCat, categories]);

    const handleChoose = (newId) => {
        if (!newId) return;

        setCategorieSelected(prev => {
            let updated;
            if (catIdToChange) {
                updated = prev.map(id => (id === catIdToChange ? newId : id));
            } else {
                updated = [...(Array.isArray(prev) ? prev : []), newId];
            }

            // ⚠️ Toujours au moins une catégorie
            return updated.length > 0 ? updated : [newId];
        });

        setCatIdToChange(null);
        setIdCat(categories[0]?.id || null);
        setIdChildCat(null);
        setShowPopup(false);
    };

    const handleClose = () => {
        setShowPopup(false);
        setCatIdToChange(null);
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="absolute top-4 right-4">
                <button
                    type="button"
                    onClick={handleClose}
                    className="text-white bg-red-500 hover:bg-red-600 rounded-full px-3 py-1 focus:outline-none"
                >
                    x
                </button>
            </div>
            <div ref={popup} className="bg-white rounded-lg shadow-lg p-6 w-[800px] max-w-[90%]">
                <h2 className="text-xl font-bold mb-4 text-[#f6858b]">Choisir une catégorie</h2>
                <div className="w-full grid grid-cols-2 gap-4 mb-4 ">
                    <div className="max-h-[60vh] overflow-y-auto ">
                        {categories.map((cat, index) => (
                            <div
                                key={index}
                                className={`p-2 my-1 text-sm rounded capitalize hover:bg-gray-100 cursor-pointer select-none ${cat.id === idCat ? "bg-gray-200" : ""}`}
                                onClick={() => setIdCat(cat.id)}
                            >
                                {cat.name} {cat.children?.length > 0 && " >"}
                            </div>
                        ))}
                    </div>
                    <div>
                        {catChoiseNow.map((cat, index) => (
                            <div key={index} className="p-2 text-sm">
                                {cat?.children?.length > 0 && (
                                    <div className="ml-4">
                                        {cat.children.map((child, childIndex) => (
                                            <div
                                                key={childIndex}
                                                className={`p-2 my-1 text-sm rounded capitalize hover:bg-gray-100 cursor-pointer select-none ${child.id === idChildCat ? "bg-gray-200" : ""}`}
                                                onClick={() => setIdChildCat(child.id)}
                                            >
                                                {child.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between items-center w-full">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catégorie sélectionnée : <br />
                            <span className="font-bold">
                                {getCategoryNameFromId(idChildCat || idCat)}
                            </span>
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleChoose(idChildCat || idCat)}
                        className="bg-[#f6858b] text-white px-4 py-2 rounded hover:bg-[#f6858b]/90 focus:outline-none"
                    >
                        Choisir
                    </button>
                </div>
            </div>
        </div>
    );
}
