"use client";

import { getQA } from "@/actions/qa";
import { createQA } from "@/actions/qa";
import { AddButton } from "@/components/add-button";
import { getCategoryBadgeVariant } from "@/components/app-accordion-table/render/QAItem";
import { QaModalForm } from "@/components/app-modal/qa-modal-form";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CustomToast } from "@/components/ui/toast";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useModal } from "@/hooks/use-modal";
import { useSubmit } from "@/lib/submitHandler";
import type { QaFormValues } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Filter, Search } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useMemo, useState } from "react";

// 固定のカテゴリーリスト
const defaultCategories = [
	"現場",
	"経費",
	"福利厚生",
	"休暇",
	"週報",
	"その他",
];

export default function QAPage() {
	const { data: session, status } = useSession();
	const queryClient = useQueryClient();
	const { isOpen, openModal, closeModal } = useModal();
	const [currentData, setCurrentData] = useState<QaFormValues | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("全て");
	const [currentPage, setCurrentPage] = useState(1);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
	const itemsPerPage = 10;

	const { data: qaItems = [] } = useQuery({
		queryKey: ["qa"],
		queryFn: getQA,
		staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
	});

	// カテゴリーリストを計算
	const categories = useMemo(() => {
		const dbCategories = Array.from(
			new Set(qaItems.map((item) => item.category)),
		)
			.filter(Boolean)
			.filter((category) => !defaultCategories.includes(category));

		return ["全て", ...defaultCategories, ...dbCategories];
	}, [qaItems]);

	// 回答済みの質問のみをフィルタリング
	const answeredQAItems = qaItems.filter(
		(item) => item.answer && item.isPublic,
	);

	// フィルタリングとページネーション
	const filteredQA = answeredQAItems.filter((item) => {
		const matchesSearch =
			item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(item.answer?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false) ||
			(item.questionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false);
		const matchesCategory =
			categoryFilter === "全て" || item.category === categoryFilter;

		return matchesSearch && matchesCategory;
	});

	const totalPages = Math.ceil(filteredQA.length / itemsPerPage);
	const currentItems = filteredQA.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const handleAdd = () => {
		setCurrentData(null);
		openModal();
	};

	const handleSignIn = async () => {
		await signIn("google", { callbackUrl: "/external/qa" });
	};

	const { handleSubmit } = useSubmit<QaFormValues>({
		action: async (data) => {
			await createQA({
				question: data.question,
				answer: data.answer || "",
				category: data.category,
				questionBy: data.questionBy,
				answeredBy: data.answeredBy,
			});
		},
		onSuccess: () => {
			closeModal();
			CustomToast.success("質問を投稿しました");
			setCurrentData(null);
			queryClient.invalidateQueries({ queryKey: ["qa"] });
			setIsDialogOpen(true);
		},
		onError: () => {
			CustomToast.error("QAの保存に失敗しました");
		},
	});

	// セッションのローディング中は何も表示しない
	if (status === "loading") {
		return null;
	}

	if (!session) {
		return (
			<div className="container mx-auto">
				<div className="mb-8 flex items-center justify-between">
					<h1 className="text-3xl font-bold">QA一覧</h1>
				</div>
				<div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-8 text-center">
					<h2 className="text-xl font-semibold">認証が必要です</h2>
					<p className="text-muted-foreground">
						QA一覧を閲覧するには、ログインが必要です。
					</p>
					<Button onClick={() => setIsSignInDialogOpen(true)}>
						サインイン
					</Button>
				</div>

				<Dialog open={isSignInDialogOpen} onOpenChange={setIsSignInDialogOpen}>
					<DialogContent className="w-[360px]">
						<DialogHeader>
							<DialogTitle>サインイン</DialogTitle>
							<DialogDescription>
								社内Googleアカウントが許可されているユーザーのみが閲覧できます
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button onClick={handleSignIn} className="w-full">
								サインイン
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	return (
		<div className="container mx-auto">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="text-3xl font-bold">QA一覧</h1>
				<AddButton text="質問を投稿" onClick={handleAdd} />
			</div>

			<QaModalForm
				type="admin"
				isOpen={isOpen}
				onClose={closeModal}
				onSubmit={handleSubmit}
				initialData={currentData}
			/>

			<div>
				<div className="mb-6 flex flex-col gap-4 md:flex-row">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="検索..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-8"
						/>
					</div>

					<div className="flex gap-2">
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-[180px]">
								<Filter className="mr-2 h-4 w-4" />
								<SelectValue placeholder="カテゴリ" />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-4">
					{currentItems.length > 0 ? (
						<Accordion type="single" collapsible className="w-full">
							{currentItems.map((item) => (
								<AccordionItem key={item.id} value={item.id || ""}>
									<AccordionTrigger className="hover:no-underline">
										<div className="flex w-full flex-col items-start gap-1 text-left sm:flex-row sm:items-center">
											<span className="mr-2 font-medium">
												{item.questionCode || item.id}
											</span>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="flex-1 w-[500px] truncate">
															{item.question}
														</span>
													</TooltipTrigger>
													<TooltipContent>
														<p>{item.question}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
											<div className="flex items-center gap-2">
												<Badge variant={getCategoryBadgeVariant(item.category)}>
													{item.category}
												</Badge>
												<span className="text-xs text-muted-foreground">
													{format(item.createdAt || new Date(), "yyyy-MM-dd")}
												</span>
											</div>
										</div>
									</AccordionTrigger>
									<AccordionContent>
										<div className="rounded-md bg-muted/50 p-4">
											<p className="mb-2 text-sm text-muted-foreground">
												回答者: {item.answeredBy}
											</p>
											{item.answer}
										</div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					) : (
						<div className="rounded-md border p-8 text-center">
							該当するQAがありません
						</div>
					)}
				</div>

				{totalPages > 1 && (
					<Pagination className="mt-4">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (currentPage > 1) setCurrentPage(currentPage - 1);
									}}
									className={
										currentPage === 1 ? "pointer-events-none opacity-50" : ""
									}
								/>
							</PaginationItem>

							{Array.from({ length: totalPages }).map((_, i) => {
								const pageNumber = i + 1;
								return (
									<PaginationItem key={pageNumber}>
										<PaginationLink
											href="#"
											onClick={(e) => {
												e.preventDefault();
												setCurrentPage(pageNumber);
											}}
											isActive={currentPage === pageNumber}
										>
											{pageNumber}
										</PaginationLink>
									</PaginationItem>
								);
							})}

							<PaginationItem>
								<PaginationNext
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (currentPage < totalPages)
											setCurrentPage(currentPage + 1);
									}}
									className={
										currentPage === totalPages
											? "pointer-events-none opacity-50"
											: ""
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>質問の投稿が完了しました</DialogTitle>
						<DialogDescription>
							ご質問ありがとうございます。回答が完了次第、お知らせいたします。
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</div>
	);
}
