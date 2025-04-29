import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { SquadCreate, SquadState } from "@/types/squads";

export const useSquadStore = create<SquadState>((set, get) => ({
  squads: [],
  currentSquad: null,
  switchSquadTrigger: false,
  members: [],
  loading: false,
  error: null,

  createSquad: async (squad: SquadCreate, userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc(
        "create_squad_with_owner",
        squad
      );

      if (error) throw error;

      set({
        loading: false,
      });

      get().fetchUserSquads(userId, data.id);
    } catch (error) {
      console.error("Error creating squad:", error);
      handleError(error, set);
    }
  },

  fetchUserSquads: async (userId: string, currentSquadId?: string) => {
    set({ loading: true });
    try {
      const { data: squads, error } = await supabase
        .from("squads")
        .select(
          `
        *,
        squad_members!inner (
          id,
          member_id,
          member_type,
          status,
          joined_at,
          member:member_id(
            user_id,
            full_name,
            user_email,
            avatar_url
          )
        )
      `
        )
        .eq("squad_members.member_id", userId)
        .in("squad_members.status", ["active", "invited"]);

      if (error) throw error;

      set({
        squads,
        loading: false,
      });
    } catch (error) {
      handleError(error, set);
    }
  },

  fetchSquadMembers: async (squadId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("squad_members")
        .select(
          `
          *,
          member:member_id(
            user_id,
            full_name,
            user_email,
            avatar_url
          ),
          inviter:invited_by(
            user_id,
            full_name
          )
        `
        )
        .eq("squad_id", squadId);

      if (error) throw error;
      set({ members: data || [], loading: false });
    } catch (error) {
      set({ error: "Failed to fetch members", loading: false });
    }
  },

  addMember: async (squadId: string, email: string, inviterId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc("find_user_by_email", {
        email,
      });
      if (error) throw error;

      if (data && data.length > 0) {
        const userId = data[0].user_id;
        await supabase.from("squad_members").insert([
          {
            squad_id: squadId,
            member_id: userId,
            status: "active",
            invited_by: inviterId,
          },
        ]);

        // Refresh members list
        await get().fetchSquadMembers(squadId);
        set({ loading: false });
      } else {
        set({ error: "User not found", loading: false });
      }
    } catch (error) {
      set({ error: "Failed to add member", loading: false });
    }
  },

  removeMemberFromSquad: async (squadId: string, memberId: string) => {
    set({ loading: true });
    try {
      // Check if member is the only person
      const { data: members, error: membersError } = await supabase
        .from("squad_members")
        .select("id")
        .eq("squad_id", squadId)
        .eq("status", "active");

      if (membersError) throw membersError;

      // Update member and squad status based on member count
      const { error: updateError } = await supabase
        .from("squad_members")
        .update({ status: "left" })
        .eq("squad_id", squadId)
        .eq("member_id", memberId);

      if (updateError) throw updateError;

      if (members.length === 1) {
        const { error: squadError } = await supabase
          .from("squads")
          .update({ status: "archived" })
          .eq("id", squadId);

        if (squadError) throw squadError;
      }

      // Refresh members list
      await get().fetchSquadMembers(squadId);

      // Update current squad
      const { squads } = get();
      if (squads.length > 0) {
        await get().fetchUserSquads(memberId, squads[0].id);
      } else {
        set({ currentSquad: null });
      }

      set({ loading: false });
    } catch (error) {
      handleError(error, set);
    }
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string) => {
    set({ error });
  },
}));

const handleError = (
  error: unknown,
  set: (state: { error: string; loading: boolean }) => void
) => {
  console.log(error);

  if (error instanceof Error) {
    set({ error: error.message, loading: false });
  } else {
    set({ error: "An unexpected error occurred", loading: false });
  }
};
