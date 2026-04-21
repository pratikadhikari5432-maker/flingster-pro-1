
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingBag, Star, Book, Tag, Package, ArrowRight, CheckCircle, Search, User, Filter, AlertCircle, Sparkles, Zap, Coins, Upload, X, Image as ImageIcon } from 'lucide-react';
import { UserProfile, MarketplaceProduct, StudioMode, Project } from '../types';

interface ShopProps {
  user: UserProfile;
}

import { safeJsonStringify } from '../src/utils/safeSerialization';

const Shop: React.FC<ShopProps> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [globalProducts, setGlobalProducts] = useState<MarketplaceProduct[]>([]);
  const [purchaseToast, setPurchaseToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  
  const [publishForm, setPublishForm] = useState({
    projectId: '',
    price: '',
    category: 'assets',
    description: ''
  });

  const loadMarket = () => {
    const saved = localStorage.getItem('srijan_global_market');
    if (saved) {
      setGlobalProducts(JSON.parse(saved));
    } else {
      const defaults: MarketplaceProduct[] = [
        { id: 'p1', sellerEmail: 'admin@srijan.com', sellerName: 'Srijan Official', name: 'AI Creative Bible', category: 'books', price: 1200, thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600', type: StudioMode.OFFICE, rating: 5, salesCount: 450, description: 'The ultimate guide to neural creation.', createdAt: Date.now() },
        { id: 'p2', sellerEmail: 'admin@srijan.com', sellerName: 'Srijan Official', name: 'Ultra UI Kit 2025', category: 'assets', price: 3500, thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=600', type: StudioMode.PHOTO, rating: 4.8, salesCount: 890, description: 'Enterprise UI components.', createdAt: Date.now() },
      ];
      localStorage.setItem('srijan_global_market', safeJsonStringify(defaults));
      setGlobalProducts(defaults);
    }

    const projects = localStorage.getItem(`srijan_projects_${user.email}`);
    if (projects) setMyProjects(JSON.parse(projects));
  };

  useEffect(() => {
    loadMarket();
  }, [user.email]);

  const handlePurchase = (product: MarketplaceProduct) => {
    if (product.sellerEmail === user.email) {
        alert("You cannot purchase your own asset.");
        return;
    }

    if ((user.credits || 0) < product.price) {
      setPurchaseToast({ show: true, msg: 'Insufficient credits! Node upgrade required.' });
      setTimeout(() => setPurchaseToast({ show: false, msg: '' }), 3000);
      return;
    }

    if (window.confirm(`Authorize purchase of ${product.name} for ${product.price} Credits?`)) {
      // 1. Buyer credits
      const session = JSON.parse(localStorage.getItem('srijan_session') || '{}');
      const updatedUser = { ...session, credits: session.credits - product.price };
      localStorage.setItem('srijan_session', safeJsonStringify(updatedUser));
      
      // 2. Seller revenue
      const allUsers = JSON.parse(localStorage.getItem('srijan_users') || '[]');
      const updatedUsers = allUsers.map((u: any) => {
        if (u.email === product.sellerEmail) {
          const newRev = (u.revenue || 0) + (product.price * 0.8); // 80% to seller
          return { ...u, revenue: newRev };
        }
        if (u.email === user.email) return updatedUser;
        return u;
      });
      localStorage.setItem('srijan_users', safeJsonStringify(updatedUsers));

      // 3. Stats
      const updatedProducts = globalProducts.map(p => p.id === product.id ? { ...p, salesCount: p.salesCount + 1 } : p);
      localStorage.setItem('srijan_global_market', safeJsonStringify(updatedProducts));
      setGlobalProducts(updatedProducts);

      setPurchaseToast({ show: true, msg: 'Protocol complete! Asset added to storage.' });
      setTimeout(() => {
          setPurchaseToast({ show: false, msg: '' });
          window.location.reload();
      }, 2000);
    }
  };

  const handlePublish = () => {
    const project = myProjects.find(p => p.id === publishForm.projectId);
    if (!project || !publishForm.price) return;

    const newProduct: MarketplaceProduct = {
      id: 'mkt-' + Date.now(),
      sellerEmail: user.email,
      sellerName: user.name,
      name: project.name,
      category: publishForm.category,
      price: parseInt(publishForm.price),
      thumbnail: project.thumbnail,
      type: project.type,
      rating: 0,
      salesCount: 0,
      description: publishForm.description || `High-quality ${project.type} asset.`,
      createdAt: Date.now()
    };

      const updated = [newProduct, ...globalProducts];
      localStorage.setItem('srijan_global_market', safeJsonStringify(updated));
      setGlobalProducts(updated);
    setShowPublishModal(false);
    setPublishForm({ projectId: '', price: '', category: 'assets', description: '' });
    alert("Asset successfully published to global marketplace!");
  };

  const filtered = useMemo(() => {
    return globalProducts.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [globalProducts, activeCategory, searchQuery]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12 max-w-7xl mx-auto">
      {purchaseToast.show && (
        <div className={`fixed top-24 right-10 px-8 py-4 rounded-2xl shadow-2xl z-[120] flex items-center animate-in slide-in-from-right duration-300 ${purchaseToast.msg.includes('Insufficient') ? 'bg-rose-600' : 'bg-emerald-600'} text-white`}>
          {purchaseToast.msg.includes('Insufficient') ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
          <span className="font-bold uppercase tracking-widest text-[10px]">{purchaseToast.msg}</span>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setShowPublishModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center">
                <Upload className="w-6 h-6 mr-3 text-indigo-400" /> Publish Your Work
              </h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Select Project</label>
                    <select 
                        value={publishForm.projectId}
                        onChange={e => setPublishForm({...publishForm, projectId: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="">Choose an active project...</option>
                        {myProjects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Category</label>
                        <select 
                            value={publishForm.category}
                            onChange={e => setPublishForm({...publishForm, category: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none"
                        >
                            <option value="assets">Assets</option>
                            <option value="templates">Templates</option>
                            <option value="books">Digital Book</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Price (Credits)</label>
                        <input 
                            value={publishForm.price}
                            onChange={e => setPublishForm({...publishForm, price: e.target.value})}
                            type="number" placeholder="1000" className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none" 
                        />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Short Description</label>
                    <textarea 
                        value={publishForm.description}
                        onChange={e => setPublishForm({...publishForm, description: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white h-24 resize-none" 
                        placeholder="Explain why this asset is useful..."
                    />
                 </div>
                 <button 
                    onClick={handlePublish}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all"
                 >
                    Initiate Listing
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="relative h-80 rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-950 to-black" />
        <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform duration-1000">
           <ShoppingBag className="w-96 h-96 text-white" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center px-16 max-w-2xl">
           <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Universal Digital Exchange</span>
           </div>
           <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-6 uppercase">Srijan <span className="text-indigo-500">Market</span></h2>
           <p className="text-slate-400 text-lg font-medium leading-relaxed">The professional hub for verified neural assets, templates, and high-fidelity creative content.</p>
           <div className="mt-10 flex items-center space-x-4">
              <button 
                onClick={() => setShowPublishModal(true)}
                className="px-8 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" /> Publish Asset
              </button>
              <div className="px-6 py-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Live Inventory: {globalProducts.length}</div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-[2rem] shadow-2xl overflow-x-auto max-w-full scrollbar-hide">
          {['all', 'books', 'assets', 'templates'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Universal' : cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-[1.5rem] py-4 pl-14 pr-6 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-white" 
            placeholder="Search Global Market..." 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
        {filtered.map(product => (
          <div key={product.id} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] overflow-hidden group hover:border-indigo-500/50 transition-all shadow-2xl relative flex flex-col">
            <div className="aspect-[4/5] relative overflow-hidden bg-slate-800">
               <img src={product.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt="" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="absolute top-4 left-4">
                 <span className="px-4 py-1.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-full shadow-xl tracking-widest">{product.category}</span>
               </div>
               <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                  <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                     <User className="w-3 h-3 text-indigo-400" />
                     <span className="text-[9px] font-black text-white uppercase truncate max-w-[100px]">{product.sellerName}</span>
                  </div>
               </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
               <div className="flex items-center space-x-1 mb-3">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'text-amber-400 fill-current' : 'text-slate-800'}`} />
                 ))}
                 <span className="text-[10px] text-slate-500 font-black ml-2 uppercase">({product.salesCount} Sales)</span>
               </div>
               <h4 className="text-lg font-black text-slate-100 uppercase tracking-tight line-clamp-2 leading-tight">{product.name}</h4>
               <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 italic">{product.description}</p>
               
               <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-800">
                 <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Protocol Value</p>
                    <p className="text-2xl font-black text-indigo-400 flex items-center">
                       {product.price} <Coins className="w-4 h-4 ml-2" />
                    </p>
                 </div>
                 <button 
                  onClick={() => handlePurchase(product)}
                  className="p-5 bg-slate-800 hover:bg-indigo-600 rounded-[1.5rem] text-slate-400 hover:text-white transition-all border border-slate-700 shadow-xl group/btn"
                 >
                    <ShoppingBag className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                 </button>
               </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[4rem] bg-slate-900/40">
             <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800 mb-6 shadow-xl text-slate-600"><Search className="w-10 h-10" /></div>
             <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No assets detected in current sector.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
