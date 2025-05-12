"use client";

import type { MemberFormValues } from "@/lib/validations";
import { useState } from "react";
import { MemberGrid } from "@/components/app-list/member-grid";
import { useGetUserList } from "@/components/app-table/hooks/use-table-data";
import MemberCard from "@/components/app-list/member-card";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function MemberIntroCardPage() {
  const { data: users, isLoading } = useGetUserList();
  const [selectedMember, setSelectedMember] = useState<MemberFormValues | null>(null);

  const handleClose = () => {
    setSelectedMember(null);
  };

  return (
    <div className="container mx-auto">
      <MemberGrid members={users || []} onSelectMember={setSelectedMember} />

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
