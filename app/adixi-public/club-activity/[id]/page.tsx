import { getClubActivityById } from "@/actions/club-activity";
import { ClubActivityShare } from "@/components/external/club-activity";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function ClubActivityDetailPage({ params }: Props) {
	const { id } = await params;
	const club = await getClubActivityById(id);

	if (!club) return notFound();

	return (
		<div className="mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div className="space-y-5">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="icon">
							<Link href={"/adixi-public/club-activity"}>
								<ArrowLeft className="h-4 w-4" />
							</Link>
						</Button>
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
