import { useState, useMemo } from 'react'
import { useWidgetState } from '../../../hooks/useWidgetState'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Sparkles, Shield, Briefcase, DollarSign, ListChecks, CheckCircle, AlertTriangle, Luggage, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import TripImageHero from '../TripImageHero'
import DashboardModuleGrid, { ModuleCard } from '../DashboardModuleGrid'
import DashboardSkeleton from '../DashboardSkeleton'
import CollapsibleWidget from '../CollapsibleWidget'
import WidgetManagementPanel from '../WidgetManagementPanel'
import ChecklistCard from '../widgets/ChecklistCard'
import StatusBadge from '../StatusBadge'
import AccommodationCard from '../widgets/AccommodationCard'
import BookingsCard from '../widgets/BookingsCard'
import DocumentsCard from '../widgets/DocumentsCard'
import BudgetSnapshotWidget from '../widgets/BudgetSnapshotWidget'
import NextBestActionCard from '../widgets/NextBestActionCard'
import SafetyStatusCard from '../widgets/SafetyStatusCard'

// Widget configuration for the management panel
const WIDGET_CONFIG = {
  tripTools: { title: 'Planning Checklist', icon: ListChecks, accentColor: 'amber' },
  safetySetup: { title: 'Safety Foundations', icon: Shield, accentColor: 'violet' },
  budget: { title: 'Budget Outlook', icon: DollarSign, accentColor: 'emerald' },
  accommodation: { title: 'Accommodation', icon: MapPin, accentColor: 'blue' },
  bookings: { title: 'Bookings', icon: CalendarDays, accentColor: 'emerald' },
  documents: { title: 'Documents', icon: CheckCircle, accentColor: 'blue' },
}

const PlanningDashboard = ({ trip = null, alerts = [], stats = {}, loading = false }) => {
  // 1. Hooks first - get widget state and helper functions
  const [checklistState, setChecklistState] = useState({
    itinerary: false,
    contacts: false,
    checkins: false,
    places: false,
    budget: false,
    packing: false,
    accommodation: false,
    documents: false,
  })
  
  const [widgetState, setWidgetState, { 
    reorderWidgets, 
    unhideWidget, 
    toggleExpand, 
    expandAll, 
    collapseAll, 
    resetToDefaults,
    orderedKeys,
    defaultWidgetKeys 
  }] = useWidgetState('planning', {
    tripTools: { expanded: true, hidden: false },
    safetySetup: { expanded: true, hidden: false },
    budget: { expanded: false, hidden: false },
    accommodation: { expanded: false, hidden: false },
    bookings: { expanded: false, hidden: false },
    documents: { expanded: false, hidden: false },
  })

  const toggleHide = (key) => {
    setWidgetState(prev => ({ ...prev, [key]: { ...prev[key], hidden: true } }))
  }

  const toggleItem = (key) => {
    setChecklistState(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const checklistItems = useMemo(() => [
    { label: "Draft itinerary", done: checklistState.itinerary, key: "itinerary" },
    { label: "Choose top places to visit", done: checklistState.places, key: "places" },
    { label: "Book accommodation", done: checklistState.accommodation, key: "accommodation" },
    { label: "Set travel budget", done: checklistState.budget, key: "budget" },
    { label: "Emergency contacts", done: checklistState.contacts, key: "contacts" },
    { label: "Safety check-ins", done: checklistState.checkins, key: "checkins" },
  ], [checklistState])

  const progress = useMemo(() => {
    const total = checklistItems.length
    const done = checklistItems.filter(i => i.done).length
    return Math.round((done / total) * 100)
  }, [checklistItems])

  // Calculate visible widget count
  const visibleWidgetCount = useMemo(() => {
    return Object.keys(WIDGET_CONFIG).filter(key => !widgetState[key]?.hidden).length
  }, [widgetState]);

  // 2. Guard AFTER hooks
  if (!trip || !trip.id) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <TripImageHero
        trip={trip} title={`Planning: ${trip?.destination || "New Trip"}`}
        subtitle="Turn your inspiration into a safe, organized mission."
        primaryCta={{ label: "Add to Itinerary", href: `/trips/${trip?.id}` }}
        secondaryCta={{ label: "Research Safe Places", href: "/destinations" }}
        statusPanel={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] opacity-60 font-black uppercase tracking-widest text-base-content">Planning Progress</span>
              <span className="text-sm font-black text-amber-500">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-base-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-base-content/70">
              <Sparkles size={12} className="text-amber-500" /> MISSION IN PREPARATION
            </div>
          </div>
        }
        tripState="planning"
      />

      {/* Widget Management Panel */}
      <WidgetManagementPanel
        widgetStates={widgetState}
        widgetConfig={WIDGET_CONFIG}
        visibleCount={visibleWidgetCount}
        totalCount={Object.keys(WIDGET_CONFIG).length}
        onUnhide={unhideWidget}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onReset={resetToDefaults}
        defaultWidgetKeys={defaultWidgetKeys}
      />

      <DashboardModuleGrid 
        columns={2} 
        widgetStates={widgetState} 
        setWidgetState={setWidgetState}
        onReorder={reorderWidgets}
        orderedKeys={orderedKeys}
        draggable={true}
      >
        <CollapsibleWidget
          key="tripTools" title="Planning Checklist" icon={ListChecks}
          expanded={widgetState.tripTools?.expanded} collapsible={true} hideable={true} hidden={widgetState.tripTools?.hidden}
          onToggleExpand={() => toggleExpand('tripTools')} onHide={() => toggleHide('tripTools')} accentColor="amber"
          draggable={true}
        >
          <ChecklistCard
            items={checklistItems}
            onToggle={(i) => { const key = checklistItems[i]?.key; if(key) toggleItem(key); }}
          />
        </CollapsibleWidget>

        <CollapsibleWidget
          key="safetySetup" title="Safety Foundations" icon={Shield}
          expanded={widgetState.safetySetup?.expanded} collapsible={true} hideable={true} hidden={widgetState.safetySetup?.hidden}
          onToggleExpand={() => toggleExpand('safetySetup')} onHide={() => toggleHide('safetySetup')} accentColor="violet"
          draggable={true}
        >
          <SafetyStatusCard hasContacts={false} contactCount={0} checkInScheduled={false} showHeading={true} />
        </CollapsibleWidget>

        {trip?.budget && (
          <CollapsibleWidget
            key="budget" title="Budget Outlook" icon={DollarSign}
            expanded={widgetState.budget?.expanded} collapsible={true} hideable={true} hidden={widgetState.budget?.hidden}
            onToggleExpand={() => toggleExpand('budget')} onHide={() => toggleHide('budget')} accentColor="emerald"
            draggable={true}
          >
            <BudgetSnapshotWidget tripId={trip?.id} budget={trip?.budget} />
          </CollapsibleWidget>
        )}

        <CollapsibleWidget
          key="accommodation" title="Accommodation" icon={MapPin}
          expanded={widgetState.accommodation?.expanded} collapsible={true} hideable={true} hidden={widgetState.accommodation?.hidden}
          onToggleExpand={() => toggleExpand('accommodation')} onHide={() => toggleHide('accommodation')} accentColor="blue"
          draggable={true}
        >
          <AccommodationCard tripId={trip?.id} accommodation={trip?.accommodation} showHeading={false} loading={loading} />
        </CollapsibleWidget>
      </DashboardModuleGrid>
    </div>
  )
}

export default PlanningDashboard