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
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/90 to-transparent">
        <button onClick={onClose} className="p-3 bg-zinc-900/50 backdrop-blur-md rounded-full text-white hover:bg-zinc-800 transition border border-white/10">
          <X size={20} />
        </button>
        <span className="text-white font-black italic text-lg tracking-widest uppercase"><span className="text-brand-500">SCAN</span> FOOD</span>
        <button onClick={toggleCamera} className="p-3 bg-zinc-900/50 backdrop-blur-md rounded-full text-white hover:bg-zinc-800 transition border border-white/10">
          <SwitchCamera size={20} />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {!cameraError ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
            <Camera size={48} className="mb-4 text-zinc-700" />
            <p className="mb-6 font-bold text-zinc-400">{cameraError}</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-brand-600 text-white px-8 py-3 rounded-full font-black uppercase tracking-wide hover:bg-brand-500 transition"
            >
              Upload Photo
            </button>
          </div>
        )}
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-8 right-8 bottom-1/4 border-2 border-white/30 rounded-2xl">
             {/* Corner Markers */}
             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-500 rounded-tl-xl -mt-1 -ml-1"></div>
             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-500 rounded-tr-xl -mt-1 -mr-1"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-500 rounded-bl-xl -mb-1 -ml-1"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-500 rounded-br-xl -mb-1 -mr-1"></div>
             
             <div className="w-full h-0.5 bg-brand-500 absolute top-0 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-scan"></div>
          </div>
          <p className="absolute bottom-[20%] w-full text-center text-white/80 text-xs font-bold uppercase tracking-widest">
            Align food within frame
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="h-36 bg-black flex items-center justify-around px-8 pb-8 pt-4 border-t border-zinc-900">
        <div className="w-16 flex flex-col items-center">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center text-zinc-500 hover:text-white transition group"
            >
                <div className="p-3 rounded-full bg-zinc-900 mb-2 group-hover:bg-zinc-800 transition">
                    <ImageIcon size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
            </button>
        </div>

        <button 
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center bg-transparent hover:bg-white/5 transition active:scale-95 relative"
        >
            <div className="absolute inset-0 rounded-full border border-white/20"></div>
            <div className="w-16 h-16 rounded-full bg-brand-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]"></div>
        </button>

        <div className="w-16"></div> 
      </div>
    </div>
  );
};