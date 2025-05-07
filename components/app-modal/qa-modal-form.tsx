"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Qa } from "@/types";
import { qaFormSchema, type QaFormValues } from "@/lib/validations";

interface QaModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QaFormValues) => void;
  initialData?: Qa | null;
}

export function QaModalForm({ isOpen, onClose, onSubmit, initialData }: QaModalFormProps) {
  const form = useForm<QaFormValues>({
    resolver: zodResolver(qaFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "",
      questionBy: "",
      answeredBy: "",
    },
  });

  const isEdit = !!initialData;

  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        question: initialData.question,
        answer: initialData.answer || "",
        category: initialData.category,
        questionBy: initialData.questionBy,
        answeredBy: initialData.answeredBy,
      });
    } else {
      form.reset({
        question: "",
        answer: "",
        category: "",
        questionBy: "",
        answeredBy: "",
      });
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = (data: QaFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "QAを編集" : "新規QA登録"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>質問</FormLabel>
                  <FormControl>
                    <Input placeholder="質問を入力してください" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>回答</FormLabel>
                  <FormControl>
                    <Textarea placeholder="回答を入力してください" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリー</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリーを選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="人事">人事</SelectItem>
                      <SelectItem value="経理">経理</SelectItem>
                      <SelectItem value="総務">総務</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit">{isEdit ? "更新" : "登録"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
