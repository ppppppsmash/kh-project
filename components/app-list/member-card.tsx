"use client";

import { motion } from "motion/react";
import type { MemberFormValues } from "@/lib/validations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMemberColor } from "./member-grid";

interface MemberCardProps {
  member: MemberFormValues
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <Card className="overflow-hidden py-0 h-[80svh]">
      {member?.photoUrl && (
      <div
        className="h-[40svh] bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${member?.photoUrl})`,
          backgroundColor: `${getMemberColor(member?.id)}30`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>
      )}

      <CardContent className="pt-6 relative overflow-y-auto">

        <div className="mb-6">
          <h2 className="text-2xl font-bold">{member?.name}</h2>
          <p className="text-muted-foreground text-xs">{member?.department}</p>
          <p className="text-muted-foreground text-xs">{member?.position}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">言語</h3>
            <p className="text-muted-foreground">
              {member?.skills?.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-3 py-1 mr-4"
                  style={{ borderColor: getMemberColor(member.id), color: getMemberColor(member.id) }}
                >
                  {skill}
                </Badge>
              )) || (
                <span className="text-muted-foreground text-xs">未設定</span>
              )}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">得意な技術・スキル</h3>
            <div className="flex flex-wrap gap-2">
              {member?.skills_message ? (
                <div className="whitespace-pre-wrap break-words">
                  {member?.skills_message}
                </div>
              ) : (
                "未設定"
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">趣味・特技</h3>
            <p className="text-muted-foreground">{member?.hobby || "未設定"}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">自由記載欄</h3>
            <p className="text-muted-foreground">{member?.freeText || "未設定"}</p>
          </div>

          <motion.div
            className="w-full h-1 mt-4"
            style={{ backgroundColor: getMemberColor(member.id) }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
