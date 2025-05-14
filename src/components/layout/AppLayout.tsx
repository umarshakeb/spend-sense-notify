
import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserNav } from "./UserNav";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useStatusBar } from "@/components/mobile/StatusBar";

interface AppLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
}

export function AppLayout({ children, showBackButton = false }: AppLayoutProps) {
  const navigate = useNavigate();
  
  // Apply status bar styling
  useStatusBar();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card sticky top-0 z-10 safe-top">
            <div className="flex h-16 items-center px-4 md:px-6 justify-between pt-safe-top">
              <div className="flex items-center gap-2">
                {showBackButton && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-2"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <h1 className="text-xl font-semibold">SpendSense</h1>
              </div>
              <div className="ml-auto flex items-center space-x-4">
                <UserNav />
              </div>
            </div>
          </header>
          <main className="flex-1 bg-background">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
