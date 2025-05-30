import { getClubActivity } from "@/actions/club-activity";
import { getQA } from "@/actions/qa";
import { getTabs } from "@/actions/tabs";
import { getTasks } from "@/actions/task";
import { getCategories } from "@/actions/categories";
import { getUserInfo, getUserList } from "@/actions/user";
import { getUserActivity } from "@/actions/user-activity";
import type {
	ClubFormValues,
	CategoryValues,
	MemberFormValues,
	QaFormValues,
	TabValues,
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
// ダッシュボードtask関連
export const useGetTaskStats = () => {
	const { data: tasks, isLoading } = useQuery<TaskFormValues[]>({
		queryKey: ["tasks"],
		queryFn: getTasks,
	});

	const getTaskStats = () => {
		if (!tasks) return {
			totalTasks: 0,
			inProgressTasks: 0,
			todayTasks: 0,
			completedTasks: 0,
		};

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return {
			totalTasks: tasks.length,
			inProgressTasks: tasks.filter((task: TaskFormValues) => task.progress === "inProgress").length,
			todayTasks: tasks.filter((task: TaskFormValues) => {
				const taskDate = task.createdAt ? new Date(task.createdAt) : null;
				if (!taskDate) return false;
				taskDate.setHours(0, 0, 0, 0);
				return taskDate.getTime() === today.getTime();
			}).length,
			completedTasks: tasks.filter((task: TaskFormValues) => task.progress === "completed").length,
		};
	};

	return {
		taskStats: getTaskStats(),
		isLoading,
	};
};

export const useGetCategories = () => {
	return useQuery<CategoryValues[]>({
		queryKey: ["categories"],
		queryFn: getCategories,
	});
};

export const useGetTabs = () => {
	return useQuery<TabValues[]>({
		queryKey: ["tabs"],
		queryFn: getTabs,
	});
};
