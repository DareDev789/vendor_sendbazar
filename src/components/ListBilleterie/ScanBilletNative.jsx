import React, { useState, useEffect } from 'react';
import {
    BarcodeScanner,
    BarcodeFormat,
    LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import { Torch } from '@capawesome/capacitor-torch';
import axios from 'axios';
import nProgress from 'nprogress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { url } from '../../contextes/UrlContext';
import { QRCodeCanvas } from 'qrcode.react';
import FormatDateTime from '../../utils/FormatDateTime';

export default function ScanBilletNative() {
    const [scanning, setScanning] = useState(false);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [cameraFacing, setCameraFacing] = useState(LensFacing.BACK);

    const [qrResult, setQrResult] = useState(null);
    const [success, setSuccess] = useState(false);
    const [billet, setBillet] = useState(null);
    const [message, setMessage] = useState(null);
    const [isVerif, setIsVerif] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        return () => {
            BarcodeScanner.stopScan();
            document.querySelector('body')?.classList.remove('barcode-scanner-active');
        };
    }, []);

    const startScan = async () => {
        try {
            setQrResult(null);
            setScanning(true);
            document.querySelector('body')?.classList.add('barcode-scanner-active');

            const listener = await BarcodeScanner.addListener(
                'barcodeScanned',
                async (result) => {
                    const value = result?.barcode?.rawValue;
                    if (value) {
                        
                        setQrResult(value);

                        setTimeout(() => {
                            stopScan();
                        }, 300);
                    }
                }
            );

            await BarcodeScanner.startScan();
        } catch (error) {
            console.error('Erreur lors du scan :', error);
            stopScan();
        }
    };


    const stopScan = async () => {
        setScanning(false);
        document.querySelector('body')?.classList.remove('barcode-scanner-active');
        await BarcodeScanner.removeAllListeners();
        await BarcodeScanner.stopScan();
    };

    const toggleTorch = async () => {
        const { enabled } = await Torch.isEnabled();

        if (enabled) {
            await disableTorch();
            setTorchEnabled(false);
        } else {
            await enableTorch();
            setTorchEnabled(true);
        }
    };

    const enableTorch = async () => {
        await Torch.enable();
    };

    const disableTorch = async () => {
        await Torch.disable();
    };

    const switchCamera = async () => {
        const newCamera = cameraFacing === LensFacing.BACK ? LensFacing.FRONT : LensFacing.BACK;
        setCameraFacing(newCamera);

        if (scanning) {
            await stopScan();
            await startScan();
        }
    };


    const verifierBillet = async () => {
        setMessage(null);
        try {
            nProgress.start();
            const response = await axios.get(`${url}/verifierbillet/${encodeURIComponent(qrResult)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccess(response?.data?.success);
            setBillet(response?.data?.data || null);
            setMessage(response?.data?.message);
            setIsVerif(true);
        } catch (error) {
            console.error('Error verifying ticket:', error);
            setSuccess(false);
            setMessage(error?.message || 'Une erreur est survenue pendant la verification !');
        } finally {
            nProgress.done();
        }
    }

    const reinitialise = () => {
        setSuccess(null);
        setBillet(null);
        setMessage(null);
        setQrResult(null);
        setScanningLineVisible(true);
        startScan();
    }

    const validerBillet = async () => {
        try {
            nProgress.start();
            const response = await axios.get(`${url}/validerbillet/${encodeURIComponent(qrResult)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSuccess(response?.data?.success);
            setBillet(response?.data?.data || null);
            setMessage(response?.data?.message);
            setIsVerif(false);
        } catch (error) {
            console.error('Error validating ticket:', error);
            setSuccess(false);
            setMessage(error?.message || 'Une erreur est survenue pendant la validation !');
        } finally {
            nProgress.done();
        }
    }

    useEffect(() => {
        if (qrResult) {
            verifierBillet();
        }
    }, [qrResult]);



    return (
        <div>
            <h2 className='text-center text-2xl font-bold'>Scanner le code QR du billet</h2>

            {scanning && (
                <div className="barcode-scanner-modal h-full w-full">
                    {/* Barre en haut */}
                    <div className="barcode-scanner-header">
                        <button onClick={stopScan}>
                            ⏹️ Stop Scan
                        </button>
                    </div>

                    {/* Bouton torche en bas */}
                    <div className="barcode-scanner-footer">
                        <button onClick={toggleTorch}>
                            {torchEnabled ? '💡 Éteindre la torche' : '🔦 Allumer la torche'}
                        </button>
                    </div>
                </div>
            )}

            {!scanning && !qrResult && (
                <div className='mt-8 mx-auto w-64 flex items-center justify-between'>
                    <button className="text-white bg-[#f6858b] w-64 px-6 py-2 rounded-sm" onClick={startScan}>
                        ▶️ Démarrer le scan
                    </button>
                </div>
            )}
            {qrResult && (
                <div className="mt-2">
                    <p className="mb-4 text-center"><strong>Résultat QR :</strong></p>

                    <div className="w-[270px] mx-auto text-center p-8 bg-white shadow-xl relative">
                        <QRCodeCanvas value={qrResult} size={200} />
                        <p className="text-sm text-center mt-3">{qrResult}</p>

                        {message && (
                            <p className={`text-center font-bold ${success ? "text-green-700" : "text-red-700"}`}>
                                <i>{message}</i>
                            </p>
                        )}

                        {/* Coins du cadre */}
                        <div className={`absolute z-[12] top-0 left-0 w-[50px] h-[5px] ${billet && billet?.validated ? "bg-green-600" : "bg-red-700"}`}></div>
                        <div className={`absolute z-[12] top-0 left-0 w-[5px] h-[50px] ${billet && billet?.validated ? "bg-green-600" : "bg-red-700"}`}></div>

                        <div className={`absolute top-0 right-0 w-[50px] h-[5px] ${billet && billet?.validated ? "bg-green-600" : "bg-red-700"}`}></div>
                        <div className={`absolute top-0 right-0 w-[5px] h-[50px] ${billet && billet?.validated ? "bg-green-600" : "bg-red-700"}`}></div>

                        <div className={`absolute bottom-0 left-0 w-[50px] h-[5px] ${billet && billet?.validated ? "bg-green-600" : "bg-red-700"}`}></div>
                        <div className={`absolute bottom-0 left-0 w-[5px] h-[50px] ${billet && billet?.validated ? "bg-green-600" : "bg-red-700"}`}></div>

                        <div className={`absolute bottom-0 right-0 w-[50px] h-[5px] ${billet && billet?.validated ? "bg-green-600" : "bg-red-700"}`}></div>
                        <div className={`absolute bottom-0 right-0 w-[5px] h-[50px] ${billet && billet?.validated ? "bg-green-600" : "bg-red-700"}`}></div>
                    </div>

                    {billet && (
                        <div className="p-4 w-[500px] max-w-[90%] mx-auto my-2 text-center">
                            <p><b>Client : </b>{billet?.nameClient || 'N/A'}</p>
                            <p><b>Billet pour : </b>{billet?.billet || 'N/A'}</p>
                            <p><b>Date : </b><FormatDateTime dateString={billet?.date} /></p>

                            {billet?.validated ? (
                                <div className="mx-auto bg-green-600 text-white capitalize px-4 py-1 rounded text-center">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" /> Billet Validé : <FormatDateTime dateString={billet?.verified_at} />
                                </div>
                            ) : (
                                <button
                                    onClick={() => validerBillet()}
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    ✅ Valider
                                </button>
                            )}
                        </div>
                    )}

                    <div className="w-[500px] pl-40 mx-auto mt-4">
                        <button
                            onClick={() => reinitialise()}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            🔄 Reprendre
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
