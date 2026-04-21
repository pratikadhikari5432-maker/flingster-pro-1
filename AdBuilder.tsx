
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Megaphone, ShoppingBag, Wand2, Sparkles, Layout, Download, Save, 
  CheckCircle, RefreshCw, Store, QrCode, CreditCard, Award, 
  FileStack, Image as ImgIcon, Upload, Languages, Monitor, 
  FileText, Smartphone, Type, Trash2, ArrowRight
} from 'lucide-react';
import { Project, StudioMode, MarketingAssetType } from '../types';
import { GeminiService } from '../src/services/geminiService';

interface AdBuilderProps {
  onSave: (project: Project) => void;
}

const AdBuilder: React.FC<AdBuilderProps> = ({ onSave }) => {
  const location = useLocation();
  const [assetType, setAssetType] = useState<MarketingAssetType>('ad');
  const [selectedCategory, setSelectedCategory] = useState('E-Commerce');
  const [theme, setTheme] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const [campaign, setCampaign] = useState({
    headline: "Professional Brand Identity",
    description: "AI-Synthesized marketing asset for your business.",
    ctas: ["Visit Now", "Contact Us"],
    image: "https://picsum.photos/seed/brand-studio/800/800",
  });

  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Read template data if navigated from Template Hub
    const state = location.state as { templateData?: any, isTemplate?: boolean };
    if (state?.isTemplate && state.templateData) {
      if (state.templateData.category) setSelectedCategory(state.templateData.category);
      if (state.templateData.theme) setTheme(`${state.templateData.theme} marketing style`);
      // Default to Social Ad for templates unless specific
      setAssetType('ad');
    }
  }, [location.state]);

  const getPreviewConfig = (type: MarketingAssetType) => {
    switch(type) {
      case 'poster':
      case 'flyer':
        return { aspect: "9:16", class: 'aspect-[9/16] h-[600px]' };
      case 'web_banner':
      case 'business_card':
      case 'certificate':
      case 'invitation':
        return { aspect: "16:9", class: 'aspect-[16/9] w-full max-w-[700px]' };
      default:
        return { aspect: "1:1", class: 'aspect-square h-[480px]' };
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReferenceImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!theme && assetType !== 'qr_code') return;
    if (assetType === 'qr_code' && !qrValue) return;

    setIsGenerating(true);
    const gemini = GeminiService.getInstance();
    const config = getPreviewConfig(assetType);
    
    try {
      let visualPrompt = "";
      if (assetType === 'qr_code') {
        visualPrompt = `A functional, scannable, high-contrast QR code for the content: "${qrValue}". Design it as a professional branding element for a ${selectedCategory} company. Minimalist, clean white background, centered.`;
      } else if (assetType === 'logo') {
        visualPrompt = `A high-end professional vector logo. Brand Name: ${theme}. Category: ${selectedCategory}. Minimalist, elegant, high contrast, solid background, luxury commercial feel.`;
      } else if (assetType === 'business_card') {
        visualPrompt = `The front of a professional business card for: ${theme}. Business Category: ${selectedCategory}. Clean modern typography, corporate layout, high resolution 4k.`;
      } else if (assetType === 'certificate') {
        visualPrompt = `A formal award certificate for: ${theme}. Category: ${selectedCategory}. Elegant borders, classical professional typography, high-end diploma style.`;
      } else {
        visualPrompt = `A high-impact professional ${assetType} graphic for a ${selectedCategory} brand. Theme: ${theme}. Sharp commercial design, perfect typography, vibrant colors, 4k render.`;
      }

      if (referenceImage) {
        visualPrompt += " Use the uploaded image as a primary brand style and color reference.";
      }

      const [campaignData, visual] = await Promise.all([
        assetType === 'qr_code' 
          ? Promise.resolve({ headline: "Branded QR Code", description: `Direct access for: ${qrValue}`, ctas: ["Download QR"] })
          : gemini.generateAdCampaign(theme, `${selectedCategory} ${assetType}`),
        gemini.generateImage(visualPrompt, config.aspect as any, referenceImage || undefined)
      ]);

      setCampaign({ 
        ...campaignData, 
        image: visual || campaign.image 
      });
    } catch (err) {
      console.error("Marketing generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const assetTypes: {id: MarketingAssetType, label: string, icon: any}[] = [
    { id: 'ad', label: 'Social Ad', icon: Megaphone },
    { id: 'logo', label: 'Logo', icon: Type },
    { id: 'poster', label: 'Poster', icon: ImgIcon },
    { id: 'flyer', label: 'Flyer', icon: FileStack },
    { id: 'invitation', label: 'Invitation', icon: Wand2 },
    { id: 'business_card', label: 'Business Card', icon: CreditCard },
    { id: 'certificate', label: 'Certificate', icon: Award },
    { id: 'web_banner', label: 'Web Banner', icon: Monitor },
    { id: 'qr_code', label: 'QR Generator', icon: QrCode },
  ];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = campaign.image;
    link.download = `ourstudio-${assetType}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center uppercase">
            <ShoppingBag className="w-8 h-8 mr-4 text-indigo-500" /> Marketing Omni-Studio
          </h2>
          <p className="text-slate-400 mt-2 font-medium italic">Professional branding & ad synthesizer for growing businesses.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleDownload} className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-[10px] font-black uppercase text-slate-100 flex items-center">
            <Download className="w-4 h-4 mr-2" /> Download Asset
          </button>
          <button 
            onClick={() => {
              onSave({ id: Date.now().toString(), name: campaign.headline, type: StudioMode.AD_BUILDER, thumbnail: campaign.image, updatedAt: Date.now(), status: 'draft', data: { ...campaign, assetType } });
              setShowSaved(true);
              setTimeout(() => setShowSaved(false), 3000);
            }} 
            className="px-8 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase text-white shadow-xl hover:bg-blue-500 transition-all"
          >
            Sync to Studio
          </button>
        </div>
      </div>

      {showSaved && (
        <div className="fixed top-20 right-10 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-right">
          <CheckCircle className="w-5 h-5 mr-3 inline" />
          <span className="font-bold uppercase tracking-widest text-xs ml-2">Asset Published!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center">
              <Layout className="w-4 h-4 mr-2 text-blue-400" /> Choose Asset Format
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {assetTypes.map(type => (
                <button 
                  key={type.id} 
                  onClick={() => setAssetType(type.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${assetType === type.id ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                >
                  <type.icon className="w-5 h-5 mb-1.5" />
                  <span className="text-[7px] font-black uppercase leading-tight text-center">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center">
              <Store className="w-4 h-4 mr-2 text-emerald-400" /> Shop Settings
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {['E-Commerce', 'Corporate', 'Restaurant', 'Creative'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {assetType === 'qr_code' ? (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                   <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Target URL or Data</label>
                    <input 
                      value={qrValue}
                      onChange={(e) => setQrValue(e.target.value)}
                      placeholder="https://myshop.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-700"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Thematic Details</label>
                    <textarea 
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder={`Describe your ${assetType.replace('_', ' ')}: Brand name, style, main message...`}
                      className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder:text-slate-700"
                    />
                  </div>
                  
                  {referenceImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 h-24 group">
                      <img src={referenceImage} className="w-full h-full object-cover" alt="Ref" />
                      <button 
                        onClick={() => setReferenceImage(null)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-rose-500 font-black text-[9px] uppercase"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Ref
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => uploadRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500 transition-all bg-slate-950/20 group"
                    >
                      <Upload className="w-5 h-5 text-slate-600 mb-2 group-hover:text-blue-500" />
                      <span className="text-[8px] font-black uppercase text-slate-600">Style Reference (Optional)</span>
                    </button>
                  )}
                  <input type="file" ref={uploadRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || (assetType === 'qr_code' ? !qrValue : !theme)}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-[10px] font-black uppercase text-white shadow-xl shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center transition-all active:scale-95"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <Sparkles className="w-4 h-4 mr-3" />}
                Generate {assetType.replace('_', ' ')}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center relative min-h-[600px] shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <Languages className="w-48 h-48 text-white" />
          </div>

          <div className={`relative bg-white rounded-[1.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 ${getPreviewConfig(assetType).class}`}>
            <img 
              src={campaign.image} 
              className={`w-full h-full object-cover transition-opacity duration-700 ${isGenerating ? 'opacity-30' : 'opacity-100'}`} 
              alt="Preview" 
            />
            
            {assetType !== 'qr_code' && assetType !== 'logo' && (
              <div className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-black via-black/60 to-transparent">
                <h4 className="text-3xl font-black text-white leading-tight mb-2">{campaign.headline}</h4>
                <p className="text-xs text-slate-300 font-medium line-clamp-2">{campaign.description}</p>
                <div className="flex space-x-2 mt-4">
                  {campaign.ctas.map(cta => (
                    <button key={cta} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase flex items-center">
                      {cta} <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-sm z-10">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
                <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse text-center">Lumina Engine<br/>Synthesizing Brand Asset...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBuilder;
