"use client";

import { useEffect, useState } from "react";
import { getIntroCards } from "@/actions/intro-card";
import { member } from "@/db/shecma/member";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberIntroTableSkeleton } from "@/components/app-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

type Member = typeof member.$inferSelect;

export const MemberTable = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getIntroCards();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) {
    return (
      <MemberIntroTableSkeleton />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>自己紹介一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>写真</TableHead>
              <TableHead>名前</TableHead>
              <TableHead>事業部</TableHead>
              <TableHead>役職</TableHead>
              <TableHead>趣味・特技</TableHead>
              {/* <TableHead>得意な技術・スキル</TableHead>
              <TableHead>自由記載欄</TableHead> */}
              <TableHead>登録日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      width={60}
                      height={60}
                      className="rounded-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.position}</TableCell>
                <TableCell>{member.hobby}</TableCell>
                {/* <TableCell>{member.skills}</TableCell>
                <TableCell>{member.freeText}</TableCell> */}
                <TableCell>
                  {member.createdAt
                    ? new Date(member.createdAt).toLocaleDateString("ja-JP")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 