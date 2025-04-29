import Image from "next/image";
import { TableColumn } from "@/components/app-table";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";

export const renderTask = (): TableColumn<Task>[] => [
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
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "dueDate",
    title: "期限",
    sortable: false,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "progress",
    title: "進捗",
    sortable: false,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "progressDetails",
    title: "詳細",
    sortable: false,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "link",
    title: "リンク",
    sortable: false,
    render: (value: any) => <span className="truncate">{value}</span>,
  },
  {
    key: "completedAt",
    title: "完了日",
    sortable: true,
    render: (value: any) => (
      <span>
        {value ? formatDate(value) : "-"}
      </span>
    ),
  },
];