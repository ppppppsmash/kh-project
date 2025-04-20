"use client";

import { AppTable } from "@/components/app-table";
import { renderMemberIntroCard } from "@/components/app-table/render/MemberIntroCardItem";
import { useGetMembers } from "@/components/app-table/hooks/use-table-data";

export default function MemberIntroCardPage() {
  const { data: members, isLoading } = useGetMembers();

  return (
    <div className="space-y-8">
      <AppTable
        toolBar={{
          researchBarPlaceholder: "名前や事業部を検索...",
        }}
        columns={renderMemberIntroCard()}
        data={members || []}
        loading={isLoading}
        searchableKeys={["name", "department", "position", "hobby", "skills", "freeText"]}
      />
    </div>
  );
}
