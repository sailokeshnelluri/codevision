import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

// ── Helpers ──────────────────────────────────────────────
function getStepType(step) {
  if (!step) return 'default'
  const code = (step.code || '').trim()
  const lang = code.toLowerCase()

  if (code.includes('def ') || code.includes('function ') ||
      code.includes('void ') || code.includes('public '))      return 'function'
  if (code.includes('for ') || code.includes('while '))        return 'loop'
  if (code.includes('if ') || code.includes('else'))           return 'condition'
  if (code.includes('return'))                                  return 'return'
  if (code.includes('print') || code.includes('console.log') ||
      code.includes('System.out') || code.includes('printf'))  return 'print'
  if (code.includes('=') && !code.includes('=='))              return 'assignment'
  return 'default'
}

// ── Assignment Visual ─────────────────────────────────────
function AssignmentVisual({ step }) {
  const vars = Object.entries(step.variables || {})
    .filter(([, v]) => {
      const val = typeof v === 'object' ? v?.value : v
      return !Array.isArray(val)
    })
    .slice(-3)

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-3xl">📦</div>
      <p className="text-xs text-slate-400 uppercase tracking-widest">Memory Assignment</p>
      <div className="flex gap-3 flex-wrap justify-center">
        {vars.map(([name, info]) => {
          const val = typeof info === 'object' ? info?.value : info
          const type = typeof info === 'object' ? info?.type : typeof val
          const changed = typeof info === 'object' ? info?.changed : false
          return (
            <motion.div
              key={name}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`flex flex-col items-center gap-1 ${changed ? 'scale-110' : ''}`}
            >
              {/* Memory box */}
              <div className={`w-20 h-16 rounded-lg border-2 flex items-center justify-center font-mono text-lg font-bold transition-all ${
                changed
                  ? 'border-cyan-400 bg-cyan-900/30 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'border-slate-600 bg-slate-800/50 text-slate-300'
              }`}>
                {String(val)}
              </div>
              {/* Arrow */}
              <div className="text-slate-500 text-xs">▲</div>
              {/* Variable name label */}
              <div className={`text-xs font-mono px-2 py-0.5 rounded ${
                changed ? 'text-cyan-400 bg-cyan-900/20' : 'text-slate-400'
              }`}>
                {name}
              </div>
              <div className="text-[10px] text-slate-600">{type}</div>
            </motion.div>
          )
        })}
      </div>
      {vars.length === 0 && (
        <p className="text-slate-600 text-sm">No variables yet</p>
      )}
    </div>
  )
}

