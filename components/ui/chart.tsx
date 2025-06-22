'use client';

import {
  BarChart as TremorBarChart,
  LineChart as TremorLineChart,
} from '@tremor/react';

// Custom type that extends Tremor's props with our required index property
type ChartProps<T extends string, K extends string> = {
  index: T;
  categories: K[];
} & Omit<React.ComponentProps<typeof TremorBarChart>, 'index' | 'categories'>;

export function BarChart<T extends string, K extends string>({
  index,
  categories,
  ...props
}: ChartProps<T, K>) {
  return (
    <div className="h-80">
      <TremorBarChart
        index={index}
        categories={categories}
        yAxisWidth={60}
        showAnimation={true}
        animationDuration={1000}
        {...props}
      />
    </div>
  );
}

export function LineChart<T extends string, K extends string>({
  index,
  categories,
  ...props
}: ChartProps<T, K>) {
  return (
    <div className="h-80">
      <TremorLineChart
        index={index}
        categories={categories}
        yAxisWidth={60}
        showAnimation={true}
        animationDuration={1000}
        curveType="natural"
        {...props}
      />
    </div>
  );
}