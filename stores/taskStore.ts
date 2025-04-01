import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  TaskState,
  TaskPriority,
  InvolvementType,
  FrequencyUnit,
  ScheduledTask,
  TaskStatus,
  TaskCompletionStatus,
  Task,
} from "@/types/task";

interface TaskWithScheduled extends Task {
  scheduled_tasks?: ScheduledTask[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  scheduledTasks: [],
  loading: false,
  error: null,

  createTask: async (
    squad_id: string,
    task_name: string,
    task_description: string | null,
    task_icon: string,
    duration: number | null,
    priority: TaskPriority,
    requires_approval: boolean,
    member_ids: string[],
    involvement_type: InvolvementType,
    is_recurring: boolean,
    due_date: Date,
    frequency_number?: number,
    frequency_unit?: FrequencyUnit,
    start_date?: Date,
    end_date?: Date,
    weekends_only?: boolean
  ) => {
    set({ loading: true, error: null });
    try {
      // Create the task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          squad_id,
          task_name,
          task_description,
          task_icon,
          duration,
          priority,
          track_individual_progress: involvement_type === "collaborator",
          frequency_type: is_recurring ? "recurring" : "once",
          start_date: start_date?.toISOString() || due_date.toISOString(),
          end_date: end_date?.toISOString(),
          requires_approval,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Create task assignments using RPC
      const { error: assignmentError } = await supabase.rpc(
        "create_task_assignments",
        {
          p_task_id: task.id,
          p_member_ids: member_ids,
          p_involvement_type: involvement_type,
        }
      );

      if (assignmentError) throw assignmentError;

      // Create task recurrence if recurring
      if (is_recurring && frequency_number && frequency_unit && start_date) {
        const { error: recurrenceError } = await supabase.rpc(
          "create_task_recurrence",
          {
            p_task_id: task.id,
            p_frequency_number: frequency_number,
            p_frequency_unit: frequency_unit,
            p_start_date: start_date.toISOString(),
            p_end_date: end_date?.toISOString(),
            p_weekends_only: weekends_only || false,
          }
        );

        if (recurrenceError) throw recurrenceError;
      }

      // Refresh tasks list
      await get().fetchTasks(squad_id);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTasks: async (squadId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          task_assignments (
            id,
            member_id,
            created_at
          ),
          task_recurrence (
            id,
            frequency_number,
            frequency_unit,
            weekends_only,
            created_at
          ),
          scheduled_tasks (
            id,
            scheduled_date,
            task_status,
            created_at
          )
        `
        )
        .eq("squad_id", squadId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // For each scheduled task, fetch completion status
      const tasksWithCompletions = await Promise.all(
        (data || []).map(async (task: TaskWithScheduled) => {
          if (task.scheduled_tasks) {
            const scheduledTasksWithCompletions = await Promise.all(
              task.scheduled_tasks.map(async (st: ScheduledTask) => {
                const completions = await get().getTaskCompletionStatus(st.id);
                return { ...st, completions };
              })
            );
            return { ...task, scheduled_tasks: scheduledTasksWithCompletions };
          }
          return task;
        })
      );

      set({ tasks: tasksWithCompletions as Task[] });
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchScheduledTasks: async (
    squadId: string,
    startDate: Date,
    endDate: Date
  ) => {
    set({ loading: true, error: null });
    try {
      const { data: scheduledTasks, error } = await supabase
        .from("scheduled_tasks")
        .select(
          `
          *,
          task:tasks (
            *,
            task_assignments (
              id,
              member_id,
              involvement_type
            ),
            task_recurrence (
              id,
              frequency_number,
              frequency_unit,
              start_date,
              end_date,
              weekends_only,
              next_occurrence
            )
          )
        `
        )
        .eq("task.squad_id", squadId)
        .gte("scheduled_date", startDate.toISOString())
        .lte("scheduled_date", endDate.toISOString())
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      set({ scheduledTasks: scheduledTasks || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateTaskRecurrence: async (
    task_id: string,
    frequency_number: number,
    frequency_unit: FrequencyUnit,
    start_date: Date,
    end_date: Date | null,
    weekends_only: boolean
  ) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.rpc("create_task_recurrence", {
        p_task_id: task_id,
        p_frequency_number: frequency_number,
        p_frequency_unit: frequency_unit,
        p_start_date: start_date.toISOString(),
        p_end_date: end_date?.toISOString(),
        p_weekends_only: weekends_only,
      });

      if (error) throw error;

      // Refresh tasks to get updated recurrence
      const currentTasks = get().tasks;
      if (currentTasks.length > 0) {
        await get().fetchTasks(currentTasks[0].squad_id);
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateTaskAssignments: async (
    task_id: string,
    member_ids: string[],
    involvement_type: InvolvementType
  ) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.rpc("create_task_assignments", {
        p_task_id: task_id,
        p_member_ids: member_ids,
        p_involvement_type: involvement_type,
      });

      if (error) throw error;

      // Refresh tasks to get updated assignments
      const currentTasks = get().tasks;
      if (currentTasks.length > 0) {
        await get().fetchTasks(currentTasks[0].squad_id);
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  completeScheduledTask: async (scheduled_task_id: string, user_id: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.rpc("complete_scheduled_task", {
        p_scheduled_task_id: scheduled_task_id,
        p_user_id: user_id,
      });

      if (error) throw error;

      // Refresh tasks to get updated status
      const currentTasks = get().tasks;
      if (currentTasks.length > 0) {
        await get().fetchTasks(currentTasks[0].squad_id);
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  getTaskCompletionStatus: async (
    scheduled_task_id: string
  ): Promise<TaskCompletionStatus[]> => {
    try {
      const { data, error } = await supabase.rpc("get_task_completion_status", {
        p_scheduled_task_id: scheduled_task_id,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      set({ error: (error as Error).message });
      return [];
    }
  },

  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ loading }),
}));
