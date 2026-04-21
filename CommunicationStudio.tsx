
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Mic, Play, Sparkles, Brain, CheckCircle, Target, Award, 
  ArrowRight, Wand2, Video, Palette, DollarSign, Upload, Search, Star,
  Clock, Share2, MessageCircle, MoreVertical, X, Globe, User, BookOpen,
  Layout, BarChart3, Smartphone, Laptop, Download, ChevronLeft, Maximize2,
  FileVideo, Monitor, MousePointer2
} from 'lucide-react';
import { UserProfile, Course } from '../types';
import { safeJsonStringify } from '../src/utils/safeSerialization';

interface CommunicationStudioProps {
  user: UserProfile;
}

const INITIAL_COURSES: Course[] = [
  { id: 'v1', title: 'Professional Video Editing Masterclass', instructor: 'Sophia (AI)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia', category: 'Video Editing', thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=800', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '12h 45m', rating: 4.9, isUgc: false },
  { id: 'ex1', title: 'MS Excel: Data Visualization & Formulas', instructor: 'David (AI)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', category: 'Office Suite', thumbnail: 'https://images.unsplash.com/photo-1543286386-713bcd534a77?auto=format&fit=crop&q=80&w=800', videoUrl: 'https://www.w3schools.com/html/movie.mp4', duration: '15h 30m', rating: 4.7, isUgc: false },
  { id: 'g1', title: 'Graphics Design: Master the Art of Visuals', instructor: 'Marcus (AI)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', category: 'Graphic Design', thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '8h 20m', rating: 4.8, isUgc: false },
  { id: 'c1', title: 'Persuasive Communication & Soft Skills', instructor: 'Elena (AI)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena', category: 'Communication', thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800', videoUrl: 'https://www.w3schools.com/html/movie.mp4', duration: '6h 15m', rating: 5.0, isUgc: false },
  { id: 'sm1', title: 'Sales & Marketing: Anime Style Strategy Guide', instructor: 'Akira (Anime AI)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=akira', category: 'Marketing', thumbnail: 'https://images.unsplash.com/photo-1560169897-bb0bd96f794a?auto=format&fit=crop&q=80&w=800', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '10h 00m', rating: 4.9, isUgc: true },
];

const CommunicationStudio: React.FC<CommunicationStudioProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'academy' | 'marketplace' | 'my-learning'>('academy');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [uploadData, setUploadData] = useState({ title: '', price: '', category: 'Video Editing' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUgc = localStorage.getItem('srijan_ugc_courses');
    if (savedUgc) {
      setCourses([...INITIAL_COURSES, ...JSON.parse(savedUgc)]);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handlePublishCourse = () => {
    if (!uploadData.title || !selectedFile) {
      alert("Please fill title and select a video file.");
      return;
    }

    const newCourse: Course = {
      id: 'ugc-' + Date.now(),
      title: uploadData.title,
      instructor: user.name,
      avatar: user.avatar,
      category: uploadData.category,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
      videoUrl: URL.createObjectURL(selectedFile),
      duration: 'UGC Content',
      rating: 0,
      price: parseInt(uploadData.price),
      isUgc: true
    };

    const updated = [...courses, newCourse];
    setCourses(updated);
    const onlyUgc = updated.filter(c => c.id.toString().startsWith('ugc-'));
    localStorage.setItem('srijan_ugc_courses', safeJsonStringify(onlyUgc));
    
    setShowUploadModal(false);
    setUploadData({ title: '', price: '', category: 'Video Editing' });
    setSelectedFile(null);
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'marketplace') return matchesSearch && c.isUgc;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-emerald-600/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight uppercase">Srijan Skill Academy</h2>
            <div className="flex space-x-6 mt-2">
               {[
                 { id: 'academy', label: 'AI Academy', icon: Brain },
                 { id: 'marketplace', label: 'UGC Market', icon: Layout },
                 { id: 'my-learning', label: 'My Learning', icon: BookOpen }
               ].map(tab => (
                 <button 
                  key={tab.id} 
                  onClick={() => { setActiveTab(tab.id as any); setSelectedCourse(null); }}
                  className={`flex items-center text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                 >
                   <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                 </button>
               ))}
            </div>
          </div>
        </div>
        {!selectedCourse && (
          <div className="flex space-x-3">
            <div className="relative w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search skills..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase focus:ring-4 focus:ring-emerald-500/10 transition-all" 
               />
            </div>
            <button onClick={() => setShowUploadModal(true)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/20 flex items-center">
              <Upload className="w-4 h-4 mr-2" /> Upload Course
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {selectedCourse ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all mb-4 group"
            >
              <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Academy
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border border-slate-800 group relative">
                  <video 
                    ref={videoRef}
                    src={selectedCourse.videoUrl} 
                    className="w-full aspect-video"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                    autoPlay
                    playsInline
                  />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="p-8 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-600/50">
                          <Play className="w-12 h-12 text-white fill-current" />
                       </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                       <img src={selectedCourse.avatar} className="w-14 h-14 rounded-2xl border border-white/5" alt="" />
                       <div>
                          <p className="text-[10px] font-black uppercase text-emerald-400">{selectedCourse.instructor}</p>
                          <h3 className="text-3xl font-black uppercase tracking-tight text-white">{selectedCourse.title}</h3>
                       </div>
                    </div>
                    <div className="flex items-center space-x-1">
                       {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-amber-400 fill-current' : 'text-slate-800'}`} />)}
                       <span className="text-xs font-black text-slate-500 ml-2 uppercase">{selectedCourse.rating || '5.0'} Rating</span>
                    </div>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-medium text-lg">
                    This module covers advanced synthesis techniques in {selectedCourse.category}. Master the professional workflows used by top creator nodes worldwide. High-fidelity AI instructions combined with practical labs ensure 100% skill retention.
                  </p>
                  <div className="flex items-center space-x-6 pt-4">
                    <button className="flex items-center text-[10px] font-black uppercase text-blue-400 hover:text-white transition-all">
                       <Share2 className="w-4 h-4 mr-2" /> Share Node Progress
                    </button>
                    <button className="flex items-center text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
                       <Download className="w-4 h-4 mr-2" /> Download Project Files
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Course Syllabus</h4>
                   <div className="space-y-4">
                      {[
                        { title: 'Foundations of Synthesis', duration: '12:45', active: true },
                        { title: 'Neural Asset Integration', duration: '24:10', active: false },
                        { title: 'Advanced Production Flow', duration: '18:05', active: false },
                        { title: 'Final Certification Lab', duration: '45:00', active: false }
                      ].map((lesson, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${lesson.active ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}>
                           <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lesson.active ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                 {lesson.active ? <Play className="w-3 h-3 fill-current" /> : (idx + 1)}
                              </div>
                              <span className={`text-[11px] font-bold ${lesson.active ? 'text-white' : 'text-slate-400'}`}>{lesson.title}</span>
                           </div>
                           <span className="text-[9px] font-mono text-slate-500">{lesson.duration}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl">
                   <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Completion Status</h4>
                   <div className="flex items-end justify-between mb-6">
                      <p className="text-4xl font-black tracking-tighter">45%</p>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Node Verified</span>
                   </div>
                   <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-8">
                      <div className="h-full bg-white shadow-[0_0_10px_white]" style={{ width: '45%' }} />
                   </div>
                   <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Get Certification</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <div 
                key={course.id} 
                onClick={() => setSelectedCourse(course)}
                className="group bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/50 transition-all shadow-2xl cursor-pointer relative"
              >
                <div className="aspect-video relative overflow-hidden">
                   <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                   <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{course.category}</div>
                   <div className="absolute bottom-4 left-6 flex items-center space-x-3">
                      <img src={course.avatar} className="w-8 h-8 rounded-lg shadow-xl" alt="" />
                      <span className="text-[10px] font-black text-white uppercase tracking-tight">{course.instructor}</span>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-slate-950 shadow-2xl">
                         <Play className="w-6 h-6 fill-current" />
                      </div>
                   </div>
                </div>
                <div className="p-8">
                   <h4 className="text-sm font-black uppercase leading-tight group-hover:text-emerald-400 transition-colors">{course.title}</h4>
                   <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center text-[10px] font-black text-slate-500 uppercase">
                         <Clock className="w-3.5 h-3.5 mr-2" /> {course.duration}
                      </div>
                      <div className="flex items-center space-x-1">
                         <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                         <span className="text-[10px] font-black text-white">{course.rating || '5.0'}</span>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Course Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setShowUploadModal(false)} className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              <div className="text-center mb-10">
                 <h3 className="text-3xl font-black uppercase tracking-tight">Synthesize New Knowledge</h3>
                 <p className="text-slate-500 mt-2">Publish your course to the UGC Market and earn credits.</p>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course Title</label>
                       <input 
                        value={uploadData.title}
                        onChange={e => setUploadData({...uploadData, title: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white" 
                        placeholder="e.g. Master MS Excel in 10 Days" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price (Credits)</label>
                       <input 
                        value={uploadData.price}
                        onChange={e => setUploadData({...uploadData, price: e.target.value})}
                        type="number" className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white" 
                        placeholder="500" 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Course Category</label>
                    <select 
                        value={uploadData.category}
                        onChange={e => setUploadData({...uploadData, category: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none"
                    >
                        <option>Video Editing</option>
                        <option>Graphic Design</option>
                        <option>Office Suite</option>
                        <option>Communication</option>
                        <option>Marketing</option>
                    </select>
                 </div>
                 
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center hover:border-indigo-500 cursor-pointer transition-all bg-slate-950/20 group"
                 >
                    <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileUpload} />
                    {selectedFile ? (
                        <div className="flex flex-col items-center">
                            <FileVideo className="w-12 h-12 text-indigo-400 mb-2" />
                            <p className="text-xs font-bold text-white">{selectedFile.name}</p>
                            <p className="text-[10px] text-slate-500">{(selectedFile.size / (1024*1024)).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-10 h-10 text-slate-600 mb-3 group-hover:text-indigo-400" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Click or Drop Video Asset</p>
                        </>
                    )}
                 </div>

                 <button 
                    onClick={handlePublishCourse}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all"
                 >
                    Authorize & Publish Course
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationStudio;
