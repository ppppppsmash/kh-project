import { CircleCheck, CircleDashed, Circle } from "lucide-react";

const agendaMap: Record<
	string,
	{ label: string; Icon: React.ElementType; colorClass: string }
> = {
	not_started: {
		label: "未着手",
		Icon: Circle,
		colorClass: "text-muted-foreground",
	},
	in_progress: {
		label: "進行中",
		Icon: CircleDashed,
		colorClass: "text-blue-500",
	},
	done: {
		label: "完了",
		Icon: CircleCheck,
		colorClass: "text-emerald-500",
	},
};

const meetingMap: Record<
	string,
	{ label: string; Icon: React.ElementType; colorClass: string }
> = {
	scheduled: {
		label: "予定",
		Icon: Circle,
		colorClass: "text-muted-foreground",
	},
	in_progress: {
		label: "進行中",
		Icon: CircleDashed,
		colorClass: "text-blue-500",
	},
	done: {
		label: "終了",
		Icon: CircleCheck,
		colorClass: "text-emerald-500",
	},
};

interface StatusLabelProps {
	type: "agenda" | "meeting";
	value: string | null | undefined;
	className?: string;
	iconSize?: "sm" | "md";
}

export const StatusLabel = ({
	type,
	value,
	className = "",
	iconSize = "md",
}: StatusLabelProps) => {
	const map = type === "agenda" ? agendaMap : meetingMap;
	const fallback = type === "agenda" ? "not_started" : "scheduled";
	const entry = map[value ?? fallback] ?? map[fallback];
	const sizeClass = iconSize === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
	return (
		<span
			className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}
		>
			<entry.Icon className={`${sizeClass} ${entry.colorClass}`} strokeWidth={2} />
			{entry.label}
		</span>
	);
};
