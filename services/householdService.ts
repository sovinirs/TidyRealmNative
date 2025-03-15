import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Household {
  id: string;
  household_name: string;
  location: string;
  created_by: string;
  created_at: string;
  status: "active" | "archived" | "deleted";
  description?: string;
  household_image_url?: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  member_id: string;
  role: "owner" | "admin" | "member" | "guest";
  status: "active" | "invited" | "left" | "removed";
  joined_at: string;
  updated_at: string;
  invited_by?: string;
}

// Add a function to generate UUIDs
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check if a user is a member of any household
 * @param userId The user ID to check
 * @returns An object containing a boolean indicating if the user is a member of any household and any error
 */
export const checkUserHouseholdMembership = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("household_members")
      .select("id")
      .eq("member_id", userId)
      .in("status", ["active", "invited"])
      .limit(1);

    if (error) {
      console.error("Error checking household membership:", error);
      return { isMember: false, error };
    }

    return {
      isMember: data && data.length > 0,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error checking household membership:", error);
    return {
      isMember: false,
      error,
    };
  }
};

/**
 * Get all households for a user
 * @param userId The user ID to get households for
 * @returns An object containing the households data and any error
 */
export const getUserHouseholds = async (userId: string) => {
  try {
    const { data, error } = await supabase
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

    if (error) {
      console.error("Error fetching user households:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error fetching user households:", error);
    return { data: null, error };
  }
};

/**
 * Create a new household using direct table operations with RLS
 * @param householdData The household data to create
 * @returns An object containing the created household data and any error
 */
export const createHousehold = async (householdData: {
  household_name: string;
  location: string;
  created_by: string;
  description?: string;
  household_image_url?: string;
}) => {
  try {
    // First, verify that the user_id in created_by matches the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Authentication error: No authenticated user found");
      return {
        data: null,
        error: {
          message:
            "Authentication error: You must be logged in to create a household",
        },
      };
    }

    if (user.id !== householdData.created_by) {
      console.error("Authentication error: User ID mismatch");
      return {
        data: null,
        error: {
          message:
            "Authentication error: You can only create households for yourself",
        },
      };
    }

    // Use the RPC function to create the household and add the creator as an owner in one transaction
    const { data, error } = await supabase.rpc("create_household_with_owner", {
      household_name: householdData.household_name,
      location: householdData.location,
      description: householdData.description || null,
      household_image_url: householdData.household_image_url || null,
    });

    if (error) {
      console.error("Error creating household:", error);

      // Add more detailed error logging for debugging issues
      if ("message" in error && typeof error.message === "string") {
        console.error(error.message);
      }

      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error creating household:", error);
    return { data: null, error };
  }
};

/**
 * Get all members of a household
 * @param householdId The ID of the household to get members for
 * @returns An object containing the members data and any error
 */
export const getHouseholdMembers = async (householdId: string) => {
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

    if (error) {
      console.error("Error fetching household members:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error fetching household members:", error);
    return { data: null, error };
  }
};

/**
 * Add a member to a household
 * @param householdId The ID of the household to add the member to
 * @param memberEmail The email of the user to add
 * @param role The role to assign to the new member
 * @param inviterId The ID of the user sending the invitation
 * @returns An object containing the added member data and any error
 */
export const addHouseholdMember = async (
  householdId: string,
  memberEmail: string,
  role: "admin" | "member" | "guest",
  inviterId: string
) => {
  try {
    // First, check if a user with this email exists
    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("user_email", memberEmail)
      .single();

    let userId = userData?.user_id;

    // If user exists, use their ID
    if (userId) {
      // Add the member to the household
      const { data: member, error: memberError } = await supabase
        .from("household_members")
        .insert([
          {
            household_id: householdId,
            member_id: userId,
            role: role,
            status: "invited",
            invited_by: inviterId,
          },
        ])
        .select()
        .single();

      if (memberError) {
        console.error("Error adding member to household:", memberError);
        return { data: null, error: memberError };
      }

      return { data: member, error: null };
    }

    // If user doesn't exist, we need to handle this differently
    // Since we can't create a user_profile without an auth.users record

    // Instead, we'll create a special record in a separate table for invited users
    // For now, we'll use a workaround by creating a record in household_invitations table

    // First, check if we have an invitation system set up
    const { error: tableExistsError } = await supabase
      .from("household_invitations")
      .select("id")
      .limit(1);

    // If the table doesn't exist, we need to inform the user
    if (tableExistsError && tableExistsError.code === "42P01") {
      // relation does not exist
      console.error("Invitation table doesn't exist:", tableExistsError);
      return {
        data: null,
        error: {
          message:
            "The system is not configured for inviting users who don't have accounts yet. Please ask the user to create an account first.",
        },
      };
    }

    // If we have an invitation system, create an invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("household_invitations")
      .insert([
        {
          household_id: householdId,
          email: memberEmail,
          role: role,
          invited_by: inviterId,
        },
      ])
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);

      // If the invitation table doesn't exist, provide a clearer error message
      if (invitationError.code === "42P01") {
        // relation does not exist
        return {
          data: null,
          error: {
            message:
              "The system is not configured for inviting users who don't have accounts yet. Please ask the user to create an account first.",
          },
        };
      }

      return { data: null, error: invitationError };
    }

    return {
      data: {
        id: invitation.id,
        status: "pending_registration",
        message: "Invitation sent to user who doesn't have an account yet.",
      },
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error adding household member:", error);
    return { data: null, error };
  }
};

