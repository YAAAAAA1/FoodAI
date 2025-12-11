import React, { useState } from 'react';
import { FoodAnalysis } from '../types';
import { analysisSchema } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, Candy, Wheat, Code, FileJson, Copy, Check, ExternalLink, Activity } from 'lucide-react';

interface ResultsProps {
  data: FoodAnalysis;
  imageUri: string;
  onReset: () => void;
}

const COLORS = ['#f97316', '#3b82f6', '#eab308']; // Orange (Protein), Blue (Carbs), Yellow (Fat)

export const Results: React.FC<ResultsProps> = ({ data, imageUri, onReset }) => {
  const [showApi, setShowApi] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIntegrationCode = () => {
    return `import { GoogleGenAI, Type, Schema } from "@google/genai";

// 1. Get your API Key: https://aistudio.google.com/app/apikey
const apiKey = "YOUR_API_KEY"; 

const ai = new GoogleGenAI({ apiKey });

// 2. Define Schema (Copy this exactly)
const schema = ${JSON.stringify(analysisSchema, null, 2)};

// 3. Helper Function
async function identifyFood(base64Image, mimeType = 'image/jpeg') {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: "Analyze this image. If it is food, provide a detailed nutritional breakdown..." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });
  
  return JSON.parse(response.text);
}`;
  };

  // Render API View Modal
  if (showApi) {
    return (
      <div className="fixed inset-0 z-[60] bg-black text-gray-300 font-mono text-sm flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-black flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center space-x-2 text-white">
                <FileJson size={20} className="text-brand-500" />
                <span className="font-bold tracking-tight">API & INTEGRATION</span>
            </div>
            <button 
                onClick={() => setShowApi(false)}
                className="text-zinc-400 hover:text-white transition px-3 py-1 rounded border border-zinc-700 hover:border-zinc-500 text-xs font-bold uppercase"
            >
                Close
            </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-8 bg-zinc-950">
            {/* Live Data Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-brand-500 font-bold uppercase tracking-wider text-xs">Live Response Data</h3>
                    <button 
                        onClick={() => handleCopy(JSON.stringify(data, null, 2))}
                        className="flex items-center text-xs text-zinc-500 hover:text-white transition"
                    >
                        {copied ? <Check size={14} className="mr-1 text-green-500" /> : <Copy size={14} className="mr-1" />}
                        {copied ? 'Copied' : 'Copy JSON'}
                    </button>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 overflow-x-auto">
                    <pre className="text-xs leading-relaxed text-brand-400">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </div>

            {/* Integration Code Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-blue-500 font-bold uppercase tracking-wider text-xs">Integration Code</h3>
                    <button 
                        onClick={() => handleCopy(getIntegrationCode())}
                        className="flex items-center text-xs text-zinc-500 hover:text-white transition"
                    >
                        {copied ? <Check size={14} className="mr-1 text-green-500" /> : <Copy size={14} className="mr-1" />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 overflow-x-auto mb-3">
                    <pre className="text-xs leading-relaxed text-blue-300/90 whitespace-pre-wrap">
                        {getIntegrationCode()}
                    </pre>
                </div>
                
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-brand-500 hover:text-brand-400 transition text-xs border border-brand-500/30 rounded-lg px-3 py-2 bg-brand-500/10 uppercase font-bold tracking-wide"
                >
                  <ExternalLink size={14} />
                  <span>Get Gemini API Key</span>
                </a>
            </div>
        </div>
      </div>
    );
  }

  // Not Food View
  if (!data.is_food) {
    return (
      <div className="flex flex-col h-full bg-black relative">
        <div className="absolute top-0 right-0 p-4 z-20">
             <button 
                onClick={() => setShowApi(true)}
                className="bg-zinc-900/80 backdrop-blur-md text-white p-2 rounded-lg hover:bg-zinc-800 transition flex items-center space-x-2 px-4 border border-zinc-700"
             >
                <Code size={16} />
                <span className="text-xs font-bold uppercase">API</span>
             </button>
        </div>
        
        <div className="relative h-64 w-full bg-zinc-900">
          <img src={imageUri} alt="Captured" className="w-full h-full object-cover opacity-50 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-6">
            <h2 className="text-white text-3xl font-black italic uppercase">Not Food?</h2>
          </div>
        </div>
        <div className="p-8 flex flex-col items-center justify-center flex-1 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-zinc-400 text-lg mb-6">
                System couldn't identify food. Detected: <span className="font-bold text-white uppercase">{data.food_name}</span>.
            </p>
            <button 
                onClick={onReset}
                className="bg-brand-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider shadow-lg hover:bg-brand-500 transition w-full"
            >
                Retry Scan
            </button>
        </div>
      </div>
    );
  }

  const macroData = [
    { name: 'Protein', value: data.macronutrients.protein_g },
    { name: 'Carbs', value: data.macronutrients.carbs_g },
    { name: 'Fat', value: data.macronutrients.fat_g },
  ];

  const totalMacros = data.macronutrients.protein_g + data.macronutrients.carbs_g + data.macronutrients.fat_g;
  const renderMacroPercent = (val: number) => totalMacros > 0 ? Math.round((val / totalMacros) * 100) : 0;

  return (
    <div className="min-h-screen bg-black pb-36 text-white font-sans">
      {/* Hero Image */}
      <div className="relative h-72 w-full">
        <img src={imageUri} alt={data.food_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        {/* API Toggle Button (Top Right) */}
        <div className="absolute top-0 right-0 p-4 z-20">
             <button 
                onClick={() => setShowApi(true)}
                className="bg-black/50 backdrop-blur-md text-white p-2 rounded-lg hover:bg-black/80 transition flex items-center space-x-2 px-4 border border-white/10"
             >
                <Code size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">API View</span>
             </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tight mb-1">{data.food_name}</h1>
                    <p className="text-zinc-300 text-sm flex items-center font-medium">
                        <span className="bg-brand-600 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold mr-2 tracking-wider">{data.serving_size_estimate}</span>
                        CONFIDENCE: {data.confidence}%
                    </p>
                </div>
                <div className="text-right">
                     <div className="text-5xl font-black text-brand-500 italic tracking-tighter">{data.calories_kcal}</div>
                     <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Calories</div>
                </div>
            </div>
        </div>
      </div>

      <div className="px-5 py-8 -mt-6 relative z-10 bg-black rounded-t-3xl border-t border-zinc-800">
        
        {/* Health Score */}
        <div className="mb-6 flex items-center justify-between bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
            <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Health Score</span>
                <div className="flex items-baseline mt-1">
                    <span className={`text-4xl font-black italic ${data.health_score > 70 ? 'text-brand-500' : data.health_score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {data.health_score}
                    </span>
                    <span className="text-zinc-600 text-sm ml-1 font-bold">/ 100</span>
                </div>
            </div>
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center bg-zinc-950 border ${data.health_score > 70 ? 'border-brand-500/30' : 'border-zinc-800'}`}>
               <Activity className={data.health_score > 70 ? "text-brand-500" : "text-yellow-500"} size={28} />
            </div>
        </div>

        {/* Macros Chart */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/5 rounded-full blur-2xl"></div>
            
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Macronutrients</h3>
            <div className="flex items-center">
                <div className="h-40 w-40 relative flex-shrink-0">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={macroData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {macroData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold">Total</span>
                        <span className="text-white font-black text-xl italic">{Math.round(totalMacros)}g</span>
                    </div>
                </div>
                
                <div className="flex-1 ml-6 space-y-4">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded bg-brand-500 mr-3"></div>
                            <span className="text-zinc-300 text-sm font-bold uppercase">Protein</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-white">{data.macronutrients.protein_g}g</span>
                            <span className="text-[10px] text-zinc-500 font-medium">{renderMacroPercent(data.macronutrients.protein_g)}%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded bg-blue-500 mr-3"></div>
                            <span className="text-zinc-300 text-sm font-bold uppercase">Carbs</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-white">{data.macronutrients.carbs_g}g</span>
                            <span className="text-[10px] text-zinc-500 font-medium">{renderMacroPercent(data.macronutrients.carbs_g)}%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded bg-yellow-500 mr-3"></div>
                            <span className="text-zinc-300 text-sm font-bold uppercase">Fat</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-white">{data.macronutrients.fat_g}g</span>
                            <span className="text-[10px] text-zinc-500 font-medium">{renderMacroPercent(data.macronutrients.fat_g)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center mb-2">
                    <Candy className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sugar</span>
                </div>
                <span className="text-2xl font-black text-white">{data.micronutrients.sugar_g}g</span>
            </div>
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center mb-2">
                    <Wheat className="w-4 h-4 text-brand-400 mr-2" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Fiber</span>
                </div>
                <span className="text-2xl font-black text-white">{data.micronutrients.fiber_g}g</span>
            </div>
        </div>

        {/* Description */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">About this fuel</h3>
            <p className="text-zinc-300 leading-relaxed text-sm font-medium">{data.short_description}</p>
        </div>
        
        {/* Alternatives */}
        {data.alternatives && data.alternatives.length > 0 && (
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6">
                 <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Alternatives</h3>
                 <div className="flex flex-wrap gap-2">
                    {data.alternatives.map((alt, idx) => (
                        <span key={idx} className="bg-black border border-zinc-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide">
                            {alt}
                        </span>
                    ))}
                 </div>
            </div>
        )}
      </div>

      {/* Sticky Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-md border-t border-zinc-800 z-50 flex flex-col gap-3">
        <button 
            onClick={onReset}
            className="w-full bg-brand-600 text-white py-4 rounded-xl font-black italic text-lg uppercase tracking-wide shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-brand-500 transition transform active:scale-[0.98]"
        >
            Scan Next Meal
        </button>
        <button 
            onClick={() => setShowApi(true)}
            className="w-full bg-transparent text-zinc-500 py-2 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:text-white transition flex items-center justify-center"
        >
            <Code size={12} className="mr-2" /> View Integration Code
        </button>
      </div>
    </div>
  );
};