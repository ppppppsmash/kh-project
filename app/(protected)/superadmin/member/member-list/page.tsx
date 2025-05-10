"use client";

import type { User } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { FilePenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppTable } from "@/components/app-table";
import { useSubmit } from "@/lib/submitHandler";
import { renderMemberIntroCard } from "@/components/app-table/render/MemberIntroCardItem";
import { useGetUserList } from "@/components/app-table/hooks/use-table-data";
import { Button } from "@/components/ui/button";
import { EditButton } from "@/components/edit-button";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/hooks/use-modal";
import { CustomToast } from "@/components/ui/toast";
import { MemberModalForm } from "@/components/app-modal/member-modal-form";
//import { updateUser } from "@/actions/user";

export default function MemberListPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useGetUserList();
  const { isOpen, openModal, closeModal } = useModal();
  const [currentData, setCurrentData] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const { handleSubmit } = useSubmit<User>({
    action: async (data) => {
      if (currentData) {
        //await updateUser(currentData.id, data as User);
      }
    },
    onSuccess: () => {
      closeModal();
      CustomToast.success(currentData ? "メンバーを更新しました" : "メンバーを登録しました");
      setCurrentData(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      CustomToast.error(currentData ? "メンバーの更新に失敗しました" : "メンバーの登録に失敗しました");
    },
  });

  const handleEdit = () => {
    setCurrentData(null);
    openModal();
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">メンバー一覧</h2>
        <EditButton text="編集" onClick={handleEdit} />
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

      <MemberModalForm
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        defaultValues={currentData}
      />
      </div>
    </div>
  );
}
