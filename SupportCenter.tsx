
import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Star, 
  MessageSquare, 
  Lightbulb, 
  Search, 
  Send, 
  Sparkles, 
  Brain, 
  ChevronRight, 
  CheckCircle,
  HelpCircle,
  Construction,
  ThumbsUp,
  MessageCircle,
  Wand2,
  // Added Target to fix missing icon error
  Target
} from 'lucide-react';
import { UserProfile } from '../types';
import { GoogleGenAI } from "@google/genai";

interface SupportCenterProps {
  user: UserProfile;
}

const SupportCenter: React.FC<SupportCenterProps> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<'help' | 'feedback' | 'advice'>('help');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [advice, setAdvice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // AI Help State
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiAsk = async () => {
    if (!query) return;
    setIsGenerating(true);
    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as Lumina Creative Studio's support agent. Answer this user question concisely: "${query}". Lumina is an all-in-one suite for video editing (4K, VFX), photo editing (AI filters), paint (character design), ad building (smart templates), and office tools (writer, data hub).`,
      });
      // Extracting Text Output from GenerateContentResponse using .text property
      setAiResponse(response.text);
    } catch (e) {
      setAiResponse("I'm currently recalibrating. Please try asking again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitFeedback = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFeedback("");
      setRating(0);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleSubmitAdvice = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setAdvice("");
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const faqs = [
    { q: "How do I export 4K video?", a: "Go to Video Editor, click 'Export MP4', and ensure your plan supports 4K rendering." },
    { q: "Can I use AI to paint characters?", a: "Yes! Use the Paint Studio and enter a prompt in the dream bar to generate concept art." },
    { q: "Where are my cloud files?", a: "Access 'Cloud Storage' from the sidebar to view all synced assets and projects." },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center uppercase">
            <LifeBuoy className="w-8 h-8 mr-4 text-cyan-500" />
            Support & Community
          </h2>
          <p className="text-slate-400 mt-2 font-medium">Get help, rate your experience, and shape the future of Lumina Studio.</p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-inner">
          {[
            { id: 'help', label: 'Smart Help', icon: HelpCircle },
            { id: 'feedback', label: 'Feedback', icon: Star },
            { id: 'advice', label: 'Dev Advice', icon: Lightbulb }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex items-center px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeSection === section.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                : 'text-slate-500 hover:text-white'
              }`}
            >
              <section.icon className="w-4 h-4 mr-2" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Main UI */}
        <div className="lg:col-span-8">
          {activeSection === 'help' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Brain className="w-32 h-32 text-white" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center mb-6">
                  <Sparkles className="w-5 h-5 mr-3 text-amber-400" />
                  Studio AI Assistant
                </h3>
                <div className="relative">
                  <input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiAsk()}
                    placeholder="Ask me anything: 'How to use smart ad builder?' or 'Reset my password'..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-6 px-8 text-slate-100 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-700 transition-all pr-20"
                  />
                  <button 
                    onClick={handleAiAsk}
                    disabled={isGenerating || !query}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-blue-600 rounded-2xl text-white shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? <Wand2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  </button>
                </div>

                {aiResponse && (
                  <div className="mt-8 p-8 bg-blue-600/5 border border-blue-500/20 rounded-3xl animate-in slide-in-from-top-4">
                    <div className="flex items-center space-x-3 mb-4">
                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                       <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Assistant Response</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-medium">{aiResponse}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Common Solutions</h4>
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <div key={i} className="group p-4 bg-slate-800/40 rounded-2xl border border-transparent hover:border-slate-700 transition-all cursor-pointer">
                        <p className="text-xs font-black text-slate-200 mb-1 flex items-center justify-between">
                          {faq.q}
                          <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">Direct Assistance</h4>
                    <p className="text-xl font-black mb-6">Need a Human touch? Our expert team is live.</p>
                    <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Start Live Chat</button>
                    <p className="text-[9px] font-bold text-center mt-4 opacity-50 uppercase tracking-tighter">Avg Response: 2 Minutes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'feedback' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-10">
              <div className="text-center">
                <h3 className="text-2xl font-black uppercase tracking-tight">Rate Your Experience</h3>
                <p className="text-slate-500 text-sm mt-2">How would you describe your workflow with Lumina Studio?</p>
                <div className="flex items-center justify-center space-x-4 mt-8">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className="p-2 transition-all hover:scale-125"
                    >
                      <Star className={`w-12 h-12 ${rating >= star ? 'text-amber-400 fill-current drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-slate-800'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detailed Feedback</h4>
                 <textarea 
                   value={feedback}
                   onChange={(e) => setFeedback(e.target.value)}
                   placeholder="Tell us what you love or what we can improve..."
                   className="w-full h-40 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-slate-100 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none transition-all placeholder:italic"
                 />
              </div>

              <button 
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !feedback || rating === 0}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {isSubmitting ? <span className="flex items-center"><Construction className="w-4 h-4 mr-2 animate-spin" /> Processing...</span> : "Submit Global Feedback"}
              </button>
            </div>
          )}

          {activeSection === 'advice' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-5">
                  <Construction className="w-64 h-64 text-white" />
               </div>
               
               <div className="flex items-center space-x-6 mb-4">
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-emerald-400 shadow-xl">
                    <Lightbulb className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Development Advice</h3>
                    <p className="text-slate-500 text-sm mt-1">Found a bug? Have a killer feature idea? Help us build the future.</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Suggestion Box</h4>
                     <textarea 
                       value={advice}
                       onChange={(e) => setAdvice(e.target.value)}
                       placeholder="E.g., 'Add a 3D animation mode', 'Better multi-language TTS voices'..."
                       className="w-full h-48 bg-transparent border-none focus:outline-none text-lg text-slate-200 placeholder:text-slate-800 resize-none font-medium leading-relaxed"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center p-6 bg-slate-800/40 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all group">
                       <Construction className="w-6 h-6 mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Report Bug</span>
                    </button>
                    <button className="flex flex-col items-center p-6 bg-slate-800/40 rounded-2xl border border-slate-700 hover:border-amber-500 transition-all group">
                       <Target className="w-6 h-6 mb-3 text-amber-500 group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest">New Feature</span>
                    </button>
                  </div>

                  <button 
                    onClick={handleSubmitAdvice}
                    disabled={isSubmitting || !advice}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 disabled:opacity-50 transition-all"
                  >
                    Send to Engineering Team
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Right Column: Status & Community */}
        <div className="lg:col-span-4 space-y-8">
           {showSuccess && (
             <div className="bg-emerald-500 text-white p-6 rounded-[2rem] shadow-2xl flex items-center animate-in slide-in-from-top duration-300">
                <CheckCircle className="w-8 h-8 mr-4 shrink-0" />
                <div>
                  <p className="font-black uppercase tracking-widest text-[10px]">Transmission Success</p>
                  <p className="text-xs font-medium">Your input has been synced to the cloud.</p>
                </div>
             </div>
           )}

           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Development Roadmap</h4>
              <div className="space-y-6">
                 {[
                   { title: 'VFX Motion Tracking', status: 'In Development', progress: 65, color: 'bg-blue-500' },
                   { title: 'Collaboration Live', status: 'Planning', progress: 15, color: 'bg-indigo-500' },
                   { title: 'Offline Mode', status: 'Testing', progress: 90, color: 'bg-emerald-500' }
                 ].map((task, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-black text-slate-200">{task.title}</p>
                        <span className="text-[9px] font-black text-slate-500 uppercase">{task.status}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                         <div 
                          className={`h-full ${task.color} transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]`} 
                          style={{ width: `${task.progress}%` }} 
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Recent Community Activity</h4>
              <div className="space-y-6">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                         <img src={`https://picsum.photos/seed/comm${i}/32/32`} alt="" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-300">Designer Node #{i*12}</p>
                         <p className="text-[10px] text-slate-500 font-medium italic mt-1 line-clamp-2">"Loving the new Smart Ad builder! Could we add more fonts?"</p>
                         <div className="flex items-center space-x-4 mt-2">
                            <button className="flex items-center text-[8px] font-black uppercase text-blue-400 hover:text-white transition-colors">
                               <ThumbsUp className="w-2.5 h-2.5 mr-1" /> 24
                            </button>
                            <button className="flex items-center text-[8px] font-black uppercase text-slate-600 hover:text-white transition-colors">
                               <MessageCircle className="w-2.5 h-2.5 mr-1" /> Reply
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all border border-slate-700">
                Join Community Forum
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
