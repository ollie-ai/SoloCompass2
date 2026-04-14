import { motion } from 'framer-motion'
import { CheckCircle, Plus, FileText, Luggage, ArrowRight, Calendar, MapPin, DollarSign, Star, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import TripImageHero from '../TripImageHero'
import DashboardModuleGrid, { ModuleCard } from '../DashboardModuleGrid'
import DashboardSkeleton from '../DashboardSkeleton'
import Button from '../../Button'
import { useWidgetState } from '../../../hooks/useWidgetState'

const CompletedDashboard = ({ trip = null, alerts = [], stats = {} }) => {
  const [widgetState, setWidgetState] = useWidgetState('completed', {
    statsCard: { expanded: true, hidden: false },
    memories: { expanded: true, hidden: false },
  })

  if (!trip || !trip.id) return <DashboardSkeleton />

  const tripDuration = (() => {
    if (!trip?.start_date || !trip?.end_date) return null
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  })()

  return (
    <div className="space-y-6">
      <TripImageHero
        trip={trip}
        title={`${trip?.destination || "Trip"} Completed`}
        subtitle="Review your trip, keep what mattered, and plan the next one."
        primaryCta={{ label: "Plan your next trip", href: "/trips/new" }}
        secondaryCta={{ label: "View trip summary", href: `/trips/${trip?.id}` }}
        overlay="dark"
        statusPanel={
          <div className="space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
              className="flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-brand-vibrant flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle size={32} className="text-white" />
              </div>
            </motion.div>
            <div className="text-center">
              <span className="text-sm font-bold text-white">Trip complete</span>
            </div>
          </div>
        }
        tripState="completed"
      />

      <DashboardModuleGrid widgetStates={widgetState} setWidgetState={setWidgetState} columns={2}>
        <ModuleCard key="statsCard" accentColor="emerald">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <Star size={18} className="text-emerald-500" /> Mission Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-base-200/50">
              <p className="text-[10px] text-base-content/40 uppercase font-black">Duration</p>
              <p className="text-xl font-black">{tripDuration || "--"} Days</p>
            </div>
            <div className="p-3 rounded-xl bg-base-200/50">
              <p className="text-[10px] text-base-content/40 uppercase font-black">Saved Places</p>
              <p className="text-xl font-black">{stats?.placesSaved || 0}</p>
            </div>
          </div>
        </ModuleCard>
      </DashboardModuleGrid>
    </div>
  )
}

export default CompletedDashboard
