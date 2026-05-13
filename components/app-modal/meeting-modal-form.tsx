"use client";

import { BaseModalForm } from "@/components/app-modal/base-modal-form";
import {
	useGetQa,
	useGetTasks,
	useGetUserList,
} from "@/components/app-table/hooks/use-table-data";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormDescription,
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
import { useModalFormSubmit } from "@/hooks/use-modal-form";
import { type MeetingFormValues, meetingFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	FileText,
	FolderTree,
	GripVertical,
	ListChecks,
	Plus,
	X,
} from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

const NONE_VALUE = "__none__";

const toDateTimeLocalString = (date: Date | null | undefined): string => {
	if (!date) return "";
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const newId = () =>
	typeof globalThis.crypto?.randomUUID === "function"
		? globalThis.crypto.randomUUID()
		: Math.random().toString(36).slice(2);

interface MeetingModalFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: MeetingFormValues) => Promise<void>;
	initialData?: MeetingFormValues | null;
}

// ====== ブロック本体 ======

// biome-ignore lint/suspicious/noExplicitAny: react-hook-form
type FormType = any;

const AgendaBlockBody = ({
	index,
	form,
	users,
	tasks,
	qaItems,
}: {
	index: number;
	form: FormType;
	users: { id?: string; name?: string }[];
	tasks: { id?: string; title?: string }[];
	qaItems: { id?: string; question?: string }[];
}) => (
	<div className="space-y-3">
		<FormField
			control={form.control}
			name={`items.${index}.title`}
			render={() => (
				<FormItem>
					<FormLabel>
						タイトル<span className="text-red-500">*</span>
					</FormLabel>
					<FormControl>
						<Input
							placeholder="例: 先週の振り返り"
							{...form.register(`items.${index}.title`)}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>

		<FormField
			control={form.control}
			name={`items.${index}.description`}
			render={() => (
				<FormItem>
					<FormLabel>概要</FormLabel>
					<FormControl>
						<Textarea
							rows={2}
							placeholder="議論する内容（任意）"
							{...form.register(`items.${index}.description`)}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>

		<div className="grid grid-cols-4 gap-3">
			<FormField
				control={form.control}
				name={`items.${index}.presenterId`}
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
								<SelectTrigger className="w-full">
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
				name={`items.${index}.status`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>ステータス</FormLabel>
						<Select onValueChange={field.onChange} value={field.value}>
							<FormControl>
								<SelectTrigger className="w-full">
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

			<FormField
				control={form.control}
				name={`items.${index}.linkedTaskId`}
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
								<SelectTrigger className="w-full">
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
				name={`items.${index}.linkedQaId`}
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
								<SelectTrigger className="w-full">
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
			name={`items.${index}.memo`}
			render={() => (
				<FormItem>
					<FormLabel>議事録 / メモ</FormLabel>
					<FormControl>
						<Textarea
							rows={3}
							placeholder="会議中に決まったことをここに書き留めます"
							{...form.register(`items.${index}.memo`)}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</div>
);

const MemoBlockBody = ({
	index,
	form,
}: {
	index: number;
	form: FormType;
}) => (
	<div className="space-y-3">
		<FormField
			control={form.control}
			name={`items.${index}.title`}
			render={() => (
				<FormItem>
					<FormLabel>見出し</FormLabel>
					<FormControl>
						<Input
							placeholder="例: 背景 / 決定事項 / 次回 ToDo"
							className="text-base font-semibold"
							{...form.register(`items.${index}.title`)}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
		<FormField
			control={form.control}
			name={`items.${index}.description`}
			render={() => (
				<FormItem>
					<FormLabel>本文</FormLabel>
					<FormControl>
						<Textarea
							rows={4}
							placeholder="自由に記述してください"
							{...form.register(`items.${index}.description`)}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</div>
);

// ====== セクション内の子ブロック ======

const ChildBlock = ({
	value,
	flatIndex,
	form,
	onRemove,
	users,
	tasks,
	qaItems,
}: {
	value: { id: string };
	flatIndex: number;
	form: FormType;
	onRemove: () => void;
	users: { id?: string; name?: string }[];
	tasks: { id?: string; title?: string }[];
	qaItems: { id?: string; question?: string }[];
}) => {
	const controls = useDragControls();
	const type = form.watch(`items.${flatIndex}.type`) ?? "agenda";

	return (
		<Reorder.Item
			value={value}
			dragListener={false}
			dragControls={controls}
			className={`group space-y-3 rounded-md border bg-card p-3 ${
				type === "memo" ? "border-2 border-dashed border-primary/40" : ""
			}`}
		>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onPointerDown={(e) => controls.start(e)}
					className="cursor-grab touch-none active:cursor-grabbing"
					title="ドラッグして並び替え"
				>
					<GripVertical className="h-4 w-4 text-muted-foreground" />
				</button>
				{type === "memo" ? (
					<>
						<FileText className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium">メモブロック</span>
					</>
				) : (
					<>
						<ListChecks className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium">議題</span>
					</>
				)}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="ml-auto"
					onClick={onRemove}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{type === "memo" ? (
				<MemoBlockBody index={flatIndex} form={form} />
			) : (
				<AgendaBlockBody
					index={flatIndex}
					form={form}
					users={users}
					tasks={tasks}
					qaItems={qaItems}
				/>
			)}
		</Reorder.Item>
	);
};

// ====== トップレベルブロック（セクション or 単独ブロック） ======

const TopLevelBlock = ({
	value,
	flatIndex,
	form,
	items,
	onRemoveBlock,
	onChildReorder,
	onAddChildAgenda,
	onAddChildMemo,
	users,
	tasks,
	qaItems,
}: {
	value: { id: string };
	flatIndex: number;
	form: FormType;
	items: { id?: string; type?: string; parentId?: string | null }[];
	onRemoveBlock: (flatIdx: number) => void;
	onChildReorder: (sectionId: string, newOrder: { id: string }[]) => void;
	onAddChildAgenda: (sectionId: string) => void;
	onAddChildMemo: (sectionId: string) => void;
	users: { id?: string; name?: string }[];
	tasks: { id?: string; title?: string }[];
	qaItems: { id?: string; question?: string }[];
}) => {
	const controls = useDragControls();
	const type = form.watch(`items.${flatIndex}.type`) ?? "agenda";
	const sectionId = form.watch(`items.${flatIndex}.id`) as string;

	// セクションの場合は子要素を集める
	const children =
		type === "section"
			? items
					.map((it, idx) => ({ it, flatIdx: idx }))
					.filter(({ it }) => it.parentId === sectionId)
			: [];

	return (
		<Reorder.Item
			value={value}
			dragListener={false}
			dragControls={controls}
			className={
				type === "section"
					? "rounded-lg border-2 border-primary/30 p-3 space-y-3"
					: type === "memo"
						? "rounded-md border-2 border-dashed border-primary/40 bg-card p-3 space-y-3"
						: "rounded-md border bg-card p-3 space-y-3"
			}
		>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onPointerDown={(e) => controls.start(e)}
					className="cursor-grab touch-none active:cursor-grabbing"
					title="ドラッグして並び替え"
				>
					<GripVertical className="h-4 w-4 text-muted-foreground" />
				</button>
				{type === "section" ? (
					<>
						<FolderTree className="h-5 w-5 text-primary" />
						<span className="text-base font-semibold">セクション</span>
					</>
				) : type === "memo" ? (
					<>
						<FileText className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium">メモブロック</span>
					</>
				) : (
					<>
						<ListChecks className="h-4 w-4 text-primary" />
						<span className="text-sm font-medium">議題</span>
					</>
				)}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="ml-auto"
					onClick={() => onRemoveBlock(flatIndex)}
					title={
						type === "section"
							? "このセクションと中身をまとめて削除"
							: "削除"
					}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{type === "section" ? (
				<>
					<FormField
						control={form.control}
						name={`items.${flatIndex}.title`}
						render={() => (
							<FormItem>
								<FormLabel>セクション名</FormLabel>
								<FormControl>
									<Input
										placeholder="例: 報告事項 / 議論事項 / 共有事項"
										className="text-lg font-bold"
										{...form.register(`items.${flatIndex}.title`)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="space-y-2 pl-4 border-l-2 border-primary/30">
						{children.length === 0 ? (
							<p className="text-xs text-muted-foreground py-2">
								下のボタンでセクション内に議題やメモを追加してください。
							</p>
						) : (
							<Reorder.Group
								axis="y"
								values={children.map((c) => ({ id: c.it.id as string }))}
								onReorder={(newOrder) =>
									onChildReorder(sectionId, newOrder as { id: string }[])
								}
								className="space-y-2"
							>
								{children.map(({ flatIdx, it }) => (
									<ChildBlock
										key={it.id as string}
										value={{ id: it.id as string }}
										flatIndex={flatIdx}
										form={form}
										onRemove={() => onRemoveBlock(flatIdx)}
										users={users}
										tasks={tasks}
										qaItems={qaItems}
									/>
								))}
							</Reorder.Group>
						)}

						<div className="flex gap-2">
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="gap-1"
								onClick={() => onAddChildAgenda(sectionId)}
							>
								<Plus className="h-4 w-4" />
								議題
							</Button>
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="gap-1"
								onClick={() => onAddChildMemo(sectionId)}
							>
								<Plus className="h-4 w-4" />
								メモ
							</Button>
						</div>
					</div>
				</>
			) : type === "memo" ? (
				<MemoBlockBody index={flatIndex} form={form} />
			) : (
				<AgendaBlockBody
					index={flatIndex}
					form={form}
					users={users}
					tasks={tasks}
					qaItems={qaItems}
				/>
			)}
		</Reorder.Item>
	);
};

// ====== メインフォーム ======

export function MeetingModalForm({
	isOpen,
	onClose,
	onSubmit,
	initialData,
}: MeetingModalFormProps) {
	const { data: users = [] } = useGetUserList();
	const { data: tasks = [] } = useGetTasks();
	const { data: qaItems = [] } = useGetQa();

	const form = useForm<MeetingFormValues>({
		resolver: zodResolver(meetingFormSchema),
		defaultValues: {
			title: "",
			description: "",
			scheduledAt: null,
			status: "scheduled",
			isPublic: false,
			items: [],
		},
	});

	const { fields, append, remove, replace } = useFieldArray({
		control: form.control,
		name: "items",
		keyName: "_key",
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
				scheduledAt: initialData?.scheduledAt ?? null,
				status: initialData?.status || "scheduled",
				isPublic: initialData?.isPublic ?? false,
				items:
					initialData?.items?.map((it, index) => ({
						id: it.id || newId(),
						type: it.type ?? "agenda",
						parentId: it.parentId ?? null,
						title: it.title,
						description: it.description ?? "",
						status: it.status ?? "not_started",
						presenterId: it.presenterId ?? null,
						memo: it.memo ?? "",
						linkedTaskId: it.linkedTaskId ?? null,
						linkedQaId: it.linkedQaId ?? null,
						order: it.order ?? index,
					})) ?? [],
			});
		}
	}, [isOpen, initialData, form.reset]);

	const appendBlock = (
		type: "section" | "agenda" | "memo",
		parentId: string | null,
	) => {
		append({
			id: newId(),
			type,
			parentId,
			title: "",
			description: "",
			status: "not_started",
			presenterId: null,
			memo: "",
			linkedTaskId: null,
			linkedQaId: null,
			order: fields.length,
		});
	};

	const removeBlock = (flatIdx: number) => {
		const items = form.getValues("items") ?? [];
		const target = items[flatIdx];
		if (!target) return;
		// セクション削除時はその子も全部消す
		if (target.type === "section" && target.id) {
			const sectionId = target.id;
			const idxToRemove: number[] = [];
			items.forEach((it, idx) => {
				if (idx === flatIdx || it.parentId === sectionId) {
					idxToRemove.push(idx);
				}
			});
			// 後ろから消す
			idxToRemove
				.sort((a, b) => b - a)
				.forEach((idx) => remove(idx));
		} else {
			remove(flatIdx);
		}
	};

	// トップレベル並び替え: parentId が null のものだけを並び替え
	const handleTopReorder = (newOrder: { id: string }[]) => {
		const items = form.getValues("items") ?? [];
		// セクションの場合はその子も一緒に動かす
		const sectionChildren = new Map<string, typeof items>();
		items.forEach((it) => {
			if (it.parentId) {
				const arr = sectionChildren.get(it.parentId) ?? [];
				arr.push(it);
				sectionChildren.set(it.parentId, arr);
			}
		});
		const byId = new Map(items.map((it) => [it.id, it]));
		const rebuilt: typeof items = [];
		for (const { id } of newOrder) {
			const top = byId.get(id);
			if (!top) continue;
			rebuilt.push(top);
			if (top.type === "section" && top.id) {
				rebuilt.push(...(sectionChildren.get(top.id) ?? []));
			}
		}
		replace(rebuilt);
	};

	// セクション内並び替え
	const handleChildReorder = (
		sectionId: string,
		newOrder: { id: string }[],
	) => {
		const items = form.getValues("items") ?? [];
		const byId = new Map(items.map((it) => [it.id, it]));
		const newChildOrder = newOrder
			.map(({ id }) => byId.get(id))
			.filter((x): x is NonNullable<typeof x> => !!x);

		const rebuilt: typeof items = [];
		let inserted = false;
		for (const it of items) {
			if (it.parentId === sectionId) {
				// このセクションの子はスキップして、初回だけ並び替えた順で挿入
				if (!inserted) {
					rebuilt.push(...newChildOrder);
					inserted = true;
				}
			} else {
				rebuilt.push(it);
			}
		}
		replace(rebuilt);
	};

	const watchedItems = form.watch("items") ?? [];
	const topLevelFields = fields
		.map((f, idx) => ({ f, idx }))
		.filter(({ idx }) => !watchedItems[idx]?.parentId);

	return (
		<BaseModalForm
			isOpen={isOpen}
			onClose={onClose}
			onSubmit={form.handleSubmit(handleSubmit)}
			title={isEdit ? "会議を編集" : "新規会議の作成"}
			form={form}
			isSubmitting={isSubmitting}
			isEdit={isEdit}
			maxWidthClass="sm:max-w-5xl"
		>
			<div className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={() => (
						<FormItem>
							<FormLabel>
								会議名<span className="text-red-500">*</span>
							</FormLabel>
							<FormControl>
								<Input
									placeholder="例: 週次定例ミーティング"
									{...form.register("title")}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="scheduledAt"
						render={({ field }) => (
							<FormItem>
								<FormLabel>開催日時</FormLabel>
								<FormControl>
									<Input
										type="datetime-local"
										value={toDateTimeLocalString(field.value)}
										onChange={(e) => {
											field.onChange(
												e.target.value ? new Date(e.target.value) : null,
											);
										}}
									/>
								</FormControl>
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
										<SelectItem value="scheduled">予定</SelectItem>
										<SelectItem value="in_progress">進行中</SelectItem>
										<SelectItem value="done">終了</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="description"
					render={() => (
						<FormItem>
							<FormLabel>本文</FormLabel>
							<FormDescription className="text-xs">
								概要文
							</FormDescription>
							<FormControl>
								<Textarea
									rows={4}
									placeholder="会議の目的・背景・共有事項など"
									{...form.register("description")}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-3 border-t pt-4">
					<div className="flex items-center justify-between">
						<FormLabel className="text-base">ブロック</FormLabel>
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="gap-1"
								onClick={() => appendBlock("section", null)}
							>
								<Plus className="h-4 w-4" />
								セクション
							</Button>
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="gap-1"
								onClick={() => appendBlock("agenda", null)}
							>
								<Plus className="h-4 w-4" />
								議題
							</Button>
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="gap-1"
								onClick={() => appendBlock("memo", null)}
							>
								<Plus className="h-4 w-4" />
								メモ
							</Button>
						</div>
					</div>

					{topLevelFields.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							「セクション」を追加して、その中に議題やメモを並べるのがおすすめです。
						</p>
					) : (
						<Reorder.Group
							axis="y"
							values={topLevelFields.map(({ idx }) => ({
								id: watchedItems[idx]?.id as string,
							}))}
							onReorder={handleTopReorder}
							className="space-y-3"
						>
							{topLevelFields.map(({ f, idx }) => (
								<TopLevelBlock
									key={f._key as string}
									value={{ id: watchedItems[idx]?.id as string }}
									flatIndex={idx}
									form={form}
									items={watchedItems}
									onRemoveBlock={removeBlock}
									onChildReorder={handleChildReorder}
									onAddChildAgenda={(sectionId) =>
										appendBlock("agenda", sectionId)
									}
									onAddChildMemo={(sectionId) =>
										appendBlock("memo", sectionId)
									}
									users={users}
									tasks={tasks}
									qaItems={qaItems}
								/>
							))}
						</Reorder.Group>
					)}
				</div>

				<FormField
					control={form.control}
					name="isPublic"
					render={({ field }) => (
						<FormItem className="flex items-center justify-end gap-3">
							<FormLabel className="text-base">一時公開</FormLabel>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
			</div>
		</BaseModalForm>
	);
}
