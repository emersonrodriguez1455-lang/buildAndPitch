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
          <CartesianGrid strokeDasharray="3 3" stroke="#ececec" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#777b86" }}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={60}
            axisLine={false}
            tickLine={false}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#777b86" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #ececec",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
            formatter={(value: number) => [value, "Inspecciones"]}
          />
          <Bar dataKey="count" fill="#5d2a1a" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
