import * as z from "zod"

export const formSchema = z.object({
  name: z.string().min(1, "部活動名は必須です"),
  leader: z.string().min(1, "部長名は必須です"),
  description: z.string().optional(),
  memberCount: z.number().min(1, "部員数は必須です"),
  activityType: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
  location: z.string().optional(),
  detail: z.string().optional(),
});

export type ClubFormValues = z.infer<typeof formSchema>