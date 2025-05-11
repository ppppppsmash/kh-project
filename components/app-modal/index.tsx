"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clubFormSchema, ClubFormValues } from "@/lib/validations";

interface ClubModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClubFormValues) => Promise<void>;
  defaultValues?: Partial<ClubFormValues>;
  title?: string;
}

export const ClubModalForm = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
}: ClubModalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // TODO: 編集判定、useStateで管理予定かな？
  const isEdit = defaultValues ? true : false;

  const form = useForm<ClubFormValues>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      leader: defaultValues?.leader || "",
      memberCount: defaultValues?.memberCount || "",
      activityType: defaultValues?.activityType || "",
      status: "active",
      location: defaultValues?.location || "",
      detail: defaultValues?.detail || "",
    },
  });

  const handleSubmit = async (data: ClubFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("登録に失敗しました:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            <Label htmlFor="description">活動内容</Label>
            <Input
              id="description"
              {...form.register("description")}
            />
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
            <Label htmlFor="activityType">活動種類</Label>
            <Input
              id="activityType"
              {...form.register("activityType")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value: ClubFormValues["status"]) => form.setValue("status", value)}
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
            <Label htmlFor="detail">活動詳細</Label>
            <Input
              id="detail"
              {...form.register("detail")}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : isEdit ? "更新" : "登録"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
