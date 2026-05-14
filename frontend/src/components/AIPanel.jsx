export default function AIPanel({ explanation, loading, step, onExplain }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🤖</span>
        <span className="text-sm font-semibold text-white">AI Explanation</span>
        <span className="text-[10px] bg-purple-900/40 text-purple-400 border border-purple-700/40 px-2 py-0.5 rounded-full ml-1">Claude</span>
        <button onClick={onExplain}
          className="ml-auto text-xs text-cyan-400 border border-cyan-600/30 bg-cyan-900/20 hover:bg-cyan-900/40 px-3 py-1 rounded-lg transition-all">
          ✨ Deep Explain
        </button>
      </div>

      {/* Current step */}
      {step && (
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3 mb-4">
          <p className="text-[10px] text-slate-500 mb-1">Current line</p>
          <code className="text-xs text-cyan-300">{step.code?.trim()}</code>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[80, 95, 60].map((w, i) => (
            <div key={i} className={`h-3 bg-slate-700/50 rounded shimmer`} style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : explanation ? (
        <div className="text-sm text-slate-300 leading-relaxed bg-purple-900/10 border border-purple-700/20 rounded-lg p-4">
          {explanation}
        </div>
      ) : (
        <div className="text-sm text-slate-600 italic">
          {step ? 'Step through code to see AI explanations' : 'Run code first to see AI explanations'}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6">
        <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-3">💡 Learning Tips</p>
        <div className="space-y-2">
          {[
            'Use Play to watch the animation automatically',
            'Click any trace step to jump to it',
            'Watch the Variables panel for memory changes',
            'The Call Stack shows your function depth',
          ].map((tip, i) => (
            <div key={i} className="flex gap-2 text-xs text-slate-500">
              <span className="text-cyan-600 flex-shrink-0">→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
