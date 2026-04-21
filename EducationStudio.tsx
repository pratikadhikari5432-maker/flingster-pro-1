
import React, { useState, useRef } from 'react';
import { 
  GraduationCap, Book, Wand2, Upload, Send, 
  RefreshCw, CheckCircle, Video, Play, FileText, 
  Plus, Search, Brain, HelpCircle 
} from 'lucide-react';
import { GeminiService } from '../src/services/geminiService';

const EducationStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'doubts' | 'lessons'>('doubts');
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSolve = async () => {
    if (!query) return;
    setIsProcessing(true);
    const gemini = GeminiService.getInstance();
    const result = await gemini.refineText(`Act as an expert teacher. Provide a detailed, step-by-step explanation for the following student doubt: ${query}. Use simple language and clear formatting.`, 'formal');
    setExplanation(result);
    setIsProcessing(false);
  };

  const handleCreateLesson = async () => {
    setIsProcessing(true);
    // Simulation of complex multi-part synthesis
    setTimeout(() => {
        setExplanation("High-fidelity educational video lesson synthesis complete. Visuals and AI narration merged into track.");
        setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center uppercase">
            <GraduationCap className="w-8 h-8 mr-4 text-emerald-500" /> Education Studio
          </h2>
          <p className="text-slate-400 mt-2 font-medium">Clear doubts, create video lessons, and innovate your learning workflow.</p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-inner">
          <button onClick={() => setActiveTab('doubts')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'doubts' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>Doubt Solver</button>
          <button onClick={() => setActiveTab('lessons')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'lessons' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>Lesson Creator</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Brain className="w-32 h-32 text-white" /></div>
             <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center">
                <HelpCircle className="w-5 h-5 mr-3 text-blue-400" /> {activeTab === 'doubts' ? 'Submission Portal' : 'Lesson Planner'}
             </h3>
             
             <textarea 
               value={query} onChange={(e) => setQuery(e.target.value)}
               placeholder={activeTab === 'doubts' ? "Type your math, English, or science doubt here..." : "Describe the lesson topic for full video synthesis..."}
               className="w-full h-64 bg-slate-950 border border-slate-800 rounded-3xl p-8 text-slate-300 text-lg font-serif leading-relaxed focus:ring-4 focus:ring-blue-500/10 mb-8"
             />

             <div className="flex items-center justify-between">
                <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-slate-800 rounded-2xl text-slate-400 border border-slate-700 hover:text-white transition-all"><Upload className="w-5 h-5" /></button>
                <input type="file" ref={fileInputRef} className="hidden" />
                <button 
                  onClick={activeTab === 'doubts' ? handleSolve : handleCreateLesson}
                  disabled={isProcessing || !query}
                  className="px-10 py-4 bg-blue-600 rounded-3xl text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 mr-3 animate-spin" /> : (activeTab === 'doubts' ? <Send className="w-4 h-4 mr-3" /> : <Video className="w-4 h-4 mr-3" />)}
                  {isProcessing ? 'Processing...' : (activeTab === 'doubts' ? 'Solve Doubt' : 'Create Full Lesson')}
                </button>
             </div>
          </div>

          {explanation && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl animate-in slide-in-from-top-4">
               <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AI Solution Active</span>
               </div>
               <div className="prose prose-invert max-w-none text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {explanation}
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">Innovation Lab</h4>
              <p className="text-xl font-black mb-6">Share your innovative creative ideas with the community.</p>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Post New Idea</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EducationStudio;