/**
 * Update a household member's role or status
 * @param memberId The ID of the household member record to update
 * @param updates The updates to apply (role and/or status)
 * @returns An object containing the updated member data and any error
 */
export const updateHouseholdMember = async (
  memberId: string,
  updates: {
    role?: "owner" | "admin" | "member" | "guest";
    status?: "active" | "invited" | "left" | "removed";
  }
) => {
  try {
    const { data, error } = await supabase
      .from("household_members")
      .update(updates)
      .eq("id", memberId)
      .select()
      .single();

    if (error) {
      console.error("Error updating household member:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error updating household member:", error);
    return { data: null, error };
  }
};

/**
 * Leave a household (update own membership status to 'left')
 * @param householdId The ID of the household to leave
 * @param userId The ID of the user leaving
 * @returns An object containing success status and any error
 */
export const leaveHousehold = async (householdId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("household_members")
      .update({ status: "left" })
      .eq("household_id", householdId)
      .eq("member_id", userId)
      .eq("status", "active")
      .select()
      .single();

    if (error) {
      console.error("Error leaving household:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error leaving household:", error);
    return { success: false, error };
  }
};

/**
 * Update a household's details
 * @param householdId The ID of the household to update
 * @param updates The updates to apply
 * @returns An object containing the updated household data and any error
 */
export const updateHousehold = async (
  householdId: string,
  updates: {
    household_name?: string;
    location?: string;
    description?: string;
    household_image_url?: string;
    status?: "active" | "archived" | "deleted";
  }
) => {
  try {
    const { data, error } = await supabase
      .from("households")
      .update(updates)
      .eq("id", householdId)
      .select()
      .single();

    if (error) {
      console.error("Error updating household:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Unexpected error updating household:", error);
    return { data: null, error };
  }
};

/**
 * Save the current household ID to AsyncStorage
 * @param householdId The ID of the current household
 * @returns A promise that resolves when the ID is saved
 */
export const saveCurrentHouseholdId = async (
  householdId: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem("currentHouseholdId", householdId);
  } catch (error) {
    console.error("Error saving current household ID:", error);
  }
};

/**
 * Get the current household ID from AsyncStorage
 * @returns A promise that resolves with the current household ID or null if not found
 */
export const getCurrentHouseholdId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("currentHouseholdId");
  } catch (error) {
    console.error("Error getting current household ID:", error);
    return null;
  }
};
