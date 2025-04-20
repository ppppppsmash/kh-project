import Image from "next/image";
import { TableColumn } from "@/components/app-table";
import { formatDate } from "@/lib/utils";
import type { Member } from "@/types";



export const renderMemberIntroCard = (): TableColumn<Member>[] => [
  {
    key: "photoUrl",
    title: "写真",
    sortable: false,
    render: (value: any) => (
      <div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
        {value ? (
          <Image
            src={value}
            alt="プロフィール写真"
            className="w-full h-full object-cover"
            width={50}
            height={50}
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>
    ),
  },
  {
    key: "name",
    title: "名前",
    sortable: true,
    render: (value: any) => <span className="font-medium">{value}</span>,
  },
  {
    key: "department",
    title: "事業部",
    sortable: true,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "position",
    title: "役職",
    sortable: true,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "hobby",
    title: "趣味・特技",
    sortable: true,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "skills",
    title: "得意な技術・スキル",
    sortable: true,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "freeText",
    title: "自由記載欄",
    sortable: true,
    render: (value: any) => <span>{value}</span>,
  },
  {
    key: "createdAt",
    title: "登録日",
    sortable: true,
    render: (value: any) => (
      <span>
        {value ? formatDate(value) : "-"}
      </span>
    ),
  },
];