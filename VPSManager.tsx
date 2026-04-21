import React, { useState, useEffect } from 'react';
import { 
  Server, Shield, Activity, Terminal, Globe, Cpu, 
  HardDrive, Zap, Plus, Trash2, ExternalLink, 
  CheckCircle2, AlertCircle, RefreshCw, Key,
  Lock, Network, Settings, Video
} from 'lucide-react';
import { UserProfile, VPSConfig } from '../types';
import { translations } from '../App';
import { db, auth } from '../src/services/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface VPSManagerProps {
  user: UserProfile;
}

const VPSManager: React.FC<VPSManagerProps> = ({ user }) => {
  const [vpsList, setVpsList] = useState<VPSConfig[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string, details: string } | null>(null);
  const [newVps, setNewVps] = useState({
    name: '',
    ip: '',
    username: 'root',
    password: '',
    provider: 'InterServer.net'
  });

  const t = translations[user.language] || translations.en;

  useEffect(() => {
    const vpsRef = collection(db, 'users', user.email.toLowerCase(), 'vps');
    const unsubscribeSnapshot = onSnapshot(vpsRef, (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data() as VPSConfig);
      setVpsList(list);
    }, (err) => {
      console.warn("VPS Node Telemetry Link Status:", err.code);
    });

    return () => unsubscribeSnapshot();
  }, [user.email]);

  const handleAddVps = async (e: React.FormEvent) => {
    e.preventDefault();
    const vpsId = Math.random().toString(36).substr(2, 9);
    const vps: VPSConfig = {
      id: vpsId,
      name: newVps.name.trim(),
      ip: newVps.ip.trim(),
      username: newVps.username.trim(),
      password: newVps.password.trim(),
      provider: newVps.provider,
      status: 'online',
      hasVideoEngine: false,
      lastChecked: Date.now()
    };
    
    try {
      await setDoc(doc(db, 'users', user.email.toLowerCase(), 'vps', vpsId), vps);
      setIsAdding(false);
      setNewVps({ name: '', ip: '', username: 'root', password: '', provider: 'InterServer.net' });
    } catch (e: any) {
      alert("Failed to provision node reference: " + e.message);
    }
  };

  const handleSetupVideo = async (vps: VPSConfig) => {
    setIsSettingUp(vps.id);
    try {
      const response = await fetch('/api/vps/setup-video', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pm_token')}`
        },
        body: JSON.stringify({
          ip: vps.ip,
          username: vps.username,
          password: vps.password
        })
      });

      const data = await response.json();
      if (response.ok) {
        const vpsRef = doc(db, 'users', user.email.toLowerCase(), 'vps', vps.id);
        await updateDoc(vpsRef, { hasVideoEngine: true, status: 'online' });
        alert("Success: Industrial Video Engine Synchronized on Remote Node.");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert("Node Synch Error: " + err.message);
    } finally {
      setIsSettingUp(null);
    }
  };

  const handleTestConnection = async (vps: VPSConfig) => {
    setIsTesting(vps.id);
    setTestResult(null);
    try {
      const response = await fetch('/api/vps/test-connection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pm_token')}`
        },
        body: JSON.stringify({
          ip: vps.ip,
          username: vps.username,
          password: vps.password
        })
      });

      const data = await response.json();
      if (response.ok) {
        const vpsRef = doc(db, 'users', user.email.toLowerCase(), 'vps', vps.id);
        await updateDoc(vpsRef, { status: 'online', lastChecked: Date.now() });
        setTestResult({ id: vps.id, details: data.details });
      } else {
        const vpsRef = doc(db, 'users', user.email.toLowerCase(), 'vps', vps.id);
        await updateDoc(vpsRef, { status: 'offline' });
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert("Connection Protocol Error: " + err.message);
    } finally {
      setIsTesting(null);
    }
  };

  const removeVps = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', user.email.toLowerCase(), 'vps', id));
    } catch (e: any) {
      alert("Failed to decouple node: " + e.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            <Server className="w-10 h-10 text-indigo-500" />
            {t.vps}
          </h2>
          <p className="text-slate-400 mt-2 font-medium">
            {user.language === 'bn' 
              ? 'আপনার ইন্টারসার্ভার (InterServer.net) ভিপিএস সার্ভার পরিচালনা করুন।' 
              : 'Manage and monitor your InterServer.net VPS nodes from a unified dashboard.'}
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {user.language === 'bn' ? 'নতুন সার্ভার যোগ করুন' : 'Provision New Node'}
        </button>
      </div>

      {/* Connection Process Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Server Grid */}
          {vpsList.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {user.language === 'bn' ? 'কোনো সার্ভার পাওয়া যায়নি' : 'No Active Nodes Detected'}
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {user.language === 'bn' 
                  ? 'আপনার ইন্টারসার্ভার ভিপিএস কানেক্ট করতে উপরের বাটনে ক্লিক করুন।' 
                  : 'Start by connecting your InterServer VPS instance to enable remote rigging and rendering.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vpsList.map(vps => (
                <div key={vps.id} className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase text-xs tracking-wider">{vps.name}</h4>
                        <p className="text-[10px] font-mono text-slate-500">{vps.ip}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${
                      vps.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${vps.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                      {vps.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Provider</p>
                      <p className="text-[10px] text-white font-bold">{vps.provider}</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <p className="text-[8px] text-slate-500 uppercase font-black mb-1">User</p>
                      <p className="text-[10px] text-white font-bold">{vps.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleSetupVideo(vps)}
                      disabled={isSettingUp === vps.id}
                      className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        vps.hasVideoEngine 
                          ? 'bg-emerald-500/20 text-emerald-400 cursor-default' 
                          : 'bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20'
                      }`}
                    >
                      {isSettingUp === vps.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
                      {vps.hasVideoEngine ? 'Video Engine Active' : 'Setup Video Node'}
                    </button>
                    <button 
                      onClick={() => handleTestConnection(vps)}
                      disabled={isTesting === vps.id}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                      title="Ping Node & Fetch System Specs"
                    >
                      {isTesting === vps.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3 group-hover/btn:text-indigo-400" />}
                    </button>
                    <button 
                      onClick={() => removeVps(vps.id)}
                      className="w-12 h-12 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {testResult?.id === vps.id && (
                    <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-indigo-500/20 animate-in slide-in-from-top-2">
                       <div className="flex items-center justify-between mb-2">
                          <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">Uplink Telemetry</p>
                          <button onClick={() => setTestResult(null)} className="text-[8px] text-slate-600 hover:text-white uppercase font-black">Close</button>
                       </div>
                       <pre className="text-[9px] font-mono text-slate-400 whitespace-pre-wrap leading-relaxed">
                          {testResult.details}
                       </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Process Guide Sidebar */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">
              {user.language === 'bn' ? 'কানেকশন প্রসেস' : 'Connection Protocol'}
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <p className="text-xs font-medium leading-relaxed">
                  {user.language === 'bn' 
                    ? 'ইন্টারসার্ভার প্যানেল থেকে আপনার আইপি (IP) এবং রুট পাসওয়ার্ড সংগ্রহ করুন।' 
                    : 'Obtain your VPS IP address and Root password from InterServer.net client area.'}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <p className="text-xs font-medium leading-relaxed">
                  {user.language === 'bn' 
                    ? 'সার্ভারে SSH এক্সেস নিশ্চিত করুন (Port 22 সাধারণত ডিফল্ট থাকে)।' 
                    : 'Ensure SSH access is enabled (Standard Port 22).'}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <p className="text-xs font-medium leading-relaxed">
                  {user.language === 'bn' 
                    ? 'শ্রীজন প্যানেলে আইপি এবং ইউজারনেম দিয়ে কানেক্ট বাটনে ক্লিক করুন।' 
                    : 'Input the credentials into Srijan Node Manager to establish a secure tunnel.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
              <Shield className="w-3 h-3 text-emerald-500" /> Security Status
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">SSH Encryption</span>
                <span className="text-[10px] text-emerald-400 font-black">AES-256</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Firewall Node</span>
                <span className="text-[10px] text-emerald-400 font-black">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Auto-Backup</span>
                <span className="text-[10px] text-slate-600 font-black">DISABLED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add VPS Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Connect Node</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVps} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Node Name</label>
                <input 
                  type="text" 
                  required
                  value={newVps.name}
                  onChange={e => setNewVps({...newVps, name: e.target.value})}
                  placeholder="e.g. Render-Node-01"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">IP Address</label>
                <input 
                  type="text" 
                  required
                  value={newVps.ip}
                  onChange={e => setNewVps({...newVps, ip: e.target.value})}
                  placeholder="0.0.0.0"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">User</label>
                  <input 
                    type="text" 
                    required
                    value={newVps.username}
                    onChange={e => setNewVps({...newVps, username: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Password</label>
                  <input 
                    type="password" 
                    required
                    value={newVps.password}
                    onChange={e => setNewVps({...newVps, password: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 mt-4"
              >
                Establish Connection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VPSManager;
