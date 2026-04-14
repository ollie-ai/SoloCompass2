import { Book, ExternalLink, Mail, Shield, MapPin, Users, CreditCard, Compass, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Docs = () => {
  const categories = [
    {
      title: 'Getting Started',
      description: 'Create your account and set up your profile.',
      icon: Book,
      links: [
        { text: 'Quick Start Guide', href: '#quick-start' },
        { text: 'Setting Up Your Profile', href: '#profile' },
        { text: 'Taking the Travel DNA Quiz', href: '#quiz' },
      ]
    },
    {
      title: 'Trip Planning',
      description: 'Create trips, generate itineraries, and manage your plans.',
      icon: MapPin,
      links: [
        { text: 'Creating a New Trip', href: '#new-trip' },
        { text: 'Using AI Itinerary Generator', href: '#ai-itinerary' },
        { text: 'Budget Planning', href: '#budget' },
        { text: 'Packing Lists', href: '#packing' },
      ]
    },
    {
      title: 'Safety Tools',
      description: 'Check-ins, emergency contacts, and advisories.',
      icon: Shield,
      links: [
        { text: 'FCDO Safety Advisories', href: '#fcdo' },
        { text: 'Safety Check-ins', href: '#checkins' },
        { text: 'Emergency Contacts', href: '#emergency' },
        { text: 'SOS & Safe Haven Locator', href: '#sos' },
      ]
    },
    {
      title: 'Travel Profile & Buddies',
      description: 'Your Travel DNA, buddy matching, and connections.',
      icon: Users,
      links: [
        { text: 'Understanding Travel DNA', href: '#travel-dna' },
        { text: 'Finding Travel Buddies', href: '#buddies' },
        { text: 'Managing Connections', href: '#connections' },
      ]
    },
    {
      title: 'Account & Billing',
      description: 'Plans, subscriptions, data export, and deletion.',
      icon: CreditCard,
      links: [
        { text: 'Subscription Plans', href: '#plans' },
        { text: 'Cancel Subscription', href: '#cancel' },
        { text: 'Export Your Data', href: '#export' },
        { text: 'Delete Account', href: '#delete' },
      ]
    },
  ];

  return (
    <>
      <SEO 
        title="Documentation - SoloCompass" 
        description="Everything you need to know about using SoloCompass — from getting started to advanced safety features."
      />
      
      <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-brand-vibrant/10 rounded-2xl flex items-center justify-center text-brand-vibrant mx-auto mb-6">
            <Book size={32} />
          </div>
          <h1 className="text-4xl font-black text-base-content tracking-tight mb-4">
            Everything you need to know about using SoloCompass
          </h1>
          <p className="text-base-content/60 text-lg max-w-2xl mx-auto">
            From getting started to advanced features. If you can't find what you're looking for, head to the Help Center.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((cat) => (
            <div key={cat.title} className="glass-card p-6 rounded-xl hover:shadow-lg hover:shadow-brand-vibrant/10 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-vibrant/10 flex items-center justify-center text-brand-vibrant mb-4">
                <cat.icon size={20} />
              </div>
              <h2 className="text-lg font-bold text-base-content mb-1">{cat.title}</h2>
              <p className="text-base-content/60 text-sm mb-4">{cat.description}</p>
              <ul className="space-y-2">
                {cat.links.map((link) => (
                  <li key={link.text}>
                    <a href={link.href} className="text-sm text-brand-vibrant hover:underline">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Start Guide */}
        <div className="glass-card p-8 rounded-xl mb-16">
          <h2 id="quick-start" className="text-2xl font-bold text-base-content mb-6">Quick Start Guide</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">1. Create an Account</h3>
              <p className="text-base-content/60 mb-3">
                Sign up for free at <Link to="/register" className="text-brand-vibrant hover:underline">solocompass.app/register</Link>. 
                You can sign up with your email or use Google OAuth for quick access.
              </p>
            </div>

            <div id="quiz">
              <h3 className="text-lg font-semibold text-base-content mb-2">2. Complete Your Travel DNA Quiz</h3>
              <p className="text-base-content/60 mb-3">
                Take our 60-second personality diagnostic to calibrate SoloCompass to your travel style, 
                budget, and interests. This is used to personalise itineraries and buddy matching.
              </p>
              <Link to="/quiz" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-vibrant/10 text-brand-vibrant rounded-lg hover:bg-brand-vibrant/20 transition-colors">
                Take the Quiz
              </Link>
            </div>

            <div id="new-trip">
              <h3 className="text-lg font-semibold text-base-content mb-2">3. Create Your First Trip</h3>
              <p className="text-base-content/60 mb-3">
                Click "New Trip" to enter your destination, dates, and budget. Our AI will generate 
                a personalised itinerary based on your Travel DNA profile.
              </p>
              <Link to="/trips/new" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-vibrant/10 text-brand-vibrant rounded-lg hover:bg-brand-vibrant/20 transition-colors">
                Create Your First Trip
              </Link>
            </div>

            <div id="checkins">
              <h3 className="text-lg font-semibold text-base-content mb-2">4. Add Emergency Contacts & Set Up Check-ins</h3>
              <p className="text-base-content/60 mb-3">
                Choose who should be notified if you miss a check-in. Set intervals that work for your trip — every few hours, daily, or custom.
              </p>
              <Link to="/safety-info" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-vibrant/10 text-brand-vibrant rounded-lg hover:bg-brand-vibrant/20 transition-colors">
                Learn About Safety
              </Link>
            </div>
          </div>
        </div>

        {/* Travel DNA Section */}
        <div id="travel-dna" className="glass-card p-8 rounded-xl mb-16">
          <h2 className="text-2xl font-bold text-base-content mb-4 flex items-center gap-2">
            <Compass size={24} className="text-brand-vibrant" /> Travel Profile & Buddies
          </h2>
          <p className="text-base-content/60 mb-6">
            Your Travel DNA is the profile other travellers use to understand your style. Complete it for better buddy matching.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">What is Travel DNA?</h3>
              <p className="text-base-content/60">
                A summary of your adventure level, social style, travel rhythm, and interests — generated from the Travel DNA Quiz. Used across your account for itinerary suggestions and buddy matching.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">Finding Travel Buddies</h3>
              <p className="text-base-content/60">
                SoloCompass matches you with travellers heading to similar destinations at overlapping times. Match quality improves with a completed Travel DNA profile and active trips.
              </p>
            </div>
          </div>
        </div>

        {/* API Documentation — visually separated */}
        <div className="glass-card p-8 rounded-xl mb-16 border-base-300/70/50">
          <div className="flex items-center gap-2 mb-4">
            <h2 id="api" className="text-2xl font-bold text-base-content">API Documentation</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-base-200 text-base-content/60">Developer</span>
          </div>
          <p className="text-base-content/60 mb-4">
            The SoloCompass API allows developers to integrate our travel planning and safety features 
            into their own applications.
          </p>
          <div className="bg-slate-900 rounded-lg p-4 mb-4">
            <code className="text-green-400 text-sm">
              Base URL: https://api.solocompass.app/v1
            </code>
          </div>
          <a 
            href="https://docs.solocompass.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-vibrant hover:underline"
          >
            View Full API Documentation
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Need More Help — support handoff */}
        <div className="glass-card p-8 rounded-xl mb-16">
          <h2 className="text-2xl font-bold text-base-content mb-4 flex items-center gap-2">
            <HelpCircle size={24} className="text-brand-vibrant" /> Need more help?
          </h2>
          <p className="text-base-content/60 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="mailto:support@solocompass.co.uk" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-vibrant text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Mail size={16} />
              Email Support
            </a>
            <Link 
              to="/help" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-base-200 text-base-content/80 rounded-lg hover:bg-base-300 transition-colors"
            >
              <Book size={16} />
              Help Center
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-base-300/50">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-base-content/40">
            <Link to="/terms" className="hover:text-base-content transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-base-content transition-colors">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-base-content transition-colors">Cookie Policy</Link>
            <Link to="/contact" className="hover:text-base-content transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Docs;
