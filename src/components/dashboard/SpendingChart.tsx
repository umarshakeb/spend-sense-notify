
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMediaQuery } from "@/hooks/use-media-query";

// Sample data
const weeklyData = [
  { name: 'Mon', income: 240, expense: 400 },
  { name: 'Tue', income: 300, expense: 450 },
  { name: 'Wed', income: 200, expense: 300 },
  { name: 'Thu', income: 278, expense: 390 },
  { name: 'Fri', income: 189, expense: 480 },
  { name: 'Sat', income: 239, expense: 380 },
  { name: 'Sun', income: 349, expense: 430 },
];

const monthlyData = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
];

export function SpendingChart() {
  const [activeTab, setActiveTab] = useState("weekly");
  const isMobile = useMediaQuery("(max-width: 640px)");

  const chartConfig = {
    income: {
      label: "Income",
      theme: {
        light: "#108DA8",
        dark: "#108DA8",
      },
    },
    expense: {
      label: "Expense",
      theme: {
        light: "#FF7043",
        dark: "#FF7043",
      },
    },
  };

  return (
    <div className="w-full">
      <Tabs 
        defaultValue="weekly" 
        className="w-[220px]"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="mt-2 h-[280px]">
        <ChartContainer config={chartConfig} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeTab === "weekly" ? weeklyData : monthlyData}
              margin={{
                top: 20,
                right: isMobile ? 10 : 30,
                left: isMobile ? 0 : 20,
                bottom: 5,
              }}
              barSize={isMobile ? 12 : 20}
              barGap={isMobile ? 2 : 8}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                fontSize={isMobile ? 10 : 12}
                tickMargin={5}
              />
              <YAxis 
                fontSize={isMobile ? 10 : 12} 
                width={isMobile ? 30 : 40}
                tickFormatter={(value) => isMobile ? `${value / 1000}k` : value}
              />
              <ChartTooltip 
                content={<ChartTooltipContent nameKey="name" />} 
              />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                verticalAlign="bottom"
                height={30}
              />
              <Bar dataKey="income" fill="var(--color-income)" name="Income" />
              <Bar dataKey="expense" fill="var(--color-expense)" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
