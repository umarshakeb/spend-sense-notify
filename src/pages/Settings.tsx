
import { AppLayout } from "@/components/layout/AppLayout";

const Settings = () => {
  return (
    <AppLayout showBackButton={true}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="grid gap-6">
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">App Settings</h2>
            <p className="text-muted-foreground">Settings page is under construction.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
