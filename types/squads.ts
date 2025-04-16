export interface SquadState {
  squads: Squad[];
  currentSquad: Squad | null;
  switchSquadTrigger: boolean;
  members: SquadMember[];
  loading: boolean;
  error: string | null;
  createSquad: (squad: SquadCreate, userId: string) => Promise<void>;
  fetchUserSquads: (userId: string, currentSquadId?: string) => Promise<void>;
  fetchSquadMembers: (squadId: string) => Promise<void>;
  addMember: (
    squadId: string,
    email: string,
    inviterId: string
  ) => Promise<void>;
  removeMemberFromSquad: (squadId: string, memberId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export interface SquadCreate {
  squad_name: string;
  location: string;
  description?: string;
  squad_image_url?: string;
}

export interface Squad {
  id: string;
  squad_name: string;
  location: string;
  created_by: string;
  created_at: string;
  description?: string;
  squad_image_url?: string;
  updated_at?: string;
  squad_members: SquadMember[];
}

export interface SquadMember {
  id: string;
  squad_id: string;
  member_id: string;
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
