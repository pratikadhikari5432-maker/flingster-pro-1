
import React, { useState } from 'react';
import { 
  DollarSign, Cpu, MessageSquare, Heart, Briefcase, 
  ShieldCheck, HelpCircle, Brain, TrendingUp, BookOpen,
  CheckCircle, ArrowRight, Play, FileText, Activity
} from 'lucide-react';
import { StudioMode } from '../types';

interface SkillModule {
  id: StudioMode;
  title: string;
  description: string;
  icon: any;
  steps: string[];
  color: string;
}

const modules: Record<string, SkillModule> = {
  [StudioMode.FINANCE]: {
    id: StudioMode.FINANCE,
    title: "Money & Finance",
    description: "Master your personal economy and build wealth.",
    icon: DollarSign,
    steps: ["Learn budget theory", "Create your own monthly budget", "Track expenses daily"],
    color: "from-emerald-500 to-teal-600"
  },
  [StudioMode.TECH_SKILLS]: {
    id: StudioMode.TECH_SKILLS,
    title: "Digital & Tech Skills",
    description: "Stay ahead in the digital age with essential tech tools.",
    icon: Cpu,
    steps: ["Learn basic tools", "Practice on real tasks", "Complete digital exercises"],
    color: "from-blue-500 to-indigo-600"
  },
  [StudioMode.COMMUNICATION_SKILLS]: {
    id: StudioMode.COMMUNICATION_SKILLS,
    title: "Communication",
    description: "Speak with confidence and influence others.",
    icon: MessageSquare,
    steps: ["Learn speaking basics", "Practice daily speaking", "Record & improve"],
    color: "from-orange-500 to-rose-600"
  },
  [StudioMode.LIFE_SKILLS]: {
    id: StudioMode.LIFE_SKILLS,
    title: "Life Skills",
    description: "Essential skills for navigating adult life successfully.",
    icon: BookOpen,
    steps: ["Understand concept", "Apply in daily routine", "Review results"],
    color: "from-purple-500 to-fuchsia-600"
  },
  [StudioMode.HEALTH]: {
    id: StudioMode.HEALTH,
    title: "Health & Wellness",
    description: "Optimize your physical and mental well-being.",
    icon: Heart,
    steps: ["Learn healthy habits", "Follow daily routine", "Track fitness & mind"],
    color: "from-rose-500 to-pink-600"
  },
  [StudioMode.CAREER]: {
    id: StudioMode.CAREER,
    title: "Career & Skills",
    description: "Build a career you love with the right skill set.",
    icon: Briefcase,
    steps: ["Explore career options", "Choose skill", "Build real project"],
    color: "from-amber-500 to-orange-600"
  },
  [StudioMode.LEGAL]: {
    id: StudioMode.LEGAL,
    title: "Legal & Safety",
    description: "Know your rights and stay safe in any situation.",
    icon: ShieldCheck,
    steps: ["Learn rules", "Identify real-life risks", "Apply safety steps"],
    color: "from-slate-600 to-slate-800"
  },
  [StudioMode.QUIZ]: {
    id: StudioMode.QUIZ,
    title: "Practice & Quiz",
    description: "Test your knowledge and sharpen your mind.",
    icon: HelpCircle,
    steps: ["Learn topic", "Solve questions", "Check performance"],
    color: "from-cyan-500 to-blue-600"
  },
  [StudioMode.AI_LEARNING]: {
    id: StudioMode.AI_LEARNING,
    title: "AI & Smart Learning",
    description: "Harness the power of AI to boost your productivity.",
    icon: Brain,
    steps: ["Understand AI", "Use tools", "Improve productivity"],
    color: "from-violet-500 to-purple-600"
  },
  [StudioMode.PROGRESS]: {
    id: StudioMode.PROGRESS,
    title: "Progress System",
    description: "Track your growth and celebrate your achievements.",
    icon: TrendingUp,
    steps: ["Learn", "Practice", "Test", "Track improvement"],
    color: "from-emerald-400 to-emerald-600"
  }
};

interface SkillsHubProps {
  mode: StudioMode;
}

const SkillsHub: React.FC<SkillsHubProps> = ({ mode }) => {
  const module = modules[mode];
  const [activeStep, setActiveStep] = useState(0);

  if (!module) return <div className="p-20 text-center text-slate-500">Module not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-2xl shadow-indigo-500/20`}>
            <module.icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase">{module.title}</h2>
          <p className="text-slate-400 text-xl font-medium max-w-2xl">{module.description}</p>
        </div>
        
        <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6">
           <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Completion</p>
              <p className="text-3xl font-black text-white">{(activeStep / module.steps.length * 100).toFixed(0)}%</p>
           </div>
           <div className="w-px h-12 bg-white/10" />
           <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Streak</p>
              <p className="text-3xl font-black text-emerald-500">12 Days</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
           <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-white/5 rounded-full" />
              
              <div className="space-y-12">
                 {module.steps.map((step, index) => (
                    <div key={index} className={`relative pl-20 group transition-all ${index > activeStep ? 'opacity-40 grayscale' : ''}`}>
                       <div className={`absolute left-0 w-16 h-16 rounded-2xl flex items-center justify-center border-4 border-[#020617] transition-all z-10 ${
                          index < activeStep ? 'bg-emerald-500 text-white' : 
                          index === activeStep ? `bg-gradient-to-br ${module.color} text-white scale-110 shadow-xl` : 
                          'bg-slate-800 text-slate-500'
                       }`}>
                          {index < activeStep ? <CheckCircle className="w-8 h-8" /> : <span className="text-xl font-black">{index + 1}</span>}
                       </div>
                       
                       <div className={`p-8 rounded-[2rem] border transition-all ${
                          index === activeStep ? 'bg-slate-900 border-white/10 shadow-2xl' : 'bg-transparent border-transparent'
                       }`}>
                          <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{step}</h4>
                          <p className="text-slate-400 mb-8 leading-relaxed">
                             {index === 0 ? "Master the fundamental theories and concepts required for this stage. Our AI-driven curriculum adapts to your learning pace." : 
                              index === 1 ? "Apply what you've learned in a controlled, practical environment. Real-world scenarios help solidify your understanding." : 
                              "Finalize your mastery by tracking your daily performance and making necessary adjustments for long-term success."}
                          </p>
                          
                          {index === activeStep && (
                             <div className="flex flex-wrap gap-4">
                                <button onClick={() => setActiveStep(prev => Math.min(module.steps.length, prev + 1))} className="px-8 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all">
                                   Start Task <ArrowRight className="w-4 h-4" />
                                </button>
                                <button className="px-8 py-4 bg-white/5 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all">
                                   <Play className="w-4 h-4" /> Watch Tutorial
                                </button>
                             </div>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                 <Activity className="w-5 h-5 text-indigo-500" /> Resources
              </h3>
              <div className="space-y-4">
                 <button className="w-full p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition-all group">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                       <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document</p>
                       <p className="text-xs font-bold text-white">Module Overview.pdf</p>
                    </div>
                 </button>
                 <button className="w-full p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition-all group">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                       <Play className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Video</p>
                       <p className="text-xs font-bold text-white">Practical Guide.mp4</p>
                    </div>
                 </button>
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Brain className="w-24 h-24" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">AI Assistant</h4>
              <p className="text-xl font-black mb-8 leading-tight">Need help with this module? Ask our AI tutor for guidance.</p>
              <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">Open AI Tutor</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsHub;
