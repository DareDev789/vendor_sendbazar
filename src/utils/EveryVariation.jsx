import { useState, useEffect } from "react";
import SelectImagesProduct from "./SelectImagesProduct";
import { url } from '../contextes/UrlContext';
import axios from 'axios';

export default function EveryVariation({ variation, setVariations, setAttributes, attributes }) {
    const [showMap, setShowMap] = useState(false);
    const [thumbnailId, setThumbnailId] = useState(variation?.metaNow?._thumbnail_id?.[0] || []);
    
    useEffect(() => {
        if (
            !variation?.metaNow?._class_shipping &&
            variation?.shipping_classes?.[0]?.term_taxonomy_id
        ) {
            updateVariationMetaField("_class_shipping", variation.shipping_classes[0].term_taxonomy_id);
        }else{
            updateVariationMetaField("_class_shipping", "");
        }
    }, []);

    const [AllShippingClass, setAllShippingClass] = useState([]);
    
      const getAllShippingClass = async () => {
        try {
          const response = await axios.get(`${url}/getall-shipping-class`);
          setAllShippingClass(response.data);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      }
    
      useEffect(() => {
        getAllShippingClass();
      }, []);

    const updateVariationField = (field, value) => {
        setVariations(prev => prev.map(v => {
            if (v.ID === variation.ID) {
                return {
                    ...v,
                    [field]: value
                };
            }
            return v;
        }));
    };



    const updateVariationMetaField = (field, value) => {
        setVariations(prev => prev.map(v => {
            if (v.ID === variation.ID) {
                let newValue = value;

                if (field === "_class_shipping") {
                    newValue = value === "" ? "" : parseInt(value, 10);
                }

                return {
                    ...v,
                    metaNow: {
                        ...v.metaNow,
                        [field]: newValue
                    }
                };
            }
            return v;
        }));
    };


    const removeThumbnail = () => {
        setThumbnailId(null);
        setVariations(prev => prev.map(v => {
            if (v.ID === variation.ID) {
                return {
                    ...v,
                    metaNow: {
                        ...v.metaNow,
                        _thumbnail_id: []
                    }
                };
            }
            return v;
        }));
    };

    useEffect(() => {
        if (thumbnailId !== null) {
            setVariations(prev => prev.map(v => {
                if (v.ID === variation.ID) {
                    return {
                        ...v,
                        metaNow: {
                            ...v.metaNow,
                            _thumbnail_id: [thumbnailId]
                        }
                    };
                }
                return v;
            }));
        } else {
            setVariations(prev => prev.map(v => {
                if (v.ID === variation.ID) {
                    const updatedMeta = { ...v.metaNow };
                    delete updatedMeta._thumbnail_id;
                    return {
                        ...v,
                        metaNow: updatedMeta
                    };
                }
                return v;
            }));
        }
    }, [thumbnailId]);

    const [files, setFiles] = useState(() => {
        if (variation?.metaNow?._downloadable_files && typeof variation?.metaNow?._downloadable_files === "object") {
            return Object.entries(variation?.metaNow?._downloadable_files).map(([key, fileObj]) => ({
                id: Date.now() + Math.random(),
                name: fileObj.name ?? "",
                file: fileObj.file ?? "",
            }));
        }
        return [];
    });

    const handleFileChange = (id, field, value) => {
        setFiles(prev =>
            prev.map(file =>
                file.id === id ? { ...file, [field]: value } : file
            )
        );
    };

    useEffect(() => {
        const fileMap = {};
        files.forEach((file, index) => {
            fileMap[`${index}`] = {
                name: file.name,
                file: file.file,
            };
        });

        updateVariationMetaField("_downloadable_files", fileMap);
    }, [files]);



    const handleAddFile = () => {
        setFiles(prev => [...prev, { id: Date.now(), name: '', url: '', file: null }]);
    };

    const handleRemove = (id) => {
        setFiles(prev => prev.filter(file => file.id !== id));
    };


    const [currentFileIndex, setCurrentFileIndex] = useState(null);
    const [selectingFileForDownload, setSelectingFileForDownload] = useState(false);

    const OpenMap = (type, index = null) => {
        if (type === "thumbnail") {
            setShowMap(true);
            setSelecteOne(true);
        } else if (type === "file") {
            setSelectingFileForDownload(true);
            setCurrentFileIndex(index);
        }
    };

    useEffect(() => {
        if (variation?.metaNow?._virtual === "yes") {
            updateVariationMetaField("_weight", "");
            updateVariationMetaField("_length", "");
            updateVariationMetaField("_width", "");
            updateVariationMetaField("_height", "");
            updateVariationMetaField("_class_shipping", "");
        }
    }, [variation?.metaNow?._virtual]);


    return (
        <div className="mt-8 text-sm text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="block md:flex gap-4 justify-between items-start">
                    <div className="mb-4 h-full">
                        <div className="relative w-full h-full">
                            {showMap && (
                                <SelectImagesProduct
                                    setThumbnail={setThumbnailId}
                                    setShowMap={setShowMap}
                                    showMap={showMap}
                                    selecteOne={true}
                                />
                            )}

                            {selectingFileForDownload && (
                                <SelectImagesProduct
                                    setShowMap={setSelectingFileForDownload}
                                    showMap={selectingFileForDownload}
                                    selecteOne={true}
                                    setThumbnail={(file) => {
                                        if (currentFileIndex !== null) {
                                            const fileUrl = typeof file === 'string' ? file : file?.url || file?.source_url || '';

                                            setFiles(prev =>
                                                prev.map((f, idx) =>
                                                    idx === currentFileIndex ? { ...f, file: fileUrl } : f
                                                )
                                            );
                                        }
                                    }}

                                />
                            )}

                            <div className="mb-3">
                                {(!variation?.metaNow?._thumbnail_id || variation?.metaNow?._thumbnail_id?.length === 0 || !variation.metaNow._thumbnail_id?.[0]?.url) ? (
                                    <div
                                        onClick={() => setShowMap(true)}
                                        className="border-2 border-dashed border-gray-300 rounded-lg w-32 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition"
                                    >
                                        <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="mt-2 text-gray-600 text-center">Ajouter une image</span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={variation.metaNow._thumbnail_id?.[0]?.url || ""}
                                            alt="Main"
                                            className="w-full max-h-72 shadow-md p-1 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeThumbnail}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <input
                            type="text"
                            value={variation?.post_title || ''}
                            onChange={(e) => updateVariationField("post_title", e.target.value)}
                            className="w-full p-2 border hidden border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                    <div className="mb-4 w-full">
                        <div className="grid grid-cols-1 gap-2">
                            <label className="inline-flex items-center text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    defaultChecked={variation?.post_status === 'publish' || false}
                                    onChange={(e) => updateVariationField("post_status", e.target.checked ? 'publish' : 'draft')}
                                />
                                Activé
                            </label>
                            <label className="inline-flex items-center text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    defaultChecked={variation?.metaNow?._downloadable === 'yes' || false}
                                    onChange={(e) => updateVariationMetaField("_downloadable", e.target.checked ? 'yes' : 'no')}
                                />
                                Téléchargeable
                            </label>

                            <label className="inline-flex items-center text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    defaultChecked={variation?.metaNow?._virtual === 'yes' || false}
                                    onChange={(e) => updateVariationMetaField("_virtual", e.target.checked ? 'yes' : 'no')}
                                />
                                Virtuel
                            </label>

                            <label className="inline-flex items-center text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    defaultChecked={variation?.metaNow?._manage_stock === 'yes' || false}
                                    onChange={(e) => updateVariationMetaField("_manage_stock", e.target.checked ? 'yes' : 'no')}
                                />
                                Gérer le stock
                            </label>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <label className="block text-gray-700 font-semibold mb-2">SKU :</label>
                    <input
                        type="text"
                        value={variation?.metaNow?._sku || ''}
                        onChange={(e) => updateVariationMetaField("_sku", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="SKU de la variation"
                    />
                    {variation?.metaNow?._manage_stock === "yes" && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">État du stock</label>
                            <select
                                value={variation?.metaNow?._stock_status || 'instock'}
                                className="w-full p-2 border border-gray-300 rounded"
                                onChange={(e) => updateVariationMetaField("_stock_status", e.target.value)}
                            >
                                <option value="instock">Disponible</option>
                                <option value="outofstock">Non disponible</option>
                                <option value="onbackorder">En réapprovisionnement</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="px-2 py-1">
                    <label className="block text-gray-700 font-semibold mb-2">Prix standard:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={variation?.metaNow?._regular_price || ''}
                        onChange={(e) => updateVariationMetaField("_regular_price", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Prix de la variation"
                    />
                </div>
                <div className="px-2 py-1">
                    <label className="block text-gray-700 font-semibold mb-2">Prix promotionnel:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={variation?.metaNow?._sale_price || ''}
                        onChange={(e) => updateVariationMetaField("_sale_price", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Prix réduit"
                    />
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="px-2 py-1">
                    <label className="block text-gray-700 font-semibold mb-2">Stock:</label>
                    <input
                        type="number"
                        step={1}
                        value={variation?.metaNow?._stock || ''}
                        onChange={(e) => updateVariationMetaField("_stock", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Quantité en stock"
                    />
                    <label className="inline-flex items-center mt-2 text-sm text-gray-700">Low Stock Threshold:</label>
                    <input
                        type="number"
                        step={1}
                        value={variation?.metaNow?._low_stock_amount || ''}
                        onChange={(e) => updateVariationMetaField("_low_stock_amount", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Seuil de stock faible"
                    />

                </div>
                <div>
                    {variation?.metaNow?._virtual === "no" && (
                        <>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
                                    <input
                                        type="number"
                                        value={variation?.metaNow?._weight || ''}
                                        onChange={(e) => updateVariationMetaField("_weight", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                                    <input type="number" value={variation?.metaNow?._length || ''} onChange={(e) => updateVariationMetaField("_length", e.target.value)} className="w-full p-2 mb-1 border border-gray-300 rounded" placeholder="Longueur" />
                                    <input type="number" value={variation?.metaNow?._width || ''} onChange={(e) => updateVariationMetaField("_width", e.target.value)} className="w-full p-2 mb-1 border border-gray-300 rounded" placeholder="Largeur" />
                                    <input type="number" value={variation?.metaNow?._height || ''} onChange={(e) => updateVariationMetaField("_height", e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Hauteur" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Classe de livraison</label>
                                <select value={variation?.metaNow?._class_shipping || ""} onChange={(e) => updateVariationMetaField("_class_shipping", e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                                   <option value="">Identique au produit principal</option>
                                    {AllShippingClass?.map((allShippingClas, index) => (
                                        <option key={index} value={allShippingClas.term_taxonomy_id}>
                                            {allShippingClas.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="mt-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Taux de TVA</label>
                <select
                    value={variation?.metaNow?._tax_class || ''}
                    onChange={(e) => updateVariationMetaField("_tax_class", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                >
                    <option value="parent">Identique au produit principal</option>
                    <option value="">Standard</option>
                    <option value="taux-reduit">Taux réduit</option>
                    <option value="taux-zero">Taux zéro</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                    rows="4"
                    value={variation?.metaNow?._variation_description || ''}
                    onChange={(e) => updateVariationMetaField("_variation_description", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
            </div>
            {variation?.metaNow?._downloadable === 'yes' && (
                <div className="p-4 border border-dashed border-gray-400 rounded text-sm text-gray-700">
                    <h3 className="text-base font-semibold mb-4">Fichiers téléchargeables</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-gray-400 min-w-[600px]">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border border-gray-300">Nom</th>
                                    <th className="p-2 border border-gray-300">URL du fichier</th>
                                    <th className="p-2 border border-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file, index) => (
                                    <tr key={file.id} className="bg-white">
                                        <td className="p-2 border border-gray-300">
                                            <input
                                                type="text"
                                                placeholder="Nom du fichier"
                                                value={file.name || ''}
                                                onChange={(e) => handleFileChange(file.id, 'name', e.target.value)}
                                                className="w-full p-1 border border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="p-2 border border-gray-300">
                                            <div className="flex gap-2 flex-col md:flex-row">
                                                <input
                                                    type="url"
                                                    placeholder="http://"
                                                    value={file.file || ''}
                                                    onChange={(e) => handleFileChange(file.id, 'file', e.target.value)}
                                                    className="w-full p-1 border border-gray-300 rounded flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => OpenMap("file", index)}
                                                    className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition text-sm"
                                                >
                                                    Choisir le fichier
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-2 border border-gray-300 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(file.id)}
                                                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                                title="Supprimer"
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="3" className="p-2 border border-gray-300 text-center">
                                        <button
                                            type="button"
                                            onClick={handleAddFile}
                                            className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 transition text-sm"
                                        >
                                            Ajouter un fichier
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>


                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Limite de téléchargement</label>
                            <input
                                type="number"
                                value={variation?.metaNow?._download_limit || ''}
                                onChange={(e) => updateVariationMetaField("_download_limit", e.target.value)}
                                placeholder="Illimité"
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiration du téléchargement</label>
                            <input
                                type="number"   
                                value={variation?.metaNow?._download_expiry || ''}
                                onChange={(e) => updateVariationMetaField("_download_expiry", e.target.value)}
                                placeholder="Jamais"
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
