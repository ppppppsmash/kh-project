"use client";

import { useState } from "react";
import { AddButton } from "@/components/add-button";
import { QaModalForm } from "@/components/app-modal/qa-modal-form";
import { createQA, updateQA, deleteQA } from "@/actions/qa";
import { useSubmit } from "@/lib/submitHandler";
import { CustomToast } from "@/components/ui/toast";
import { useModal } from "@/hooks/use-modal";
import { useQueryClient } from "@tanstack/react-query";
import { useGetQa } from "@/components/app-table/hooks/use-table-data";
import { AccordionTable, AccordionTableColumn } from "@/components/app-accordion-table";
import { renderQa } from "@/components/app-accordion-table/render/QAItem";
import type { QaFormValues } from "@/lib/validations";
import { Qa } from "@/types";

const categories = ["IT", "人事", "経理", "総務", "その他"];

export default function AdminQAPage() {
  const queryClient = useQueryClient();
  const { isOpen, openModal, closeModal } = useModal();
  const [currentData, setCurrentData] = useState<Qa | null>(null);
  const itemsPerPage = 5;

  const { data: qaItems, isLoading } = useGetQa();

  const handleEdit = (item: Qa) => {
    setCurrentData(item);
    openModal();
  };

  const handleDelete = (item: Qa) => {
    if (window.confirm("このQAを削除してもよろしいですか？")) {
      deleteQA(item.id);
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
          <div className="rounded-md bg-muted/50 p-4">{item.answer}</div>
        )}
        itemsPerPage={10}
      />
    </div>
  );
}
