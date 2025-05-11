"use client";

import { MemberFormValues } from "@/lib/validations";
import Link from "next/link";
import { FilePenLine } from "lucide-react";
import { useSubmit } from "@/lib/submitHandler";
import { useGetUserInfo } from "@/components/app-table/hooks/use-table-data";
import { Button } from "@/components/ui/button";
import { EditButton } from "@/components/edit-button";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/hooks/use-modal";
import { CustomToast } from "@/components/ui/toast";
import { UserModalForm } from "@/components/app-modal/member-modal-form";
import { updateUserInfo } from "@/actions/user";
import { UserDetail } from "@/components/app-user-detail";

export default function UserPage() {
  const queryClient = useQueryClient();
  const { data: userInfo, isLoading: isUserInfoLoading } = useGetUserInfo();
  const { isOpen, openModal, closeModal } = useModal();

  const { handleSubmit } = useSubmit<MemberFormValues>({
    action: async (data) => {
      if (userInfo?.id) {
        await updateUserInfo(userInfo.id, data as any);
      }

      
    },
    onSuccess: () => {
      closeModal();
      CustomToast.success("メンバー情報を更新しました");
      queryClient.invalidateQueries({ queryKey: ["user-info"] });
    },
    onError: () => {
      CustomToast.error("メンバー情報の更新に失敗しました");
    },
  });

  const handleEdit = () => {
    openModal();
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">自己紹介</h2>
        <EditButton text="編集" onClick={handleEdit} />
      </div>
      <div className="space-y-8">
        <Button variant="outline">
          <FilePenLine className="h-4 w-4" />
          <Link target="_blank" href="/adixi-public/intro-card/">パブリック登録フォーム</Link>
        </Button>

        <UserModalForm
          isOpen={isOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          defaultValues={userInfo}
        />

        <UserDetail user={userInfo} />

      </div>
    </div>
  );
}
