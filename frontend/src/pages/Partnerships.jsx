import { Link } from 'react-router-dom';
import { Handshake, ShieldCheck, Info, ExternalLink, Star } from 'lucide-react';

const Partnerships = () => {
  const partners = [
    {
      name: 'Booking.com',
      description: 'Hotel and accommodation booking platform',
      logo: 'https://cf.bstatic.com/static/img/favicon/258162663958379a476b40499736764a1a31fc4a.svg',
      url: 'https://www.booking.com'
    },
    {
      name: 'GetYourGuide',
      description: 'Tours and activities',
      logo: 'https://www.getyourguide.com/favicon.svg',
      url: 'https://www.getyourguide.com'
    },
    {
      name: 'Viator',
      description: 'Tours, tickets & experiences',
      logo: 'https://www.viator.com/favicon.ico',
      url: 'https://www.viator.com'
    },
    {
      name: 'Hostelworld',
      description: 'Hostel budget accommodations',
      logo: 'https://www.hostelworld.com/favicon.ico',
      url: 'https://www.hostelworld.com'
    },
    {
      name: 'Skyscanner',
      description: 'Flight comparison search',
      logo: 'https://www.skyscanner.net/favicon.ico',
      url: 'https://www.skyscanner.net'
    },
    {
      name: 'Trainline',
      description: 'Train & bus tickets',
      logo: 'https://www.thetrainline.com/favicon.ico',
      url: 'https://www.thetrainline.com'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200 animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-deep via-slate-900 to-slate-800 py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-base-100/10 rounded-xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <Handshake className="text-brand-vibrant" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Partnerships & Transparency</h1>
          <p className="text-base-content/30 text-lg max-w-2xl mx-auto font-medium">
            How we fund our free solo travel safety platform while keeping recommendations honest.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Affiliate Disclosure */}
        <div className="glass-card p-8 md:p-10 rounded-xl shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center text-warning">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-2xl font-black text-base-content">Affiliate Disclosure</h2>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-base-content/80 font-medium leading-relaxed mb-6">
              SoloCompass is a free platform for solo travellers. We provide our core services — safety advisories, 
              itinerary planning, and destination guides — at no cost to users. To keep it that way, we partner with 
              trusted travel providers through affiliate programs.
            </p>
            
            <div className="p-6 rounded-xl bg-warning/10 border border-warning/30 mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-warning mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="font-bold text-warning mb-1">What this means for you</p>
                  <p className="text-sm text-warning leading-relaxed">
                    When you book through our links, we may earn a small commission at <strong>no extra cost to you</strong>. 
                    This helps fund our free safety alerts and AI itinerary features.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-base-content/80 font-medium leading-relaxed">
              <strong>Our promise:</strong> We never let affiliate commissions influence our safety ratings, destination 
              recommendations, or editorial content. If a partner doesn't meet our safety standards, we won't promote 
              them — period.
            </p>
          </div>
        </div>

        {/* How We Earn */}
        <div className="glass-card p-8 md:p-10 rounded-xl shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Star size={20} />
            </div>
            <h2 className="text-2xl font-black text-base-content">How We Earn</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-base-200">
              <div className="w-8 h-8 rounded-lg bg-brand-vibrant/10 flex items-center justify-center text-brand-vibrant font-black text-xs">1</div>
              <div>
                <h4 className="font-black text-base-content mb-1">Affiliate Commissions</h4>
                <p className="text-base-content/80 text-sm">
                  We earn a small percentage when you book hotels, tours, or transport through our links. 
                  This typically ranges from 2-15% depending on the provider.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-base-200">
              <div className="w-8 h-8 rounded-lg bg-brand-vibrant/10 flex items-center justify-center text-brand-vibrant font-black text-xs">2</div>
              <div>
                <h4 className="font-black text-base-content mb-1">Premium Subscriptions</h4>
                <p className="text-base-content/80 text-sm">
                  Optional Guardian and Navigator plans unlock unlimited itineraries, scheduled check-ins, 
                  and AI destination chat. Free users always have access to core safety features.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-base-200">
              <div className="w-8 h-8 rounded-lg bg-brand-vibrant/10 flex items-center justify-center text-brand-vibrant font-black text-xs">3</div>
              <div>
                <h4 className="font-black text-base-content mb-1">AI Credits</h4>
                <p className="text-base-content/80 text-sm">
                  Free users get 1 AI itinerary/month. Additional generations require a Pro subscription, 
                  which also helps sustain our free tier.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Partners */}
        <div className="glass-card p-8 md:p-10 rounded-xl shadow-xl">
          <h2 className="text-2xl font-black text-base-content mb-8 flex items-center gap-3">
            <Handshake className="text-brand-vibrant" size={24} /> Our Travel Partners
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {partners.map((partner) => (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-base-200 border border-base-300/50 hover:border-brand-vibrant/30 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-base-100 flex items-center justify-center overflow-hidden border border-base-300">
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-base-content truncate">{partner.name}</h4>
                    <ExternalLink size={14} className="text-base-content/40 group-hover:text-brand-vibrant transition-colors" />
                  </div>
                  <p className="text-xs text-base-content/60 truncate">{partner.description}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl bg-base-200 border border-base-300">
            <p className="text-sm text-base-content/80 font-medium">
              <strong>Note:</strong> Not all partners are available in all regions. Booking availability may vary 
              based on your location. We always show the best available options for your trip.
            </p>
          </div>
        </div>

        {/* Sponsored Content Policy */}
        <div className="glass-card p-8 md:p-10 rounded-xl shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <Info size={20} />
            </div>
            <h2 className="text-2xl font-black text-base-content">Sponsored Content Policy</h2>
          </div>

          <div className="space-y-4 text-base-content/80 font-medium leading-relaxed">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-vibrant mt-2 flex-shrink-0"></div>
                <span><strong>Clear labeling:</strong> All sponsored content, sponsored destinations, or paid placements 
                are clearly marked with "Sponsored" or "Ad" labels.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-vibrant mt-2 flex-shrink-0"></div>
                <span><strong>Editorial independence:</strong> Our safety ratings, destination scores, and travel advice 
                are never influenced by sponsorship deals.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-vibrant mt-2 flex-shrink-0"></div>
                <span><strong>No hidden ads:</strong> We don't bury partner content in algorithmically "recommended" 
                destinations without disclosure.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-vibrant mt-2 flex-shrink-0"></div>
                <span><strong>User comes first:</strong> If we believe a partner is unsafe or provides poor service, 
                we remove them — regardless of revenue impact.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="glass-card p-8 md:p-10 rounded-xl shadow-xl text-center">
          <h3 className="text-xl font-black text-base-content mb-4">Questions About Our Partnerships?</h3>
          <p className="text-base-content/80 mb-6">
            We're happy to answer any questions about how we sustain our platform while keeping recommendations honest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:partnerships@solotrip.ai" 
              className="px-6 py-3 bg-brand-vibrant text-white rounded-xl font-black hover:bg-green-600 transition-colors"
            >
              Contact Partnerships
            </a>
            <Link 
              to="/privacy" 
              className="px-6 py-3 border-2 border-base-300 text-base-content/80 rounded-xl font-black hover:bg-base-200 transition-colors"
            >
              Read Privacy Policy
            </Link>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-center text-base-content/40 text-sm font-medium">
          Last Updated: April 1, 2026
        </p>
      </div>
    </div>
  );
};

export default Partnerships;
