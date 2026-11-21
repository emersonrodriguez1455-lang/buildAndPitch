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
              <stop offset="5%" stopColor="#238B57" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#238B57" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="issueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E89B38" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#E89B38" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDF3E5" />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#738078" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#738078" }} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#DDF3E5" }} />
          <Legend />
          <Area type="monotone" dataKey="healthy_count" name="Aparentemente sanas" stroke="#238B57" fill="url(#healthyFill)" />
          <Area type="monotone" dataKey="issue_count" name="Posibles problemas" stroke="#E89B38" fill="url(#issueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
