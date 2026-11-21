import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DiseaseStatItem } from "../../types";

export function DiseaseChart({ data }: { data: DiseaseStatItem[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDF3E5" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#738078" }} interval={0} angle={-18} textAnchor="end" height={60} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#738078" }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: "#DDF3E5" }}
            formatter={(value: number) => [value, "Inspecciones"]}
          />
          <Bar dataKey="count" fill="#238B57" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
