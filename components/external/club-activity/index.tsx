import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, User, Zap } from "lucide-react";

type ClubActivityShareProps = {
  id: string;
  name: string;
  description?: string;
  leader: string;
  memberCount: string;
  activityType?: string;
  status?: string;
  location?: string;
  detail?: string;
};

export const ClubActivityShare = ({ club }: { club: ClubActivityShareProps }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            基本情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">活動内容</h3>
            <p className="text-lg">{club.description}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">部長</h3>
            <p className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              {club.leader}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">メンバー数</h3>
            <p className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              {club.memberCount}人
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            活動詳細
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">活動種類</h3>
            <Badge variant="secondary">{club.activityType}</Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">ステータス</h3>
            <Badge variant={club.status === "active" ? "default" : "secondary"}>
              {club.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">活動場所</h3>
            <p className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {club.location}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">活動詳細</h3>
            <p className="text-lg">{club.detail}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
