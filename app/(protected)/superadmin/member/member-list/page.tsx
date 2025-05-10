"use client";

import type { User } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { FilePenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppTable } from "@/components/app-table";
import { renderMemberIntroCard } from "@/components/app-table/render/MemberIntroCardItem";
import { useGetUserList } from "@/components/app-table/hooks/use-table-data";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/hooks/use-modal";

export default function MemberListPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useGetUserList();
  const { isOpen, openModal, closeModal } = useModal();
  const [currentData, setCurrentData] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();



  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">メンバー一覧</h2>
      </div>
      <div className="space-y-8">
        <Button variant="outline">
          <FilePenLine className="h-4 w-4" />
          <Link target="_blank" href="/adixi-public/intro-card/">パブリック登録フォーム</Link>
        </Button>

        <AppTable
          toolBar={{
            researchBarPlaceholder: "名前や事業部を検索...",
          }}
          columns={renderMemberIntroCard()}
          data={users || []}
          loading={isLoading}
          searchableKeys={["name", "department", "position", "hobby", "skills", "freeText"]}
          onRowClick={(row: User) => {
            router.push(`/superadmin/member/member-list/${row.id}`);
          }}
        />

      </div>
    </div>
  );
}
