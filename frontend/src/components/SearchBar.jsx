import { useState } from "react";

export default function SearchBar({ onSubmit, loading }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const q = value.trim();
    if (!q || loading) return;
    onSubmit(q);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about FC 25 players, clubs, stats..."
          className="w-full rounded-lg border border-field-line bg-white px-4 py-3 pr-12 text-sm text-black placeholder-neutral-400 outline-none transition-all focus:border-pitch focus:ring-2 focus:ring-pitch/10"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-pitch p-2 text-white transition-opacity hover:bg-pitch-dark disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </form>
  );
}
