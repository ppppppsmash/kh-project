"use client";

import { ClubActivityTitle } from "./_components/club-activity-header";
import { ClubActivityList } from "./_components/club-activity-list";

const ExternalClubActivityPage = () => {
	return (
		<div className="mx-auto">
			<ClubActivityTitle />
			<ClubActivityList />
		</div>
	);
};

export default ExternalClubActivityPage;
