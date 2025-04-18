import { useQuery } from "@tanstack/react-query";
import { getClubActivity } from "@/actions/club-activity";
import type { ClubActivity } from "@/types";

export const useGetClubActivities = () => {
  return useQuery<ClubActivity[]>({
    queryKey: ["club-activity"],
    queryFn: getClubActivity,
  });
};
