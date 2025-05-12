"use client";

import { MemberFormValues } from "@/lib/validations";
import Link from "next/link";
import { useState } from "react";
import { FilePenLine } from "lucide-react";
import { AppTable } from "@/components/app-table";
import { renderMemberIntroCard } from "@/components/app-table/render/MemberIntroCardItem";
import { useGetUserList } from "@/components/app-table/hooks/use-table-data";
import { Button } from "@/components/ui/button";
import { UserDetailModal } from "@/components/app-modal/user-detail-modal";

export default function MemberListPage() {
  const { data: users, isLoading } = useGetUserList();
  const [selectedUser, setSelectedUser] = useState<MemberFormValues | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (user: MemberFormValues) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">メンバー一覧</h2>
      </div>
      <div className="space-y-8">
        <Button variant="outline">
          <FilePenLine className="h-4 w-4" />
          <Link target="_blank" href="/adixi-public/member/">LDRページへ</Link>
        </Button>

        <AppTable
          toolBar={{
            researchBarPlaceholder: "名前や事業部を検索...",
          }}
          columns={renderMemberIntroCard()}
          data={users || []}
          loading={isLoading}
          searchableKeys={["name", "department", "position", "hobby", "skills", "freeText"]}
          onRowClick={(row: MemberFormValues) => {
            handleRowClick(row);
          }}
        />
      </div>

      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
