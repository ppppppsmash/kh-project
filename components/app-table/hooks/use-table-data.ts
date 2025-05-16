import { getClubActivity } from "@/actions/club-activity";
import { getQA } from "@/actions/qa";
// import { getTags } from "@/actions/tag";
import { getTasks } from "@/actions/task";
import { getUserInfo, getUserList } from "@/actions/user";
import { getUserActivity } from "@/actions/user-activity";
import type {
	ClubFormValues,
	MemberFormValues,
	QaFormValues,
	TagFormValues,
	TaskFormValues,
} from "@/lib/validations";
import type { UserActivityFormValues } from "@/lib/validations";
import { useQuery } from "@tanstack/react-query";

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

// export const useGetTags = () => {
// 	return useQuery<TagFormValues[]>({
// 		queryKey: ["tags"],
// 		queryFn: getTags,
// 	});
// };

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
