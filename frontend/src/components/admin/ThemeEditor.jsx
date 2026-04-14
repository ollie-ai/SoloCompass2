import { useState } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import Button from '../Button';
import toast from 'react-hot-toast';
import { 
  Palette, 
  Sun, 
  Moon, 
  Check, 
  RotateCcw,
  Save,
  Eye,
  Copy,
  Type
} from 'lucide-react';

const THEME_COLORS = {
  solocompass: {
    name: 'Light Theme',
    colors: [
      { key: 'primary', label: 'Primary', description: 'Main brand color' },
      { key: 'secondary', label: 'Secondary', description: 'Accent color' },
      { key: 'accent', label: 'Accent', description: 'Highlight color' },
      { key: 'neutral', label: 'Neutral', description: 'Dark text & elements' },
      { key: 'base-100', label: 'Background', description: 'Main background' },
      { key: 'base-200', label: 'Surface', description: 'Cards & elevated areas' },
      { key: 'base-300', label: 'Border', description: 'Dividers & borders' },
      { key: 'base-content', label: 'Text', description: 'Main text color' },
      { key: 'info', label: 'Info', description: 'Information color' },
      { key: 'success', label: 'Success', description: 'Success states' },
      { key: 'warning', label: 'Warning', description: 'Warning states' },
      { key: 'error', label: 'Error', description: 'Error states' },
    ]
  },
  'solocompass-dark': {
    name: 'Dark Theme',
    colors: [
      { key: 'primary', label: 'Primary', description: 'Main brand color' },
      { key: 'secondary', label: 'Secondary', description: 'Accent color' },
      { key: 'accent', label: 'Accent', description: 'Highlight color' },
      { key: 'neutral', label: 'Neutral', description: 'Light text & elements' },
      { key: 'base-100', label: 'Background', description: 'Main background' },
      { key: 'base-200', label: 'Surface', description: 'Cards & elevated areas' },
      { key: 'base-300', label: 'Border', description: 'Dividers & borders' },
      { key: 'base-content', label: 'Text', description: 'Main text color' },
      { key: 'info', label: 'Info', description: 'Information color' },
      { key: 'success', label: 'Success', description: 'Success states' },
      { key: 'warning', label: 'Warning', description: 'Warning states' },
      { key: 'error', label: 'Error', description: 'Error states' },
    ]
  }
};

const PRESET_THEMES = [
  {
    id: 'default',
    name: 'SoloCompass Default',
    primary: '#10b981',
    description: 'Default emerald green theme'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    description: 'Calm blue theme'
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    primary: '#f97316',
    description: 'Warm orange theme'
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    primary: '#8b5cf6',
    description: 'Luxurious purple theme'
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    primary: '#ec4899',
    description: 'Vibrant pink theme'
  },
  {
    id: 'amber',
    name: 'Golden Amber',
    primary: '#f59e0b',
    description: 'Warm golden theme'
  }
];

const FONTS = [
  { id: 'default', name: 'Default Sans', value: 'system-ui, -apple-system, sans-serif', preview: 'Aa Bb Cc' },
  { id: 'inter', name: 'Inter', value: "'Inter', sans-serif", preview: 'Aa Bb Cc' },
  { id: 'poppins', name: 'Poppins', value: "'Poppins', sans-serif", preview: 'Aa Bb Cc' },
  { id: 'roboto', name: 'Roboto', value: "'Roboto', sans-serif", preview: 'Aa Bb Cc' },
  { id: 'open-sans', name: 'Open Sans', value: "'Open Sans', sans-serif", preview: 'Aa Bb Cc' },
  { id: 'lato', name: 'Lato', value: "'Lato', sans-serif", preview: 'Aa Bb Cc' },
  { id: 'playfair', name: 'Playfair Display', value: "'Playfair Display', serif", preview: 'Aa Bb Cc' },
  { id: 'merriweather', name: 'Merriweather', value: "'Merriweather', serif", preview: 'Aa Bb Cc' },
];

