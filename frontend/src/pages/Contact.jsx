import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import api from '../lib/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Enquiry', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/help/contact', form);
      toast.success('Message sent! We will get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: 'General Enquiry', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again or email us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-20 pb-16">
      <SEO title="Contact Us" description="Get in touch with the SoloCompass team for support, partnerships, or general enquiries." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-brand-vibrant/10 text-brand-vibrant text-sm font-bold rounded-full mb-6">
            Contact
          </span>
          <h1 className="text-4xl font-black text-base-content mb-4">Contact SoloCompass</h1>
          <p className="text-lg text-base-content/60 max-w-2xl mx-auto">
            Have a question or need help? We aim to respond within 1-2 business days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300/50">
              <h2 className="text-xl font-black text-base-content mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <a href="mailto:support@solocompass.co.uk" className="flex items-center gap-4 p-4 rounded-xl bg-base-200 hover:bg-brand-vibrant/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-brand-vibrant/10 text-brand-vibrant flex items-center justify-center group-hover:bg-brand-vibrant group-hover:text-white transition-colors">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60 font-bold">Email</p>
                    <p className="font-bold text-base-content">support@solocompass.co.uk</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-base-200">
                  <div className="w-10 h-10 rounded-xl bg-brand-vibrant/10 text-brand-vibrant flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60 font-bold">Phone</p>
                    <p className="font-bold text-base-content">+44 (0) 20 7946 0958</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-base-200">
                  <div className="w-10 h-10 rounded-xl bg-brand-vibrant/10 text-brand-vibrant flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60 font-bold">Address</p>
                    <p className="font-bold text-base-content">London, United Kingdom</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-base-200">
                  <div className="w-10 h-10 rounded-xl bg-brand-vibrant/10 text-brand-vibrant flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60 font-bold">Support Hours</p>
                    <p className="font-bold text-base-content">Mon-Fri, 9:00-17:00 GMT</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-error/10 rounded-2xl p-6 border border-error/20">
              <h3 className="text-lg font-black text-error mb-2 flex items-center gap-2">
                <MessageSquare size={20} /> Emergency Support
              </h3>
              <p className="text-sm text-error font-medium">
                If you are experiencing a safety emergency while traveling, use the SOS button in the app or contact local emergency services immediately.
              </p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300/50">
            <h2 className="text-xl font-black text-base-content mb-6">Send a Message</h2>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-base-content/80 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-base-300/50 focus:border-brand-vibrant focus:ring-2 focus:ring-brand-vibrant/20 outline-none font-medium"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-base-content/80 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-base-300/50 focus:border-brand-vibrant focus:ring-2 focus:ring-brand-vibrant/20 outline-none font-medium"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-base-content/80 mb-2">Subject</label>
                <select
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-base-300/50 focus:border-brand-vibrant focus:ring-2 focus:ring-brand-vibrant/20 outline-none font-medium"
                >
                  <option>General</option>
                  <option>Account</option>
                  <option>Billing</option>
                  <option>Safety</option>
                  <option>Partnerships</option>
                  <option>Press</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-base-content/80 mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-base-300/50 focus:border-brand-vibrant focus:ring-2 focus:ring-brand-vibrant/20 outline-none font-medium resize-none"
                  placeholder="How can we help?"
                />
              </div>
              
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 bg-brand-vibrant text-white rounded-xl font-bold hover:bg-brand-vibrant/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-vibrant/20 disabled:opacity-50"
              >
                <Send size={18} />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
