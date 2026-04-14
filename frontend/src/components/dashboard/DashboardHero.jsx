import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Calendar, MapPin, ShieldCheck, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../Button'
import StatusBadge from './StatusBadge'

const heroIcons = {
  no_trips: Compass,
  planning: MapPin,
  upcoming: Calendar,
  live_trip: ShieldCheck,
  completed: CheckCircle,
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
}

const DashboardHero = ({ state, trip, title, subtitle, primaryCta, secondaryCta, statusPanel, className = "" }) => {
  const Icon = heroIcons[state] || Compass
  const isLive = state === 'live_trip'
  const isCompleted = state === 'completed'
  
  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative glass-card !bg-base-100/60 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden ${isLive ? 'border-t-2 border-t-brand-vibrant/50' : ''} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-vibrant/[0.05] via-transparent to-brand-accent/[0.05] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-vibrant/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-brand-accent/20 rounded-full blur-[80px] pointer-events-none" />
      {isLive && <div className="absolute top-0 right-0 w-80 h-80 bg-brand-vibrant/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />}
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-8 p-6 sm:p-8 lg:p-10"
      >
        <motion.div variants={itemVariants} className="flex-1 min-w-0 w-full lg:w-auto">
          <div className="flex items-start sm:items-center gap-4 mb-6">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-base-200 to-base-100 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg"
              animate={isLive ? { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon size={28} className="text-brand-vibrant drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-outfit font-black text-base-content tracking-tight leading-[1.1]">
                  {isCompleted ? (
                    <>Trip <span className="text-gradient">Archived</span></>
                  ) : isLive ? (
                    <>Precision <span className="text-gradient">Navigation</span></>
                  ) : (
                    title
                  )}
                </h1>
                {isLive && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-vibrant/10 border border-brand-vibrant/20 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-brand-vibrant animate-ping" />
                    <span className="text-[10px] font-black text-brand-vibrant uppercase tracking-[0.2em]">Signal: Active</span>
                  </span>
                )}
              </div>
              {subtitle && <p className="text-base sm:text-lg text-base-content/50 font-bold mt-2 tracking-tight">{subtitle}</p>}
            </div>
          </div>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-4 mt-6 lg:mt-8">
            {primaryCta && (
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link to={primaryCta.href}>
                  <Button variant="primary" className="btn-premium px-8 py-3.5 !rounded-2xl w-full sm:w-auto text-lg">
                    {primaryCta.label}
                  </Button>
                </Link>
              </motion.div>
            )}
            {secondaryCta && (
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link to={secondaryCta.href} className="w-full">
                  <Button variant="secondary" className="bg-white/5 border border-white/10 text-base-content hover:bg-white/10 backdrop-blur-md font-black px-8 py-3.5 !rounded-2xl transition-all w-full sm:w-auto text-lg shadow-sm">
                    {secondaryCta.label}
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        
        {statusPanel && (
          <motion.div variants={itemVariants} className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              {statusPanel}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default DashboardHero
