"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { qaFormSchema, QaFormValues } from "@/lib/validations";
import { BaseModalForm } from "./base-modal-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Qa } from "@/types";

interface QaModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Qa, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  defaultValues?: QaFormValues;
  title?: string;
}

export const QaModalForm = ({
  title = "QA登録",
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
}: QaModalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = defaultValues ? true : false;

  const form = useForm<QaFormValues>({
    resolver: zodResolver(qaFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "",
    },
  });

  const handleSubmit = async (data: QaFormValues) => {
    setIsSubmitting(true);
    try {
      const qaData: Omit<Qa, "id" | "createdAt" | "updatedAt"> = {
        ...data,
      };
      await onSubmit(qaData);
      form.reset();
      onClose();
    } catch (error) {
      console.error("エラーが発生しました:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        form.reset({
          question: defaultValues.question || "",
          answer: defaultValues.answer || "",
          category: defaultValues.category || "",
        });
      } else {
        form.reset({
          question: "",
          answer: "",
          category: "",
        });
      }
    }
  }, [isOpen, defaultValues]);

  return (
    <BaseModalForm
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      isSubmitting={isSubmitting}
      isEdit={isEdit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question">質問<span className="text-red-500">*</span></Label>
          <Textarea
            id="question"
            {...form.register("question")}
            placeholder="質問を入力してください"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="answer">回答<span className="text-red-500">*</span></Label>
          <Textarea
            id="answer"
            {...form.register("answer")}
            placeholder="回答を入力してください"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ<span className="text-red-500">*</span></Label>
          <Select
            {...form.register("category")}
            onValueChange={(value: string) => form.setValue("category", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="人事">人事</SelectItem>
              <SelectItem value="経理">経理</SelectItem>
              <SelectItem value="総務">総務</SelectItem>
              <SelectItem value="その他">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </BaseModalForm>
  );
};
