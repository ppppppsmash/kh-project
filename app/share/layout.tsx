import { ModeToggle } from "@/components/app-sidebar/mode-toggle";
import Image from "next/image";
import Link from "next/link";

export default function ShareLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col h-[100svh]">
			<header className="z-50 w-full bg-background">
				<div className="flex h-14 items-center justify-between px-6">
					<Link href="/signin" className="flex items-center gap-2 font-bold">
						<Image
							src="https://avatars.slack-edge.com/2025-06-02/9008372455248_bec518e5c0466e3a02fe_88.png"
							alt="ADiXi MGR"
							width={28}
							height={28}
							className="rounded-md"
						/>
						<span className="text-lg">ADiXi MGR</span>
					</Link>
					<ModeToggle />
				</div>
			</header>
			<main className="flex-1 min-h-0">{children}</main>
		</div>
	);
}
