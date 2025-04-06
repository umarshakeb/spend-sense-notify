
import { 
  CreditCard, 
  Home, 
  CalendarClock, 
  BarChart3, 
  MessageSquareText,
  Settings
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

// Menu items
const menuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: Home,
  },
  {
    title: "Transactions",
    path: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Subscriptions",
    path: "/subscriptions",
    icon: CalendarClock,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    title: "SMS Import",
    path: "/sms-import",
    icon: MessageSquareText,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-finance-primary" />
          <span className="font-bold text-lg">SpendSense</span>
        </div>
        <div className="text-xs text-muted-foreground">Finance Tracker</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarTrigger className="absolute right-2 top-4 md:hidden" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-center">
          © 2025 SpendSense
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
