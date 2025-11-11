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
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BaseModalForm } from "./base-modal-form";
import { Confetti } from "@/components/animation-ui/confetti";
import { addCategory } from "@/actions/categories";
import { useQueryClient } from "@tanstack/react-query";
import { CustomToast } from "@/components/ui/toast";

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
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	
	const STORAGE_KEY = "task-form-draft";

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

	// 一時保存をクリア
	const clearDraft = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY);
	}, []);

	// 一時保存を読み込み
	const loadDraft = useCallback((): Partial<TaskFormValues> | null => {
		if (typeof window === "undefined") return null;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				// Date型のフィールドを復元
				if (parsed.startedAt) {
					parsed.startedAt = new Date(parsed.startedAt);
				}
				if (parsed.dueDate) {
					parsed.dueDate = new Date(parsed.dueDate);
				}
				if (parsed.completedAt) {
					parsed.completedAt = new Date(parsed.completedAt);
				}
				return parsed;
			}
		} catch (error) {
			console.error("一時保存の読み込みに失敗しました:", error);
		}
		return null;
	}, []);

	// 一時保存
	const saveDraft = useCallback((data: Partial<TaskFormValues>, showToast = false) => {
		if (typeof window === "undefined") return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			if (showToast) {
				CustomToast.info("一時保存しました");
			}
		} catch (error) {
			console.error("一時保存に失敗しました:", error);
		}
	}, []);

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
				priority: data.priority || "none",
				categoryId: data.categoryId || undefined,
				tabId: data.tabId || undefined,
			};

			console.log("処理後のデータ:", taskData);
			await onSubmit(taskData);
			
			// 編集モードで進捗が完了に変更された場合、confettiを表示
			if (isEdit && data.progress === "completed" && defaultValues?.progress !== "completed") {
				setShowConfetti(true);
			}
			
			// 送信成功時に一時保存をクリア
			clearDraft();
			form.reset();
			onClose();
		} catch (error) {
			console.error("登録に失敗しました:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	//onsole.log(form.formState.errors);

	// モーダルを開く際に一時保存があれば復元
	useEffect(() => {
		if (isOpen) {
			setIsInitialLoad(true);
			const draft = loadDraft();
			
			// 編集モードの場合はdefaultValuesを優先、新規登録の場合は一時保存を優先かな
			const initialValues = isEdit 
				? defaultValues 
				: (draft || defaultValues);
			
			form.reset({
				taskId: initialValues?.taskId || "",
				title: initialValues?.title || "",
				content: initialValues?.content || "",
				assignee: initialValues?.assignee || "",
				startedAt: initialValues?.startedAt || new Date(),
				dueDate: initialValues?.dueDate || undefined,
				completedAt: initialValues?.completedAt || undefined,
				progress: initialValues?.progress || "pending",
				priority: initialValues?.priority || undefined,
				progressDetails: initialValues?.progressDetails || "",
				link: initialValues?.link || "",
				notes: initialValues?.notes || "",
				categoryId: initialValues?.categoryId || undefined,
				tabId: initialValues?.tabId || undefined,
			});
			
			// 初回ロード後、少し遅延させてから監視を開始
			setTimeout(() => {
				setIsInitialLoad(false);
			}, 500);
		}
	}, [isOpen, defaultValues, form, isEdit, loadDraft]);

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

	// フォームの値を監視して、変更があったら一時保存（デバウンス付き）
	useEffect(() => {
		if (!isOpen || isInitialLoad) return;
		
		let timeoutId: NodeJS.Timeout;
		
		const saveWithDebounce = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				const currentValues = form.getValues();
				if (currentValues.title || currentValues.content || currentValues.assignee) {
					saveDraft(currentValues, false); // toastは表示しない
				}
			}, 1000); // 1秒後に保存
		};
		
		// フォームの変更を監視
		const subscription = form.watch(saveWithDebounce);
		
		return () => {
			clearTimeout(timeoutId);
			subscription.unsubscribe();
		};
	}, [isOpen, isInitialLoad, form, saveDraft]);

	const handleClose = () => {
		// モーダルを閉じる際に一時保存
		const formValues = form.getValues();
		if (formValues.title || formValues.content || formValues.assignee) {
			saveDraft(formValues, true);
		}
		onClose();
	};

	const handleClear = () => {
		// 編集モードの場合は元の値にリセット、新規登録の場合はデフォルト値にリセット
		form.reset({
			taskId: defaultValues?.taskId || "",
			title: defaultValues?.title || "",
			content: defaultValues?.content || "",
			assignee: defaultValues?.assignee || "",
			startedAt: defaultValues?.startedAt || new Date(),
			dueDate: defaultValues?.dueDate || undefined,
			completedAt: defaultValues?.completedAt || undefined,
			progress: defaultValues?.progress || "pending",
			priority: defaultValues?.priority || undefined,
			progressDetails: defaultValues?.progressDetails || "",
			link: defaultValues?.link || "",
			notes: defaultValues?.notes || "",
			categoryId: defaultValues?.categoryId || undefined,
			tabId: defaultValues?.tabId || undefined,
		});
		setNewCategory("");
		setShowNewCategoryInput(false);

		clearDraft();
	};

	console.log(form.formState);
	console.log(form.formState.errors);

	return (
		<>
			{showConfetti && <Confetti />}
			<BaseModalForm
				title={title}
				isOpen={isOpen}
				onClose={handleClose}
				onSubmit={form.handleSubmit(handleSubmit)}
				isSubmitting={isSubmitting}
				isEdit={isEdit}
				onClear={handleClear}
				showClearButton={true}
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

				<div className="flex gap-x-10 items-start justify-between">
					<div className="space-y-2 w-3/4">
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
					<div className="space-y-2 w-1/4">
						<Label htmlFor="priority">優先度</Label>
						<Select
							value={form.watch("priority")}
							onValueChange={(value: string) =>
								form.setValue("priority", value as TaskFormValues["priority"])
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="優先度を選択" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="high">高</SelectItem>
								<SelectItem value="medium">中</SelectItem>
								<SelectItem value="low">低</SelectItem>
								<SelectItem value="none">未設定</SelectItem>
							</SelectContent>
						</Select>
					</div>
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
