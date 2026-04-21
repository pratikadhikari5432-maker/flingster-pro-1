import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Sparkles, UserPlus, LogIn, Key, AlertCircle, Eye, EyeOff, 
  CheckCircle2, RefreshCw, ShieldCheck, ShieldAlert, Video, Palette, 
  ChevronRight, Zap, ArrowRight, Radio
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../src/services/apiService';
import { db, auth } from '../src/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

import { safeJsonStringify } from '../src/utils/safeSerialization';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'admin'>('login');
  const [loginStep, setLoginStep] = useState<'creds' | 'otp'>('creds');
  const [showPassword, setShowPassword] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const toggleView = (view: 'login' | 'signup' | 'admin') => {
    setAuthView(view);
    setLoginStep('creds');
    setError("");
    setSuccess("");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (loginStep === 'creds') {
        if (authView === 'login' || authView === 'admin') {
          const response = await api.login({ email: formData.email, password: formData.password });
          
          // Bypass Firestore check for Emergency Recovery Account
          const isEmergency = formData.email.toLowerCase() === "prodyutadhikari99@gmail.com" && formData.password === "admin1234";
          
          if (!isEmergency) {
            // Check if user exists in Firestore for regular accounts
            const userDoc = await getDoc(doc(db, 'users', formData.email.toLowerCase()));
            if (!userDoc.exists()) {
              throw new Error("NODE ID NOT INITIALIZED. PLEASE REGISTER IDENTITY.");
            }
          }
          
          setLoginStep('otp');
          const displayOtp = response.otp ? ` YOUR OTP IS: ${response.otp}` : "";
          setSuccess(`OTP CHALLENGE ISSUED.${displayOtp}`);
        } else if (authView === 'signup') {
          await api.signup(formData);
          
          // Create initial Firestore Profile
          const initialUser: UserProfile = {
            email: formData.email.toLowerCase(),
            name: formData.name,
            role: 'User',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || formData.email}`,
            credits: 10,
            plan: 'Individual',
            language: 'en',
            revenue: 0,
            referralCode: Math.random().toString(36).substring(7).toUpperCase(),
            referralCount: 0,
            facebookConnected: false,
            githubConnected: false,
            twitterConnected: false,
            studentVerificationStatus: 'none',
            isApproved: true
          };
          
          await setDoc(doc(db, 'users', initialUser.email), initialUser);
          
          setSuccess("IDENTITY MATRIX CREATED. PROCEEDING TO LOGON.");
          setTimeout(() => {
            toggleView('login');
          }, 2000);
        }
      } else {
        const trimmedOtp = otpValue.trim();
        const response = await api.verifyOtp({ email: formData.email, otp: trimmedOtp });
        
        // Fetch full profile from Firestore (or use emergency mock)
        let userData: UserProfile;
        const isEmergency = formData.email.toLowerCase() === "prodyutadhikari99@gmail.com";
        
        if (isEmergency && response.user) {
          userData = response.user;
        } else {
          const userDoc = await getDoc(doc(db, 'users', formData.email.toLowerCase()));
          if (!userDoc.exists()) throw new Error("PROFILE DATA CORRUPTED");
          userData = userDoc.data() as UserProfile;
        }
        
        const finalUser = authView === 'admin' ? { ...userData, role: 'admin' as any } : userData;
        
        setSuccess("VERIFICATION COMPLETE. UNLOCKING HUB...");
        localStorage.setItem('pm_session', safeJsonStringify(finalUser));
        setTimeout(() => onLogin(finalUser), 1000);
      }
    } catch (err: any) {
      setError(err.message || "AUTHORIZATION FAILED - CHECK NODE STATUS");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 md:p-10 relative overflow-hidden font-sans">
      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] blur-[150px] rounded-full animate-pulse transition-all duration-1000 ${authView === 'admin' ? 'bg-rose-600/30' : 'bg-indigo-600/10'}`} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[150px] rounded-full" />

      <div className="w-full max-w-[1100px] min-h-[700px] grid grid-cols-1 lg:grid-cols-12 bg-slate-900/40 rounded-[3rem] border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-3xl animate-in zoom-in-95 duration-700">
        <div className={`lg:col-span-6 hidden lg:flex flex-col justify-between p-16 relative overflow-hidden transition-all duration-1000 ${authView === 'admin' ? 'bg-rose-950/40' : 'bg-indigo-950/20'}`}>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-12">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xl ring-2 ${authView === 'admin' ? 'bg-rose-600 ring-rose-500/20' : 'bg-indigo-600 ring-indigo-500/20'}`}>
                  {authView === 'admin' ? <ShieldAlert className="w-6 h-6 text-white" /> : <ShieldCheck className="w-6 h-6 text-white" />}
               </div>
               <h1 className="text-2xl font-black tracking-tighter uppercase text-white">P.M Academy</h1>
            </div>

            <div className="animate-in slide-in-from-left duration-500">
               <h2 className="text-5xl font-black text-white leading-tight uppercase tracking-tighter mb-6">
                 {authView === 'admin' ? 'Root Governance' : 'Creative Empire'}
               </h2>
               <p className="text-slate-400 font-medium mb-10 text-lg">
                 {authView === 'admin' 
                   ? 'System-wide control, feature management, and infrastructure monitoring active via Secure OTP API.' 
                   : 'Create 4K videos, neural characters, and professional ads in seconds. All accounts secured by API-OTP.'}
               </p>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center space-x-3">
                     <Video className="w-5 h-5 text-rose-400" />
                     <span className="text-[10px] font-black uppercase text-slate-300">NLE Core</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center space-x-3">
                     <Palette className="w-5 h-5 text-emerald-400" />
                     <span className="text-[10px] font-black uppercase text-slate-300">Rig Hub</span>
                  </div>
               </div>
            </div>
          </div>
          <div className="relative z-10">
             <div className="p-6 bg-black/40 rounded-3xl border border-white/5 backdrop-blur-md">
                <p className="text-white font-bold text-xs">Gateway API: <span className={authView === 'admin' ? 'text-rose-500' : 'text-emerald-500'}>ACTIVE</span></p>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Multi-Skeletal Animation Matrix v10.5</p>
             </div>
          </div>
        </div>

        <div className={`lg:col-span-6 flex flex-col p-10 md:p-16 relative overflow-y-auto custom-scrollbar h-full transition-colors duration-500 ${authView === 'admin' ? 'bg-rose-950/10' : 'bg-slate-950/40'}`}>
          <div className="flex justify-between items-center mb-10">
             <div>
                <h3 className={`text-3xl font-black uppercase tracking-tighter ${authView === 'admin' ? 'text-rose-500' : 'text-white'}`}>
                  {authView === 'admin' ? 'Admin Access' : authView === 'signup' ? 'Create Identity' : 'Sign In'}
                </h3>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Protocol: {authView === 'admin' ? 'ROOT_CONTROL' : 'USER_SESSION'}</p>
             </div>
             {loginStep === 'creds' && (
                <button 
                  onClick={() => toggleView(authView === 'admin' ? 'login' : 'admin')}
                  className={`p-3 rounded-2xl transition-all border shadow-lg group ${authView === 'admin' ? 'bg-rose-600 text-white border-rose-400' : 'bg-rose-950/20 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white'}`}
                  title="Admin Command Center"
                >
                    <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
             )}
          </div>

          {authView !== 'admin' && loginStep === 'creds' && (
            <div className="flex bg-slate-900/80 p-1 rounded-2xl mb-8 border border-white/5">
              <button onClick={() => toggleView('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${authView === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Login</button>
              <button onClick={() => toggleView('signup')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${authView === 'signup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Signup</button>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 text-[10px] font-black uppercase flex items-center animate-in shake">
                <AlertCircle className="w-4 h-4 mr-3" /> {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-black uppercase flex items-center animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" /> 
                <span className="break-all">{success}</span>
              </div>
            )}

            {loginStep === 'creds' ? (
              <div className="space-y-5">
                {authView === 'signup' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none uppercase transition-all" placeholder="IDENT_NAME" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Email ID</label>
                  <div className="relative group">
                    <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${authView === 'admin' ? 'text-rose-700' : 'text-slate-700'}`} />
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:ring-4 outline-none transition-all placeholder:text-slate-800 uppercase ${authView === 'admin' ? 'focus:ring-rose-500/10 focus:border-rose-500/30' : 'focus:ring-indigo-500/10 focus:border-indigo-500/30'}`} placeholder="NODE_UPLINK@STUDIO.IO" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Secure Key</label>
                  <div className="relative group">
                    <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${authView === 'admin' ? 'text-rose-700' : 'text-slate-700'}`} />
                    <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={`w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-14 text-white text-sm font-bold focus:ring-4 outline-none transition-all ${authView === 'admin' ? 'focus:ring-rose-500/10 focus:border-rose-500/30' : 'focus:ring-indigo-500/10 focus:border-indigo-500/30'}`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in zoom-in-95 duration-500">
                 <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
                       <Radio className="w-8 h-8 animate-pulse" />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Security Challenge</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Identity Check active via Secure API Bridge.<br />Enter the code shown above.</p>
                 </div>
                 
                 <div className="relative">
                    <input 
                      required 
                      maxLength={6} 
                      value={otpValue} 
                      onChange={e => setOtpValue(e.target.value)} 
                      className={`w-full bg-slate-950 border border-slate-800 rounded-2xl py-6 text-center text-4xl font-black tracking-[1em] outline-none transition-all ${authView === 'admin' ? 'text-rose-500 focus:border-rose-500/50' : 'text-emerald-500 focus:border-emerald-500/50'} shadow-inner`} 
                      placeholder="••••••" 
                    />
                 </div>

                 <button 
                  type="button" 
                  onClick={() => setLoginStep('creds')}
                  className="w-full text-[9px] font-black uppercase text-slate-600 hover:text-white tracking-widest transition-all"
                 >
                   Reset Handshake
                 </button>
              </div>
            )}

            <button 
              disabled={isSubmitting} 
              className={`w-full py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-xl transition-all flex items-center justify-center group ${authView === 'admin' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
            >
               {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                 <>
                   {loginStep === 'otp' ? 'Finalize Verification' : authView === 'admin' ? 'Request Root Access' : authView === 'login' ? 'Initiate Session' : 'Register Node'}
                   <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                 </>
               )}
            </button>
          </form>

          <div className="mt-auto pt-10 text-center">
             <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Protocol V10.5 Industrial Suite • Secure Cluster 493961</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;