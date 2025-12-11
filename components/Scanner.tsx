import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, X, SwitchCamera, Image as ImageIcon } from 'lucide-react';

interface ScannerProps {
  onCapture: (imageUri: string) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setCameraError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please allow permissions or use file upload.");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition">
          <X size={24} />
        </button>
        <span className="text-white font-medium text-sm tracking-wide">SCAN FOOD</span>
        <button onClick={toggleCamera} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition">
          <SwitchCamera size={24} />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        {!cameraError ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
            <Camera size={48} className="mb-4 opacity-50" />
            <p className="mb-4">{cameraError}</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-brand-500 text-white px-6 py-2 rounded-full font-semibold"
            >
              Upload Photo Instead
            </button>
          </div>
        )}
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-8 right-8 bottom-1/4 border-2 border-white/50 rounded-lg">
             <div className="w-full h-0.5 bg-brand-400 absolute top-0 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-scan"></div>
          </div>
          <p className="absolute bottom-1/4 w-full text-center text-white/80 text-sm mt-4 font-medium">
            Position food within the frame
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="h-32 bg-black flex items-center justify-around px-8 pb-4">
        <div className="w-12">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center text-white/60 hover:text-white transition"
            >
                <ImageIcon size={24} />
                <span className="text-xs mt-1">Upload</span>
            </button>
        </div>

        <button 
            onClick={handleCapture}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent hover:bg-white/10 transition active:scale-95"
        >
            <div className="w-12 h-12 rounded-full bg-brand-500"></div>
        </button>

        <div className="w-12"></div> 
      </div>
    </div>
  );
};