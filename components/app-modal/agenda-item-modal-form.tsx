"use client";

import { BaseModalForm } from "@/components/app-modal/base-modal-form";
import {
	useGetQa,
	useGetTasks,
	useGetUserList,
} from "@/components/app-table/hooks/use-table-data";
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
import { Textarea } from "@/components/ui/textarea";
import { useModalFormSubmit } from "@/hooks/use-modal-form";
import {
	type AgendaItemFormValues,
	agendaItemFormSchema,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface AgendaItemModalFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: AgendaItemFormValues) => Promise<void>;
	initialData?: AgendaItemFormValues | null;
}

const NONE_VALUE = "__none__";

export function AgendaItemModalForm({
	isOpen,
	onClose,
	onSubmit,
	initialData,
}: AgendaItemModalFormProps) {
	const { data: users = [] } = useGetUserList();
	const { data: tasks = [] } = useGetTasks();
	const { data: qaItems = [] } = useGetQa();

	const form = useForm<AgendaItemFormValues>({
		resolver: zodResolver(agendaItemFormSchema),
		defaultValues: {
			title: "",
			description: "",
			status: "not_started",
			presenterId: null,
			memo: "",
			linkedTaskId: null,
			linkedQaId: null,
			order: 0,
		},
	});

	const isEdit = !!initialData;
	const { isSubmitting, handleSubmit } = useModalFormSubmit(
		form,
		onSubmit,
		onClose,
	);

	useEffect(() => {
		if (isOpen) {
			form.reset({
				title: initialData?.title || "",
				description: initialData?.description ?? "",
				status: initialData?.status || "not_started",
				presenterId: initialData?.presenterId ?? null,
				memo: initialData?.memo ?? "",
				linkedTaskId: initialData?.linkedTaskId ?? null,
				linkedQaId: initialData?.linkedQaId ?? null,
				order: initialData?.order ?? 0,
			});
		}
	}, [isOpen, initialData, form.reset]);

	return (
		<BaseModalForm
			isOpen={isOpen}
			onClose={onClose}
			onSubmit={form.handleSubmit(handleSubmit)}
			title={isEdit ? "アジェンダ項目を編集" : "アジェンダ項目を追加"}
			form={form}
			isSubmitting={isSubmitting}
			isEdit={isEdit}
		>
			<div className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={() => (
						<FormItem>
							<FormLabel>
								項目名<span className="text-red-500">*</span>
							</FormLabel>
							<FormControl>
								<Input
									placeholder="例: 先週の振り返り"
									{...form.register("title")}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={() => (
						<FormItem>
							<FormLabel>概要</FormLabel>
							<FormControl>
								<Textarea
									placeholder="議論する内容（任意）"
									{...form.register("description")}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="presenterId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>担当者</FormLabel>
								<Select
									onValueChange={(v) =>
										field.onChange(v === NONE_VALUE ? null : v)
									}
									value={field.value ?? NONE_VALUE}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="未設定" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={NONE_VALUE}>未設定</SelectItem>
										{users.map((u) => (
											<SelectItem key={u.id} value={u.id || ""}>
												{u.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>ステータス</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="not_started">未</SelectItem>
										<SelectItem value="in_progress">進行中</SelectItem>
										<SelectItem value="done">完了</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="linkedTaskId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>関連タスク</FormLabel>
								<Select
									onValueChange={(v) =>
										field.onChange(v === NONE_VALUE ? null : v)
									}
									value={field.value ?? NONE_VALUE}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="なし" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={NONE_VALUE}>なし</SelectItem>
										{tasks.map((t) => (
											<SelectItem key={t.id} value={t.id || ""}>
												{t.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="linkedQaId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>関連 QA</FormLabel>
								<Select
									onValueChange={(v) =>
										field.onChange(v === NONE_VALUE ? null : v)
									}
									value={field.value ?? NONE_VALUE}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="なし" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={NONE_VALUE}>なし</SelectItem>
										{qaItems.map((q) => (
											<SelectItem key={q.id} value={q.id || ""}>
												{q.question}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="memo"
					render={() => (
						<FormItem>
							<FormLabel>議事録 / メモ</FormLabel>
							<FormControl>
								<Textarea
									rows={5}
									placeholder="会議中に決まったことをここに書き留めます"
									{...form.register("memo")}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</BaseModalForm>
	);
}
