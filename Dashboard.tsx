
import React, { useState } from 'react';
import { Plus, Clock, FolderOpen, Zap, Video, Image as ImageIcon, Paintbrush, Megaphone, Share2, CheckCircle, ArrowRight, Server, Mail, Library, Github } from 'lucide-react';
import { StudioMode, Project, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { translations } from '../App';

interface DashboardProps {
  projects: Project[];
  setActiveMode: (mode: StudioMode) => void;
  user: UserProfile;
  announcement?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, setActiveMode, user }) => {
  const navigate = useNavigate();
  const t = translations[user.language] || translations.en;
  const [showSharedToast, setShowSharedToast] = useState(false);

  const quickStart = [
    { mode: StudioMode.VIDEO, label: t.video, color: 'bg-rose-500/20 text-rose-500', icon_comp: Video },
    { mode: StudioMode.PHOTO, label: t.photo, color: 'bg-cyan-500/20 text-cyan-500', icon_comp: ImageIcon },
    { mode: StudioMode.PAINT, label: t.paint, color: 'bg-emerald-500/20 text-emerald-400', icon_comp: Paintbrush },
    { mode: StudioMode.GITHUB, label: 'GitHub Hub', color: 'bg-slate-500/20 text-slate-300', icon_comp: Github },
    { mode: StudioMode.NOTEBOOK, label: t.notebook, color: 'bg-indigo-500/20 text-indigo-400', icon_comp: Library },
  ];

  const handleShare = () => {
    navigator.clipboard.writeText("https://pm-academy.io/share/" + user.email);
    setShowSharedToast(true);
    setTimeout(() => setShowSharedToast(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      {showSharedToast && (
        <div className="fixed top-24 right-10 bg-emerald-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl z-[150] flex items-center animate-in slide-in-from-right duration-300 border border-white/10">
          <CheckCircle className="w-5 h-5 mr-3 shadow-lg" />
          <span className="font-black uppercase tracking-[0.2em] text-[10px]">Node Link Synchronized!</span>
        </div>
      )}

      {/* Hero Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-indigo-400">
             <Mail className="w-3.5 h-3.5" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">{user.email}</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter uppercase leading-none">
            {t.welcome}, <span className="text-indigo-500">{(user.name || 'User').split(' ')[0]}</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Professional Studio Infrastructure Ready</p>
        </div>
        <div className="flex items-center space-x-5">
          <button 
            onClick={handleShare}
            className="flex items-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-[1.8rem] transition-all border border-white/5 text-[10px] font-black uppercase tracking-widest shadow-2xl group"
          >
            <Share2 className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
            Share Hub
          </button>
          <button 
            onClick={() => { setActiveMode(StudioMode.VIDEO); navigate('/video'); }}
            className="flex items-center px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.8rem] transition-all shadow-[0_15px_30px_rgba(99,102,241,0.3)] text-[10px] font-black uppercase tracking-widest relative overflow-hidden group"
          >
            <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
            Initialize Core
          </button>
        </div>
      </div>

      {/* Workspace Hub Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Video Deployments', value: projects.filter(p => p.type === StudioMode.VIDEO).length, icon: Video, color: 'text-rose-500' },
          { label: 'Asset Storage', value: projects.length, icon: Server, color: 'text-indigo-500' },
          { label: 'Neural Credits', value: (user.credits || 0).toLocaleString(), icon: Zap, color: 'text-amber-500' },
          { label: 'Node Identity', value: user.email.split('@')[0], icon: Mail, color: 'text-emerald-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl group hover:border-indigo-500/20 transition-all">
             <stat.icon className={`w-8 h-8 ${stat.color} mb-6 group-hover:scale-110 transition-transform`} />
             <p className="text-xl font-black text-white tracking-tighter mb-1 truncate">{stat.value}</p>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Studio Access */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 shadow-[0_0_80px_rgba(0,0,0,0.4)]">
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 flex items-center">
           <Zap className="w-8 h-8 mr-4 text-indigo-400" /> Studio Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {quickStart.map(item => (
             <button
               key={item.mode}
               onClick={() => { setActiveMode(item.mode); navigate(`/${item.mode}`); }}
               className="group relative p-10 rounded-[3rem] bg-black/40 border border-white/5 hover:border-indigo-500/50 transition-all text-left overflow-hidden shadow-2xl"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                   <item.icon_comp className="w-32 h-32 text-white" />
                </div>
                <div className={`p-5 rounded-2xl w-fit mb-8 ${item.color} group-hover:scale-110 transition-transform shadow-xl`}>
                   <item.icon_comp className="w-8 h-8" />
                </div>
                <h4 className="font-black text-2xl uppercase tracking-tight text-white mb-2">{item.label}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Infrastructure</p>
                <div className="mt-8 flex items-center text-[9px] font-black uppercase text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                   Initialize Node <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Project Stream */}
      <div className="space-y-8">
         <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center">
               <Clock className="w-7 h-7 mr-4 text-slate-600" />
               Recent Synthesis
            </h3>
            <button onClick={() => navigate('/storage')} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300">Global Storage Explorer</button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
           {projects.length > 0 ? projects.map((p) => (
             <div key={p.id} className="group bg-slate-900/60 border border-white/5 rounded-[3rem] overflow-hidden hover:border-indigo-500/30 transition-all shadow-2xl">
               <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                  <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                     <button onClick={() => { setActiveMode(p.type); navigate(`/${p.type}`); }} className="p-6 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-all">
                        <Plus className="w-8 h-8" />
                     </button>
                  </div>
               </div>
               <div className="p-10">
                  <div className="flex justify-between items-center mb-4">
                     <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black uppercase text-indigo-400 tracking-widest">{p.type} Module</span>
                     <span className="text-[9px] font-mono text-slate-600">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight truncate">{p.name}</h4>
               </div>
             </div>
           )) : (
             <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] bg-slate-900/20">
                <FolderOpen className="w-16 h-16 text-slate-800 mb-6" />
                <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No active nodes detected in session</p>
                <button onClick={() => { setActiveMode(StudioMode.VIDEO); navigate('/video'); }} className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Initialize Node</button>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
