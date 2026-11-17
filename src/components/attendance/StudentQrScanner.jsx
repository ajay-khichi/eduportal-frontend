import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Keyboard, RefreshCw, SwitchCamera } from 'lucide-react';
import toast from 'react-hot-toast';

export function StudentQrScanner({ onScanSuccess }) {
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const [manualToken, setManualToken] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [initializing, setInitializing] = useState(false);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'qr-reader-container';

  // Stop current active scanner
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore cleanup error
      } finally {
        html5QrCodeRef.current = null;
      }
    }
    // Ensure any lingering video tracks are stopped to free the camera
    const videoEl = document.querySelector(`#${scannerContainerId} video`);
    if (videoEl && videoEl.srcObject) {
      const tracks = videoEl.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setScannerActive(false);
  }, []);

  // Cleanup scanner when component unmounts
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const getAvailableCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (isMounted && devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/rear camera on mobile
          const backCam = devices.find((d) => {
            const label = d.label.toLowerCase();
            return label.includes('back') || label.includes('rear') || label.includes('environment');
          });
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      } catch (err) {
        console.warn('Could not enumerate cameras:', err);
      }
    };

    getAvailableCameras();

    return () => {
      isMounted = false;
    };
  }, []);

  // Start scanner whenever mode or selectedCameraId changes
  useEffect(() => {
    if (mode !== 'camera') {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setInitializing(true);
      setCameraError(null);

      // Clean up previous instance first
      await stopScanner();

      // Small delay to ensure DOM container is rendered
      await new Promise((r) => setTimeout(r, 250));

      const container = document.getElementById(scannerContainerId);
      if (!container || !isMounted) {
        setInitializing(false);
        return;
      }

      try {
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = html5QrCode;

        // Camera configuration: use selected device ID or flexible facingMode
        const cameraConfig = selectedCameraId
          ? selectedCameraId
          : { facingMode: { ideal: 'environment' } };

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edge = Math.floor(minEdge * 0.75);
            return { width: Math.max(edge, 180), height: Math.max(edge, 180) };
          },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        };

        await html5QrCode.start(
          cameraConfig,
          config,
          (decodedText) => {
            if (isMounted) {
              // Sound notification
              try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.12);
              } catch (e) {}

              toast.success('QR Code Captured!');
              stopScanner();
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Frame scanned without QR (normal operational state)
          }
        );

        if (isMounted) {
          setScannerActive(true);
          setInitializing(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Html5Qrcode start error:', err);
          let msg = 'Unable to access camera.';
          if (String(err).includes('NotAllowedError') || String(err).includes('Permission')) {
            msg = 'Camera permission denied. Please allow camera access in browser settings.';
          } else if (String(err).includes('NotFoundError') || String(err).includes('DevicesNotFoundError')) {
            msg = 'No camera found on this device.';
          } else if (String(err).includes('NotReadableError') || String(err).includes('TrackStartError')) {
            msg = 'Camera is in use by another application or tab.';
          } else if (window.isSecureContext === false) {
            msg = 'Camera access requires HTTPS or localhost.';
          }
          setCameraError(msg);
          // Ensure any lingering video tracks are stopped to free the camera
    const videoEl = document.querySelector(`#${scannerContainerId} video`);
    if (videoEl && videoEl.srcObject) {
      const tracks = videoEl.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setScannerActive(false);
          setInitializing(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [mode, selectedCameraId, onScanSuccess, stopScanner]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      toast.error('Please enter a valid QR token');
      return;
    }
    onScanSuccess(manualToken.trim());
  };

  const switchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCameraId(cameras[nextIndex].id);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mode switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('camera')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            mode === 'camera'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Camera Scanner
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            mode === 'manual'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          Enter Code Manually
        </button>
      </div>

      {mode === 'camera' ? (
        <div className="w-full max-w-sm flex flex-col items-center">
          {/* Camera switcher header if multiple cameras available */}
          {cameras.length > 1 && (
            <div className="w-full flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                {cameras.find((c) => c.id === selectedCameraId)?.label || 'Camera'}
              </span>
              <button
                type="button"
                onClick={switchCamera}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
                Flip Camera
              </button>
            </div>
          )}

          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/50 shadow-lg">
            {/* Html5Qrcode video mounting element */}
            <div id={scannerContainerId} className="w-full h-full" />

            {/* Scanning radar line overlay */}
            {scannerActive && !cameraError && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-lg shadow-indigo-500/50 animate-scan pointer-events-none" />
            )}

            {initializing && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center text-slate-400 z-10">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                <p className="text-xs font-semibold">Starting camera feed...</p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-20">
                <CameraOff className="w-10 h-10 text-rose-500 mb-2" />
                <p className="text-xs text-rose-300 font-medium mb-3">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Use Manual Token Instead
                </button>
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
            Point your camera towards the professor's rolling screen QR code.
          </p>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="w-full max-w-sm space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              QR Token Payload
            </label>
            <textarea
              rows={3}
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste or enter the token string here..."
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition"
            >
              Verify Token
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
