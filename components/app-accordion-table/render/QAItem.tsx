import type { QAItem } from "@/lib/store";
import { AccordionTableColumn } from "@/components/app-accordion-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

type QaColumnOptions = {
  onEdit?: (row: QAItem) => void;
  onDelete?: (row: QAItem) => void;
};

export const renderQa = ({
  onEdit,
  onDelete,
}: QaColumnOptions): AccordionTableColumn<QAItem>[] => [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "question",
    label: "質問",
    render: (item) => <span className="font-medium">{item.question}</span>,
  },
  {
    key: "category",
    label: "カテゴリ",
    render: (item) => <span className="font-medium">{item.category}</span>,
  },
  {
    key: "date",
    label: "日付",
    render: (item) => <span className="text-xs text-muted-foreground">{item.date}</span>,
  },
  {
    key: "actions",
    label: "操作",
    render: (item) => (
      <div className="flex items-center gap-2">
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

