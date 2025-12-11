import React, { useState } from 'react';
import { AppState, ScanResult } from './types';
import { analyzeFoodImage } from './services/geminiService';
import { Scanner } from './components/Scanner';
import { Results } from './components/Results';
import { ScanLine, Utensils, Zap, Loader2, ArrowRight, Activity, Dumbbell } from 'lucide-react';

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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(249,115,22,0.15)_0%,transparent_60%)] animate-pulse"></div>
        </div>
        
        <div className="relative z-10 bg-zinc-900 p-8 rounded-3xl shadow-[0_0_50px_rgba(249,115,22,0.1)] border border-zinc-800 flex flex-col items-center max-w-sm w-full">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 relative">
                 <Loader2 size={40} className="text-brand-500 animate-spin" />
                 <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full animate-ping opacity-30"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">ANALYZING</h2>
            <p className="text-zinc-500 text-sm">Identifying fuel & macros...</p>
        </div>
      </div>
    );
  }

  if (state === AppState.RESULTS && result) {
    return <Results data={result.data} imageUri={result.imageUri} onReset={resetApp} />;
  }

  if (state === AppState.ERROR) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6 border border-red-900/50">
            <Zap size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Analysis Failed</h2>
        <p className="text-zinc-500 mb-8 max-w-xs mx-auto">{errorMsg}</p>
        <button 
          onClick={resetApp}
          className="bg-zinc-100 text-black px-8 py-3 rounded-xl font-bold hover:bg-white transition uppercase tracking-wide text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // IDLE State (Home Screen)
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden text-white font-sans selection:bg-brand-500 selection:text-white">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-orange-700 rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>

      <header className="px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-600 skew-x-[-10deg] rounded flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                <Activity size={18} className="text-white skew-x-[10deg]" />
            </div>
            <span className="font-extrabold text-xl tracking-tighter text-white italic">FUEL<span className="text-brand-500">SCAN</span></span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-3 py-1 rounded text-zinc-500">
          Beta
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 z-10">
        <div className="mt-8 mb-12">
            <h1 className="text-6xl font-black text-white leading-[0.9] mb-6 tracking-tighter italic">
                EAT.<br />
                SCAN.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-300">PERFORM.</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-md font-medium">
                The ultimate AI tool for tracking your nutritional intake. Instant macro analysis for peak performance.
            </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-900/80 backdrop-blur-sm p-5 rounded-2xl border border-zinc-800 hover:border-brand-500/50 transition duration-300 group">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center mb-3 group-hover:bg-brand-500 transition duration-300">
                    <Zap size={20} className="text-brand-500 group-hover:text-white transition duration-300" />
                </div>
                <h3 className="font-bold text-white mb-1 uppercase text-sm tracking-wide">Instant</h3>
                <p className="text-xs text-zinc-500">Real-time analysis</p>
            </div>
            <div className="bg-zinc-900/80 backdrop-blur-sm p-5 rounded-2xl border border-zinc-800 hover:border-brand-500/50 transition duration-300 group">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center mb-3 group-hover:bg-brand-500 transition duration-300">
                    <Dumbbell size={20} className="text-brand-500 group-hover:text-white transition duration-300" />
                </div>
                <h3 className="font-bold text-white mb-1 uppercase text-sm tracking-wide">Macros</h3>
                <p className="text-xs text-zinc-500">Protein focused</p>
            </div>
        </div>
        
        <div className="flex-1"></div>

        <div className="mb-8">
             <button 
                onClick={() => setState(AppState.CAMERA)}
                className="w-full group relative flex items-center justify-center py-5 bg-brand-600 text-white rounded-2xl font-black text-xl italic tracking-wide shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:bg-brand-500 transition overflow-hidden active:scale-[0.98]"
            >
                <span className="relative z-10 flex items-center">
                    SCAN MEAL <ArrowRight size={24} className="ml-2 group-hover:translate-x-1 transition" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-orange-500 to-brand-600 opacity-0 group-hover:opacity-100 transition duration-500"></div>
            </button>
            <p className="text-center text-[10px] uppercase tracking-widest text-zinc-600 mt-6 font-bold">
                Powered by Gemini 2.5 Vision
            </p>
        </div>
      </main>
    </div>
  );
}