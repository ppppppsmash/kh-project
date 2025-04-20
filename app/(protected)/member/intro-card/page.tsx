"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AppTable } from "@/components/app-table";
import { renderMemberIntroCard } from "@/components/app-table/render/MemberIntroCardItem";
import { useGetMembers } from "@/components/app-table/hooks/use-table-data";

export default function MemberIntroCardPage() {
  //const queryClient = useQueryClient();
  const { data: members, isLoading } = useGetMembers();

  return (
    <div className="space-y-8">
      {/* <MemberTable /> */}
      <AppTable
        columns={renderMemberIntroCard()}
        data={members || []}
        loading={isLoading}
        searchableKeys={["name", "department", "position", "hobby", "skills", "freeText"]}
      />
    </div>
  );
}
