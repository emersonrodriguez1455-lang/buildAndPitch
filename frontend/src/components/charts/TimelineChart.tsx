import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimelinePoint } from "../../types";

export function TimelineChart({ data }: { data: TimelinePoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="healthyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#17191c" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#17191c" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="issueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5d2a1a" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#5d2a1a" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ececec" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#777b86" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#777b86" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #ececec",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="healthy_count"
            name="Aparentemente sanas"
            stroke="#17191c"
            fill="url(#healthyFill)"
          />
          <Area
            type="monotone"
            dataKey="issue_count"
            name="Posibles problemas"
            stroke="#5d2a1a"
            fill="url(#issueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
