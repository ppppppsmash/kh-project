import { getClubActivityById } from "@/actions/club-activity";
import { ClubActivityShare } from "@/components/external/club-activity";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { notFound } from "next/navigation";

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
						<span>
							作成日: {formatDate(club.createdAt, "yyyy/MM/dd HH:mm")}
						</span>
					</div>
				</div>
			</div>

			<ClubActivityShare
				club={{
					...club,
					memberCount: club.memberCount ?? "",
					description: club.description ?? undefined,
					activityType: club.activityType ?? undefined,
					location: club.location ?? undefined,
					detail: club.detail ?? undefined,
				}}
			/>
		</div>
	);
}
