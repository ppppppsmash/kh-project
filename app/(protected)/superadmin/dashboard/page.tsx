"use client";

import type { ClubFormValues } from "@/lib/validations";
import Link from "next/link";
import { IconExternalLink } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Calendar, Users, User, Link as LinkIcon } from "lucide-react";
import { useGetUserActivity, useGetClubActivities } from "@/components/app-table/hooks/use-table-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: userActivity, isLoading: isUserActivityLoading } = useGetUserActivity();
  const { data: clubs } = useGetClubActivities();

  const getStatusCount = (status: ClubFormValues["status"]) => {
    return clubs?.filter((club) => club.status === status).length ?? 0;
  };

  if (isUserActivityLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">ダッシュボード</h2>
          <div className="text-sm text-muted-foreground">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">ダッシュボード</h2>
        <div className="text-sm text-muted-foreground">
          ようこそ、{session?.user?.name}さん
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-fit" asChild>
            <Link target="_blank" href="/adixi-public/qa/">
              <IconExternalLink className="w-4 h-4" />
              リーダー向けのQAページ
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">ユーザ操作履歴</h3>

        <div className="flex flex-col gap-2">
          {userActivity?.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 text-sm">
              <div className="flex gap-4 items-center justify-between w-full">
                <p className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">{activity.userName}</span>
                  <span className="text-muted-foreground ml-4">
                  {activity.action === "login" ? "ログイン" : "ログアウト"}
                </span>
                </p>
              </div>
              <p className="text-muted-foreground text-xs text-nowrap">{activity.createdAt?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">部活動</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活動中</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getStatusCount("active")}</div>
              <p className="text-xs text-muted-foreground">
                現在活動中
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">休止中</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getStatusCount("inactive")}</div>
              <p className="text-xs text-muted-foreground">
                一時休止中
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getStatusCount("pending")}</div>
              <p className="text-xs text-muted-foreground">
                承認待ち
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総数</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clubs?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                全部活動
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
