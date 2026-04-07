"use client";

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

interface TablePaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
}

export const TablePagination = ({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
}: TablePaginationProps) => {
	if (totalPages <= 0) return null;

	return (
		<div className="flex items-center justify-between mt-4">
			<div className="text-sm text-muted-foreground">
				{totalItems}件中 {(currentPage - 1) * itemsPerPage + 1}-
				{Math.min(currentPage * itemsPerPage, totalItems)}件を表示
			</div>
			<div className="flex items-center space-x-2">
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
							/>
						</PaginationItem>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map(
							(page) => (
								<PaginationItem key={page}>
									<PaginationLink
										isActive={page === currentPage}
										onClick={() => onPageChange(page)}
									>
										{page}
									</PaginationLink>
								</PaginationItem>
							),
						)}
						<PaginationItem>
							<PaginationNext
								onClick={() =>
									onPageChange(Math.min(currentPage + 1, totalPages))
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
};
