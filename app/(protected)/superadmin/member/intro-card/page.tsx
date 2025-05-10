"use client";

import type { User } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppTable } from "@/components/app-table";
import { renderMemberIntroCard } from "@/components/app-table/render/MemberIntroCardItem";
import { useGetUserList } from "@/components/app-table/hooks/use-table-data";
import { Button } from "@/components/ui/button";
import { FilePenLine } from "lucide-react";

export default function MemberIntroCardPage() {
  const router = useRouter();
  const { data: users, isLoading } = useGetUserList();

  return (
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
          router.push(`/member/intro-card/${row.id}`);
        }}
      />
    </div>
  );
}
