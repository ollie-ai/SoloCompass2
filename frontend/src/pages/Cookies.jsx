import { Cookie, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Cookies = () => {
  const [expandedSection, setExpandedSection] = useState('1');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    { id: '1', title: 'What Are Cookies', content: 'Cookies are small text files stored on your device when you visit websites or use applications. They help remember your preferences, improve functionality, and provide analytics.\n\nCookies are not programs and cannot install malware on your device. They are passive and cannot spread viruses.\n\nWe use cookies and similar technologies (local storage, pixels, web beacons) to provide and improve our service.' },
    { id: '2', title: 'How We Use Cookies', content: 'We use cookies for the following purposes:\n\nEssential: Required for the Service to function (e.g., login, preferences)\n\nFunctional: Remember your settings and preferences\n\nAnalytics: Understand how visitors use our Service\n\nMarketing: Personalise content and ads based on your interests\n\nSome cookies are set by us (first-party), while others are set by third parties (third-party).' },
    { id: '3', title: 'Essential Cookies', content: 'These cookies are necessary for the Service to function and cannot be switched off.\n\nsession_id: Maintains your login session - Session\n\ncsrf_token: Security protection against CSRF attacks - Session\n\nconsent_preferences: Stores your cookie consent choices - 1 year\n\ncheckout_data: Remembers items in your cart - Session\n\nLegal Basis: Legitimate interest (necessary for service delivery)' },
    { id: '4', title: 'Analytics Cookies', content: 'These cookies help us understand how visitors use our Service, allowing us to improve performance.\n\n_ga: Google Analytics - distinguishes users - 2 years\n\n_gat: Google Analytics - throttles requests - 1 minute\n\n_gid: Google Analytics - 24-hour performance - 24 hours\n\namplitude_id: Analytics for app performance - Amplitude\n\nLegal Basis: Consent (you can opt out at any time)' },
    { id: '5', title: 'Marketing Cookies', content: 'These cookies track your browsing activity to deliver relevant ads. We use them only with your consent.\n\n_fbp: Facebook Pixel - ad tracking - 3 months\n\n_gcl_au: Google AdSense - conversion tracking\n\nad_user_data: Google Ads - personalisation\n\nad_personalization: Google Ads - ad personalisation\n\nLegal Basis: Consent (you can opt out at any time)' },
    { id: '6', title: 'Third-Party Cookies', content: 'Third parties may set cookies when you use certain features:\n\nStripe: Payment processing - https://stripe.com/gb/privacy\n\nResend: Email tracking - https://resend.com/legal/privacy\n\nGoogle: Analytics and ads - https://policies.google.com/privacy\n\nMeta: Facebook Pixel - https://meta.com/privacy' },
    { id: '7', title: 'Managing Preferences', content: 'On your first visit, you will see a cookie consent banner where you can:\n\n- Accept all cookies\n- Reject non-essential cookies\n- Customise your preferences by category\n\nYou can also manage cookies through your browser settings:\n\nChrome: Settings → Privacy → Cookies\n\nSafari: Preferences → Privacy → Cookies\n\nFirefox: Options → Privacy → Cookies\n\nEdge: Settings → Cookies and site permissions\n\nNote: Disabling essential cookies may prevent some Service features from working.' },
    { id: '8', title: 'Opt-Out Links', content: 'You can opt out of specific tracking services:\n\nGoogle Analytics: https://tools.google.com/dlpage/gaoptout\n\nGoogle Ads: https://adssettings.google.com\n\nMeta: https://www.facebook.com/adchoices\n\nYou can update your cookie preferences at any time by clicking "Cookie Settings" in our footer or by clearing your browser cookies (resets preferences).' },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <SEO title="Cookie Policy - SoloCompass" description="How SoloCompass uses cookies — essential, analytics, and marketing — and how to manage your preferences." />
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-base-200 rounded-xl flex items-center justify-center text-base-content/80">
            <Cookie size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-base-content tracking-tight">Cookie Policy</h1>
            <p className="text-base-content/60 font-bold mt-1">Last Updated: April 1, 2026</p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-base-100 rounded-xl border border-base-300 p-6 mb-8">
          <h2 className="text-sm font-black text-base-content/60 uppercase tracking-widest mb-4">Key takeaways</h2>
          <ul className="space-y-2 text-sm text-base-content/80">
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> Essential cookies are required for the service to work — login, security, and your consent preferences.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> Analytics cookies help us understand how the service is used. You can opt out.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> Marketing cookies are only used with your explicit consent.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> You can manage or withdraw consent at any time via the cookie banner or your browser settings.</li>
          </ul>
          <p className="text-xs text-base-content/40 mt-4">This is a plain-English summary. The full policy below is the legally binding document.</p>
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
            <Link to="/terms" className="text-brand-vibrant hover:underline font-bold">Terms of Service</Link>
            <Link to="/privacy" className="text-brand-vibrant hover:underline font-bold">Privacy Policy</Link>
          </div>
        </div>

        <div className="mt-8 p-6 bg-brand-deep rounded-xl text-white">
          <h3 className="font-black uppercase text-xs tracking-widest mb-4">Questions?</h3>
          <p className="text-white/50 font-medium">
            For questions about our Cookie Policy, contact: legal@solocompass.co.uk
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
