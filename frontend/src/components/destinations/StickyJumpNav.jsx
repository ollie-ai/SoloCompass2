/**
 * StickyJumpNav — Horizontal sticky section navigation
 */

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'advisory', label: 'Advisory' },
  { id: 'regions', label: 'Regions' },
  { id: 'cities', label: 'Cities' },
  { id: 'budget', label: 'Budget' },
  { id: 'social', label: 'Social' },
  { id: 'remote', label: 'Remote Work' },
  { id: 'atlas', label: 'Atlas' },
  { id: 'plan', label: 'Plan' },
];

export default function StickyJumpNav({ onSectionChange }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onSectionChange?.(id);
    }
  };

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled ? 'bg-base-100/95 backdrop-blur-sm shadow-lg border-b border-base-300/30' : ''
    }`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 pt-2 scrollbar-hide">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSection === section.id
                  ? 'bg-brand-vibrant text-white'
                  : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
              }`}
            >
              {section.label}
              <ChevronRight size={10} className={`inline ml-1 transition-transform ${
                activeSection === section.id ? 'rotate-90' : ''
              }`} />
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}