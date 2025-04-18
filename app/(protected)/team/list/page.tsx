import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddButton } from "@/components/add-button";

// 仮のチームメンバーデータ

export default function TeamListPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">チーム一覧</h2>
        <AddButton text="新規チーム作成" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Aチーム</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">メンバー数: 5人</p>
            <p className="text-sm text-muted-foreground">リーダー: A</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bチーム</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">メンバー数: 3人</p>
            <p className="text-sm text-muted-foreground">リーダー: B</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 