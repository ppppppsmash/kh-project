export type ClubStatus = "active" | "inactive" | "pending";

export type ClubActivity = {
  id: string;
  name: string;
  description: string;
  leader: string;
  memberCount: number;
  activityType: string;
  status: ClubStatus;
  location: string;
  detail: string;
  createdAt: Date;
  updatedAt: Date;
}; 