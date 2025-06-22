'use client';

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type ComparisonData = {
  name: string;
  data: {
    month: string;
    value: number;
  }[];
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function DGPComparisonChart({ data, title }: { data: ComparisonData[]; title: string }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <div className="p-6 pt-0 h-80">
          <Skeleton className="h-full w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="p-6 pt-0 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {data.map((dse, index) => (
              <Bar
                key={`bar-${dse.name}`}
                dataKey="value"
                data={dse.data}
                name={dse.name}
                fill={COLORS[index % COLORS.length]}
                barSize={20}
              />
            ))}
            {data.map((dse, index) => (
              <Line
                key={`line-${dse.name}`}
                type="monotone"
                dataKey="value"
                data={dse.data}
                name={`${dse.name} Trend`}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}