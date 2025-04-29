export type TaskPriority = "low" | "medium" | "high";
export type InvolvementType = "assignee" | "collaborator";
export type FrequencyUnit = "day" | "week" | "month";
export type TaskStatus = "pending" | "postponed" | "completed" | "cancelled";
export type FrequencyType = "once" | "recurring";

export interface TaskCompletion {
  id: string;
  scheduled_task_id: string;
  member_id: string;
  completed_at: string;
}

export interface TaskCompletionStatus {
  member_id: string;
  member_name: string;
  completed: boolean;
  completed_at: string | null;
}

export interface Task {
  id: string;
  task_icon: string;
  task_name: string;
  task_description: string | null;
  squad_id: string;
  involvement_type: InvolvementType;
  frequency_type: FrequencyType;
  start_date: string;
  end_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  task_assignments?: TaskAssignment[];
  task_recurrence?: TaskRecurrence;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  member_id: string;
  scheduled_date: string;
  postponed_date: string | null;
  task_assignment_status: TaskStatus;
  created_at: string;
}

export interface TaskRecurrence {
  id: string;
  task_id: string;
  frequency_number: number;
  frequency_unit: FrequencyUnit;
  weekends_only: boolean;
}

export interface ScheduledTask {
  id: string;
  task_id: string;
  scheduled_date: string;
  task_status: TaskStatus;
  created_at: string;
  completions?: TaskCompletionStatus[];
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
  loading: boolean;
  error: string | null;
  createTask: (
    squad_id: string,
    task_name: string,
    task_description: string | null,
    task_icon: string,
    member_ids: string[],
    involvement_type: InvolvementType,
    frequency_type: FrequencyType,
    start_date: Date,
    end_date?: Date,
    frequency_number?: number,
    frequency_unit?: FrequencyUnit,
    weekends_only?: boolean
  ) => Promise<void>;
  fetchTasks: (squadId: string) => Promise<void>;
  updateTaskRecurrence: (
    task_id: string,
    frequency_number: number,
    frequency_unit: FrequencyUnit,
    weekends_only: boolean
  ) => Promise<void>;
  updateTaskAssignments: (
    task_id: string,
    member_ids: string[],
    scheduled_date: Date
  ) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}
