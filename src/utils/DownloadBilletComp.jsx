import { faTicket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";

import Draggable from "react-draggable";
import ImageCropper from "./ImageCropper";
import TicketDesign1 from "./TicketDesign1";

export default function DownloadBilletComp({ billet, setBillet, errorBillet, watch, typebillet, setTypeBillet }) {
    const [billetBDD, setBilletBDD] = useState(true);
    const fileInputRef = useRef(null);
    const [tempImage, setTempImage] = useState();
    const [showCropper, setShowCropper] = useState(false);
    const qrValue = "https://example.com/billet/12345";

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.match("image.*")) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setTempImage(event.target.result);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = (croppedUrl) => {
        setBillet({
            id: Date.now().toString(),
            url: croppedUrl,
        });
        setBilletBDD(false);
        setShowCropper(false);
    };

    const removeImage = () => {
        setBillet(null);
    };

    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4 text-[#f6858b]">
                <FontAwesomeIcon className="mr-2" icon={faTicket} />
                Uploader le Billet
            </h1>
            <div className="flex w-full px-2 py-1">
                {/* <div onClick={() => { if (typebillet !== '1') setShowCropper(true); setTypeBillet('1') }} className={`px-2 py-2 mx-2 cursor-pointer rounded-md ${typebillet === '1' ? "shadow-blue-600 shadow-sm border-2 border-blue-600 text-blue-600 font-bold" : "shadow-md"}`}>
                    Design 1
                </div>
                <div onClick={() => { if (typebillet !== '2') setShowCropper(true); setTypeBillet('2'); }} className={`px-2 py-2 mx-2 cursor-pointer rounded-md ${typebillet === '2' ? "shadow-blue-600 shadow-sm border-2 border-blue-600 text-blue-600 font-bold" : "shadow-md"}`}>
                    Design 2
                </div> */}
            </div>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: "none" }}
            />

            {showCropper && tempImage && (
                <ImageCropper imageSrc={tempImage} onCropComplete={handleCropComplete} />
            )}

            {!showCropper && billet ? (
                <div className="w-full p-2">
                    <p className="text-sm font-medium text-center text-gray-700 mb-2">
                        Billet téléchargé avec positionnement du QR code.
                    </p>
                    <div className="flex justify-center">
                        <TicketDesign1
                            billet={billet}
                            removeImage={removeImage}
                            qrValue={qrValue}
                            watch={watch}
                            billetBDD={billetBDD}
                            setBillet={setBillet}
                            setShowCropper={setShowCropper} />
                    </div>
                </div>
            ) : null}

            {!billet && !showCropper && (
                <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg w-full h-52 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition"
                >
                    <svg
                        className="h-7 w-7 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    <span className="mt-2 text-gray-600">Ajouter une image du billet</span>
                    {errorBillet && (
                        <p className="text-red-500 text-xs mt-1">{errorBillet}</p>
                    )}
                </div>
            )}
        </div>
    );
}
