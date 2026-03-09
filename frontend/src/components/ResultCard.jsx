import { useState, useMemo, useRef, useEffect } from "react";
import ChartView, { detectChart } from "./ChartView";
import SQLHighlight from "./SQLHighlight";

const RATING_COLS = new Set(["overall_rating", "potential", "pace", "shooting", "passing", "dribbling", "defending", "physic"]);
const EUR_COLS = new Set(["value_eur", "wage_eur", "release_clause_eur"]);

function formatEur(val) {
  const n = Number(val);
  if (isNaN(n)) return String(val);
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}K`;
  return `€${n}`;
}

function RatingBadge({ value }) {
  const n = Number(value);
  if (isNaN(n)) return <span>{String(value)}</span>;

  let bg, text;
  if (n >= 85) {
    bg = "bg-emerald-500";
    text = "text-white";
  } else if (n >= 75) {
    bg = "bg-amber-400";
    text = "text-amber-900";
  } else {
    bg = "bg-neutral-300";
    text = "text-neutral-700";
  }

  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${bg} ${text}`}>
      {n}
    </span>
  );
}

function CellValue({ col, value }) {
  if (value === null) return <span className="text-neutral-300 italic">-</span>;

  const colLower = col.toLowerCase();

  if (RATING_COLS.has(colLower) && !isNaN(Number(value))) {
    return <RatingBadge value={value} />;
  }

  if (EUR_COLS.has(colLower) && !isNaN(Number(value))) {
    return <span className="font-medium tabular-nums">{formatEur(value)}</span>;
  }

  return <>{String(value)}</>;
}

export default function ResultCard({ result, isNew }) {
  const [showSQL, setShowSQL] = useState(false);
  const ref = useRef(null);

  const chart = useMemo(
    () => detectChart(result.columns, result.rows),
    [result.columns, result.rows]
  );

  useEffect(() => {
    if (isNew && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isNew]);

  return (
    <div ref={ref} className="animate-fade-in rounded-lg bg-white border border-field-line shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-5 bg-gradient-to-r from-pitch-deeper via-pitch-dark to-pitch flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-[15px] font-bold text-white leading-snug truncate">
            {result.question || "Raw SQL Query"}
          </h3>
          <span className="shrink-0 inline-flex items-center justify-center bg-white/15 text-[11px] font-bold text-emerald-200 rounded-full px-2.5 py-0.5 tabular-nums">
            {result.row_count}
          </span>
        </div>
        <button
          onClick={() => setShowSQL(!showSQL)}
          className="shrink-0 text-[11px] text-emerald-300/50 hover:text-white transition-colors border border-emerald-300/20 rounded px-2.5 py-1"
        >
          {showSQL ? "Hide" : "Show"} SQL
        </button>
      </div>

      {/* SQL */}
      {showSQL && (
        <div className="px-5 py-3 border-b border-field-line bg-pitch-deeper/5">
          <SQLHighlight sql={result.sql} />
        </div>
      )}

      {/* Chart */}
      <ChartView chart={chart} columns={result.columns} rows={result.rows} />

      {/* Table */}
      {result.row_count > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pitch/[0.06]">
                {result.columns.map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-[11px] font-extrabold text-pitch-deeper uppercase tracking-wider whitespace-nowrap border-b-2 border-pitch/25"
                  >
                    {col.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-field-line last:border-0 hover:bg-pitch/[0.04] transition-colors ${
                    i % 2 === 1 ? "bg-neutral-50/60" : ""
                  }`}
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-5 py-2.5 text-sm text-black whitespace-nowrap"
                    >
                      <CellValue col={result.columns[j]} value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !chart && (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-neutral-400">No results found for this query.</p>
          </div>
        )
      )}
    </div>
  );
}
