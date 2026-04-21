
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Play, Image as ImageIcon, Layout, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { StudioMode } from '../types';

const TemplatesGallery: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const templates = [
    { id: 'v_cyber', name: 'Cyberpunk Vlog', type: StudioMode.VIDEO, thumb: 'https://picsum.photos/seed/t1/400/225', config: { theme: 'cyberpunk', duration: 30 } },
    { id: 'p_port', name: 'Minimalist Portrait', type: StudioMode.PHOTO, thumb: 'https://picsum.photos/seed/t2/400/225', config: { filter: 'minimal', exposure: 1.2 } },
    { id: 'a_tech', name: 'Tech Ad Deck', type: StudioMode.AD_BUILDER, thumb: 'https://picsum.photos/seed/t3/400/225', config: { category: 'Tech', theme: 'Modern' } },
    { id: 'c_sheet', name: 'Character Sheet A', type: StudioMode.PAINT, thumb: 'https://picsum.photos/seed/t4/400/225', config: { style: '3d-disney' } },
    { id: 'v_story', name: 'Social Stories Kit', type: StudioMode.VIDEO, thumb: 'https://picsum.photos/seed/t5/400/225', config: { aspectRatio: '9:16' } },
    { id: 'a_brand', name: 'Modern Brand Guide', type: StudioMode.AD_BUILDER, thumb: 'https://picsum.photos/seed/t6/400/225', config: { theme: 'Elegant' } },
  ];

  const filtered = filter === 'all' ? templates : templates.filter(t => t.type === filter);

  const handleUseTemplate = (template: typeof templates[0]) => {
    // Navigate to the editor with state
    navigate(`/${template.type}`, { state: { templateData: template.config, isTemplate: true } });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase flex items-center">
            <Sparkles className="w-8 h-8 mr-4 text-indigo-500" /> Template Forge
          </h2>
          <p className="text-slate-400 font-medium mt-1">Deploy pre-configured studio sessions instantly.</p>
        </div>
        <div className="flex w-full md:w-auto space-x-3">
          <div className="flex-1 md:w-80 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <input type="text" placeholder="Search templates..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
          </div>
          <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
             <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', StudioMode.VIDEO, StudioMode.PHOTO, StudioMode.PAINT, StudioMode.AD_BUILDER].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              filter === cat 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20' 
              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'Universal' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(template => (
          <div key={template.id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer shadow-2xl">
            <div className="aspect-video relative overflow-hidden">
               <img src={template.thumb} alt={template.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
               <div className="absolute top-4 right-4">
                  <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-xl">
                     {template.type === StudioMode.VIDEO ? <Play className="w-4 h-4 text-rose-400" /> : 
                      template.type === StudioMode.PHOTO ? <ImageIcon className="w-4 h-4 text-cyan-400" /> : <Layout className="w-4 h-4 text-amber-400" />}
                  </div>
               </div>
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                  <button onClick={() => handleUseTemplate(template)} className="px-8 py-4 bg-white text-slate-950 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl flex items-center">
                    Deploy Template <Zap className="w-4 h-4 ml-3 fill-current" />
                  </button>
               </div>
            </div>
            <div className="p-8">
               <h4 className="font-black text-slate-100 uppercase tracking-tight text-lg">{template.name}</h4>
               <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">{template.type.replace('_', ' ')} Engine</p>
               <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800" />)}
                     <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold">+12</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesGallery;
