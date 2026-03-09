import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const DATE_RE = /^\d{4}-\d{2}/;
const PITCH = "#0d6b38";
const PITCH_LIGHT = "#2ecc71";

function isNumeric(val) {
  if (val === null || val === "") return false;
  return !isNaN(Number(val));
}

function isDateLike(val) {
  if (typeof val !== "string") return false;
  return DATE_RE.test(val);
}

export function detectChart(columns, rows) {
  if (!rows.length || columns.length < 2 || columns.length > 2) return null;

  if (columns.length === 1 && rows.length === 1 && isNumeric(rows[0][0])) {
    return { type: "stat", value: Number(rows[0][0]), label: columns[0] };
  }

  if (columns.length !== 2) return null;

  const aNumeric = rows.every((r) => isNumeric(r[0]));
  const bNumeric = rows.every((r) => isNumeric(r[1]));

  let labelIdx, valueIdx;
  if (!aNumeric && bNumeric) {
    labelIdx = 0;
    valueIdx = 1;
  } else if (aNumeric && !bNumeric) {
    labelIdx = 1;
    valueIdx = 0;
  } else {
    return null;
  }

  const labelKey = columns[labelIdx];
  const valueKey = columns[valueIdx];
  const labelVal = rows[0][labelIdx];

  if (isDateLike(String(labelVal))) {
    return { type: "line", labelKey, valueKey, labelIdx, valueIdx };
  }

  return {
    type: rows.length > 8 ? "bar-horizontal" : "bar",
    labelKey,
    valueKey,
    labelIdx,
    valueIdx,
  };
}

function buildData(rows, labelIdx, valueIdx, labelKey, valueKey) {
  return rows.map((row) => ({
    [labelKey]: String(row[labelIdx]),
    [valueKey]: Number(row[valueIdx]),
  }));
}

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #d4e8da",
  borderRadius: 6,
  fontSize: 12,
};

export default function ChartView({ chart, columns, rows }) {
  if (!chart) return null;

  if (chart.type === "stat") {
    return (
      <div className="py-8 text-center border-b border-field-line">
        <p className="text-4xl font-extrabold text-pitch tabular-nums">
          {chart.value.toLocaleString()}
        </p>
        <p className="text-xs text-pitch-dark/50 mt-2 uppercase tracking-wider font-medium">
          {chart.label}
        </p>
      </div>
    );
  }

  const data = buildData(rows, chart.labelIdx, chart.valueIdx, chart.labelKey, chart.valueKey);

  if (chart.type === "line") {
    return (
      <div className="px-5 pt-5 pb-2 border-b border-field-line">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid stroke="#d4e8da" strokeDasharray="3 3" />
            <XAxis dataKey={chart.labelKey} tick={{ fontSize: 11, fill: "#6b8f78" }} axisLine={{ stroke: "#b0d4bc" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b8f78" }} axisLine={{ stroke: "#b0d4bc" }} tickLine={false} width={50} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={chart.valueKey} stroke={PITCH} strokeWidth={2} dot={{ r: 3, fill: PITCH }} activeDot={{ r: 5, fill: PITCH_LIGHT }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart.type === "bar-horizontal") {
    return (
      <div className="px-5 pt-5 pb-2 border-b border-field-line">
        <ResponsiveContainer width="100%" height={Math.max(260, data.length * 32)}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid stroke="#d4e8da" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#6b8f78" }} axisLine={{ stroke: "#b0d4bc" }} tickLine={false} />
            <YAxis type="category" dataKey={chart.labelKey} tick={{ fontSize: 11, fill: "#6b8f78" }} axisLine={{ stroke: "#b0d4bc" }} tickLine={false} width={120} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={chart.valueKey} fill={PITCH} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-2 border-b border-field-line">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid stroke="#d4e8da" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={chart.labelKey} tick={{ fontSize: 11, fill: "#6b8f78" }} axisLine={{ stroke: "#b0d4bc" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#6b8f78" }} axisLine={{ stroke: "#b0d4bc" }} tickLine={false} width={50} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey={chart.valueKey} fill={PITCH} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
