import { MemberFormValues, ClubFormValues, TaskFormValues, QaFormValues } from "@/lib/validations";
import { useQuery } from "@tanstack/react-query";
import { getClubActivity } from "@/actions/club-activity";
import { getQA } from "@/actions/qa";
import { getTasks } from "@/actions/task";
import { getUserActivity } from "@/actions/user-activity";
import { getUserList, getUserInfo } from "@/actions/user";
import type { UserActivity } from "@/types";

export const useGetUserActivity = () => {
  return useQuery<UserActivity[]>({
    queryKey: ["user-activity"],
    queryFn: getUserActivity,
  });
};

export const useGetUserInfo = () => {
  return useQuery<MemberFormValues | undefined>({
    queryKey: ["user-info"],
    queryFn: getUserInfo,
  });
};

export const useGetUserList = () => {
  return useQuery<MemberFormValues[]>({
    queryKey: ["users"],
    queryFn: getUserList,
  });
};

export const useGetClubActivities = () => {
  return useQuery<ClubFormValues[]>({
    queryKey: ["club-activity"],
    queryFn: getClubActivity,
  });
};

export const useGetTasks = () => {
  return useQuery<TaskFormValues[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
};

export const useGetQa = () => {
  return useQuery<QaFormValues[]>({
    queryKey: ["qa"],
    queryFn: getQA,
  });
};