const ThemeEditor = () => {
  const { theme, setTheme } = useThemeStore();
  const [activeTheme, setActiveTheme] = useState(theme === 'solocompass-dark' ? 'solocompass-dark' : 'solocompass');
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedFont, setSelectedFont] = useState('default');
  
  const currentThemeConfig = THEME_COLORS[activeTheme];

  const handleThemeSelect = (themeId) => {
    setActiveTheme(themeId);
    setTheme(themeId);
  };

  const handlePresetApply = (preset) => {
    setSelectedFont(preset.id);
    document.documentElement.style.setProperty('--theme-primary', preset.primary);
    toast.success(`${preset.name} preview applied! Full theme requires config update.`);
  };

  const handleFontSelect = (font) => {
    setSelectedFont(font.id);
    document.documentElement.style.fontFamily = font.value;
    localStorage.setItem('solocompass-font', JSON.stringify(font));
    toast.success(`Font changed to ${font.name}`);
  };

  const handleCopyConfig = () => {
    const config = {
      themes: [
        {
          [activeTheme]: {
            primary: '#10b981',
            'primary-content': '#ffffff',
            secondary: '#8b5cf6',
            'secondary-content': '#ffffff',
            accent: '#0ea5e9',
            'accent-content': '#ffffff',
            neutral: activeTheme === 'solocompass' ? '#0f172a' : '#1e293b',
            'neutral-content': '#f8fafc',
            'base-100': activeTheme === 'solocompass' ? '#ffffff' : '#0f172a',
            'base-200': activeTheme === 'solocompass' ? '#f1f5f9' : '#1e293b',
            'base-300': activeTheme === 'solocompass' ? '#e2e8f0' : '#334155',
            'base-content': activeTheme === 'solocompass' ? '#0f172a' : '#f8fafc',
            info: '#0ea5e9',
            'info-content': '#ffffff',
            success: '#22c55e',
            'success-content': '#ffffff',
            warning: '#f59e0b',
            'warning-content': '#ffffff',
            error: '#ef4444',
            'error-content': '#ffffff',
          }
        }
      ]
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success('Theme config copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-base-content">Theme Editor</h2>
          <p className="text-sm text-base-content/60 mt-1">Customize the application appearance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={previewMode ? 'primary' : 'outline'}
            onClick={() => setPreviewMode(!previewMode)}
            className="rounded-xl"
          >
            <Eye size={16} />
            {previewMode ? 'Previewing' : 'Preview'}
          </Button>
          <Button 
            variant="outline"
            onClick={handleCopyConfig}
            className="rounded-xl"
          >
            <Copy size={16} />
            Copy Config
          </Button>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-base-300 bg-base-200/30">
          <h3 className="font-black text-base-content">Active Theme</h3>
          <p className="text-sm text-base-content/60 mt-1">Select which theme to edit</p>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeSelect('solocompass')}
              className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                activeTheme === 'solocompass'
                  ? 'border-primary bg-primary/5'
                  : 'border-base-300 hover:border-base-content/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-base-300 flex items-center justify-center">
                  <Sun size={18} className="text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-base-content">Light Mode</p>
                  <p className="text-xs text-base-content/60">White backgrounds</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-gradient-to-r from-white via-gray-100 to-gray-200" />
            </button>
            
            <button
              onClick={() => handleThemeSelect('solocompass-dark')}
              className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                activeTheme === 'solocompass-dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-base-300 hover:border-base-content/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Moon size={18} className="text-indigo-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-base-content">Dark Mode</p>
                  <p className="text-xs text-base-content/60">Dark backgrounds</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Preset Themes */}
      <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-base-300 bg-base-200/30">
          <h3 className="font-black text-base-content">Color Presets</h3>
          <p className="text-sm text-base-content/60 mt-1">Preview color schemes (full application requires config update)</p>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetApply(preset)}
              className="p-4 rounded-xl border border-base-300 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div 
                className="w-full h-8 rounded-lg mb-3 shadow-inner relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r" style={{ 
                  backgroundColor: preset.primary,
                  opacity: 0.85
                }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              </div>
              <p className="font-bold text-base-content text-sm group-hover:text-primary transition-colors">{preset.name}</p>
              <p className="text-xs text-base-content/60 mt-0.5">{preset.description}</p>
              <p className="text-xs text-primary/70 mt-1 font-mono">{preset.primary}</p>
            </button>
          ))}
        </div>
        <div className="px-6 pb-6">
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <p className="text-sm text-warning font-medium flex items-center gap-2">
              <RotateCcw size={14} />
              Note: Color presets preview the primary color. Full theme application requires updating tailwind.config.js
            </p>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-base-300 bg-base-200/30">
          <h3 className="font-black text-base-content">Color Palette</h3>
          <p className="text-sm text-base-content/60 mt-1">Current {currentThemeConfig.name} colors</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentThemeConfig.colors.map((color) => (
              <div 
                key={color.key}
                className="p-4 rounded-xl border border-base-300 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Palette size={14} className="text-base-content/40" />
                  <span className="font-bold text-base-content text-sm">{color.label}</span>
                </div>
                <p className="text-xs text-base-content/60 mb-3">{color.description}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border border-base-300" />
                  <code className="text-xs text-base-content/60 font-mono">{color.key}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Font Management */}
      <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-base-300 bg-base-200/30">
          <h3 className="font-black text-base-content flex items-center gap-2">
            <Type size={18} className="text-primary" />
            Font Settings
          </h3>
          <p className="text-sm text-base-content/60 mt-1">Choose your preferred font family</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => handleFontSelect(font)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedFont === font.id
                    ? 'border-primary bg-primary/5'
                    : 'border-base-300 hover:border-base-content/30'
                }`}
              >
                <div 
                  className="text-2xl mb-2 h-10 flex items-center justify-center"
                  style={{ fontFamily: font.value }}
                >
                  {font.preview}
                </div>
                <p className="font-bold text-base-content text-sm">{font.name}</p>
                <p className="text-xs text-base-content/60 mt-1 font-mono">{font.id}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-base-200/50 rounded-xl">
            <p className="text-sm text-base-content/70">
              <span className="font-bold">Current:</span> {FONTS.find(f => f.id === selectedFont)?.name}
              <span className="mx-2">|</span>
              <span className="font-mono text-xs">{FONTS.find(f => f.id === selectedFont)?.value}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tailwind Config Reference */}
      <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-base-300 bg-base-200/30">
          <h3 className="font-black text-base-content">Tailwind Config</h3>
          <p className="text-sm text-base-content/60 mt-1">Add this to your tailwind.config.js</p>
        </div>
        <div className="p-6">
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto">
{`daisyui: {
  themes: [
    {
      solocompass: {
        primary: "#10b981",
        "primary-content": "#ffffff",
        secondary: "#8b5cf6",
        "secondary-content": "#ffffff",
        accent: "#0ea5e9",
        "accent-content": "#ffffff",
        neutral: "#0f172a",
        "neutral-content": "#f8fafc",
        "base-100": "#ffffff",
        "base-200": "#f1f5f9",
        "base-300": "#e2e8f0",
        "base-content": "#0f172a",
        info: "#0ea5e9",
        "info-content": "#ffffff",
        success: "#22c55e",
        "success-content": "#ffffff",
        warning: "#f59e0b",
        "warning-content": "#ffffff",
        error: "#ef4444",
        "error-content": "#ffffff",
      },
      "solocompass-dark": {
        primary: "#10b981",
        "primary-content": "#ffffff",
        secondary: "#8b5cf6",
        "secondary-content": "#ffffff",
        accent: "#0ea5e9",
        "accent-content": "#ffffff",
        neutral: "#1e293b",
        "neutral-content": "#f8fafc",
        "base-100": "#0f172a",
        "base-200": "#1e293b",
        "base-300": "#334155",
        "base-content": "#f8fafc",
        info: "#0ea5e9",
        "info-content": "#ffffff",
        success: "#22c55e",
        "success-content": "#ffffff",
        warning: "#f59e0b",
        "warning-content": "#ffffff",
        error: "#ef4444",
        "error-content": "#ffffff",
      }
    }
  ],
},`}
          </pre>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
        <h4 className="font-bold text-base-content flex items-center gap-2">
          <Check size={16} className="text-primary" />
          Theme Tips
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-base-content/70">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            Use DaisyUI semantic color names (primary, secondary, base-100, etc.) for automatic dark/light mode support
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            The base-100 color is your main background, base-200 for elevated surfaces, base-300 for borders
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            Theme changes apply instantly when preview mode is enabled
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            Copy the config and add it to tailwind.config.js to persist changes
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ThemeEditor;
