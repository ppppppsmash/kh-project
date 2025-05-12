import { MemberFormValues, ClubFormValues, TaskFormValues, QaFormValues, TabFormValues } from "@/lib/validations";
import { useQuery } from "@tanstack/react-query";
import { getClubActivity } from "@/actions/club-activity";
import { getQA } from "@/actions/qa";
import { getTasks } from "@/actions/task";
import { getUserActivity } from "@/actions/user-activity";
import { getUserList, getUserInfo } from "@/actions/user";
import { getTabs } from "@/actions/tab";
import type { UserActivityFormValues } from "@/lib/validations";

export const useGetUserActivity = () => {
  return useQuery<UserActivityFormValues[]>({
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

export const useGetTabs = () => {
  return useQuery<TabFormValues[]>({
    queryKey: ["tabs"],
    queryFn: getTabs,
  });
};

export const useGetTasks = (tabId?: string) => {
  return useQuery<TaskFormValues[]>({
    queryKey: ["tasks", tabId],
    queryFn: () => getTasks(tabId),
  });
}

export const useGetQa = () => {
  return useQuery<QaFormValues[]>({
    queryKey: ["qa"],
    queryFn: getQA,
  });
};
