"use client";

import { useState, useMemo } from "react";
import { AddButton } from "@/components/add-button";
import { QaModalForm } from "@/components/app-modal/qa-modal-form";
import { createQA, updateQA, deleteQA } from "@/actions/qa";
import { useSubmit } from "@/lib/submitHandler";
import { CustomToast } from "@/components/ui/toast";
import { useModal } from "@/hooks/use-modal";
import { useQueryClient } from "@tanstack/react-query";
import { useGetQa } from "@/components/app-table/hooks/use-table-data";
import { AccordionTable } from "@/components/app-accordion-table";
import { renderQa } from "@/components/app-accordion-table/render/QAItem";
import type { QaFormValues } from "@/lib/validations";
import { Qa } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// 固定のカテゴリーリスト
const defaultCategories = ["IT", "人事", "経理", "総務", "その他"];

export default function AdminQAPage() {
  const queryClient = useQueryClient();
  const { isOpen, openModal, closeModal } = useModal();
  const [currentData, setCurrentData] = useState<Qa | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const itemsPerPage = 5;

  const { data: qaItems, isLoading } = useGetQa();

  // カテゴリーリストを計算
  const categories = useMemo(() => {
    const dbCategories = Array.from(new Set(qaItems?.map(item => item.category) ?? [])).filter(Boolean);
    return [...defaultCategories, ...dbCategories];
  }, [qaItems]);

  const handleEdit = (item: Qa) => {
    setCurrentData(item);
    openModal();
  };

  const handleDelete = (item: Qa) => {
    setCurrentData(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (currentData) {
      await deleteQA(currentData.id);
      CustomToast.success("QAを削除しました");
      setIsDeleteDialogOpen(false);
      setCurrentData(null);
      queryClient.invalidateQueries({ queryKey: ["qa"] });
    }
  };

  const { handleSubmit } = useSubmit<Qa, QaFormValues>({
    action: async (data) => {
      if (currentData) {
        await updateQA(currentData.id, {
          question: data.question,
          answer: data.answer || '',
          category: data.category,
          questionBy: data.questionBy,
          answeredBy: data.answeredBy,
        });
      } else {
        await createQA({
          question: data.question,
          answer: data.answer || '',
          category: data.category,
          questionBy: data.questionBy,
          answeredBy: data.answeredBy,
        });
      }
    },
    onSuccess: () => {
      closeModal();
      CustomToast.success(currentData ? "QAを更新しました" : "QAを登録しました");
      setCurrentData(null);
      queryClient.invalidateQueries({ queryKey: ["qa"] });
    },
    onError: () => {
      CustomToast.error("QAの保存に失敗しました");
    },
  });

  const handleAdd = () => {
    setCurrentData(null);
    openModal();
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">QA管理</h1>
        <AddButton text="新規QA登録" onClick={handleAdd} />
      </div>

      <QaModalForm
        type="admin"
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={currentData}
      />

      <AccordionTable
        data={qaItems ?? []}
        columns={renderQa({
          onEdit: handleEdit,
          onDelete: handleDelete,
        })}
        idField="id"
        searchFields={["question", "answer"]}
        categoryField="category"
        categories={categories}
        renderContent={(item) => (
          <div className="rounded-md bg-muted/50 p-4">
            <p className="mb-2 text-sm text-muted-foreground">回答者: {item.answeredBy}</p>
            {item.answer}
          </div>
        )}
        itemsPerPage={10}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QAの削除</DialogTitle>
            <DialogDescription>
              このQAを削除してもよろしいですか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