// ── Loop Visual ───────────────────────────────────────────
function LoopVisual({ step }) {
  const arrays = Object.entries(step.arrays || {})
  const vars = Object.entries(step.variables || {})

  // Find loop counter variable (i, j, num, etc.)
  const loopVar = vars.find(([k]) => ['i','j','k','n','num','idx','index','count','x'].includes(k))

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="text-4xl"
      >
        🔄
      </motion.div>
      <p className="text-xs text-slate-400 uppercase tracking-widest">Loop Iteration</p>

      {/* Loop counter */}
      {loopVar && (
        <motion.div
          key={String(loopVar[1]?.value ?? loopVar[1])}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3 bg-slate-800/50 border border-purple-500/40 rounded-xl px-5 py-3"
        >
          <span className="text-purple-400 font-mono text-sm">{loopVar[0]}</span>
          <span className="text-slate-500">=</span>
          <span className="text-2xl font-bold text-purple-300 font-mono">
            {String(typeof loopVar[1] === 'object' ? loopVar[1]?.value : loopVar[1])}
          </span>
        </motion.div>
      )}

      {/* Array visualization */}
      {arrays.map(([name, info]) => (
        <div key={name} className="w-full px-4">
          <p className="text-[10px] text-slate-500 mb-1 text-center">{name}[]</p>
          <div className="flex gap-1 justify-center flex-wrap">
            {(info.values || []).map((v, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i === info.active_index ? 1.2 : 1,
                  backgroundColor: i === info.active_index ? 'rgba(96,216,255,0.2)' : 'rgba(30,42,64,0.8)'
                }}
                className="flex flex-col items-center"
              >
                <div className={`w-10 h-9 rounded flex items-center justify-center text-xs font-mono font-bold border ${
                  i === info.active_index
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-slate-600 text-slate-400'
                }`}>
                  {String(v)}
                </div>
                <span className="text-[9px] text-slate-600 mt-0.5">[{i}]</span>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Function Call Visual ──────────────────────────────────
function FunctionVisual({ step }) {
  const stack = step.stack || []

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-3xl">📚</div>
      <p className="text-xs text-slate-400 uppercase tracking-widest">Function Call Stack</p>

      <div className="w-full px-6 space-y-1.5">
        {[...stack].reverse().map((frame, i) => (
          <motion.div
            key={`${frame.name}-${i}`}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${
              i === 0
                ? 'bg-purple-900/30 border-purple-400/50 text-purple-300'
                : 'bg-slate-800/40 border-slate-600/40 text-slate-400'
            }`}
          >
            <span className="text-xs">{i === 0 ? '▶' : '  '}</span>
            <span className="font-mono text-sm font-semibold">{frame.name}()</span>
            <span className="ml-auto text-[10px] text-slate-500">line {frame.line}</span>
          </motion.div>
        ))}

        {/* Stack base */}
        <div className="border-t-2 border-slate-600 mt-1 pt-1 text-center">
          <span className="text-[10px] text-slate-600">── Stack Base ──</span>
        </div>
      </div>
    </div>
  )
}

// ── Condition Visual ──────────────────────────────────────
function ConditionVisual({ step }) {
  const code = step.code || ''
  const isTrue = !code.includes('False') && !code.includes('false') && !code.includes('else')

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-3xl">🔀</div>
      <p className="text-xs text-slate-400 uppercase tracking-widest">Condition Check</p>

      {/* Diamond shape */}
      <div className="relative flex flex-col items-center gap-2">
        <div className="w-24 h-24 bg-amber-900/20 border-2 border-amber-500/50 rotate-45 flex items-center justify-center">
          <span className="text-amber-400 text-xs font-bold -rotate-45 text-center leading-tight px-1">
            {code.trim().replace('if ', '').replace(':', '')}
          </span>
        </div>

        {/* True / False branches */}
        <div className="flex gap-12 mt-2">
          <motion.div
            animate={{ scale: isTrue ? 1.1 : 0.9, opacity: isTrue ? 1 : 0.4 }}
            className="flex flex-col items-center gap-1"
          >
            <div className={`px-4 py-1.5 rounded-lg border text-xs font-bold ${
              isTrue ? 'border-green-400 bg-green-900/30 text-green-400' : 'border-slate-600 text-slate-500'
            }`}>TRUE</div>
          </motion.div>
          <motion.div
            animate={{ scale: !isTrue ? 1.1 : 0.9, opacity: !isTrue ? 1 : 0.4 }}
            className="flex flex-col items-center gap-1"
          >
            <div className={`px-4 py-1.5 rounded-lg border text-xs font-bold ${
              !isTrue ? 'border-red-400 bg-red-900/30 text-red-400' : 'border-slate-600 text-slate-500'
            }`}>FALSE</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ── Print Visual ──────────────────────────────────────────
function PrintVisual({ step }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: 2 }}
        className="text-4xl"
      >
        🖨️
      </motion.div>
      <p className="text-xs text-slate-400 uppercase tracking-widest">Output</p>
      {step.output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 border border-green-500/30 rounded-lg px-6 py-3 font-mono text-green-400 text-sm"
        >
          {String(step.output)}
        </motion.div>
      )}
      <div className="text-xs text-slate-500 font-mono mt-1 opacity-60">
        {(step.code || '').trim()}
      </div>
    </div>
  )
}

// ── Return Visual ─────────────────────────────────────────
function ReturnVisual({ step }) {
  const code = step.code || ''
  const returnVal = code.replace('return', '').trim()

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.8, repeat: 3 }}
        className="text-4xl"
      >
        ↩️
      </motion.div>
      <p className="text-xs text-slate-400 uppercase tracking-widest">Return Value</p>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="bg-emerald-900/20 border border-emerald-500/40 rounded-xl px-8 py-4 text-center"
      >
        <p className="text-xs text-emerald-500 mb-1">returning</p>
        <p className="text-2xl font-bold font-mono text-emerald-400">{returnVal}</p>
      </motion.div>
    </div>
  )
}

// ── Default Visual ────────────────────────────────────────
function DefaultVisual({ step }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-3xl">⚡</div>
      <p className="text-xs text-slate-400 uppercase tracking-widest">Executing</p>
      <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-6 py-3 font-mono text-slate-300 text-sm max-w-full text-center">
        {(step.code || '').trim()}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────
export default function PictorialPanel({ steps, currentStep }) {
  const step = useMemo(() => {
    if (currentStep < 0 || !steps[currentStep]) return null
    return steps[currentStep]
  }, [steps, currentStep])

  const stepType = getStepType(step)

  const typeConfig = {
    assignment: { label: 'Variable Assignment', color: 'text-cyan-400',   icon: '📦' },
    loop:       { label: 'Loop Iteration',       color: 'text-purple-400', icon: '🔄' },
    function:   { label: 'Function Call',        color: 'text-amber-400',  icon: '📚' },
    condition:  { label: 'Condition Branch',     color: 'text-yellow-400', icon: '🔀' },
    print:      { label: 'Output Statement',     color: 'text-green-400',  icon: '🖨️' },
    return:     { label: 'Return Statement',     color: 'text-emerald-400',icon: '↩️' },
    default:    { label: 'Execution',            color: 'text-slate-400',  icon: '⚡' },
  }

  const config = typeConfig[stepType] || typeConfig.default

  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3 py-20">
        <span className="text-5xl">🎬</span>
        <p className="text-sm">Run code to see pictorial execution</p>
      </div>
    )
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-semibold uppercase tracking-widest ${config.color}`}>
          {config.icon} {config.label}
        </span>
        <span className="ml-auto text-[10px] text-slate-600">
          Line {step.line}
        </span>
      </div>

      {/* Current code */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg px-4 py-2 mb-4 font-mono text-xs text-slate-300">
        <span className="text-slate-600 mr-2">{step.line}</span>
        {(step.code || '').trim()}
      </div>

      {/* Pictorial visualization */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentStep}-${stepType}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/40 border border-slate-700/30 rounded-xl min-h-48"
        >
          {stepType === 'assignment' && <AssignmentVisual step={step} />}
          {stepType === 'loop'       && <LoopVisual       step={step} />}
          {stepType === 'function'   && <FunctionVisual   step={step} />}
          {stepType === 'condition'  && <ConditionVisual  step={step} />}
          {stepType === 'print'      && <PrintVisual      step={step} />}
          {stepType === 'return'     && <ReturnVisual     step={step} />}
          {stepType === 'default'    && <DefaultVisual    step={step} />}
        </motion.div>
      </AnimatePresence>

      {/* Explanation */}
      {step.explanation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-3 bg-purple-900/10 border border-purple-700/20 rounded-lg"
        >
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-purple-400 font-semibold">💡 </span>
            {step.explanation}
          </p>
        </motion.div>
      )}

      {/* Memory address simulation */}
      <div className="mt-4 p-3 bg-slate-900/30 border border-slate-700/20 rounded-lg">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">Memory Address (simulated)</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(step.variables || {}).slice(0, 4).map(([name], i) => (
            <div key={name} className="flex items-center gap-1">
              <span className="text-[10px] text-cyan-600 font-mono">{name}</span>
              <span className="text-[10px] text-slate-600">→</span>
              <span className="text-[10px] text-slate-500 font-mono">
                0x{(0x1000 + i * 4).toString(16).toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}