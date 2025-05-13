"use client"

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import type { MemberFormValues } from "@/lib/validations";
import { Badge } from "@/components/ui/badge";
import { PRESET_COLORS } from "@/config";

interface MemberGridProps {
  members: MemberFormValues[];
  onSelectMember: (member: MemberFormValues) => void;
}

// メンバーIDに基づいて一貫したカラーを生成する関数
export const getMemberColor = (id: string | undefined): string => {
  if (!id) return PRESET_COLORS[0];
  // IDの文字列を数値に変換して、カラーのインデックスを生成
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PRESET_COLORS[hash % PRESET_COLORS.length];
};

export const MemberGrid = ({ members, onSelectMember }: MemberGridProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // メンバーごとのカラーをメモ化
  const memberColors = useMemo(() => {
    return members.reduce((acc, member) => {
      acc[member.id || ''] = getMemberColor(member.id);
      return acc;
    }, {} as Record<string, string>);
  }, [members]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {members.map((member) => {
        const memberColor = memberColors[member.id || ''];
        return (
          <motion.div
            key={member.id}
            className="relative cursor-pointer group"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredId(member.id || null)}
            onHoverEnd={() => setHoveredId(null)}
            onClick={() => onSelectMember(member)}
          >
            <div
              className="sm:h-80 md:h-90 lg:h-100 rounded-xl overflow-hidden relative bg-gray-100"
              style={{
                boxShadow:
                  hoveredId === member.id
                    ? `0 20px 25px -5px ${memberColor}40, 0 8px 10px -6px ${memberColor}30`
                    : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />

              <motion.div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ 
                  backgroundImage: `url(${member.photoUrl})`,
                  opacity: member.photoUrl ? 1 : 0.5,
                }}
                animate={{
                  scale: hoveredId === member.id ? 1.1 : 1,
                }}
                transition={{ duration: 0.4 }}
              />

              <motion.div
                className="absolute bottom-0 left-0 right-0 p-6 z-20"
                initial={false}
                animate={{ y: hoveredId === member.id ? -10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mb-1">{member.name}</h2>
                <p className="text-white/80 text-xs">{member.department}</p>
                <p className="text-white/80 text-xs">{member.position}</p>
                <motion.div
                  className="flex flex-wrap gap-2 mt-3"
                  initial={false}
                  animate={{ opacity: hoveredId === member.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {member.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-2 py-1 text-xs font-medium"
                      style={{ backgroundColor: `${memberColor}90`, color: "white" }}
                  >
                      {skill}
                    </Badge>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute top-0 left-0 w-full h-1 z-20"
                style={{ 
                  backgroundColor: memberColor,
                  transformOrigin: "left"
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: hoveredId === member.id ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
