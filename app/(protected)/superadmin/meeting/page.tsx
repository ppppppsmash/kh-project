"use client";

import {
	createMeeting,
	deleteMeeting,
	updateMeeting,
} from "@/actions/meeting";
import { AddButton } from "@/components/add-button";
import { MeetingModalForm } from "@/components/app-modal/meeting-modal-form";
import {
	useGetMeetings,
	useGetQa,
	useGetTasks,
} from "@/components/app-table/hooks/use-table-data";
import { PageTitle } from "@/components/animation-ui/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { CustomToast } from "@/components/ui/toast";
import { getNavTitle } from "@/config";
import { useModal } from "@/hooks/use-modal";
import { useSubmit } from "@/lib/submitHandler";
import { formatDate } from "@/lib/utils";
import type {
	AgendaItemFormValues,
	MeetingFormValues,
	QaFormValues,
	TaskFormValues,
} from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const statusLabel: Record<string, { label: string; className: string }> = {
	scheduled: { label: "予定", className: "bg-gray-100 text-gray-800" },
	in_progress: { label: "進行中", className: "bg-blue-100 text-blue-800" },
	done: { label: "終了", className: "bg-green-100 text-green-800" },
};

const agendaStatusBadge: Record<
	string,
	{ label: string; className: string }
> = {
	not_started: { label: "未", className: "bg-gray-100 text-gray-800" },
	in_progress: { label: "進行中", className: "bg-blue-100 text-blue-800" },
	done: { label: "完了", className: "bg-green-100 text-green-800" },
};

const renderBlock = (
	item: AgendaItemFormValues,
	taskMap: Map<string | undefined, TaskFormValues>,
	qaMap: Map<string | undefined, QaFormValues>,
	onTaskClick: (t: TaskFormValues) => void,
	onQaClick: (q: QaFormValues) => void,
) => {
	if (item.type === "memo") {
		return (
			<div
				key={item.id}
				className="rounded-md border-2 border-dashed border-primary/40 p-3"
			>
				{item.title && (
					<p className="mb-1 text-sm font-semibold">{item.title}</p>
				)}
				{item.description && (
					<p className="whitespace-pre-wrap text-sm">{item.description}</p>
				)}
			</div>
		);
	}
	const status =
		agendaStatusBadge[item.status ?? "not_started"] ??
		agendaStatusBadge.not_started;
	const linkedTask = item.linkedTaskId ? taskMap.get(item.linkedTaskId) : null;
	const linkedQa = item.linkedQaId ? qaMap.get(item.linkedQaId) : null;
	return (
		<div key={item.id} className="rounded-md border bg-card p-3">
			<div className="flex items-start justify-between gap-2">
				<p className="text-sm font-medium">{item.title}</p>
				<Badge className={status.className}>{status.label}</Badge>
			</div>
			{item.description && (
				<p className="mt-1 text-xs text-muted-foreground">
					{item.description}
				</p>
			)}
			{(linkedTask || linkedQa) && (
				<div className="mt-2 flex flex-wrap gap-2">
					{linkedTask && (
						<button
							type="button"
							onClick={() => onTaskClick(linkedTask)}
							className="text-xs"
						>
							<Badge
								variant="secondary"
								className="cursor-pointer hover:bg-secondary/80"
							>
								Task: {linkedTask.title}
							</Badge>
						</button>
					)}
					{linkedQa && (
						<button
							type="button"
							onClick={() => onQaClick(linkedQa)}
							className="text-xs"
						>
							<Badge
								variant="secondary"
								className="cursor-pointer hover:bg-secondary/80"
							>
								QA: {linkedQa.question}
							</Badge>
						</button>
					)}
				</div>
			)}
			{item.memo && (
				<p className="mt-1 whitespace-pre-wrap text-xs">{item.memo}</p>
			)}
		</div>
	);
};

