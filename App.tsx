import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import VideoEditor from './components/VideoEditor';
import PhotoEditor from './components/PhotoEditor';
import PaintStudio from './components/PaintStudio';
import AdBuilder from './components/AdBuilder';
import TemplatesGallery from './components/TemplatesGallery';
import AudiobookStudio from './components/AudiobookStudio';
import EducationStudio from './components/EducationStudio';
import FinanceStudio from './components/FinanceStudio';
import AdminPanel from './components/AdminPanel';
import UserProfilePage from './components/UserProfilePage';
import CloudStorage from './components/CloudStorage';
import Shop from './components/Shop';
import CommunicationStudio from './components/CommunicationStudio';
import OfficeSuite from './components/OfficeSuite';
import SupportCenter from './components/SupportCenter';
import NotebookStudio from './components/NotebookStudio';
import VPSManager from './components/VPSManager';
import SkillsHub from './components/SkillsHub';
import Auth from './components/Auth';
import GlobalTerminal from './components/GlobalTerminal';
import GitHubManager from './components/GitHubManager';
import { StudioMode, Project, UserProfile, SiteConfig } from './types';
import { ShieldAlert, Terminal, RefreshCw, Zap, X, Sparkles, CheckCircle, Monitor, Command } from 'lucide-react';

export const translations: any = {
  en: { 
    dashboard: 'Dashboard', 
    video: 'Pro Video Studio', 
    photo: 'Neural Photo Studio', 
    paint: 'Animation Rig Hub', 
    ads: 'Marketing Matrix', 
    audiobook: 'Audiobook Core', 
    education: 'Academy Hub', 
    storage: 'Cloud Drive', 
    templates: 'Forge', 
    admin: 'Root Governance', 
    logout: 'Terminate Session', 
    welcome: 'System Initialized', 
    shop: 'Marketplace', 
    communication: 'Node Academy', 
    office: 'Office Matrix', 
    support: 'Uplink Support', 
    shareStudio: 'Export Hub Link', 
    notebook: 'Intelligence Node', 
    vps: 'VPS Server Node',
    finance: 'Money & Finance',
    tech: 'Digital & Tech Skills',
    life: 'Life Skills',
    health: 'Health & Wellness',
    career: 'Career & Skills',
    legal: 'Legal & Safety',
    quiz: 'Practice & Quiz',
    ai: 'AI & Smart Learning',
    progress: 'Progress System'
  },
  bn: { 
    dashboard: 'ড্যাশবোর্ড', 
    video: 'প্রো ভিডিও স্টুডিও', 
    photo: 'ফটো স্টুডিও', 
    paint: 'অ্যানিমেশন স্টুডিও', 
    ads: 'মার্কেটিং ম্যাট্রিক্স', 
    audiobook: 'অডিওবুক কোর', 
    education: 'শিক্ষা কেন্দ্র', 
    storage: 'ক্লাউড ড্রাইভ', 
    templates: 'টেমপ্লেট', 
    admin: 'রুট গভর্নেন্স', 
    logout: 'লগ আউট', 
    welcome: 'স্বাগতম', 
    shop: 'মার্কেটপ্লেস', 
    communication: 'একাডেমি', 
    office: 'অফিস ম্যাট্রিক্স', 
    support: 'সহায়তা', 
    shareStudio: 'লিঙ্ক শেয়ার', 
    notebook: 'ইন্টেলিজেন্স নোড', 
    vps: 'ভিপিএস সার্ভার নোড',
    finance: 'মানি ও ফিন্যান্স',
    tech: 'ডিজিটাল ও টেক স্কিলস',
    life: 'লাইফ স্কিলস',
    health: 'হেলথ ও ওয়েলনেস',
    career: 'ক্যারিয়ার ও স্কিলস',
    legal: 'লিগ্যাল ও সেফটি',
    quiz: 'প্র্যাকটিস ও কুইজ',
    ai: 'এআই ও স্মার্ট লার্নিং',
    progress: 'প্রগ্রেস সিস্টেম'
  }
};

