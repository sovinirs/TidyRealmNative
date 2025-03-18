export interface HouseholdState {
  households: Household[];
  currentHousehold: Household | null;
  members: HouseholdMember[];
  loading: boolean;
  error: string | null;
  createHousehold: (household: Household, userId: string) => Promise<void>;
  fetchUserHouseholds: (userId: string) => Promise<void>;
  setCurrentHousehold: (householdId: string) => void;
  fetchHouseholdMembers: (householdId: string) => Promise<void>;
  addMember: (
    householdId: string,
    email: string,
    role: MemberRole,
    inviterId: string
  ) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export type MemberRole = "owner" | "admin" | "member" | "guest";
export type MemberStatus = "active" | "invited" | "left" | "removed";
export type HouseholdStatus = "active" | "archived" | "deleted";

export interface Household {
  id?: string;
  household_name: string;
  location: string;
  created_by?: string;
  created_at?: string;
  status?: HouseholdStatus;
  description?: string;
  household_image_url?: string;
  updated_at?: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  member_id: string;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  updated_at: string;
  invited_by?: string;
  member: {
    user_id: string;
    full_name: string;
    user_email: string;
    avatar_url: string | null;
  };
  inviter?: {
    user_id: string;
    full_name: string;
  };
}
