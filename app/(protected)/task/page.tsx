"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/hooks/use-modal";
import { Task } from '@/types';
import { AddButton } from "@/components/add-button";
import { AppTable } from "@/components/app-table";
import { renderTask } from "@/components/app-table/render/TaskItem";
import { useGetTasks } from "@/components/app-table/hooks/use-table-data";
import { TaskModalForm } from "@/components/app-modal/task-modal-form";
import { CustomToast } from "@/components/ui/toast";
import { useSubmit } from "@/lib/submitHandler";
import { createTask, updateTask, deleteTask } from "@/actions/task";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TaskPage() {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useGetTasks();

  const { isOpen, openModal, closeModal } = useModal();
  const [currentData, setCurrentData] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { handleSubmit } = useSubmit<Task>({
    action: async (data) => {
      if (currentData) {
        await updateTask(currentData.id, data as Task);
      } else {
        await createTask(data as Task);
      }
    },
    onSuccess: () => {
      closeModal();
      CustomToast.success(currentData ? "タスクを更新しました" : "タスクを登録しました");
      setCurrentData(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      CustomToast.error(currentData ? "タスクの更新に失敗しました" : "タスクの登録に失敗しました");
    },
  });

  const handleAdd = () => {
    setCurrentData(null);
    openModal();
  };

  const handleEdit = (row: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentData(row);
    openModal();
  };

  const handleDelete = (row: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentData(row);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (currentData) {
      await deleteTask(currentData.id);
      CustomToast.success("タスクを削除しました");
      setIsDeleteDialogOpen(false);
      setCurrentData(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">タスク管理</h2>
        <AddButton text="新規タスク登録" onClick={handleAdd} />
      </div>

      <AppTable
        columns={renderTask({
          onEdit: handleEdit,
          onDelete: handleDelete,
        })}
        data={tasks || []}
        loading={isLoading}
        searchableKeys={["title", "assignee", "dueDate", "progress"]}
      />

      <TaskModalForm
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setCurrentData(null);
        }}
        onSubmit={handleSubmit}
        defaultValues={currentData || undefined}
        title={currentData ? "タスクの編集" : "新規タスク登録"}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスクの削除</DialogTitle>
            <DialogDescription>
              この部活動を削除してもよろしいですか？この操作は元に戻せません。
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
