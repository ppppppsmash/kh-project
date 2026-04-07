"use client";

import { createQA } from "@/actions/qa";
import { AddButton } from "@/components/add-button";
import { getCategoryBadgeVariant } from "@/components/app-accordion-table/render/QAItem";
import { QaModalForm } from "@/components/app-modal/qa-modal-form";
import { useGetQa } from "@/components/app-table/hooks/use-table-data";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
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
import { useQaCategories } from "@/hooks/use-qa-categories";
import { useSubmit } from "@/lib/submitHandler";
import { formatDate } from "@/lib/utils";
import type { QaFormValues } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { Filter, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function QAPage() {
	const { data: session, status } = useSession();
	const queryClient = useQueryClient();
	const { isOpen, openModal, closeModal } = useModal();
	const [currentData, setCurrentData] = useState<QaFormValues | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("全て");
	const [currentPage, setCurrentPage] = useState(1);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const itemsPerPage = 10;

	const role = session?.user?.role;

	const { data: qaItems = [] } = useGetQa();
	const categories = useQaCategories(qaItems, { includeAll: true });

	// 回答済みの質問のみをフィルタリング
	//const answeredQAItems = qaItems.filter((item) => item.isPublic)

	// フィルタリングとページネーション
	const filteredQA = qaItems.filter((item) => {
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
				type={role || ""}
				isOpen={isOpen}
				onClose={closeModal}
				onSubmit={handleSubmit}
				initialData={currentData}
			/>

			<>
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
													{item.createdAt &&
														formatDate(item.createdAt, "yyyy-MM-dd")}
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
					<TablePagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={filteredQA.length}
						itemsPerPage={itemsPerPage}
						onPageChange={setCurrentPage}
					/>
				)}
			</>

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
