"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  Filter,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClubModalForm } from "@/components/app-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getClubActivity, createClubActivity } from "@/actions/club-activity";
import { ClubActivity, ClubStatus } from "@/types";
import { statusConfig } from "@/config";
import { deleteClubActivity } from "@/actions/club-activity";


export const ClubTable = () => {
  const router = useRouter();
  const [clubs, setClubs] = useState<ClubActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredClubs, setFilteredClubs] = useState<ClubActivity[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentClub, setCurrentClub] = useState<ClubActivity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ClubActivity;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await getClubActivity();
        setClubs(data);
        setFilteredClubs(data);
      } catch (error) {
        console.error("部活動データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // 検索、フィルタリング、ソートを適用
  useEffect(() => {
    let result = [...clubs];
    // 検索フィルタリング
    if (searchTerm) {
      result = result.filter(
        (club) =>
          club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ステータスフィルタリング
    if (statusFilter !== "all") {
      result = result.filter((club) => club.status === statusFilter);
    }

    // ソート
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredClubs(result);
    setCurrentPage(1);
  }, [clubs, searchTerm, statusFilter, sortConfig]);

  // ソート処理
  const handleSort = (key: keyof ClubActivity) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 削除処理
  const handleDelete = async (id: string) => {
    setIsDeleteDialogOpen(false);
    setFilteredClubs(filteredClubs.filter((club) => club.id !== id));
    await deleteClubActivity(id);
    setClubs(clubs.filter((club) => club.id !== id));
  };

  // 編集処理
  const handleEdit = (club: ClubActivity, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentClub(club);
    setIsEditModalOpen(true);
  };

  // 編集送信処理
  const handleEditSubmit = (data: Omit<ClubActivity, "id" | "createdAt" | "updatedAt">) => {
    if (currentClub) {
      setClubs(
        clubs.map((club) =>
          club.id === currentClub.id
            ? {
                ...club,
                ...data,
              }
            : club
          )
      );
      setIsEditModalOpen(false);
      setCurrentClub(null);
    }
  };

  // 行クリック処理
  const handleRowClick = (clubId: string) => {
    router.push(`/club-activity/${clubId}`);
  };

  // ページネーション
  const totalPages = Math.ceil(filteredClubs.length / itemsPerPage);
  const paginatedClubs = filteredClubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-4">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  部活動名
                  {sortConfig?.key === "name" ? (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("leader")}>
                <div className="flex items-center">
                  部長
                  {sortConfig?.key === "leader" ? (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">活動内容</TableHead>
              <TableHead
                className="hidden lg:table-cell cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("memberCount")}
              >
                <div className="flex items-center">
                  メンバー数
                  {sortConfig?.key === "memberCount" ? (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  ステータス
                  {sortConfig?.key === "status" ? (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  検索条件に一致する部活動がありません
                </TableCell>
              </TableRow>
            ) : (
              paginatedClubs.map((club) => (
                <TableRow
                  key={club.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(club.id)}
                >
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell>{club.leader}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="line-clamp-1">{club.description}</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>{club.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{club.memberCount}人</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant="outline"
                      className={cn("font-normal", statusConfig[club.status as keyof typeof statusConfig].color)}
                    >
                      {statusConfig[club.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipContent>
                            <p>詳細を表示</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">メニューを開く</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>アクション</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => handleEdit(club, e)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(club.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
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
            {filteredClubs.length}件中 {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredClubs.length)}件を表示
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

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>部活動の削除</DialogTitle>
            <DialogDescription>この部活動を削除してもよろしいですか？この操作は元に戻せません。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集モーダル */}
      {currentClub && (
        <ClubModalForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentClub(null);
          }}
          onSubmit={async (data) => {
            await handleEditSubmit(data);
            setIsEditModalOpen(false);
            setCurrentClub(null);
          }}
          defaultValues={currentClub}
        />
      )}
    </div>
  );
}
