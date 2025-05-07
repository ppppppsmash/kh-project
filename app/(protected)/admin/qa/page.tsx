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
import { QaModalForm } from "@/components/app-modal/qa-modal-form";
import { getQA, createQA, updateQA, deleteQA } from "@/actions/qa";
import { useSubmit } from "@/lib/submitHandler";
import { CustomToast } from "@/components/ui/toast";
import { useModal } from "@/hooks/use-modal";
import type { QAItem } from "@/lib/store";
import { useQueryClient } from "@tanstack/react-query";
import { useGetQa } from "@/components/app-table/hooks/use-table-data";
import { AccordionTable, AccordionTableColumn } from "@/components/app-accordion-table";
import { renderQa } from "@/components/app-accordion-table/render/QAItem";
import type { QaFormValues } from "@/lib/validations";

const categories = ["IT", "人事", "経理", "総務", "その他"];

export default function AdminQAPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const { isOpen, openModal, closeModal } = useModal();
  const [categoryFilter, setCategoryFilter] = useState("全て");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentData, setCurrentData] = useState<QAItem | null>(null);
  const itemsPerPage = 5;

  const { data: qaItems, isLoading } = useGetQa();

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

  const handleEdit = (item: QAItem) => {
    setCurrentData(item);
    openModal();
  };

  const handleDelete = (item: QAItem) => {
    if (window.confirm("このQAを削除してもよろしいですか？")) {
      deleteQA(item.id);
      queryClient.invalidateQueries({ queryKey: ["qa"] });
    }
  };

  const { handleSubmit } = useSubmit<QAItem, QaFormValues>({
    action: async (data) => {
      if (currentData) {
        await updateQA(currentData.id, {
          question: data.question,
          answer: data.answer || '',
          category: data.category,
          date: data.date,
          status: data.status,
          askedBy: data.askedBy,
        });
      } else {
        await createQA({
          question: data.question,
          answer: data.answer || '',
          category: data.category,
          date: new Date().toISOString().split('T')[0],
          status: "pending",
          askedBy: "管理者",
        });
      }
    },
    onSuccess: () => {
      closeModal();
      CustomToast.success(currentData ? "QAを更新しました" : "QAを登録しました");
      setCurrentData(null);
      queryClient.invalidateQueries({ queryKey: ["qa"] });
    },
    onError: () => {
      CustomToast.error("QAの保存に失敗しました");
    },
  });

  const handleAdd = () => {
    setCurrentData(null);
    openModal();
  };

  const columns: AccordionTableColumn<QAItem>[] = [
    { key: "id", label: "ID" },
    { key: "question", label: "質問" },
    {
      key: "category",
      label: "カテゴリー",
      render: (item) => (
        <Badge variant={getCategoryBadgeVariant(item.category)}>
          {item.category}
        </Badge>
      ),
    },
    {
      key: "date",
      label: "日付",
      render: (item) => (
        <span className="text-xs text-muted-foreground">{item.date}</span>
      ),
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">QA管理</h1>
        <AddButton text="新規QA登録" onClick={handleAdd} />
      </div>

      <QaModalForm
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={currentData}
      />

      <AccordionTable
        data={qaItems || []}
        columns={renderQa({
          onEdit: handleEdit,
          onDelete: handleDelete,
        })}
        idField="id"
        searchFields={["question", "answer"]}
        categoryField="category"
        categories={categories}
        renderContent={(item) => (
          <div className="rounded-md bg-muted/50 p-4">{item.answer}</div>
        )}
      />

      {/* <div className="mb-6 flex flex-col gap-4 md:flex-row">
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
      </div> */}

      {/* <div className="space-y-4">
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
                          handleDelete(item);
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
      )} */}
    </div>
  );
}
