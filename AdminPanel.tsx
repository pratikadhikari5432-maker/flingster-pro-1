import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, SearchCode, RefreshCw, Coins, 
  Terminal, ShieldAlert, Cpu, Database, Radio, Megaphone,
  Ban, MapPin, Power, CheckCircle, AlertTriangle, Wallet,
  UserCheck, CreditCard, ArrowUpRight, ArrowDownLeft, XCircle, Rocket
} from 'lucide-react';
import { UserProfile, SiteConfig, WithdrawalRequest, SubscriptionTier } from '../types';
import { api } from '../src/services/apiService';
import { db } from '../src/services/firebase';
import { 
  collection, doc, getDoc, getDocs, updateDoc, 
  query, where, deleteDoc, orderBy, limit 
} from 'firebase/firestore';

type AdminTab = 'nodes' | 'matrix' | 'telemetry' | 'credits' | 'finance' | 'publish';

const AdminPanel: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loginStep, setLoginStep] = useState<'creds' | 'otp'>('creds');
  const [adminCreds, setAdminCreds] = useState({ email: 'admin@pmacademy.com', password: 'PM_ACADEMY_PRIME_ROOT' });
  const [otpValue, setOtpValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<AdminTab>('credits');
  const [targetUsername, setTargetUsername] = useState("");
  const [targetUserData, setTargetUserData] = useState<UserProfile | null>(null);
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);
  const [balanceAdjust, setBalanceAdjust] = useState({ type: 'credits' as 'credits' | 'revenue', amount: '' });
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('pm_site_config');
    return saved ? JSON.parse(saved) : {
      maintenanceMode: false,
      activeModules: { video: true, photo: true, paint: true, ads: true, office: true, shop: true, notebook: true, vps: true },
      globalAnnouncement: "All systems nominal across creative nodes.",
      version: "10.5.0",
      changelog: "Stability patches for skeletal rigging and NLE render sync.",
      lastUpdateDate: Date.now()
    };
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [studentRequests, setStudentRequests] = useState<UserProfile[]>([]);
  const [isLoadingFinance, setIsLoadingFinance] = useState(false);

  useEffect(() => {
    if (isUnlocked && activeTab === 'finance') {
      fetchFinanceData();
    }
  }, [isUnlocked, activeTab]);

  const fetchFinanceData = async () => {
    setIsLoadingFinance(true);
    try {
      // Fetch withdrawals
      const wQuery = query(collection(db, 'withdrawal_requests'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
      const wSnap = await getDocs(wQuery);
      setWithdrawalRequests(wSnap.docs.map(d => ({ id: d.id, ...d.data() } as WithdrawalRequest)));

      // Fetch student verification requests
      const sQuery = query(collection(db, 'users'), where('studentVerificationStatus', '==', 'pending'));
      const sSnap = await getDocs(sQuery);
      setStudentRequests(sSnap.docs.map(d => d.data() as UserProfile));
    } catch (e) {
      console.error("Finance fetch error:", e);
    } finally {
      setIsLoadingFinance(false);
    }
  };

  const checkCredits = async () => {
    if (!targetUsername) return;
    setIsCheckingCredits(true);
    try {
      const userRef = doc(db, 'users', targetUsername.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setTargetUserData(userSnap.data() as UserProfile);
      } else {
        setError("NODE NOT FOUND");
        setTargetUserData(null);
      }
    } catch (err) {
      setError("Critical Node Error: Failed to reach cluster backend.");
    } finally {
      setIsCheckingCredits(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!targetUserData || !balanceAdjust.amount) return;
    const amt = parseFloat(balanceAdjust.amount);
    if (isNaN(amt)) return;

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', targetUserData.email.toLowerCase());
      const updates: any = {};
      if (balanceAdjust.type === 'credits') {
        updates.credits = (targetUserData.credits || 0) + amt;
      } else {
        updates.revenue = (targetUserData.revenue || 0) + amt;
      }
      
      await updateDoc(userRef, updates);
      setTargetUserData({ ...targetUserData, ...updates });
      setSuccessMsg(`Balance synchronized: ${amt > 0 ? '+' : ''}${amt} ${balanceAdjust.type}`);
      setBalanceAdjust({ ...balanceAdjust, amount: '' });
    } catch (e) {
      setError("Balance sync failure.");
    } finally {
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  const handleWithdrawalAction = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const req = withdrawalRequests.find(r => r.id === requestId);
      if (!req) return;

      const userRef = doc(db, 'users', req.userEmail.toLowerCase());
      const reqRef = doc(db, 'withdrawal_requests', requestId);

      if (status === 'approved') {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const u = userSnap.data() as UserProfile;
          if (u.revenue < req.amount) {
            alert("Insufficient revenue in user node.");
            return;
          }
          await updateDoc(userRef, { revenue: u.revenue - req.amount });
        }
      }

      await updateDoc(reqRef, { status });
      setWithdrawalRequests(prev => prev.filter(r => r.id !== requestId));
      setSuccessMsg(`Withdrawal ${status.toUpperCase()}`);
    } catch (e) {
      alert("Action failed.");
    }
  };

  const handleStudentVerification = async (email: string, status: 'verified' | 'rejected') => {
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      await updateDoc(userRef, { 
        studentVerificationStatus: status,
        plan: status === 'verified' ? 'Student' : 'Free'
      });
      setStudentRequests(prev => prev.filter(u => u.email !== email));
      setSuccessMsg(`Verification ${status.toUpperCase()}`);
    } catch (e) {
      alert("Verification update failed.");
    }
  };

  const handleInitialLogin = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await api.adminLogin(adminCreds);
      setLoginStep('otp');
      if (response.otp) setSuccessMsg(`OTP GENERATED: ${response.otp}`);
    } catch (e: any) {
      setError("Root access rejected.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpVerify = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await api.verifyAdminOtp({ email: adminCreds.email, otp: otpValue });
      setIsUnlocked(true);
    } catch (e: any) {
      setError("Invalid Cipher Key.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
        <div className="w-full max-w-lg bg-black/90 border border-emerald-500/20 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden text-center">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
           <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-8">
              <ShieldCheck className="w-10 h-10" />
           </div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Terminal Authorization</h2>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10">Industrial Pro Control</p>
           
           {error && <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 text-[10px] font-black uppercase mb-6 flex items-center justify-center animate-in shake"><AlertTriangle className="w-4 h-4 mr-2" /> {error}</div>}
           {successMsg && <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-black uppercase mb-6 flex items-center justify-center"><CheckCircle className="w-4 h-4 mr-2" /> {successMsg}</div>}

           {loginStep === 'creds' ? (
             <div className="space-y-6">
                <input value={adminCreds.email} onChange={(e) => setAdminCreds({...adminCreds, email: e.target.value})} placeholder="ADMIN ID" className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-emerald-500/30 uppercase font-mono" />
                <input type="password" value={adminCreds.password} onChange={(e) => setAdminCreds({...adminCreds, password: e.target.value})} placeholder="ACCESS KEY" className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-emerald-500/30 font-mono" />
                <button onClick={handleInitialLogin} disabled={isProcessing} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Request Root Access</button>
             </div>
           ) : (
             <div className="space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center justify-center space-x-3 text-emerald-500 bg-emerald-500/5 py-3 rounded-2xl border border-emerald-500/10">
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Secure OTP Bridge: ACTIVE</span>
                   </div>
                   <input type="text" maxLength={6} value={otpValue} onChange={(e) => setOtpValue(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-6 text-center text-4xl font-black tracking-[1em] text-emerald-500 outline-none focus:border-emerald-500/50 shadow-inner" placeholder="******" />
                </div>
                <button onClick={handleOtpVerify} disabled={isProcessing} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Verify & Unlock Matrix</button>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
              <ShieldCheck className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Root Governance</h2>
              <div className="flex items-center space-x-4 mt-2">
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Node Build v{siteConfig.version}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_emerald]" />
              </div>
           </div>
        </div>
        
        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl overflow-x-auto">
           {['telemetry', 'nodes', 'matrix', 'credits', 'finance', 'publish'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{tab}</button>
           ))}
           <button onClick={() => setIsUnlocked(false)} className="px-4 py-2.5 ml-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Power className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] p-10 min-h-[600px] shadow-2xl relative overflow-hidden">
        {activeTab === 'credits' && (
           <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-500">
              <div className="text-center">
                 <Coins className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                 <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Identity Balance Matrix</h3>
                 <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2">Inject or extract neural energy from active nodes</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Identity UID</label>
                       <div className="relative group">
                          <SearchCode className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-emerald-400" />
                          <input 
                            value={targetUsername} 
                            onChange={e => setTargetUsername(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-8 text-sm font-black text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all uppercase" 
                            placeholder="e.g. user@example.com"
                          />
                       </div>
                    </div>

                    <button 
                     onClick={checkCredits} 
                     disabled={isCheckingCredits}
                     className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                      {isCheckingCredits ? <RefreshCw className="w-5 h-5 animate-spin mr-3" /> : <Activity className="w-5 h-5 mr-3" />}
                      Query Identity Node
                    </button>

                    {targetUserData && (
                      <div className="p-8 bg-white/5 border border-white/5 rounded-3xl animate-in fade-in space-y-6">
                         <div className="flex items-center space-x-4">
                            <img src={targetUserData.avatar} className="w-12 h-12 rounded-xl" alt="" />
                            <div>
                               <p className="text-white font-black text-sm uppercase">{targetUserData.name}</p>
                               <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{targetUserData.email}</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                               <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Credits</p>
                               <p className="text-xl font-black text-white">{targetUserData.credits}</p>
                            </div>
                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                               <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Revenue</p>
                               <p className="text-xl font-black text-emerald-400">৳{targetUserData.revenue?.toFixed(2)}</p>
                            </div>
                         </div>
                      </div>
                    )}
                 </div>

                 <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center"><Wallet className="w-5 h-5 mr-3 text-indigo-400" /> Balance Calibration</h4>
                    
                    <div className="space-y-6">
                       <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5">
                          <button onClick={() => setBalanceAdjust({ ...balanceAdjust, type: 'credits' })} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${balanceAdjust.type === 'credits' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Credits</button>
                          <button onClick={() => setBalanceAdjust({ ...balanceAdjust, type: 'revenue' })} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${balanceAdjust.type === 'revenue' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Revenue</button>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Adjustment Delta</label>
                          <input 
                            type="number"
                            value={balanceAdjust.amount}
                            onChange={(e) => setBalanceAdjust({ ...balanceAdjust, amount: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-8 text-xl font-black text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all tabular-nums" 
                            placeholder="e.g. 500 or -500"
                          />
                       </div>

                       <button 
                         onClick={handleAdjustBalance}
                         disabled={!targetUserData || !balanceAdjust.amount || isProcessing}
                         className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center"
                       >
                         {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
                         Synchronize Balance
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'finance' && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 {/* Student Verifications */}
                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center"><UserCheck className="w-6 h-6 mr-3 text-indigo-400" /> Identity Verifications</h3>
                       <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">{studentRequests.length} Pending</span>
                    </div>

                    <div className="space-y-4">
                       {studentRequests.length > 0 ? studentRequests.map(u => (
                         <div key={u.email} className="bg-black/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center space-x-4">
                               <img src={u.avatar} className="w-12 h-12 rounded-xl" alt="" />
                               <div>
                                  <p className="text-sm font-black text-white uppercase">{u.name}</p>
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px]">{u.email}</p>
                               </div>
                            </div>
                            <div className="flex items-center space-x-2">
                               <button onClick={() => handleStudentVerification(u.email, 'rejected')} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 transition-all hover:text-white"><XCircle className="w-4 h-4" /></button>
                               <button onClick={() => handleStudentVerification(u.email, 'verified')} className="px-5 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Verify</button>
                            </div>
                         </div>
                       )) : (
                         <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-black/20">
                            <UserCheck className="w-10 h-10 text-slate-800 mx-auto mb-4" />
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No pending verification protocols</p>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Withdrawal Requests */}
                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center"><Wallet className="w-6 h-6 mr-3 text-emerald-400" /> Withdrawal Cluster</h3>
                       <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">{withdrawalRequests.length} Active</span>
                    </div>

                    <div className="space-y-4">
                       {withdrawalRequests.length > 0 ? withdrawalRequests.map(req => (
                         <div key={req.id} className="bg-black/40 border border-white/5 rounded-3xl p-8 space-y-6 hover:border-emerald-500/30 transition-all">
                            <div className="flex justify-between items-start">
                               <div>
                                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Requested Amount</p>
                                  <p className="text-4xl font-black text-white tabular-nums">৳{req.amount.toFixed(2)}</p>
                               </div>
                               <div className="px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                                  {req.method}
                               </div>
                            </div>
                            
                            <div className="py-4 border-y border-white/5">
                               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Target Account</p>
                               <p className="text-xs font-mono text-slate-300 bg-black/40 p-3 rounded-lg border border-white/5">{req.details}</p>
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">{req.userEmail}</p>
                            </div>

                            <div className="flex items-center space-x-4">
                               <button onClick={() => handleWithdrawalAction(req.id, 'rejected')} className="flex-1 py-4 bg-rose-500/10 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Deny Protocol</button>
                               <button onClick={() => handleWithdrawalAction(req.id, 'approved')} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-xl transition-all">Approve Transfer</button>
                            </div>
                         </div>
                       )) : (
                         <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-black/20">
                            <CreditCard className="w-10 h-10 text-slate-800 mx-auto mb-4" />
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Withdrawal queue cleared</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'telemetry' && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
              {[
                { label: 'CLUSTER LOAD', val: `24%`, icon: Cpu, color: 'text-emerald-500' },
                { label: 'STORAGE SYNC', val: `98%`, icon: Database, color: 'text-blue-500' },
                { label: 'NETWORK MASK', val: `ACTIVE`, icon: Radio, color: 'text-amber-500' },
                { label: 'THREATS NEUTRALIZED', val: 142, icon: ShieldAlert, color: 'text-rose-500' }
              ].map(stat => (
                <div key={stat.label} className="bg-black/40 border border-slate-800 rounded-[2rem] p-8 text-center space-y-4">
                   <stat.icon className={`w-10 h-10 mx-auto ${stat.color}`} />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-4xl font-black text-white tracking-tighter">{stat.val}</p>
                </div>
              ))}
           </div>
        )}
        
        {activeTab === 'publish' && (
           <div className="max-w-3xl mx-auto text-center space-y-10 animate-in zoom-in-95 duration-500 py-10">
              <div className="w-24 h-24 bg-emerald-600/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mx-auto shadow-2xl">
                 <Rocket className="w-12 h-12" />
              </div>
              <div>
                 <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Publishing Core</h3>
                 <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-4">Deploy current node build to production cluster</p>
              </div>
              <div className="p-10 bg-black/40 border border-white/5 rounded-[3rem] space-y-8">
                 <div className="flex justify-between items-center text-left p-6 bg-slate-900/50 rounded-2xl border border-white/5">
                    <div>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Environment</p>
                       <p className="text-xl font-black text-white">Asia-Southeast (Live)</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instance ID</p>
                       <p className="text-sm font-mono text-slate-400 uppercase">PM-NODE-41538401</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => { setIsProcessing(true); setTimeout(() => { setIsProcessing(false); alert("PROTOCOL SUCCESS: App Published Successfully!"); }, 3000); }}
                  disabled={isProcessing}
                  className="w-full py-6 bg-white text-black rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                 >
                   {isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : "Initiate Global Deployment"}
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;