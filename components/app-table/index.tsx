"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  Filter,
  X,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTotalPages, getPaginated } from "@/lib/utils";
import { ClubActivityTableSkeleton } from "@/components/app-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export type SortConfig<T> = {
  key: keyof T;
  direction: "asc" | "desc";
}

export interface TableColumn<T> {
  key: Extract<keyof T, string> | "action";
  title: string;
  sortable?: boolean;
  hide?: "xs" | "sm" | "md" | "lg";
  align?: "left" | "right";
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableCell<T> {
  value: T[keyof T];
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  row: T;
}

const TableCellItem = <T,>({ value, render, row }: TableCell<T>) => {
  return (
    <TableCell>
      {render ? render(value, row) : String(value)}
    </TableCell>
  )
}

interface TableProps<T> {
  toolBar?: {
    researchBarPlaceholder?: string;
    researchStatusFilter?: string[];
  };
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  searchableKeys?: (keyof T)[];
  onRowClick?: (row: T) => void;
  onFilter?: (data: T[], searchQuery: string, statusFilter: string) => T[];
}

export function AppTable<T>({
  toolBar,
  columns,
  data,
  loading = false,
  searchableKeys = [],
  onRowClick,
  onFilter,
}: TableProps<T>) {
  const [reload, setReload] = useState(false);
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("すべて");
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      result = onFilter(result, searchQuery, statusFilter);
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
              return value.toLocaleDateString().toLowerCase().includes(searchQuery.toLowerCase());
            }
            
            // 数値型の場合は文字列に変換
            if (typeof value === 'number') {
              return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
            }
            
            // 文字列型の場合はそのまま検索
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchQuery.toLowerCase());
            }
            
            // その他の型の場合は文字列に変換して検索
            return String(value).toLowerCase().includes(searchQuery.toLowerCase());
          })
        );
      }
    }

    // ソート
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
    
        // undefined/null を考慮
        if (aValue == null) return 1;
        if (bValue == null) return -1;
    
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [data, searchQuery, statusFilter, sortConfig, onFilter, searchableKeys]);

  // ソート処理
  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ページネーション
  const totalPages = getTotalPages(filteredData, itemsPerPage);
  const paginatedData = getPaginated(filteredData, currentPage, itemsPerPage);

  if (loading) {
    return (
      <ClubActivityTableSkeleton />
    );
  }

  return (
    <div className="space-y-4">
      {toolBar && (
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="ステータスでフィルター" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {toolBar.researchStatusFilter?.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || statusFilter !== "すべて" || sortConfig) && (
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("すべて");
                  setSortConfig(null);
                }}>
                  <X className="h-3.5 w-3.5" />
                  リセット
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const isSorted = sortConfig?.key === column.key;
              const sortIcon = isSorted ? (
                sortConfig.direction === "asc" ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-1 h-4 w-4" />
                )
              ) : (
                column.sortable && <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
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
                  onClick={column.sortable ? () => handleSort(column.key as keyof T) : undefined}
                >
                  {sortIcon ? (
                    <div className="flex items-center">
                      {column.title}
                      {sortIcon}
                    </div>
                  ) : (
                    <>
                      {column.title}
                    </>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
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

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredData.length}件中 {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredData.length)}件を表示
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              前へ
            </Button>
            <div className="flex items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