const MeetingPreview = ({
	items,
	tasks,
	qaItems,
	onTaskClick,
	onQaClick,
}: {
	items: AgendaItemFormValues[];
	tasks: TaskFormValues[];
	qaItems: QaFormValues[];
	onTaskClick: (task: TaskFormValues) => void;
	onQaClick: (qa: QaFormValues) => void;
}) => {
	const taskMap = new Map(tasks.map((t) => [t.id, t]));
	const qaMap = new Map(qaItems.map((q) => [q.id, q]));

	if (items.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				ブロックが登録されていません。会議を編集して追加してください。
			</p>
		);
	}

	const topLevel = items.filter((it) => !it.parentId);
	const childrenBySection = new Map<string, AgendaItemFormValues[]>();
	items.forEach((it) => {
		if (it.parentId) {
			const arr = childrenBySection.get(it.parentId) ?? [];
			arr.push(it);
			childrenBySection.set(it.parentId, arr);
		}
	});

	return (
		<div className="space-y-3">
			{topLevel.map((item) => {
				if (item.type === "section") {
					const children = item.id
						? childrenBySection.get(item.id) ?? []
						: [];
					return (
						<div
							key={item.id}
							className="rounded-lg border-2 border-primary/30 p-3"
						>
							<p className="mb-2 text-base font-bold">{item.title}</p>
							<div className="space-y-2 pl-3 border-l-2 border-primary/30">
								{children.map((c) =>
									renderBlock(c, taskMap, qaMap, onTaskClick, onQaClick),
								)}
							</div>
						</div>
					);
				}
				return renderBlock(item, taskMap, qaMap, onTaskClick, onQaClick);
			})}
		</div>
	);
};

