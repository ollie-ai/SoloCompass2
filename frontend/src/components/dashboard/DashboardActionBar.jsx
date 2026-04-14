import { Link } from 'react-router-dom'
import Button from '../Button'

const DashboardActionBar = ({ primary, secondary, className = "" }) => {
  if (!primary && !secondary?.length) return null
  
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {primary && (
        <Link to={primary.href}>
          <Button variant="primary" className="bg-brand-vibrant hover:bg-brand-vibrant/90 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm shadow-brand-vibrant/20">
            {primary.label}
          </Button>
        </Link>
      )}
      {secondary?.map((action, i) => (
        <Link key={`action-${action.href}-${i}`} to={action.href}>
          <Button variant="secondary" className="bg-base-100 border border-base-300 text-base-content/80 hover:bg-base-200 font-bold px-5 py-2.5 rounded-xl">
            {action.label}
          </Button>
        </Link>
      ))}
    </div>
  )
}

export default DashboardActionBar
