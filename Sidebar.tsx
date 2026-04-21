import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Image as ImageIcon, Paintbrush, 
  Megaphone, Layers, BookOpen, Cloud, ShieldAlert, ChevronLeft, 
  ChevronRight, ShoppingBag, MessageSquare, FileSpreadsheet, 
  LifeBuoy, GraduationCap, Monitor, Settings, Zap, ShieldCheck,
  Server, Shield, Activity, Mail, Library, Lock, Github,
  DollarSign, Cpu, Heart, Briefcase, TrendingUp, Brain, HelpCircle
} from 'lucide-react';
import { StudioMode, SiteConfig } from '../types';
import { translations } from '../App';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  activeMode: StudioMode;
  setActiveMode: (mode: StudioMode) => void;
  lang: 'en' | 'bn' | 'hi' | 'es' | 'ar' | 'fr' | 'ru' | 'ja' | 'zh' | 'pt';
  isAdmin: boolean;
  activeModules: SiteConfig['activeModules'];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, activeMode, setActiveMode, lang, isAdmin, activeModules }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[lang] || translations.en;

  const userItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard, path: '/', visible: true },
    { id: StudioMode.VIDEO, icon: Video, label: t.video, path: '/video', visible: activeModules.video },
    { id: StudioMode.PHOTO, icon: ImageIcon, label: t.photo, path: '/photo', visible: activeModules.photo },
    { id: StudioMode.PAINT, icon: Paintbrush, label: t.paint, path: '/paint', visible: activeModules.paint },
    { id: StudioMode.AD_BUILDER, icon: Megaphone, label: t.ads, path: '/ads', visible: activeModules.ads },
    { id: StudioMode.AUDIOBOOK, icon: BookOpen, label: t.audiobook, path: '/audiobook', visible: true },
    { id: StudioMode.NOTEBOOK, icon: Library, label: t.notebook, path: '/notebook', visible: activeModules.notebook },
    { id: StudioMode.OFFICE, icon: FileSpreadsheet, label: t.office, path: '/office', visible: activeModules.office },
    { id: StudioMode.COMMUNICATION, icon: MessageSquare, label: t.communication, path: '/communication', visible: true },
    { id: StudioMode.SHOP, icon: ShoppingBag, label: t.shop, path: '/shop', visible: activeModules.shop },
    { id: StudioMode.STORAGE, icon: Cloud, label: t.storage, path: '/storage', visible: true },
    { id: StudioMode.GITHUB, icon: Github, label: 'GitHub Hub', path: '/github', visible: true },
    { id: StudioMode.VPS_MANAGER, icon: Server, label: t.vps, path: '/vps', visible: activeModules.vps },
    { id: StudioMode.SUPPORT, icon: LifeBuoy, label: t.support, path: '/support', visible: true },
  ].filter(item => item.visible);

  const growthItems = [
    { id: StudioMode.FINANCE, icon: DollarSign, label: t.finance, path: '/finance', visible: activeModules.finance },
    { id: StudioMode.TECH_SKILLS, icon: Cpu, label: t.tech, path: '/tech', visible: activeModules.tech },
    { id: StudioMode.COMMUNICATION_SKILLS, icon: MessageSquare, label: t.communication, path: '/communication-skills', visible: activeModules.communication_skills },
    { id: StudioMode.LIFE_SKILLS, icon: BookOpen, label: t.life, path: '/life', visible: activeModules.life },
    { id: StudioMode.HEALTH, icon: Heart, label: t.health, path: '/health', visible: activeModules.health },
    { id: StudioMode.CAREER, icon: Briefcase, label: t.career, path: '/career', visible: activeModules.career },
    { id: StudioMode.LEGAL, icon: ShieldCheck, label: t.legal, path: '/legal', visible: activeModules.legal },
    { id: StudioMode.QUIZ, icon: HelpCircle, label: t.quiz, path: '/quiz', visible: activeModules.quiz },
    { id: StudioMode.AI_LEARNING, icon: Brain, label: t.ai, path: '/ai-learning', visible: activeModules.ai },
    { id: StudioMode.PROGRESS, icon: TrendingUp, label: t.progress, path: '/progress', visible: activeModules.progress },
  ].filter(item => item.visible);

  return (
    <aside className={`${isOpen ? 'w-72' : 'w-24'} bg-[#020617] border-r border-white/5 transition-all duration-500 ease-out flex flex-col relative z-50 overflow-hidden shadow-2xl`}>
      <div className="p-8 flex items-center justify-between">
        {isOpen ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">P.M<br/><span className="text-[10px] tracking-[0.2em] opacity-60">Academy</span></h1>
          </div>
        ) : (
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar-sidebar pb-10">
        <div className="px-4 py-4">
           {userItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { 
                if (item.id in StudioMode) setActiveMode(item.id as StudioMode); 
                navigate(item.path); 
              }}
              className={`w-full flex items-center p-4 rounded-2xl transition-all group relative mb-1 ${
                location.pathname === item.path 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-transform ${location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`} />
              {isOpen && <span className="ml-5 font-black text-[10px] uppercase tracking-widest">{item.label}</span>}
              {location.pathname === item.path && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />}
            </button>
           ))}

           {/* Growth & Skills Section */}
           {growthItems.length > 0 && (
             <div className="mt-8 pt-8 border-t border-white/5">
                <p className={`text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 px-4 ${!isOpen && 'text-center'}`}>
                  {isOpen ? 'Growth & Skills' : 'SKILLS'}
                </p>
                {growthItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { 
                      if (item.id in StudioMode) setActiveMode(item.id as StudioMode); 
                      navigate(item.path); 
                    }}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all group relative mb-1 ${
                      location.pathname === item.path 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 transition-transform ${location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {isOpen && <span className="ml-5 font-black text-[10px] uppercase tracking-widest">{item.label}</span>}
                    {location.pathname === item.path && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />}
                  </button>
                ))}
             </div>
           )}

           {/* Admin Specific Section */}
           {isAdmin && (
             <div className="mt-8 pt-8 border-t border-white/5">
                <p className={`text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 px-4 ${!isOpen && 'text-center'}`}>
                  {isOpen ? 'Governance' : 'ROOT'}
                </p>
                <button
                  onClick={() => navigate('/admin')}
                  className={`w-full flex items-center p-4 rounded-2xl transition-all group relative mb-1 ${
                    location.pathname === '/admin' 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 scale-[1.02]' 
                    : 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/5 border border-transparent hover:border-emerald-500/10'
                  }`}
                >
                  <ShieldCheck className={`w-5 h-5 shrink-0 transition-transform ${location.pathname === '/admin' ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {isOpen && <span className="ml-5 font-black text-[10px] uppercase tracking-widest">{t.admin}</span>}
                  {location.pathname === '/admin' && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />}
                </button>
             </div>
           )}
        </div>
      </nav>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <button onClick={toggle} className="w-full flex items-center p-4 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 mx-auto" />}
          {isOpen && <span className="ml-5 font-black text-[10px] uppercase tracking-widest">Collapse View</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;