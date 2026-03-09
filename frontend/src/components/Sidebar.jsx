export default function Sidebar({ examples, history, onSelect, onClear, loading, hasResults }) {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-sidebar text-white max-md:hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
          <span className="text-lg">&#9917;</span> KrishAI
        </h1>
        <p className="text-[11px] text-emerald-500/70 mt-0.5 uppercase tracking-wider font-medium">
          FC 25 Analytics
        </p>
      </div>

      {/* Examples — lineup card style */}
      <div className="px-4 pt-5 pb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/50 px-1 flex items-center gap-1.5">
          <span className="inline-block w-3 h-[2px] bg-emerald-500/40 rounded" />
          Starting XI Queries
        </h2>
      </div>
      <ul className="px-3 space-y-0.5 flex-1 overflow-y-auto">
        {examples.map((q, i) => (
          <li key={q}>
            <button
              onClick={() => !loading && onSelect(q)}
              disabled={loading}
              className="w-full text-left px-2 py-2 text-[13px] text-emerald-100/70 rounded-md hover:bg-sidebar-light hover:text-white transition-colors disabled:opacity-40 leading-snug flex items-start gap-2"
            >
              <span className="text-emerald-500/40 font-bold text-[11px] mt-px shrink-0 w-4 text-right">
                {i + 1}
              </span>
              <span>{q}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* History */}
      {history.length > 0 && (
        <>
          <div className="px-4 pt-4 pb-2 border-t border-sidebar-border flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/50 px-1 flex items-center gap-1.5">
              <span className="inline-block w-3 h-[2px] bg-emerald-500/40 rounded" />
              Match History
            </h2>
            {hasResults && (
              <button
                onClick={onClear}
                className="text-[11px] text-emerald-500/40 hover:text-emerald-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="px-3 pb-4 space-y-0.5 max-h-48 overflow-y-auto">
            {history.slice(0, 5).map((q, i) => (
              <li key={i}>
                <button
                  onClick={() => !loading && onSelect(q)}
                  disabled={loading}
                  className="w-full text-left px-2 py-1.5 text-[13px] text-emerald-100/50 rounded-md hover:bg-sidebar-light hover:text-white transition-colors disabled:opacity-40 truncate"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Powered by Claude */}
      <div className="px-5 py-4 border-t border-sidebar-border mt-auto">
        <p className="text-[11px] text-emerald-900/60">
          Powered by Claude
        </p>
      </div>
    </aside>
  );
}