const CURRENT_APP_VERSION = "10.5.0";

import { safeJsonStringify } from './src/utils/safeSerialization';

import { db, auth } from './src/services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<StudioMode>(StudioMode.VIDEO);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(() => {
    // ভার্সন চেকিং এবং সেশন প্রোটেকশন
    // Migration Logic
    const savedVersion = localStorage.getItem('pm_app_version');
    const saved = localStorage.getItem('pm_session');
    
    if (!saved) {
      const srijanSaved = localStorage.getItem('srijan_session');
      if (srijanSaved) {
        console.log("Migrating Srijan session to P.M Academy branding");
        localStorage.setItem('pm_session', srijanSaved);
        localStorage.removeItem('srijan_session');
        const srijanToken = localStorage.getItem('srijan_token');
        if (srijanToken) {
          localStorage.setItem('pm_token', srijanToken);
          localStorage.removeItem('srijan_token');
        }
        return JSON.parse(srijanSaved);
      }
      
      const legacySaved = localStorage.getItem('lumina_session');
      if (legacySaved) {
        console.log("Migrating legacy session to P.M Academy branding");
        localStorage.setItem('pm_session', legacySaved);
        localStorage.removeItem('lumina_session');
        return JSON.parse(legacySaved);
      }
    }

    if (saved && savedVersion !== CURRENT_APP_VERSION) {
      console.log("Migrating session to version " + CURRENT_APP_VERSION);
      localStorage.setItem('pm_app_version', CURRENT_APP_VERSION);
    }
    
    return saved ? JSON.parse(saved) : null;
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('pm_site_config');
    return saved ? JSON.parse(saved) : { 
      maintenanceMode: false, 
      activeModules: { 
        video: true, photo: true, paint: true, ads: true, office: true, 
        shop: true, notebook: true, vps: true,
        finance: true, tech: true, life: true, health: true, 
        career: true, legal: true, quiz: true, ai: true, progress: true,
        communication_skills: true
      }, 
      globalAnnouncement: "",
      version: CURRENT_APP_VERSION,
      changelog: "Industrial Security Update: Credentials Override & Session Persistence.",
      lastUpdateDate: Date.now()
    };
  });

  useEffect(() => {
    localStorage.setItem('pm_app_version', CURRENT_APP_VERSION);
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    const userRef = doc(db, 'users', user.email.toLowerCase());
    const unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const updatedUser = snapshot.data() as UserProfile;
        setUser(updatedUser);
        // Note: The useEffect below will handle saving this to localStorage safely
      }
    }, (err) => {
      console.warn("Firestore Link Status:", err.code);
    });
    
    return () => unsubscribeSnapshot();
  }, [user?.email]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pm_session', safeJsonStringify(user));
      
      let saved = localStorage.getItem(`pm_projects_${user.email}`);
      
      // Migrate projects if needed
      if (!saved) {
        const srijanProjects = localStorage.getItem(`srijan_projects_${user.email}`);
        if (srijanProjects) {
          console.log("Migrating Srijan projects to P.M Academy branding");
          localStorage.setItem(`pm_projects_${user.email}`, srijanProjects);
          localStorage.removeItem(`srijan_projects_${user.email}`);
          saved = srijanProjects;
        } else {
          const legacyProjects = localStorage.getItem(`lumina_projects_${user.email}`);
          if (legacyProjects) {
            localStorage.setItem(`pm_projects_${user.email}`, legacyProjects);
            localStorage.removeItem(`lumina_projects_${user.email}`);
            saved = legacyProjects;
          }
        }
      }
      
      setProjects(saved ? JSON.parse(saved) : []);
    } else {
      localStorage.removeItem('pm_session');
      localStorage.removeItem('pm_token');
    }
  }, [user]);

  const saveProject = (project: Project) => {
    if (!user) return;
    const updated = [project, ...projects.filter(p => p.id !== project.id)];
    setProjects(updated);
    localStorage.setItem(`pm_projects_${user.email}`, safeJsonStringify(updated));
  };

  const handleElevate = () => {
    if (!user) return;
    const elevatedUser = { ...user, role: 'admin' as any };
    setUser(elevatedUser);
  };

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <HashRouter>
      <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
        <div className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 z-[200]" />

        <Sidebar 
          isOpen={isSidebarOpen} 
          toggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          activeMode={activeMode} 
          setActiveMode={setActiveMode} 
          lang={user.language as any} 
          isAdmin={user.role === 'admin'} 
          activeModules={siteConfig.activeModules} 
        />
        
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <Header 
            user={user} 
            onLogout={() => setUser(null)} 
            setLanguage={(l) => setUser({...user, language: l})} 
            onElevate={handleElevate} 
            onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
            announcement={siteConfig.globalAnnouncement} 
          />
          
          <main className="flex-1 overflow-hidden relative bg-gradient-to-br from-[#020617] to-[#0f172a]">
            <div className="absolute inset-0 overflow-auto p-4 md:p-8 custom-scrollbar">
                <Routes>
                  <Route path="/" element={<Dashboard projects={projects} setActiveMode={setActiveMode} user={user} announcement={siteConfig.globalAnnouncement} />} />
                  <Route path="/video" element={<VideoEditor onSave={saveProject} user={user} />} />
                  <Route path="/photo" element={<PhotoEditor onSave={saveProject} />} />
                  <Route path="/paint" element={<PaintStudio onSave={saveProject} />} />
                  <Route path="/ads" element={<AdBuilder onSave={saveProject} />} />
                  <Route path="/audiobook" element={<AudiobookStudio onSave={saveProject} />} />
                  <Route path="/notebook" element={<NotebookStudio onSave={saveProject} />} />
                  <Route path="/education" element={<EducationStudio />} />
                  <Route path="/admin" element={user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
                  <Route path="/profile" element={<UserProfilePage user={user} setUser={setUser} onLogout={() => setUser(null)} onElevate={handleElevate} />} />
                  <Route path="/storage" element={<CloudStorage projects={projects} />} />
                  <Route path="/shop" element={<Shop user={user} />} />
                  <Route path="/communication" element={<CommunicationStudio user={user} />} />
                  <Route path="/office" element={<OfficeSuite user={user} onSave={saveProject} />} />
                  <Route path="/support" element={<SupportCenter user={user} />} />
                  <Route path="/vps" element={<VPSManager user={user} />} />
                  <Route path="/github" element={<GitHubManager user={user} />} />
                  <Route path="/finance" element={<FinanceStudio user={user} setUser={setUser} />} />
                  <Route path="/tech" element={<SkillsHub mode={StudioMode.TECH_SKILLS} />} />
                  <Route path="/communication-skills" element={<SkillsHub mode={StudioMode.COMMUNICATION_SKILLS} />} />
                  <Route path="/life" element={<SkillsHub mode={StudioMode.LIFE_SKILLS} />} />
                  <Route path="/health" element={<SkillsHub mode={StudioMode.HEALTH} />} />
                  <Route path="/career" element={<SkillsHub mode={StudioMode.CAREER} />} />
                  <Route path="/legal" element={<SkillsHub mode={StudioMode.LEGAL} />} />
                  <Route path="/quiz" element={<SkillsHub mode={StudioMode.QUIZ} />} />
                  <Route path="/ai-learning" element={<SkillsHub mode={StudioMode.AI_LEARNING} />} />
                  <Route path="/progress" element={<SkillsHub mode={StudioMode.PROGRESS} />} />
                </Routes>
            </div>
          </main>
          
          <GlobalTerminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} user={user} />

          <footer className="h-8 bg-black/60 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-6 z-50">
             <div className="flex items-center space-x-6">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Node Build {CURRENT_APP_VERSION} Security Active</span>
             </div>
             <div className="flex items-center space-x-4">
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-tighter">{user.email}</span>
             </div>
          </footer>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;