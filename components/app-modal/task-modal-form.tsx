"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskFormSchema, TaskFormValues } from "@/lib/validations";
import { BaseModalForm } from "./base-modal-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface TaskModalFormProps {
  title?: string;
  onSubmit: (data: TaskFormValues) => Promise<void>;
  onClose: () => void;
  defaultValues?: Partial<TaskFormValues>;
  isOpen: boolean;
}

const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

export const TaskModalForm = ({
  title = "タスク登録",
  onClose,
  onSubmit,
  defaultValues,
  isOpen,
}: TaskModalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = defaultValues ? true : false;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      content: defaultValues?.content || "",
      assignee: defaultValues?.assignee || "",
      dueDate: defaultValues?.dueDate || new Date(),
      startedAt: defaultValues?.startedAt || new Date(),
      progress: defaultValues?.progress || "pending",
      progressDetails: defaultValues?.progressDetails || "",
      link: defaultValues?.link || "",
      notes: defaultValues?.notes || "",
      completedAt: defaultValues?.completedAt || undefined,
      isPublic: defaultValues?.isPublic || false,
    },
  });

  const handleSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);

    try {
      const taskData = {
        ...data,
        dueDate: data.dueDate,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        progressDetails: data.progressDetails || "",
        link: data.link || "",
        notes: data.notes || "",
        isPublic: data.isPublic || false,
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

  console.log(form.formState.errors);

  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        form.reset({
          ...defaultValues,
        });
      } else {
        form.reset({
          title: "",
          content: "",
          assignee: "",
          dueDate: undefined,
          startedAt: undefined,
          progress: "pending",
          progressDetails: "",
          link: "",
          notes: "",
          completedAt: undefined,
          isPublic: false,
        });
      }
    }
  }, [isOpen, defaultValues, form]);

  return (
    <BaseModalForm
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      isSubmitting={isSubmitting}
      isEdit={isEdit}
    >
      <div className="space-y-2">
        <Label htmlFor="title">項目名<span className="text-red-500">*</span></Label>
        <Input
          id="title"
          {...form.register("title", { required: "項目名は必須です" })}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">内容<span className="text-red-500">*</span></Label>
        <Textarea
          id="content"
          {...form.register("content", { required: "内容は必須です" })}
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignee">担当者<span className="text-red-500">*</span></Label>
        <Input
          id="assignee"
          {...form.register("assignee", { required: "担当者は必須です" })}
        />
        {form.formState.errors.assignee && (
          <p className="text-sm text-red-500">{form.formState.errors.assignee.message}</p>
        )}
      </div>

      <div className="flex gap-x-10 items-start">
        <div className="space-y-2 w-full">
          <Label htmlFor="startedAt">起票日<span className="text-red-500">*</span></Label>
          <Input
            id="startedAt"
            type="date"
            value={formatDateForInput(form.watch("startedAt"))}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : new Date();
              form.setValue("startedAt", date);
            }}
          />
          {form.formState.errors.startedAt && (
            <p className="text-sm text-red-500">{form.formState.errors.startedAt.message}</p>
          )}
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="dueDate">期限日<span className="text-red-500">*</span></Label>
          <Input
            id="dueDate"
            type="date"
            value={formatDateForInput(form.watch("dueDate"))}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : new Date();
              form.setValue("dueDate", date);
            }}
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
            value={formatDateForInput(form.watch("completedAt"))}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : undefined;
              form.setValue("completedAt", date);
            }}
          />
        </div>
      </div>

      <div className="flex gap-x-16 items-start">
        <div className="space-y-2">
          <Label htmlFor="progress">進捗状況</Label>
          <Select
            value={form.watch("progress")}
            onValueChange={(value: TaskFormValues["progress"]) => form.setValue("progress", value)}
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
        <Label htmlFor="progressDetails">進捗状況・対応内容</Label>
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
