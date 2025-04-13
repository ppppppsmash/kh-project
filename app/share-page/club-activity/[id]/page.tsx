import { getClubActivityById } from "@/actions/club-activity";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default async function SharedClubActivityPage({
  params
}: { params: { id: string } }) {
  const { id } = params;
  const club = await getClubActivityById(id);

  if (!club) return notFound();

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">権限なし共有ページ！</h1>
      <h1 className="text-3xl font-bold mb-2">部活動：{club.name}</h1>
      <p>リーダー: {club.leader}</p>
      <p>メンバー数: {club.memberCount}</p>
      {club.description && <p className="mt-4">{club.description}</p>}
      <p>活動場所: {club.location}</p>
      <p>活動詳細: {club.detail}</p>
      <p>活動種類: {club.activityType}</p>
      <p>ステータス: {club.status}</p>
      <p>作成日: {formatDate(club.createdAt)}</p>
      <p>更新日: {formatDate(club.updatedAt)}</p>
    </main>
  );
}
