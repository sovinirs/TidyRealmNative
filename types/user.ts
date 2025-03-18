export interface UserState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
  getUserProfile: (userId: string) => Promise<void>;
  createProfileForLoggedInUser: () => Promise<void>;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  user_email: string;
  created_at: string;
  avatar_url: string;
  last_active: string;
}
