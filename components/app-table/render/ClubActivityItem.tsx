import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ClubActivity } from "@/types";
import { TableColumn } from "@/components/app-table";
import { statusConfig } from "@/config";

type ClubActivityColumnOptions = {
  onEdit?: (row: ClubActivity, e: React.MouseEvent) => void;
  onDelete?: (row: ClubActivity, e: React.MouseEvent) => void;
};

export const renderClubActivity = ({
  onEdit,
  onDelete,
}: ClubActivityColumnOptions): TableColumn<ClubActivity>[] => [
  {
    key: "name",
    title: "部活動名",
    sortable: true,
    render: (value: any) => <span className="font-medium">{value}</span>,
  },
  {
    key: "leader",
    title: "部長",
    sortable: true,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "description",
    title: "活動内容",
    hide: "md",
    render: (value: any) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="line-clamp-1 max-w-xs truncate">{value}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    key: "memberCount",
    title: "人数",
    sortable: true,
    hide: "lg",
    align: "right",
    render: (value: any) => <span>{value}名</span>,
  },
  {
    key: "status",
    title: "ステータス",
    sortable: true,
    hide: "md",
    render: (_, row: any) => {
      const config = statusConfig[row.status as keyof typeof statusConfig];
      return (
        <Badge variant="outline" className={cn("font-normal", config.color)}>
          {config.label}
        </Badge>
      );
    },
  },
  ...createClubActivityColumns({ onEdit, onDelete }),
];

export const createClubActivityColumns = ({
  onEdit,
  onDelete,
}: ClubActivityColumnOptions): TableColumn<ClubActivity>[] => [
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
