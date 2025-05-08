import { useQuery } from "@tanstack/react-query";
import { getClubActivity } from "@/actions/club-activity";
import { getIntroCards } from "@/actions/intro-card";
import { getQA } from "@/actions/qa";
import { getTasks } from "@/actions/task";
import { getUserActivity } from "@/actions/user-activity";
import type { ClubActivity, Member, Task, Qa, UserActivity } from "@/types";

export const useGetUserActivity = () => {
  return useQuery<UserActivity[]>({
    queryKey: ["user-activity"],
    queryFn: getUserActivity,
  });
};

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

export const useGetQa = () => {
  return useQuery<Qa[]>({
    queryKey: ["qa"],
    queryFn: getQA,
  });
};
