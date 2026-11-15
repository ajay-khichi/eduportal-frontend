import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Keyboard, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

export function StudentQrScanner({ onScanSuccess }) {
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const [manualToken, setManualToken] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    if (mode !== 'camera') {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              // Play gentle beep
              try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
              } catch (e) {}

              toast.success('QR Code Detected!');
              stopScanner();
              onScanSuccess(decodedText);
            }
          },
          (errorMessage) => {
            // Ignore frame-by-frame non-detection
          }
        );

        if (isMounted) {
          setScannerActive(true);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Camera failed:', err);
          setCameraError('Unable to access camera. Please check permissions or switch to manual input.');
          setScannerActive(false);
        }
      }
    };

    // Small delay to allow DOM element to render
    const t = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(t);
      stopScanner();
    };
  }, [mode, onScanSuccess]);

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      if (html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {}).then(() => {
          html5QrCodeRef.current?.clear();
          html5QrCodeRef.current = null;
        });
      } else {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    }
    setScannerActive(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      toast.error('Please enter a valid QR token');
      return;
    }
    onScanSuccess(manualToken.trim());
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
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/50 shadow-lg">
            <div id={scannerContainerId} className="w-full h-full" />

            {/* Scanning radar line overlay */}
            {scannerActive && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-lg shadow-indigo-500/50 animate-scan pointer-events-none" />
            )}

            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center">
                <CameraOff className="w-10 h-10 text-rose-500 mb-2" />
                <p className="text-xs text-rose-300 font-medium">{cameraError}</p>
                <button
                  onClick={() => setMode('manual')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
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
              placeholder="Paste or enter the token string here (e.g. from screen or clipboard)..."
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
