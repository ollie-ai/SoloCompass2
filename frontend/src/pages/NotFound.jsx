import { Link } from 'react-router-dom';
import { Compass, Home, MapPinned } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you were looking for could not be found. Return to SoloCompass to keep planning your trip."
      />

      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl rounded-3xl border border-base-300/60 bg-base-100 shadow-xl shadow-base-content/5 p-8 sm:p-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-brand-vibrant/20 bg-brand-vibrant/10 px-4 py-2 text-sm font-black text-brand-vibrant">
            <Compass size={16} />
            404 · Page not found
          </div>

          <div className="mt-6 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-outfit font-black tracking-tight text-base-content">
              This route has gone off course.
            </h1>
            <p className="max-w-2xl text-base sm:text-lg text-base-content/70 font-medium leading-relaxed">
              The link may be outdated, mistyped, or no longer available. Head back to your dashboard or explore destinations to keep planning your next solo trip.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-vibrant px-5 py-3 font-bold text-white transition-opacity hover:opacity-90"
            >
              <Home size={18} />
              Go home
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-base-300 px-5 py-3 font-bold text-base-content transition-colors hover:bg-base-200"
            >
              <MapPinned size={18} />
              Explore features
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
