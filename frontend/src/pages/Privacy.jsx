import { ShieldCheck, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Privacy = () => {
  const [expandedSection, setExpandedSection] = useState('1');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    { id: '1', title: 'Data Controller Information', content: 'SoloCompass ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.\n\nData Controller:\nSoloCompass Ltd\nRegistered Address: 123 Travel Street, London, SW1A 1AA\nEmail: legal@solocompass.co.uk\nICO Registration Number: ZA123456\n\nWe are registered with the Information Commissioner\'s Office (ICO) as a data controller. Our registration can be verified at https://ico.org.uk.' },
    { id: '2', title: 'Information We Collect', content: 'Account Information: Full name, email address, password (stored encrypted), profile photo (optional), date of birth (optional), phone number (for safety features), emergency contact details.\n\nTrip and Travel Data: Destination preferences, travel dates and itinerary, accommodation preferences, transportation preferences, travel companion preferences, activity interests.\n\nSafety Check-In Data: Check-in history and timestamps, location data at time of check-in, emergency contact information, SOS alert history and locations.\n\nLocation Data: Real-time location (when using safety features), saved locations (home, frequent destinations), destination searches and history.\n\nDevice Information: Device type and model, operating system and version, browser type and version, IP address, unique device identifiers.\n\nPayment Information: Payment method details (processed by Stripe), billing address, transaction history.' },
    { id: '3', title: 'How We Use Your Information', content: 'We use your personal data for the following purposes:\n\n- Account registration and management (Performance of contract)\n- Providing travel planning services (Performance of contract)\n- Processing payments (Performance of contract)\n- Safety check-ins and SOS alerts (Vital interests)\n- Personalising user experience (Legitimate interest)\n- Sending service emails (Performance of contract)\n- Marketing communications (with consent) (Consent)\n- Analytics and service improvement (Legitimate interest)\n- Complying with legal obligations (Legal obligation)\n- Preventing fraud and abuse (Legitimate interest)' },
    { id: '4', title: 'Information Sharing', content: 'We share data with trusted third-party service providers who process data on our behalf:\n\n- Stripe: Payment processing\n- Resend: Email services\n- Hosting provider: Cloud infrastructure\n\nWhen you click affiliate links (accommodation, insurance, eSIM), we may share limited data with booking partners, insurance providers, and eSIM providers.\n\nWe may disclose data when required by law, to enforce our terms and policies, or to protect rights, safety, or property.\n\nWe only share data necessary for the specific purpose and require service providers to maintain appropriate security measures.' },
    { id: '5', title: 'International Transfers', content: 'Your data may be transferred to and processed in countries outside the UK, including European Economic Area (EEA) countries and the United States.\n\nWhen transferring data outside the UK/EEA, we ensure adequate protection through UK adequacy decisions, Standard Contractual Clauses (SCCs) approved by the ICO, and Binding Corporate Rules.\n\nYou may request information about the specific safeguards applied to your data by contacting us.' },
    { id: '6', title: 'Data Security', content: 'We implement appropriate technical and organisational measures to protect your data:\n\nTechnical Measures:\n- Encryption of data at rest (AES-256)\n- TLS encryption for data in transit\n- Multi-factor authentication for admin access\n- Regular security audits and penetration testing\n- Automated vulnerability scanning\n\nOrganisational Measures:\n- Staff training on data protection\n- Access controls on a need-to-know basis\n- Data protection policies and procedures\n- Incident response procedures\n\nIn the event of a breach affecting your personal data, we will notify the ICO within 72 hours and notify you without undue delay if the breach is likely to result in high risk.' },
    { id: '7', title: 'Data Retention', content: 'We retain personal data only as long as necessary:\n\n- Account data: Duration of account + 2 years for legal claims\n- Transaction records: 6 years (financial record-keeping requirement)\n- Trip/itinerary data: 2 years after trip completion\n- Check-in history: 2 years\n- Marketing preferences: Until consent withdrawn\n- Server logs: 12 months\n\nWhen you delete your account, we will delete or anonymise personal data within 30 days, retain anonymised data for analytics, and retain data necessary for legal obligations.' },
    { id: '8', title: 'Your Rights (GDPR)', content: 'You have the following rights regarding your personal data:\n\nRight of Access: You can request a copy of the personal data we hold about you.\n\nRight to Rectification: You can request correction of inaccurate personal data.\n\nRight to Erasure ("Right to be Forgotten"): You can request deletion of your personal data.\n\nRight to Restriction of Processing: You can request that we restrict processing.\n\nRight to Data Portability: You can request your data in a machine-readable format.\n\nRight to Object: You can object to processing based on legitimate interests or for direct marketing.\n\nTo exercise any of these rights, contact legal@solocompass.co.uk. If you are not satisfied with our response, you have the right to complain to the ICO at https://ico.org.uk or call 0303 123 1113.' },
    { id: '9', title: 'Cookie Policy', content: 'We use cookies and similar technologies. See our separate Cookie Policy for detailed information.\n\nCookies we use include:\n- Essential cookies (required for service functionality)\n- Analytics cookies (to improve our service)\n- Marketing cookies (to personalise ads, with consent)\n\nYou can manage cookie preferences via our consent banner or your browser settings.' },
    { id: '10', title: 'Children\'s Privacy', content: 'Our Service is not intended for children under 13 years of age.\n\nWe do not knowingly collect personal data from children under 13. If we become aware of such collection, we will delete the data.\n\nIf you are a parent or guardian and believe your child has provided personal data, contact us immediately.' },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <SEO title="Privacy Policy - SoloCompass" description="How SoloCompass collects, uses, and protects your personal data — including Travel DNA, check-ins, and emergency contacts." />
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-base-content tracking-tight">Privacy Policy</h1>
            <p className="text-base-content/60 font-bold mt-1">Last Updated: April 1, 2026</p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-base-100 rounded-xl border border-base-300 p-6 mb-8">
          <h2 className="text-sm font-black text-base-content/60 uppercase tracking-widest mb-4">Key takeaways</h2>
          <ul className="space-y-2 text-sm text-base-content/80">
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> We collect data needed to run the service — your profile, trips, check-ins, and emergency contacts.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> Your Travel DNA, itinerary, and safety data are never sold to third parties.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> You can export all your data or delete your account at any time.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> We use cookies for essential functionality and analytics. Marketing cookies require your consent.</li>
            <li className="flex items-start gap-2"><span className="text-brand-vibrant font-bold">·</span> We comply with UK GDPR. You have full rights to access, correct, or delete your data.</li>
          </ul>
          <p className="text-xs text-base-content/40 mt-4">This is a plain-English summary. The full policy below is the legally binding document.</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <p className="text-blue-800 font-medium">
            <strong>Your Privacy Matters.</strong> We are registered with the ICO (ZA123456) and comply with UK GDPR. 
            We never sell your personal data to advertisers.
          </p>
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
                <span className="font-bold text-base-content/80 group-hover:text-blue-600 transition-colors">
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
            <Link to="/terms" className="text-blue-600 hover:underline font-bold">Terms of Service</Link>
            <Link to="/cookies" className="text-blue-600 hover:underline font-bold">Cookie Policy</Link>
          </div>
        </div>

        <div className="mt-8 p-6 bg-brand-deep rounded-xl text-white">
          <h3 className="font-black uppercase text-xs tracking-widest mb-4">Contact & ICO Registration</h3>
          <p className="text-white/50 font-medium">
            <strong>Data Controller:</strong> SoloCompass Ltd<br />
            <strong>Address:</strong> 123 Travel Street, London, SW1A 1AA<br />
            <strong>Email:</strong> legal@solocompass.co.uk<br />
            <strong>ICO Registration:</strong> ZA123456
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
