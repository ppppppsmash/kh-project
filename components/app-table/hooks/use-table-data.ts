import { useQuery } from "@tanstack/react-query";
import { getClubActivity } from "@/actions/club-activity";
import { getIntroCards } from "@/actions/intro-card";
import { getTasks } from "@/actions/task";
import type { ClubActivity, Member, Task } from "@/types";

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

export const useGetTasks = () => {
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
};
