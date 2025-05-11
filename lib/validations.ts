import * as z from "zod";

export const memberFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email("有効なメールアドレスを入力してください").optional(),
  // email: z.union([z.string().email(), z.literal("")]).optional(),
  role: z.enum(["superadmin", "admin", "user"] as const).default("admin").optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  skills: z.string().optional(),
  hobby: z.string().optional(),
  freeText: z.string().optional(),
  photoUrl: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type MemberFormValues = z.infer<typeof memberFormSchema>;

export const taskFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "項目名は必須です"),
  content: z.string().min(1, "内容は必須です"),
  assignee: z.string().min(1, "担当者は必須です"),
  dueDate: z.date({ required_error: "期限は必須です" }),
  progress: z.enum(["pending", "inProgress", "completed"]),
  progressDetails: z.string().optional(),
  link: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  notes: z.string().optional(),
  startedAt: z.date({ required_error: "開始日は必須です" }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  completedAt: z.date().nullable().optional(),
  isPublic: z.boolean().default(false).optional(),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>

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
export type ClubFormValues = z.infer<typeof clubFormSchema>

export const qaFormSchema = z.object({
  id: z.string().optional(),
  questionCode: z.string().optional(),
  question: z.string().min(1, "質問は必須です"),
  answer: z.string().optional(),
  category: z.string().min(1, "カテゴリは必須です"),
  questionBy: z.string().optional(),
  answeredBy: z.string().optional(),
  isPublic: z.boolean().default(false).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type QaFormValues = z.infer<typeof qaFormSchema>
