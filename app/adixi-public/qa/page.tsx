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
import { Search, Filter } from "lucide-react";
import { useQAStore } from "@/lib/store";
import { AddButton } from "@/components/add-button";

const categories = ["全て", "IT", "人事", "経理", "総務", "その他"]

export default function QAPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("全て")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const { qaItems } = useQAStore()

  // 回答済みの質問のみをフィルタリング
  const answeredQAItems = qaItems.filter((item) => item.status === "answered")

  // フィルタリングとページネーション
  const filteredQA = answeredQAItems.filter((item) => {
    const matchesSearch =
      item.question.includes(searchTerm) ||
      (item.answer && item.answer.includes(searchTerm)) ||
      item.id.includes(searchTerm)
    const matchesCategory = categoryFilter === "全て" || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredQA.length / itemsPerPage)
  const currentItems = filteredQA.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // カテゴリに応じたバッジの色を返す関数
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "IT":
        return "default"
      case "人事":
        return "secondary"
      case "経理":
        return "destructive"
      case "総務":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">QA一覧</h1>
        <AddButton text="質問を投稿" />
      </div>

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
                    <span className="mr-2 font-medium">{item.id}</span>
                    <span className="flex-1">{item.question}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getCategoryBadgeVariant(item.category)}>{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
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
