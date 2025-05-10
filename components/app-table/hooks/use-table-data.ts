import { useQuery } from "@tanstack/react-query";
import { getClubActivity } from "@/actions/club-activity";
import { getQA } from "@/actions/qa";
import { getTasks } from "@/actions/task";
import { getUserActivity } from "@/actions/user-activity";
import { getUserList } from "@/actions/user";
import type { ClubActivity, Task, Qa, UserActivity, User } from "@/types";

export const useGetUserActivity = () => {
  return useQuery<UserActivity[]>({
    queryKey: ["user-activity"],
    queryFn: getUserActivity,
  });
};

export const useGetUserList = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUserList,
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
