import type { Task } from "@/types";
import { MoreHorizontal, Pencil, Trash, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableColumn } from "@/components/app-table";
import { cn, formatDate } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getProgressIcon } from "@/components/app-sheet/task-detail-sheet";
import { getProgressLabel, getProgressColor } from "@/lib/utils";

type TaskColumnOptions = {
  onEdit?: (row: Task, e: React.MouseEvent) => void;
  onDelete?: (row: Task, e: React.MouseEvent) => void;
};

export const renderTask = ({
  onEdit,
  onDelete,
}: TaskColumnOptions): TableColumn<Task>[] => [
  {
    key: "title",
    title: "項目",
    sortable: true,
    render: (value: any) => <span className="font-medium">{value}</span>,
  },
  {
    key: "assignee",
    title: "担当者",
    sortable: false,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "createdAt",
    title: "起票日",
    sortable: false,
    render: (value: any) => <span>{value ? formatDate(value, "yyyy/MM/dd HH:mm") : "-"}</span>,
  },
  {
    key: "dueDate",
    title: "期限",
    sortable: false,
    render: (value: any) => <span>{value ? formatDate(value, "yyyy/MM/dd") : "-"}</span>,
  },
  {
    key: "progress",
    title: "進捗",
    sortable: false,
    render: (value: any) => {
      return (
        <Badge variant="outline" className={cn("font-normal text-white", getProgressColor(value))}>
          {getProgressIcon(value)}
          {getProgressLabel(value)}
        </Badge>
      );
    },
  },
  // {
  //   key: "progressDetails",
  //   title: "対応内容",
  //   sortable: false,
  //   render: (value: any) => <span>{value}</span>,
  // },
  // {
  //   key: "link",
  //   title: "リンク",
  //   sortable: false,
  //   hide: "sm",
  //   render: (value: any) => <span className="truncate">{value}</span>,
  // },
  {
    key: "completedAt",
    title: "完了日",
    sortable: true,
    render: (value: any) => (
      <span>
        {value ? formatDate(value, "yyyy/MM/dd") : "-"}
      </span>
    ),
  },
  {
    key: "isPublic",
    title: "公開",
    sortable: false,
    render: (value: any) => (
      <span>{value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</span>
    ),
  },
  ...createTaskColumns({ onEdit, onDelete }),
];

export const createTaskColumns = ({
  onEdit,
  onDelete,
}: TaskColumnOptions): TableColumn<Task>[] => [
  {
    key: "action",
    title: "操作",
    align: "right",
    render: (_, row) => (
      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">メニューを開く</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>アクション</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit?.(row, e);
            }}>
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(row, e);
              }}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
