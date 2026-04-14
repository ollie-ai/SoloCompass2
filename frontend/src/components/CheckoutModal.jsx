import { useState } from 'react';
import { X, ShieldCheck, Zap, CreditCard, Lock, Check, ExternalLink } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';
import api from '../lib/api';

const CheckoutModal = ({ isOpen, onClose, plan }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !plan) return null;

  const handleCheckout = async () => {
    if (plan.price === '0') {
      window.location.href = '/register';
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.post('/billing/create-checkout-session', {
        planId: plan.name,
        priceId: plan.priceId
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error?.message || error.response?.data?.error || 'Failed to initialize checkout');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-deep/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative glass-card w-full max-w-xl rounded-xl overflow-hidden shadow-2xl animate-slide-up border border-white/20">
        <div className="p-8 border-b border-base-300/50/10 flex justify-between items-center bg-base-100/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-brand-vibrant/20 flex items-center justify-center text-brand-vibrant">
                <ShieldCheck size={24} />
             </div>
             <div>
                <h2 className="text-xl font-black text-base-content">Secure Checkout</h2>
                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Plan: {plan.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-base-100/10 rounded-full transition-colors text-base-content/40" aria-label="Close" title="Close">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
           <div className="p-6 rounded-xl bg-brand-deep/5 border border-brand-deep/10">
              <div className="flex justify-between items-center mb-4">
                 <span className="font-bold text-base-content/80">SoloCompass {plan.name}</span>
                 <span className="font-black text-base-content">£{plan.price}<span className="text-xs font-bold text-base-content/40">/mo</span></span>
              </div>
              <div className="space-y-2">
                 {plan.features?.slice(0, 4).map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs font-medium text-base-content/60">
                      <Check size={12} className="text-brand-vibrant" /> {f}
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-4 rounded-xl bg-base-200 border border-base-300/50">
              <div className="flex items-center gap-3 text-sm text-base-content/80">
                 <CreditCard size={20} className="text-base-content/40" />
                 <span>You will be redirected to Stripe's secure checkout</span>
              </div>
           </div>

           <Button 
            onClick={handleCheckout}
            disabled={isProcessing}
            variant="primary" 
            className="w-full py-5 rounded-xl font-black btn-premium shadow-xl flex items-center justify-center gap-3"
           >
             {isProcessing ? (
               <>Processing...</>
             ) : (
               <><Lock size={20} /> Continue to Stripe — £{plan.price}/mo</>
             )}
           </Button>

           <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
              <div className="flex items-center gap-1"><ShieldCheck size={10} /> Secured by Stripe</div>
              <div>•</div>
              <div>Cancel anytime</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
