import React, { useState, useRef, useEffect } from 'react';
import { 
  Eraser, Download, Sparkles, Pencil, MousePointer2, RefreshCw, Play, Pause, Plus, Dna, 
  Target, Trash2, Rocket, Scan, Activity, Brush, Palette as PaletteIcon, Film, Frame, 
  Save, Box, ChevronRight, Binary, Layers3
} from 'lucide-react';
import { GeminiService } from '../src/services/geminiService';
import { Project, StudioMode, Bone } from '../types';
import { safeJsonStringify } from '../src/utils/safeSerialization';

interface Pose {
  id: string;
  bones: Bone[];
  timestamp: number;
}

const PaintStudio: React.FC<{ onSave: (p: Project) => void }> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'brush' | 'bones' | 'erase' | 'select'>('bones');
  const [color, setColor] = useState('#10b981');
  const [brushSize, setBrushSize] = useState(8);
  const [brushFlow, setBrushFlow] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [renderStyle, setRenderStyle] = useState('Realistic_UE5');
  const [bones, setBones] = useState<Bone[]>([]);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [currentPoseIdx, setCurrentPoseIdx] = useState(-1);
  const [isPlayingAnim, setIsPlayingAnim] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    if (tool === 'bones') {
      const newBone: Bone = { id: Date.now().toString(), x: pos.x, y: pos.y, name: `SK_NODE_0${bones.length + 1}` };
      setBones([...bones, newBone]);
      return;
    }
    if (tool === 'select') return;
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = tool === 'erase' ? '#020617' : color;
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = brushFlow / 100;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const handleCapturePose = () => {
    const newPose: Pose = { id: Date.now().toString(), bones: JSON.parse(safeJsonStringify(bones)), timestamp: Date.now() };
    setPoses([...poses, newPose]);
    setCurrentPoseIdx(poses.length);
  };

  const handleSynthesize = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const gemini = GeminiService.getInstance();
    const result = await gemini.generateImage(`Professional character rig sheet: ${prompt}. ${renderStyle} model. T-pose orthographic views, production ready textures, 8K resolution.`, "1:1", true);
    if (result) {
      const img = new Image();
      img.src = result;
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
      };
      onSave({ id: `rig-${Date.now()}`, name: `Identity_${prompt.substring(0, 10)}`, type: StudioMode.PAINT, thumbnail: result, updatedAt: Date.now(), status: 'draft', data: { bones, poses } });
    }
    setIsGenerating(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 animate-in fade-in duration-500 overflow-hidden text-slate-200">
      {/* Animation Header */}
      <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center space-x-6">
           <div className="p-4 bg-emerald-600 rounded-[1.5rem] shadow-xl ring-4 ring-emerald-600/10">
              <Dna className="w-6 h-6 text-white" />
           </div>
           <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-tight">Identity <span className="text-emerald-400">Rigging</span> Hub</h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Multi-Skeletal Matrix • v10.5 Industrial</p>
           </div>
           <div className="h-8 w-px bg-white/10 mx-2" />
           <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
              <button className="px-5 py-1.5 rounded-lg text-[8px] font-black uppercase bg-white text-black shadow-lg">RIG_MODE</button>
              <button className="px-5 py-1.5 rounded-lg text-[8px] font-black uppercase text-slate-500 hover:text-white transition-all">ANIMATE</button>
           </div>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/animation-studio/index.html" target="_blank" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center border border-slate-700 transition-all group">
             <Rocket className="w-4 h-4 mr-2 text-emerald-400 group-hover:translate-x-1 transition-transform" /> Desktop Core
          </a>
          <button onClick={handleSynthesize} disabled={isGenerating || !prompt} className="px-10 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center hover:bg-indigo-500 transition-all">
            {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Synthesize Identity
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
         {/* Sidebar Tools */}
         <div className="w-24 bg-slate-900/90 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-4 flex flex-col items-center gap-5 shadow-2xl">
            {[
              { id: 'brush', icon: Brush },
              { id: 'bones', icon: Target },
              { id: 'erase', icon: Eraser },
              { id: 'select', icon: MousePointer2 }
            ].map(t => (
              <button key={t.id} onClick={() => setTool(t.id as any)} className={`p-4 rounded-2xl transition-all ${tool === t.id ? 'bg-emerald-600 text-white shadow-xl scale-110' : 'bg-black/40 text-slate-500 hover:text-white'}`}>
                <t.icon className="w-6 h-6" />
              </button>
            ))}
            <div className="w-10 h-10 rounded-xl cursor-pointer p-0.5 border border-white/10 group relative shadow-inner" style={{ background: color }}>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-full opacity-0 cursor-pointer" />
            </div>
            <div className="h-px w-10 bg-white/5 my-2" />
            <button onClick={() => {setBones([]); setPoses([]);}} className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"><Trash2 className="w-6 h-6" /></button>
         </div>

         {/* Main Orthographic Viewport */}
         <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex-1 bg-black rounded-[4rem] border border-white/5 p-8 flex flex-col relative overflow-hidden group shadow-[inset_0_0_150px_rgba(0,0,0,1)]">
               <div className="flex-1 bg-[#020617] rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/5">
                  <div className="absolute top-6 left-6 z-20 flex space-x-3">
                     <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black uppercase text-slate-400 flex items-center border border-white/10 shadow-lg">
                        <Scan className="w-3 h-3 mr-2 text-emerald-400" /> ORTHOGRAPHIC_8K
                     </div>
                     <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black uppercase text-indigo-400 border border-white/10 shadow-lg">
                        <Activity className="w-3 h-3 mr-2 animate-pulse" /> RT_MOTION_SYNC
                     </div>
                  </div>
                  <canvas ref={canvasRef} width={1600} height={1200} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={() => setIsDrawing(false)} className="w-full h-full object-contain cursor-crosshair relative z-0" />
                  
                  {/* Bone Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                     {(poses[currentPoseIdx]?.bones || bones).map((bone, i, arr) => (
                        <g key={bone.id}>
                           {i > 0 && <line x1={arr[i-1].x} y1={arr[i-1].y} x2={bone.x} y2={bone.y} stroke="#10b981" strokeWidth="6" strokeDasharray="12,8" className="opacity-40 animate-pulse" />}
                           <circle cx={bone.x} cy={bone.y} r="16" fill="#10b981" stroke="white" strokeWidth="4" className="shadow-2xl" />
                           <text x={bone.x + 24} y={bone.y + 6} fill="#475569" className="text-[9px] font-black uppercase font-mono tracking-tighter bg-black/50 px-2 py-0.5 rounded backdrop-blur-md">SK_NODE_0{i+1}</text>
                        </g>
                     ))}
                  </svg>

                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
                        <div className="w-24 h-24 border-[10px] border-emerald-500 border-t-transparent rounded-full animate-spin mb-10 shadow-[0_0_100px_rgba(16,185,129,0.3)]" />
                        <p className="text-emerald-400 font-black uppercase tracking-[0.6em] text-[11px] animate-pulse">Initializing Identity Synthesis Pipeline...</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Pose Sequence Timeline */}
            <div className="bg-slate-900/90 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/5 flex flex-col gap-5 shadow-2xl">
               <div className="flex items-center justify-between px-4">
                  <div className="flex items-center space-x-4">
                    <Film className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Pose Sequence Pipeline</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setIsPlayingAnim(!isPlayingAnim)} className="p-3 bg-white text-black rounded-xl hover:scale-110 active:scale-95 transition-all shadow-xl">
                      {isPlayingAnim ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                    <button onClick={handleCapturePose} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center shadow-xl hover:bg-emerald-500 transition-all">
                      <Frame className="w-4 h-4 mr-2" /> Capture Pose
                    </button>
                  </div>
               </div>
               <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-[1.8rem] h-20 overflow-x-auto custom-scrollbar border border-white/5">
                  {poses.map((p, idx) => (
                    <button 
                      key={p.id} onClick={() => setCurrentPoseIdx(idx)}
                      className={`flex-shrink-0 w-24 h-full rounded-2xl border flex flex-col items-center justify-center transition-all group/key ${currentPoseIdx === idx ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-105' : 'bg-slate-800 border-white/5 text-slate-500 hover:border-white/10'}`}
                    >
                      <span className="text-[8px] font-black uppercase tracking-widest mb-1">FRAME_0{idx+1}</span>
                      <Dna className={`w-4 h-4 ${currentPoseIdx === idx ? 'text-white' : 'text-slate-700'} opacity-50`} />
                    </button>
                  ))}
                  {poses.length === 0 && <div className="flex-1 flex items-center justify-center text-[10px] font-black text-slate-700 uppercase tracking-widest italic animate-pulse">Timeline Empty - Initialize Node Rigging</div>}
               </div>
            </div>

            {/* Directive Dock */}
            <div className="bg-slate-900/90 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/5 flex gap-5 shadow-2xl items-center">
              <div className="relative flex-1">
                 <Box className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
                 <input 
                  value={prompt} onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="Describe Character: 'Cyberpunk Viking', 'Biomechanical Fairy'..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-full py-5 pl-16 pr-10 text-white text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-slate-800" 
                 />
              </div>
              <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-full overflow-x-auto scrollbar-hide max-w-sm shadow-inner">
                {['Disney_3D', 'UE5_Meta', 'Anime_8K'].map(s => (
                  <button key={s} onClick={() => setRenderStyle(s)} className={`px-8 py-3 rounded-full text-[9px] font-black uppercase transition-all whitespace-nowrap ${renderStyle === s ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-700 hover:text-white'}`}>{s.replace('_', ' ')}</button>
                ))}
              </div>
            </div>
         </div>

         {/* Side Inspector */}
         <div className="w-80 bg-slate-900/60 backdrop-blur-xl rounded-[3rem] border border-white/5 p-8 flex flex-col gap-8 shadow-2xl overflow-hidden">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Target className="w-5 h-5 mr-3 text-indigo-400" /> Skeleton Stack</h3>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
               {bones.map((bone, i) => (
                 <div key={bone.id} className="p-5 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-emerald-500/20 transition-all shadow-inner">
                     <div className="flex items-center space-x-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                        <div>
                           <span className="text-[10px] font-black uppercase text-slate-300 block leading-none">SK_0{i+1}</span>
                           <span className="text-[8px] font-mono text-slate-600 mt-1 block">NODE_ACTIVE</span>
                        </div>
                     </div>
                     <button onClick={() => setBones(bones.filter(b => b.id !== bone.id))} className="text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ))}
            </div>
            
            <div className="bg-slate-950 rounded-[2.5rem] p-8 border border-white/10 space-y-6 shadow-2xl">
               <div className="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase">
                  <span>Export Profile</span>
                  <span className="text-emerald-400 font-mono">FBX_HI_RES</span>
               </div>
               <button className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center shadow-[0_15px_30px_rgba(16,185,129,0.2)] active:scale-95 group">
                  <Download className="w-5 h-5 mr-3 group-hover:translate-y-0.5 transition-transform" /> Export Motion Pack
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PaintStudio;