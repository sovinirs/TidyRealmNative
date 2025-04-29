import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { TaskState, TaskStatus } from "@/types/task";

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  createTask: async (
    squad_id: string,
    task_name: string,
    task_description: string | null,
    task_icon: string,
    member_ids: string[],
    involvement_type: "assignee" | "collaborator",
    frequency_type: "once" | "recurring",
    start_date: Date,
    end_date?: Date,
    frequency_number?: number,
    frequency_unit?: "day" | "week" | "month",
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
          involvement_type,
          frequency_type,
          start_date: start_date.toISOString(),
          end_date: end_date?.toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Create task assignments (simplified - just task_id and member_id)
      const { error: assignmentError } = await supabase
        .from("task_assignments")
        .insert(
          member_ids.map((member_id) => ({
            task_id: task.id,
            member_id,
          }))
        );

      if (assignmentError) throw assignmentError;

      // Create task recurrence if recurring
      if (
        frequency_type === "recurring" &&
        frequency_number &&
        frequency_unit
      ) {
        const { error: recurrenceError } = await supabase
          .from("task_recurrence")
          .insert({
            task_id: task.id,
            frequency_number,
            frequency_unit,
            weekends_only: weekends_only || false,
          });

        if (recurrenceError) throw recurrenceError;
      } else {
        // Create scheduled tasks for one-time task
        const { error: scheduledTaskError } = await supabase
          .from("scheduled_tasks")
          .insert(
            member_ids.map((member_id) => ({
              task_id: task.id,
              member_id,
              scheduled_date: start_date.toISOString(),
              task_assignment_status: "pending" as TaskStatus,
            }))
          );

        if (scheduledTaskError) throw scheduledTaskError;
      }

      // Refresh tasks list
      await get().fetchTasks(squad_id);
      set({ loading: false });
    } catch (error: any) {
      console.log(error);
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
            task_id,
            member_id
          ),
          task_recurrence (
            id,
            frequency_number,
            frequency_unit,
            weekends_only
          ),
          scheduled_tasks (
            id,
            scheduled_date,
            postponed_date,
            task_assignment_status
          )
        `
        )
        .eq("squad_id", squadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ tasks: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateTaskRecurrence: async (
    task_id: string,
    frequency_number: number,
    frequency_unit: "day" | "week" | "month",
    weekends_only: boolean
  ) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("task_recurrence").upsert({
        task_id,
        frequency_number,
        frequency_unit,
        weekends_only,
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

  updateTaskAssignments: async (task_id: string, member_ids: string[]) => {
    set({ loading: true, error: null });
    try {
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from("task_assignments")
        .delete()
        .eq("task_id", task_id);

      if (deleteError) throw deleteError;

      // Create new assignments
      const { error: insertError } = await supabase
        .from("task_assignments")
        .insert(
          member_ids.map((member_id) => ({
            task_id,
            member_id,
          }))
        );

      if (insertError) throw insertError;

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

  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ loading }),
}));
