"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-sidebar/app-header";
import AuthProvider from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toast } from "@/components/ui/toast";
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <QueryProvider>
        <SidebarProvider
          style={
            {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="container mx-auto">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
        </SidebarInset>
        </SidebarProvider>
        <Toast />
      </QueryProvider>
    </AuthProvider>
  );
}
