"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getClubActivity } from "@/actions/club-activity";
import { ClubActivity } from "@/types";
import { useRouter } from "next/navigation";

export const ClubActivityList = () => {
  const [activities, setActivities] = useState<ClubActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getClubActivity();
        setActivities(data);
      } catch (error) {
        console.error("部活動データの取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activities.map((activity) => (
        <Card
          key={activity.id}
          className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(`/adixi-public/club-activity/${activity.id}`)}
        >
          <CardHeader>
            <CardTitle className="text-xl">{activity.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{activity.description}</p>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <span>活動タイプ: {activity.activityType}</span>
              <span>メンバー数: {activity.memberCount}名</span>
              <span>場所: {activity.location}</span>
              {activity.detail && (
                <p className="mt-2 text-sm text-gray-600">{activity.detail}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
