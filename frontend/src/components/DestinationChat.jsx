import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, ShieldCheck, Sparkles, Moon, MapPin, ShieldAlert, Utensils } from 'lucide-react';
import api from '../lib/api';
import DOMPurify from 'dompurify';

export default function DestinationChat({ destinationId, destinationName, destinationLevel = 'city' }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm Atlas, your SoloCompass guide for ${destinationName}. Ask me about safety, neighbourhoods, local culture, or getting around.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const isCity = destinationLevel === 'city';

  const groupedSuggestions = isCity ? {
    safety: [
      { text: "Safe areas at night?", icon: Moon },
      { text: "Neighbourhood safety tips?", icon: ShieldAlert },
      { text: "Common scams to avoid?", icon: ShieldCheck }
    ],
    practical: [
      { text: "Best areas to stay?", icon: MapPin },
      { text: "How to get around?", icon: MapPin },
      { text: "Airport to city tips?", icon: MapPin }
    ],
    culture: [
      { text: "Local food to try?", icon: Utensils },
      { text: "Cultural etiquette?", icon: Sparkles },
      { text: "Hidden gems?", icon: Sparkles }
    ]
  } : {
    safety: [
      { text: "Country safety overview?", icon: ShieldAlert },
      { text: "Regional differences?", icon: MapPin },
      { text: "Entry requirements?", icon: ShieldCheck }
    ],
    practical: [
      { text: "Visa requirements?", icon: ShieldCheck },
      { text: "Best cities to visit?", icon: MapPin },
      { text: "Best time to visit?", icon: Sparkles }
    ],
    culture: [
      { text: "Local customs?", icon: Sparkles },
      { text: "What to pack?", icon: Sparkles },
      { text: "Typical costs?", icon: Sparkles }
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    
    const userQuery = forcedQuery || input.trim();
    if (!userQuery || loading) return;

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const response = await api.post(`/destinations/${destinationId}/query`, {
        query: userQuery
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.data.response }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I am sorry, I am having trouble connecting to the intelligence network right now. Please try again in a moment.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const sanitizeAndRenderHtml = (html) => {
    const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['a', 'b', 'strong', 'i', 'em', 'br', 'ul', 'li', 'p', 'h1', 'h2', 'h3', 'code', 'pre'], ALLOWED_ATTR: ['href', 'target', 'rel'] });
    return <div className="ai-response" dangerouslySetInnerHTML={{ __html: clean }} />;
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[500px]">
      <div className="p-6 bg-gradient-to-r from-brand-deep to-slate-900 text-white flex items-center justify-between">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-brand-vibrant flex items-center justify-center shadow-lg">
             <Bot size={20} />
           </div>
           <div>
              <h3 className="font-black text-lg leading-none mb-1">Ask Atlas about {destinationName}</h3>
             <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-widest"><ShieldCheck size={12}/> Destination intelligence</div>
           </div>
         </div>
         <Sparkles size={20} className="text-white/20" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-base-100/50 backdrop-blur-sm">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-base-300 text-base-content/60' : 'bg-brand-vibrant text-white shadow-md'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-xl p-4 text-sm font-medium leading-relaxed ${
              msg.role === 'user' ? 'bg-brand-deep text-white rounded-tr-sm' : 'bg-base-100 border text-base-content/80 shadow-sm border-base-300/50 rounded-tl-sm'
            }`}>
              {msg.role === 'assistant' ? sanitizeAndRenderHtml(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-vibrant text-white flex items-center justify-center shadow-md">
              <Bot size={16} />
            </div>
            <div className="bg-base-100 border border-base-300/50 rounded-xl rounded-tl-sm p-4 w-16 flex items-center justify-center shadow-sm">
              <Loader2 size={16} className="text-brand-vibrant animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative p-4 bg-base-100 border-t border-base-300/50">
        {showSuggestions && messages.length <= 1 && (
          <div className="absolute bottom-full left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pb-6 space-y-3">
            {Object.entries(groupedSuggestions).map(([category, questions]) => (
              <div key={category}>
                <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmit(null, q.text)}
                      className="px-3 py-1.5 rounded-full bg-base-200 border border-base-300 text-base-content/80 text-xs font-bold hover:bg-brand-vibrant hover:text-white transition-colors hover:border-brand-vibrant shadow-sm flex items-center gap-1.5"
                    >
                      <q.icon size={12} />
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={(e) => handleSubmit(e)} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about hotels, safety, or tours in ${destinationName}...`}
            className="w-full pl-6 pr-14 py-4 rounded-xl border-2 border-base-300/50 focus:border-brand-vibrant focus:ring-0 outline-none text-sm font-bold text-base-content bg-base-200 focus:bg-base-100 transition-all shadow-inner"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-brand-vibrant text-white hover:bg-brand-deep disabled:opacity-50 transition-colors shadow-md"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
