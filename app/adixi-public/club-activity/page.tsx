"use client";

import { ClubActivityList } from "./_components/club-activity-list";
import { ClubActivityTitle } from "./_components/club-activity-header";

const ExternalClubActivityPage = () => {
  return (
    <div className="mx-auto">
      <ClubActivityTitle />
      <ClubActivityList />
    </div>
  );
};

export default ExternalClubActivityPage;
