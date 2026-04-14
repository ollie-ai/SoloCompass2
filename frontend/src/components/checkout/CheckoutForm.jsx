import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutForm = ({ plan, isAnnual, planId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?payment_success=true&plan=${planId}`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      setIsProcessing(false);
    } else {
      // Stripe will redirect to return_url
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        <h3 className="text-xl font-black text-base-content mb-2">Payment Details</h3>
        <p className="text-sm text-base-content/60 font-medium">Safe and secure UK-based processing.</p>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-sm font-bold animate-shake">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      <div className="pt-6">
        <Button
          type="submit"
          variant="primary"
          className="w-full py-4 rounded-xl font-black btn-premium shadow-2xl flex items-center justify-center gap-3 relative"
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Authorizing...
            </>
          ) : (
            <>
              <ShieldCheck size={20} />
              Subscribe to {plan.name} (£{isAnnual ? (plan.annual * 12).toFixed(2) : plan.monthly})
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-base-content/40 font-bold uppercase tracking-widest mt-6">
        Powered by <span className="text-base-content/60">Stripe</span>
      </p>
    </form>
  );
};

export default CheckoutForm;
