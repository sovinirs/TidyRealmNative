export type TaskPriority = "low" | "medium" | "high";
export type InvolvementType = "assignee" | "collaborator";
export type FrequencyUnit = "day" | "week" | "month";
export type TaskStatus = "pending" | "postponed" | "completed" | "cancelled";
export type FrequencyType = "once" | "recurring";

export interface Task {
  id: string;
  household_id: string;
  task_name: string;
  description: string | null;
  task_icon: string;
  duration: number | null;
  priority: TaskPriority;
  requires_approval: boolean;
  frequency_type: FrequencyType;
  start_date: string;
  end_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  task_assignments?: TaskAssignment[];
  task_recurrence?: TaskRecurrence;
  scheduled_tasks?: ScheduledTask[];
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  member_id: string;
  involvement_type: InvolvementType;
  created_at: string;
}

export interface TaskRecurrence {
  id: string;
  task_id: string;
  frequency_number: number;
  frequency_unit: FrequencyUnit;
  start_date: string;
  end_date: string | null;
  weekends_only: boolean;
  next_occurrence: string;
  created_at: string;
}

export interface ScheduledTask {
  id: string;
  task_id: string;
  scheduled_date: string;
  task_status: TaskStatus;
  created_at: string;
  task?: Task;
}

export interface TaskAuditLog {
  id: string;
  task_id: string;
  action: string;
  performed_by: string;
  previous_value?: string;
  new_value?: string;
  created_at: string;
}

export interface TaskState {
  tasks: Task[];
  scheduledTasks: ScheduledTask[];
  loading: boolean;
  error: string | null;
  createTask: (
    householdId: string,
    taskName: string,
    description: string | null,
    taskIcon: string,
    duration: number | null,
    priority: TaskPriority,
    requiresApproval: boolean,
    involvedMembers: string[],
    involvementType: InvolvementType,
    isRecurring: boolean,
    frequencyNumber?: number,
    frequencyUnit?: FrequencyUnit,
    startDate?: Date,
    endDate?: Date | null,
    weekendsOnly?: boolean,
    dueDate?: Date
  ) => Promise<void>;
  fetchTasks: (householdId: string) => Promise<void>;
  fetchScheduledTasks: (
    householdId: string,
    startDate: Date,
    endDate: Date
  ) => Promise<void>;
  updateTaskRecurrence: (
    taskId: string,
    frequencyNumber: number,
    frequencyUnit: FrequencyUnit,
    startDate: Date,
    endDate: Date | null,
    weekendsOnly: boolean
  ) => Promise<void>;
  updateTaskAssignments: (
    taskId: string,
    memberIds: string[],
    involvementType: InvolvementType
  ) => Promise<void>;
  completeScheduledTask: (
    scheduledTaskId: string,
    userId: string
  ) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}
