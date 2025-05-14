
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

// Updated to work with local storage data
const useChartData = () => {
  const [data, setData] = useState({
    weeklyData: [
      { name: 'Mon', income: 240, expense: 400 },
      { name: 'Tue', income: 300, expense: 450 },
      { name: 'Wed', income: 200, expense: 300 },
      { name: 'Thu', income: 278, expense: 390 },
      { name: 'Fri', income: 189, expense: 480 },
      { name: 'Sat', income: 239, expense: 380 },
      { name: 'Sun', income: 349, expense: 430 },
    ],
    monthlyData: [
      { name: 'Jan', income: 4000, expense: 2400 },
      { name: 'Feb', income: 3000, expense: 1398 },
      { name: 'Mar', income: 2000, expense: 9800 },
      { name: 'Apr', income: 2780, expense: 3908 },
      { name: 'May', income: 1890, expense: 4800 },
      { name: 'Jun', income: 2390, expense: 3800 },
    ],
  });

  useEffect(() => {
    // Check if we have real transaction data to use
    try {
      const storedTransactions = localStorage.getItem('sms_transactions');
      
      if (storedTransactions) {
        const transactions = JSON.parse(storedTransactions);
        
        // Process weekly data
        const weeklyMap = new Map();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize the weeklyMap with all days
        days.forEach(day => {
          weeklyMap.set(day, { name: day, income: 0, expense: 0 });
        });
        
        // Process monthly data
        const monthlyMap = new Map();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize the monthlyMap with all months
        months.forEach(month => {
          monthlyMap.set(month, { name: month, income: 0, expense: 0 });
        });
        
        // Process transactions
        transactions.forEach(transaction => {
          const date = new Date(transaction.date);
          const day = days[date.getDay()];
          const month = months[date.getMonth()];
          
          const amount = Math.abs(transaction.amount);
          
          // Update weekly data
          const weekData = weeklyMap.get(day);
          if (transaction.type === 'income') {
            weekData.income += amount;
          } else {
            weekData.expense += amount;
          }
          weeklyMap.set(day, weekData);
          
          // Update monthly data
          const monthData = monthlyMap.get(month);
          if (transaction.type === 'income') {
            monthData.income += amount;
          } else {
            monthData.expense += amount;
          }
          monthlyMap.set(month, monthData);
        });
        
        // Convert maps to arrays
        const weeklyData = [...weeklyMap.values()];
        
        // Reorder weekly data to start with Monday
        const mondayIndex = weeklyData.findIndex(d => d.name === 'Mon');
        const reorderedWeeklyData = [
          ...weeklyData.slice(mondayIndex),
          ...weeklyData.slice(0, mondayIndex)
        ];
        
        const monthlyData = [...monthlyMap.values()];
        
        // Update state with real data
        setData({
          weeklyData: reorderedWeeklyData,
          monthlyData: monthlyData,
        });
      }
    } catch (error) {
      console.error("Error processing chart data:", error);
    }
  }, []);

  return data;
};

export function SpendingChart() {
  const [activeTab, setActiveTab] = useState("weekly");
  const isMobile = useIsMobile();
  const { weeklyData, monthlyData } = useChartData();

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
                right: isMobile ? 0 : 30,
                left: isMobile ? 0 : 20,
                bottom: isMobile ? 0 : 5,
              }}
              barSize={isMobile ? 10 : 20}
              barGap={isMobile ? 2 : 8}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={!isMobile} />
              <XAxis 
                dataKey="name" 
                fontSize={isMobile ? 7 : 12}
                tickMargin={isMobile ? 2 : 5}
                axisLine={!isMobile}
                tickLine={!isMobile}
              />
              <YAxis 
                fontSize={isMobile ? 7 : 12} 
                width={isMobile ? 25 : 40}
                tickFormatter={(value) => isMobile ? `${Math.round(value / 1000)}k` : value}
                axisLine={!isMobile}
                tickLine={!isMobile}
              />
              <ChartTooltip 
                content={<ChartTooltipContent nameKey="name" />} 
                cursor={{ fill: 'transparent' }}
              />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? 8 : 12 }}
                verticalAlign={isMobile ? "top" : "bottom"}
                height={isMobile ? 20 : 30}
                iconSize={isMobile ? 8 : 14}
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
