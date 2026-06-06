'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TrendChartProps {
  data: Array<{ name: string; SGPA: number; [key: string]: any }>;
  showGrid?: boolean;
}

export default function TrendChart({ data, showGrid = false }: TrendChartProps) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <LineChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          {showGrid && <CartesianGrid stroke="#1A1A1A" vertical={false} />}
          <XAxis
            dataKey="name"
            stroke="#71717A"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#71717A"
            fontSize={11}
            domain={[0, 10]}
            tickLine={false}
            axisLine={false}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#090909', borderColor: '#1A1A1A', color: '#FAFAFA', borderRadius: '8px' }}
            labelStyle={{ color: '#71717A', fontSize: 11, fontWeight: 'bold' }}
          />
          <Line
            type="monotone"
            dataKey="SGPA"
            stroke="#FAFAFA"
            strokeWidth={2}
            activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#000000', strokeWidth: 2 }}
            dot={{ r: 4, fill: '#090909', stroke: '#FAFAFA', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
