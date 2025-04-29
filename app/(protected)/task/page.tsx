"use client";

import { useState } from 'react';
import { Task } from '@/types';
import { AddButton } from "@/components/add-button";
import { AppTable } from "@/components/app-table";
import { renderTask } from "@/components/app-table/render/TaskItem";
import { useGetTasks } from "@/components/app-table/hooks/use-table-data";
export default function TaskPage() {
  const { data: tasks, isLoading } = useGetTasks();

  const handleAdd = () => {
    console.log('新規タスク登録');
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">タスク管理</h2>
        <AddButton text="新規タスク登録" onClick={handleAdd} />
      </div>

      <AppTable
        columns={renderTask()}
        data={tasks ?? []}
        loading={false}
        searchableKeys={["title", "assignee", "dueDate", "progress"]}
      />
    </div>
  );
}
