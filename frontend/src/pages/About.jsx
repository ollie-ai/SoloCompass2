import { Compass, Shield, Zap, Lock, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="min-h-screen bg-base-200 pt-20 pb-16">
      <SEO title="About SoloCompass" description="SoloCompass exists to help solo travellers plan with more confidence, more clarity, and less stress." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-vibrant to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-vibrant/20">
            <Compass size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-base-content mb-4">About SoloCompass</h1>
          <p className="text-lg text-base-content/60 max-w-2xl mx-auto leading-relaxed">
            SoloCompass exists to help solo travellers plan with more confidence, more clarity, and less stress.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-base-100 rounded-2xl p-8 shadow-sm border border-base-300/50 mb-8">
          <h2 className="text-2xl font-black text-base-content mb-4">Our mission</h2>
          <p className="text-base-content/80 leading-relaxed mb-4">
            Solo travel is growing — but the tools available to solo travellers haven't kept up. Most travel apps assume you're travelling with someone. SoloCompass was built to change that.
          </p>
          <p className="text-base-content/80 leading-relaxed">
            We combine practical AI itinerary planning with a safety layer that keeps you connected to the people who matter. Not gimmicks — real tools that help you plan better and travel with more confidence.
          </p>
        </div>

        {/* Principles */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-base-content mb-6 text-center">What guides everything we build</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Compass, title: 'Solo-first by design', desc: 'Every feature is built for solo travellers. No group travel assumptions, no compromises.' },
              { icon: Shield, title: 'Safety built into workflow', desc: 'Safety isn\'t a separate tab — it\'s part of planning your trip from the start.' },
              { icon: Zap, title: 'Practical AI, not gimmicks', desc: 'Our AI helps you plan itineraries and answer destination questions. It doesn\'t replace your judgement.' },
              { icon: Lock, title: 'Privacy and user control', desc: 'You control your data. Export or delete it at any time. We don\'t sell your information.' },
            ].map((value) => {
              const Icon = value.icon;
              return (
                <div key={`value-${value.title}`} className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300/50">
                  <div className="w-12 h-12 rounded-xl bg-brand-vibrant/10 text-brand-vibrant flex items-center justify-center mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-black text-base-content mb-2">{value.title}</h3>
                  <p className="text-sm text-base-content/60 leading-relaxed">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Who we are */}
        <div className="bg-base-100 rounded-2xl p-8 shadow-sm border border-base-300/50 mb-8">
          <h2 className="text-2xl font-black text-base-content mb-4">Who we are</h2>
          <p className="text-base-content/80 leading-relaxed mb-4">
            SoloCompass is built by a small team of travellers and engineers based in the United Kingdom. We've all experienced the unique challenges of travelling alone — from planning logistics to staying safe in unfamiliar places.
          </p>
          <p className="text-base-content/80 leading-relaxed">
            We're not a large company with a marketing department. We're builders who care about making solo travel more accessible and less stressful. If you have feedback, we read every message.
          </p>
        </div>

        {/* What we're building */}
        <div className="bg-base-100 rounded-2xl p-8 shadow-sm border border-base-300/50 mb-8">
          <h2 className="text-2xl font-black text-base-content mb-4">What SoloCompass is building</h2>
          <div className="space-y-4">
            {[
              { status: 'Live', title: 'AI Itinerary Planning', desc: 'Personalised day-by-day plans based on your Travel DNA.' },
              { status: 'Live', title: 'Safety Check-ins & Escalation', desc: 'Scheduled check-ins with multi-step contact notification.' },
              { status: 'Live', title: 'FCDO Travel Advisories', desc: 'Real-time official advisories matched to your destinations.' },
              { status: 'Live', title: 'Travel DNA Quiz', desc: '60-second personality diagnostic for personalised recommendations.' },
              { status: 'Active development', title: 'Travel Buddy Matching', desc: 'Connect with solo travellers heading to the same places.' },
              { status: 'Planned', title: 'Offline Safety Mode', desc: 'Access safety info and contacts without an internet connection.' },
            ].map((item) => (
              <div key={`item-${item.title}`} className="flex items-start gap-4 p-4 bg-base-200 rounded-xl">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  item.status === 'Live' ? 'bg-success/10 text-success border border-success/30/60' :
                  item.status === 'Active development' ? 'bg-warning/10 text-warning border border-warning/30/60' :
                  'bg-base-200 text-base-content/60 border border-base-300/60'
                }`}>
                  {item.status}
                </span>
                <div>
                  <h4 className="font-bold text-base-content text-sm">{item.title}</h4>
                  <p className="text-xs text-base-content/60 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-deep to-slate-800 rounded-2xl p-8 text-center text-white">
          <Heart size={32} className="mx-auto mb-4 text-brand-vibrant" />
          <h2 className="text-2xl font-black mb-4">Start planning your next solo trip</h2>
          <p className="text-base-content/30 mb-6 max-w-lg mx-auto">
            Free to start. No credit card required.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-vibrant text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-brand-vibrant/20">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
