"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type ClubFormValues, clubFormSchema } from "@/lib/validations";
import { useModalFormSubmit } from "@/hooks/use-modal-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BaseModalForm } from "./base-modal-form";

interface ClubModalFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: ClubFormValues) => Promise<void>;
	defaultValues?: Partial<ClubFormValues>;
	title?: string;
}

export const ClubModalForm = ({
	title = "部活動登録",
	isOpen,
	onClose,
	onSubmit,
	defaultValues,
}: ClubModalFormProps) => {
	const isEdit = !!defaultValues;

	const form = useForm<ClubFormValues>({
		resolver: zodResolver(clubFormSchema),
	});

	const { isSubmitting, handleSubmit } = useModalFormSubmit(
		form,
		async (data) => {
			await onSubmit({
				...data,
				memberCount: data.memberCount || "",
				status: data.status || "active",
				location: data.location || "",
				detail: data.detail || "",
			});
		},
		onClose,
	);

	// モーダルが開かれたときにフォームをリセット
	useEffect(() => {
		if (isOpen) {
			form.reset({
				name: defaultValues?.name ?? "",
				description: defaultValues?.description ?? "",
				leader: defaultValues?.leader ?? "",
				memberCount: defaultValues?.memberCount ?? undefined,
				activityType: defaultValues?.activityType ?? "",
				status: defaultValues?.status ?? "active",
				location: defaultValues?.location ?? "",
				detail: defaultValues?.detail ?? "",
			});
		}
	}, [isOpen, defaultValues, form.reset]);

	return (
		<BaseModalForm
			isOpen={isOpen}
			onClose={onClose}
			onSubmit={form.handleSubmit(handleSubmit)}
			title={title}
			isSubmitting={isSubmitting}
			isEdit={isEdit}
			form={form}
		>
			<div className="space-y-2">
				<Label htmlFor="name">
					部活動名<span className="text-red-500">*</span>
				</Label>
				<Input
					id="name"
					{...form.register("name", { required: "部活動名は必須です" })}
				/>
				{form.formState.errors.name && (
					<p className="text-sm text-red-500">
						{form.formState.errors.name.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">説明</Label>
				<Textarea
					id="description"
					{...form.register("description", { required: "説明は必須です" })}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="leader">
					部長<span className="text-red-500">*</span>
				</Label>
				<Input
					id="leader"
					{...form.register("leader", { required: "部長は必須です" })}
				/>
				{form.formState.errors.leader && (
					<p className="text-sm text-red-500">
						{form.formState.errors.leader.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="memberCount">
					メンバー数<span className="text-red-500">*</span>
				</Label>
				<Input
					id="memberCount"
					type="text"
					{...form.register("memberCount", {
						required: "メンバー数は必須です",
					})}
				/>
				{form.formState.errors.memberCount && (
					<p className="text-sm text-red-500">
						{form.formState.errors.memberCount.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="activityType">活動タイプ</Label>
				<Input
					id="activityType"
					{...form.register("activityType", {
						required: "活動タイプは必須です",
					})}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="status">ステータス</Label>
				<Select
					value={form.watch("status")}
					onValueChange={(value: ClubFormValues["status"]) =>
						form.setValue("status", value)
					}
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
					<p className="text-sm text-red-500">
						{form.formState.errors.status.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="location">活動場所</Label>
				<Input id="location" {...form.register("location")} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="detail">詳細</Label>
				<Textarea id="detail" {...form.register("detail")} />
			</div>
		</BaseModalForm>
	);
};
