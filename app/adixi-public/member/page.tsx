"use client";

import type { MemberFormValues } from "@/lib/validations";
import { useState } from "react";
import { MemberGrid } from "@/components/app-list/member-grid";
import { useGetUserList } from "@/components/app-table/hooks/use-table-data";
import MemberCard from "@/components/app-list/member-card";
import MemberList from "@/components/app-list/member-list";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { X, Grid, Rows } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { useDisplayStore } from "@/lib/store/member-display-store";

// プリセットカラーの配列
export const PRESET_COLORS = [
  "#FF6B6B", // 赤
  "#4ECDC4", // ターコイズ
  "#45B7D1", // ブルー
  "#96CEB4", // ミント
  "#FFEEAD", // イエロー
  "#D4A5A5", // ピンク
  "#9B59B6", // パープル
  "#3498DB", // ライトブルー
  "#E67E22", // オレンジ
  "#2ECC71", // グリーン
  "#1ABC9C", // ターコイズグリーン
  "#F1C40F", // イエロー
  "#E74C3C", // レッド
  "#34495E", // ダークブルー
  "#16A085", // ダークターコイズ
  "#808080", // グレー
  "#FFD700", // 金
  "#C0C0C0", // シルバー
  "#800080", // パープル
  "#008000", // グリーン
  "#000080", // ネイビーブルー
  "#800000", // マルーン
  "#008080", // ティール
  "#4B0082", // インディゴ
  "#FF4500", // オレンジレッド
];

export default function MemberIntroCardPage() {
  const { data: users, isLoading } = useGetUserList();
  const [selectedMember, setSelectedMember] = useState<MemberFormValues | null>(null);
  const { displayMode, setDisplayMode } = useDisplayStore();

  const handleSelectMember = (member: MemberFormValues) => {
    setSelectedMember(member)
  };

  const handleClose = () => {
    setSelectedMember(null);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-start mb-4">
        <ToggleGroup
          type="single"
          value={displayMode}
          onValueChange={(value) => value && setDisplayMode(value as "grid" | "list")}
          className="bg-muted/50 p-1 rounded-lg"
        >
          <ToggleGroupItem
            value="grid"
            aria-label="グリッド表示"
            className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-200"
          >
            <Grid className="h-4 w-4" />
            グリッド
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="リスト表示"
            className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-200"
          >
            <Rows className="h-4 w-4" />
            リスト
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {displayMode === "grid" && (
        <MemberGrid members={users || []} onSelectMember={handleSelectMember} />
      )}
      {displayMode === "list" && (
        <MemberList members={users || []} onSelectMember={handleSelectMember} />
      )}

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm rounded-full"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">閉じる</span>
              </Button>
              <MemberCard member={selectedMember} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