const Field = ({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) => (
	<div>
		<h3 className="mb-1 text-xs font-medium text-muted-foreground">{label}</h3>
		<div className="text-sm">{children}</div>
	</div>
);

const TaskDetailSheet = ({
	task,
	onClose,
}: {
	task: TaskFormValues | null;
	onClose: () => void;
}) => (
	<Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
		<SheetContent className="w-full overflow-y-auto sm:max-w-xl">
			<SheetHeader>
				<SheetTitle>{task?.title}</SheetTitle>
			</SheetHeader>
			{task && (
				<div className="space-y-4 p-6">
					<div className="grid grid-cols-2 gap-4">
						<Field label="タスクID">{task.taskId}</Field>
						<Field label="進捗">{task.progress}</Field>
					</div>
					<Field label="担当者">{task.assignee}</Field>
					<div className="grid grid-cols-2 gap-4">
						<Field label="起票日">
							{task.startedAt
								? formatDate(new Date(task.startedAt), "yyyy/MM/dd")
								: "—"}
						</Field>
						<Field label="期限">
							{task.dueDate
								? formatDate(new Date(task.dueDate), "yyyy/MM/dd")
								: "—"}
						</Field>
					</div>
					<Field label="優先度">{task.priority ?? "未設定"}</Field>
					<Field label="内容">
						<p className="whitespace-pre-wrap">{task.content}</p>
					</Field>
					{task.progressDetails && (
						<Field label="進捗状況・対応内容">
							<p className="whitespace-pre-wrap">{task.progressDetails}</p>
						</Field>
					)}
					{task.link && (
						<Field label="リンク先">
							<a
								href={task.link}
								target="_blank"
								rel="noopener noreferrer"
								className="break-all text-blue-500 hover:underline"
							>
								{task.link}
							</a>
						</Field>
					)}
					{task.notes && (
						<Field label="備考">
							<p className="whitespace-pre-wrap">{task.notes}</p>
						</Field>
					)}
				</div>
			)}
		</SheetContent>
	</Sheet>
);

const QaDetailSheet = ({
	qa,
	onClose,
}: {
	qa: QaFormValues | null;
	onClose: () => void;
}) => (
	<Sheet open={!!qa} onOpenChange={(open) => !open && onClose()}>
		<SheetContent className="w-full overflow-y-auto sm:max-w-xl">
			<SheetHeader>
				<SheetTitle>{qa?.question}</SheetTitle>
			</SheetHeader>
			{qa && (
				<div className="space-y-4 p-6">
					<Field label="カテゴリ">{qa.category}</Field>
					{qa.questionBy && <Field label="質問者">{qa.questionBy}</Field>}
					{qa.answeredBy && <Field label="回答者">{qa.answeredBy}</Field>}
					<Field label="回答">
						<p className="whitespace-pre-wrap">{qa.answer || "（未回答）"}</p>
					</Field>
				</div>
			)}
		</SheetContent>
	</Sheet>
);

export default function MeetingListPage() {
	const queryClient = useQueryClient();
	const { isOpen, openModal, closeModal } = useModal();
	const [currentData, setCurrentData] = useState<MeetingFormValues | null>(
		null,
	);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [previewTarget, setPreviewTarget] = useState<MeetingFormValues | null>(
		null,
	);
	const [taskDetail, setTaskDetail] = useState<TaskFormValues | null>(null);
	const [qaDetail, setQaDetail] = useState<QaFormValues | null>(null);

	const { data: meetings = [], isLoading } = useGetMeetings();
	const { data: tasks = [] } = useGetTasks();
	const { data: qaItems = [] } = useGetQa();

	const handleEdit = (item: MeetingFormValues) => {
		setCurrentData(item);
		openModal();
	};

	const handleDelete = (item: MeetingFormValues) => {
		setCurrentData(item);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (currentData?.id) {
			await deleteMeeting(currentData.id);
			CustomToast.success("会議を削除しました");
			setIsDeleteDialogOpen(false);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
		}
	};

	const { handleSubmit } = useSubmit<MeetingFormValues>({
		action: async (data) => {
			if (currentData?.id) {
				await updateMeeting(currentData.id, data);
			} else {
				await createMeeting(data);
			}
		},
		onSuccess: () => {
			closeModal();
			CustomToast.success(
				currentData ? "会議を更新しました" : "会議を作成しました",
			);
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["meetings"] });
		},
		onError: () => {
			CustomToast.error("会議の保存に失敗しました");
		},
	});

	const handleAdd = () => {
		setCurrentData(null);
		openModal();
	};

	const handleCopyShareUrl = (shareToken?: string) => {
		if (!shareToken) return;
		const url = `${process.env.NEXT_PUBLIC_SHARE_URL || ""}/meeting/${shareToken}`;
		navigator.clipboard.writeText(url);
		CustomToast.success("共有 URL をコピーしました");
	};

	return (
		<div className="mx-auto">
			<div className="mb-8 flex items-center justify-between">
				<PageTitle>{getNavTitle("/superadmin/meeting")}</PageTitle>
				<AddButton text="新規会議" onClick={handleAdd} />
			</div>

			<MeetingModalForm
				isOpen={isOpen}
				onClose={closeModal}
				onSubmit={handleSubmit}
				initialData={currentData}
			/>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">読み込み中...</p>
			) : meetings.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					まだ会議が登録されていません。
				</p>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{meetings.map((m) => {
						const status =
							statusLabel[m.status ?? "scheduled"] ?? statusLabel.scheduled;
						return (
							<Card key={m.id} className="flex flex-col">
								<CardHeader>
									<div className="flex items-start justify-between gap-2">
										<CardTitle className="text-base">
											<Link
												href={`/superadmin/meeting/${m.id}`}
												className="hover:underline"
											>
												{m.title}
											</Link>
										</CardTitle>
										<Badge className={status.className}>{status.label}</Badge>
									</div>
									{m.scheduledAt && (
										<p className="text-xs text-muted-foreground">
											{formatDate(
												new Date(m.scheduledAt),
												"yyyy/MM/dd (E) HH:mm",
											)}
										</p>
									)}
								</CardHeader>
								<CardContent className="flex-1">
									{m.description && (
										<p className="line-clamp-3 text-sm text-muted-foreground">
											{m.description}
										</p>
									)}
									{m.isPublic && (
										<Badge variant="outline" className="mt-2">
											一時公開
										</Badge>
									)}
								</CardContent>
								<CardFooter className="flex justify-end gap-1">
									<Button
										variant="ghost"
										size="icon"
										title="プレビュー"
										onClick={() => setPreviewTarget(m)}
									>
										<Eye className="h-4 w-4" />
									</Button>
									{m.isPublic && (
										<Button
											variant="ghost"
											size="icon"
											title="共有 URL をコピー"
											onClick={() => handleCopyShareUrl(m.shareToken)}
										>
											<Copy className="h-4 w-4" />
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleEdit(m)}
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(m)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			)}

			<Dialog
				open={!!previewTarget}
				onOpenChange={(open) => !open && setPreviewTarget(null)}
			>
				<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>{previewTarget?.title}</DialogTitle>
						{previewTarget?.scheduledAt && (
							<DialogDescription>
								{formatDate(
									new Date(previewTarget.scheduledAt),
									"yyyy/MM/dd (E) HH:mm",
								)}
							</DialogDescription>
						)}
					</DialogHeader>
					{previewTarget && (
						<MeetingPreview
							items={previewTarget.items ?? []}
							tasks={tasks}
							qaItems={qaItems}
							onTaskClick={setTaskDetail}
							onQaClick={setQaDetail}
						/>
					)}
				</DialogContent>
			</Dialog>

			<TaskDetailSheet task={taskDetail} onClose={() => setTaskDetail(null)} />
			<QaDetailSheet qa={qaDetail} onClose={() => setQaDetail(null)} />

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>会議の削除</DialogTitle>
						<DialogDescription>
							この会議を削除するとアジェンダ項目もまとめて削除されます。元に戻せません。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							キャンセル
						</Button>
						<Button variant="destructive" onClick={handleDeleteConfirm}>
							削除する
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
