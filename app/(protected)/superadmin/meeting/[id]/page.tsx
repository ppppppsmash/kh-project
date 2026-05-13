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
import { StatusLabel } from "@/components/meeting/status-label";
import {
	useGetAgendaItems,
	useGetUserList,
} from "@/components/app-table/hooks/use-table-data";
import { PageTitle } from "@/components/animation-ui/page-title";
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

	// 階層構造を構築
	const topLevel = items.filter((it) => !it.parentId);
	const childrenBySection = new Map<string, AgendaItemFormValues[]>();
	items.forEach((it) => {
		if (it.parentId) {
			const arr = childrenBySection.get(it.parentId) ?? [];
			arr.push(it);
			childrenBySection.set(it.parentId, arr);
		}
	});

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
		if (!deleteTarget?.id) return;
		// セクション削除時は子もまとめて消す
		if (deleteTarget.type === "section") {
			const children = childrenBySection.get(deleteTarget.id) ?? [];
			await Promise.all(
				children.filter((c) => c.id).map((c) => deleteAgendaItem(c.id!)),
			);
		}
		await deleteAgendaItem(deleteTarget.id);
		CustomToast.success("削除しました");
		setDeleteTarget(null);
		invalidate();
	};

	// 階層を保ったまま order を再計算して保存
	const persistOrder = async (orderedList: AgendaItemFormValues[]) => {
		const updates: { id: string; order: number }[] = orderedList
			.map((it, i) => (it.id ? { id: it.id, order: i } : null))
			.filter((x): x is { id: string; order: number } => !!x);
		await reorderAgendaItems(updates);
		invalidate();
	};

	// 同じ親内での並び替え（top-level 同士、または同じセクション内の子同士）
	const moveSibling = async (
		item: AgendaItemFormValues,
		direction: -1 | 1,
	) => {
		if (item.parentId) {
			// セクション内の子の入れ替え
			const siblings = childrenBySection.get(item.parentId) ?? [];
			const idx = siblings.findIndex((s) => s.id === item.id);
			const target = siblings[idx + direction];
			if (!target) return;
			const newSiblings = [...siblings];
			newSiblings[idx] = target;
			newSiblings[idx + direction] = item;
			// フラット order を再構築（子セットだけ差し替え）
			const flat: AgendaItemFormValues[] = [];
			topLevel.forEach((t) => {
				flat.push(t);
				if (t.type === "section" && t.id) {
					flat.push(
						...(t.id === item.parentId
							? newSiblings
							: childrenBySection.get(t.id) ?? []),
					);
				}
			});
			await persistOrder(flat);
		} else {
			// top-level 同士の入れ替え（セクションの子はくっついて移動）
			const idx = topLevel.findIndex((t) => t.id === item.id);
			const target = topLevel[idx + direction];
			if (!target) return;
			const newTop = [...topLevel];
			newTop[idx] = target;
			newTop[idx + direction] = item;
			const flat: AgendaItemFormValues[] = [];
			newTop.forEach((t) => {
				flat.push(t);
				if (t.type === "section" && t.id) {
					flat.push(...(childrenBySection.get(t.id) ?? []));
				}
			});
			await persistOrder(flat);
		}
	};

	const origin =
		typeof window !== "undefined" ? window.location.origin : "";
	const shareUrl = meeting?.shareToken
		? `${origin}/share/meeting/${meeting.shareToken}`
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

	// --- レンダラー ---

	const ItemCard = ({
		item,
		siblings,
		siblingIndex,
	}: {
		item: AgendaItemFormValues;
		siblings: AgendaItemFormValues[];
		siblingIndex: number;
	}) => {
		const presenter = item.presenterId
			? userMap.get(item.presenterId)
			: null;
		return (
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-3">
						<CardTitle className="text-base">
							{item.type === "memo" ? "📝 " : ""}
							{item.title}
						</CardTitle>
						<div className="flex items-center gap-3">
							{item.type !== "memo" && (
								<StatusLabel
									type="agenda"
									value={item.status}
									iconSize="sm"
								/>
							)}
							{presenter && (
								<span className="text-sm text-muted-foreground">
									担当: {presenter.name}
								</span>
							)}
						</div>
					</div>
				</CardHeader>
				{(item.description || item.memo) && (
					<CardContent className="space-y-2">
						{item.description && (
							<p className="text-sm whitespace-pre-wrap">{item.description}</p>
						)}
						{item.memo && (
							<div className="rounded-md bg-muted/50 p-3">
								<p className="text-xs text-muted-foreground mb-1">議事録</p>
								<p className="whitespace-pre-wrap text-sm">{item.memo}</p>
							</div>
						)}
					</CardContent>
				)}
				<CardFooter className="flex justify-between">
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							disabled={siblingIndex === 0}
							onClick={() => moveSibling(item, -1)}
						>
							<ArrowUp className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							disabled={siblingIndex === siblings.length - 1}
							onClick={() => moveSibling(item, 1)}
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
		);
	};

	return (
		<div className="flex flex-col h-full -mx-4 lg:-mx-6 -my-4">
			{/* 上部固定エリア */}
			<div className="flex-shrink-0 border-b bg-background px-4 lg:px-6 pt-4 pb-4 space-y-4">
				<Button asChild variant="ghost" size="sm" className="-ml-2">
					<Link href="/superadmin/meeting">
						<ArrowLeft className="mr-1 h-4 w-4" />
						会議一覧へ戻る
					</Link>
				</Button>

				<div className="flex items-start justify-between gap-4">
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
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground whitespace-nowrap">
							共有 URL
						</span>
						<Input readOnly value={shareUrl} className="h-8 text-xs" />
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={handleCopyShareUrl}
						>
							<Copy className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={handleRegenerateToken}
							title="URL を再生成"
						>
							<RefreshCw className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>

			<AgendaItemModalForm
				isOpen={isOpen}
				onClose={closeModal}
				onSubmit={handleSubmit}
				initialData={currentItem}
			/>

			{/* スクロール領域 */}
			<div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-6 py-4">
			{isLoading ? (
				<p className="text-sm text-muted-foreground">読み込み中...</p>
			) : items.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					アジェンダ項目を追加してください。
				</p>
			) : (
				<div className="space-y-3">
					{topLevel.map((item, topIdx) => {
						if (item.type === "section") {
							const children = item.id
								? childrenBySection.get(item.id) ?? []
								: [];
							return (
								<div
									key={item.id}
									className="rounded-lg border-2 border-primary/30 p-4 space-y-3"
								>
									<div className="flex items-start justify-between gap-3">
										<h2 className="text-lg font-bold">{item.title}</h2>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												disabled={topIdx === 0}
												onClick={() => moveSibling(item, -1)}
												title="セクションを上に（中身ごと）"
											>
												<ArrowUp className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												disabled={topIdx === topLevel.length - 1}
												onClick={() => moveSibling(item, 1)}
												title="セクションを下に（中身ごと）"
											>
												<ArrowDown className="h-4 w-4" />
											</Button>
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
												title="セクションと中身をまとめて削除"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
									<div className="space-y-2 pl-4 border-l-2 border-primary/30">
										{children.length === 0 ? (
											<p className="text-xs text-muted-foreground py-2">
												このセクションには議題・メモがありません
											</p>
										) : (
											children.map((c, childIdx) => (
												<ItemCard
													key={c.id}
													item={c}
													siblings={children}
													siblingIndex={childIdx}
												/>
											))
										)}
									</div>
								</div>
							);
						}
						return (
							<ItemCard
								key={item.id}
								item={item}
								siblings={topLevel}
								siblingIndex={topIdx}
							/>
						);
					})}
				</div>
			)}
			</div>

			<Dialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{deleteTarget?.type === "section"
								? "セクションの削除"
								: "アジェンダ項目の削除"}
						</DialogTitle>
						<DialogDescription>
							「{deleteTarget?.title}」を削除します。
							{deleteTarget?.type === "section" &&
								" セクション内の議題・メモも一緒に消えます。"}
							{" 元に戻せません。"}
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
