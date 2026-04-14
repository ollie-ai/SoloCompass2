import { useState } from 'react';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff,
  RotateCcw,
  Maximize2,
  Minimize2,
  LayoutGrid,
} from 'lucide-react';
import { HiddenWidgetItem } from './CollapsibleWidget';

/**
 * WidgetManagementPanel - Collapsible panel for managing dashboard widgets
 * Features:
 * - Show/hide hidden widgets
 * - Expand/collapse all widgets
 * - Reset to defaults
 * - Widget visibility indicators
 */
const WidgetManagementPanel = ({
  widgetStates = {},
  widgetConfig = {}, // { key: { title, icon, accentColor } }
  visibleCount = 0,
  totalCount = 0,
  onUnhide,
  onExpandAll,
  onCollapseAll,
  onReset,
  defaultWidgetKeys = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get hidden widgets
  const hiddenWidgets = Object.entries(widgetStates)
    .filter(([key, state]) => state?.hidden && widgetConfig[key])
    .map(([key, state]) => ({
      key,
      ...widgetConfig[key],
    }));

  // Get all configured widgets (from widgetConfig or defaultWidgetKeys)
  const allWidgets = Object.keys(widgetConfig).length > 0 
    ? Object.entries(widgetConfig).map(([key, config]) => ({
        key,
        ...config,
        hidden: widgetStates[key]?.hidden || false,
        expanded: widgetStates[key]?.expanded ?? true,
      }))
    : defaultWidgetKeys.map(key => ({
        key,
        title: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        hidden: widgetStates[key]?.hidden || false,
        expanded: widgetStates[key]?.expanded ?? true,
      }));

  const visibleWidgets = allWidgets.filter(w => !w.hidden);

  return (
    <div className="w-full mb-6">
      {/* Toggle Button */}
      <button
        onClick={() => {
          console.log('WidgetManagementPanel: Toggle clicked, was:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-base-200/70 hover:bg-base-200 border border-base-300/50 transition-all duration-200 text-sm font-bold text-base-content/70 hover:text-base-content"
      >
        <Settings size={16} className={isOpen ? 'text-brand-vibrant' : 'text-base-content/40'} />
        <span>Customize Dashboard</span>
        <span className="text-xs text-base-content/40">
          ({visibleCount}/{totalCount} visible)
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Panel Content - Simple conditional instead of AnimatePresence */}
      {isOpen && (
        <div className="pt-4 pb-2 overflow-hidden">
          {/* Quick Actions */}
            <div className="pt-4 pb-2">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={onExpandAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-vibrant/10 text-brand-vibrant hover:bg-brand-vibrant/20 transition-colors"
                >
                  <Maximize2 size={14} />
                  Expand All
                </button>
                <button
                  onClick={onCollapseAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-base-300/50 text-base-content/70 hover:bg-base-300 transition-colors"
                >
                  <Minimize2 size={14} />
                  Collapse All
                </button>
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset Defaults
                </button>
              </div>

              {/* Widget Visibility Grid */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">
                  Widget Visibility
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {allWidgets.map((widget) => (
                    <div
                      key={widget.key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        widget.hidden 
                          ? 'bg-base-200/30 border-base-300/30 opacity-50' 
                          : 'bg-base-200/50 border-base-300/50'
                      }`}
                    >
                      {widget.hidden ? (
                        <EyeOff size={14} className="text-base-content/30 flex-shrink-0" />
                      ) : (
                        <Eye size={14} className="text-brand-vibrant flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium text-base-content/70 truncate">
                        {widget.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Widgets Section */}
              {hiddenWidgets.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">
                    Hidden Widgets ({hiddenWidgets.length})
                  </h4>
                  <div className="space-y-2">
                    {hiddenWidgets.map((widget) => (
                      <HiddenWidgetItem
                        key={widget.key}
                        title={widget.title}
                        icon={widget.icon}
                        accentColor={widget.accentColor}
                        onShow={() => onUnhide(widget.key)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {hiddenWidgets.length === 0 && allWidgets.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-brand-vibrant/5 border border-brand-vibrant/20">
                  <LayoutGrid size={16} className="text-brand-vibrant" />
                  <span className="text-sm text-base-content/60">
                    All widgets are visible. Drag widgets to reorder them.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default WidgetManagementPanel;