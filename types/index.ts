export type ClubStatus = "active" | "inactive" | "pending";
export type TaskProgress = "pending" | "inProgress" | "completed";

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

export type Task = {
  id: string;
  title: string;
  content: string;
  assignee: string;
  dueDate: Date;
  progress: TaskProgress;
  progressDetails: string;
  link: string;
  notes: string;
  startedAt: Date;
  completedAt?: Date;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};
