import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '../hooks/useAuthStore'
import { projectsAPI } from '../services/api'
import Navbar from '../components/Navbar'

const LANG_ICONS = { python: '🐍', javascript: '🟨', c: '⚙️', 'c++': '🔷', java: '☕' }

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    projectsAPI.list()
      .then(r => setProjects(r.data.slice(0, 6)))
      .catch(() => toast.error('Could not load projects'))
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Projects',   value: projects.length, icon: '📁' },
    { label: 'Lines Visualized', value: '—',        icon: '📊' },
    { label: 'AI Explanations',  value: '—',        icon: '🤖' },
  ]

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name || 'Coder'}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1 mb-8">Ready to visualize some code today?</p>
        </motion.div>

        {/* Quick actions */}
        <div className="flex gap-4 mb-10 flex-wrap">
          <Link to="/playground" className="btn-primary text-sm py-2.5 px-5">
            ▶ New Playground
          </Link>
          <Link to="/projects" className="btn-secondary text-sm py-2.5 px-5">
            📁 All Projects
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map(s => (
            <div key={s.label} className="glass-card p-5 rounded-xl">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent projects */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-cyan-400 hover:text-cyan-300">View all →</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl h-28 shimmer" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <p className="text-slate-400 mb-4">No projects yet. Create your first one!</p>
              <Link to="/playground" className="btn-primary inline-flex">▶ Start Coding</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}>
                  <Link to={`/playground/${p.id}`}
                    className="glass-card p-5 rounded-xl block hover:border-white/20 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{LANG_ICONS[p.language] || '📄'}</span>
                      <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{p.language}</span>
                    </div>
                    <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{new Date(p.updated_at).toLocaleDateString()}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
