"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { SortConfig } from "@/types";

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
    <TableCell className="cursor-pointer hover:bg-muted/50">
      {render ? render(value, row) : String(value)}
    </TableCell>
  )
}

interface TableProps<T extends { id: string }> {
  toolTip?: boolean;
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  searchableKeys?: (keyof T)[];
}

export function AppTable<T extends { id: string }>({
  toolTip = false,
  columns,
  data: initialData,
  loading: initialLoading = false,
  searchableKeys = [],
}: TableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const [reload, setReload] = useState(false);
  const [filteredData, setFilteredData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(initialLoading);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFilteredData(initialData);
        setReload(true);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reload]);

  // 検索、フィルタリング、ソートを適用
  useEffect(() => {
    let result = [...initialData];
    // 検索フィルタリング
    if (searchTerm && searchableKeys) {
      result = result.filter((v) =>
        searchableKeys.some((key) => {
          const value = v[key];
          return (
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }

    // ステータスフィルタリング
    if (statusFilter !== "all") {
      result = result.filter((data) => (data as any).status === statusFilter);
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
  }, [initialData, searchTerm, statusFilter, sortConfig]);

  // ソート処理
  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 行クリック処理
  const handleRowClick = (id: string) => {
    // router.push(`/club-activity/${id}`);
    router.push(`${pathname}/${id}`);
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
      {toolTip && (
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="部活動や部長を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="ステータスでフィルター" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {/* TODO: リファクタ−予定 */}
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="active">活動中</SelectItem>
              <SelectItem value="inactive">休止中</SelectItem>
              <SelectItem value="pending">承認待ち</SelectItem>
            </SelectContent>
          </Select>
          {(searchTerm || statusFilter !== "all" || sortConfig) && (
            <Button variant="ghost" size="sm" onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setSortConfig(null);
            }}>
              <X className="h-4 w-4" />
              リセット
            </Button>
          )}
        </div>
      </div>
      )}

      <div className="rounded-md border">
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
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  検索条件に一致するデータがありません
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((data) => (
                <TableRow
                  key={data.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(data.id)}
                >
                  {columns.map((column) => (
                  <TableCellItem
                    key={column.key as string}
                    value={data[column.key as keyof T]}
                    render={column.render}
                    row={data}
                  />
                ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
