import * as z from "zod"

export const formSchema = z.object({
  name: z.string().min(1, "部活動名は必須です"),
  leader: z.string().min(1, "部長名は必須です"),
  description: z.string().min(1, "活動内容は必須です"),
  memberCount: z.number().min(1, "部員数は必須です"),
  activityType: z.string().min(1, "活動種別は必須です"),
  status: z.enum(["active", "inactive", "pending"]),
  location: z.string().min(1, "活動場所は必須です"),
  detail: z.string().min(1, "活動内容は必須です"),
});

export type ClubFormValues = z.infer<typeof formSchema>