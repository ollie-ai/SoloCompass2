import { motion } from 'framer-motion'

const DashboardShell = ({ children, className = "" }) => {
  return (
    <div className="min-h-screen w-full bg-base-200">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:pb-10 pb-24 ${className}`}>
        {children}
      </div>
    </div>
  )
}

export default DashboardShell
