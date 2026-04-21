import React, { useState, useMemo } from 'react';
import { 
  ImageIcon, Layers, Wand2, Contrast, Sun, 
  RotateCcw, Download, Sparkles, Trash2, Eye, 
  EyeOff, Lock, Unlock, Plus, SlidersHorizontal, 
  Scan, Target, MousePointer2, Focus, Crop, 
  Brush, Blend, Type, Zap, Droplets, CloudLightning,
  Palette, Circle, Square, Lasso, PenTool, Eraser,
  Monitor, Settings, Maximize, Minus, ChevronRight, Activity
} from 'lucide-react';
import { GeminiService } from '../src/services/geminiService';
import { Project, StudioMode, UserProfile } from '../types';
import { deductCredits } from '../src/services/firebase';

const PhotoEditor: React.FC<{ onSave: (p: Project) => void, user: UserProfile }> = ({ onSave, user }) => {
  const [image, setImage] = useState<string>("https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1280");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTool, setActiveTool] = useState('pointer');
  const [aiQuery, setAiQuery] = useState("");
  const [processingMsg, setProcessingMsg] = useState("Syncing Neural Core...");
  
  const [adjustments, setAdjustments] = useState({
    exposure: 100, contrast: 100, saturation: 100, highlights: 100, shadows: 100, blur: 0, vignette: 0, sepia: 0, grayscale: 0
  });

  const [layers, setLayers] = useState([
    { id: '1', name: 'Master_RAW_Plate', visible: true, locked: false, opacity: 100 },
    { id: '2', name: 'Neural_Texture_8K', visible: true, locked: false, opacity: 100 },
    { id: '3', name: 'Lumina_Grade_V1', visible: true, locked: true, opacity: 70 }
  ]);

  const handleAiCommand = async () => {
    if (!aiQuery) return;
    if ((user.credits || 0) < 1) {
      alert("Insufficient Credits. Please upgrade your plan or add balance.");
      return;
    }

    setIsProcessing(true);
    setProcessingMsg("Isolating Pixels...");
    
    try {
      const gemini = GeminiService.getInstance();
      setProcessingMsg("Neural Synthesis Active...");
      const result = await gemini.editImage(image, `Industrial high-fidelity edit: ${aiQuery}. Keep professional 8K quality.`);
      
      if (result) {
        setImage(result);
        await deductCredits(user.email, 1);
      } else {
        alert("Neural synthesis failed. Please try a different directive.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setAiQuery("");
    }
  };

  const updateAdj = (key: keyof typeof adjustments, val: number) => {
    setAdjustments(prev => ({ ...prev, [key]: val }));
  };

  const filterStyle = useMemo(() => ({
    filter: `brightness(${adjustments.exposure}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px) sepia(${adjustments.sepia}%) grayscale(${adjustments.grayscale}%)`,
    boxShadow: `inset 0 0 ${adjustments.vignette}px rgba(0,0,0,1)`
  }), [adjustments]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 animate-in fade-in duration-500 overflow-hidden text-slate-200">
      {/* Photo Header */}
      <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white/5 shadow-2xl">
         <div className="flex items-center space-x-6">
            <div className="p-4 bg-cyan-600 rounded-[1.5rem] shadow-xl ring-4 ring-cyan-600/10">
               <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
               <h2 className="text-xl font-black uppercase tracking-tighter leading-tight">Lumina <span className="text-cyan-500">RAW</span> Studio</h2>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Multi-Spectral Imaging Node • Build v10.5</p>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
              <button className="px-5 py-1.5 rounded-lg text-[8px] font-black uppercase bg-white text-black shadow-lg">ADJUST</button>
              <button className="px-5 py-1.5 rounded-lg text-[8px] font-black uppercase text-slate-500 hover:text-white transition-all">FILTERS</button>
            </div>
         </div>
         <div className="flex space-x-3">
            <a href="/photo-editor/index.html" target="_blank" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center border border-slate-700 transition-all">
               <Scan className="w-4 h-4 mr-2 text-cyan-400" /> Desktop Shell
            </a>
            <button onClick={() => onSave({ id: Date.now().toString(), name: 'Photo_Snap_8K', type: StudioMode.PHOTO, thumbnail: image, updatedAt: Date.now(), status: 'published', data: { layers, adjustments } })} className="px-10 py-3 bg-cyan-600 rounded-xl text-[10px] font-black uppercase text-white shadow-xl hover:bg-cyan-500 transition-all tracking-[0.2em] flex items-center">
              <CloudLightning className="w-4 h-4 mr-2" /> Commit Node
            </button>
         </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
         {/* Vertical Tool Belt */}
         <div className="w-20 bg-slate-900/90 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-4 flex flex-col items-center gap-4 shadow-2xl">
            {[
              { id: 'pointer', icon: MousePointer2 }, { id: 'crop', icon: Crop }, { id: 'wand', icon: Wand2 }, 
              { id: 'brush', icon: Brush }, { id: 'eraser', icon: Eraser }, { id: 'lasso', icon: Lasso },
              { id: 'pen', icon: PenTool }, { id: 'type', icon: Type }
            ].map((tool) => (
              <button key={tool.id} onClick={() => setActiveTool(tool.id)} className={`p-4 rounded-2xl transition-all ${activeTool === tool.id ? 'bg-cyan-600 text-white shadow-xl scale-110' : 'bg-black/40 text-slate-500 hover:text-white'}`}>
                <tool.icon className="w-5 h-5" />
              </button>
            ))}
            <div className="h-px w-8 bg-white/5 my-2" />
            <button onClick={() => setImage("")} className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
         </div>

         {/* Main Workspace Viewport */}
         <div className="flex-1 bg-[#020617] rounded-[4rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group shadow-[inset_0_0_150px_rgba(0,0,0,1)]">
            <div className="relative h-[85%] w-[85%] flex items-center justify-center animate-in zoom-in-95 duration-1000">
              <img src={image} style={filterStyle} className={`object-contain transition-all duration-300 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] ${isProcessing ? 'blur-3xl opacity-40' : 'opacity-100 border border-white/5'}`} alt="Master" />
              
              <div className="absolute top-6 left-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                 <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black uppercase text-cyan-400 border border-white/10 shadow-xl">RAW_PLATE_01</div>
                 <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black uppercase text-slate-400 border border-white/10 shadow-xl">32-BIT_DYNAMICS</div>
              </div>

              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
                   <div className="w-24 h-24 border-[8px] border-cyan-500 border-t-transparent rounded-full animate-spin mb-10 shadow-[0_0_100px_rgba(6,182,212,0.4)]" />
                   <p className="text-cyan-400 font-black uppercase tracking-[0.6em] text-[11px] animate-pulse">{processingMsg}</p>
                </div>
              )}
            </div>

            {/* Neural Directive Toolbar */}
            <div className="absolute bottom-10 inset-x-10 max-w-4xl mx-auto translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
               <div className="bg-slate-900/90 backdrop-blur-3xl p-3.5 rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,1)] flex gap-4">
                  <div className="flex items-center px-6"><Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" /></div>
                  <input 
                    value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleAiCommand()} 
                    placeholder="Neural Directive: 'Apply cinematic grading', 'Expand background 16:9'..." 
                    className="flex-1 bg-transparent px-2 text-[11px] text-white focus:outline-none placeholder:text-slate-700 font-black uppercase tracking-[0.2em]" 
                  />
                  <button onClick={handleAiCommand} disabled={isProcessing || !aiQuery} className="px-12 py-5 bg-cyan-600 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all disabled:opacity-50 shadow-2xl">
                    Apply Synthesis
                  </button>
               </div>
            </div>
         </div>

         {/* Right Inspector: Layers & Adjustments */}
         <div className="w-80 bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-8 flex flex-col gap-8 shadow-2xl overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center"><Layers className="w-4 h-4 mr-3 text-cyan-500" /> Layer Matrix</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                 {layers.map(layer => (
                   <div key={layer.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-cyan-500/20 transition-all">
                      <div className="flex items-center space-x-4">
                         <button className="text-slate-600 hover:text-cyan-400 transition-colors">
                           {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                         </button>
                         <span className="text-[10px] font-black uppercase text-slate-300 truncate w-36 tracking-tighter">{layer.name}</span>
                      </div>
                      {layer.locked ? <Lock className="w-4 h-4 text-slate-700" /> : <Unlock className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100" />}
                   </div>
                 ))}
                 <button className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-[9px] font-black uppercase text-slate-600 flex items-center justify-center hover:text-white transition-all shadow-inner"><Plus className="w-4 h-4 mr-2" /> New Node</button>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-1">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center"><SlidersHorizontal className="w-4 h-4 mr-3 text-emerald-500" /> RAW Adjustments</h4>
               {[
                 { id: 'exposure', label: 'Exposure', min: 0, max: 200 },
                 { id: 'contrast', label: 'Contrast', min: 0, max: 200 },
                 { id: 'saturation', label: 'Saturation', min: 0, max: 200 },
                 { id: 'highlights', label: 'Highlights', min: 0, max: 200 },
                 { id: 'blur', label: 'Lens Blur', min: 0, max: 50 },
                 { id: 'sepia', label: 'Sepia Gain', min: 0, max: 100 },
                 { id: 'vignette', label: 'Vignette', min: 0, max: 300 }
               ].map(adj => (
                  <div key={adj.id} className="space-y-3">
                     <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 tracking-widest"><span>{adj.label}</span><span className="text-white">{(adjustments as any)[adj.id]}%</span></div>
                     <input type="range" min={adj.min} max={adj.max} value={(adjustments as any)[adj.id]} onChange={(e) => updateAdj(adj.id as any, parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500" />
                  </div>
               ))}
            </div>

            <div className="bg-slate-950 p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-2xl">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-[9px] font-black text-slate-500 uppercase">Export Profile</p>
                 <span className="text-cyan-400 text-[9px] font-black uppercase">TIFF_16BIT</span>
               </div>
               <button className="w-full py-5 bg-slate-800 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700 shadow-xl group">
                  <Download className="w-4 h-4 mr-3 text-cyan-400 group-hover:translate-y-0.5 transition-transform" /> Save RAW Master
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PhotoEditor;