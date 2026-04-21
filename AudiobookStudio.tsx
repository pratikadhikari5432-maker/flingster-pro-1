
import React, { useState, useRef } from 'react';
import { BookOpen, Wand2, Play, Save, Download, Music, Mic2, Pause, Volume2, Share2, Plus, Trash2, Upload, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { GeminiService } from '../src/services/geminiService';
import { Project, StudioMode } from '../types';

interface Chapter {
  id: string;
  title: string;
  content: string;
  audioUrl: string | null;
  isAiGenerated: boolean;
}

const AudiobookStudio: React.FC<{ onSave: (p: Project) => void }> = ({ onSave }) => {
  const [chapters, setChapters] = useState<Chapter[]>([{ id: '1', title: 'Chapter 1', content: '', audioUrl: null, isAiGenerated: true }]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCoverGenerating, setIsCoverGenerating] = useState(false);
  const [coverImage, setCoverImage] = useState("https://picsum.photos/seed/book/400/600");

  const handleGenerateCover = async () => {
    setIsCoverGenerating(true);
    const gemini = GeminiService.getInstance();
    const visual = await gemini.generateImage(`Cinematic professional book cover art for: ${chapters[0].title}. High-fidelity, artistic style.`, "9:16");
    if (visual) setCoverImage(visual);
    setIsCoverGenerating(false);
  };

  const handleGenerateAudio = async () => {
    const active = chapters[activeChapterIndex];
    if (!active.content) return;
    setIsGenerating(true);
    const result = await GeminiService.getInstance().generateSpeech(active.content);
    if (result) {
      const updated = [...chapters];
      updated[activeChapterIndex].audioUrl = result;
      setChapters(updated);
    }
    setIsGenerating(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black flex items-center"><BookOpen className="w-7 h-7 mr-3 text-emerald-500" /> Audiobook Master</h2>
          <p className="text-slate-400 text-sm">Synthesize text into immersive high-fidelity audiobooks.</p>
        </div>
        <button onClick={() => onSave({ id: Date.now().toString(), name: chapters[0].title, type: StudioMode.AUDIOBOOK, thumbnail: coverImage, updatedAt: Date.now(), status: 'draft', data: { chapters, coverImage } })} className="px-8 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase text-white shadow-xl">Save Book</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 relative group overflow-hidden">
              {isCoverGenerating && <div className="absolute inset-0 bg-slate-950/80 z-10 flex items-center justify-center"><Wand2 className="w-8 h-8 animate-spin text-indigo-400" /></div>}
              <img src={coverImage} className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl" alt="Book Cover" />
              <button onClick={handleGenerateCover} className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[8px] font-black uppercase text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all flex items-center">
                <ImageIcon className="w-3 h-3 mr-2" /> Redesign Cover
              </button>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Chapters</h3>
              <div className="space-y-2">
                {chapters.map((ch, i) => (
                  <button key={ch.id} onClick={() => setActiveChapterIndex(i)} className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all ${activeChapterIndex === i ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                    {ch.title}
                  </button>
                ))}
                <button onClick={() => setChapters([...chapters, { id: Date.now().toString(), title: `Chapter ${chapters.length+1}`, content: '', audioUrl: null, isAiGenerated: true }])} className="w-full p-3 border border-dashed border-slate-700 rounded-xl text-[10px] font-black text-slate-500 uppercase flex items-center justify-center"><Plus className="w-3 h-3 mr-2" /> Add Chapter</button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 min-h-[400px] flex flex-col">
            <input 
              value={chapters[activeChapterIndex].title} 
              onChange={(e) => { const u = [...chapters]; u[activeChapterIndex].title = e.target.value; setChapters(u); }}
              className="bg-transparent text-2xl font-black text-white border-b border-slate-800 pb-4 mb-8 focus:outline-none focus:border-blue-500" 
            />
            <textarea 
              value={chapters[activeChapterIndex].content}
              onChange={(e) => { const u = [...chapters]; u[activeChapterIndex].content = e.target.value; setChapters(u); }}
              placeholder="Begin your story..."
              className="flex-1 bg-transparent text-slate-300 leading-relaxed text-lg resize-none focus:outline-none"
            />
          </div>
          
          <div className="flex items-center space-x-4">
             <button onClick={handleGenerateAudio} disabled={isGenerating || !chapters[activeChapterIndex].content} className="flex-1 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl text-xs font-black uppercase text-slate-950 shadow-2xl disabled:opacity-50">
                {isGenerating ? <Wand2 className="w-5 h-5 animate-spin mx-auto" /> : "Synthesize AI Narration"}
             </button>
             {chapters[activeChapterIndex].audioUrl && (
               <button className="p-5 bg-white rounded-3xl text-slate-950 shadow-xl"><Play className="w-6 h-6" /></button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudiobookStudio;
