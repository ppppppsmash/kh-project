"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/hooks/use-modal";
import { TaskFormValues } from '@/lib/validations';
import { AddButton } from "@/components/add-button";
import { AppTable } from "@/components/app-table";
import { renderTask, filterTask, getTaskStatusFilters } from "@/components/app-table/render/TaskItem";
import { useGetTasks, useGetTabs } from "@/components/app-table/hooks/use-table-data";
import { TaskDetailSheet } from "@/components/app-sheet/task-detail-sheet";
import { TaskModalForm } from "@/components/app-modal/task-modal-form";
import { CustomToast } from "@/components/ui/toast";
import { useSubmit } from "@/lib/submitHandler";
import { createTask, updateTask, deleteTask } from "@/actions/task";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TabManager } from "@/components/app-tab/tab-manager";
import { TabFormValues } from "@/lib/validations";
import { createTab, updateTab, deleteTab } from "@/actions/tab";

export default function TaskPage() {
  const queryClient = useQueryClient();
  const [selectedTabId, setSelectedTabId] = useState<string | undefined>();
  const { data: tasks, isLoading } = useGetTasks(selectedTabId);
  const [selectedTask, setSelectedTask] = useState<TaskFormValues | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [currentData, setCurrentData] = useState<TaskFormValues | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: tabs, isLoading: isTabsLoading } = useGetTabs();

  useEffect(() => {
    if (tabs && tabs.length > 0 && !selectedTabId) {
      setSelectedTabId(tabs[0].id);
    }
  }, [tabs, selectedTabId]);

  const { handleSubmit } = useSubmit<TaskFormValues>({
    action: async (data) => {
      if (currentData && currentData.id) {
        await updateTask(currentData.id, data);
      } else {
        await createTask(data);
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

  const handleEdit = (row: TaskFormValues, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(row);
    setCurrentData(row);
    openModal();
  };

  const handleDelete = (row: TaskFormValues, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentData(row);
    setSelectedTask(row);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (currentData && currentData.id) {
      await deleteTask(currentData.id);
      CustomToast.success("タスクを削除しました");
      setIsDeleteDialogOpen(false);
      setCurrentData(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  };

  // タブの作成、更新、削除
  const handleCreateTab = async (data: TabFormValues) => {
    try {
      await createTab(data.name);
      CustomToast.success("タブを作成しました");
      queryClient.invalidateQueries({ queryKey: ["tabs"] });
    } catch (error) {
      CustomToast.error("タブの作成に失敗しました");
    }
  };

  const handleUpdateTab = async (data: TabFormValues) => {
    try {
      if (data.id) {
        await updateTab(data.id, data.name);
        CustomToast.success("タブを更新しました");
        queryClient.invalidateQueries({ queryKey: ["tabs"] });
      }
    } catch (error) {
      CustomToast.error("タブの更新に失敗しました");
    }
  };

  const handleDeleteTab = async (data: TabFormValues, options: { moveTasksToTabId?: string; deleteTasks?: boolean }) => {
    try {
      if (data.id) {
        await deleteTab(data.id, options);
        CustomToast.success("タブを削除しました");
        queryClient.invalidateQueries({ queryKey: ["tabs"] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    } catch (error) {
      CustomToast.error("タブの削除に失敗しました");
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
      </div>

      <TabManager
        selectedTabId={selectedTabId}
        onTabSelect={setSelectedTabId}
        onTabCreate={handleCreateTab}
        onTabUpdate={handleUpdateTab}
        onTabDelete={handleDeleteTab}
        tabs={tabs ?? []}
      />

      <AddButton className="mb-2" text="新規タスク登録" onClick={handleAdd} />
      <AppTable
        columns={renderTask({
          onEdit: handleEdit,
          onDelete: handleDelete,
        })}
        data={tasks ?? []}
        loading={isLoading}
        searchableKeys={["taskId", "title", "assignee", "dueDate"]}
        toolBar={{
          researchBarPlaceholder: "タスク検索",
          researchStatusFilter: getTaskStatusFilters(),
        }}
        onFilter={filterTask}
        onRowClick={(row: TaskFormValues) => {
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
        selectedTabId={selectedTabId}
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
