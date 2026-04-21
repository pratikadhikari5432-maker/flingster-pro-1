
import React, { useState, useEffect } from 'react';
import { 
  Github, Search, Globe, Rocket, GitBranch, ShieldCheck, 
  RefreshCw, ExternalLink, Code, Database, Terminal,
  Plus, AlertCircle, CheckCircle, ArrowRight, GitCommit
} from 'lucide-react';
import { UserProfile } from '../types';
import axios from 'axios';

interface GitHubManagerProps {
  user: UserProfile;
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  default_branch: string;
  updated_at: string;
  language: string;
}

const GitHubManager: React.FC<GitHubManagerProps> = ({ user }) => {
  const [token, setToken] = useState(() => localStorage.getItem('pm_github_token') || '');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRepos = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const githubToken = token.trim();
      const response = await axios.get('/api/github/repos', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('pm_token') || ''}`,
          'X-GitHub-Token': githubToken 
        }
      });
      setRepos(response.data);
      localStorage.setItem('pm_github_token', githubToken);
      setToken(githubToken); // Update state to trimmed version
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reach GitHub matrix.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRepos();
  }, []);

  const handleDeploy = async (repo: Repo) => {
    setIsDeploying(repo.id);
    try {
      const session = JSON.parse(localStorage.getItem('pm_session') || '{}');
      const response = await axios.post('/api/github/deploy', {
        owner: repo.full_name.split('/')[0],
        repo: repo.name,
        branch: repo.default_branch,
        platform: 'Industrial Cluster-Alpha'
      }, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('pm_token') || ''}`
        }
      });
      setSuccess(response.data.message);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError("Protcol failure during deployment handshake.");
    } finally {
      setIsDeploying(null);
    }
  };

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-emerald-400">
             <Github className="w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">GitHub Deployment Gateway</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter uppercase leading-none">
            Code <span className="text-indigo-500">Node</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Synchronize Repositories & Deploy Industrial Builds</p>
        </div>
        
        {!repos.length && (
          <div className="w-full max-w-md bg-slate-900/60 border border-white/5 rounded-[2rem] p-6 shadow-2xl space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GitHub Personal Access Token</label>
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                <input 
                  type="password" 
                  value={token} 
                  onChange={e => setToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-800" 
                  placeholder="ghp_xxxxxxxxxxxx"
                />
              </div>
              <button 
                onClick={fetchRepos}
                disabled={isLoading || !token}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg flex items-center"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-[2rem] text-rose-500 text-xs font-black uppercase flex items-center animate-in shake">
          <AlertCircle className="w-5 h-5 mr-4" /> {error}
        </div>
      )}

      {success && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] text-emerald-500 text-xs font-black uppercase flex items-center animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 mr-4" /> {success}
        </div>
      )}

      {/* Main Repository Matrix */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 shadow-[0_0_80px_rgba(0,0,0,0.4)] space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center">
             <Database className="w-8 h-8 mr-4 text-indigo-400" /> Repository Cluster
          </h3>
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all uppercase placeholder:text-slate-800"
              placeholder="Query Module Name..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRepos.length > 0 ? filteredRepos.map(repo => (
            <div key={repo.id} className="group bg-black/40 border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                  <Github className="w-24 h-24 text-white" />
               </div>
               
               <div>
                  <div className="flex items-center space-x-3 mb-6">
                     <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500">
                        <Code className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{repo.language || 'Code Node'}</span>
                  </div>
                  
                  <h4 className="text-xl font-black text-white uppercase tracking-tight mb-3 truncate pr-10">{repo.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest line-clamp-2 h-10">
                    {repo.description || "Experimental Industrial Development Node."}
                  </p>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                     <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center space-x-2">
                        <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">{repo.default_branch}</span>
                     </div>
                     <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center space-x-2">
                        <GitCommit className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">{new Date(repo.updated_at).toLocaleDateString()}</span>
                     </div>
                  </div>
               </div>

               <div className="mt-10 flex items-center space-x-3">
                  <button 
                    onClick={() => handleDeploy(repo)}
                    disabled={isDeploying !== null}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center group/btn"
                  >
                    {isDeploying === repo.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                      <>
                        <Rocket className="w-4 h-4 mr-2 group-hover/btn:-translate-y-1 transition-transform" />
                        Initialize Deploy
                      </>
                    )}
                  </button>
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-4 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all border border-white/5"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
               </div>
            </div>
          )) : isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-900/60 animate-pulse rounded-[3rem] border border-white/5" />
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] bg-black/20">
               <Github className="w-20 h-20 text-slate-800 mb-8" />
               <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No active repositories detected in matrix.</p>
               {!token && <p className="text-slate-700 text-[10px] font-bold uppercase mt-2">Uplink required via Personal Access Token.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Deployment Status Section */}
      <div className="bg-slate-900/60 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-10">
            <Globe className="w-40 h-40" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4">
               <h3 className="text-xl font-black uppercase tracking-tighter flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-emerald-400" /> Cluster Telemetry
               </h3>
               <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                  Industrial Deployment Protocol V10.5 Active.<br />
                  All builds monitored by Neural Security Matrix.
               </p>
            </div>
            <div className="flex items-center space-x-12 px-10 py-6 bg-black/40 rounded-3xl border border-white/5">
                {[
                  { label: 'Latency', val: '12ms', color: 'text-emerald-500' },
                  { label: 'Regions', val: '04', color: 'text-indigo-500' },
                  { label: 'Build Success', val: '99.9%', color: 'text-amber-500' }
                ].map(s => (
                  <div key={s.label} className="text-center">
                     <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{s.label}</p>
                     <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                  </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};

const Activity = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default GitHubManager;
