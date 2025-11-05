import { faTags, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import EveryVariation from "./EveryVariation";
import AjouteAttribut from "./AjouteAttribut";
import AttributeEditor from "./AttributeEditor";

export default function VariationsComp({ name, product, variations, setVariations, attributes, setAttributes }) {
    const [isOpenAll, setIsOpenAll] = useState(true);

    const slugify = (name) => {
        return name
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const extendedAttributes = { ...attributes };
    const attributesArray = Object.values(extendedAttributes);

    useEffect(() => {
        InitialiseAll();
    }, []);

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
        setVariations(newAttributs);
        setAttributes(extendedAttributes);
    }

    const groupedVariations = {};

    attributesArray.forEach(attr => {
        if (!attr.is_variation) return;
        const sanitizedAttr = slugify(attr.name);
        const metaKey = `attribute_${sanitizedAttr}`;
        groupedVariations[attr.name] = {};

        variations.forEach(variation => {
            const val = variation.metaNow?.[metaKey];
            const valKey = val && val.trim() !== "" ? val.toLowerCase() : "__undefined__";

            if (!groupedVariations[attr.name][valKey]) {
                groupedVariations[attr.name][valKey] = [];
            }
            groupedVariations[attr.name][valKey].push(variation);
        });
    });


    const removeValueFromAttribute = (attrName, valToRemove) => {
        const updatedAttributes = { ...attributes };

        for (const key in updatedAttributes) {
            if (updatedAttributes[key].name === attrName) {
                updatedAttributes[key] = {
                    ...updatedAttributes[key],
                    value: updatedAttributes[key].value.filter(
                        v => v.toLowerCase() !== valToRemove.toLowerCase()
                    )
                };
                if (updatedAttributes[key].value.length === 0) {
                    delete updatedAttributes[key];
                }
                break;
            }
        }

        setAttributes(updatedAttributes);

        const attrKey = 'attribute_' + slugify(attrName.trim());

        const updatedVariations = variations.filter(variation => {
            return variation.metaNow[attrKey]?.toLowerCase() !== valToRemove.toLowerCase();
        });

        setVariations(updatedVariations);
    };

    const handleRemoveAttr = (id) => {
        setAttributes(prev => {
            const updated = {};
            for (const [key, attr] of Object.entries(prev)) {
                if (attr.id !== id) {
                    updated[key] = attr;
                }
            }
            return updated;
        });
    };

    return (
        <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
            <button
                type="button"
                onClick={() => setIsOpenAll(!isOpenAll)}
                className="flex items-center text-[#f6858b] text-xl md:text-2xl font-bold mb-4 w-full justify-between"
            >
                <span><FontAwesomeIcon icon={faTags} className="mr-3" /> Attributs</span>
                <span className="text-base text-gray-600">{isOpenAll ? '−' : '+'}</span>
            </button>

            {isOpenAll && (
                <>
                    {attributesArray.filter(attr => attr.is_variation).length === 0 && (
                        <AjouteAttribut name2={name} setAttributes={setAttributes} attributes={attributes} variations={variations}
                            setVariations={setVariations}
                            extendedAttributes={extendedAttributes} slugify={slugify} product={product} />
                    )}

                    {attributesArray.filter(attr => attr.is_variation).map((attr, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
                            <div className="p-2 border rounded-md mb-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg text-gray-700 font-bold">{attr.name}</h3>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttr(attr.id)}
                                        className="text-gray-500 hover:text-red-500"
                                        title="Supprimer"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                                <AttributeEditor
                                    key={attr.id}
                                    attr={attr}
                                    setAttributes={setAttributes}
                                    variations={variations}
                                    setVariations={setVariations}
                                    removeValueFromAttribute={removeValueFromAttribute}
                                    product={product}
                                    name2={name}
                                    slugify={slugify}
                                />
                            </div>

                            {Object.entries(groupedVariations[attr.name] || {}).map(([val, matchedVariations]) => (
                                <div
                                    key={val}
                                    className="text-gray-600 capitalize mb-2 p-4 bg-gray-100 rounded-lg shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold bg-white px-4 py-1 shadow-md">
                                            {val === "__undefined__" ? "Tout " + attr.name : val}
                                        </h4>
                                        {val !== "__undefined__" && (
                                            <button
                                                type="button"
                                                onClick={() => removeValueFromAttribute(attr.name, val)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Supprimer cette valeur"
                                            >
                                                <FontAwesomeIcon icon={faTimes} /> Supprimer
                                            </button>
                                        )}
                                    </div>

                                    {matchedVariations.length > 0 && (
                                        <ul className="ml-4 text-sm text-gray-500 list-disc">
                                            {matchedVariations.map((variation, index) => (
                                                <div key={index}>
                                                    <EveryVariation
                                                        key={variation.ID || index}
                                                        variation={variation}
                                                        setAttributes={setAttributes}
                                                        attributes={attributes}
                                                        setVariations={setVariations}
                                                    />
                                                </div>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
