
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
  
  useStatusBar();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full max-w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full min-w-0 max-w-full">
          <header className="border-b bg-card sticky top-0 z-10 w-full pt-safe-top">
            <div className="flex h-12 sm:h-16 items-center px-3 sm:px-4 md:px-6 justify-between w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {showBackButton && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-2 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                )}
                <h1 className="text-lg sm:text-xl font-semibold truncate break-words">SpendSense</h1>
              </div>
              <div className="ml-auto flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <UserNav />
              </div>
            </div>
          </header>
          <main className="flex-1 bg-background w-full min-w-0 max-w-full overflow-x-hidden pb-safe-bottom">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
