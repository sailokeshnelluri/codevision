import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { projectsAPI } from '../services/api'
import Navbar from '../components/Navbar'

const LANG_ICONS = { python: '🐍', javascript: '🟨', c: '⚙️', 'c++': '🔷', java: '☕' }

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  const load = () => {
    setLoading(true)
    projectsAPI.list()
      .then(r => setProjects(r.data))
      .catch(() => toast.error('Could not load projects'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const remove = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await projectsAPI.delete(id)
      setProjects(p => p.filter(x => x.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Could not delete')
    }
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.language.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Projects</h1>
            <p className="text-slate-400 text-sm mt-1">{projects.length} saved projects</p>
          </div>
          <Link to="/playground" className="btn-primary text-sm">+ New Project</Link>
        </div>

        <input className="input-field mb-6" placeholder="Search projects…"
          value={search} onChange={e => setSearch(e.target.value)} />

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-xl h-32 shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <div className="text-5xl mb-4">📭</div>
            <p>{search ? 'No matching projects' : 'No projects yet'}</p>
            <Link to="/playground" className="btn-primary inline-flex mt-4">Start Coding</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}>
                  <div className="glass-card p-5 rounded-xl hover:border-white/20 transition-all group relative">
                    <Link to={`/playground/${p.id}`} className="block">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{LANG_ICONS[p.language] || '📄'}</span>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full capitalize">{p.language}</span>
                      </div>
                      <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate mb-1">{p.name}</h3>
                      <p className="text-xs text-slate-600">{new Date(p.updated_at).toLocaleDateString()}</p>
                    </Link>
                    <button onClick={() => remove(p.id)}
                      className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100">
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
