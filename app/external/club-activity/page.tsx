"use client";

import { ClubActivityList } from "./_components/club-activity-list";
import { ClubActivityTitle } from "./_components/club-activity-header";

const ExternalClubActivityPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ClubActivityTitle />
      <ClubActivityList />
    </div>
  );
};

export default ExternalClubActivityPage;
