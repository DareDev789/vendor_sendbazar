import Cropper from 'react-easy-crop';
import { useState, useCallback } from 'react';
import getCroppedImg from './cropImage';

export default function ImageCropper({ imageSrc, onCropComplete }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropCompleteInternal = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async (e) => {
        e.preventDefault();
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onCropComplete(croppedImage);
    };

    return (
        <div className="relative w-full h-[400px] bg-black">
            <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 4}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropCompleteInternal}
            />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(e.target.value)}
                />
                <button
                    onClick={(e)=> handleConfirm(e)}
                    className="bg-green-500 text-white px-4 py-1 rounded"
                >
                    Recadrer
                </button>
            </div>
        </div>
    );
}
