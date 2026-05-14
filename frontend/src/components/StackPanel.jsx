import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

export default function StackPanel({ steps, currentStep }) {
  const stack = useMemo(() => {
    if (currentStep < 0 || !steps[currentStep]) return []
    return steps[currentStep].stack || []
  }, [steps, currentStep])

  if (currentStep < 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3 py-20">
        <span className="text-4xl">📚</span>
        <p className="text-sm">Run code to see call stack</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-3">
        Call Stack — {stack.length} frame{stack.length !== 1 ? 's' : ''}
      </p>

      {stack.length === 0 ? (
        <div className="text-center text-slate-600 text-sm py-8">Empty stack</div>
      ) : (
        <div className="space-y-1.5">
          {/* Render top of stack first (most recent call) */}
          {[...stack].reverse().map((frame, i) => (
            <motion.div
              key={`${frame.name}-${i}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all stack-push-animate ${
                i === 0
                  ? 'bg-purple-900/20 border-purple-500/40 text-purple-300'
                  : 'bg-slate-800/40 border-slate-700/30 text-slate-400'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-purple-400' : 'bg-slate-600'}`} />
              <span className="font-mono text-sm font-semibold">{frame.name}</span>
              <span className="ml-auto text-xs text-slate-500">line {frame.line}</span>
              {i === 0 && <span className="text-[10px] text-purple-400 border border-purple-500/40 px-1.5 py-0.5 rounded">active</span>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Stack memory diagram */}
      {stack.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-3">Memory Layout</p>
          <div className="border border-slate-700/50 rounded-lg overflow-hidden">
            <div className="bg-slate-800/30 px-3 py-1.5 text-[10px] text-slate-500 text-center border-b border-slate-700/50">
              ▲ Stack grows upward
            </div>
            {[...stack].map((frame, i) => (
              <div key={i} className={`px-4 py-3 border-b border-slate-700/30 last:border-0 ${
                i === stack.length - 1 ? 'bg-purple-900/10' : 'bg-slate-800/20'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-slate-300">{frame.name}()</span>
                  <span className="text-[10px] text-slate-600">frame #{i + 1}</span>
                </div>
              </div>
            ))}
            <div className="bg-slate-900/50 px-3 py-1.5 text-[10px] text-slate-600 text-center">
              Heap memory →
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
