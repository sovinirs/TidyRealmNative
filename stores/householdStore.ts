import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { HouseholdCreate, HouseholdState, MemberRole } from "@/types/household";

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  households: [],
  currentHousehold: null,
  switchHouseholdTrigger: false,
  members: [],
  loading: false,
  error: null,

  createHousehold: async (household: HouseholdCreate, userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc(
        "create_household_with_owner",
        household
      );

      if (error) throw error;

      set({
        loading: false,
      });

      get().fetchUserHouseholds(userId, data.id);
      get().setSwitchHouseholdTrigger(false);
    } catch (error) {
      console.error("Error creating household:", error);
      handleError(error, set);
    }
  },

  fetchUserHouseholds: async (userId: string, currentHouseholdId?: string) => {
    set({ loading: true });
    try {
      const { data: households, error } = await supabase
        .from("households")
        .select(
          `
        *,
        household_members!inner (
          id,
          member_id,
          role,
          status,
          joined_at
        )
      `
        )
        .eq("household_members.member_id", userId)
        .in("household_members.status", ["active", "invited"]);

      if (error) throw error;

      set({
        households,
        loading: false,
      });

      if (households.length > 0) {
        get().setCurrentHousehold(currentHouseholdId || households[0].id);
      }
    } catch (error) {
      handleError(error, set);
    }
  },

  setCurrentHousehold: (householdId: string) => {
    const { households } = get();
    const currentHousehold = households.find(
      (household) => household.id === householdId
    );
    set({ currentHousehold });
  },

  fetchHouseholdMembers: async (householdId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("household_members")
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
        .eq("household_id", householdId);

      if (error) throw error;
      set({ members: data || [], loading: false });
    } catch (error) {
      set({ error: "Failed to fetch members", loading: false });
    }
  },

  addMember: async (
    householdId: string,
    email: string,
    role: MemberRole,
    inviterId: string
  ) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc("find_user_by_email", {
        email,
      });
      if (error) throw error;

      if (data && data.length > 0) {
        const userId = data[0].user_id;
        await supabase.from("household_members").insert([
          {
            household_id: householdId,
            member_id: userId,
            role,
            status: "active",
            invited_by: inviterId,
          },
        ]);

        // Refresh members list
        await get().fetchHouseholdMembers(householdId);
        set({ loading: false });
      } else {
        set({ error: "User not found", loading: false });
      }
    } catch (error) {
      set({ error: "Failed to add member", loading: false });
    }
  },

  removeMemberFromHousehold: async (householdId: string, memberId: string) => {
    set({ loading: true });
    try {
      // Check if member is the only person
      const { data: members, error: membersError } = await supabase
        .from("household_members")
        .select("id")
        .eq("household_id", householdId)
        .eq("status", "active");

      if (membersError) throw membersError;

      // Update member and household status based on member count
      const { error: updateError } = await supabase
        .from("household_members")
        .update({ status: "left" })
        .eq("household_id", householdId)
        .eq("member_id", memberId);

      if (updateError) throw updateError;

      if (members.length === 1) {
        const { error: householdError } = await supabase
          .from("households")
          .update({ status: "archived" })
          .eq("id", householdId);

        if (householdError) throw householdError;
      }

      // Refresh members list
      await get().fetchHouseholdMembers(householdId);

      // Update current household
      const { households } = get();
      if (households.length > 0) {
        await get().fetchUserHouseholds(memberId, households[0].id);
      } else {
        set({ currentHousehold: null });
      }

      set({ loading: false });
    } catch (error) {
      handleError(error, set);
    }
  },

  setSwitchHouseholdTrigger: (trigger: boolean) => {
    set({ switchHouseholdTrigger: trigger });
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
  if (error instanceof Error) {
    set({ error: error.message, loading: false });
  } else {
    set({ error: "An unexpected error occurred", loading: false });
  }
};
