"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-uploader";
import { BaseModalForm } from "./base-modal-form";
import { memberFormSchema, MemberFormValues } from "@/lib/validations";

interface UserModalFormProps {
  title?: string;
  onSubmit: (data: MemberFormValues & { photoFile?: File }) => Promise<void>;
  onClose: () => void;
  defaultValues?: Partial<MemberFormValues>;
  isOpen: boolean;
}

export const UserModalForm = ({
  title="自己紹介登録",
  onClose,
  onSubmit,
  defaultValues,
  isOpen,
}: UserModalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
  });

  const handleSubmit = async (data: MemberFormValues) => {
    setIsSubmitting(true);

    try {
      const memberData = {
        ...data,
        photoFile: selectedFile || undefined,
      };
      await onSubmit(memberData);
      form.reset();
      onClose();
    } catch (error) {
      console.error("メンバー情報の登録に失敗しました:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, defaultValues]);

  return (
    <BaseModalForm
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      isSubmitting={isSubmitting}
      form={form}
    >
      <div className="space-y-2">
        <Label htmlFor="photo">プロフィール写真</Label>
        <ImageUpload
          initialImage={defaultValues?.photoUrl}
          onUploadComplete={(file) => {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            form.setValue("photoUrl", previewUrl);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          {...form.register("name")}
          disabled
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          {...form.register("email")}
          disabled
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">事業部</Label>
          <Input
            id="department"
            {...form.register("department")}
            placeholder="事業部を入力"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">役職</Label>
          <Input
            id="position"
            {...form.register("position")}
            placeholder="役職を入力"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">得意な技術・スキル</Label>
        <Textarea
          id="skills"
          {...form.register("skills")}
          placeholder="得意な技術やスキルを入力"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hobby">趣味・特技</Label>
        <Textarea
          id="hobby"
          {...form.register("hobby")}
          placeholder="趣味や特技を入力"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="freeText">自由記載欄</Label>
        <Textarea
          id="freeText"
          {...form.register("freeText")}
          placeholder="自由にメッセージを入力"
          className="h-32"
        />
      </div>
    </BaseModalForm>
  );
};
