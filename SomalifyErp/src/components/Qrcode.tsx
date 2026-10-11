// // Qrcode.tsx
// import { useEffect, useRef, useState, useCallback } from 'react';
// import QrScanner from 'qr-scanner';

// type QRCodeScannerOptions = {
//   onScan: (data: string) => void;
// };

// export const useQRCodeScanner = (options: QRCodeScannerOptions) => {
//   const [isScanning, setIsScanning] = useState(false);
//   const scannerRef = useRef<QrScanner | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);

//   const startScanning = useCallback(async () => {
//     try {
//       if (!videoRef.current) return;

//       const hasCamera = await QrScanner.hasCamera();
//       if (!hasCamera) {
//         alert('No camera found');
//         return;
//       }

//       scannerRef.current = new QrScanner(
//         videoRef.current,
//         result => {
//           options.onScan(result.data);
//           // Remove stopScanning() here for continuous scanning
//         },
//         {
//           highlightScanRegion: true,
//           highlightCodeOutline: true,
//           preferredCamera: 'environment',
//           maxScansPerSecond: 5,
//           returnDetailedScanResult: true,
//         }
//       );

//       await scannerRef.current.start();
//       setIsScanning(true);
//     } catch (error) {
//       console.error('Error starting scanner:', error);
//       alert('Error accessing camera');
//     }
//   }, [options]);

//   const stopScanning = useCallback(() => {
//     scannerRef.current?.stop();
//     scannerRef.current?.destroy();
//     scannerRef.current = null;
//     setIsScanning(false);
//   }, []);

//   useEffect(() => {
//     return () => stopScanning();
//   }, [stopScanning]);

//   return {
//     startScanning,
//     stopScanning,
//     isScanning,
//     videoRef,
//   };
// };



// Qrcode.tsx (Updated with react-qr-barcode-scanner)
// import { useState, useCallback, useEffect, useRef } from 'react';
// import BarcodeScannerComponent from "react-qr-barcode-scanner";

// type BarcodeScannerOptions = {
//   onScan: (data: string) => void;
//   onError: (error: Error) => void;
// };

// export const useBarcodeScanner = ({ onScan, onError }: BarcodeScannerOptions) => {
//   const [isScanning, setIsScanning] = useState(false);
//   const [torchOn, setTorchOn] = useState(false);
//   const inputBuffer = useRef<string[]>([]);

//   // Handle physical scanner input
//   const handleKeyPress = useCallback((event: KeyboardEvent) => {
//     if (event.key === 'Enter') {
//       const barcode = inputBuffer.current.join('');
//       if (barcode.length > 0) {
//         onScan(barcode);
//         inputBuffer.current = [];
//       }
//     } else {
//       inputBuffer.current.push(event.key);
//     }
//   }, [onScan]);

//   useEffect(() => {
//     window.addEventListener('keypress', handleKeyPress);
//     return () => window.removeEventListener('keypress', handleKeyPress);
//   }, [handleKeyPress]);

//   const ScannerComponent = () => (
//     <div className="relative h-64 bg-black rounded-lg overflow-hidden">
//       <BarcodeScannerComponent
//         width="100%"
//         height="100%"
//         torch={torchOn}
//         onUpdate={(error, result) => {
//           if (error) {
//             onError(error);
//             return;
//           }
//           if (result) {
//             onScan(result.getText());
//             setIsScanning(false);
//           }
//         }}
//         facingMode="environment"
//         formats={[
//           'QR_CODE', 'CODE_128', 'EAN_13', 'UPC_A', 'EAN_8', 'CODE_39',
//           'CODE_93', 'CODABAR', 'DATA_MATRIX', 'ITF', 'PDF_417'
//         ]}
//       />
//       <button
//         className="absolute bottom-4 right-4 p-2 bg-white rounded-lg"
//         onClick={() => setTorchOn(!torchOn)}
//       >
//         {torchOn ? '🔦 Torch On' : '🔦 Torch Off'}
//       </button>
//     </div>
//   );

//   return {
//     ScannerComponent,
//     isScanning,
//     startScanning: () => setIsScanning(true),
//     stopScanning: () => setIsScanning(false),
//     torchOn,
//     toggleTorch: () => setTorchOn(!torchOn)
//   };
// };



