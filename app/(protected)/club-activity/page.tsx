"use client";

import { useModal } from "@/hooks/use-modal";
import { useSubmit } from "@/lib/submitHandler";
import { ClubTable } from "@/components/app-table";
import { ClubModalForm } from "@/components/app-modal";
import { ClubActivity } from "@/types";
import { createClubActivity } from "@/actions/club-activity";
import { AddButton } from "@/components/add-button";
import { CustomToast } from "@/components/ui/toast";

export default function ClubActivityPage() {
  const { isOpen, openModal, closeModal } = useModal();
  
  const { handleSubmit } = useSubmit<ClubActivity>({
    action: async (data) => {
      await createClubActivity(data);
    },
    onSuccess: () => {
      closeModal();
      CustomToast.success("部活動を登録しました");
    },
    onError: () => {
      CustomToast.error("部活動の登録に失敗しました");
    },
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">部活動</h2>
        <AddButton text="新規部活動登録" onClick={openModal} />
      </div>

      <ClubTable />

      <ClubModalForm
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}
