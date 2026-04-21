
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, FileText, Save, Printer, RotateCcw, ShieldCheck, 
  PenTool, FileEdit, Folder, Upload, FileType, RefreshCw, Download, 
  CheckCircle, FileImage, FileOutput, Table as TableIcon, AlignLeft, 
  Bold, Italic, List, Type, Image as ImgIcon, Plus, Search
} from 'lucide-react';
import { UserProfile, StudioMode, Project } from '../types';
import { safeJsonStringify } from '../src/utils/safeSerialization';

interface OfficeSuiteProps {
  user: UserProfile;
  onSave: (project: Project) => void;
}

interface SavedDoc {
  id: string;
  title: string;
  content: string;
  type: 'word' | 'excel' | 'esign' | 'converter';
  updatedAt: number;
  signature?: string;
  gridData?: string[][];
}

const OfficeSuite: React.FC<OfficeSuiteProps> = ({ user, onSave }) => {
  const [activeTab, setActiveTab] = useState<'word' | 'excel' | 'esign' | 'converter'>('word');
  const [docContent, setDocContent] = useState("");
  const [docTitle, setDocTitle] = useState("Professional Document");
  const [gridData, setGridData] = useState<string[][]>(Array(20).fill(0).map(() => Array(10).fill("")));
  const [isSaving, setIsSaving] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  
  // Converter State
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [convertProgress, setConvertProgress] = useState(0);
  const [targetFormat, setTargetFormat] = useState<'PDF' | 'JPG' | 'PNG'>('PDF');

  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>(() => {
    const saved = localStorage.getItem('srijan_office_docs');
    return saved ? JSON.parse(saved) : [];
  });

  const sigInputRef = useRef<HTMLInputElement>(null);
  const convertInputRef = useRef<HTMLInputElement>(null);
  const uploadDocRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('srijan_office_docs', safeJsonStringify(savedDocs));
  }, [savedDocs]);

  const handleSave = () => {
    setIsSaving(true);
    const newDoc: SavedDoc = {
      id: Date.now().toString(),
      title: docTitle,
      content: docContent,
      type: activeTab,
      updatedAt: Date.now(),
      signature: signature || undefined,
      gridData: activeTab === 'excel' ? gridData : undefined
    };
    
    setSavedDocs(prev => [newDoc, ...prev.filter(d => d.title !== docTitle)].slice(0, 10));
    
    onSave({
      id: newDoc.id,
      name: docTitle,
      type: StudioMode.OFFICE,
      thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=300&h=200',
      updatedAt: Date.now(),
      status: 'draft',
      data: { content: docContent, type: activeTab, gridData: newDoc.gridData, isSigned, signature }
    });
    
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleConversion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsConverting(true);
      setConvertProgress(0);
      const interval = setInterval(() => {
        setConvertProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setConvertedFile(`https://picsum.photos/seed/${targetFormat}/1200/1600`);
            setIsConverting(false);
            return 100;
          }
          return p + 5;
        });
      }, 80);
    }
  };

  const updateCell = (r: number, c: number, val: string) => {
    const next = [...gridData];
    next[r] = [...next[r]];
    next[r][c] = val;
    setGridData(next);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase">Srijan Office Master</h2>
            <p className="text-slate-400 mt-1 font-medium italic">Enterprise Grade Document Synthesizer</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => window.print()} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase text-slate-100 border border-slate-700"><Printer className="w-4 h-4 mr-2" /> Print File</button>
          <button onClick={handleSave} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Sync Cloud
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[75vh]">
        <div className="lg:w-80 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl">
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl mb-6">
              {[
                { id: 'word', label: 'Word', icon: FileText },
                { id: 'excel', label: 'Excel', icon: TableIcon },
                { id: 'esign', label: 'eSign', icon: PenTool },
                { id: 'converter', label: 'Convert', icon: FileType }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 min-w-[70px] py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <t.icon className="w-3.5 h-3.5 mx-auto mb-1" />
                  {t.label}
                </button>
              ))}
            </div>
            
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <Folder className="w-4 h-4 mr-3 text-indigo-400" /> Recent Works
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {savedDocs.filter(d => d.type === activeTab).map(doc => (
                <button key={doc.id} onClick={() => { setDocContent(doc.content); setDocTitle(doc.title); if (doc.gridData) setGridData(doc.gridData); }} className="w-full text-left p-3 bg-slate-800/40 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white truncate">
                  {doc.title}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center"><Upload className="w-4 h-4 mr-3 text-emerald-400" /> Actions</h3>
              <button onClick={() => uploadDocRef.current?.click()} className="w-full py-4 bg-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-300 border border-slate-700 hover:bg-slate-750 transition-all flex items-center justify-center">
                <Upload className="w-4 h-4 mr-2" /> Upload External
              </button>
              <input type="file" ref={uploadDocRef} className="hidden" accept=".docx,.xlsx,.pdf" />
              
              {activeTab === 'word' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                     <button className="flex-1 p-3 bg-slate-950 rounded-xl text-slate-400 hover:text-white"><Bold className="w-4 h-4 mx-auto" /></button>
                     <button className="flex-1 p-3 bg-slate-950 rounded-xl text-slate-400 hover:text-white"><Italic className="w-4 h-4 mx-auto" /></button>
                     <button className="flex-1 p-3 bg-slate-950 rounded-xl text-slate-400 hover:text-white"><List className="w-4 h-4 mx-auto" /></button>
                  </div>
                  <button className="w-full py-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[9px] font-black uppercase flex items-center justify-center">
                     <ImgIcon className="w-3.5 h-3.5 mr-2" /> Insert AI Image
                  </button>
                </div>
              )}
          </div>

          {activeTab === 'esign' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl space-y-4 animate-in fade-in">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center"><ShieldCheck className="w-4 h-4 mr-3 text-emerald-400" /> Identity Kit</h3>
              <button onClick={() => sigInputRef.current?.click()} className="w-full py-10 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center hover:border-indigo-500 transition-all bg-slate-950/20 group">
                {signature ? <img src={signature} className="h-12 object-contain" alt="" /> : (
                  <>
                    <PenTool className="w-6 h-6 text-slate-600 group-hover:text-indigo-400 mb-2" />
                    <span className="text-[8px] font-black uppercase text-slate-600">Import Signature</span>
                  </>
                )}
              </button>
              <input type="file" ref={sigInputRef} className="hidden" accept="image/*" onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   const reader = new FileReader();
                   reader.onload = (ev) => setSignature(ev.target?.result as string);
                   reader.readAsDataURL(file);
                 }
              }} />
              <button onClick={() => setIsSigned(true)} disabled={!signature} className="w-full py-4 bg-emerald-600 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg disabled:opacity-50">Apply Identity</button>
              <button onClick={() => setIsSigned(false)} className="w-full py-2 text-[8px] font-black uppercase text-slate-600 hover:text-white tracking-widest">Clear Sign</button>
            </div>
          )}

          {activeTab === 'converter' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center"><FileType className="w-4 h-4 mr-3 text-blue-400" /> Omni-Convert</h3>
              
              <div className="space-y-2">
                 <label className="text-[8px] font-black text-slate-600 uppercase">Target Format</label>
                 <div className="flex bg-slate-950 p-1 rounded-xl">
                    {['PDF', 'JPG', 'PNG'].map(fmt => (
                      <button 
                        key={fmt} 
                        onClick={() => setTargetFormat(fmt as any)}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black ${targetFormat === fmt ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                      >
                        {fmt}
                      </button>
                    ))}
                 </div>
              </div>

              <div 
                onClick={() => convertInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/20 group"
              >
                <Upload className="w-6 h-6 text-slate-600 mb-2 group-hover:text-blue-500" />
                <p className="text-[8px] font-black text-slate-500 uppercase">Select File</p>
              </div>
              <input type="file" ref={convertInputRef} className="hidden" onChange={handleConversion} accept=".pdf,.docx,.xlsx,.png,.jpg" />
              
              {isConverting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black uppercase"><span className="text-blue-400 animate-pulse">Converting...</span><span>{convertProgress}%</span></div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all" style={{ width: `${convertProgress}%` }} /></div>
                </div>
              )}

              {convertedFile && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-in zoom-in-95">
                   <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[8px] font-black uppercase text-emerald-400">Ready for Download</span>
                   </div>
                   <button className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center">
                     <Download className="w-3 h-3 mr-2" /> Download {targetFormat}
                   </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
          <div className="h-14 bg-slate-50 border-b border-slate-200 flex items-center px-8 justify-between">
             <div className="flex items-center space-x-4">
               <FileEdit className="w-4 h-4 text-slate-400" />
               <input value={docTitle} onChange={e => setDocTitle(e.target.value)} className="bg-transparent border-none text-slate-800 text-xs font-black uppercase focus:outline-none w-64" />
             </div>
             <div className="flex items-center space-x-3">
               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${activeTab === 'word' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                 Srijan {activeTab === 'word' ? 'Word' : activeTab === 'excel' ? 'Sheets' : 'Studio'}
               </span>
             </div>
          </div>

          <div className="flex-1 bg-slate-100 p-10 overflow-auto custom-scrollbar-light">
             {activeTab === 'excel' ? (
                <div className="bg-white min-w-[1000px] border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                   <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                          <th className="w-10 border-r border-b border-slate-200 p-2 text-center">#</th>
                          {['A','B','C','D','E','F','G','H','I','J'].map(l => (
                            <th key={l} className="border-r border-b border-slate-200 p-2 text-center">{l}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {gridData.map((row, r) => (
                          <tr key={r} className="hover:bg-blue-50/30">
                            <td className="bg-slate-50 text-[9px] font-black text-slate-400 border-r border-b border-slate-200 p-2 text-center">{r+1}</td>
                            {row.map((cell, c) => (
                              <td key={c} className="border-r border-b border-slate-200 p-0">
                                <input 
                                  value={cell} 
                                  onChange={e => updateCell(r, c, e.target.value)}
                                  className="w-full h-full p-2 text-[11px] font-medium text-slate-800 focus:bg-blue-50 focus:outline-none border-none" 
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             ) : (
               <div className="max-w-[816px] mx-auto bg-white min-h-[1056px] shadow-lg p-20 relative">
                  {activeTab === 'converter' && convertedFile ? (
                     <div className="w-full h-full flex flex-col items-center justify-center space-y-6 opacity-30">
                        <FileImage className="w-32 h-32 text-slate-300" />
                        <p className="text-xl font-black uppercase text-slate-300">File Snapshot Preview</p>
                     </div>
                  ) : (
                    <textarea 
                      value={docContent}
                      onChange={e => setDocContent(e.target.value)}
                      placeholder="Begin synthesis of professional content..."
                      className="w-full h-full min-h-[800px] border-none focus:outline-none text-slate-800 text-lg leading-relaxed font-serif bg-transparent"
                    />
                  )}
                  
                  {activeTab === 'esign' && isSigned && signature && (
                    <div className="absolute bottom-40 right-20 p-6 border-2 border-emerald-500/30 rounded-[2rem] bg-emerald-50/40 backdrop-blur-sm animate-in zoom-in-95">
                      <img src={signature} className="h-14 object-contain" alt="Signature" />
                      <div className="mt-3 text-center">
                        <p className="text-[8px] font-black uppercase text-emerald-600">Digitally Authenticated</p>
                        <p className="text-[7px] text-slate-400 font-mono mt-1">{user.email}</p>
                        <p className="text-[7px] text-slate-400 font-mono">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeSuite;
