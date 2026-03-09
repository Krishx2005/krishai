const KEYWORDS = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|AS|ORDER\s+BY|GROUP\s+BY|HAVING|LIMIT|OFFSET|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|BETWEEN|LIKE|IS|NULL|DESC|ASC|UNION|WITH|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|SET|VALUES|INTO|EXISTS|COALESCE|CAST|EXTRACT|DATE_TRUNC|INTERVAL|CURRENT_DATE)\b/gi;

const NUMBERS = /\b(\d+\.?\d*)\b/g;

export default function SQLHighlight({ sql }) {
  const parts = sql.split(/(\'[^\']*\')/g);

  const highlighted = parts.map((part, i) => {
    if (i % 2 === 1) {
      return `<span class="text-emerald-600">${escape(part)}</span>`;
    }
    let result = escape(part);
    result = result.replace(KEYWORDS, (m) => `<span class="font-bold text-pitch-deeper">${m.toUpperCase()}</span>`);
    result = result.replace(NUMBERS, `<span class="text-amber-700">$1</span>`);
    return result;
  });

  return (
    <pre className="text-xs text-neutral-600 overflow-x-auto leading-relaxed">
      <code dangerouslySetInnerHTML={{ __html: highlighted.join("") }} />
    </pre>
  );
}

function escape(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
