import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";
import { QueryProvider } from "@/providers/query-provider";

export default function ExternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex flex-col min-h-[100svh]">
        <Header />
        <div className="flex flex-1">
        <div className="w-48">
          <Sidebar />
        </div>

          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}
