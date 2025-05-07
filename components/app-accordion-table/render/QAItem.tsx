import type { Qa } from "@/types";
import { AccordionTableColumn } from "@/components/app-accordion-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type QaColumnOptions = {
  onEdit?: (row: Qa) => void;
  onDelete?: (row: Qa) => void;
};

 // カテゴリに応じたバッジの色を返す関数
const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case "IT":
      return "default";
    case "人事":
      return "secondary";
    case "経理":
      return "destructive";
    case "総務":
      return "outline";
    default:
      return "secondary";
  }
};

export const renderQa = ({
  onEdit,
  onDelete,
}: QaColumnOptions): AccordionTableColumn<Qa>[] => [
  {
    key: "questionCode",
    label: "質問コード",
  },
  {
    key: "question",
    label: "質問",
    render: (item) => <span className="font-medium">{item.question}</span>,
  },
  {
    key: "category",
    label: "カテゴリ",
    render: (item) => <Badge variant={getCategoryBadgeVariant(item.category)}>{item.category}</Badge>,
  },
  {
    key: "date",
    label: "日付",
    render: (item) => <span className="text-xs text-muted-foreground">{item.createdAt.toLocaleDateString()}</span>,
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

