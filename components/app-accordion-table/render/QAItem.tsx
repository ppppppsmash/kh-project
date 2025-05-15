import type { AccordionTableColumn } from "@/components/app-accordion-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import type { QaFormValues } from "@/lib/validations";
import { Pencil, Trash2 } from "lucide-react";

type QaColumnOptions = {
	onEdit?: (row: QaFormValues) => void;
	onDelete?: (row: QaFormValues) => void;
};

// カテゴリに応じたバッジの色を返す関数
export const getCategoryBadgeVariant = (category: string) => {
	switch (category) {
		case "現場":
			return "default";
		case "経費":
			return "secondary";
		case "福利厚生":
			return "destructive";
		case "休暇":
			return "outline";
		case "週報":
			return "outline";
		case "その他":
			return "outline";
		default:
			return "secondary";
	}
};

export const renderQa = ({
	onEdit,
	onDelete,
}: QaColumnOptions): AccordionTableColumn<QaFormValues>[] => [
	{
		key: "questionCode",
		label: "質問コード",
	},
	{
		key: "question",
		label: "質問",
		render: (item) => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<p className="font-medium truncate w-[300px] max-w-[500px]">
							{item.question}
						</p>
					</TooltipTrigger>
					<TooltipContent>
						<p>{item.question}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
	},
	{
		key: "category",
		label: "カテゴリ",
		render: (item) => (
			<Badge variant={getCategoryBadgeVariant(item.category)}>
				{item.category}
			</Badge>
		),
	},
	{
		key: "date",
		label: "日付",
		render: (item) => (
			<span className="text-xs text-muted-foreground">
				{item?.startedAt &&
					`起票日: ${formatDate(item?.startedAt, "yyyy-MM-dd")}`}
			</span>
		),
	},
	{
		key: "questionBy",
		label: "質問者",
		render: (item) => (
			<span className="text-xs text-muted-foreground">
				{item.questionBy && `質問者: ${item.questionBy}`}
			</span>
		),
	},
	{
		key: "answeredBy",
		label: "回答者",
		render: (item) => (
			<span className="text-xs text-muted-foreground">
				{item.answer ? "回答済み" : "未回答"}
			</span>
		),
	},
	{
		key: "actions",
		label: "操作",
		render: (item) => (
			<div className="flex justify-end items-center gap-2">
				{onEdit && (
					<Button
						variant="ghost"
						size="icon"
						onClick={(e) => {
							e.stopPropagation();
							onEdit(item);
						}}
					>
						<Pencil className="h-4 w-4" />
					</Button>
				)}
				{onDelete && (
					<Button
						variant="ghost"
						size="icon"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(item);
						}}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)}
			</div>
		),
	},
];
