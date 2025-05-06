"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Pencil, Trash2 } from "lucide-react";
import { useQAStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddButton } from "@/components/add-button";

const categories = ["IT", "人事", "経理", "総務", "その他"];

export default function AdminQAPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("全て");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQA, setEditingQA] = useState<any>(null);
  const itemsPerPage = 5;

  const { qaItems, updateQA, deleteQA } = useQAStore();

  // フィルタリングとページネーション
  const filteredQA = qaItems.filter((item) => {
    const matchesSearch =
      item.question.includes(searchTerm) ||
      (item.answer && item.answer.includes(searchTerm)) ||
      item.id.includes(searchTerm);
    const matchesCategory = categoryFilter === "全て" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredQA.length / itemsPerPage);
  const currentItems = filteredQA.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // カテゴリに応じたバッジの色を返す関数
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "IT":
        return "default";
      case "人事":
        return "secondary";
      case "経理":
        return "destructive";
      case "総務":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleEdit = (qa: any) => {
    setEditingQA(qa);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("このQAを削除してもよろしいですか？")) {
      deleteQA(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQA) {
      updateQA(editingQA.id, editingQA);
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">QA管理</h1>
        <AddButton text="新規QA登録" />
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingQA ? "QAを編集" : "新規QA登録"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">質問</Label>
                <Textarea
                  id="question"
                  value={editingQA?.question || ""}
                  onChange={(e) => setEditingQA({ ...editingQA, question: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">回答</Label>
                <Textarea
                  id="answer"
                  value={editingQA?.answer || ""}
                  onChange={(e) => setEditingQA({ ...editingQA, answer: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">カテゴリ</Label>
                <Select
                  value={editingQA?.category || ""}
                  onValueChange={(value) => setEditingQA({ ...editingQA, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit">保存</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

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
              <SelectItem value="全て">全て</SelectItem>
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
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex w-full flex-col items-start gap-1 text-left sm:flex-row sm:items-center">
                    <span className="mr-2 font-medium">{item.id}</span>
                    <span className="flex-1">{item.question}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getCategoryBadgeVariant(item.category)}>{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-md bg-muted/50 p-4">{item.answer}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="rounded-md border p-8 text-center">該当するQAがありません</div>
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
}
