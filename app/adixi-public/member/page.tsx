"use client";

import { MemberGrid } from "@/components/app-list/member-grid";
import { useGetUserList } from "@/components/app-table/hooks/use-table-data";

export default function MemberIntroCardPage() {
  const { data: users, isLoading } = useGetUserList();

  return (
    <div className="container mx-auto">
      <MemberGrid members={users || []} onSelectMember={() => {}} />
    </div>
  );
}
