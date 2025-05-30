"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteTabDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tabName: string;
}

export const DeleteTabDialog = ({
  isOpen,
  onClose,
  onConfirm,
  tabName,
}: DeleteTabDialogProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タブの削除</DialogTitle>
          <DialogDescription>
            「{tabName}」タブを削除してもよろしいですか？
            この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 