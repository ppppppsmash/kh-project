"use client";

import { qaFormSchema, type QaFormValues } from "@/lib/validations";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQA } from "@/actions/qa";

// 固定のカテゴリーリスト
const defaultCategories = ["現場", "経費", "福利厚生", "休暇", "週報", "その他"];

interface QaModalFormProps {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QaFormValues) => void;
  initialData?: QaFormValues | null;
}

export function QaModalForm({ type, isOpen, onClose, onSubmit, initialData }: QaModalFormProps) {
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [tempCategories, setTempCategories] = useState<string[]>([]);

  const { data: qaItems = [] } = useQuery({
    queryKey: ["qa"],
    queryFn: getQA,
  });

  // データベースから取得したカテゴリーと固定のカテゴリーを組み合わせる
  const dbCategories = Array.from(new Set(qaItems.map(item => item.category))).filter(Boolean);
  const categories = Array.from(new Set([...defaultCategories, ...dbCategories, ...tempCategories]));

  const form = useForm<QaFormValues>({
    resolver: zodResolver(qaFormSchema),
    defaultValues: {
      question: initialData?.question || "",
      answer: initialData?.answer || "",
      category: initialData?.category || "",
      questionBy: initialData?.questionBy || "",
      answeredBy: initialData?.answeredBy || "",
      isPublic: initialData?.isPublic || false,
    },
  });

  const isEdit = !!initialData;

  // モーダルが閉じられた時に一時的なカテゴリーをリセット
  useEffect(() => {
    if (!isOpen) {
      setTempCategories([]);
      setShowNewCategoryInput(false);
      setNewCategory("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        question: initialData.question,
        answer: initialData.answer,
        category: initialData.category,
        questionBy: initialData.questionBy,
        answeredBy: initialData.answeredBy,
        isPublic: initialData.isPublic,
      });
    } else {
      form.reset({
        question: "",
        answer: "",
        category: "",
        questionBy: "",
        answeredBy: "",
        isPublic: false,
      });
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = (data: QaFormValues) => {
    onSubmit(data);
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setTempCategories(prev => [...prev, newCategory]);
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
            {type === "admin" && (
              <FormField
                control={form.control}
                name="questionBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>質問者<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="お名前を入力してください" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
            {type === "superadmin" && (
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

              <div className="flex items-start gap-x-18">
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

                {type === "superadmin" && (
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>公開</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

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
