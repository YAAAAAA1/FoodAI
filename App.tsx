import React, { useState } from 'react';
import { AppState, ScanResult } from './types';
import { analyzeFoodImage } from './services/geminiService';
import { Scanner } from './components/Scanner';
import { Results } from './components/Results';
import { ScanLine, Utensils, Zap, Loader2, ArrowRight } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCapture = async (imageUri: string) => {
    setState(AppState.ANALYZING);
    try {
      // Extract base64 content
      const base64Data = imageUri.split(',')[1];
      const mimeType = imageUri.split(';')[0].split(':')[1];
      
      const analysis = await analyzeFoodImage(base64Data, mimeType);
      
      setResult({
        imageUri,
        data: analysis
      });
      setState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze image. Please try again.");
      setState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setState(AppState.IDLE);
    setResult(null);
    setErrorMsg(null);
  };

  // ---------------------------------------------------------------------------
  // Renders
  // ---------------------------------------------------------------------------

  if (state === AppState.CAMERA) {
    return <Scanner onCapture={handleCapture} onClose={() => setState(AppState.IDLE)} />;
  }

  if (state === AppState.ANALYZING) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(74,222,128,0.1)_0%,transparent_60%)] animate-pulse"></div>
        </div>
        
        <div className="relative z-10 bg-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 relative">
                 <Loader2 size={40} className="text-brand-500 animate-spin" />
                 <div className="absolute inset-0 border-4 border-brand-100 rounded-full animate-ping opacity-20"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Food</h2>
            <p className="text-gray-500 max-w-xs">Identifying ingredients and calculating macros...</p>
        </div>
      </div>
    );
  }

  if (state === AppState.RESULTS && result) {
    return <Results data={result.data} imageUri={result.imageUri} onReset={resetApp} />;
  }

  if (state === AppState.ERROR) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Zap size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-8">{errorMsg}</p>
        <button 
          onClick={resetApp}
          className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // IDLE State (Home Screen)
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <header className="px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                <Utensils size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">NutriScan</span>
        </div>
        <div className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-600">AI Powered</div>
      </header>

      <main className="flex-1 flex flex-col px-6 z-10">
        <div className="mt-8 mb-12">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
                Know what<br /> you <span className="text-brand-600">eat.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                Instantly analyze calories, macros, and ingredients just by taking a photo. Your personal food API in your pocket.
            </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Zap size={20} className="text-yellow-500" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Instant</h3>
                <p className="text-xs text-gray-500">Real-time AI analysis</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <ScanLine size={20} className="text-blue-500" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Accurate</h3>
                <p className="text-xs text-gray-500">Macro breakdown</p>
            </div>
        </div>
        
        <div className="flex-1"></div>

        <div className="mb-8">
             <button 
                onClick={() => setState(AppState.CAMERA)}
                className="w-full group relative flex items-center justify-center py-4 bg-black text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-800 transition overflow-hidden"
            >
                <span className="relative z-10 flex items-center">
                    Scan Food <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-400 opacity-0 group-hover:opacity-100 transition duration-500"></div>
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
                Powered by Gemini 2.5 Flash Vision Model
            </p>
        </div>
      </main>
    </div>
  );
}