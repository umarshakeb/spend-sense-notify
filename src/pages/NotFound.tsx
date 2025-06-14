
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AppLayout showBackButton={true}>
      <div className="container mx-auto py-12 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <Button onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>
    </AppLayout>
  );
};

export default NotFound;
