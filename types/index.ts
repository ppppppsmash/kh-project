export type ClubStatus = "active" | "inactive" | "pending";

export type ClubActivity = {
  id: string;
  name: string;
  description?: string;
  leader: string;
  memberCount: number;
  activityType?: string;
  status: ClubStatus;
  location?: string;
  detail?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SortConfig<T> = {
  key: keyof T;
  direction: "asc" | "desc";
}

export type Member = {
  id: string;
  name: string;
  department: string;
  position: string;
  hobby: string;
  skills: string;
  freeText?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};
