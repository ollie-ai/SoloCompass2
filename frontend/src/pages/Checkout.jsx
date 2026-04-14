import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import CheckoutForm from '../components/checkout/CheckoutForm';
import Loading from '../components/Loading';
import { Shield, Sparkles, Check, ChevronLeft, Lock, Calendar, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

// Initialize Stripe outside of component re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const plans = {
  guardian: {
    name: 'Guardian',
    monthly: 4.99,
    annual: 3.99,
    tagline: 'Precision safety & repeat planning.',
    icon: <Shield size={24} className="text-brand-vibrant" />,
    features: ['Unlimited Trips', 'Automated Check-ins', 'Safe-Return Timer', 'Safe Haven Locator']
  },
  navigator: {
    name: 'Navigator',
    monthly: 9.99,
    annual: 7.99,
    tagline: 'Deep AI guidance & power tools.',
    icon: <Sparkles size={24} className="text-indigo-500" />,
    features: ['Everything in Guardian', 'AI Destination Chat', 'AI Safety Advice', 'Travel Buddy Matching']
  }
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('plan') || 'guardian';
  const plan = plans[planId];

  useEffect(() => {
    if (isAuthenticated && plan) {
      createPaymentIntent();
    }
  }, [isAuthenticated, planId, isAnnual]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const res = await api.post('/billing/create-subscription-intent', {
        planId,
        interval: isAnnual ? 'year' : 'month'
      });
      if (res.data.success) {
        setClientSecret(res.data.clientSecret);
      } else {
        toast.error('Failed to initialize checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Payment system unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <Navigate to={`/login?plan=${planId}`} replace />;
  if (!plan) return <Navigate to="/pricing" replace />;
  if (user?.is_premium) return <Navigate to="/dashboard" replace />;

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#10b981',
      colorBackground: '#ffffff',
      colorText: '#0f172a',
      borderRadius: '12px',
    },
  };
  const options = { clientSecret, appearance };

  return (
    <div className="min-h-screen bg-mesh py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-2 text-base-content/60 hover:text-base-content font-bold mb-8 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Plans
        </button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Plan Summary */}
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-vibrant/10 text-brand-vibrant text-[10px] font-black uppercase tracking-widest mb-4">
                Secure Checkout
              </div>
              <h1 className="text-3xl font-black text-base-content leading-tight">
                Secure your <span className="text-gradient">{plan.name}</span> membership
              </h1>
              <p className="text-base-content/60 font-medium mt-2">{plan.tagline}</p>
            </div>

            <div className="glass-card p-6 bg-base-100/80">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-base-100 rounded-xl shadow-sm border border-base-300/50">
                    {plan.icon}
                  </div>
                  <div>
                    <p className="font-black text-base-content">{plan.name} Membership</p>
                    <p className="text-xs text-base-content/40 font-bold uppercase tracking-widest">Premium Service</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-base-content">
                    £{isAnnual ? plan.annual : plan.monthly}
                  </p>
                  <p className="text-[10px] text-base-content/40 font-black uppercase">/ month</p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-base-300/50">
                {plan.features.map((feature) => (
                  <div key={`feature-${feature}`} className="flex items-center gap-3 text-sm text-base-content/80 font-medium">
                    <div className="w-5 h-5 bg-brand-vibrant/10 rounded-full flex items-center justify-center shrink-0">
                      <Check size={12} className="text-brand-vibrant stroke-[4px]" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-base-200 rounded-xl border border-dashed border-base-300">
                <div className="flex items-center justify-between text-sm font-bold text-base-content/60 mb-2">
                  <span>Subtotal</span>
                  <span>£{isAnnual ? (plan.annual * 12).toFixed(2) : plan.monthly}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-black text-base-content pt-2 border-t border-base-300">
                  <span>Total Due Today</span>
                  <span>£{isAnnual ? (plan.annual * 12).toFixed(2) : plan.monthly}</span>
                </div>
                <p className="text-[10px] text-base-content/40 mt-4 leading-relaxed font-medium">
                  Payments are secure and encrypted. Subscription will renew automatically. Cancel anytime in settings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-base-content/40 opacity-60 grayscale">
               <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><Lock size={14} /> SSL Secure</div>
               <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><Calendar size={14} /> 7-Day Refund</div>
               <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><Globe size={14} /> SoloCompass Inc</div>
            </div>
          </div>

          {/* Payment Element */}
          <div className="bg-base-100 rounded-3xl border border-base-300/50 shadow-2xl p-8 md:p-10">
            {loading ? (
              <div className="py-20 flex flex-col items-center">
                <Loading />
                <p className="mt-4 text-base-content/60 font-bold animate-pulse">Initializing Secure Gateway...</p>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm plan={plan} isAnnual={isAnnual} planId={planId} />
              </Elements>
            ) : (
              <div className="py-20 text-center">
                <p className="text-error font-bold mb-4">Verification Link Expired or Invalid</p>
                <button onClick={createPaymentIntent} className="btn-premium px-6 py-3 bg-brand-vibrant text-white rounded-xl font-bold">
                  Retry Initialization
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
