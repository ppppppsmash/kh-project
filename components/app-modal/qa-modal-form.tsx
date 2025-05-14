"use client";

import { qaFormSchema, type QaFormValues } from "@/lib/validations";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { BaseModalForm } from "@/components/app-modal/base-modal-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQA } from "@/actions/qa";
import { formatDateForInput } from "@/lib/utils";

// 固定のカテゴリーリスト
const defaultCategories = ["現場", "経費", "福利厚生", "休暇", "週報", "その他"];

interface QaModalFormProps {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QaFormValues) => Promise<void>;
  initialData?: QaFormValues | null;
}

export function QaModalForm({ type, isOpen, onClose, onSubmit, initialData }: QaModalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      startedAt: initialData?.startedAt || new Date(),
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
    if (isOpen) {
      form.reset({
        question: initialData?.question || "",
        answer: initialData?.answer || "",
        category: initialData?.category || "",
        questionBy: initialData?.questionBy || "",
        answeredBy: initialData?.answeredBy || "",
        isPublic: initialData?.isPublic || false,
        startedAt: initialData?.startedAt || new Date(),
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (data: QaFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error("QAの登録に失敗しました:", error);
    } finally {
      setIsSubmitting(false);
    }
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
    <BaseModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      title={isEdit ? "QAを編集" : "新規QA登録"}
      form={form}
      isSubmitting={isSubmitting}
      isEdit={isEdit}
    >
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="startedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>起票日</FormLabel>
              <FormControl>
                <Input
                  id="startedAt"
                  type="date"
                  className="w-[140px]"
                  value={field.value ? formatDateForInput(field.value) : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : new Date();
                    field.onChange(date);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === "admin" && (
          <FormField
            control={form.control}
            name="questionBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>質問者<span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="お名前を入力してください" {...form.register("questionBy")} />
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
                <Textarea placeholder="質問を入力してください" {...form.register("question")} />
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
                <FormLabel>回答<span className="text-muted-foreground text-xs">(マネージャー権限表示のみ)</span></FormLabel>
                <FormControl>
                  <Textarea placeholder="回答を入力してください" {...form.register("answer")} />
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
          </div>
        </div>
    </BaseModalForm>
  );
}
