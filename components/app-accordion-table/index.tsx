"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
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
import { Filter, Pencil, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { CSVButton } from "@/components/csv-button";

export interface AccordionTableColumn<T> {
	key: keyof T | string;
	label: string;
	render?: (item: T) => React.ReactNode;
}

export interface AccordionTableProps<T> {
	data: T[];
	columns: AccordionTableColumn<T>[];
	idField: keyof T;
	searchFields: (keyof T)[];
	categoryField?: keyof T;
	categories?: string[];
	onEdit?: (item: T) => void;
	onDelete?: (id: T[keyof T]) => void;
	itemsPerPage?: number;
	renderContent: (item: T) => React.ReactNode;
	csvButton?: {
		text: string;
		onClick: (filteredData: T[], searchTerm: string, categoryFilter: string) => void;
		className?: string;
		disabled?: boolean;
	};
}

export const AccordionTable = <T extends Record<string, unknown>>({
	data,
	columns,
	idField,
	searchFields,
	categoryField,
	categories = [],
	onEdit,
	onDelete,
	itemsPerPage = 5,
	renderContent,
	csvButton,
}: AccordionTableProps<T>) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("全て");
	const [currentPage, setCurrentPage] = useState(1);

	const filteredData = data.filter((item) => {
		const matchesSearch = searchFields.some((field) =>
			String(item[field]).toLowerCase().includes(searchTerm.toLowerCase()),
		);
		const matchesCategory =
			categoryFilter === "全て" ||
			(categoryField &&
				String(item[categoryField])
					.toLowerCase()
					.includes(categoryFilter.toLowerCase()));

		return matchesSearch && matchesCategory;
	});

	const totalPages = Math.ceil(filteredData.length / itemsPerPage);
	const currentItems = filteredData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const handleCSVExport = () => {
		csvButton?.onClick(filteredData, searchTerm, categoryFilter);
	};

	return (
		<div className="mb-6 flex flex-col gap-4">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-col gap-4 md:flex-row">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="検索..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-8"
						/>
					</div>

					{categoryField && categories.length > 0 && (
						<div className="flex gap-2">
							<Select value={categoryFilter} onValueChange={setCategoryFilter}>
								<SelectTrigger className="w-[180px]">
									<Filter className="mr-2 h-4 w-4" />
									<SelectValue placeholder="カテゴリ" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="全て">全て</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					<div className="flex items-center gap-2">
						{csvButton && (
							<CSVButton
								text={csvButton.text}
								onClick={handleCSVExport}
								className={csvButton.className}
								disabled={csvButton.disabled}
							/>
						)}
					</div>
				</div>
			</div>

			<div className="overflow-auto max-h-[70svh]">
				<div className="space-y-4">
					{currentItems.length > 0 ? (
						<Accordion type="single" collapsible className="w-full">
							{currentItems.map((item) => (
								<AccordionItem
									key={String(item[idField])}
									value={String(item[idField])}
								>
									<AccordionTrigger className="hover:no-underline">
										<div className="flex w-full flex-col items-start gap-x-4 text-left sm:flex-row sm:items-center">
											{columns.map((column) => (
												<div key={String(column.key)} className="flex-1">
													{column.render
														? column.render(item)
														: String(item[column.key])}
												</div>
											))}
											<div className="flex items-center gap-2">
												{onEdit && (
													<Button
														variant="ghost"
														size="icon"
														onClick={(e) => {
															e.stopPropagation();
															onEdit(item);
														}}
													>
														<Pencil className="h-4 w-4" />
													</Button>
												)}
												{onDelete && (
													<Button
														variant="ghost"
														size="icon"
														onClick={(e) => {
															e.stopPropagation();
															onDelete(item[idField]);
														}}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												)}
											</div>
										</div>
									</AccordionTrigger>
									<AccordionContent>{renderContent(item)}</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					) : (
						<div className="rounded-md border p-8 text-center text-sm">
							該当するデータがありません
						</div>
					)}
				</div>
			</div>

				{/* ページネーション */}
			<div className="flex items-center justify-between mt-4">
				<div className="text-sm text-muted-foreground">
					{filteredData.length}件中 {(currentPage - 1) * itemsPerPage + 1}-
					{Math.min(currentPage * itemsPerPage, filteredData.length)}件を表示
				</div>
				<div className="flex items-center space-x-2">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() =>
										setCurrentPage((prev) => Math.max(prev - 1, 1))
									}
								/>
							</PaginationItem>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
								<PaginationItem key={page}>
									<PaginationLink
										isActive={page === currentPage}
										onClick={() => setCurrentPage(page)}
									>
										{page}
									</PaginationLink>
								</PaginationItem>
							))}
							<PaginationItem>
								<PaginationNext
									onClick={() =>
										setCurrentPage((prev) =>
											Math.min(prev + 1, totalPages),
										)
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</div>
		</div>
	);
};
