import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import SelectImagesProduct from "./SelectImagesProduct";

export default function AttributsCompVariationForm({ register, errors, watch, label, variation, title, setValue }) {
    const [currentRowForImageSelect, setCurrentRowForImageSelect] = useState(null);
    const slug = label ? label.toLowerCase().replace(/\s+/g, '_') : 'variation';

    const currentVariation = Array.isArray(variation)
        ? variation.find(v => v && v.metaNow) ?? {}
        : variation ?? {};

    const meta = currentVariation.metaNow ?? {};

    const [isTelechargeable, setIsTelechargeable] = useState(meta._downloadable === "yes");
    const [isVirtuel, setIsVirtuel] = useState(meta._virtual === "yes");
    const [isGenerStock, setIsGenerStock] = useState(meta._manage_stock === "yes");

    const [files, setFiles] = useState(() => {
        if (meta._downloadable_files && typeof meta._downloadable_files === "object") {
            return Object.entries(meta._downloadable_files).map(([key, fileObj]) => ({
                id: Date.now() + Math.random(),
                name: fileObj.name ?? "",
                url: fileObj.file ?? "",
                file: null,
            }));
        }
        return [];
    });

    const [sku, setSku] = useState(meta._sku ?? "");
    const [priceReduit, setPriceReduit] = useState(meta._sale_price ?? "");
    const [priceStandar, setPriceStandar] = useState(meta._regular_price ?? "");
    const [stockQuantity, setStockQuantity] = useState(meta._stock ?? "");
    const [stockStatusOption, setStockStatusOption] = useState(meta._stock_status || "");
    const [weight, setWeight] = useState(meta._weight ?? "");
    const [width, setWidth] = useState(meta._width ?? "");
    const [height, setHeight] = useState(meta._height ?? "");
    const [length, setLength] = useState(meta._length ?? "");
    const [variationDesc, setVariationDesc] = useState(meta._variation_description ?? "");
    const [downloadLimit, setDownloadLimit] = useState(meta._download_limit ?? "");
    const [downloadExpiry, setDownloadExpiry] = useState(meta._download_expiry ?? "");
    const [backordersOption, setBackordersOption] = useState(meta._backorders || "onbackorder");
    const [initialTauxTvaOption, setInitialTauxTvaOption] = useState(meta._tax_class || "");
    const [isActive, setIsActive] = useState(currentVariation?.post_status === "publish");
    
    const [selecteOne, setSelecteOne] = useState(false);
    const [selectedImages, setSelectedImages] = useState(null);
    const [gallery, setGallery] = useState([]);

    const [showMap, setShowMap] = useState(false);
    

    const [imageUrl, setImageUrl] = useState(null);

    const imageVariation = meta._thumbnail_id?.[0]?.url || "";

    useEffect(() => {
        if (imageVariation) {
            setImageUrl(meta._thumbnail_id?.[0]?.url || null);
        }
    }, [imageVariation]);

    const OpenMap = (selecteOne, index = null) => {
        setSelecteOne(selecteOne);
        setCurrentRowForImageSelect(index);
        setShowMap(true);
    };


    const handleAddFile = () => {
        setFiles(prev => [...prev, { id: Date.now(), name: '', url: '', file: null }]);
    };

    const handleChange = (id, field, value) => {
        setFiles(prev =>
            prev.map(file => (file.id === id ? { ...file, [field]: value } : file))
        );
    };

    const handleRemove = (id) => {
        setFiles(prev => {
            const updatedFiles = prev.filter(file => file.id !== id);
            setValue(`variations.${slug}.downloadable_files`, updatedFiles);
            return updatedFiles;
        });
    };


    const timestampToDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(Number(timestamp) * 1000);
        return date.toISOString().slice(0, 10);
    };

    const [isPlanned, setIsPlanned] = useState(
        !!(meta._sale_price_dates_from || meta._sale_price_dates_to)
    );
    const [startDate, setStartDate] = useState(timestampToDate(meta._sale_price_dates_from));
    const [endDate, setEndDate] = useState(timestampToDate(meta._sale_price_dates_to));

    const urlfinal = typeof imageUrl === 'string' ? imageUrl : imageUrl?.url;

    useEffect(() => {
        const finalUrl = typeof imageUrl === 'string' ? imageUrl : imageUrl?.url ?? '';
        setValue(`variations.${slug}.urlfinal`, finalUrl);
    }, [imageUrl, slug, setValue]);


    const post_title = `${label.split('-')[0].trim()} - ${title}`;

    return (
        <div className="mt-8 text-sm text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div className="mb-4 h-full">
                        <div className="relative w-full h-full">
                            {showMap && (
                                <SelectImagesProduct
                                    selectedImages={selectedImages}
                                    setSelectedImages={setSelectedImages}
                                    setGallery={setGallery}
                                    setThumbnail={(img) => {
                                        if (currentRowForImageSelect !== null) {
                                            setFiles(prev =>
                                                prev.map((file, idx) =>
                                                    idx === currentRowForImageSelect ? { ...file, url: img?.url || "" } : file
                                                )
                                            );
                                            setValue(`variations.${slug}.downloadable_files.${currentRowForImageSelect}.url`, img?.url || "");
                                            setCurrentRowForImageSelect(null);
                                        } else {
                                            setImageUrl(img);
                                        }
                                        setShowMap(false);
                                    }}
                                    setShowMap={setShowMap}
                                    showMap={showMap}
                                    selecteOne={selecteOne}
                                />
                            )}

                            <label htmlFor="upload-image" className="flex flex-col items-center justify-center gap-2 p-2 w-full h-full border border-gray-300 rounded cursor-pointer hover:bg-gray-100 transition">
                                {!imageUrl ? (
                                    <div
                                        onClick={()=> OpenMap(true)}
                                        className="border-2 border-dashed border-gray-300 rounded-lg w-full h-52 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition"
                                    >
                                        <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="mt-2 text-gray-600">Ajouter une image</span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img src={urlfinal} alt="Main" className="w-full max-h-72 shadow-md p-1 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl(null)}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                    <input type="hidden" {...register(`variations.${slug}.urlfinal`)} />
                    <input type="hidden" value={post_title} {...register(`variations.${slug}.post_title`)} />
                    <div className="grid grid-cols-1 gap-2">
                        <label className="inline-flex items-center text-sm text-gray-700">
                            <input 
                                type="checkbox" 
                                className="mr-2"
                                {...register(`variations.${slug}.isActive`)}
                                defaultChecked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                            Activé
                        </label>
                        <label className="inline-flex items-center text-sm text-gray-700">
                            <input
                                type="checkbox"
                                className="mr-2"
                                {...register(`variations.${slug}.isTelechargeable`)}
                                defaultChecked={isTelechargeable}
                                onChange={(e) => setIsTelechargeable(e.target.checked)}
                            />
                            Téléchargeable
                        </label>

                        <label className="inline-flex items-center text-sm text-gray-700">
                            <input
                                type="checkbox"
                                className="mr-2"
                                {...register(`variations.${slug}.isVirtuel`)}
                                defaultChecked={isVirtuel}
                                onChange={(e) => setIsVirtuel(e.target.checked)}
                            />
                            Virtuel
                        </label>

                        <label className="inline-flex items-center text-sm text-gray-700">
                            <input
                                type="checkbox"
                                className="mr-2"
                                {...register(`variations.${slug}.isGenerStock`)}
                                defaultChecked={isGenerStock}
                                onChange={(e) => setIsGenerStock(e.target.checked)}
                            />
                            Gérer le stock
                        </label>
                    </div>
                </div>

                <div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">UGS</label>
                        <input
                            type="text"
                            {...register(`variations.${slug}.sku`)}
                            defaultValue={sku}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>

                    {!isGenerStock && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">État du stock</label>
                            <select
                                {...register(`variations.${slug}.stockStatusOption`)}
                                defaultValue={stockStatusOption}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="instock">Disponible</option>
                                <option value="outofstock">Non disponible</option>
                                <option value="onbackorder">En réapprovisionnement</option>
                            </select>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix standard (€)</label>
                    <input
                        type="number"
                        {...register(`variations.${slug}.priceStandar`)}
                        defaultValue={priceStandar}
                        placeholder="Prix de la variation (réquis)"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix réduit (€)
                        <button
                            type="button"
                            className="ml-2 text-red-500 hover:underline"
                            onClick={() => setIsPlanned(prev => !prev)}
                        >
                            {isPlanned ? "Annuler la planification" : "Planifier"}
                        </button>
                    </label>
                    <input
                        type="number"
                        {...register(`variations.${slug}.priceReduit`)}
                        defaultValue={priceReduit}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>

                {isPlanned && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date début vente</label>
                            <input
                                type="date"
                                {...register(`variations.${slug}.startDate`)}
                                defaultValue={startDate}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date fin vente</label>
                            <input
                                type="date"
                                {...register(`variations.${slug}.endDate`)}
                                defaultValue={endDate}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                    </>
                )}
            </div>

            {isGenerStock && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantité disponible</label>
                        <input
                            type="number"
                            {...register(`variations.${slug}.stockQuantity`)}
                            defaultValue={stockQuantity}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Permettre des commandes d'oeuvres non disponibles ?</label>
                        <select
                            {...register(`variations.${slug}.backordersOption`)}
                            defaultValue={backordersOption}
                            className="w-full p-2 border border-gray-300 rounded"
                        >
                            <option value="no">Ne pas autoriser</option>
                            <option value="notify">Autoriser, mais avec avec notification client</option>
                            <option value="yes">Autoriser</option>
                        </select>
                    </div>
                </div>
            )}

            {!isVirtuel && (
                <>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
                            <input
                                type="number"
                                {...register(`variations.${slug}.weight`)}
                                defaultValue={weight}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                            <input type="number" {...register(`variations.${slug}.length`)} defaultValue={length} className="w-full p-2 mb-1 border border-gray-300 rounded" placeholder="Longueur" />
                            <input type="number" {...register(`variations.${slug}.width`)} defaultValue={width} className="w-full p-2 mb-1 border border-gray-300 rounded" placeholder="Largeur" />
                            <input type="number" {...register(`variations.${slug}.height`)} defaultValue={height} className="w-full p-2 border border-gray-300 rounded" placeholder="Hauteur" />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Classe de livraison</label>
                        <select {...register(`variations.${slug}.deliveryClass`)} className="w-full p-2 border border-gray-300 rounded">
                            <option value="produit_principal">Identique au produit principal</option>
                            <option value="livraison_poids">Livraison par poids</option>
                        </select>
                    </div>
                </>
            )}

            <div className="mt-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Taux de TVA</label>
                <select
                    {...register(`variations.${slug}.initialTauxTvaOption`)}
                    defaultValue={initialTauxTvaOption}
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
                    {...register(`variations.${slug}.variationDesc`)}
                    defaultValue={variationDesc}
                    className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
            </div>

            {isTelechargeable && (
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
                                                {...register(`variations.${slug}.downloadable_files.${index}.name`)}
                                                defaultValue={file.name}
                                                onChange={(e) => handleChange(file.id, 'name', e.target.value)}
                                                className="w-full p-1 border border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="p-2 border border-gray-300">
                                            <div className="flex gap-2 flex-col md:flex-row">
                                                <input
                                                    type="text"
                                                    placeholder="http://"
                                                    {...register(`variations.${slug}.downloadable_files.${index}.url`)}
                                                    defaultValue={file.url}
                                                    onChange={(e) => handleChange(file.id, 'url', e.target.value)}
                                                    className="w-full p-1 border border-gray-300 rounded flex-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => OpenMap(true, index)}
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
                                {...register(`variations.${slug}.downloadLimit`)}
                                defaultValue={downloadLimit}
                                placeholder="Illimité"
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiration du téléchargement</label>
                            <input
                                type="number"
                                {...register(`variations.${slug}.downloadExpiry`)}
                                defaultValue={downloadExpiry}
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
