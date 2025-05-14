
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.profile?.name) {
      setName(user.profile.name);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    try {
      // In a real app, this would update the profile in the database
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved."
      });
      
      // Navigate back to home after successful update
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showBackButton={true}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profile?.avatar_url} alt={name || "User"} />
                  <AvatarFallback className="text-2xl">{(name || user?.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-medium">{name || user?.email?.split("@")[0]}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ""} 
                      disabled 
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/')}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
