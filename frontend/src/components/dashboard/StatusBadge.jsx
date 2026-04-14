import { ShieldCheck, AlertTriangle, Bell, Eye, ShieldOff } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'

const StatusBadge = ({ status = "all_clear", label, timestamp, className = "" }) => {
  const variants = {
    all_clear: { bg: "bg-success/10", border: "border-success/30", text: "text-success", icon: ShieldCheck, dot: "bg-success/100", label: label || "All Clear" },
    caution: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", icon: AlertTriangle, dot: "bg-warning/100 animate-pulse", label: label || "Caution" },
    action_needed: { bg: "bg-error/10", border: "border-error/30", text: "text-error", icon: Bell, dot: "bg-error/100 animate-pulse", label: label || "Action Needed" },
    monitoring: { bg: "bg-info/10", border: "border-info/30", text: "text-info", icon: Eye, dot: "bg-info/100", label: label || "Monitoring active" },
    no_advisories: { bg: "bg-success/10", border: "border-success/30", text: "text-success", icon: ShieldCheck, dot: "bg-success/100", label: label || "No active advisories" },
    advisories_available: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", icon: ShieldOff, dot: "bg-warning/100", label: label || "Advisories available" },
    high_alert: { bg: "bg-error/10", border: "border-error/30", text: "text-error", icon: AlertTriangle, dot: "bg-error/100 animate-pulse", label: label || "High Alert" },
    advisory_active: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", icon: AlertTriangle, dot: "bg-warning/100 animate-pulse", label: label || "Advisory Active" },
  }
  
  const v = variants[status] || variants.all_clear
  const Icon = v.icon
  
  const formattedTime = timestamp ? (() => {
    const d = new Date(timestamp)
    const now = new Date()
    const diff = Math.round((now - d) / 60000)
    if (diff < 1) return "Just now"
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.round(diff/60)}h ago`
    return d.toLocaleDateString()
  })() : null
  
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${v.bg} ${v.border} ${v.text} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
            <Icon size={12} />
            {v.label}
          </span>
        </Tooltip.Trigger>
        {formattedTime && (
          <Tooltip.Portal>
            <Tooltip.Content className="bg-brand-deep text-white text-xs px-3 py-1.5 rounded-lg shadow-xl" sideOffset={8}>
              Last checked: {formattedTime}
              <Tooltip.Arrow className="fill-brand-deep" />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default StatusBadge
