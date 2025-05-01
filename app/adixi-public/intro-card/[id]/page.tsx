import { getIntroCardById } from "@/actions/intro-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
type Props = {
  params: Promise<{ id: string }>;
};

export default async function IntroCardPage({ params }: Props) {
  const { id } = await params;
  const member = await getIntroCardById(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {member.name} 自己紹介
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.name}
                width={200}
                height={200}
                className="rounded-md"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-500">事業部</h3>
              <p>{member.department}</p>
            </div>

            {member.freeText && (
              <div>
                <h3 className="font-semibold text-gray-500">自由記載欄</h3>
                <p className="whitespace-pre-line">{member.freeText}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-500">役職</h3>
            <p>{member.position}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-500">趣味・特技</h3>
            <p className="whitespace-pre-line">{member.hobby}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-500">得意な技術・スキル</h3>
            <p className="whitespace-pre-line">{member.skills}</p>
          </div>

          

          <div className="text-sm text-gray-500">
            登録日: {formatDate(member.createdAt ?? new Date(), "yyyy/MM/dd HH:mm")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 