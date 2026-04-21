import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Library, Upload, Sparkles, Play, Pause, FileText, Download, 
  Share2, Plus, Trash2, RefreshCw, Volume2, Mic2, Brain, 
  CheckCircle, Headphones, ArrowRight, Video, HelpCircle, 
  Layers, Presentation, LayoutTemplate, Network, Table, Layout, X, Info,
  ChevronRight, Lightbulb, Target, Zap, MessageSquare, Send, History,
  FileDown, FileUp, Globe, Hash, Command, Terminal, Settings, ExternalLink,
  Code, FileJson, FileCode, Search, Microscope, Link as LinkIcon, ShieldCheck
} from 'lucide-react';
import { GeminiService } from '../src/services/geminiService';
import { Project, StudioMode, NotebookArtifact } from '../types';
import { safeJsonStringify } from '../src/utils/safeSerialization';

interface NotebookStudioProps {
  onSave: (p: Project) => void;
}

interface SourceNode {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'url';
  url?: string;
}

const NotebookStudio: React.FC<NotebookStudioProps> = ({ onSave }) => {
  const [sources, setSources] = useState<SourceNode[]>([]);
  const [inputText, setInputText] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai' | 'system' | 'root', text: string }[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<NotebookArtifact | null>(null);
  const [artifacts, setArtifacts] = useState<NotebookArtifact[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAddSource = () => {
    if ((!inputText && !inputUrl) || !inputName) return;
    const newNode: SourceNode = { 
      id: Date.now().toString(), 
      name: inputName, 
      content: inputText || `Simulated extraction from ${inputUrl}`, 
      type: inputUrl ? 'url' : 'text',
      url: inputUrl 
    };
    setSources([...sources, newNode]);
    setInputText(""); setInputName(""); setInputUrl(""); setShowUrlField(false);
    setChatHistory(prev => [...prev, { role: 'system', text: `NODE_LINK: ${newNode.name} initialized.` }]);
  };

  const executeResearch = async (topicOverride?: string) => {
    const researchTopic = topicOverride || "Global economic impact of semaglutide healthcare synthesis";
    const researchInstructions = `Deep research required. Include figures, trends, statistics, measurable outcomes. Prioritize data-backed reasoning. Return inline citations and source metadata list.`;
    
    setChatHistory(prev => [...prev, { role: 'user', text: `Initiate Research: ${researchTopic}` }]);
    setChatHistory(prev => [...prev, { role: 'system', text: "DEEP_RESEARCH: Allocating 32k thinking tokens. Spawning search grounding agents..." }]);
    setIsSynthesizing(true);

    const context = sources.map(s => `[${s.name}]: ${s.content}`).join('\n');
    const result = await GeminiService.getInstance().performDeepResearch(researchTopic, researchInstructions, context);
    
    if (result) {
      const researchArt: NotebookArtifact = {
        type: 'infographic',
        title: `RESEARCH: ${topicOverride ? topicOverride.substring(0, 15).toUpperCase() : 'SEMAGLUTIDE'}`,
        data: { 
          sections: [{ headline: "Analytical Deep Dive", text: result.text }],
          groundingSources: result.sources 
        },
        createdAt: Date.now()
      };
      setArtifacts([researchArt, ...artifacts]);
      setActiveArtifact(researchArt);
      setChatHistory(prev => [...prev, { role: 'ai', text: "Deep research protocol complete. Intelligence converged in viewport." }]);
    }
    setIsSynthesizing(false);
  };

  const processCommand = async (input: string) => {
    const cmd = input.toLowerCase().trim();
    
    if (cmd === 'lumina-sys-root') {
      setChatHistory(prev => [...prev, { role: 'user', text: 'LUMINA-SYS-ROOT' }]);
      setChatHistory(prev => [...prev, { role: 'system', text: 'AUTHORIZING ROOT PROTOCOL...' }]);
      await new Promise(r => setTimeout(r, 600));
      setChatHistory(prev => [...prev, { role: 'root', text: 'SYS_ROOT_ACTIVE: Governance nodes synchronized. Academy and Studio modules authorized for Level-9 access.' }]);
      setChatQuery("");
      return;
    }

    if (cmd.startsWith('/install')) {
      const skill = input.split(' ').slice(1).join(' ') || 'Standard';
      setChatHistory(prev => [...prev, { role: 'user', text: input }]);
      setChatHistory(prev => [...prev, { role: 'system', text: `UPLINK: Syncing skill package "${skill}"...` }]);
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: `Skill "${skill}" installed successfully.` }]);
      }, 1000);
      setChatQuery("");
      return;
    }

    if (cmd.includes('research') || cmd.includes('search')) {
      const topic = input.replace('/research', '').replace('research', '').trim();
      executeResearch(topic);
      setChatQuery("");
      return;
    }

    if (cmd.includes('generate') || cmd.includes('create') || cmd.startsWith('/')) {
      if (sources.length === 0) {
        setChatHistory(prev => [...prev, { role: 'ai', text: "Error: No knowledge nodes detected. Please ingest data first." }]);
        setChatQuery("");
        return;
      }
      setChatHistory(prev => [...prev, { role: 'user', text: input }]);
      if (cmd.includes('quiz')) generateArtifact('quiz');
      else if (cmd.includes('podcast') || cmd.includes('audio')) generateArtifact('audio');
      else if (cmd.includes('video') || cmd.includes('whiteboard')) generateArtifact('video');
      else if (cmd.includes('mind map') || cmd.includes('mindmap')) generateArtifact('mindmap');
      else if (cmd.includes('slide') || cmd.includes('presentation')) generateArtifact('slides');
      else if (cmd.includes('flashcard')) generateArtifact('flashcards');
      else if (cmd.includes('table') || cmd.includes('data')) generateArtifact('datatable');
      else if (cmd.includes('infographic')) generateArtifact('infographic');
      setChatQuery("");
      return;
    }

    handleChat(input);
  };

  const handleChat = async (queryOverride?: string) => {
    const queryToUse = queryOverride || chatQuery;
    if (!queryToUse) return;
    
    if (!queryOverride) {
      setChatHistory(prev => [...prev, { role: 'user', text: queryToUse }]);
      setChatQuery("");
    }
    
    setIsChatting(true);
    const fullContext = sources.map(s => `[${s.name}]: ${s.content}`).join('\n');
    const answer = await GeminiService.getInstance().askSource(fullContext, queryToUse);
    
    setChatHistory(prev => [...prev, { role: 'ai', text: answer }]);
    setIsChatting(false);
  };

  const generateArtifact = async (type: NotebookArtifact['type']) => {
    if (sources.length === 0) return;
    setIsSynthesizing(true);
    setChatHistory(prev => [...prev, { role: 'system', text: `SYNTHESIS: Reconfiguring matrix for ${type.toUpperCase()}...` }]);
    const fullContext = sources.map(s => `[${s.name}]: ${s.content}`).join('\n');
    
    let result;
    if (type === 'audio') {
      result = await GeminiService.getInstance().generateNotebookDeepDive(fullContext);
    } else if (type === 'video') {
      const img = await GeminiService.getInstance().generateImage(`Professional whiteboard education summary of: ${sources[0]?.name || 'Current Context'}`, "16:9");
      result = { videoUrl: img, summary: `Whiteboard synthesis complete for context.` };
    } else {
      result = await GeminiService.getInstance().generateArtifact(fullContext, type);
    }

    if (result) {
      const newArt: NotebookArtifact = { type, title: `${type.toUpperCase()} - ${sources[0]?.name.substring(0, 10) || 'GEN'}`, data: result, createdAt: Date.now() };
      setArtifacts([newArt, ...artifacts]);
      setActiveArtifact(newArt);
      setChatHistory(prev => [...prev, { role: 'ai', text: `Success: ${type.toUpperCase()} artifact stabilized.` }]);
    }
    setIsSynthesizing(false);
  };

  const handleDownload = (artifact: NotebookArtifact, format: string) => {
    const data = safeJsonStringify(artifact.data);
    const blob = new Blob([data], { type: format === 'JSON' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderArtifactContent = () => {
    if (!activeArtifact) return null;
    const { type, data } = activeArtifact;
    switch(type) {
      case 'audio':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-black/60 rounded-[3rem] p-12 flex flex-col items-center border border-white/5 space-y-8 shadow-2xl">
              <div className="flex items-center space-x-12">
                 <div className="text-center">
                    <div className="w-24 h-24 bg-indigo-600/20 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_30px_indigo]">
                       <Mic2 className="w-10 h-10" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Joe (AI)</p>
                 </div>
                 <div className="flex space-x-2 h-16 items-center">
                    {[1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((h, i) => (
                       <div key={i} className={`w-1.5 bg-indigo-500/40 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ height: `${h * (isPlaying ? 14 : 6)}px` }} />
                    ))}
                 </div>
                 <div className="text-center">
                    <div className="w-24 h-24 bg-rose-600/20 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_30px_rose]">
                       <Mic2 className="w-10 h-10" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Jane (AI)</p>
                 </div>
              </div>
              <div className="w-full max-w-lg">
                <audio ref={audioRef} src={data.audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} className="hidden" />
                <button onClick={() => audioRef.current && (isPlaying ? audioRef.current.pause() : audioRef.current.play())} className="w-full py-8 bg-white text-black rounded-[2.5rem] flex items-center justify-center shadow-2xl hover:scale-105 transition-all">
                   {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-2" />}
                </button>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-[3rem] p-10 border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Deep Dive Transcript</h5>
              <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-wrap italic">"{data.script}"</p>
            </div>
          </div>
        );
      case 'infographic':
        return (
          <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-10">
            {data.sections?.map((s: any, i: number) => (
              <div key={i} className="p-12 bg-gradient-to-br from-slate-900 to-black border border-white/5 rounded-[3.5rem] shadow-2xl flex flex-col gap-6 group hover:border-indigo-500/30 transition-all">
                 <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-[1.5rem] flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Microscope className="w-10 h-10" />
                   </div>
                   <h4 className="text-3xl font-black text-white uppercase tracking-tight">{s.headline}</h4>
                 </div>
                 <div className="text-slate-300 text-lg font-medium leading-relaxed prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{s.text}</p>
                 </div>
              </div>
            ))}
            
            {data.groundingSources && data.groundingSources.length > 0 && (
              <div className="bg-slate-900/80 border border-indigo-500/20 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                 <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center">
                    <Globe className="w-4 h-4 mr-3" /> Grounding Sources & References
                 </h5>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.groundingSources.map((source: any, i: number) => (
                      <a 
                        key={i} href={source.uri} target="_blank" rel="noreferrer"
                        className="flex items-center p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-all group"
                      >
                         <LinkIcon className="w-4 h-4 mr-4 text-slate-600 group-hover:text-indigo-400" />
                         <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-300 uppercase truncate">{source.title}</p>
                            <p className="text-[8px] text-slate-600 truncate font-mono">{source.uri}</p>
                         </div>
                         <ExternalLink className="w-3 h-3 ml-auto text-slate-800 group-hover:text-white" />
                      </a>
                    ))}
                 </div>
              </div>
            )}
          </div>
        );
      case 'quiz':
        return (
          <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-8">
            {data.questions?.map((q: any, i: number) => (
              <div key={i} className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-xl group hover:border-indigo-500/30 transition-all">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-4 tracking-widest">QUERY_NODE_0{i+1}</p>
                <h4 className="text-xl font-black text-white uppercase mb-8 tracking-tight">{q.question}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options?.map((opt: string, idx: number) => (
                    <button key={idx} className="p-5 bg-black/40 border border-slate-800 rounded-2xl text-left text-xs font-bold text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all">{opt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      default: return <div className="p-12 bg-slate-900 rounded-[2rem] text-slate-500 uppercase font-black text-xs">Artifact Node Staged</div>;
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-5 animate-in fade-in duration-700 overflow-hidden text-slate-200">
      {/* Studio Header */}
      <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center space-x-6">
           <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-500/20">
              <Library className="w-7 h-7 text-white" />
           </div>
           <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Intelligence <span className="text-indigo-400">Node</span> Pro</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Multi-Agent Universal Synthesis</p>
           </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            disabled={!activeArtifact}
            onClick={() => onSave({ id: Date.now().toString(), name: activeArtifact?.title || 'Synthesis Export', type: StudioMode.NOTEBOOK, thumbnail: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&q=80&w=400', updatedAt: Date.now(), status: 'published', data: { artifacts, sources } })}
            className="px-14 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-500 transition-all disabled:opacity-30 border border-indigo-400/20"
          >
            Commit to Vault
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-5 min-h-0">
         {/* Side Nav: Ingest */}
         <div className="w-[400px] bg-slate-900/60 backdrop-blur-3xl rounded-[3.5rem] border border-white/5 p-8 flex flex-col gap-8 shadow-2xl overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center"><FileUp className="w-5 h-5 mr-3 text-indigo-400" /> Knowledge Ingest</h3>
                <button onClick={() => setShowUrlField(!showUrlField)} className="p-2 bg-slate-800 rounded-lg text-indigo-400 hover:text-white transition-all"><ExternalLink className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                 <input value={inputName} onChange={e => setInputName(e.target.value)} placeholder="SOURCE_LABEL (e.g. Q3_Report)" className="w-full bg-black/40 border border-slate-800 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-500/40 shadow-inner" />
                 {showUrlField ? (
                   <input value={inputUrl} onChange={e => setInputUrl(e.target.value)} placeholder="SOURCE_URL (https://...)" className="w-full bg-black/40 border border-slate-800 rounded-2xl p-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 outline-none focus:border-indigo-500/40 shadow-inner" />
                 ) : (
                   <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Paste raw semantic data..." className="w-full h-40 bg-black/40 border border-slate-800 rounded-[2.5rem] p-8 text-xs font-medium text-slate-400 outline-none focus:border-indigo-500/40 resize-none shadow-inner" />
                 )}
                 <button onClick={handleAddSource} className="w-full py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center transition-all shadow-xl"><Plus className="w-4 h-4 mr-2" /> Sync Node</button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide pr-1">
                 {sources.map(s => (
                   <div key={s.id} className="p-5 bg-slate-950/40 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center space-x-3 truncate">
                         {s.type === 'url' ? <Globe className="w-3 h-3 text-indigo-400" /> : <Hash className="w-3 h-3 text-emerald-400" />}
                         <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-indigo-400 truncate">{s.name}</span>
                      </div>
                      <button onClick={() => setSources(sources.filter(x => x.id !== s.id))} className="text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                   </div>
                 ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-4">
               <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Brain className="w-5 h-5 mr-3 text-emerald-400" /> Artifact Synthesis</h4>
               <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'audio' as const, icon: Headphones, label: 'PODCAST' },
                    { type: 'video' as const, icon: Video, label: 'TUTORIAL' },
                    { type: 'quiz' as const, icon: HelpCircle, label: 'QUIZ' },
                    { type: 'flashcards' as const, icon: Layers, label: 'CARDS' },
                    { type: 'slides' as const, icon: Presentation, label: 'SLIDES' },
                    { type: 'mindmap' as const, icon: Network, label: 'MAP' },
                    { type: 'datatable' as const, icon: Table, label: 'TABLE' },
                    { type: 'infographic' as const, icon: LayoutTemplate, label: 'INFO' },
                  ].map(btn => (
                    <button 
                      key={btn.type} onClick={() => generateArtifact(btn.type)} disabled={isSynthesizing || sources.length === 0}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border transition-all group ${activeArtifact?.type === btn.type ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_indigo]' : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-white disabled:opacity-20'}`}
                    >
                       <btn.icon className={`w-5 h-5 ${activeArtifact?.type === btn.type ? 'text-white' : 'group-hover:text-indigo-400'}`} />
                       <span className="text-[8px] font-black uppercase tracking-widest">{btn.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
               <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Microscope className="w-5 h-5 mr-3 text-amber-400" /> Research Agent</h4>
               <button 
                  onClick={() => executeResearch()}
                  disabled={isSynthesizing}
                  className="w-full py-5 bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl text-[10px] font-black uppercase text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-all active:scale-95 disabled:opacity-30"
               >
                  <Search className="w-4 h-4 mr-3" /> Initiate Deep Search
               </button>
            </div>
         </div>

         {/* Center: Main Viewport & Chat */}
         <div className="flex-1 flex flex-col gap-5 min-w-0">
            <div className="flex-[2] bg-black/40 rounded-[4rem] border border-white/5 p-12 flex flex-col shadow-2xl relative overflow-hidden group min-h-0">
               {isSynthesizing ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 animate-pulse">
                    <div className="w-24 h-24 border-[8px] border-indigo-600 border-t-transparent rounded-full animate-spin shadow-[0_0_100px_rgba(79,70,229,0.4)]" />
                    <div>
                       <h4 className="text-5xl font-black text-white uppercase tracking-tighter">Thinking...</h4>
                       <p className="text-slate-500 font-bold uppercase tracking-[0.6em] text-xs mt-6">Allocating Reasoning Matrix (Grounding Enabled)</p>
                    </div>
                 </div>
               ) : activeArtifact ? (
                 <div className="flex-1 overflow-auto custom-scrollbar pr-6">
                   <div className="flex items-center justify-between mb-16">
                      <div className="flex items-center space-x-8">
                         <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-indigo-400 shadow-2xl shadow-indigo-600/10">
                           <Zap className="w-10 h-10" />
                         </div>
                         <div>
                           <h3 className="text-4xl font-black uppercase tracking-tight text-white">{activeArtifact.title}</h3>
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">Verified Neural Synthesis</p>
                         </div>
                      </div>
                      <div className="flex space-x-4">
                         <button onClick={() => handleDownload(activeArtifact, 'Markdown')} title="Export as Markdown" className="p-5 bg-slate-800 rounded-3xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-xl"><FileCode className="w-6 h-6" /></button>
                         <button onClick={() => handleDownload(activeArtifact, 'JSON')} title="Export as JSON" className="p-5 bg-slate-800 rounded-3xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-xl"><FileJson className="w-6 h-6" /></button>
                      </div>
                   </div>
                   {renderArtifactContent()}
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-12">
                    <div className="p-16 bg-slate-900/60 rounded-[5rem] border border-slate-800 text-slate-700 shadow-inner relative group cursor-pointer hover:bg-slate-900/80 transition-all">
                       <div className="absolute inset-0 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                       <Brain className="w-48 h-48 relative z-10 transition-transform duration-1000 group-hover:scale-110" />
                    </div>
                    <div>
                       <h4 className="text-6xl font-black text-slate-400 uppercase tracking-tighter">Enter Protocol</h4>
                       <p className="text-slate-600 text-xl max-w-xl mx-auto mt-8 leading-relaxed font-medium">Inject raw nodes or use commands to initialize the universal synthesizer.</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Terminal Interface */}
            <div className="flex-1 bg-slate-900/60 backdrop-blur-3xl rounded-[3.5rem] border border-white/5 flex flex-col shadow-2xl min-h-0 relative overflow-hidden group">
               <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-6 font-mono">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                       <Terminal className="w-12 h-12 text-indigo-400" />
                       <div className="text-[10px] font-black uppercase tracking-[0.4em]">Kernel Shell v5.0</div>
                       <div className="text-[8px] uppercase tracking-widest text-slate-500">Commands: "/research [topic]", "/install [skill]", "/generate [type]"</div>
                    </div>
                  )}
                  {chatHistory.map((chat, i) => (
                    <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] p-6 rounded-[2rem] text-[11px] font-bold leading-relaxed shadow-lg ${
                         chat.role === 'user' ? 'bg-indigo-600 text-white' : 
                         chat.role === 'system' ? 'bg-slate-950 border border-slate-800 text-indigo-400 italic text-[10px]' : 
                         chat.role === 'root' ? 'bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 font-black' :
                         'bg-black/40 border border-slate-800 text-slate-300'
                       }`}>
                          {(chat.role === 'system' || chat.role === 'root') && <span className={chat.role === 'root' ? 'mr-2 text-emerald-500' : 'mr-2 text-indigo-600'}>{chat.role === 'root' ? '##' : '>>'}</span>}
                          {chat.role === 'root' && <ShieldCheck className="inline-block w-3.5 h-3.5 mr-2 mb-1" />}
                          {chat.text}
                       </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-start animate-pulse">
                       <div className="p-6 bg-black/40 border border-slate-800 rounded-[2rem] flex items-center space-x-1.5">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
               </div>
               <div className="p-8 border-t border-white/5 bg-black/20">
                  <div className="relative group">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center space-x-2 pointer-events-none">
                        <Command className="w-4 h-4 text-indigo-600" />
                        <div className="w-px h-4 bg-slate-800" />
                     </div>
                     <input 
                      value={chatQuery} onChange={e => setChatQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && processCommand(chatQuery)}
                      placeholder="Input skill command or research query..." 
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] py-5 pl-16 pr-20 text-white text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-700 shadow-inner" 
                     />
                     <button onClick={() => processCommand(chatQuery)} disabled={isChatting || isSynthesizing} className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 rounded-2xl text-white shadow-xl hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-20">
                        <Send className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Output Stack */}
         <div className="w-[320px] bg-slate-900/60 backdrop-blur-3xl rounded-[3.5rem] border border-white/5 p-8 flex flex-col gap-8 shadow-2xl overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center"><History className="w-5 h-5 mr-3 text-indigo-400" /> Output Stack</h3>
              <div className="space-y-4">
                {artifacts.map((art, i) => (
                  <div key={i} onClick={() => setActiveArtifact(art)} className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden shadow-xl ${activeArtifact === art ? 'bg-indigo-600/10 border-indigo-500/40 ring-2 ring-indigo-600/10' : 'bg-black/40 border-white/5 hover:border-slate-700'}`}>
                      <div className="flex items-center space-x-5 relative z-10">
                        <div className={`p-4 rounded-2xl ${activeArtifact === art ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'} group-hover:scale-110 transition-transform`}>
                            <Zap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-white uppercase truncate">{art.title}</p>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">NODE: {art.type.toUpperCase()}</p>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Settings className="w-5 h-5 mr-3 text-emerald-400" /> Active Skills</h3>
              <div className="space-y-3">
                 {[
                   { label: 'Deep Research', icon: Target, status: 'STABLE', color: 'text-amber-400' },
                   { label: 'NotebookLM Core', icon: Library, status: 'READY', color: 'text-blue-400' },
                   { label: 'Search Grounding', icon: Globe, status: 'ACTIVE', color: 'text-emerald-400' },
                 ].map((skill, i) => (
                   <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                      <div className="flex items-center space-x-3">
                         <skill.icon className={`w-4 h-4 ${skill.color}`} />
                         <span className="text-[9px] font-black uppercase text-slate-300">{skill.label}</span>
                      </div>
                      <span className="text-[7px] font-black px-2 py-0.5 bg-slate-800 rounded-md text-slate-500">{skill.status}</span>
                   </div>
                 ))}
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NotebookStudio;