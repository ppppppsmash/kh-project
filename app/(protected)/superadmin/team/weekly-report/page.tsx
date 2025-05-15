import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

// 仮の週報データ
const weeklyReports = [
	{
		id: 1,
		week: "2024年第15週",
		date: "2024/04/08 - 2024/04/14",
		achievements: ["プロジェクトAの基本機能実装完了", "デザインシステムの構築"],
		challenges: ["パフォーマンス最適化の必要性", "テストカバレッジの向上"],
		nextWeekGoals: ["新機能の開発開始", "コードレビューの強化"],
	},
];

export default function TeamWeeklyReportPage() {
	return (
		<div className="container mx-auto py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">週報</h1>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					新規週報作成
				</Button>
			</div>

			<Tabs defaultValue="all" className="w-full">
				<TabsList>
					<TabsTrigger value="all">すべて</TabsTrigger>
					<TabsTrigger value="my">自分の週報</TabsTrigger>
					<TabsTrigger value="team">チームの週報</TabsTrigger>
				</TabsList>
				<TabsContent value="all" className="mt-4">
					<div className="grid gap-4">
						<Card>
							<CardHeader>
								<CardTitle>山田太郎 - 2024年3月第1週</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									今週の進捗: プロジェクトAのフロントエンド実装を完了
								</p>
								<p className="text-sm text-muted-foreground mt-2">
									来週の予定: バックエンドAPIとの連携作業
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>佐藤花子 - 2024年3月第1週</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									今週の進捗: デザインシステムの構築
								</p>
								<p className="text-sm text-muted-foreground mt-2">
									来週の予定: コンポーネントライブラリの作成
								</p>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
				<TabsContent value="my">
					<div className="mt-4 text-center text-muted-foreground">
						自分の週報はまだありません
					</div>
				</TabsContent>
				<TabsContent value="team">
					<div className="mt-4 text-center text-muted-foreground">
						チームの週報はまだありません
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
