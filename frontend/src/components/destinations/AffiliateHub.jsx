import React from 'react';
import { Globe, MapPin, ShieldAlert, ShoppingBag, Utensils, Plane } from 'lucide-react';

const AffiliateHub = ({ destination }) => {
  const city = destination?.city || destination?.name || '';
  const country = destination?.country || '';

  // Use Vite environment variables for affiliate IDs
  const agodaId = import.meta.env.VITE_AGODA_PUBLISHER_ID || '-1';
  const viatorPid = import.meta.env.VITE_VIATOR_PID || '';
  const safetyWingId = import.meta.env.VITE_SAFETYWING_ID || '';
  const amazonTag = import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'solocompass-21';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-5 rounded-2xl bg-base-100 border border-base-300/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-vibrant/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-vibrant/10 transition-colors duration-500" />
        
        <p className="text-[10px] font-black text-brand-vibrant uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
          <Globe size={12} /> Strategic Bookings
        </p>
        <h3 className="font-black text-base-content text-lg mb-2">Verified Solo Travel Partners</h3>
        <p className="text-xs text-base-content/60 font-bold leading-relaxed mb-6">
          We've vetted these tools specifically for solo safety and logistics in {city}.
        </p>

        <div className="flex flex-col gap-3">
          {/* Agoda - Accommodations */}
          <a 
            href={`https://www.agoda.com/pages/agodausers/DearchSearchRC.aspx?searchcode=${encodeURIComponent(city)}&CID=${agodaId}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#003580] hover:bg-[#00224f] text-white rounded-xl font-black text-center transition-all shadow-lg flex items-center justify-center gap-3 group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-base-100/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            <Globe size={18} className="group-hover/btn:rotate-12 transition-transform" />
            <span>Book Verified Hotels on Agoda</span>
          </a>

          {/* Viator - Tours */}
          <a 
            href={`https://www.viator.com/search?q=solo%20friendly%20tours&location=${encodeURIComponent(city)}&pid=${viatorPid}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#ff5900] hover:bg-[#e65000] text-white rounded-xl font-black text-center transition-all shadow-lg flex items-center justify-center gap-3 group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-base-100/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            <MapPin size={18} className="group-hover/btn:scale-110 transition-transform" />
            <span>Find Safe Tours on Viator</span>
          </a>

          {/* SafetyWing - Insurance */}
          <a 
            href={`https://safetywing.com/nomad-insurance/?referenceID=${safetyWingId}&campaign=solocompass-dest`}
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-4 bg-success/100 hover:bg-emerald-600 text-white rounded-xl font-black text-center transition-all shadow-lg flex items-center justify-center gap-3 group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-base-100/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            <ShieldAlert size={18} className="group-hover/btn:animate-pulse" />
            <span>SafetyWing Nomad Insurance</span>
          </a>
        </div>
      </div>

      {/* Secondary Links Card */}
      <div className="grid grid-cols-2 gap-3">
        <a 
          href={`https://www.amazon.com/s?k=solo+travel+essentials&tag=${amazonTag}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-base-200 border border-base-300 rounded-xl hover:border-brand-vibrant hover:bg-base-100 transition-all group"
        >
          <ShoppingBag size={20} className="text-base-content/40 group-hover:text-brand-vibrant mb-2 transition-colors" />
          <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mb-1">Gear</p>
          <p className="text-xs font-black text-base-content">Packing Essentials</p>
        </a>

        <a 
          href={`https://www.aviasales.com/flights/?destination=${encodeURIComponent(city)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-base-200 border border-base-300 rounded-xl hover:border-brand-vibrant hover:bg-base-100 transition-all group"
        >
          <Plane size={20} className="text-base-content/40 group-hover:text-brand-vibrant mb-2 transition-colors" />
          <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mb-1">Travel</p>
          <p className="text-xs font-black text-base-content">Best Flight Prices</p>
        </a>
      </div>
    </div>
  );
};

export default AffiliateHub;
