
import React, { useState, useRef } from 'react';
import { Cloud, Search, Filter, MoreVertical, HardDrive, FileVideo, FileAudio, FileImage, Download, Trash2, Share2, Lock, Upload, CheckCircle, File } from 'lucide-react';
import { Project, StudioMode } from '../types';

interface CloudStorageProps {
  projects: Project[];
}

const CloudStorage: React.FC<CloudStorageProps> = ({ projects: initialProjects }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = [
    { label: 'Video', icon: FileVideo, count: projects.filter(p => p.type === StudioMode.VIDEO).length, color: 'text-rose-400' },
    { label: 'Audio', icon: FileAudio, count: projects.filter(p => p.type === StudioMode.AUDIOBOOK).length, color: 'text-emerald-400' },
    { label: 'Visuals', icon: FileImage, count: projects.filter(p => p.type === StudioMode.PHOTO || p.type === StudioMode.PAINT).length, color: 'text-blue-400' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newProjects: Project[] = [];
    // Fix: Explicitly type the forEach parameter as File to resolve property access errors on unknown type
    Array.from(files).forEach((file: File) => {
      const type = file.type.startsWith('video') ? StudioMode.VIDEO : 
                   file.type.startsWith('image') ? StudioMode.PHOTO : 
                   file.type.startsWith('audio') ? StudioMode.AUDIOBOOK : StudioMode.OFFICE;

      const newProject: Project = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        name: file.name,
        type: type,
        thumbnail: file.type.startsWith('image') ? URL.createObjectURL(file) : 'https://api.dicebear.com/7.x/initials/svg?seed=' + file.name,
        updatedAt: Date.now(),
        status: 'draft',
        data: { url: URL.createObjectURL(file) },
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        fileType: file.type
      };
      newProjects.push(newProject);
    });

    setProjects(prev => [...newProjects, ...prev]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleDownload = (p: Project) => {
    // In a real app, this would use the real file URL
    const link = document.createElement('a');
    link.href = p.thumbnail; // Mocking download using thumbnail URL
    link.download = p.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      {showToast && (
        <div className="fixed top-24 right-10 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] flex items-center animate-in slide-in-from-right duration-300">
          <CheckCircle className="w-5 h-5 mr-3" />
          <span className="font-bold uppercase tracking-widest text-[10px]">Files Uploaded Successfully</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter flex items-center">
            <Cloud className="w-8 h-8 mr-4 text-blue-500" />
            SECURE CLOUD DRIVE
          </h2>
          <p className="text-slate-400 mt-2 font-medium flex items-center">
            <Lock className="w-3 h-3 mr-2" /> End-to-end encrypted asset management.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1">
            <button onClick={() => setView('grid')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>Grid</button>
            <button onClick={() => setView('list')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>List</button>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" /> Upload Asset
          </button>
          <input type="file" ref={fileInputRef} multiple onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-xl">
            <div className="flex items-center">
              <div className={`p-4 rounded-2xl bg-slate-800/50 mr-4 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black leading-none">{s.count}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{s.label} Files</p>
              </div>
            </div>
            <div className="h-10 w-1 bg-slate-800 rounded-full" />
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-6">
            <h3 className="text-lg font-black tracking-tight">Active Files</h3>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input placeholder="Search files..." className="bg-slate-800/50 border border-slate-700 rounded-2xl py-2 pl-10 pr-4 text-xs focus:outline-none w-64 text-white" />
            </div>
            <button className="p-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-slate-500 hover:text-white"><Filter className="w-5 h-5" /></button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.length > 0 ? projects.map(p => (
              <div key={p.id} className="group bg-slate-800/20 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/5">
                <div className="aspect-square relative overflow-hidden bg-slate-800">
                  {p.thumbnail.startsWith('https://api.dicebear.com') ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-950/40">
                      <File className="w-12 h-12 text-slate-700" />
                    </div>
                  ) : (
                    <img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" alt="" />
                  )}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all flex space-x-1">
                    <button className="p-2 bg-black/60 rounded-xl text-white hover:bg-blue-600 transition-colors"><Share2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-black/60 rounded-xl text-white hover:bg-rose-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                        {p.type}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm font-black truncate text-white">{p.name}</p>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-[10px] text-slate-500 font-mono">{p.fileSize || '---'}</p>
                    <button onClick={() => handleDownload(p)} className="text-blue-400 hover:text-blue-300 transition-colors"><Download className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )) : (
              <EmptyState onClick={() => fileInputRef.current?.click()} />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                      <th className="pb-4 px-4">Name</th>
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Size</th>
                      <th className="pb-4">Updated</th>
                      <th className="pb-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                   {projects.map(p => (
                     <tr key={p.id} className="group hover:bg-white/5 transition-all">
                        <td className="py-4 px-4">
                           <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                 {p.type === StudioMode.VIDEO ? <FileVideo className="w-4 h-4 text-rose-400" /> : 
                                  p.type === StudioMode.PHOTO ? <FileImage className="w-4 h-4 text-blue-400" /> : <File className="w-4 h-4 text-slate-400" />}
                              </div>
                              <span className="text-sm font-bold text-slate-200">{p.name}</span>
                           </div>
                        </td>
                        <td className="py-4 text-xs font-black uppercase text-slate-500">{p.type}</td>
                        <td className="py-4 text-xs font-mono text-slate-400">{p.fileSize || '---'}</td>
                        <td className="py-4 text-xs text-slate-500">{new Date(p.updatedAt).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                           <div className="flex items-center justify-end space-x-2">
                              <button onClick={() => handleDownload(p)} className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-lg"><Download className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-rose-600/20 text-rose-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ onClick }: { onClick: () => void }) => (
  <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-800/10">
    <Cloud className="w-16 h-16 text-slate-700 mb-6" />
    <h4 className="text-lg font-black text-slate-500">Cloud Drive Empty</h4>
    <p className="text-sm text-slate-600 mt-1 text-center">Start creating to sync your assets automatically<br/>or upload files from your device.</p>
    <button onClick={onClick} className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">Upload Now</button>
  </div>
);

export default CloudStorage;
