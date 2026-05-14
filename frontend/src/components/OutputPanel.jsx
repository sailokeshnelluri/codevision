export default function OutputPanel({ output, error }) {
  if (!output && !error) return null

  return (
    <div className="border-t border-white/5 bg-black/30" style={{ maxHeight: 120, overflowY: 'auto' }}>
      <div className="px-4 py-2 text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
        Console Output
      </div>
      <div className="px-4 py-3 font-mono text-xs">
        {error && (
          <div className="text-red-400 whitespace-pre-wrap mb-1">
            <span className="text-red-600">ERROR: </span>{error}
          </div>
        )}
        {output && (
          <div className="text-green-400 whitespace-pre-wrap">{output}</div>
        )}
      </div>
    </div>
  )
}
