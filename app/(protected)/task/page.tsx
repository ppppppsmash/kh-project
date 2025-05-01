"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/hooks/use-modal";
import { Task } from '@/types';
import { AddButton } from "@/components/add-button";
import { AppTable } from "@/components/app-table";
import { renderTask } from "@/components/app-table/render/TaskItem";
import { useGetTasks } from "@/components/app-table/hooks/use-table-data";
import { TaskDetailSheet } from "@/components/app-sheet/task-detail-sheet";
import { TaskModalForm } from "@/components/app-modal/task-modal-form";
import { CustomToast } from "@/components/ui/toast";
import { useSubmit } from "@/lib/submitHandler";
import { createTask, updateTask, deleteTask } from "@/actions/task";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TaskPage() {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useGetTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  const handleEdit = (row: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(row);
    setCurrentData(row);
    openModal();
  };

  const handleDelete = (row: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentData(row);
    setSelectedTask(row);
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

  const handleAdd = () => {
    // Sheetを開く前にselectedTaskとcurrentDataをリセット
    setSelectedTask(null);
    // 新規登録の場合はcurrentDataをnullにする
    setCurrentData(null);
    openModal();
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
        data={tasks ?? []}
        loading={isLoading}
        searchableKeys={["title", "assignee", "dueDate", "progress"]}
        onRowClick={(row: Task) => {
          setSelectedTask(row);
          setIsDetailOpen(true);
        }}
      />

      <TaskDetailSheet
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(task) => {
          setSelectedTask(task);
          setCurrentData(task);
          setIsDetailOpen(false);
          openModal();
        }}
        onDelete={(task) => {
          setSelectedTask(task);
          setCurrentData(task);
          setIsDeleteDialogOpen(true);
          setIsDetailOpen(false);
        }}
      />

      <TaskModalForm
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          setSelectedTask(null);
          setCurrentData(null);
        }}
        onSubmit={handleSubmit}
        defaultValues={selectedTask ?? undefined}
        title={selectedTask ? "タスク編集" : "新規タスク登録"}
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
