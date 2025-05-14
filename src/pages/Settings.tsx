
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, we would save these settings to a database
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your settings.",
        variant: "destructive"
      });
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Manage your app preferences and settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="flex flex-col">
                    <span>Notifications</span>
                    <span className="text-sm text-muted-foreground">Receive notifications about account activity.</span>
                  </Label>
                  <Switch 
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode" className="flex flex-col">
                    <span>Dark Mode</span>
                    <span className="text-sm text-muted-foreground">Use dark theme throughout the application.</span>
                  </Label>
                  <Switch 
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataSharing" className="flex flex-col">
                    <span>Data Sharing</span>
                    <span className="text-sm text-muted-foreground">Allow anonymous usage data to be shared.</span>
                  </Label>
                  <Switch 
                    id="dataSharing"
                    checked={dataSharing}
                    onCheckedChange={setDataSharing}
                  />
                </div>
                <Button onClick={handleSaveSettings} disabled={loading}>
                  {loading ? "Saving..." : "Save preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <p className="text-sm text-muted-foreground">
                    For security reasons, you'll need to request a password reset email.
                  </p>
                  <Button variant="outline">
                    Send Password Reset Email
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
