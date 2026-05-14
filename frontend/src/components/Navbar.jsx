import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'

export default function Navbar({ compact = false }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  if (compact) {
    return (
      <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold gradient-text flex-shrink-0">
        <span>⚡</span> CV
      </Link>
    )
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-dark-800/50 border-b border-white/5">
      <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold gradient-text">
        <span>⚡</span> CodeVision
      </Link>
      <div className="flex items-center gap-2">
        <Link to="/playground" className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
          Playground
        </Link>
        <Link to="/projects" className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
          Projects
        </Link>
        <div className="ml-2 flex items-center gap-2">
          <span className="text-sm text-slate-400">{user?.name}</span>
          <button onClick={logout}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 border border-slate-700 rounded-lg">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
