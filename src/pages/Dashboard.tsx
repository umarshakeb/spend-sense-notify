
import { SpendingSummary } from "@/components/dashboard/SpendingSummary";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { UpcomingRenewals } from "@/components/dashboard/UpcomingRenewals";

export default function Dashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your financial overview
        </p>
      </div>
      
      <SpendingSummary />
      
      <div className="grid gap-6 md:grid-cols-3">
        <SpendingChart />
        <UpcomingRenewals />
      </div>
      
      <RecentTransactions />
    </div>
  );
}
