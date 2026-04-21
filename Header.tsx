
import React, { useState } from 'react';
import { Search, Bell, Globe, ChevronDown, Terminal, ShieldAlert, X, ShieldCheck, Lock, Unlock, Shield, Settings, Zap, Mail, Command as CommandIcon, Share2, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';
import { translations } from '../App';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  setLanguage: (lang: any) => void;
  onElevate: () => void;
  onToggleTerminal: () => void;
  announcement?: string;
}

const Header: React.FC<HeaderProps> = ({ user, setLanguage, onElevate, onToggleTerminal, announcement }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [copied, setCopied] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' }
  ];

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchVal.startsWith('/')) {
      onToggleTerminal();
      // Pipe command could be implemented here
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-24 border-b border-white/5 bg-slate-950/80 backdrop-blur-3xl flex items-center justify-between px-10 sticky top-0 z-40 shadow-2xl">
      <div className="flex-1 max-w-3xl relative">
        <div className="absolute left-7 top-1/2 -translate-y-1/2 text-indigo-400">
          <CommandIcon className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={handleCommand}
          placeholder="Search projects or type '/' for terminal commands..." 
          className="w-full bg-slate-900/50 border-2 border-indigo-500/10 rounded-[2rem] py-5 pl-16 pr-14 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none shadow-inner"
        />
        {searchVal && (
          <button onClick={() => setSearchVal("")} className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-6 ml-12">
        <button 
          onClick={onToggleTerminal}
          className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-lg group"
          title="Studio Shell (cURL enabled)"
        >
          <Terminal className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <button 
          onClick={handleShare}
          className={`p-4 rounded-2xl transition-all shadow-lg group flex items-center space-x-3 ${copied ? 'bg-emerald-600 text-white' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'}`}
          title={translations[user.language]?.shareStudio || 'Share App'}
        >
          {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
          {copied && <span className="text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2">Link Copied</span>}
        </button>

        <div className="hidden xl:flex items-center space-x-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
           <Mail className="w-4 h-4 text-indigo-400" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[180px]">{user.email}</span>
        </div>

        <div className="relative">
          <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center space-x-3 px-6 py-3 bg-slate-900 border border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase transition-all text-slate-400 hover:text-white hover:border-indigo-500/40">
            <Globe className="w-4 h-4" />
            <span>{languages.find(l => l.code === user.language)?.label || 'English'}</span>
          </button>
          {showLangMenu && (
            <div className="absolute top-full right-0 mt-6 w-72 max-h-96 overflow-y-auto bg-slate-900 border-2 border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,1)] p-5 z-[100] custom-scrollbar animate-in slide-in-from-top-6">
              {languages.map(lang => (
                <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }} className={`w-full flex items-center space-x-5 p-5 rounded-2xl text-[11px] font-black uppercase transition-all mb-1 ${user.language === lang.code ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 text-slate-500 hover:text-white'}`}>
                  <span className="text-xl">{lang.flag}</span> <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div onClick={() => navigate('/profile')} className="flex items-center space-x-5 cursor-pointer group">
           <div className="w-14 h-14 p-1 rounded-2xl border-2 border-indigo-600/20 group-hover:border-indigo-600/50 transition-all">
              <img src={user.avatar} className="w-full h-full rounded-xl object-cover shadow-2xl group-hover:scale-105 transition-transform" alt="Profile" />
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
