import { getClubActivityById } from "@/actions/club-activity";
import { ClubActivityShare } from "@/components/external/club-activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { ShareButton } from "../_components/share-button";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function ClubActivitySlugPage({ params }: Props) {
	const { id } = await params;
	const club = await getClubActivityById(id);

	if (!club) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="pt-6">
						<p className="text-center text-muted-foreground">
							データが見つかりませんでした
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div className="flex items-center gap-2">
				<Button variant="outline" size="icon">
					<Link href="/superadmin/club-activity">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
			</div>

			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">{club.name}</h1>
					<div className="flex items-center gap-2 text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>
							作成日: {formatDate(club.createdAt, "yyyy/MM/dd HH:mm")}
						</span>
					</div>
				</div>
				<ShareButton id={id} dir="club-activity" />
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

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						更新履歴
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">
							最終更新日:{" "}
							{formatDate(club.updatedAt ?? new Date(), "yyyy/MM/dd HH:mm")}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
