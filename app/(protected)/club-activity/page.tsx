"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClubTable } from "@/components/app-table";
import { ClubModalForm } from "@/components/app-modal";
import { PlusCircle } from "lucide-react";
import { ClubActivity } from "@/types";
import { createClubActivity } from "@/actions/club-activity";
import { CustomToast } from "@/components/ui/toast";
export default function ClubActivityPage() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const handleNewClubSubmit = async (data: Omit<ClubActivity, "id" | "createdAt" | "updatedAt">) => {
    try {
      await createClubActivity(data);
      setIsNewModalOpen(false);
      CustomToast.success("部活動を登録しました");
    } catch (error) {
      console.error("部活動の登録に失敗しました:", error);
      CustomToast.error("部活動の登録に失敗しました");
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">部活動</h2>
        <Button onClick={() => setIsNewModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新規部活動登録
        </Button>
      </div>

      <ClubTable />

      <ClubModalForm
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleNewClubSubmit}
      />
    </div>
  );
}
