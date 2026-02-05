"use client";

import { BaseModalForm } from "@/components/app-modal/base-modal-form";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type SurveyFormValues, surveyFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, GripVertical, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Link from "next/link";

const themes = [
	{ value: "default", label: "デフォルト" },
	{ value: "blue", label: "ブルー" },
	{ value: "green", label: "グリーン" },
	{ value: "purple", label: "パープル" },
	{ value: "orange", label: "オレンジ" },
];

const questionTypes = [
	{ value: "text", label: "テキスト" },
	{ value: "textarea", label: "テキストエリア" },
	{ value: "select", label: "セレクト" },
	{ value: "radio", label: "ラジオボタン" },
	{ value: "checkbox", label: "チェックボックス" },
];

interface SurveyModalFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: SurveyFormValues) => Promise<void>;
	initialData?: SurveyFormValues | null;
}

export function SurveyModalForm({
	isOpen,
	onClose,
	onSubmit,
	initialData,
}: SurveyModalFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<SurveyFormValues>({
		resolver: zodResolver(surveyFormSchema),
		defaultValues: {
			title: "",
			description: "",
			theme: "default",
			isPublic: false,
			isPublished: false,
			items: [{ question: "", questionType: "text", isRequired: false }],
		},
	});

	const { fields, append, remove, move } = useFieldArray({
		control: form.control,
		name: "items",
	});

	const isEdit = !!initialData;

	// モーダルが開いた時とinitialDataが変更された時にフォームをリセット
	useEffect(() => {
		if (!isOpen) {
			// モーダルが閉じた時は何もしない（次のオープン時にリセットされる）
			return;
		}

		// Dateオブジェクトを除外してitemsをマッピング（Hydrationエラーを防ぐ）
		const defaultItems = initialData?.items && initialData.items.length > 0
			? initialData.items.map((item) => ({
				id: item.id,
				surveyId: item.surveyId,
				question: item.question || "",
				questionType: item.questionType || "text",
				options: item.options,
				isRequired: item.isRequired ?? false,
				order: item.order || "0",
				// createdAtとupdatedAtは除外（Hydrationエラーを防ぐ）
			}))
			: [{ question: "", questionType: "text", isRequired: false }];

		form.reset({
			title: initialData?.title || "",
			description: initialData?.description || "",
			theme: initialData?.theme || "default",
			isPublic: initialData?.isPublic ?? false,
			isPublished: initialData?.isPublished ?? false,
			items: defaultItems,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, initialData?.id]);

	const handleSubmit = async (data: SurveyFormValues) => {
		setIsSubmitting(true);
		try {
			await onSubmit(data);
			form.reset();
			onClose();
		} catch (error) {
			console.error("アンケートの保存に失敗しました:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const addItem = () => {
		append({ question: "", questionType: "text", isRequired: false });
	};

	const handlePreview = () => {
		if (initialData?.id) {
			window.open(`/adixi-public/survey/${initialData.id}?preview=true`, "_blank");
		}
	};

	return (
		<BaseModalForm
			isOpen={isOpen}
			onClose={onClose}
			onSubmit={form.handleSubmit(handleSubmit)}
			title={isEdit ? "アンケートを編集" : "新規アンケート作成"}
			form={form}
			isSubmitting={isSubmitting}
			isEdit={isEdit}
		>
			<div className="space-y-4 max-h-[70vh] overflow-y-auto">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>タイトル</FormLabel>
							<FormControl>
								<Input {...field} placeholder="アンケートタイトル" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>説明</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="アンケートの説明"
									rows={3}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="theme"
					render={({ field }) => (
						<FormItem>
							<FormLabel>テーマ</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="テーマを選択" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{themes.map((theme) => (
										<SelectItem key={theme.value} value={theme.value}>
											{theme.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex gap-4">
					<FormField
						control={form.control}
						name="isPublic"
						render={({ field }) => (
							<FormItem className="flex items-center gap-2">
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<FormLabel>公開設定</FormLabel>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="isPublished"
						render={({ field }) => (
							<FormItem className="flex items-center gap-2">
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<FormLabel>公開中</FormLabel>
							</FormItem>
						)}
					/>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<FormLabel>項目</FormLabel>
						<Button type="button" onClick={addItem} size="sm" variant="outline">
							<Plus className="h-4 w-4 mr-1" />
							項目を追加
						</Button>
					</div>

					{fields.map((field, index) => (
						<div key={`survey-item-${index}-${field.id || 'new'}`} className="border rounded-lg p-4 space-y-3">
							<div className="flex items-center gap-2">
								<GripVertical className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">項目 {index + 1}</span>
								{fields.length > 1 && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => remove(index)}
										className="ml-auto"
									>
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>

							<FormField
								control={form.control}
								name={`items.${index}.question`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>質問</FormLabel>
										<FormControl>
											<Input {...field} placeholder="質問を入力" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`items.${index}.questionType`}
								render={({ field }) => (
									<FormItem>
										<FormLabel>質問タイプ</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{questionTypes.map((type) => (
													<SelectItem key={type.value} value={type.value}>
														{type.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{(form.watch(`items.${index}.questionType`) === "select" ||
								form.watch(`items.${index}.questionType`) === "radio" ||
								form.watch(`items.${index}.questionType`) === "checkbox") && (
								<FormField
									control={form.control}
									name={`items.${index}.options`}
									render={({ field }) => (
										<FormItem>
											<FormLabel>選択肢（カンマ区切り）</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="選択肢1, 選択肢2, 選択肢3"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<FormField
								control={form.control}
								name={`items.${index}.isRequired`}
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<FormLabel>必須</FormLabel>
									</FormItem>
								)}
							/>
						</div>
					))}
				</div>

				{isEdit && initialData?.id && (
					<div className="flex justify-end pt-4 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={handlePreview}
							className="flex items-center gap-2"
						>
							<Eye className="h-4 w-4" />
							プレビュー
						</Button>
					</div>
				)}
			</div>
		</BaseModalForm>
	);
}
