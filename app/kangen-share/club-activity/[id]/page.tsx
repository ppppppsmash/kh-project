import { getClubActivityById } from "@/actions/club-activity";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { ClubActivityShare } from "@/components/kangen-share/club-activity";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SharedClubActivityPage({ params }: Props) {
  const { id } = await params;
  const club = await getClubActivityById(id);

  if (!club) return notFound();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Badge variant="outline">共有ページ</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{club.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>作成日: {formatDate(club.createdAt)}</span>
          </div>
        </div>
      </div>

      <ClubActivityShare club={club} />
    </div>
  );
}
