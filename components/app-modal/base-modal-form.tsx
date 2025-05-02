"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BaseModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  title: string;
  children: ReactNode;
  isSubmitting?: boolean;
  submitText?: string;
  isEdit?: boolean;
}

export const BaseModalForm = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  isSubmitting = false,
  submitText = "登録",
  isEdit = false,
}: BaseModalFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "処理中..." : isEdit ? "更新" : submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
