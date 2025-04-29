"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClubActivity, ClubStatus } from "@/types";
import { clubFormSchema, ClubFormValues } from "@/lib/validations";
import { BaseModalForm } from "./base-modal-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ClubModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ClubActivity, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  defaultValues?: Partial<ClubActivity>;
  title?: string;
}

export const ClubModalForm = ({
  title = "部活動登録",
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
}: ClubModalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = defaultValues ? true : false;

  const form = useForm<ClubFormValues>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: {
      name: "",
      description: "",
      leader: "",
      memberCount: undefined,
      activityType: "",
      status: "active",
      location: "",
      detail: "",
    },
  });

  const handleSubmit = async (data: ClubFormValues) => {
    setIsSubmitting(true);
    try {
      const clubData: Omit<ClubActivity, "id" | "createdAt" | "updatedAt"> = {
        ...data,
        memberCount: data.memberCount || 0,
        status: data.status || "active",
        location: data.location || "",
        detail: data.detail || "",
      };
      await onSubmit(clubData);
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
        form.reset({
          name: defaultValues.name || "",
          description: defaultValues.description || "",
          leader: defaultValues.leader || "",
          memberCount: defaultValues.memberCount || undefined,
          activityType: defaultValues.activityType || "",
          status: defaultValues.status || "active",
          location: defaultValues.location || "",
          detail: defaultValues.detail || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          leader: "",
          memberCount: undefined,
          activityType: "",
          status: "active",
          location: "",
          detail: "",
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
        <Label htmlFor="name">部活動名<span className="text-red-500">*</span></Label>
        <Input
          id="name"
          {...form.register("name")}
          required
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明<span className="text-red-500">*</span></Label>
        <Textarea
          id="description"
          {...form.register("description")}
          required
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="leader">部長<span className="text-red-500">*</span></Label>
        <Input
          id="leader"
          {...form.register("leader")}
          required
        />
        {form.formState.errors.leader && (
          <p className="text-sm text-red-500">{form.formState.errors.leader.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="memberCount">メンバー数<span className="text-red-500">*</span></Label>
        <Input
          id="memberCount"
          type="number"
          {...form.register("memberCount", { 
            valueAsNumber: true,
            setValueAs: (v: string) => v === "" ? undefined : Number(v)
          })}
          required
        />
        {form.formState.errors.memberCount && (
          <p className="text-sm text-red-500">{form.formState.errors.memberCount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityType">活動タイプ<span className="text-red-500">*</span></Label>
        <Input
          id="activityType"
          {...form.register("activityType")}
          required
        />
        {form.formState.errors.activityType && (
          <p className="text-sm text-red-500">{form.formState.errors.activityType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">ステータス</Label>
        <Select
          value={form.watch("status")}
          onValueChange={(value: ClubStatus) => form.setValue("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="ステータスを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">活動中</SelectItem>
            <SelectItem value="inactive">休止中</SelectItem>
            <SelectItem value="pending">承認待ち</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.status && (
          <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">活動場所</Label>
        <Input
          id="location"
          {...form.register("location")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="detail">詳細</Label>
        <Textarea
          id="detail"
          {...form.register("detail")}
        />
      </div>
    </BaseModalForm>
  );
}; 