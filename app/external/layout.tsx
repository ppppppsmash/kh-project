import { Header } from "../adixi-public/_components/header";
import { QueryProvider } from "@/providers/query-provider";

export default function ExternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex flex-col min-h-[100svh]">
        <Header />

        <main className="flex-1 mt-20">{children}</main>
      </div>
    </QueryProvider>
  );
}
