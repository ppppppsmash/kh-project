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
    <Card className="overflow-hidden">
      <div
        className="h-40 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${member.photoUrl})`,
          backgroundColor: `${getMemberColor(member.id)}30`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <CardContent className="pt-6 pb-8 relative">
        <div className="absolute -top-16 left-6 w-24 h-24 rounded-full overflow-hidden border-4 border-background">
          <img src={member.photoUrl || "/placeholder.svg"} alt={member.name} className="w-full h-full object-cover" />
        </div>

        <div className="ml-32 mb-6">
          <h2 className="text-2xl font-bold">{member.name}</h2>
          <p className="text-muted-foreground text-xs">{member.department}</p>
          <p className="text-muted-foreground text-xs">{member.position}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">自己紹介</h3>
            <p className="text-muted-foreground">{member.freeText}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">得意な技術・スキル</h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="px-3 py-1"
                style={{ borderColor: getMemberColor(member.id), color: getMemberColor(member.id) }}
              >
                {member.skills}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">趣味・特技</h3>
            <p className="text-muted-foreground">{member.hobby}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">自由記載欄</h3>
            <p className="text-muted-foreground">{member.freeText}</p>
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
