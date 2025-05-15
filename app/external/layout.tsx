import { Header } from "../adixi-public/_components/header";

export default function ExternalLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col min-h-[100svh]">
			<Header />

			<main className="flex-1 mt-20">{children}</main>
		</div>
	);
}
