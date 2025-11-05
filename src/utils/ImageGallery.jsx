import Notiflix from "notiflix";
import React, { useRef } from "react";
import { useState } from "react";
import SelectImagesProduct from "./SelectImagesProduct";


export default function ImageGallery({ setGallery, gallery = [], thumbnail, setThumbnail }) {
    const [showMap, setShowMap] = useState(false);
    const [selecteOne, setSelecteOne] = useState(false);
    const [selectedImages, setSelectedImages] = useState(null);

    const OpenMap = (selecteOne) => {
        setSelecteOne(selecteOne);
        setShowMap(true);
    }

    const removeImage = (id) => {
        setGallery(prev => prev.filter(img => img.id !== id));
    };

    return (
        <>
            {showMap && (
                <SelectImagesProduct
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                    setGallery={setGallery}
                    setThumbnail={setThumbnail}
                    setShowMap={setShowMap}
                    showMap={showMap}
                    selecteOne={selecteOne}
                />
            )}
            <div className="bg-white rounded-lg shadow-sm select-none">
                <div className="mb-3">
                    {!thumbnail ? (
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
                            <img src={thumbnail?.url} alt="Main" className="w-full max-h-72 shadow-md p-1 object-cover rounded-lg" />
                            <button
                                type="button"
                                onClick={() => setThumbnail(null)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-5 gap-2">
                        {gallery.length > 0 && gallery.map((img) => (
                            <div key={img.id} className="relative group">
                                <img src={img.url} alt="Preview" className="w-full h-12 object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(img.id)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        <div
                            onClick={()=> OpenMap(false)}
                            className="border-2 border-dashed py-4 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition"
                        >
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}