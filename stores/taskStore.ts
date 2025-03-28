import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  TaskState,
  TaskPriority,
  InvolvementType,
  FrequencyUnit,
  ScheduledTask,
  TaskStatus,
} from "@/types/task";

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  scheduledTasks: [],
  loading: false,
  error: null,

  createTask: async (
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
  ) => {
    set({ loading: true, error: null });
    try {
      // 1. Insert the task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert([
          {
            household_id: householdId,
            task_name: taskName,
            description,
            task_icon: taskIcon,
            duration,
            priority,
            requires_approval: requiresApproval,
            status: "pending" as TaskStatus,
            due_date: dueDate?.toISOString(),
            frequency_type: isRecurring ? "recurring" : "once",
            start_date: startDate?.toISOString() || new Date().toISOString(),
            end_date: endDate?.toISOString(),
          },
        ])
        .select()
        .single();

      if (taskError) throw taskError;

      // 2. Create task assignments
      const { error: assignmentError } = await supabase.rpc(
        "create_task_assignments",
        {
          p_task_id: task.id,
          p_member_ids: involvedMembers,
          p_involvement_type: involvementType,
        }
      );

      if (assignmentError) throw assignmentError;

      // 3. If recurring, create task recurrence
      if (isRecurring && frequencyNumber && frequencyUnit && startDate) {
        const { error: recurrenceError } = await supabase.rpc(
          "create_task_recurrence",
          {
            p_task_id: task.id,
            p_frequency_number: frequencyNumber,
            p_frequency_unit: frequencyUnit,
            p_start_date: startDate.toISOString(),
            p_end_date: endDate?.toISOString(),
            p_weekends_only: weekendsOnly || false,
          }
        );

        if (recurrenceError) throw recurrenceError;
      }

      // 4. Add audit log entry
      const { error: auditError } = await supabase
        .from("task_audit_logs")
        .insert([
          {
            task_id: task.id,
            action: "Task Created",
            performed_by: task.created_by,
          },
        ]);

      if (auditError) throw auditError;

      // 5. Refresh tasks list
      await get().fetchTasks(householdId);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTasks: async (householdId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select(
          `
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
          ),
          scheduled_tasks (
            id,
            scheduled_date,
            task_status
          )
        `
        )
        .eq("household_id", householdId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ tasks: tasks || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchScheduledTasks: async (
    householdId: string,
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
        .eq("task.household_id", householdId)
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
    taskId: string,
    frequencyNumber: number,
    frequencyUnit: FrequencyUnit,
    startDate: Date,
    endDate: Date | null,
    weekendsOnly: boolean
  ) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.rpc("create_task_recurrence", {
        p_task_id: taskId,
        p_frequency_number: frequencyNumber,
        p_frequency_unit: frequencyUnit,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate?.toISOString(),
        p_weekends_only: weekendsOnly,
      });

      if (error) throw error;

      // Refresh tasks to get updated scheduled tasks
      const task = get().tasks.find((t) => t.id === taskId);
      if (task) {
        await get().fetchTasks(task.household_id);
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateTaskAssignments: async (
    taskId: string,
    memberIds: string[],
    involvementType: InvolvementType
  ) => {
    set({ loading: true, error: null });
    try {
      // First delete existing assignments
      const { error: deleteError } = await supabase
        .from("task_assignments")
        .delete()
        .eq("task_id", taskId);

      if (deleteError) throw deleteError;

      // Create new assignments
      const { error: createError } = await supabase.rpc(
        "create_task_assignments",
        {
          p_task_id: taskId,
          p_member_ids: memberIds,
          p_involvement_type: involvementType,
        }
      );

      if (createError) throw createError;

      // Refresh tasks
      const task = get().tasks.find((t) => t.id === taskId);
      if (task) {
        await get().fetchTasks(task.household_id);
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  completeScheduledTask: async (scheduledTaskId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      // 1. Update scheduled task
      const { data: scheduledTask, error: updateError } = await supabase
        .from("scheduled_tasks")
        .update({ task_status: "completed" as TaskStatus })
        .eq("id", scheduledTaskId)
        .select("task_id")
        .single();

      if (updateError) throw updateError;

      // 2. Add audit log entry
      const { error: auditError } = await supabase
        .from("task_audit_logs")
        .insert([
          {
            task_id: scheduledTask.task_id,
            action: "Task Completed",
            performed_by: userId,
          },
        ]);

      if (auditError) throw auditError;

      // 3. Refresh the scheduled tasks
      const task = get().tasks.find((t) => t.id === scheduledTask.task_id);
      if (task) {
        await get().fetchScheduledTasks(
          task.household_id,
          new Date(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
}));
