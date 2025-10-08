import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ActiveThemeProvider } from "@/providers/active-theme";
import AuthProvider from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { cookies } from "next/headers";

export const metadata: Metadata = {
	title: "ADiXi management system",
	description: "ADiXi management system",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const activeThemeValue = cookieStore.get("active_theme")?.value;
	const isScaled = activeThemeValue?.endsWith("-scaled");

	return (
		<html lang="ja">
			<body
				className={cn(
					"bg-background overscroll-none font-sans antialiased",
					activeThemeValue ? `theme-${activeThemeValue}` : "",
					isScaled ? "theme-scaled" : "",
				)}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
					enableColorScheme
				>
					<ActiveThemeProvider initialTheme={activeThemeValue}>
						<AuthProvider>
							<QueryProvider>
								<div className="h-[100svh] overflow-hidden">
									{children}
								</div>
							</QueryProvider>
						</AuthProvider>
					</ActiveThemeProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
