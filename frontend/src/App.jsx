import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import ResultCard from "./components/ResultCard";
import Spinner from "./components/Spinner";
import ErrorMessage from "./components/ErrorMessage";
import { queryNL, fetchExamples } from "./api";
import PartyMode from "./components/PartyMode";

export default function App() {
  const [examples, setExamples] = useState([]);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newestId, setNewestId] = useState(null);

  useEffect(() => {
    fetchExamples()
      .then(setExamples)
      .catch(() => {});
  }, []);

  async function handleQuery(question) {
    setLoading(true);
    setError(null);

    try {
      const result = await queryNL(question);
      const id = Date.now();
      result._id = id;
      setNewestId(id);
      setResults((prev) => [result, ...prev]);
      setHistory((prev) =>
        prev.includes(question) ? prev : [question, ...prev]
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setResults([]);
    setError(null);
    setNewestId(null);
  }

  const hasResults = results.length > 0;

  return (
    <div className="flex min-h-screen">
      <PartyMode />
      <Sidebar
        examples={examples}
        history={history}
        onSelect={handleQuery}
        onClear={handleClear}
        loading={loading}
        hasResults={hasResults}
      />

      <main className="flex-1 min-w-0 pitch-bg">
        {/* Search bar */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-field-line px-6 py-4 sm:px-8 flex items-center gap-3">
          <div className="flex-1">
            <SearchBar onSubmit={handleQuery} loading={loading} />
          </div>
          {hasResults && (
            <button
              onClick={handleClear}
              className="shrink-0 text-xs text-pitch-dark/50 hover:text-pitch-deeper transition-colors border border-field-line rounded-md px-3 py-2.5 max-md:hidden"
            >
              Clear
            </button>
          )}
        </div>

        {/* Mobile header */}
        <div className="md:hidden px-6 pt-4 flex items-center justify-between">
          <h1 className="text-sm font-extrabold text-pitch-deeper flex items-center gap-1">
            <span>&#9917;</span> KrishAI
          </h1>
          <span className="text-[11px] text-pitch-dark/30">Powered by Claude</span>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4 sm:px-8">
          {loading && <Spinner />}
          {error && <ErrorMessage message={error} />}

          {!hasResults && !loading && !error && (
            <div className="pt-16 max-w-md mx-auto text-center">
              <div className="text-4xl mb-4">&#9917;</div>
              <h2 className="text-lg font-extrabold text-pitch-deeper mb-2">
                Explore FC 25 Player Data
              </h2>
              <p className="text-sm text-pitch-dark/50 leading-relaxed">
                Ask questions about 18,000+ players in plain English. KrishAI
                translates your question into SQL, queries the database, and
                shows results with automatic charts.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 md:hidden">
                {examples.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuery(q)}
                    className="text-xs border border-field-line rounded-full px-3 py-1.5 text-pitch-dark/60 hover:text-pitch-deeper hover:border-pitch/30 transition-colors bg-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((result) => (
            <ResultCard
              key={result._id}
              result={result}
              isNew={result._id === newestId}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
