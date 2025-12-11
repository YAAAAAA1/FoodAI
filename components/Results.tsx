import React, { useState } from 'react';
import { FoodAnalysis } from '../types';
import { analysisSchema } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, Candy, Wheat, Code, FileJson, Copy, Check, ExternalLink } from 'lucide-react';

interface ResultsProps {
  data: FoodAnalysis;
  imageUri: string;
  onReset: () => void;
}

const COLORS = ['#22c55e', '#3b82f6', '#eab308']; // Green (Protein), Blue (Carbs), Yellow (Fat)

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
      <div className="fixed inset-0 z-[60] bg-gray-900 text-gray-300 font-mono text-sm flex flex-col">
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center space-x-2 text-white">
                <FileJson size={20} className="text-brand-400" />
                <span className="font-bold">API Response & Integration</span>
            </div>
            <button 
                onClick={() => setShowApi(false)}
                className="text-gray-400 hover:text-white transition px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500"
            >
                Close
            </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-8">
            {/* Live Data Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-brand-400 font-bold uppercase tracking-wider text-xs">Live Response Data</h3>
                    <button 
                        onClick={() => handleCopy(JSON.stringify(data, null, 2))}
                        className="flex items-center text-xs text-gray-500 hover:text-white transition"
                    >
                        {copied ? <Check size={14} className="mr-1 text-green-500" /> : <Copy size={14} className="mr-1" />}
                        {copied ? 'Copied' : 'Copy JSON'}
                    </button>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 overflow-x-auto">
                    <pre className="text-xs leading-relaxed text-green-500/90">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </div>

            {/* Integration Code Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-blue-400 font-bold uppercase tracking-wider text-xs">Integration Code</h3>
                    <button 
                        onClick={() => handleCopy(getIntegrationCode())}
                        className="flex items-center text-xs text-gray-500 hover:text-white transition"
                    >
                        {copied ? <Check size={14} className="mr-1 text-green-500" /> : <Copy size={14} className="mr-1" />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 overflow-x-auto mb-3">
                    <pre className="text-xs leading-relaxed text-blue-300/90 whitespace-pre-wrap">
                        {getIntegrationCode()}
                    </pre>
                </div>
                
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-brand-400 hover:text-brand-300 transition text-xs border border-brand-400/30 rounded-lg px-3 py-2 bg-brand-500/10"
                >
                  <ExternalLink size={14} />
                  <span>Get your free Gemini API Key here</span>
                </a>
            </div>
        </div>
      </div>
    );
  }

  // Not Food View
  if (!data.is_food) {
    return (
      <div className="flex flex-col h-full bg-white relative">
        <div className="absolute top-0 right-0 p-4 z-20">
             <button 
                onClick={() => setShowApi(true)}
                className="bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/60 transition flex items-center space-x-2 px-4 border border-white/10"
             >
                <Code size={16} />
                <span className="text-xs font-medium">API View</span>
             </button>
        </div>
        
        <div className="relative h-64 w-full bg-gray-100">
          <img src={imageUri} alt="Captured" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
            <h2 className="text-white text-2xl font-bold">Not Food?</h2>
          </div>
        </div>
        <div className="p-8 flex flex-col items-center justify-center flex-1 text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-gray-600 text-lg mb-6">
                We couldn't identify any food in this image. Our AI sees: <span className="font-semibold text-gray-800">{data.food_name}</span>.
            </p>
            <button 
                onClick={onReset}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-800 transition w-full"
            >
                Try Again
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
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* Hero Image */}
      <div className="relative h-72 w-full">
        <img src={imageUri} alt={data.food_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>
        
        {/* API Toggle Button (Top Right) */}
        <div className="absolute top-0 right-0 p-4 z-20">
             <button 
                onClick={() => setShowApi(true)}
                className="bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/60 transition flex items-center space-x-2 px-4 border border-white/10"
             >
                <Code size={16} />
                <span className="text-xs font-medium">API View</span>
             </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-1">{data.food_name}</h1>
                    <p className="text-gray-300 text-sm flex items-center">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs mr-2">{data.serving_size_estimate}</span>
                        Confidence: {data.confidence}%
                    </p>
                </div>
                <div className="text-right">
                     <div className="text-4xl font-bold text-brand-400">{data.calories_kcal}</div>
                     <div className="text-xs uppercase tracking-wider font-medium text-gray-400">Calories</div>
                </div>
            </div>
        </div>
      </div>

      <div className="px-6 py-8 -mt-6 relative z-10 bg-gray-50 rounded-t-3xl">
        
        {/* Health Score */}
        <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div>
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Health Score</span>
                <div className="flex items-baseline mt-1">
                    <span className={`text-3xl font-bold ${data.health_score > 70 ? 'text-green-500' : data.health_score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {data.health_score}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">/ 100</span>
                </div>
            </div>
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-100">
               {data.health_score > 70 ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-yellow-500" />}
            </div>
        </div>

        {/* Macros Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Macronutrients</h3>
            <div className="flex items-center">
                <div className="h-40 w-40 relative flex-shrink-0">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={macroData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
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
                        <span className="text-gray-400 text-xs">Total</span>
                        <span className="text-gray-800 font-bold">{Math.round(totalMacros)}g</span>
                    </div>
                </div>
                
                <div className="flex-1 ml-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-600 text-sm">Protein</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-gray-800">{data.macronutrients.protein_g}g</span>
                            <span className="text-xs text-gray-400">{renderMacroPercent(data.macronutrients.protein_g)}%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-gray-600 text-sm">Carbs</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-gray-800">{data.macronutrients.carbs_g}g</span>
                            <span className="text-xs text-gray-400">{renderMacroPercent(data.macronutrients.carbs_g)}%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span className="text-gray-600 text-sm">Fat</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-gray-800">{data.macronutrients.fat_g}g</span>
                            <span className="text-xs text-gray-400">{renderMacroPercent(data.macronutrients.fat_g)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-2">
                    <Candy className="w-5 h-5 text-purple-400 mr-2" />
                    <span className="text-sm text-gray-500 font-medium">Sugar</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">{data.micronutrients.sugar_g}g</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-2">
                    <Wheat className="w-5 h-5 text-orange-400 mr-2" />
                    <span className="text-sm text-gray-500 font-medium">Fiber</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">{data.micronutrients.fiber_g}g</span>
            </div>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">About this food</h3>
            <p className="text-gray-600 leading-relaxed text-sm">{data.short_description}</p>
        </div>
        
        {/* Alternatives */}
        {data.alternatives && data.alternatives.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                 <h3 className="text-lg font-bold text-gray-800 mb-3">Alternatives / Similar</h3>
                 <div className="flex flex-wrap gap-2">
                    {data.alternatives.map((alt, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                            {alt}
                        </span>
                    ))}
                 </div>
            </div>
        )}
      </div>

      {/* Sticky Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 flex flex-col gap-3">
        <button 
            onClick={onReset}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition transform active:scale-[0.98]"
        >
            Scan Next Food
        </button>
        <button 
            onClick={() => setShowApi(true)}
            className="w-full bg-transparent text-gray-500 py-2 rounded-xl font-medium text-sm hover:text-gray-900 transition flex items-center justify-center"
        >
            <Code size={14} className="mr-2" /> View Integration Code
        </button>
      </div>
    </div>
  );
};