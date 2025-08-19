"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Link, StickyNote, FolderOpen, Calendar, User } from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  type: "file" | "url" | "note";
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  priority: "high" | "medium" | "low";
}

const mockDocuments: DocumentItem[] = [
  {
    id: "1",
    title: "社員手帳2024年版",
    description: "新入社員向けの社員手帳。福利厚生、就業規則、各種申請書類の説明が含まれています。",
    type: "file",
    category: "人事・総務",
    tags: ["人事", "総務", "新入社員", "手帳"],
    createdBy: "田中 太郎",
    createdAt: "2024-01-15",
    lastUpdated: "2024-01-15",
    priority: "high"
  },
  {
    id: "2",
    title: "Google Drive共有フォルダ",
    description: "プロジェクト関連の資料、テンプレート、過去の事例などを格納している共有フォルダです。",
    type: "url",
    category: "プロジェクト管理",
    tags: ["共有", "テンプレート", "事例", "Google Drive"],
    createdBy: "佐藤 花子",
    createdAt: "2024-01-10",
    lastUpdated: "2024-01-20",
    priority: "high"
  },
  {
    id: "3",
    title: "月次報告書テンプレート",
    description: "各部署の月次報告書作成時に使用するテンプレート。フォーマット統一のため必ず使用してください。",
    type: "file",
    category: "報告書",
    tags: ["テンプレート", "月次報告", "フォーマット"],
    createdBy: "山田 次郎",
    createdAt: "2024-01-05",
    lastUpdated: "2024-01-18",
    priority: "medium"
  },
  {
    id: "4",
    title: "社内WiFi設定方法",
    description: "新入社員やゲスト向けのWiFi接続方法。SSID、パスワード、接続手順を記載。",
    type: "note",
    category: "IT・インフラ",
    tags: ["WiFi", "接続", "IT", "新入社員"],
    createdBy: "IT部門",
    createdAt: "2024-01-12",
    lastUpdated: "2024-01-12",
    priority: "medium"
  },
  {
    id: "5",
    title: "Slackチャンネル一覧",
    description: "社内で使用しているSlackチャンネルの一覧と用途説明。適切なチャンネルを選択してコミュニケーションを取ってください。",
    type: "note",
    category: "コミュニケーション",
    tags: ["Slack", "チャンネル", "コミュニケーション"],
    createdBy: "コミュニケーション担当",
    createdAt: "2024-01-08",
    lastUpdated: "2024-01-15",
    priority: "low"
  }
];

const categories = [
  "人事・総務",
  "プロジェクト管理", 
  "報告書",
  "IT・インフラ",
  "コミュニケーション",
  "営業・マーケティング",
  "開発・技術",
  "その他"
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || !selectedCategory || doc.category === selectedCategory;
    const matchesType = selectedType === "all" || !selectedType || doc.type === selectedType;
    const matchesPriority = selectedPriority === "all" || !selectedPriority || doc.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesType && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "file": return <FileText className="w-4 h-4" />;
      case "url": return <Link className="w-4 h-4" />;
      case "note": return <StickyNote className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "file": return "bg-blue-100 text-blue-800 border-blue-200";
      case "url": return "bg-purple-100 text-purple-800 border-purple-200";
      case "note": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">資料管理</h1>
          <p className="text-muted-foreground mt-2">
            社内の重要なファイル、URL、メモなどを一元管理します
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新規追加
        </Button>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
          <CardDescription>
            必要な資料を素早く見つけることができます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="タイトル、説明、タグで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのタイプ</SelectItem>
                <SelectItem value="file">ファイル</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="note">メモ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="優先度を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての優先度</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総資料数</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDocuments.length}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ファイル</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDocuments.filter(doc => doc.type === "file").length}件
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">URL</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDocuments.filter(doc => doc.type === "url").length}件
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">メモ</CardTitle>
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDocuments.filter(doc => doc.type === "note").length}件
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 資料一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>資料一覧</CardTitle>
          <CardDescription>
            検索結果: {filteredDocuments.length}件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(doc.type)}`}>
                        {getTypeIcon(doc.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{doc.title}</h3>
                        <p className="text-muted-foreground">{doc.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getPriorityColor(doc.priority)}>
                        {doc.priority === "high" ? "高優先" : doc.priority === "medium" ? "中優先" : "低優先"}
                      </Badge>
                      <Badge variant="secondary">{doc.category}</Badge>
                      {doc.tags.map((tag) => (
                        <Badge key={`${doc.id}-${tag}`} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {doc.createdBy}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {doc.lastUpdated}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    詳細表示
                  </Button>
                  <Button variant="outline" size="sm">
                    編集
                  </Button>
                  <Button variant="outline" size="sm">
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
