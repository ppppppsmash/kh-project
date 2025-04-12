"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClubActivity, ClubStatus } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, ClubFormValues } from "@/lib/validations";

interface ClubModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ClubActivity, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export const ClubModalForm = ({ isOpen, onClose, onSubmit }: ClubModalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClubFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      leader: "",
      memberCount: 0,
      activityType: "",
      status: "active",
      location: "",
      detail: "",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新規部活動登録</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">部活動名</Label>
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
            <Label htmlFor="description">説明</Label>
            <Input
              id="description"
              {...form.register("description")}
              required
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="leader">部長</Label>
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
            <Label htmlFor="memberCount">メンバー数</Label>
            <Input
              id="memberCount"
              type="number"
              {...form.register("memberCount", { valueAsNumber: true })}
              required
            />
            {form.formState.errors.memberCount && (
              <p className="text-sm text-red-500">{form.formState.errors.memberCount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="activityType">活動タイプ</Label>
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
              required
            />
            {form.formState.errors.location && (
              <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail">詳細</Label>
            <Input
              id="detail"
              {...form.register("detail")}
              required
            />
            {form.formState.errors.detail && (
              <p className="text-sm text-red-500">{form.formState.errors.detail.message}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "登録"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
