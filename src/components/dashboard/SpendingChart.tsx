
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
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
      </CardHeader>
      <CardContent className="p-1 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={activeTab === "weekly" ? weeklyData : monthlyData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#108DA8" name="Income" />
            <Bar dataKey="expense" fill="#FF7043" name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
