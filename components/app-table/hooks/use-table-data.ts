import { useQuery } from "@tanstack/react-query";
import { getClubActivity } from "@/actions/club-activity";
import { getIntroCards } from "@/actions/intro-card";
import type { ClubActivity, Member } from "@/types";

export const useGetMembers = () => {
  return useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: getIntroCards,
  });
};

export const useGetClubActivities = () => {
  return useQuery<ClubActivity[]>({
    queryKey: ["club-activity"],
    queryFn: getClubActivity,
  });
};
