"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Calendar, Users } from "lucide-react";
import { getClubActivity } from "@/actions/club-activity";
import { useEffect, useState } from "react";
import type { ClubActivity, ClubStatus } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [clubs, setClubs] = useState<ClubActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await getClubActivity();
        const formattedData = data.map(({ status, ...rest }) => ({
          ...rest,
          status: status as ClubStatus,
        }));
        setClubs(formattedData as ClubActivity[]);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const getStatusCount = (status: ClubStatus) => {
    return clubs.filter((club) => club.status === status).length;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">ダッシュボード</h2>
        <div className="text-sm text-muted-foreground">
          ようこそ、{session?.user?.name}さん
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
              <div className="text-2xl font-bold">{clubs.length}</div>
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
