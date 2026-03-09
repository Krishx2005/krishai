const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function friendlyError(raw) {
  const s = (raw || "").toLowerCase();
  if (s.includes("llm error") || s.includes("anthropic"))
    return "Something went wrong generating the query. Please try rephrasing your question.";
  if (s.includes("sql execution error"))
    return "The generated SQL couldn't be executed. Try asking in a different way.";
  if (s.includes("only select"))
    return "Only read queries are allowed. Try asking a question about your data.";
  if (s.includes("fetch") || s.includes("network") || s.includes("failed"))
    return "Couldn't reach the server. Make sure the backend is running.";
  return raw || "Something went wrong. Please try again.";
}

export async function queryNL(question) {
  let res;
  try {
    res = await fetch(`${BASE_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  } catch {
    throw new Error(friendlyError("Network fetch failed"));
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(friendlyError(err.detail));
  }
  return res.json();
}

export async function fetchExamples() {
  const res = await fetch(`${BASE_URL}/api/examples`);
  if (!res.ok) throw new Error("Failed to load examples");
  const data = await res.json();
  return data.examples;
}
