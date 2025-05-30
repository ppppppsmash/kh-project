"use client";

import { Button } from "@/components/ui/button";
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
import { formatDateForInput } from "@/lib/utils";
import { type CategoryValues, type TabValues, type TaskFormValues, taskFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BaseModalForm } from "./base-modal-form";
import { Confetti } from "@/components/animation-ui/confetti";
import { addCategory } from "@/actions/categories";
import { useQueryClient } from "@tanstack/react-query";

interface TaskModalFormProps {
	title?: string;
	onSubmit: (data: TaskFormValues) => Promise<void>;
	onClose: () => void;
	defaultValues?: Partial<TaskFormValues>;
	isOpen: boolean;
	categories: CategoryValues[];
	tabs: TabValues[];
}

export const TaskModalForm = ({
	title = "タスク登録",
	onClose,
	onSubmit,
	defaultValues,
	isOpen,
	categories,
	tabs,
}: TaskModalFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEdit = !!defaultValues;
	const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
	const [newCategory, setNewCategory] = useState("");
	const [showConfetti, setShowConfetti] = useState(false);
	const queryClient = useQueryClient();

	const form = useForm<TaskFormValues>({
		resolver: zodResolver(taskFormSchema),
	});

	useEffect(() => {
		if (showConfetti) {
			const timer = setTimeout(() => {
				setShowConfetti(false);
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [showConfetti]);

	const handleSubmit = async (data: TaskFormValues) => {
		setIsSubmitting(true);

		try {
			console.log("送信データ:", data);
			const taskData = {
				...data,
				dueDate: data.dueDate,
				startedAt: data.startedAt,
				completedAt: data.completedAt,
				progressDetails: data.progressDetails || "",
				link: data.link || "",
				notes: data.notes || "",
				categoryId: data.categoryId || undefined,
				tabId: data.tabId || undefined,
			};

			console.log("処理後のデータ:", taskData);
			await onSubmit(taskData);
			
			// 編集モードで進捗が完了に変更された場合、confettiを表示
			if (isEdit && data.progress === "completed" && defaultValues?.progress !== "completed") {
				setShowConfetti(true);
			}
			
			form.reset();
			onClose();
		} catch (error) {
			console.error("登録に失敗しました:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	//onsole.log(form.formState.errors);

	useEffect(() => {
		if (isOpen) {
			form.reset({
				taskId: defaultValues?.taskId || "",
				title: defaultValues?.title || "",
				content: defaultValues?.content || "",
				assignee: defaultValues?.assignee || "",
				startedAt: defaultValues?.startedAt || new Date(),
				dueDate: defaultValues?.dueDate || undefined,
				completedAt: defaultValues?.completedAt || undefined,
				progress: defaultValues?.progress || "pending",
				progressDetails: defaultValues?.progressDetails || "",
				link: defaultValues?.link || "",
				notes: defaultValues?.notes || "",
				categoryId: defaultValues?.categoryId || undefined,
				tabId: defaultValues?.tabId || undefined,
			});
		}
	}, [isOpen, defaultValues, form]);

	const handleAddCategory = async () => {
		if (newCategory && !categories.some(c => c.name === newCategory)) {
			try {
				const result = await addCategory(newCategory);
				if (result.success && result.category) {
					form.setValue("categoryId", result.category.id);
					setNewCategory("");
					setShowNewCategoryInput(false);
					// カテゴリー一覧のキャッシュを無効化して再取得
					await queryClient.invalidateQueries({ queryKey: ["categories"] });
				} else {
					console.error("カテゴリーの追加に失敗しました");
				}
			} catch (error) {
				console.error("カテゴリーの追加中にエラーが発生しました:", error);
			}
		}
	};

	console.log(form.formState);
	console.log(form.formState.errors);

	return (
		<>
			{showConfetti && <Confetti />}
			<BaseModalForm
				title={title}
				isOpen={isOpen}
				onClose={onClose}
				onSubmit={form.handleSubmit(handleSubmit)}
				isSubmitting={isSubmitting}
				isEdit={isEdit}
				form={form}
			>
				<div className="flex gap-x-10 items-start">
					<div className="space-y-2 w-full">
						<Label htmlFor="title">
							項目名<span className="text-red-500">*</span>
						</Label>
						<Input
							id="title"
							{...form.register("title", { required: "項目名は必須です" })}
						/>
						{form.formState.errors.title && (
							<p className="text-sm text-red-500">
								{form.formState.errors.title.message}
							</p>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="content">
						内容<span className="text-red-500">*</span>
					</Label>
					<Textarea
						id="content"
						{...form.register("content", { required: "内容は必須です" })}
					/>
					{form.formState.errors.content && (
						<p className="text-sm text-red-500">
							{form.formState.errors.content.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="assignee">
						担当者<span className="text-red-500">*</span>
					</Label>
					<Input
						id="assignee"
						{...form.register("assignee", { required: "担当者は必須です" })}
					/>
					{form.formState.errors.assignee && (
						<p className="text-sm text-red-500">
							{form.formState.errors.assignee.message}
						</p>
					)}
				</div>

				<div className="flex gap-x-10 items-start">
					<div className="space-y-2 w-full">
						<Label htmlFor="startedAt">
							起票日<span className="text-red-500">*</span>
						</Label>
						<Input
							id="startedAt"
							type="date"
							value={formatDateForInput(form.watch("startedAt"))}
							onChange={(e) => {
								const date = e.target.value
									? new Date(e.target.value)
									: new Date();
								form.setValue("startedAt", date);
							}}
						/>
						{form.formState.errors.startedAt && (
							<p className="text-sm text-red-500">
								{form.formState.errors.startedAt.message}
							</p>
						)}
					</div>
					<div className="space-y-2 w-full">
						<Label htmlFor="dueDate">
							期限日<span className="text-red-500">*</span>
						</Label>
						<Input
							id="dueDate"
							type="date"
							value={formatDateForInput(form.watch("dueDate"))}
							onChange={(e) => {
								const date = e.target.value
									? new Date(e.target.value)
									: new Date();
								form.setValue("dueDate", date);
							}}
						/>
						{form.formState.errors.dueDate && (
							<p className="text-sm text-red-500">
								{form.formState.errors.dueDate.message}
							</p>
						)}
					</div>
					<div className="space-y-2 w-full">
						<Label htmlFor="completedAt">完了日</Label>
						<Input
							id="completedAt"
							type="date"
							value={formatDateForInput(form.watch("completedAt"))}
							onChange={(e) => {
								const date = e.target.value
									? new Date(e.target.value)
									: undefined;
								form.setValue("completedAt", date, { shouldValidate: true });
							}}
						/>
					</div>
				</div>

				<div className="flex gap-x-12 items-start justify-between">
					<div className="space-y-2">
						<Label htmlFor="progress">進捗状況</Label>
						<Select
							value={form.watch("progress")}
							onValueChange={(value: TaskFormValues["progress"]) =>
								form.setValue("progress", value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="進捗状況を選択" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pending">未着手</SelectItem>
								<SelectItem value="inProgress">進行中</SelectItem>
								<SelectItem value="completed">完了</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="category">カテゴリー</Label>
						<Select
							onValueChange={(value) => {
								if (value === "new") {
									setShowNewCategoryInput(true);
								} else {
									form.setValue("categoryId", value);
								}
							}}
							value={form.watch("categoryId") as string}
						>
							<SelectTrigger>
								<SelectValue placeholder="カテゴリーを選択してください" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category.id || ""} value={category.id || ""}>
										{category.name}
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
					<div className="space-y-2">
						<Label htmlFor="tabId">タブ</Label>
						<Select
							onValueChange={(value) => {
								if (value === "new") {
									setShowNewCategoryInput(true);
								} else {
									form.setValue("tabId", value);
								}
							}}
							value={form.watch("tabId") as string}
						>
							<SelectTrigger>
								<SelectValue placeholder="タブを選択してください" />
							</SelectTrigger>
							<SelectContent>
								{tabs.map((tab) => (
									<SelectItem key={tab.id || ""} value={tab.id || ""}>
										{tab.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="progressDetails">進捗状況・対応内容</Label>
					<Textarea id="progressDetails" {...form.register("progressDetails")} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="link">リンク先</Label>
					<Input id="link" type="url" {...form.register("link")} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="notes">備考</Label>
					<Textarea id="notes" {...form.register("notes")} />
				</div>
			</BaseModalForm>
		</>
	);
};
