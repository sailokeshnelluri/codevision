import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useRef } from 'react'

function TypeBadge({ type }) {
  const colors = {
    int: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
    float: 'bg-purple-900/40 text-purple-400 border-purple-800/40',
    str: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
    string: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
    bool: 'bg-amber-900/40 text-amber-400 border-amber-800/40',
    boolean: 'bg-amber-900/40 text-amber-400 border-amber-800/40',
    list: 'bg-pink-900/40 text-pink-400 border-pink-800/40',
    array: 'bg-pink-900/40 text-pink-400 border-pink-800/40',
    dict: 'bg-cyan-900/40 text-cyan-400 border-cyan-800/40',
    object: 'bg-cyan-900/40 text-cyan-400 border-cyan-800/40',
    number: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
  }
  const cls = colors[type?.toLowerCase()] || 'bg-slate-800 text-slate-400 border-slate-700'
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${cls}`}>{type}</span>
  )
}

function VarBox({ name, info, isNew, isChanged }) {
  const value = typeof info === 'object' && info !== null ? info.value : info
  const type  = typeof info === 'object' && info !== null ? info.type  : typeof value

  const displayValue = Array.isArray(value)
    ? `[${value.join(', ')}]`
    : String(value)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-all ${
        isChanged
          ? 'bg-cyan-900/20 border-cyan-500/40 var-changed-animate'
          : isNew
          ? 'bg-slate-800/70 border-slate-700/50 var-box-animate'
          : 'bg-slate-800/40 border-slate-700/30'
      }`}
    >
      <span className="font-mono text-cyan-300 text-sm font-semibold min-w-0 truncate">{name}</span>
      <TypeBadge type={type} />
      <span className={`ml-auto font-mono text-sm font-bold truncate max-w-[120px] ${
        isChanged ? 'text-cyan-300' : 'text-green-400'
      }`}>
        {displayValue}
      </span>
      {isChanged && <span className="text-cyan-400 text-xs flex-shrink-0">↑</span>}
    </motion.div>
  )
}

function ArrayViz({ name, values, activeIndex }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3 mb-2">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xs font-mono text-purple-400 font-semibold">{name}</span>
        <span className="text-[10px] text-slate-500">array[{values.length}]</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {values.map((v, i) => (
          <motion.div key={i}
            animate={{ scale: i === activeIndex ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center">
            <div className={`w-9 h-8 flex items-center justify-center rounded text-xs font-mono font-semibold border transition-all ${
              i === activeIndex
                ? 'bg-cyan-900/50 border-cyan-400 text-cyan-300'
                : 'bg-slate-700/50 border-slate-600/50 text-slate-300'
            }`}>
              {String(v)}
            </div>
            <span className="text-[9px] text-slate-600 mt-0.5">[{i}]</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function VariablePanel({ steps, currentStep }) {
  const prevVarsRef = useRef({})

  const { variables, arrays } = useMemo(() => {
    if (currentStep < 0 || !steps[currentStep]) return { variables: {}, arrays: {} }
    const step = steps[currentStep]
    return {
      variables: step.variables || {},
      arrays:    step.arrays    || {},
    }
  }, [steps, currentStep])

  const { newVars, changedVars } = useMemo(() => {
    const prev = prevVarsRef.current
    const newV = {}
    const changedV = {}
    Object.entries(variables).forEach(([k, info]) => {
      const val = typeof info === 'object' ? info.value : info
      if (!(k in prev)) newV[k] = true
      else if (String(prev[k]) !== String(val)) changedV[k] = true
    })
    // Update ref for next render
    const next = {}
    Object.entries(variables).forEach(([k, info]) => {
      next[k] = typeof info === 'object' ? info.value : info
    })
    prevVarsRef.current = next
    return { newVars: newV, changedVars: changedV }
  }, [variables])

  const simpleVars = Object.entries(variables).filter(([, v]) => {
    const val = typeof v === 'object' ? v?.value : v
    return !Array.isArray(val)
  })

  if (currentStep < 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3 py-20">
        <span className="text-4xl">📦</span>
        <p className="text-sm">Run code to see variables</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Arrays */}
      {Object.keys(arrays).length > 0 && (
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-2.5">Arrays</p>
          {Object.entries(arrays).map(([name, info]) => (
            <ArrayViz key={name}
              name={name}
              values={info.values || []}
              activeIndex={info.active_index ?? null}
            />
          ))}
        </div>
      )}

      {/* Scalar variables */}
      {simpleVars.length > 0 && (
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-2.5">Variables</p>
          <div className="space-y-1.5">
            <AnimatePresence>
              {simpleVars.map(([name, info]) => (
                <VarBox key={name}
                  name={name}
                  info={info}
                  isNew={!!newVars[name]}
                  isChanged={!!changedVars[name]}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {simpleVars.length === 0 && Object.keys(arrays).length === 0 && (
        <div className="text-center text-slate-600 text-sm py-8">No variables on this step</div>
      )}
    </div>
  )
}
