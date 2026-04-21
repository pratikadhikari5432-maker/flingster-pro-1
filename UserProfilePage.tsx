import React, { useState, useRef } from 'react';
import { 
  User, Mail, ShieldCheck, Wallet, History, Lock, Eye, EyeOff, Trash2, Key, 
  Fingerprint, Camera, LogOut, ChevronRight, ArrowRight, Zap, Sparkles, 
  Terminal, CheckCircle, Smartphone as MobileIcon, UserCheck, 
  Database, Network, Binary, Calendar, RefreshCw, XCircle, CreditCard,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { safeJsonStringify } from '../src/utils/safeSerialization';
import { api } from '../src/services/apiService';
import { db } from '../src/services/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

interface UserProfilePageProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  onLogout: () => void;
  onElevate: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, setUser, onLogout, onElevate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'identity' | 'security' | 'wallet' | 'verification' | 'plans'>('identity');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [passForm, setPassForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'bkash', details: '' });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUpdateIdentity = async () => {
    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', user.email.toLowerCase());
      await updateDoc(userRef, { 
        name: editForm.name,
      });
      
      const updatedUser = { ...user, name: editForm.name };
      setUser(updatedUser);
      localStorage.setItem('pm_session', safeJsonStringify(updatedUser));
      
      setIsEditing(false);
      triggerToast("Identity parameters synchronized.");
    } catch (e: any) {
      alert("Update failed: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passForm.newPassword !== passForm.confirmPassword) {
      alert("Encryption keys do not match.");
      return;
    }
    setIsUpdating(true);
    try {
      await api.updateProfile({ password: passForm.newPassword });
      setPassForm({ newPassword: '', confirmPassword: '' });
      triggerToast("Security access keys updated.");
    } catch (e: any) {
      alert("Failed to update password.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWithdrawRequest = async () => {
    const amt = parseFloat(withdrawForm.amount);
    if (isNaN(amt) || amt <= 0) return;
    if (amt > (user.revenue || 0)) {
      alert("Insufficient revenue in user node.");
      return;
    }

    setIsUpdating(true);
    try {
      await addDoc(collection(db, 'withdrawal_requests'), {
        userId: user.email.toLowerCase(),
        userEmail: user.email,
        amount: amt,
        method: withdrawForm.method,
        details: withdrawForm.details,
        status: 'pending',
        createdAt: Date.now()
      });
      setWithdrawForm({ amount: '', method: 'bkash', details: '' });
      triggerToast("Withdrawal protocol initiated.");
    } catch (e) {
      alert("Relay failure. Transaction aborted.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyStudent = async () => {
    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', user.email.toLowerCase());
      await updateDoc(userRef, { studentVerificationStatus: 'pending' });
      setUser({ ...user, studentVerificationStatus: 'pending' });
      triggerToast("Academic verification pending.");
    } catch (e) {
      alert("Upload failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSwitchPlan = async (plan: any) => {
    if (plan === user.plan) return;
    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', user.email.toLowerCase());
      await updateDoc(userRef, { plan });
      setUser({ ...user, plan });
      triggerToast(`Plan synchronized to ${plan}.`);
    } catch (e) {
      alert("Plan update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const plans = [
    { name: 'Free', price: '৳0', features: ['Standard Video Rendering', '5 Credits Daily', 'Community Support'] },
    { name: 'Micro', price: '৳50', features: ['Fast Queue Processing', '25 Credits Daily', 'Priority Storage', 'Logo Neutralization'], popular: true },
    { name: 'Student', price: '৳100', features: ['Verified Academic Node', '60 Credits Daily', '4K Render Exports', 'Priority Queue'], restricted: true },
    { name: 'Individual', price: '৳300', features: ['4K Render Exports', '100 Credits Daily', 'Full VPS Access', '24/7 Support'] },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 relative">
      {showToast && (
        <div className="fixed top-24 right-10 bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[120] flex items-center animate-in slide-in-from-right duration-300 border border-white/10">
          <CheckCircle className="w-5 h-5 mr-3" />
          <span className="font-bold uppercase tracking-widest text-[10px]">{toastMsg}</span>
        </div>
      )}

      <div className="relative h-80 rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-[#020617] to-black" />
        <div className="absolute inset-x-16 bottom-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-10">
           <div className="flex flex-col md:flex-row items-center md:items-end md:space-x-12">
              <div className="w-56 h-56 rounded-[4.5rem] bg-slate-900 border-[12px] border-[#020617] p-2 shadow-2xl overflow-hidden group relative">
                <img src={user.avatar} className="w-full h-full rounded-[3.5rem] object-cover" alt="" />
              </div>
              <div className="pb-4 text-center md:text-left mt-6 md:mt-0">
                 <h2 className="text-6xl font-black tracking-tighter text-white uppercase leading-none">{user.name}</h2>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4 bg-slate-900/50 px-5 py-2.5 rounded-full border border-slate-800 inline-block">{user.email}</p>
              </div>
           </div>
           <div className="flex items-center space-x-4 pb-4">
              <button onClick={onLogout} className="p-5 bg-slate-900 hover:bg-rose-600/10 text-slate-500 hover:text-rose-500 rounded-[2rem] border border-slate-800 transition-all shadow-xl"><LogOut className="w-6 h-6" /></button>
              <button onClick={() => navigate('/')} className="px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-2xl flex items-center">Studio Panel <ChevronRight className="w-4 h-4 ml-3" /></button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-6">
         <div className="lg:col-span-3 space-y-5">
            {[
              { id: 'identity', label: 'Identity Protocol', icon: User },
              { id: 'wallet', label: 'Financial Matrix', icon: Wallet },
              { id: 'plans', label: 'Subscription Tiers', icon: Zap },
              { id: 'verification', label: 'Status Verify', icon: UserCheck },
              { id: 'security', label: 'Security Firewall', icon: ShieldCheck },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center p-6 rounded-[2.5rem] transition-all group ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl' : 'bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-white'}`}>
                 <tab.icon className={`w-6 h-6 mr-6 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                 <span className="text-[11px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
              </button>
            ))}
         </div>

         <div className="lg:col-span-9">
            {activeTab === 'identity' && (
              <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[4rem] p-16 shadow-2xl space-y-12 animate-in fade-in">
                 <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center"><UserCheck className="w-8 h-8 mr-5 text-indigo-400" /> Core Identity</h3>
                    <button onClick={() => isEditing ? handleUpdateIdentity() : setIsEditing(true)} className="px-10 py-4 bg-slate-800 hover:bg-indigo-600 rounded-2xl text-[10px] font-black uppercase text-white shadow-xl flex items-center">
                      {isUpdating && activeTab === 'identity' ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                      {isEditing ? 'Commit Changes' : 'Modify ID'}
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">New Designation (Name)</label>
                          <input disabled={!isEditing} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] py-5 px-8 text-sm font-black text-white outline-none focus:ring-4 focus:ring-indigo-500/10 uppercase" />
                       </div>
                    </div>
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">New Uplink ID (Email)</label>
                          <input disabled={!isEditing} value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] py-5 px-8 text-sm font-black text-white outline-none focus:ring-4 focus:ring-indigo-500/10 uppercase" />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[4rem] p-16 shadow-2xl space-y-12 animate-in fade-in">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter flex items-center"><Wallet className="w-10 h-10 mr-6 text-emerald-500" /> Unit Revenue Cluster</h3>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2 ml-16">Monitor and extract trade yields from industrial cycles</p>
                    </div>
                    <div className="p-10 bg-black/40 border border-white/5 rounded-[3rem] text-center min-w-[240px]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Available for Extraction</p>
                        <p className="text-5xl font-black text-white tabular-nums">৳{(user.revenue || 0).toFixed(2)}</p>
                    </div>
                 </div>

                 <div className="max-w-xl bg-white/5 border border-white/5 rounded-[3rem] p-10 space-y-8">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Withdrawal Protocol</h4>
                    <div className="space-y-6">
                        <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5">
                            {['bkash', 'nagad', 'rocket'].map(m => (
                                <button key={m} onClick={() => setWithdrawForm({...withdrawForm, method: m})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${withdrawForm.method === m ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>{m}</button>
                            ))}
                        </div>
                        <input type="number" placeholder="Extraction Amount" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-8 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 outline-none tabular-nums" />
                        <input type="text" placeholder="Receiver Identification (Phone)" value={withdrawForm.details} onChange={e => setWithdrawForm({...withdrawForm, details: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-8 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 outline-none" />
                        <button onClick={handleWithdrawRequest} disabled={isUpdating} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl transition-all disabled:opacity-50">
                          {isUpdating && activeTab === 'wallet' ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <CreditCard className="w-4 h-4 mr-3" />}
                          Initiate Extraction Pulse
                        </button>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[4rem] p-16 shadow-2xl space-y-12 animate-in fade-in">
                 <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center"><Zap className="w-8 h-8 mr-5 text-amber-500" /> Subscription Matrix</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map(plan => (
                      <div key={plan.name} className={`p-8 bg-black/40 border rounded-[2.5rem] flex flex-col justify-between group transition-all ${plan.popular ? 'border-amber-500/30 ring-2 ring-amber-500/10 scale-105' : 'border-white/5'}`}>
                         <div>
                            {plan.popular && <span className="bg-amber-500 text-black text-[8px] font-black uppercase px-3 py-1 rounded-full mb-6 inline-block">Recommended</span>}
                            <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{plan.name} Node</h4>
                            <p className="text-3xl font-black text-white tabular-nums mb-8">{plan.price}<span className="text-[10px] text-slate-500 font-bold tracking-widest">/MO</span></p>
                            <ul className="space-y-4 mb-10">
                               {plan.features.map(f => (
                                 <li key={f} className="flex items-center text-[9px] font-black uppercase text-slate-400 tracking-widest"><CheckCircle className="w-3 h-3 text-emerald-500 mr-3" /> {f}</li>
                               ))}
                            </ul>
                         </div>
                         <button 
                            disabled={isUpdating || user.plan === plan.name || (plan.name === 'Student' && user.studentVerificationStatus !== 'verified')}
                            onClick={() => handleSwitchPlan(plan.name)}
                            className={`w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.plan === plan.name ? 'bg-white/10 text-slate-500 border border-white/5' : (plan.name === 'Student' && user.studentVerificationStatus !== 'verified') ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:bg-white/90 shadow-xl'}`}
                          >
                           {user.plan === plan.name ? 'Active Node' : (plan.name === 'Student' && user.studentVerificationStatus !== 'verified') ? 'Identity Verification Required' : 'Switch Protocol'}
                         </button>
                      </div>
                    ))}
                 </div>
                 <div className="p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Users className="w-10 h-10 text-indigo-400" />
                        <div>
                           <p className="text-white font-black text-sm uppercase">Custom Infrastructure?</p>
                           <p className="text-slate-500 text-[10px] font-medium tracking-widest uppercase mt-1">Contact for enterprise cluster negotiation</p>
                        </div>
                    </div>
                    <button className="px-10 py-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-indigo-500/20">Enterprise Request</button>
                 </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[4rem] p-16 shadow-2xl space-y-12 animate-in fade-in">
                 <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center"><UserCheck className="w-8 h-8 mr-5 text-indigo-500" /> Identity Status Verify</h3>
                 
                 <div className="max-w-2xl bg-white/5 border border-white/5 rounded-[3rem] p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <MobileIcon className="w-32 h-32" />
                    </div>
                    
                    <div className="relative z-10 space-y-8">
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Authorization Tier</p>
                           <p className="text-4xl font-black text-white uppercase tracking-tighter">{user.plan}</p>
                        </div>

                        {user.studentVerificationStatus === 'verified' ? (
                           <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center space-x-6">
                              <CheckCircle className="w-10 h-10 text-emerald-500" />
                              <div>
                                 <p className="text-sm font-black text-white uppercase">Academic Node Verified</p>
                                 <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Student Plan Active (Affordable Mode)</p>
                              </div>
                           </div>
                        ) : user.studentVerificationStatus === 'pending' ? (
                           <div className="p-8 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center space-x-6">
                              <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                              <div>
                                 <p className="text-sm font-black text-white uppercase">Verification Processing</p>
                                 <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Awaiting root admin handshake</p>
                              </div>
                           </div>
                        ) : (
                           <div className="space-y-8">
                              <p className="text-slate-400 text-sm leading-relaxed">Verification for academic nodes provides deep discounts (৳100/MO) on industrial creative cycles. Select your institution category to proceed.</p>
                              <button onClick={handleApplyStudent} disabled={isUpdating} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl transition-all disabled:opacity-50">
                                {isUpdating && activeTab === 'verification' ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <UserPlus className="w-4 h-4 mr-3" />}
                                Request Academic Authorization
                              </button>
                           </div>
                        )}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[4rem] p-16 shadow-2xl space-y-12 animate-in fade-in">
                 <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center"><ShieldCheck className="w-8 h-8 mr-5 text-emerald-500" /> Access Key Override</h3>
                 <div className="max-w-md space-y-8">
                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-[2.5rem] space-y-4 mb-4">
                       <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Administrative Uplink</h4>
                       <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">Identity node can request root privileges for governance access.</p>
                       <button onClick={onElevate} className="w-full py-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 transition-all flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 mr-2" /> Elevate to Root
                       </button>
                    </div>
                    <div className="space-y-5">
                        <div className="relative group">
                           <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                           <input type={showPass ? "text" : "password"} placeholder="New Secure Key" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] py-5 pl-14 pr-16 text-sm text-white focus:ring-4 focus:ring-emerald-500/10 outline-none" />
                           <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">{showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                        </div>
                        <input type={showPass ? "text" : "password"} placeholder="Confirm Access Key" value={passForm.confirmPassword} onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] py-5 px-8 text-sm text-white focus:ring-4 focus:ring-emerald-500/10 outline-none" />
                     </div>
                     <button onClick={handlePasswordChange} disabled={isUpdating || !passForm.newPassword} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl flex items-center justify-center">
                        {isUpdating && activeTab === 'security' ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <Key className="w-4 h-4 mr-3" />}
                        Synchronize Security
                     </button>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

// Internal icon for Plans tab
const Users = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default UserProfilePage;
