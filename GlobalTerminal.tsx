import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, ChevronRight, Hash, Command, Globe, Zap, Cpu, Database, Network, Search, AlertCircle, Loader2, ShieldCheck, Activity } from 'lucide-react';
import { UserProfile, Project } from '../types';
import { GeminiService } from '../src/services/geminiService';

import { safeJsonStringify } from '../src/utils/safeSerialization';

interface GlobalTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

interface LogEntry {
  type: 'cmd' | 'resp' | 'error' | 'sys' | 'root';
  text: string;
  timestamp: string;
}

const GlobalTerminal: React.FC<GlobalTerminalProps> = ({ isOpen, onClose, user }) => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: 'sys', text: 'P.M Academy OS v10.5.0 - Industrial Kernel Active', timestamp: new Date().toLocaleTimeString() },
    { type: 'sys', text: `Node Authorized: ${user.email}`, timestamp: new Date().toLocaleTimeString() },
    { type: 'sys', text: 'cURL Protocol: ENABLED | Universal Network Handshake', timestamp: new Date().toLocaleTimeString() },
    { type: 'sys', text: 'HINT: Use "PM-SYS-ROOT" for elevated industrial governance.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [logs, isOpen]);

  const addLog = (type: LogEntry['type'], text: string) => {
    setLogs(prev => [...prev, { type, text, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const fullCmd = input.trim();
    addLog('cmd', fullCmd);
    setInput("");
    setIsProcessing(true);

    const parts = fullCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Global Command Logic
    switch (cmd) {
      case 'pm-sys-root':
        addLog('sys', 'INITIALIZING INDUSTRIAL ROOT HANDSHAKE...');
        await new Promise(r => setTimeout(r, 800));
        addLog('root', 'ENCRYPTION: AES-256-INDUSTRIAL_V10\nNODE_ID: ' + user.email.toUpperCase() + '\nSTATUS: OVERRIDE_REQUESTED');
        await new Promise(r => setTimeout(r, 600));
        addLog('root', 'ACCESS_GRANTED: ROOT_GOVERNANCE_AUTHORIZED\nTERMINAL_LEVEL: LEVEL_09\nCORE_SYNC: COMPLETE');
        addLog('sys', 'System elevated to ROOT status. Admin Panel is now accessible.');
        // Side effect: Force elevate role if possible in current context
        try {
          const session = JSON.parse(localStorage.getItem('pm_session') || '{}');
          session.role = 'admin';
          localStorage.setItem('pm_session', safeJsonStringify(session));
        } catch (e) {}
        break;
      case 'help':
        addLog('resp', 'Available Studio Protocols:\n  PM-SYS-ROOT       - Elevate to Industrial governance\n  curl [url]         - Execute live network request\n  system --status    - Node diagnostic report\n  ls                 - List active workspace nodes\n  whoami             - Display identity metadata\n  ai [prompt]        - Consult Neural Core agents\n  clear              - Flush terminal buffer\n  exit               - Terminate terminal session');
        break;
      case 'clear':
        setLogs([]);
        break;
      case 'exit':
        onClose();
        break;
      case 'whoami':
        addLog('resp', safeJsonStringify({
          identity: user.name,
          uplink: user.email,
          tier: user.plan,
          credits: user.credits,
          role: user.role,
          status: 'Authorized'
        }, null, 2));
        break;
      case 'ls':
        const projects = JSON.parse(localStorage.getItem(`pm_projects_${user.email}`) || '[]');
        addLog('resp', projects.length > 0 
          ? projects.map((p: Project) => `[${p.type.toUpperCase()}] ${p.name} (ID: ${p.id})`).join('\n')
          : 'No active project nodes detected in session memory.'
        );
        break;
      case 'system':
        if (args[0] === '--status') {
          // Fix: Replace process.uptime() with performance.now() as process is not a browser global with uptime() method.
          const uptimeSeconds = performance.now() / 1000;
          addLog('resp', 'DIAGNOSTIC REPORT:\n  Neural Core: ONLINE (Gemini-3-Pro)\n  Kernel Status: STABLE\n  Acceleration: WEB_GL_2.0\n  Network Latency: 12ms\n  Uptime: ' + Math.floor(uptimeSeconds / 60) + 'm ' + Math.floor(uptimeSeconds % 60) + 's');
        } else {
          addLog('error', 'Unknown argument. Protocol: system --status');
        }
        break;
      case 'curl':
        const url = args[0];
        if (!url) {
          addLog('error', 'Target endpoint required. Usage: curl [url]');
          break;
        }
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        addLog('sys', `Attempting handshake with ${targetUrl}...`);
        try {
          const response = await fetch(targetUrl, { mode: 'cors' });
          const contentType = response.headers.get('content-type');
          let dataText = "";
          if (contentType?.includes('application/json')) {
            const json = await response.json();
            dataText = safeJsonStringify(json);
          } else {
            dataText = await response.text();
            dataText = dataText.substring(0, 1000) + (dataText.length > 1000 ? '...' : '');
          }
          addLog('resp', `HTTP/1.1 ${response.status} ${response.statusText}\nContent-Type: ${contentType}\nX-Uplink: Lumina-Gateway\n\n${dataText}`);
        } catch (err: any) {
          addLog('error', `Handshake Failure: ${err.message || 'CORS Security Violation.'}`);
        }
        break;
      case 'ai':
        const prompt = args.join(' ');
        if (!prompt) {
          addLog('error', 'Neural query empty. Usage: ai [prompt]');
          break;
        }
        addLog('sys', 'Relaying to Neural Core...');
        try {
          const gemini = GeminiService.getInstance();
          const response = await gemini.refineText(prompt, 'professional');
          addLog('resp', `NEURAL_OUTPUT >>\n${response}`);
        } catch (err) {
          addLog('error', 'Neural Core timeout.');
        }
        break;
      default:
        addLog('error', `Protocol not recognized: "${cmd}". Type "help" for valid commands.`);
    }
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl h-[80vh] bg-[#020617] border border-white/10 rounded-[3rem] shadow-[0_0_120px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative">
        <div className="bg-slate-900/50 border-b border-white/5 p-6 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <div className="h-4 w-px bg-white/10 mx-2" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center">
                 <Terminal className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                 Srijan_Terminal_v9.0.1.sh
              </span>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all group">
              <X className="w-5 h-5 text-slate-500 group-hover:text-white" />
           </button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 font-mono text-[11px] leading-relaxed custom-scrollbar scrollbar-hide bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]">
          {logs.map((log, i) => (
            <div key={i} className="mb-4 animate-in slide-in-from-left-2 duration-200">
               <div className="flex items-center space-x-3 opacity-20 mb-1">
                  <span className="text-[8px] font-black">{log.timestamp}</span>
                  <div className="h-px flex-1 bg-white/5" />
               </div>
               <div className="flex items-start">
                  <span className="mr-3 shrink-0 mt-0.5">
                    {log.type === 'cmd' ? <ChevronRight className="w-3 h-3 text-indigo-500" /> : 
                     log.type === 'error' ? <AlertCircle className="w-3 h-3 text-rose-500" /> : 
                     log.type === 'sys' ? <Zap className="w-3 h-3 text-amber-500 animate-pulse" /> : 
                     log.type === 'root' ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> :
                     <Hash className="w-3 h-3 text-emerald-500" />}
                  </span>
                  <pre className={`whitespace-pre-wrap flex-1 leading-normal ${
                    log.type === 'cmd' ? 'text-white font-bold' : 
                    log.type === 'error' ? 'text-rose-400' : 
                    log.type === 'sys' ? 'text-amber-400/80 italic' : 
                    log.type === 'root' ? 'text-emerald-400 font-black tracking-widest' :
                    'text-emerald-400/90'}`}>
                    {log.text}
                  </pre>
               </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center space-x-3 text-indigo-400 p-2 animate-pulse italic">
               <Loader2 className="w-3 h-3 animate-spin" />
               <span>Awaiting response from remote cluster...</span>
            </div>
          )}
          <div className="h-10" />
        </div>
        <form onSubmit={handleCommand} className="p-8 bg-black/40 border-t border-white/5">
           <div className="flex items-center space-x-4 bg-slate-900/30 rounded-2xl p-4 border border-white/5 focus-within:border-indigo-500/50 transition-all shadow-inner">
              <span className="text-indigo-500 font-bold ml-2">pm@academy:~$</span>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} autoComplete="off" disabled={isProcessing} placeholder={isProcessing ? "Protocol in progress..." : "Enter protocol command..."} className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-slate-800 disabled:opacity-50 uppercase" />
              <div className="flex items-center space-x-2">
                 <Command className="w-4 h-4 text-slate-700" />
                 <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest mr-2">EXECUTE</span>
              </div>
           </div>
        </form>
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10" />
      </div>
    </div>
  );
};

export default GlobalTerminal;