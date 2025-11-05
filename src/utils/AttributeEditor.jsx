import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Notiflix from "notiflix";

export default function AttributeEditor({ attr, setAttributes, setVariations, removeValueFromAttribute, variations, product, name2, slugify }) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            e.preventDefault();
            const newVal = inputValue.trim();

            const existsInAttr = attr.value?.some(
                (v) => v.toLowerCase() === newVal.toLowerCase()
            );

            const attrKey = "attribute_" + slugify(attr.name);
            const existsInVariations = variations.some(
                (variation) =>
                    variation.metaNow?.[attrKey]?.toLowerCase() === newVal.toLowerCase()
            );

            if (existsInAttr || existsInVariations) {
                Notiflix.Notify.warning("Cette valeur existe déjà :", newVal);
                return;
            }
            const num = variations.length + 1;
            const newVariation = {
                ID: Date.now(),
                post_content: "",
                post_title: `${product?.post_title || name2 || ''}-${inputValue.trim()}`,
                post_name: slugify(`product-${product?.ID || 'unknown'}-variation-${num}`),
                post_status: 'publish',
                post_excerpt: '',
                metaNow: {
                    ['attribute_' + slugify(attr.name)]: inputValue.trim(),
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
            setVariations((prev) => [...prev, newVariation]);
            setAttributes((prev) => {
                const updated = { ...prev };
                const key = Object.keys(updated).find((k) => updated[k].id === attr.id);

                if (key) {
                    updated[key] = {
                        ...updated[key],
                        value: [...(updated[key].value || []), inputValue.trim()],
                    };
                }
                return updated;
            });
            setInputValue("");
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg p-1 mb-2">
            <div className="flex flex-wrap gap-2">
                {attr.value?.map((val, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center bg-gray-200 text-gray-700 px-2 py-1 rounded"
                    >
                        {val}
                        <button
                            onClick={(e) => {
                                removeValueFromAttribute(attr.name, val);
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
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border-0 bg-transparent px-2 py-1 text-sm min-w-[100px] flex-grow outline-none"
                    placeholder="Entrée"
                />

            </div>
        </div>
    );
};

