import React from 'react';
import { ShieldAlert, Phone, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import Button from './Button';

const SoloSafetyHub = ({ trip, contacts = [], onOpenContacts, onOpenTimer }) => {
  const safetyWingUrl = `https://safetywing.com/nomad-insurance/?referenceID=${import.meta.env.VITE_SAFETYWING_ID || ''}`;

  return (
    <div className="glass-card p-8 rounded-xl shadow-xl border border-success/20 bg-gradient-to-br from-white to-emerald-50/30 overflow-hidden relative">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-vibrant/5 rounded-full blur-2xl"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-vibrant/10 flex items-center justify-center text-brand-vibrant">
          <ShieldCheck size={24} />
        </div>
        <h3 className="text-xl font-black text-base-content">Solo Safety Hub</h3>
      </div>

      <div className="space-y-6">
        {/* Insurance Section */}
        <div className="p-4 rounded-xl bg-base-100 border border-success/20 shadow-sm">
          <p className="text-[10px] font-black text-success uppercase tracking-widest mb-2">Protection</p>
          <h4 className="text-sm font-bold text-base-content/80 mb-3">Nomad Insurance recommended for {trip?.country || trip?.destination}.</h4>
          <a 
            href={safetyWingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-vibrant text-white rounded-xl font-black text-xs hover:bg-brand-vibrant/90 transition-all shadow-md shadow-brand-vibrant/20"
          >
            Get Insured with SafetyWing <ExternalLink size={14} />
          </a>
        </div>

        {/* Emergency Contacts Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Emergency Contacts</p>
            <button 
              onClick={onOpenContacts}
              className="text-[10px] font-black text-brand-accent uppercase hover:underline"
            >
              Manage
            </button>
          </div>
          
          {contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.slice(0, 2).map(contact => (
                <div key={contact.id} className="flex items-center gap-3 p-3 rounded-xl bg-base-200 border border-base-300/50">
                  <div className="w-8 h-8 rounded-lg bg-base-100 flex items-center justify-center text-base-content/40 shadow-sm">
                    <Phone size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-base-content/80 leading-tight">{contact.name}</p>
                    <p className="text-[10px] font-medium text-base-content/40">{contact.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-base-300 text-center">
              <p className="text-xs font-bold text-base-content/40 mb-2">No contacts added yet</p>
              <Button size="sm" variant="ghost" onClick={onOpenContacts} className="text-[10px] py-1">Add Contact</Button>
            </div>
          )}
        </div>

        {/* Safe-Return Timer Section */}
        <button 
          onClick={onOpenTimer}
          className="w-full p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between group hover:bg-slate-800 transition-all border border-slate-700 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-base-100/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={20} className="text-brand-vibrant" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-brand-vibrant uppercase tracking-widest leading-none mb-1">Safe-Return</p>
              <h4 className="text-sm font-bold leading-tight">Emergency Timer</h4>
            </div>
          </div>
          <ShieldAlert size={20} className="text-base-content/60 group-hover:text-white transition-colors" />
        </button>

        <p className="text-[10px] text-center text-base-content/40 font-medium leading-relaxed px-2">
          Your timer will alert contacts automatically if you don't check back in.
        </p>
      </div>
    </div>
  );
};

export default SoloSafetyHub;
