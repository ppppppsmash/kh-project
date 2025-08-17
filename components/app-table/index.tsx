"use client";

import type React from "react";

import { AddButton } from "@/components/add-button";
import { CSVButton } from "@/components/csv-button";
import { ClubActivityTableSkeleton } from "@/components/app-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { ITEMS_PER_PAGE_OPTIONS, useTableStore } from "@/lib/store/table-store";
import { getPaginated, getTotalPages } from "@/lib/utils";
import {
	ArrowUpDown,
	ChevronDown,
	ChevronUp,
	Filter,
	Search,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

export type SortConfig<T> = {
	key: keyof T;
	direction: "asc" | "desc";
};

export interface TableColumn<T> {
	key: Extract<keyof T, string> | "action";
	title: string;
	sortable?: boolean;
	hide?: "xs" | "sm" | "md" | "lg";
	align?: "left" | "right";
	render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableCellType<T> {
	value: T[keyof T];
	render?: (value: T[keyof T], item: T) => React.ReactNode;
	row: T;
}

const TableCellItem = <T,>({ value, render, row }: TableCellType<T>) => {
	return <TableCell>{render ? render(value, row) : String(value)}</TableCell>;
};

interface TableProps<T> {
	toolBar?: {
		researchBarPlaceholder?: string;
		researchStatusFilter?: string[];
		researchPriorityFilter?: string[];
	};
	columns: TableColumn<T>[];
	data: T[];
	loading?: boolean;
	searchableKeys?: (keyof T)[];
	onRowClick?: (row: T) => void;
	onFilter?: (data: T[], searchQuery: string, statusFilter: string, priorityFilter?: string) => T[];
	addButton?: {
		text: string;
		onClick: () => void;
		className?: string;
	};
	csvButton?: {
		text: string;
		onClick: () => void;
		className?: string;
		disabled?: boolean;
	};
	sort?: { key: string; order: "asc" | "desc" };
	onSortChange?: (sort: { key: string; order: "asc" | "desc" }) => void;
	statusFilter?: string;
	onStatusFilterChange?: (status: string) => void;
	priorityFilter?: string;
	onPriorityFilterChange?: (priority: string) => void;
}

export function AppTable<T>({
	toolBar,
	columns,
	data,
	loading = false,
	searchableKeys = [],
	onRowClick,
	onFilter,
	addButton,
	csvButton,
	sort,
	onSortChange,
	statusFilter: externalStatusFilter,
	onStatusFilterChange,
	priorityFilter: externalPriorityFilter,
	onPriorityFilterChange,
}: TableProps<T>) {
	const [reload, setReload] = useState(false);
	const [filteredData, setFilteredData] = useState<T[]>(data);
	const [searchQuery, setSearchQuery] = useState("");
	const [internalStatusFilter, setInternalStatusFilter] = useState<string>("進捗状況:すべて");
	const statusFilter = externalStatusFilter ?? internalStatusFilter;
	const [internalPriorityFilter, setInternalPriorityFilter] = useState<string>("優先度:すべて");
	const priorityFilter = externalPriorityFilter ?? internalPriorityFilter;
	const [currentPage, setCurrentPage] = useState(1);
	const { itemsPerPage, setItemsPerPage } = useTableStore();

	// sort, onSortChangeがpropsで渡ってきたらそれを使う
	// そうでなければuseStateでローカル管理
	const [localSort, setLocalSort] = useState({ key: "taskId", order: "asc" });
	const currentSort = sort ?? localSort;
	const handleSortChange = (newSort: {
		key: string;
		order: "asc" | "desc";
	}) => {
		if (onSortChange) {
			onSortChange(newSort);
		} else {
			setLocalSort(newSort);
		}
	};

	const handleStatusFilterChange = (newStatus: string) => {
		if (onStatusFilterChange) {
			onStatusFilterChange(newStatus);
		} else {
			setInternalStatusFilter(newStatus);
		}
	};

	const handlePriorityFilterChange = (newPriority: string) => {
		if (onPriorityFilterChange) {
			onPriorityFilterChange(newPriority);
		} else {
			setInternalPriorityFilter(newPriority);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setFilteredData(data);
				setReload(true);
			} catch (error) {
				console.error("データの取得に失敗しました:", error);
			}
		};

		fetchData();
	}, [data]);

	// 検索、フィルタリング、ソートを適用
	useEffect(() => {
		let result = [...data];

		// カスタムフィルター処理
		if (onFilter) {
			result = onFilter(result, searchQuery, statusFilter, priorityFilter);
		} else {
			// デフォルトの検索フィルタリング
			if (searchQuery) {
				result = result.filter((item) =>
					searchableKeys.some((key) => {
						const value = item[key];

						// 値が存在しない場合は検索対象から除外
						if (value == null) return false;

						// 日付型の場合は文字列に変換
						if (value instanceof Date) {
							return value
								.toLocaleDateString()
								.toLowerCase()
								.includes(searchQuery.toLowerCase());
						}

						// 数値型の場合は文字列に変換
						if (typeof value === "number") {
							return value
								.toString()
								.toLowerCase()
								.includes(searchQuery.toLowerCase());
						}

						// 文字列型の場合はそのまま検索
						if (typeof value === "string") {
							return value.toLowerCase().includes(searchQuery.toLowerCase());
						}

						// その他の型の場合は文字列に変換して検索
						return String(value)
							.toLowerCase()
							.includes(searchQuery.toLowerCase());
					}),
				);
			}
		}

		// ソート
		if (currentSort) {
			result.sort((a, b) => {
				const aValue = a[currentSort.key as keyof T];
				const bValue = b[currentSort.key as keyof T];

				// undefined/null を考慮
				if (aValue == null) return 1;
				if (bValue == null) return -1;

				if (aValue < bValue) {
					return currentSort.order === "asc" ? -1 : 1;
				}
				if (aValue > bValue) {
					return currentSort.order === "asc" ? 1 : -1;
				}
				return 0;
			});
		}

		setFilteredData(result);
		setCurrentPage(1);
	}, [data, searchQuery, statusFilter, priorityFilter, currentSort, onFilter, searchableKeys]);

	// ページネーション
	const totalPages = getTotalPages(filteredData, itemsPerPage);
	const paginatedData = getPaginated(filteredData, currentPage, itemsPerPage);

	// 表示数が変更されたときにページを1に戻す
	useEffect(() => {
		setCurrentPage(1);
	}, []);

	if (loading) {
		return <ClubActivityTableSkeleton />;
	}

	return (
		<div className="space-y-4">
			{toolBar && (
				<div className="flex items-center justify-between gap-x-4">
					<div className="flex items-center gap-x-4">
						{toolBar?.researchBarPlaceholder && (
							<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
								<div className="relative flex-1">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder={toolBar.researchBarPlaceholder}
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-8"
									/>
									{searchQuery && (
										<Button
											variant="ghost"
											size="icon"
											className="absolute right-0 top-0 h-9 w-9"
											onClick={() => setSearchQuery("")}
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>
						)}
						{toolBar?.researchStatusFilter && (
							<div className="flex items-center gap-2">
								<Select value={statusFilter} onValueChange={handleStatusFilterChange}>
									<SelectTrigger className="w-[180px] border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/20">
										<div className="flex items-center gap-2">
											<Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
											<SelectValue placeholder="ステータスでフィルター" />
										</div>
									</SelectTrigger>
									<SelectContent>
										{toolBar.researchStatusFilter?.map((status) => (
											<SelectItem key={status} value={status}>
												{status}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
						{toolBar?.researchPriorityFilter && (
							<div className="flex items-center gap-2">
								<Select value={priorityFilter} onValueChange={handlePriorityFilterChange}>
									<SelectTrigger className="w-[180px] border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/20">
										<div className="flex items-center gap-2">
											<Filter className="h-4 w-4 text-orange-600 dark:text-orange-400" />
											<SelectValue placeholder="優先度でフィルター" />
										</div>
									</SelectTrigger>
									<SelectContent>
										{toolBar.researchPriorityFilter?.map((priority) => (
											<SelectItem key={priority} value={priority}>
												{priority}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
						{(searchQuery || statusFilter !== "進捗状況:すべて" || priorityFilter !== "優先度:すべて" || 
							(currentSort && (currentSort.key !== sort?.key || currentSort.order !== sort?.order))) && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setSearchQuery("");
									handleStatusFilterChange("進捗状況:すべて");
									handlePriorityFilterChange("優先度:すべて");
									if (sort) {
										handleSortChange({ key: sort.key, order: sort.order });
									}
								}}
							>
								<X className="h-3.5 w-3.5" />
								リセット
							</Button>
						)}

						<Select
							value={String(itemsPerPage)}
							onValueChange={(value) => setItemsPerPage(Number(value))}
						>
							<SelectTrigger className="w-[120px]">
								<SelectValue placeholder="表示件数" />
							</SelectTrigger>
							<SelectContent>
								{ITEMS_PER_PAGE_OPTIONS.map((option) => (
									<SelectItem key={option} value={String(option)}>
										{option}件
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{csvButton && (
							<CSVButton
								text={csvButton.text}
								onClick={csvButton.onClick}
								className={csvButton.className}
								disabled={csvButton.disabled}
							/>
						)}
					</div>

					<div className="flex items-center gap-2">
						{addButton && (
							<AddButton
								text={addButton.text}
								onClick={addButton.onClick}
								className={addButton.className}
							/>
						)}
					</div>
				</div>
			)}

			<div className="relative">
				<div className="max-h-[67svh] overflow-auto">
					<Table>
						<TableHeader className="bg-background sticky top-0">
							<TableRow>
								{columns.map((column) => {
									const isSorted = currentSort?.key === column.key;
									const sortIcon = isSorted ? (
										currentSort.order === "asc" ? (
											<ChevronUp className="ml-1 h-4 w-4" />
										) : (
											<ChevronDown className="ml-1 h-4 w-4" />
										)
									) : (
										column.sortable && (
											<ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
										)
									);

									const className = [
										"cursor-pointer hover:bg-muted/50",
										column.hide === "md" ? "hidden md:table-cell" : "",
										column.hide === "lg" ? "hidden lg:table-cell" : "",
										column.align === "right" ? "text-right" : "",
									]
										.filter(Boolean)
										.join(" ");

									return (
										<TableHead
											key={column.key as string}
											className={className}
											onClick={
												column.sortable
													? () =>
															handleSortChange({
																key: column.key as string,
																order: currentSort.order === "asc" ? "desc" : "asc",
															})
													: undefined
											}
										>
											{sortIcon ? (
												<div className="flex items-center">
													{column.title}
													{sortIcon}
												</div>
											) : (
												<>{column.title}</>
											)}
										</TableHead>
									);
								})}
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								Array.from({ length: 5 }).map((_, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									<TableRow key={index}>
										{columns.map((column) => (
											<TableCell key={String(column.key)}>
												<Skeleton className="h-4 w-[100px]" />
											</TableCell>
										))}
									</TableRow>
								))
							) : paginatedData.length === 0 ? (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										検索条件に一致するデータがありません
									</TableCell>
								</TableRow>
							) : (
								paginatedData.map((row, index) => (
									<TableRow
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										key={index}
										className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
										onClick={() => onRowClick?.(row)}
									>
										{columns.map((column) => (
											<TableCellItem
												key={column.key as string}
												value={row[column.key as keyof T]}
												render={column.render}
												row={row}
											/>
										))}
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
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
}
