"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Pencil,
  Trash2,
} from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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
}

export const AccordionTable = <T extends Record<string, any>>({
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
}: AccordionTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("全て");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((item) => {
    const matchesSearch = searchFields.some((field) =>
      String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesCategory = categoryFilter === "全て" || 
      (categoryField && String(item[categoryField]).toLowerCase().includes(categoryFilter.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="mb-6 flex flex-col gap-4">
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
      </div>

      <div className="space-y-4">
        {currentItems.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {currentItems.map((item) => (
              <AccordionItem key={String(item[idField])} value={String(item[idField])}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex w-full flex-col items-start gap-x-4 text-left sm:flex-row sm:items-center">
                    {columns.map((column) => (
                      <div key={String(column.key)} className="flex-1">
                        {column.render ? column.render(item) : String(item[column.key])}
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
                <AccordionContent>
                  {renderContent(item)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="rounded-md border p-8 text-center text-sm">該当するデータがありません</div>
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
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
