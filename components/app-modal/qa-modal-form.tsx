"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import type { Qa } from "@/types";
import { qaFormSchema, type QaFormValues } from "@/lib/validations";
import { useQuery } from "@tanstack/react-query";
import { getQA } from "@/actions/qa";

// 初期のカテゴリーリスト
const initialCategories = ["現場", "経費", "福利厚生", "休暇", "週報", "その他"];

interface QaModalFormProps {
  type: "admin" | "public";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QaFormValues) => void;
  initialData?: Qa | null;
}

export function QaModalForm({ type, isOpen, onClose, onSubmit, initialData }: QaModalFormProps) {
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const { data: qaItems = [] } = useQuery({
    queryKey: ["qa"],
    queryFn: getQA,
  });

  // データベースから取得したカテゴリーの一覧を作成
  const categories = Array.from(new Set(qaItems.map(item => item.category))).filter(Boolean);

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

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      categories.push(newCategory);
      form.setValue("category", newCategory);
      setNewCategory("");
      setShowNewCategoryInput(false);
    }
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
                  <FormLabel>質問<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="質問を入力してください" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {type === "admin" && (
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
            )}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリー<span className="text-red-500">*</span></FormLabel>
                  <div className="space-y-2">
                    <Select 
                      onValueChange={(value) => {
                        if (value === "new") {
                          setShowNewCategoryInput(true);
                        } else {
                          field.onChange(value);
                        }
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリーを選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        <SelectItem value="new" className="text-primary">
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            新しいカテゴリーを追加
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {showNewCategoryInput && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="新しいカテゴリー名"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowNewCategoryInput(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAddCategory}
                          disabled={!newCategory}
                        >
                          追加
                        </Button>
                      </div>
                    )}
                  </div>
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
