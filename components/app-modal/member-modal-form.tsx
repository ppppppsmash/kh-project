"use client";

import type { User, Role } from "@/types";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-uploader";
import { BaseModalForm } from "./base-modal-form";
import { memberFormSchema, MemberFormValues } from "@/lib/validations";
import { formatDate } from "@/lib/utils";

interface UserModalFormProps {
  title?: string;
  onSubmit: (data: Omit<User, "id" | "image" | "email" | "createdAt" | "updatedAt"> & { photo?: File }) => Promise<void>;
  onClose: () => void;
  defaultValues?: Partial<User>;
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
    defaultValues: {
      photoUrl: defaultValues?.photoUrl || "",
      department: defaultValues?.department || "",
      position: defaultValues?.position || "",
      skills: defaultValues?.skills || "",
      hobby: defaultValues?.hobby || "",
      freeText: defaultValues?.freeText || "",
      editedAt: undefined,
    },
  });

  const handleSubmit = async (data: MemberFormValues) => {
    setIsSubmitting(true);
    try {
      const memberData = {
        name: data.name,
        department: data.department,
        position: data.position,
        hobby: data.hobby,
        skills: data.skills,
        freeText: data.freeText,
        isActive: data.isActive || true,
        photoUrl: data.photoUrl,
        editedAt: new Date(),
        role: data.role as Role,
        photo: selectedFile || undefined,
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
    if (isOpen && defaultValues) {
      const formattedDefaultValues = {
        ...defaultValues,
        editedAt: defaultValues.editedAt ? formatDate(defaultValues.editedAt, "yyyy-MM-dd") : undefined,
        photoUrl: defaultValues.photoUrl || "",
      };
      form.reset(formattedDefaultValues);
    } else if (isOpen) {
      form.reset({
        photoUrl: "",
        department: "",
        position: "",
        skills: "",
        hobby: "",
        freeText: "",
        editedAt: undefined,
      });
    }
  }, [isOpen, defaultValues, form]);

  return (
    <BaseModalForm
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      isSubmitting={isSubmitting}
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
          disabled={true}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">事業部</Label>
          <Input
            id="department"
            {...form.register("department")}
            placeholder="事業部を入力"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">役職</Label>
          <Input
            id="position"
            {...form.register("position")}
            placeholder="役職を入力"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">得意な技術・スキル</Label>
        <Textarea
          id="skills"
          {...form.register("skills")}
          placeholder="得意な技術やスキルを入力"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hobby">趣味・特技</Label>
        <Textarea
          id="hobby"
          {...form.register("hobby")}
          placeholder="趣味や特技を入力"
          required
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
