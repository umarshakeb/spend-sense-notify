
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data
const expensesByCategory = [
  { name: "Food & Dining", value: 420 },
  { name: "Shopping", value: 240 },
  { name: "Transportation", value: 180 },
  { name: "Subscriptions", value: 105 },
  { name: "Entertainment", value: 95 },
  { name: "Utilities", value: 160 },
  { name: "Other", value: 90 }
];

const monthlyTotals = [
  { name: "Jan", expenses: 1400, income: 3200 },
  { name: "Feb", expenses: 1200, income: 3200 },
  { name: "Mar", expenses: 1800, income: 3200 },
  { name: "Apr", expenses: 1500, income: 3200 },
];

const COLORS = ['#108DA8', '#FF7043', '#7E69AB', '#F97316', '#0EA5E9', '#0A5E6C', '#33C3F0'];

export default function Analytics() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Analyze your spending patterns
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>Income vs. Expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyTotals}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#108DA8" />
                      <Bar dataKey="expenses" name="Expenses" fill="#FF7043" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {expensesByCategory.map((category, index) => (
                    <div key={category.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{category.name}: ${category.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
              <CardDescription>Detailed breakdown of spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Detailed category analysis will be implemented in the next version.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Long-term spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Spending trends analysis will be implemented in the next version.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
