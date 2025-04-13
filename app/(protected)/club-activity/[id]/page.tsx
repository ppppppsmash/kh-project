import { getClubActivityById } from "@/actions/club-activity";
import { formatDate } from "@/lib/utils";
import { ShareButton } from "./_components/share-button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ClubActivitySlugPage({ params }: Props) {
  const { id } = await params;
  const club = await getClubActivityById(id);

  if (!club) {
    return <div className="container mx-auto">データが見つかりませんでした</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{club.name}</h2>
        <div className="flex items-center gap-2">
          <ShareButton id={id} dir="club-activity" />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <h3 className="text-lg font-bold">活動内容</h3>
        <p>{club.description}</p>
        <h3 className="text-lg font-bold">部長</h3>
        <p>{club.leader}</p>
        <h3 className="text-lg font-bold">メンバー数</h3>
        <p>{club.memberCount}</p>
        <h3 className="text-lg font-bold">活動種類</h3>
        <p>{club.activityType}</p>
        <h3 className="text-lg font-bold">ステータス</h3>
        <p>{club.status}</p>
        <h3 className="text-lg font-bold">活動場所</h3>
        <p>{club.location}</p>
        <h3 className="text-lg font-bold">活動詳細</h3>
        <p>{club.detail}</p>
        <h3 className="text-lg font-bold">作成日</h3>
        <p>{formatDate(club.createdAt)}</p>
        <h3 className="text-lg font-bold">更新日</h3>
        <p>{formatDate(club.updatedAt)}</p>
      </div>
    </div>
  );
}