// // Qrcode.tsx
// import { useEffect, useRef, useState, useCallback } from 'react';
// import QrScanner from 'qr-scanner';

// type QRCodeScannerOptions = {
//   onScan: (data: string) => void;
// };

// export const useQRCodeScanner = (options: QRCodeScannerOptions) => {
//   const [isScanning, setIsScanning] = useState(false);
//   const scannerRef = useRef<QrScanner | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const inputBuffer = useRef<string[]>([]);

//   // For physical barcode scanners
//   const handleKeyDown = useCallback((event: KeyboardEvent) => {
//     if (event.key === 'Enter') {
//       const barcode = inputBuffer.current.join('');
//       if (barcode.length > 0) {
//         options.onScan(barcode);
//         inputBuffer.current = [];
//       }
//     } else {
//       inputBuffer.current.push(event.key);
//     }
//   }, [options]);

//   // For camera scanning
//   const startScanning = useCallback(async () => {
//     try {
//       if (!videoRef.current) return;

//       const hasCamera = await QrScanner.hasCamera();
//       if (!hasCamera) {
//         alert('No camera found');
//         return;
//       }

//       scannerRef.current = new QrScanner(
//         videoRef.current,
//         result => {
//           options.onScan(result.data);
//         },
//         {
//           highlightScanRegion: true,
//           highlightCodeOutline: true,
//           preferredCamera: 'environment',
//           maxScansPerSecond: 5,
//           returnDetailedScanResult: true,
//         }
//       );

//       await scannerRef.current.start();
//       setIsScanning(true);
//       window.addEventListener('keydown', handleKeyDown);
//     } catch (error) {
//       console.error('Error starting scanner:', error);
//       alert('Error accessing camera');
//     }
//   }, [options, handleKeyDown]);

//   const stopScanning = useCallback(() => {
//     scannerRef.current?.stop();
//     scannerRef.current?.destroy();
//     scannerRef.current = null;
//     setIsScanning(false);
//     window.removeEventListener('keydown', handleKeyDown);
//   }, [handleKeyDown]);

//   useEffect(() => {
//     return () => stopScanning();
//   }, [stopScanning]);

//   return {
//     startScanning,
//     stopScanning,
//     isScanning,
//     videoRef,
//   };
// };



import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerWrapperProps {
  width: number;
  height: number;
  torch: boolean;
  onUpdate: (err: any, result: any) => void;
  formats: string[];
}

const BarcodeScannerWrapper: React.FC<BarcodeScannerWrapperProps> = ({
  width,
  height,
  torch,
  onUpdate,
  formats: _formats,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const deviceIdRef = useRef<string | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const startScanning = async () => {
      if (!videoRef.current) return;

      try {
        // Get available video input devices
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          onUpdate(new Error('No camera devices found'), null);
          return;
        }

        // Prefer back camera (environment) if available
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        
        const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;
        deviceIdRef.current = selectedDeviceId;

        // Start decoding from video device
        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              onUpdate(null, {
                getText: () => result.getText(),
                getBarcodeFormat: () => result.getBarcodeFormat(),
              });
            } else if (error && !(error instanceof NotFoundException)) {
              // NotFoundException is normal when no code is detected
              onUpdate(error, null);
            }
          }
        );
      } catch (error) {
        onUpdate(error, null);
      }
    };

    startScanning();

    return () => {
      codeReader.reset();
    };
  }, []);

  useEffect(() => {
    if (deviceIdRef.current && videoRef.current) {
      // Try to apply torch if supported
      navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceIdRef.current },
        }
      }).then(stream => {
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities() as { torch?: boolean };
          if (capabilities.torch) {
            track.applyConstraints({ advanced: [{ torch }] } as unknown as MediaTrackConstraints).catch(() => {
              // Torch not supported, ignore
            });
          }
        }
        // Stop the temporary stream
        stream.getTracks().forEach(t => t.stop());
      }).catch(() => {
        // Ignore errors
      });
    }
  }, [torch]);

  return (
    <video
      ref={videoRef}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
      playsInline
      muted
    />
  );
};

export default BarcodeScannerWrapper;
