import { z } from "zod"

export const memberFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "名前は必須です"),
  department: z.string().min(1, "事業部は必須です"),
  position: z.string().min(1, "役職は必須です"),
  hobby: z.string().min(1, "趣味は必須です"),
  skills: z.string().min(1, "スキルは必須です"),
  freeText: z.string().optional(),
  photoUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  editedAt: z.string().optional(),
});
export type MemberFormValues = z.infer<typeof memberFormSchema>

export const taskFormSchema = z.object({
  title: z.string().min(1, "項目名は必須です"),
  content: z.string().min(1, "内容は必須です"),
  assignee: z.string().min(1, "担当者は必須です"),
  dueDate: z.string().min(1, "期限は必須です"),
  progress: z.enum(["pending", "inProgress", "completed"]),
  progressDetails: z.string().optional(),
  link: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  notes: z.string().optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  isPublic: z.boolean().optional(),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>

export const clubFormSchema = z.object({
  name: z.string().min(1, "部活動名は必須です"),
  description: z.string().optional(),
  leader: z.string().min(1, "部長は必須です"),
  memberCount: z.number().min(1, "メンバー数は必須です"),
  activityType: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
  location: z.string().optional(),
  detail: z.string().optional(),
});
export type ClubFormValues = z.infer<typeof clubFormSchema>

export const qaFormSchema = z.object({
  question: z.string().min(1, "質問は必須です"),
  answer: z.string().optional(),
  category: z.string().min(1, "カテゴリは必須です"),
  questionBy: z.string().optional(),
  answeredBy: z.string().optional(),
  isPublic: z.boolean().optional(),
});
export type QaFormValues = z.infer<typeof qaFormSchema>
