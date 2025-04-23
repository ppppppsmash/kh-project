"use client";

import { useEffect, useState } from "react";
import { getClubActivityById } from "@/actions/club-activity";
import { ClubActivity, ClubStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ClubActivityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [activity, setActivity] = useState<ClubActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getClubActivityById(params.id);
        if (data) {
          setActivity({
            ...data,
            status: data.status as ClubStatus,
            description: data.description ?? undefined,
            activityType: data.activityType ?? undefined,
            location: data.location ?? undefined,
            detail: data.detail ?? undefined,
          });
        }
      } catch (error) {
        console.error("部活動データの取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-600">部活動が見つかりませんでした。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.back()}
      >
        戻る
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{activity.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">活動内容</h3>
            <p className="text-gray-600">{activity.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">基本情報</h3>
              <div className="space-y-2">
                <p><span className="font-medium">活動タイプ:</span> {activity.activityType}</p>
                <p><span className="font-medium">メンバー数:</span> {activity.memberCount}名</p>
                <p><span className="font-medium">場所:</span> {activity.location}</p>
                <p><span className="font-medium">ステータス:</span> {activity.status}</p>
              </div>
            </div>
            {activity.detail && (
              <div>
                <h3 className="text-lg font-semibold mb-2">詳細情報</h3>
                <p className="text-gray-600">{activity.detail}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
