"use client";

import {
	createAgendaItem,
	deleteAgendaItem,
	getMeeting,
	regenerateShareToken,
	reorderAgendaItems,
	updateAgendaItem,
} from "@/actions/meeting";
import { AddButton } from "@/components/add-button";
import { AgendaItemModalForm } from "@/components/app-modal/agenda-item-modal-form";
import {
	useGetAgendaItems,
	useGetUserList,
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
import { Input } from "@/components/ui/input";
import { CustomToast } from "@/components/ui/toast";
import { useModal } from "@/hooks/use-modal";
import { useSubmit } from "@/lib/submitHandler";
import { formatDate } from "@/lib/utils";
import type {
	AgendaItemFormValues,
	MeetingFormValues,
} from "@/lib/validations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	ArrowDown,
	ArrowUp,
	Copy,
	Pencil,
	RefreshCw,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const statusBadge: Record<string, { label: string; className: string }> = {
	not_started: { label: "未", className: "bg-gray-100 text-gray-800" },
	in_progress: { label: "進行中", className: "bg-blue-100 text-blue-800" },
	done: { label: "完了", className: "bg-green-100 text-green-800" },
};

export default function MeetingDetailPage() {
	const params = useParams<{ id: string }>();
	const meetingId = params.id;
	const queryClient = useQueryClient();
	const { isOpen, openModal, closeModal } = useModal();
	const [currentItem, setCurrentItem] = useState<AgendaItemFormValues | null>(
		null,
	);
	const [deleteTarget, setDeleteTarget] = useState<AgendaItemFormValues | null>(
		null,
	);

	const { data: meeting } = useQuery<MeetingFormValues | null>({
		queryKey: ["meeting", meetingId],
		queryFn: () => getMeeting(meetingId),
		enabled: !!meetingId,
	});
	const { data: items = [], isLoading } = useGetAgendaItems(meetingId);
	const { data: users = [] } = useGetUserList();

	const userMap = new Map(users.map((u) => [u.id, u]));

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["agenda-items", meetingId] });
	};

	const handleAdd = () => {
		setCurrentItem(null);
		openModal();
	};

	const handleEdit = (item: AgendaItemFormValues) => {
		setCurrentItem(item);
		openModal();
	};

	const { handleSubmit } = useSubmit<AgendaItemFormValues>({
		action: async (data) => {
			if (currentItem?.id) {
				await updateAgendaItem(currentItem.id, data);
			} else {
				await createAgendaItem(meetingId, data);
			}
		},
		onSuccess: () => {
			closeModal();
			CustomToast.success(
				currentItem ? "アジェンダ項目を更新しました" : "アジェンダ項目を追加しました",
			);
			setCurrentItem(null);
			invalidate();
		},
		onError: () => {
			CustomToast.error("保存に失敗しました");
		},
	});

	const handleDelete = async () => {
		if (deleteTarget?.id) {
			await deleteAgendaItem(deleteTarget.id);
			CustomToast.success("削除しました");
			setDeleteTarget(null);
			invalidate();
		}
	};

	const move = async (index: number, direction: -1 | 1) => {
		const target = items[index];
		const swap = items[index + direction];
		if (!target?.id || !swap?.id) return;
		await reorderAgendaItems([
			{ id: target.id, order: swap.order ?? 0 },
			{ id: swap.id, order: target.order ?? 0 },
		]);
		invalidate();
	};

	const shareUrl = meeting?.shareToken
		? `${process.env.NEXT_PUBLIC_SHARE_URL || ""}/meeting/${meeting.shareToken}`
		: "";

	const handleCopyShareUrl = () => {
		if (!shareUrl) return;
		navigator.clipboard.writeText(shareUrl);
		CustomToast.success("共有 URL をコピーしました");
	};

	const handleRegenerateToken = async () => {
		if (!meeting?.id) return;
		await regenerateShareToken(meeting.id);
		CustomToast.success("共有 URL を再生成しました");
		queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] });
	};

	return (
		<div className="mx-auto">
			<div className="mb-4">
				<Button asChild variant="ghost" size="sm">
					<Link href="/superadmin/meeting">
						<ArrowLeft className="mr-1 h-4 w-4" />
						会議一覧へ戻る
					</Link>
				</Button>
			</div>

			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<PageTitle>{meeting?.title ?? "会議"}</PageTitle>
					{meeting?.scheduledAt && (
						<p className="mt-1 text-sm text-muted-foreground">
							{formatDate(
								new Date(meeting.scheduledAt),
								"yyyy/MM/dd (E) HH:mm",
							)}
						</p>
					)}
				</div>
				<AddButton text="アジェンダ追加" onClick={handleAdd} />
			</div>

			{meeting?.isPublic && meeting.shareToken && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-sm">共有 URL（一時公開）</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center gap-2">
						<Input readOnly value={shareUrl} />
						<Button variant="outline" size="icon" onClick={handleCopyShareUrl}>
							<Copy className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={handleRegenerateToken}
							title="URL を再生成"
						>
							<RefreshCw className="h-4 w-4" />
						</Button>
					</CardContent>
				</Card>
			)}

			<AgendaItemModalForm
				isOpen={isOpen}
				onClose={closeModal}
				onSubmit={handleSubmit}
				initialData={currentItem}
			/>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">読み込み中...</p>
			) : items.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					アジェンダ項目を追加してください。
				</p>
			) : (
				<ol className="space-y-3">
					{items.map((item, index) => {
						const status =
							statusBadge[item.status ?? "not_started"] ??
							statusBadge.not_started;
						const presenter = item.presenterId
							? userMap.get(item.presenterId)
							: null;
						return (
							<li key={item.id}>
								<Card>
									<CardHeader>
										<div className="flex items-start justify-between gap-3">
											<div className="flex items-start gap-3">
												<span className="text-muted-foreground text-sm font-semibold mt-0.5">
													{index + 1}.
												</span>
												<CardTitle className="text-base">
													{item.title}
												</CardTitle>
											</div>
											<div className="flex items-center gap-2">
												<Badge className={status.className}>
													{status.label}
												</Badge>
												{presenter && (
													<Badge variant="outline">{presenter.name}</Badge>
												)}
											</div>
										</div>
									</CardHeader>
									{(item.description || item.memo) && (
										<CardContent className="space-y-2">
											{item.description && (
												<p className="text-sm">{item.description}</p>
											)}
											{item.memo && (
												<div className="rounded-md bg-muted/50 p-3">
													<p className="text-xs text-muted-foreground mb-1">
														議事録
													</p>
													<p className="whitespace-pre-wrap text-sm">
														{item.memo}
													</p>
												</div>
											)}
										</CardContent>
									)}
									<CardFooter className="flex justify-between">
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												disabled={index === 0}
												onClick={() => move(index, -1)}
											>
												<ArrowUp className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												disabled={index === items.length - 1}
												onClick={() => move(index, 1)}
											>
												<ArrowDown className="h-4 w-4" />
											</Button>
										</div>
										<div className="flex gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEdit(item)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setDeleteTarget(item)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</CardFooter>
								</Card>
							</li>
						);
					})}
				</ol>
			)}

			<Dialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>アジェンダ項目の削除</DialogTitle>
						<DialogDescription>
							「{deleteTarget?.title}」を削除します。元に戻せません。
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteTarget(null)}>
							キャンセル
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							削除する
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
