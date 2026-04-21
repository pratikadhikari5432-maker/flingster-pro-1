import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Play, Pause, Download, Video, Trash2, Sparkles, 
  Sliders, Layers, RefreshCw, Cpu, Film, Activity, 
  Rocket, Layers3, Gauge, Clock, Scissors, Type, Music,
  ZoomIn, ZoomOut, Plus, ChevronRight, Monitor, Settings,
  FastForward, Rewind, Split, Square, MousePointer2, Box,
  FolderOpen, Image as ImageIcon, X, Search, FileVideo
} from 'lucide-react';
import { GeminiService } from '../src/services/geminiService';
import { api } from '../src/services/apiService';
import { Project, StudioMode, TimelineLayer, UserProfile, VPSConfig } from '../types';
import { safeJsonStringify } from '../src/utils/safeSerialization';

interface VideoEditorProps {
  onSave: (project: Project) => void;
}

const VideoEditor: React.FC<VideoEditorProps & { user?: UserProfile }> = ({ onSave, user }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPos, setPlayheadPos] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderStatus, setRenderStatus] = useState("");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>('1');
  const [topic, setTopic] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [gallerySearch, setGallerySearch] = useState("");
  const [renderCluster, setRenderCluster] = useState<'shotstack' | string>('shotstack');
  
  const [layers, setLayers] = useState<TimelineLayer[]>([
    { id: '1', name: 'Master_Plate_4K', type: 'video', start: 0, duration: 30, content: 'https://s3-ap-southeast-2.amazonaws.com/shotstack-assets/footage/skater.mp4', track: 1, opacity: 100 },
    { id: '2', name: 'VFX_Cyber_Overlay', type: 'vfx', start: 5, duration: 15, content: 'vfx-node-01', track: 2, opacity: 80 },
    { id: '3', name: 'Synth_Bass_A', type: 'audio', start: 0, duration: 40, content: 'audio-src', track: 0, volume: 75 },
    { id: '4', name: 'Identity_Overlay', type: 'text', start: 2, duration: 28, content: 'SRIJAN_CORE', track: 3, opacity: 100 },
  ]);
  
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const activeLayer = useMemo(() => layers.find(l => l.id === selectedLayerId) || layers[0], [layers, selectedLayerId]);
  const timelineRef = useRef<HTMLDivElement>(null);

  const availableVpsNodes = useMemo(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`srijan_vps_${user.email}`);
    const list: VPSConfig[] = saved ? JSON.parse(saved) : [];
    return list.filter(v => v.hasVideoEngine);
  }, [user]);

  // Load files from storage for gallery
  const galleryAssets = useMemo(() => {
    const sessionStr = localStorage.getItem('srijan_session');
    if (!sessionStr) return [];
    const user = JSON.parse(sessionStr);
    const projects = JSON.parse(localStorage.getItem(`srijan_projects_${user.email}`) || '[]');
    return projects.filter((p: Project) => p.type === StudioMode.VIDEO || p.type === StudioMode.PHOTO);
  }, [isGalleryOpen]);

  const filteredGallery = galleryAssets.filter((a: Project) => 
    a.name.toLowerCase().includes(gallerySearch.toLowerCase())
  );

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayheadPos(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleAddFromGallery = (asset: Project) => {
    const newL: TimelineLayer = {
      id: Date.now().toString(),
      name: asset.name.toUpperCase().replace(/\s+/g, '_'),
      type: asset.type === StudioMode.VIDEO ? 'video' : 'vfx',
      start: playheadPos,
      duration: 15,
      content: asset.thumbnail, // Assuming thumbnail/data has the source
      track: asset.type === StudioMode.VIDEO ? 1 : 2,
      opacity: 100
    };
    setLayers(prev => [...prev, newL]);
    setSelectedLayerId(newL.id);
    setIsGalleryOpen(false);
  };

  const handleRender = async () => {
    setIsRendering(true);
    setRenderStatus(renderCluster === 'shotstack' ? "Handshake: Consuming Node Energy..." : "Uplink: Injecting Render Pulse to VPS...");
    
    try {
      if (renderCluster === 'shotstack') {
        const data = await api.renderVideo({
          videoUrl: activeLayer.content,
          start: 0,
          end: 10,
          aspectRatio: aspectRatio
        });
        setRenderStatus(`Sync: ${data.response?.status.toUpperCase()}`);
        alert(`Industrial Synthesis Initialized. Credits remaining: ${data.remainingCredits}. Job ID: ${data.response?.id}`);
      } else {
        const selectedVps = availableVpsNodes.find(v => v.id === renderCluster);
        if (!selectedVps) throw new Error("Target node offline or decoupled.");

        const response = await fetch('/api/vps/render', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('pm_token')}`
          },
          body: safeJsonStringify({
            ip: selectedVps.ip,
            username: selectedVps.username,
            password: selectedVps.password,
            videoUrl: activeLayer.content,
            filename: `SRIJAN_${activeLayer.name}_${Date.now()}.mp4`
          })
        });

        const data = await response.json();
        if (response.ok) {
          setRenderStatus("Status: REMOTE_PROCESSING");
          alert(`Cluster Processing Initialized. Job ID: ${data.jobId}`);
        } else {
          throw new Error(data.error);
        }
      }
    } catch (err: any) { 
      alert("Cluster Energy Error: " + err.message);
    } finally {
      setIsRendering(false);
    }
  };

  const handleTopicSynthesis = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const gemini = GeminiService.getInstance();
      const videoUrl = await gemini.generateVideo(`Professional Industrial Core: ${topic}`, aspectRatio === '16:9' ? '16:9' : '9:16');
      if (videoUrl) {
        const newL: TimelineLayer = { 
          id: Date.now().toString(), 
          name: `NEURAL_${topic.substring(0, 8).toUpperCase()}`, 
          type: 'video', 
          start: playheadPos, 
          duration: 15, 
          content: videoUrl, 
          track: 1, 
          opacity: 100 
        };
        setLayers(prev => [...prev, newL]);
        setSelectedLayerId(newL.id);
      }
    } finally {
      setIsGenerating(false);
      setTopic("");
    }
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setPlayheadPos(percentage);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 animate-in fade-in duration-500 overflow-hidden text-slate-200 relative">
      {/* Gallery Modal/Drawer */}
      {isGalleryOpen && (
        <div className="absolute inset-0 z-[100] flex justify-end animate-in slide-in-from-right duration-500">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGalleryOpen(false)} />
           <div className="relative w-full max-w-md bg-slate-950 border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">File Gallery</h3>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Uplinked Workspace Assets</p>
                 </div>
                 <button onClick={() => setIsGalleryOpen(false)} className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                    <input 
                      value={gallerySearch}
                      onChange={e => setGallerySearch(e.target.value)}
                      placeholder="Search gallery nodes..." 
                      className="w-full bg-black/40 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase" 
                    />
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                 {filteredGallery.length > 0 ? filteredGallery.map((asset: Project) => (
                    <div key={asset.id} className="group bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl flex items-center p-4 gap-5">
                       <div className="w-20 h-16 rounded-xl bg-slate-800 overflow-hidden relative shrink-0">
                          <img src={asset.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                             <div className="bg-indigo-600 rounded-lg p-1.5 shadow-xl"><Plus className="w-4 h-4 text-white" /></div>
                          </div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] font-black text-white uppercase truncate">{asset.name}</h4>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 flex items-center">
                             {asset.type === StudioMode.VIDEO ? <FileVideo className="w-3 h-3 mr-1 text-rose-500" /> : <ImageIcon className="w-3 h-3 mr-1 text-cyan-500" />}
                             {asset.type} NODE
                          </p>
                       </div>
                       <button onClick={() => handleAddFromGallery(asset)} className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white rounded-xl text-[8px] font-black uppercase transition-all whitespace-nowrap">Import</button>
                    </div>
                 )) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-10 opacity-20">
                       <FolderOpen className="w-16 h-16 mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No matching assets found in current sector</p>
                    </div>
                 )}
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-900/20">
                 <button onClick={() => setIsGalleryOpen(false)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Close Browser</button>
              </div>
           </div>
        </div>
      )}

      {/* NLE High-Level Toolbar */}
      <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center space-x-6">
           <div className="p-4 bg-rose-600 rounded-[1.5rem] shadow-xl ring-4 ring-rose-600/10">
              <Video className="w-6 h-6 text-white" />
           </div>
           <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-tight">Srijan <span className="text-rose-500">NLE</span> Hub</h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Multi-Track Synthesis • v10.5 Industrial</p>
           </div>
           <div className="h-8 w-px bg-white/10 mx-2" />
           <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
              <button className="px-5 py-1.5 rounded-lg text-[8px] font-black uppercase bg-white text-black shadow-lg">EDIT</button>
              <button className="px-5 py-1.5 rounded-lg text-[8px] font-black uppercase text-slate-500 hover:text-white transition-all">COLOR</button>
              <button className="px-5 py-1.5 rounded-lg text-[8px] font-black uppercase text-slate-500 hover:text-white transition-all">AUDIO</button>
           </div>
        </div>
        <div className="flex items-center space-x-4">
           {availableVpsNodes.length > 0 && (
             <div className="flex items-center bg-black/40 border border-white/5 rounded-xl px-4 py-1.5 gap-3">
                <span className="text-[8px] font-black uppercase text-slate-500">Render Cluster</span>
                <select 
                  value={renderCluster}
                  onChange={e => setRenderCluster(e.target.value)}
                  className="bg-transparent text-white text-[9px] font-black uppercase outline-none cursor-pointer"
                >
                   <option value="shotstack" className="bg-slate-900">Cloud (Shotstack)</option>
                   {availableVpsNodes.map(vps => (
                      <option key={vps.id} value={vps.id} className="bg-slate-900">
                         {vps.name} (VPS)
                      </option>
                   ))}
                </select>
             </div>
           )}
           <button onClick={() => setIsGalleryOpen(true)} className="px-6 py-3 bg-slate-800 hover:bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center border border-slate-700 transition-all group">
             <FolderOpen className="w-4 h-4 mr-2 text-indigo-400 group-hover:text-white" /> Asset Gallery
           </button>
           <button onClick={handleRender} disabled={isRendering} className="px-10 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center hover:bg-slate-100 transition-all disabled:opacity-50">
             {isRendering ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
             Export Project
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Inspector: Media Pool & AI */}
        <div className="col-span-3 bg-slate-900/60 rounded-[2.5rem] border border-white/5 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Neural Injector</h3>
              <Settings className="w-3 h-3 text-slate-700" />
           </div>
           <textarea 
            value={topic} onChange={e => setTopic(e.target.value)} 
            placeholder="Synthesis directive: 'Cinematic rain sequence', 'Cyberpunk city drone'..." 
            className="w-full h-24 bg-black/40 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none resize-none font-bold shadow-inner placeholder:text-slate-800" 
           />
           <button onClick={handleTopicSynthesis} disabled={isGenerating || !topic} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">
             {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Inject Neural Clip'}
           </button>
           
           <div className="h-px bg-white/5 my-2" />
           
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center"><Layers3 className="w-4 h-4 mr-2 text-rose-500" /> Media Stack</h3>
              <button onClick={() => setIsGalleryOpen(true)} className="text-[8px] font-black uppercase text-indigo-400 hover:text-indigo-300">Browse Library</button>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {layers.map(l => (
                <div key={l.id} onClick={() => setSelectedLayerId(l.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedLayerId === l.id ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                   <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-black uppercase truncate text-slate-100">{l.name}</p>
                      {l.type === 'video' ? <Film className="w-3 h-3 text-rose-400" /> : <Music className="w-3 h-3 text-emerald-400" />}
                   </div>
                   <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400/30" style={{ width: '100%' }} />
                   </div>
                </div>
              ))}
              <button onClick={() => setIsGalleryOpen(true)} className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-[9px] font-black uppercase text-slate-600 flex items-center justify-center hover:text-white transition-all"><Plus className="w-4 h-4 mr-2" /> Add Node</button>
           </div>
        </div>

        {/* Center: Main Viewport */}
        <div className="col-span-6 bg-black rounded-[3rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group shadow-[inset_0_0_100px_rgba(0,0,0,1)]">
           <div className={`transition-all duration-700 overflow-hidden rounded-2xl bg-[#020617] relative w-[90%] aspect-video shadow-[0_0_150px_rgba(0,0,0,0.8)] border border-white/5`}>
              <div className="absolute top-4 left-4 z-20 flex space-x-2">
                 <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black uppercase text-slate-400 border border-white/10">4K_MASTER_OUT</div>
                 <div className="px-3 py-1.5 bg-rose-600/20 backdrop-blur-md rounded-lg text-[8px] font-black uppercase text-rose-500 border border-rose-500/20 animate-pulse">LIVE_SYNC</div>
              </div>
              
              {activeLayer.content.startsWith('http') || activeLayer.content.startsWith('blob:') || activeLayer.content.startsWith('data:') ? (
                 <video src={activeLayer.content} className="w-full h-full object-cover" autoPlay muted loop />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 space-y-4">
                   <Monitor className="w-20 h-20 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Input Pulse</p>
                </div>
              )}
              
              {(isGenerating || isRendering) && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
                   <Activity className="w-16 h-16 text-rose-600 animate-pulse mb-6" />
                   <p className="text-rose-500 font-black uppercase tracking-[0.6em] text-[11px] text-center px-10">{renderStatus || 'Accessing Creative Matrix...'}</p>
                </div>
              )}
           </div>

           {/* Viewport Transport */}
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-8 bg-slate-900/90 backdrop-blur-3xl px-12 py-5 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div className="flex items-center space-x-6">
                 <button className="p-2 text-slate-500 hover:text-white transition-all"><Rewind className="w-5 h-5" /></button>
                 <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-2xl">
                   {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                 </button>
                 <button className="p-2 text-slate-500 hover:text-white transition-all"><FastForward className="w-5 h-5" /></button>
              </div>
              <div className="h-10 w-px bg-white/5" />
              <div className="text-4xl font-mono font-black text-white tracking-tighter tabular-nums flex items-end">
                <span className="text-rose-500">{(playheadPos * 0.3).toFixed(0).padStart(2, '0')}</span>
                <span className="text-slate-700 mx-1 text-2xl">:</span>
                <span className="text-slate-200">{(playheadPos % 1 * 60).toFixed(0).padStart(2, '0')}</span>
              </div>
           </div>
        </div>

        {/* Right Inspector: Detail & Properties */}
        <div className="col-span-3 bg-slate-900/60 rounded-[2.5rem] border border-white/5 p-6 flex flex-col gap-8 shadow-2xl overflow-hidden">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Sliders className="w-4 h-4 mr-2 text-rose-500" /> Node Properties</h3>
           <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-6 shadow-inner">
                 <p className="text-[9px] font-black text-white uppercase tracking-widest truncate flex items-center justify-between">
                    <span>{activeLayer.name}</span>
                    <span className="text-rose-500 text-[7px] bg-rose-500/10 px-2 py-0.5 rounded-full">ACTIVE</span>
                 </p>
                 <div className="space-y-6">
                    {[
                      { label: 'Opacity', value: activeLayer.opacity || 100, color: 'from-rose-600 to-rose-400' },
                      { label: 'Scale', value: 100, color: 'from-indigo-600 to-indigo-400' },
                      { label: 'Blur Depth', value: activeLayer.blur || 0, color: 'from-slate-600 to-slate-400' }
                    ].map(prop => (
                      <div key={prop.label} className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 tracking-widest"><span>{prop.label}</span><span className="text-white">{prop.value}%</span></div>
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner"><div className={`h-full bg-gradient-to-r ${prop.color}`} style={{ width: `${prop.value}%` }} /></div>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Aspect Protocol</span>
                    <span className="text-[9px] font-black text-rose-500">{aspectRatio}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {['16:9', '9:16', '1:1'].map(r => (
                      <button key={r} onClick={() => setAspectRatio(r as any)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${aspectRatio === r ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600 hover:text-white'}`}>{r}</button>
                    ))}
                 </div>
              </div>

              <div className="p-5 bg-black/60 rounded-3xl border border-emerald-500/10">
                 <div className="flex items-center justify-between mb-4">
                   <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Global Master Out</h4>
                   <Gauge className="w-3 h-3 text-emerald-400" />
                 </div>
                 <div className="h-12 flex items-end gap-1 px-1">
                    {[3,6,9,12,7,5,8,10,14,12,8,6,4,9,12].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500/30 rounded-t-[1px] animate-pulse" style={{ height: `${(h/15) * 100}%`, animationDelay: `${i * 0.05}s` }} />
                    ))}
                 </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 space-y-4 shadow-2xl">
                 <button className="w-full py-4 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 shadow-lg"><Split className="w-4 h-4 mr-2" /> Split Node</button>
                 <button onClick={() => setLayers(layers.filter(l => l.id !== selectedLayerId))} className="w-full py-4 bg-rose-600/10 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-rose-600/20 transition-all border border-rose-500/20"><Trash2 className="w-4 h-4 mr-2" /> Terminate Clip</button>
              </div>
           </div>
        </div>
      </div>

      {/* Multi-Track Timeline */}
      <div className="h-64 bg-slate-950 border border-white/5 rounded-[2.5rem] p-6 flex flex-col shadow-2xl relative overflow-hidden group">
         <div className="flex items-center justify-between mb-4 px-4">
            <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-2 text-indigo-400"><Layers className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Industrial Timeline</span></div>
               <div className="h-4 w-px bg-white/10" />
               <div className="flex space-x-2">
                  <button className="p-2 text-slate-600 hover:text-white transition-all"><MousePointer2 className="w-4 h-4" /></button>
                  <button className="p-2 text-slate-600 hover:text-white transition-all"><Scissors className="w-4 h-4" /></button>
                  <button className="p-2 text-slate-600 hover:text-white transition-all"><Square className="w-4 h-4" /></button>
               </div>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-3 bg-black/60 px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
                  <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
                  <div className="w-24 h-0.5 bg-slate-800 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-indigo-600" /></div>
                  <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
               </div>
            </div>
         </div>
         <div ref={timelineRef} onClick={handleTimelineClick} className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar relative pr-4 cursor-crosshair">
            {[3, 2, 1, 0].map(tid => (
              <div key={tid} className="flex h-10 min-w-full">
                 <div className="w-36 flex items-center px-5 rounded-xl border shrink-0 font-black text-[8px] tracking-[0.2em] uppercase bg-slate-900/60 border-white/5 text-slate-500 hover:bg-slate-800 transition-colors cursor-pointer group/track">
                   {tid === 0 ? <Music className="w-3.5 h-3.5 mr-3 text-emerald-500" /> : tid === 3 ? <Type className="w-3.5 h-3.5 mr-3 text-blue-400" /> : <Video className="w-3.5 h-3.5 mr-3 text-rose-500" />}
                   TRACK_0{tid}
                 </div>
                 <div className="flex-1 bg-white/[0.01] rounded-xl ml-4 relative border border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    {layers.filter(l => l.track === tid).map(l => (
                      <div 
                        key={l.id} onClick={(e) => { e.stopPropagation(); setSelectedLayerId(l.id); }} 
                        style={{ left: `${l.start}%`, width: `${l.duration}%` }} 
                        className={`absolute inset-y-1 rounded-lg border flex items-center px-4 cursor-pointer transition-all active:scale-95 ${selectedLayerId === l.id ? 'bg-white text-black border-white z-20 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : tid === 0 ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/20' : 'bg-slate-900/90 text-slate-500 border-white/5'}`}
                      >
                        <span className="text-[8px] font-black uppercase truncate tracking-tighter">{l.name}</span>
                      </div>
                    ))}
                 </div>
              </div>
            ))}
            {/* Syncing Global Playhead */}
            <div style={{ left: `calc(144px + 16px + ${playheadPos}%)` }} className="absolute top-0 bottom-0 w-[1.5px] bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,1)] z-30 pointer-events-none transition-all duration-75">
               <div className="absolute top-0 -left-2 w-5 h-5 bg-rose-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full animate-ping" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default VideoEditor;