import * as z from "zod";

export const memberFormSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	email: z.string().email("有効なメールアドレスを入力してください").optional(),
	// email: z.union([z.string().email(), z.literal("")]).optional(),
	role: z
		.enum(["superadmin", "admin", "user"] as const)
		.default("admin")
		.optional(),
	department: z.string().optional(),
	position: z.string().optional(),
	skills: z
		.array(z.string())
		.min(1)
		.max(3)
		.refine((skills) => skills.every((skill) => skill.length <= 50), {
			message: "各スキルは10文字以内で入力してください",
		}),
	skills_message: z.string().optional(),
	hobby: z.string().optional(),
	freeText: z.string().optional(),
	photoUrl: z.string().optional(),
	isActive: z.boolean().default(true).optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});
export type MemberFormValues = z.infer<typeof memberFormSchema>;

export const categorySchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});
export type CategoryValues = z.infer<typeof categorySchema>;

export const tabSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});
export type TabValues = z.infer<typeof tabSchema>;

export const taskFormSchema = z.object({
	id: z.string().optional(),
	taskId: z.string().optional(),
	title: z.string().min(1, "項目名は必須です"),
	content: z.string().min(1, "内容は必須です"),
	assignee: z.string().min(1, "担当者は必須です"),
	dueDate: z.date({ required_error: "期限は必須です" }),
	progress: z.enum(["pending", "inProgress", "completed"]),
	priority: z.enum(["high", "medium", "low", "none"]).optional(),
	progressDetails: z.string().optional(),
	link: z
		.string()
		.url("有効なURLを入力してください")
		.optional()
		.or(z.literal("")),
	notes: z.string().optional(),
	tabId: z.string().optional(),
	categoryId: z.string().optional(),
	startedAt: z.date({ required_error: "開始日は必須です" }),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	completedAt: z.date().nullable().optional(),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const clubFormSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "部活動名は必須です"),
	description: z.string().optional(),
	leader: z.string().min(1, "部長は必須です"),
	memberCount: z.string().min(1, "メンバー数は必須です"),
	activityType: z.string().optional(),
	status: z.enum(["active", "inactive", "pending"]),
	location: z.string().optional(),
	detail: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});
export type ClubFormValues = z.infer<typeof clubFormSchema>;

export const qaFormSchema = z.object({
	id: z.string().optional(),
	questionCode: z.string().optional(),
	question: z.string().min(1, "質問は必須です"),
	answer: z.string().optional(),
	category: z.string().min(1, "カテゴリは必須です"),
	questionBy: z.string().optional(),
	answeredBy: z.string().optional(),
	isPublic: z.boolean().default(false).optional(),
	startedAt: z.date().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});
export type QaFormValues = z.infer<typeof qaFormSchema>;

export const userActivityFormSchema = z.object({
	id: z.string().optional(),
	userId: z.string().optional(),
	userName: z.string().optional(),
	action: z.enum([
		"login", 
		"logout", 
		"task_create", 
		"task_update", 
		"task_delete",
		"qa_create",
		"qa_update", 
		"qa_delete",
		"member_create",
		"member_update",
		"member_delete",
		"club_create",
		"club_update",
		"club_delete"
	]),
	resourceType: z.enum(["task", "qa", "member", "club", "login", "logout"]).optional(),
	resourceId: z.string().optional(),
	resourceName: z.string().optional(),
	resourceDetails: z.string().optional(),
	createdAt: z.date().optional(),
});
export type UserActivityFormValues = z.infer<typeof userActivityFormSchema>;

export const tagFormSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "タグ名は必須です"),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});
export type TagFormValues = z.infer<typeof tagFormSchema>;

export const surveyItemSchema = z.object({
	id: z.string().optional(),
	surveyId: z.string().optional(),
	question: z.string().min(1, "質問は必須です"),
	questionType: z.enum(["text", "textarea", "select", "radio", "checkbox"]),
	options: z.string().optional(),
	isRequired: z.boolean().default(false).optional(),
	order: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});
export type SurveyItemFormValues = z.infer<typeof surveyItemSchema>;

export const surveyFormSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1, "タイトルは必須です"),
	description: z.string().optional(),
	theme: z.string().default("default").optional(),
	isPublished: z.boolean().default(false).optional(),
	items: z.array(surveyItemSchema).min(1, "少なくとも1つの項目が必要です"),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});
export type SurveyFormValues = z.infer<typeof surveyFormSchema>;
