import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function TracePanel({ steps, currentStep, onStepClick }) {
  const activeRef = useRef(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [currentStep])

  if (!steps.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3 py-20">
        <span className="text-4xl">⚡</span>
        <p className="text-sm">Run code to see execution trace</p>
      </div>
    )
  }

  return (
    <div>
      <div className="sticky top-0 flex items-center justify-between px-4 py-2 bg-dark-900/80 backdrop-blur border-b border-white/5 z-10">
        <p className="text-[11px] text-slate-500 uppercase tracking-widest">Execution Trace</p>
        <span className="text-[11px] text-slate-500">{steps.length} steps</span>
      </div>
      <div>
        {steps.map((step, i) => (
          <div
            key={i}
            ref={i === currentStep ? activeRef : null}
            onClick={() => onStepClick(i)}
            className={`flex gap-3 px-4 py-2.5 border-b border-white/[0.03] cursor-pointer transition-all ${
              i === currentStep
                ? 'bg-cyan-900/15 border-l-2 border-l-cyan-400'
                : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
            }`}
          >
            <span className={`text-xs font-mono mt-0.5 w-6 flex-shrink-0 text-right ${
              i === currentStep ? 'text-cyan-400 font-bold' : 'text-slate-600'
            }`}>{step.line}</span>
            <div className="min-w-0">
              <code className={`text-xs block truncate ${
                i === currentStep ? 'text-cyan-300' : 'text-slate-400'
              }`}>{step.code?.trim()}</code>
              {step.explanation && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.explanation}</p>
              )}
            </div>
            {i === currentStep && (
              <span className="ml-auto flex-shrink-0 text-cyan-400 text-xs">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
