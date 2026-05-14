import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'

const features = [
  { icon: '⚡', title: 'Step-by-Step Execution', desc: 'Watch your code run line by line with animated highlighting' },
  { icon: '🧠', title: 'AI Explanations', desc: 'Claude explains every line in plain English for beginners' },
  { icon: '📦', title: 'Variable Visualization', desc: 'See variables, arrays, and memory change in real time' },
  { icon: '📚', title: 'Call Stack View', desc: 'Understand function calls, recursion, and scope visually' },
  { icon: '🐛', title: 'Error Detection', desc: 'AI detects logical mistakes and suggests fixes' },
  { icon: '💾', title: 'Save Projects', desc: 'Save your code and visualizations to revisit later' },
]

const languages = [
  { name: 'Python', color: '#3776ab', icon: '🐍' },
  { name: 'JavaScript', color: '#f7df1e', icon: '🟨' },
  { name: 'C',      color: '#555', icon: '⚙️' },
  { name: 'C++',    color: '#00599c', icon: '🔷' },
  { name: 'Java',   color: '#e76f00', icon: '☕' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }

export default function LandingPage() {
  const { token } = useAuthStore()

  return (
    <div className="min-h-screen animated-bg">
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-base">⚡</div>
          <span className="text-xl font-bold gradient-text">CodeVision</span>
        </div>
        <div className="flex items-center gap-3">
          {token ? (
            <Link to="/playground" className="btn-primary">Open Playground →</Link>
          ) : (
            <>
              <Link to="/login"    className="btn-secondary text-sm">Sign In</Link>
              <Link to="/register" className="btn-primary  text-sm">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-block text-xs font-semibold text-purple-400 border border-purple-500/30 bg-purple-500/10 px-3 py-1 rounded-full mb-6 tracking-wider uppercase">
            AI-Powered Code Learning
          </span>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">See your code</span><br />
            <span className="gradient-text">come to life</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            CodeVision visualizes code execution step by step — showing variables, memory, and stack frames — while AI explains each line in plain English.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to={token ? '/playground' : '/register'}
              className="btn-primary text-base py-3 px-8 glow-cyan">
              ▶ Start Visualizing
            </Link>
            <Link to="/login" className="btn-secondary text-base py-3 px-6">
              Watch Demo
            </Link>
          </div>
        </motion.div>

        {/* HERO PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 rounded-2xl border border-white/10 overflow-hidden glass-card glow-purple"
          style={{ background: 'rgba(13,18,33,0.9)' }}
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
            <span className="ml-3 text-xs text-slate-500 font-mono">playground.py</span>
            <span className="ml-auto text-xs text-emerald-400 font-semibold animate-pulse">● Running</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-white/5" style={{ minHeight: 260 }}>
            <div className="p-5 font-mono text-sm text-left">
              {[
                { line: 1, code: 'numbers = [1, 2, 3, 4, 5]', active: false },
                { line: 2, code: 'total = 0', active: false },
                { line: 3, code: '', active: false },
                { line: 4, code: 'for num in numbers:', active: true },
                { line: 5, code: '    total = total + num', active: false },
                { line: 6, code: '', active: false },
                { line: 7, code: 'print("Sum:", total)', active: false },
              ].map(({ line, code, active }) => (
                <div key={line}
                  className={`flex gap-3 px-2 py-0.5 rounded transition-all ${active ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''}`}>
                  <span className="text-slate-600 select-none w-4">{line}</span>
                  <span className={active ? 'text-cyan-300' : 'text-slate-400'}>{code || ' '}</span>
                </div>
              ))}
            </div>
            <div className="p-5 text-left space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Variables</p>
              {[
                { name: 'numbers', type: 'list',  value: '[1,2,3,4,5]', color: 'text-purple-400' },
                { name: 'total',   type: 'int',   value: '6',           color: 'text-green-400' },
                { name: 'num',     type: 'int',   value: '3',           color: 'text-cyan-400', changed: true },
              ].map(v => (
                <div key={v.name}
                  className={`flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 border ${v.changed ? 'border-cyan-500/50' : 'border-slate-700/50'}`}>
                  <span className="text-cyan-400 text-xs font-mono">{v.name}</span>
                  <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">{v.type}</span>
                  <span className={`ml-auto text-sm font-bold font-mono ${v.color}`}>{v.value}</span>
                </div>
              ))}
              <div className="mt-4 p-3 rounded-lg bg-purple-900/20 border border-purple-500/20 text-xs text-purple-300">
                🤖 <strong>AI:</strong> The loop is on iteration 3. Variable <code className="text-cyan-300">num</code> now holds <code className="text-green-400">3</code> and <code className="text-cyan-300">total</code> has accumulated to <code className="text-green-400">6</code>.
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* LANGUAGES */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <p className="text-center text-sm text-slate-500 mb-6 uppercase tracking-widest">Supports</p>
        <div className="flex justify-center gap-6 flex-wrap">
          {languages.map(l => (
            <div key={l.name} className="flex items-center gap-2 glass-card px-5 py-2.5 rounded-full text-sm text-slate-300">
              <span>{l.icon}</span>{l.name}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="gradient-text">Everything you need</span> to understand code
        </h2>
        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(f => (
            <motion.div key={f.title} variants={item}
              className="glass-card p-6 rounded-xl hover:border-white/20 transition-all duration-300 group">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-8 pb-24 text-center">
        <div className="glass-card p-12 rounded-2xl border-purple-500/20">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to see your code differently?</h2>
          <p className="text-slate-400 mb-8">Join thousands of students learning to code visually.</p>
          <Link to="/register" className="btn-primary text-base py-3 px-10 inline-flex glow-cyan">
            Get Started — It's Free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-8 py-6 text-center text-slate-600 text-sm">
        © {new Date().getFullYear()} CodeVision. Built for learners everywhere.
      </footer>
    </div>
  )
}
