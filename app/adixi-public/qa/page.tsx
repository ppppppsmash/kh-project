"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/hooks/use-modal";
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
import { Search, Filter } from "lucide-react";
import { AddButton } from "@/components/add-button";
import { useQuery } from "@tanstack/react-query";
import { getQA } from "@/actions/qa";
import { format } from "date-fns";
import { QaModalForm } from "@/components/app-modal/qa-modal-form";
import { getCategoryBadgeVariant } from "@/components/app-accordion-table/render/QAItem";
import { useSubmit } from "@/lib/submitHandler";
import { Qa } from "@/types";
import { CustomToast } from "@/components/ui/toast";
import type { QaFormValues } from "@/lib/validations";
import { createQA } from "@/actions/qa";

const categories = ["現場", "経費", "福利厚生", "休暇", "週報", "その他"];

export default function QAPage() {
  const queryClient = useQueryClient();
  const { isOpen, openModal, closeModal } = useModal();
  const [currentData, setCurrentData] = useState<Qa | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("全て")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: qaItems = [] } = useQuery({
    queryKey: ["qa"],
    queryFn: getQA,
  });

  // 回答済みの質問のみをフィルタリング
  const answeredQAItems = qaItems.filter((item) => item.answer)

  // フィルタリングとページネーション
  const filteredQA = answeredQAItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.answer && item.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.questionCode && item.questionCode.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "全て" || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredQA.length / itemsPerPage)
  const currentItems = filteredQA.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleAdd = () => {
    setCurrentData(null);
    openModal();
  };

  const { handleSubmit } = useSubmit<Qa, QaFormValues>({
    action: async (data) => {
      await createQA({
        question: data.question,
        answer: data.answer || '',
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
    },
    onError: () => {
      CustomToast.error("QAの保存に失敗しました");
    },
  });

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">QA一覧</h1>
        <AddButton text="質問を投稿" onClick={handleAdd} />
      </div>

      <QaModalForm
        type="public"
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={currentData}
      />

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
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex w-full flex-col items-start gap-1 text-left sm:flex-row sm:items-center">
                    <span className="mr-2 font-medium">{item.questionCode || item.id}</span>
                    <span className="flex-1">{item.question}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getCategoryBadgeVariant(item.category)}>{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(item.createdAt, "yyyy-MM-dd")}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-md bg-muted/50 p-4">
                    <p className="mb-2 text-sm text-muted-foreground">回答者: {item.answeredBy}</p>
                    {item.answer}
                  </div>
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
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage(i + 1)
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
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
