"use client";

import Link from "next/link";
import { AppTable } from "@/components/app-table";
import { renderMemberIntroCard } from "@/components/app-table/render/MemberIntroCardItem";
import { useGetMembers } from "@/components/app-table/hooks/use-table-data";
import { Button } from "@/components/ui/button";
import { FilePenLine } from "lucide-react";

export default function MemberIntroCardPage() {
  const { data: members, isLoading } = useGetMembers();

  return (
    <div className="space-y-8">
      <Button variant="outline">
        <FilePenLine className="h-4 w-4" />
        <Link target="_blank" href="/external/intro-card/">登録フォームへ</Link>
      </Button>
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
