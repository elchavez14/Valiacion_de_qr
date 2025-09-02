import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useNavigate } from 'react-router-dom';

export default function ScanQR() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    setScanning(true);

    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) {
        const url = result.getText();
        console.log("📸 QR Detectado:", url);

        try {
          const u = new URL(url);
          const id = u.searchParams.get("id");
          const jwt = u.hash.replace("#jwt=", "");

          if (id && jwt) {
            setScanning(false);
            codeReader.reset();
            navigate(`/orden/${id}?jwt=${jwt}`);
          } else {
            setError("⚠️ QR inválido o incompleto.");
          }
        } catch (e) {
          setError("⚠️ QR no contiene una URL válida.");
        }
      }
    });

    return () => {
      codeReader.reset();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold text-orange-500">📷 Escanear Código QR</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="border-4 border-orange-200 rounded overflow-hidden">
          <video ref={videoRef} className="w-full h-auto" />
        </div>

        {!scanning && (
          <p className="text-gray-600 text-sm italic">La cámara ha sido detenida.</p>
        )}
        <p className="text-sm text-gray-500">Apunta al código QR generado por el sistema.</p>
      </div>
    </div>
  );
}
