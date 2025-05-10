export type Role = "superadmin" | "admin" | "user";
export type ClubStatus = "active" | "inactive" | "pending";
export type TaskProgress = "pending" | "inProgress" | "completed";
export type UserActivityAction = "login" | "logout";

export type User = {
  id: string;
  name: string;
  image: string;
  email: string;
  role: Role;
  department?: string;
  position?: string;
  hobby?: string;
  skills?: string;
  freeText?: string;
  photoUrl?: string;
  isActive: boolean;
  joinDate?: Date;
  leaveDate?: Date;
  editedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}


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

export type Qa = {
  id: string;
  questionCode?: string;
  question: string;
  answer: string;
  category: string;
  questionBy?: string;
  answeredBy?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserActivity = {
  id: string;
  userId: string;
  userName: string | null;
  action: UserActivityAction;
  createdAt: Date;
};
