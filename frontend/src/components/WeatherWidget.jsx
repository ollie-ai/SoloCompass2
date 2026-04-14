import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Wind, Thermometer, Droplets, ArrowRight } from 'lucide-react';
import api from '../lib/api';

const WeatherWidget = ({ city, country }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (city) {
      fetchWeather();
    }
  }, [city]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query = country ? `${city},${country}` : city;
      const [currentRes, forecastRes] = await Promise.all([
        api.get(`/weather/${encodeURIComponent(query)}`),
        api.get(`/weather/forecast/${encodeURIComponent(query)}`)
      ]);

      setWeather(currentRes.data.data);
      setForecast(forecastRes.data.data.forecast);
    } catch (err) {
      console.error('Weather error:', err);
      setError(err.response?.data?.message || 'Weather unavailable');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    // Basic mapping of OWM icons to Lucide icons
    if (iconCode?.startsWith('01')) return <Sun className="text-yellow-400" size={32} />;
    if (iconCode?.startsWith('02') || iconCode?.startsWith('03') || iconCode?.startsWith('04')) return <Cloud className="text-base-content/40" size={32} />;
    if (iconCode?.startsWith('09') || iconCode?.startsWith('10')) return <CloudRain className="text-brand-vibrant" size={32} />;
    if (iconCode?.startsWith('11')) return <CloudLightning className="text-brand-accent" size={32} />;
    return <Sun className="text-yellow-400" size={32} />;
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl animate-pulse">
        <div className="h-4 w-24 bg-base-300 rounded-full mb-6" />
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-base-300 rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 w-16 bg-base-300 rounded-lg" />
            <div className="h-3 w-12 bg-base-300 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5].map(i => <div key={'forecast-' + i} className="h-20 bg-base-300 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-xl bg-base-200 border border-base-content/5">
        <div className="flex items-center gap-2 text-base-content/40 font-black uppercase text-[10px] tracking-widest mb-4">
          <Sun size={14} /> Weather
        </div>
        <p className="text-xs text-base-content/60 font-medium italic">{error}</p>
        <p className="text-[10px] text-base-content/40 mt-2 leading-relaxed font-medium">
          Note: Weather API requires valid keys. Contact admin for setup.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-brand-vibrant font-black uppercase text-[10px] tracking-[0.2em]">
          <Sun size={14} /> Live Weather
        </div>
        <div className="text-[10px] font-black text-base-content/20 uppercase tracking-widest">{weather.city}</div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="w-16 h-16 rounded-[1.5rem] bg-brand-vibrant/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          {getWeatherIcon(weather.icon)}
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-base-content leading-none">{weather.temp}°</span>
            <span className="text-sm font-black text-base-content/40">C</span>
          </div>
          <p className="text-sm font-bold text-base-content/60 capitalize mt-1">{weather.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="p-3 rounded-xl bg-base-200 border border-base-content/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-base-100 flex items-center justify-center text-brand-accent shadow-sm">
            <Wind size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest leading-none mb-1">Wind</p>
            <p className="text-xs font-bold text-base-content truncate">{weather.wind_speed} m/s</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-base-200 border border-base-content/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-base-100 flex items-center justify-center text-emerald-500 shadow-sm">
            <Droplets size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest leading-none mb-1">Humidity</p>
            <p className="text-xs font-bold text-base-content truncate">{weather.humidity}%</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest border-b border-base-content/5 pb-2">5-Day Forecast</p>
        <div className="grid grid-cols-5 gap-2">
          {forecast.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center p-2 rounded-xl hover:bg-base-200 transition-colors">
              <span className="text-[10px] font-black text-base-content/40 uppercase mb-2">{day.day_name}</span>
              <div className="mb-2 transform group-hover/forecast:scale-110 transition-transform">
                {/* Minimalist icon representation */}
                {day.icon.includes('d') ? <Sun size={14} className="text-yellow-400" /> : <Cloud size={14} className="text-base-content/30" />}
              </div>
              <span className="text-xs font-black text-base-content">{day.temp_max}°</span>
              <span className="text-[10px] font-bold text-base-content/30">{day.temp_min}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
