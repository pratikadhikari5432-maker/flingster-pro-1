
import React, { useState, useEffect } from 'react';
import { 
  Wallet, Coins, ArrowUpRight, ArrowDownLeft, CreditCard, 
  ShieldCheck, RefreshCw, AlertCircle, CheckCircle, Smartphone,
  Building, Globe, Briefcase, Zap, Sparkles, TrendingUp
} from 'lucide-react';
import { UserProfile, SubscriptionTier } from '../types';
import { api } from '../src/services/apiService';
import { safeJsonStringify } from '../src/utils/safeSerialization';

interface FinanceStudioProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

const FinanceStudio: React.FC<FinanceStudioProps> = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'plans' | 'withdraw'>('wallet');
  const [rechargeAmt, setRechargeAmt] = useState("");
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", method: "Bkash", details: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  const handleRecharge = async () => {
    const amt = parseInt(rechargeAmt);
    if (!amt || amt <= 0) return;
    setIsProcessing(true);
    try {
      const res = await api.rechargeCredits(amt);
      if (res.user) setUser(res.user);
      showToast(`Successfully added ${amt} Credits to your node.`, 'success');
      setRechargeAmt("");
    } catch (e) {
      showToast("Recharge protocol failure.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawForm.amount);
    if (!amt || amt <= 0 || !withdrawForm.details) return;
    if (amt > user.revenue) {
       showToast("Insufficient revenue for withdrawal.", 'error');
       return;
    }
    setIsProcessing(true);
    try {
      await api.requestWithdrawal({ amount: amt, method: withdrawForm.method, details: withdrawForm.details });
      showToast("Withdrawal request dispatched to admin cluster.", 'success');
      setWithdrawForm({ amount: "", method: "Bkash", details: "" });
    } catch (e) {
      showToast("Dispatch failure.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyPlan = async (tier: SubscriptionTier, price: number) => {
    if (user.plan === tier) return;
    if (window.confirm(`Switch to ${tier} Plan for better node capacity?`)) {
      setIsProcessing(true);
      try {
        const res = await api.purchasePlan(tier, price);
        if (res.user) setUser(res.user);
        showToast(`Node upgraded to ${tier} status.`, 'success');
      } catch (e) {
        showToast("Upgrade handshake failed.", 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const plans: { tier: SubscriptionTier, price: string, features: string[], color: string }[] = [
    { tier: 'Free', price: '৳0', features: ['Standard AI Access', '10 Daily Credits', 'Basic Projects'], color: 'slate' },
    { tier: 'Student', price: '৳299/mo', features: ['Priority Learning Node', 'Unlimited Projects', 'HD Exports', 'Education Tools'], color: 'emerald' },
    { tier: 'Micro', price: '৳499/mo', features: ['1000 AI Credits', '4K Rendering', 'Advanced Video'], color: 'blue' },
    { tier: 'Individual', price: '৳999/mo', features: ['Unlimited Credits', 'Commercial Rights', 'Studio 2.0 Access'], color: 'indigo' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-24 right-10 px-8 py-4 rounded-2xl shadow-2xl z-[200] flex items-center animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'} text-white border border-white/20`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
          <span className="font-black uppercase tracking-widest text-[10px]">{toast.msg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
              <Wallet className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Finance Node</h2>
              <p className="text-slate-400 mt-2 font-medium italic">Manage your credits and marketplace revenue.</p>
           </div>
        </div>
        
        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl overflow-x-auto">
           {['wallet', 'plans', 'withdraw'].map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab as any)} 
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
           {/* Wallet Display */}
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                 <TrendingUp className="w-32 h-32 text-white" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Node Balance</p>
              
              <div className="space-y-8">
                 <div>
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Active AI Credits</h4>
                    <div className="flex items-end space-x-3">
                       <span className="text-6xl font-black text-white leading-none tracking-tighter">{user.credits ?? 0}</span>
                       <Coins className="w-8 h-8 text-amber-500 mb-1" />
                    </div>
                 </div>
                 
                 <div className="h-px bg-white/5" />
                 
                 <div>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Marketplace Revenue</h4>
                    <div className="flex items-end space-x-3">
                       <span className="text-4xl font-black text-white leading-none tracking-tighter">৳{user.revenue?.toFixed(2) || '0.00'}</span>
                       <ArrowUpRight className="w-6 h-6 text-emerald-500 mb-1" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                 <Zap className="w-5 h-5 mr-3 text-amber-500" /> Rapid Recharge
              </h3>
              <div className="space-y-4">
                 <div className="relative">
                    <Coins className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="number" 
                      value={rechargeAmt}
                      onChange={e => setRechargeAmt(e.target.value)}
                      placeholder="Amount" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-black text-white outline-none focus:border-indigo-500/30 transition-all" 
                    />
                 </div>
                 <button 
                  onClick={handleRecharge}
                  disabled={isProcessing || !rechargeAmt}
                  className="w-full py-4 bg-white text-[#020617] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                 >
                   Inject Credits
                 </button>
                 <p className="text-[8px] text-slate-500 text-center font-bold uppercase tracking-widest leading-relaxed">Secured via Srijan Node Encryption Bridge</p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8">
           {activeTab === 'wallet' && (
              <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 min-h-[500px] flex flex-col justify-center animate-in zoom-in-95 duration-500">
                 <div className="text-center max-w-xl mx-auto space-y-8">
                    <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] border border-indigo-500/20 flex items-center justify-center text-indigo-500 mx-auto shadow-2xl">
                       <CreditCard className="w-10 h-10" />
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Your Economic Node</h3>
                       <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed">
                          Credits allow you to use high-fidelity neural models for video, photo, and voice synthesis. Revenue is earned by selling your creative assets in the global marketplace.
                       </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => setActiveTab('plans')} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-indigo-500/50 transition-all text-center group">
                          <Sparkles className="w-6 h-6 text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Upgrade Plan</p>
                       </button>
                       <button onClick={() => setActiveTab('withdraw')} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-emerald-500/50 transition-all text-center group">
                          <ArrowDownLeft className="w-6 h-6 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Withdraw Revenue</p>
                       </button>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'plans' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500 h-full">
               {plans.map(p => (
                 <div key={p.tier} className={`bg-slate-900 border-2 ${user.plan === p.tier ? 'border-indigo-500' : 'border-slate-800'} rounded-[3rem] p-10 flex flex-col group relative overflow-hidden transition-all hover:border-white/10`}>
                    {user.plan === p.tier && (
                      <div className="absolute top-8 right-8 px-4 py-1.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-full tracking-widest animate-pulse">
                         Active Node
                      </div>
                    )}
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{p.tier}</h4>
                    <p className={`text-3xl font-black text-${p.color}-500 mb-8`}>{p.price}</p>
                    
                    <ul className="space-y-4 flex-1">
                       {p.features.map(f => (
                         <li key={f} className="flex items-center text-xs font-bold text-slate-400">
                            <CheckCircle className={`w-4 h-4 mr-3 text-${p.color}-500`} /> {f}
                         </li>
                       ))}
                    </ul>
                    
                    <button 
                      onClick={() => handleBuyPlan(p.tier, parseInt(p.price.replace(/\D/g, '')) || 0)}
                      className={`w-full mt-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        user.plan === p.tier ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-white text-black hover:scale-[1.02] shadow-xl'
                      }`}
                    >
                      {user.plan === p.tier ? 'Current Station' : 'Switch Protocol'}
                    </button>
                 </div>
               ))}
             </div>
           )}

           {activeTab === 'withdraw' && (
             <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 h-full flex flex-col justify-center animate-in slide-in-from-right-4 duration-500">
                 <div className="max-w-lg mx-auto w-full space-y-10">
                    <div className="text-center">
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Revenue Extraction</h3>
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Transfer verified earnings to external bank</p>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Withdrawal Amount (৳)</label>
                          <input 
                            type="number"
                            value={withdrawForm.amount}
                            onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                            placeholder="Min. ৳500" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-xl font-black text-white outline-none focus:border-emerald-500/30 transition-all" 
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Transfer Gateway</label>
                          <div className="grid grid-cols-2 gap-3">
                             {['Bkash', 'Nagad', 'Rocket', 'Bank'].map(method => (
                               <button 
                                 key={method}
                                 onClick={() => setWithdrawForm({ ...withdrawForm, method })}
                                 className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    withdrawForm.method === method ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-white'
                                 }`}
                               >
                                 {method}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Gateway Details</label>
                          <input 
                            value={withdrawForm.details}
                            onChange={e => setWithdrawForm({ ...withdrawForm, details: e.target.value })}
                            placeholder={withdrawForm.method === 'Bank' ? "Bank details (AC, IFC, Branch)" : "Mobile number (e.g. 017...)"}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-emerald-500/30 transition-all" 
                          />
                       </div>

                       <button 
                        onClick={handleWithdraw}
                        disabled={isProcessing || !withdrawForm.amount || !withdrawForm.details}
                        className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-500 transition-all disabled:opacity-50"
                       >
                         {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : "Initiate Withdrawal"}
                       </button>
                       
                       <p className="text-[8px] text-slate-600 text-center font-bold uppercase tracking-widest">Withdrawals take 24-48 hours for manual verification.</p>
                    </div>
                 </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default FinanceStudio;
