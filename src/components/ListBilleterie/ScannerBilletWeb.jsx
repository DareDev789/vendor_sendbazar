import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import axios from 'axios';
import nProgress from 'nprogress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { url } from '../../contextes/UrlContext';
import { QRCodeCanvas } from 'qrcode.react';
import FormatDateTime from '../../utils/FormatDateTime';

export default function ScannerBilletWeb() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanningLineVisible, setScanningLineVisible] = useState(null);
  const [qrResult, setQrResult] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [success, setSuccess] = useState(false);
  const [billet, setBillet] = useState(null);
  const [message, setMessage] = useState(null);
  const [isVerif, setIsVerif] = useState(true);
  const token = localStorage.getItem('token');
  const [facingMode, setFacingMode] = useState('environment');

  const videoConstraints = {
    width: 480,
    height: 360,
    facingMode: facingMode,
  };

  useEffect(() => {
    let animationFrameId;

    const scan = () => {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;

      if (
        video &&
        video.readyState === 4 &&
        canvas &&
        scanning
      ) {
        const context = canvas.getContext('2d');
        const width = video.videoWidth;
        const height = video.videoHeight;
        setScanningLineVisible(true);

        // Vérifie que la vidéo a bien une taille
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
          context.drawImage(video, 0, 0, width, height);

          const imageData = context.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, width, height);

          if (code && typeof code.data === 'string' && code.data.trim() !== '') {
            const data = code.data.trim();
            setQrResult(data);
            setScanning(false);
            setScanningLineVisible(false);
            return;
          }
        }
      }
      animationFrameId = requestAnimationFrame(scan);
    };

    if (scanning) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [scanning]);

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
    setScanning(true);
    setScanningLineVisible(true);
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
    <>
      <div className="flex flex-col items-center gap-4 p-4">
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {qrResult ? (
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
        ) : (
          <div>
            <h2 className="text-xl text-center mb-4 font-bold">Scanner un billet</h2>
            <div className="video-container shadow-2xl">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="rounded border border-gray-300"
              />
              {scanningLineVisible && (
                <>
                  <div className="absolute top-0 left-0 w-full h-full bg-green-500/15 z-[5] pointer-events-none">
                    {/* Coin en haut à gauche */}
                    <div className="absolute z-[12] top-0 left-0 w-[50px] h-[5px] bg-white"></div>
                    <div className="absolute z-[12] top-0 left-0 w-[5px] h-[50px] bg-white"></div>

                    <div className="absolute top-0 right-0 w-[50px] h-[5px] bg-white"></div>
                    <div className="absolute top-0 right-0 w-[5px] h-[50px] bg-white"></div>

                    {/* Coin en bas à gauche */}
                    <div className="absolute bottom-0 left-0 w-[50px] h-[5px] bg-white"></div>
                    <div className="absolute bottom-0 left-0 w-[5px] h-[50px] bg-white"></div>

                    {/* Coin en bas à droite */}
                    <div className="absolute bottom-0 right-0 w-[50px] h-[5px] bg-white"></div>
                    <div className="absolute bottom-0 right-0 w-[5px] h-[50px] bg-white"></div>
                  </div>
                  <div className="scan-animation" />
                </>
              )}
            </div>
            <div className="flex justify-center mt-2">
              <button
                className="bg-purple-600 text-white px-4 py-1 rounded"
                onClick={() =>
                  setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                }
              >
                🔁 Changer de caméra
              </button>
            </div>
            <p className="text-sm text-center mt-4 text-gray-600">📷 En attente de QR code...</p>
            {/* <div className='w-64 mx-auto mt-4'>
              <button className='w-full py-1 text-white bg-red-600 rounded-md' onClick={()=> }>Annuler</button>
            </div> */}
          </div>
        )}
      </div>
    </>
  );
}