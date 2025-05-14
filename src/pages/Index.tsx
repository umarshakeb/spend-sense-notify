
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./Dashboard";

const Index = () => {
  return (
    <AppLayout showBackButton={false}>
      <Dashboard />
    </AppLayout>
  );
};

export default Index;
