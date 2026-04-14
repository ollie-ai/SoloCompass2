import { Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Terms = () => {
  const [expandedSection, setExpandedSection] = useState('1');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    { id: '1', title: 'Acceptance of Terms', content: 'By accessing and using SoloCompass ("the Service", "we", "our", "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.\n\nThese Terms constitute a legally binding agreement between you and SoloCompass Ltd ("we", "our", "us") governing your access to and use of the SoloCompass AI-powered solo travel planning platform.\n\nWe may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms. We will notify you of material changes via email or through the Service.' },
    { id: '2', title: 'Description of Service', content: 'SoloCompass is an AI-powered solo travel planning platform that provides:\n\n- User account registration and authentication\n- Trip planning and itinerary creation\n- Destination discovery and recommendations\n- Safety features including check-ins and SOS alerts\n- Community reviews and ratings\n- AI-powered travel assistant chatbot\n- Affiliate links to travel services (accommodation, insurance, eSIMs)\n- Payment processing for premium features\n\nThe Service is provided "as is" and we reserve the right to modify, suspend, or discontinue any part of the Service at any time.\n\nWe act as an intermediary connecting users with third-party travel service providers.' },
    { id: '3', title: 'User Accounts', content: 'You must be at least 18 years old to create an account. By registering, you confirm you are of legal age to form binding contracts.\n\nYou agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.\n\nYou are responsible for maintaining the confidentiality of your account credentials and all activities that occur under your account.\n\nWe reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our discretion.' },
    { id: '4', title: 'User Responsibilities', content: 'You agree to use the Service only for lawful purposes and in accordance with these Terms.\n\nProhibited Activities include:\n- Violating any applicable laws or regulations\n- Infringing on intellectual property rights\n- Transmitting harmful, threatening, or offensive content\n- Attempting to gain unauthorized access to the Service\n- Using the Service for any commercial purposes without authorization\n- Interfering with the proper operation of the Service\n- Posting false, misleading, or defamatory reviews\n- Using automated systems (bots) to access the Service without permission\n\nYou are solely responsible for your travel decisions and any consequences arising from them.' },
    { id: '5', title: 'Intellectual Property', content: 'The Service, including all content, features, and functionality, is owned by SoloCompass Ltd and is protected by UK and international copyright, trademark, and other intellectual property laws.\n\nYou may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.\n\nThe SoloCompass name, logo, and all related marks are trademarks of SoloCompass Ltd. You may not use them without permission.' },
    { id: '6', title: 'Safety Features', content: 'Check-In System: The check-in feature allows you to notify designated contacts of your safety at specified intervals. You are responsible for setting appropriate check-in intervals, ensuring contact details are current, and responding to check-in prompts.\n\nSOS Feature: The SOS feature allows you to send emergency alerts with your location to emergency contacts and, where available, local emergency services.\n\nImportant Limitations:\n- SOS features depend on network connectivity and device capabilities\n- We cannot guarantee timely delivery of emergency communications\n- We are not a substitute for professional emergency services\n- In a genuine emergency, always contact local emergency services directly\n\nYou use safety features at your own risk.' },
    { id: '7', title: 'Payments & Billing', content: 'Premium Subscriptions: Certain features require a paid subscription. Subscription fees are displayed before purchase.\n\nPayment Processing: Payments are processed via Stripe. By providing payment information, you authorize us to charge the specified amount.\n\nPricing: All prices include VAT where applicable. We reserve the right to change pricing with 30 days\' notice.\n\nFree Trial: We may offer free trials. At the end of the trial, your card may be automatically charged unless you cancel.' },
    { id: '8', title: 'Cancellations & Refunds', content: 'Subscription Cancellation: You may cancel your subscription at any time via your account settings. Cancellation takes effect at the end of the current billing period.\n\nRefunds:\n- If you cancel within 14 days of purchase (cooling-off period), you are entitled to a full refund\n- After 14 days, no refunds are available for the remaining billing period\n- Refunds are processed within 14 business days to your original payment method\n\nThird-Party Services: For bookings made through affiliate links (hotels, insurance, eSIMs), refund policies vary by provider.' },
    { id: '9', title: 'Limitation of Liability', content: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.\n\nWE DO NOT WARRANT THAT:\n- THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE\n- THE SERVICE WILL MEET YOUR REQUIREMENTS\n- ANY INFORMATION PROVIDED IS ACCURATE OR RELIABLE\n\nTRAVEL INFORMATION IS PROVIDED BY THIRD PARTIES AND MAY BE INCOMPLETE OR INACCURATE. YOU SHOULD VERIFY INFORMATION WITH RELEVANT AUTHORITIES.\n\nOUR TOTAL LIABILITY UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.' },
    { id: '10', title: 'Governing Law', content: 'These Terms are governed by the laws of England and Wales.\n\nAny dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.\n\nIf you are a consumer residing in Scotland or Northern Ireland, you may also bring proceedings in your local courts.\n\nFor dispute resolution, we encourage you to contact us first to resolve any disputes informally.' },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <SEO title="Terms of Service - SoloCompass" description="Terms of Service for SoloCompass — the solo travel planning and safety platform." />
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-brand-vibrant/10 rounded-xl flex items-center justify-center text-brand-vibrant">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-base-content tracking-tight">Terms of Service</h1>
            <p className="text-base-content/60 font-bold mt-1">Last Updated: April 1, 2026</p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-base-100 rounded-xl border border-base-300 p-6 mb-8">
          <h2 className="text-sm font-black text-base-content/60 uppercase tracking-widest mb-4">Key takeaways</h2>
          <ul className="space-y-2 text-sm text-base-content/80">
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> SoloCompass is a planning tool — it does not guarantee your safety or replace emergency services.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> You are responsible for your travel decisions and keeping your account secure.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> You can cancel your subscription anytime. Refunds are available within 14 days of purchase.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> You can export or delete your data at any time.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> These terms are governed by the laws of England and Wales.</li>
          </ul>
          <p className="text-xs text-base-content/40 mt-4">This is a plain-English summary. The full terms below are the legally binding agreement.</p>
        </div>
        
        <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden mb-8">
          <div className="p-6 bg-base-200 border-b border-base-300">
            <h2 className="text-sm font-black text-base-content/60 uppercase tracking-widest">Table of Contents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-base-300">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="p-4 bg-base-100 text-left hover:bg-base-200 transition-colors flex items-center justify-between group"
              >
                <span className="font-bold text-base-content/80 group-hover:text-brand-vibrant transition-colors">
                  {section.id}. {section.title}
                </span>
                <ChevronDown size={16} className={`text-base-content/40 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-base-200 transition-colors"
              >
                <h2 className="text-base-content font-black uppercase text-xs tracking-widest">
                  {section.id}. {section.title}
                </h2>
                <ChevronDown size={20} className={`text-base-content/40 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`} />
              </button>
              {expandedSection === section.id && (
                <div className="px-6 pb-6 border-t border-base-300/50">
                  <div className="pt-4 prose prose-slate max-w-none">
                    {section.content.split('\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-base-content/80 font-medium leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-base-200 rounded-xl">
          <h3 className="font-black text-base-content/80 uppercase text-xs tracking-widest mb-4">Related Policies</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="text-brand-vibrant hover:underline font-bold">Privacy Policy</Link>
            <Link to="/cookies" className="text-brand-vibrant hover:underline font-bold">Cookie Policy</Link>
          </div>
        </div>

        <div className="mt-8 p-6 bg-brand-deep rounded-xl text-white">
          <h3 className="font-black uppercase text-xs tracking-widest mb-4">Questions or concerns?</h3>
          <p className="text-white/50 font-medium mb-4">
            If you have questions about these Terms, please contact us.
          </p>
          <p className="text-white/50 font-medium text-sm">
            <strong>Email:</strong> legal@solocompass.co.uk<br />
            <strong>Data Controller:</strong> SoloCompass Ltd, United Kingdom
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
