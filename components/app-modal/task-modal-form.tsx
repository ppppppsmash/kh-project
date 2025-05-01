"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Task, TaskProgress } from "@/types";
import { taskFormSchema, TaskFormValues } from "@/lib/validations";
import { BaseModalForm } from "./base-modal-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface TaskModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  defaultValues?: Partial<Task>;
  title?: string;
}

export const TaskModalForm = ({
  title = "タスク登録",
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
}: TaskModalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = defaultValues ? true : false;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      content: "",
      assignee: "",
      dueDate: "",
      progress: "pending",
      progressDetails: "",
      link: "",
      notes: "",
      completedAt: "",
      isPublic: false,
    },
  });

  const handleSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      const taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
        ...data,
        dueDate: new Date(data.dueDate),
        link: data.link || "",
        progressDetails: data.progressDetails || "",
        notes: data.notes || "",
        isPublic: data.isPublic || false,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      };
      await onSubmit(taskData);
      form.reset();
      onClose();
    } catch (error) {
      console.error("登録に失敗しました:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // モーダルが開かれたときにフォームをリセット
  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        const dueDate = defaultValues.dueDate
          ? new Date(defaultValues.dueDate).toISOString().split('T')[0]
          : "";
        
        form.reset({
          title: defaultValues.title || "",
          content: defaultValues.content || "",
          assignee: defaultValues.assignee || "",
          dueDate,
          progress: defaultValues.progress || "pending",
          progressDetails: defaultValues.progressDetails || "",
          link: defaultValues.link || "",
          notes: defaultValues.notes || "",
        });
      } else {
        form.reset({
          title: "",
          content: "",
          assignee: "",
          dueDate: "",
          progress: "pending",
          progressDetails: "",
          link: "",
          notes: "",
          completedAt: "",
          isPublic: false,
        });
      }
    }
  }, [isOpen, defaultValues]);

  return (
    <BaseModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      title={title}
      isSubmitting={isSubmitting}
      isEdit={isEdit}
    >
      <div className="space-y-2">
        <Label htmlFor="title">項目名<span className="text-red-500">*</span></Label>
        <Input
          id="title"
          {...form.register("title")}
          required
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">内容<span className="text-red-500">*</span></Label>
        <Textarea
          id="content"
          {...form.register("content")}
          required
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignee">担当者<span className="text-red-500">*</span></Label>
        <Input
          id="assignee"
          {...form.register("assignee")}
          required
        />
        {form.formState.errors.assignee && (
          <p className="text-sm text-red-500">{form.formState.errors.assignee.message}</p>
        )}
      </div>

      <div className="flex gap-x-10 items-start">
        <div className="space-y-2 w-full">
          <Label htmlFor="dueDate">期限<span className="text-red-500">*</span></Label>
          <Input
            id="dueDate"
            type="date"
            {...form.register("dueDate")}
            required
          />
          {form.formState.errors.dueDate && (
            <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
          )}
        </div>
        <div className="space-y-2 w-full">
            <Label htmlFor="completedAt">完了日</Label>
            <Input
              id="completedAt"
              type="date"
            {...form.register("completedAt")}
          />
        </div>
      </div>

      <div className="flex gap-x-16 items-start">
        <div className="space-y-2">
          <Label htmlFor="progress">進捗状況</Label>
          <Select
            value={form.watch("progress")}
            onValueChange={(value: TaskProgress) => form.setValue("progress", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="進捗状況を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">未着手</SelectItem>
              <SelectItem value="inProgress">進行中</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="isPublic">公開</Label>
          <Switch
            id="isPublic"
            className="mt-2"
            checked={form.watch("isPublic")}
              onCheckedChange={(value: boolean) => form.setValue("isPublic", value)}
            />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="progressDetails">対応内容</Label>
        <Textarea
          id="progressDetails"
          {...form.register("progressDetails")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">リンク先</Label>
        <Input
          id="link"
          type="url"
          {...form.register("link")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">備考</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
        />
      </div>
    </BaseModalForm>
  );
};
