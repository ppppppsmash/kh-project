import { getClubActivity } from "@/actions/club-activity";
import { getQA } from "@/actions/qa";
import { getTabs } from "@/actions/tabs";
import { getTasks } from "@/actions/task";
import { getCategories } from "@/actions/categories";
import { getUserInfo, getUserList } from "@/actions/user";
import { getUserActivity } from "@/actions/user-activity";
import { getSurveys } from "@/actions/survey";
import type {
	ClubFormValues,
	CategoryValues,
	MemberFormValues,
	QaFormValues,
	TabValues,
	TaskFormValues,
	SurveyFormValues,
	UserActivityFormValues,
} from "@/lib/validations";
import { useQuery } from "@tanstack/react-query";

// 汎用クエリフックファクトリ
const createQueryHook = <T>(queryKey: string, queryFn: () => Promise<T>) => {
	return () =>
		useQuery<T>({
			queryKey: [queryKey],
			queryFn,
		});
};

export const useGetUserActivity = createQueryHook<UserActivityFormValues[]>(
	"user-activity",
	getUserActivity,
);

export const useGetUserInfo = createQueryHook<MemberFormValues | undefined>(
	"user-info",
	getUserInfo,
);

export const useGetUserList = createQueryHook<MemberFormValues[]>(
	"users",
	getUserList,
);

export const useGetClubActivities = createQueryHook<ClubFormValues[]>(
	"club-activity",
	getClubActivity,
);

export const useGetTasks = createQueryHook<TaskFormValues[]>(
	"tasks",
	getTasks,
);

export const useGetQa = createQueryHook<QaFormValues[]>("qa", getQA);

export const useGetCategories = createQueryHook<CategoryValues[]>(
	"categories",
	getCategories,
);

export const useGetTabs = createQueryHook<TabValues[]>("tabs", getTabs);

export const useGetSurveys = createQueryHook<SurveyFormValues[]>(
	"surveys",
	getSurveys,
);

// ダッシュボードtask関連
export const useGetTaskStats = () => {
	const { data: tasks, isLoading } = useQuery<TaskFormValues[]>({
		queryKey: ["tasks"],
		queryFn: getTasks,
	});

	const getTaskStats = () => {
		if (!tasks)
			return {
				totalTasks: 0,
				inProgressTasks: 0,
				todayTasks: 0,
				completedTasks: 0,
			};

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return {
			totalTasks: tasks.length,
			inProgressTasks: tasks.filter(
				(task: TaskFormValues) => task.progress === "inProgress",
			).length,
			todayTasks: tasks.filter((task: TaskFormValues) => {
				const taskDate = task.createdAt ? new Date(task.createdAt) : null;
				if (!taskDate) return false;
				taskDate.setHours(0, 0, 0, 0);
				return taskDate.getTime() === today.getTime();
			}).length,
			completedTasks: tasks.filter(
				(task: TaskFormValues) => task.progress === "completed",
			).length,
		};
	};

	return {
		taskStats: getTaskStats(),
		isLoading,
	};
};
