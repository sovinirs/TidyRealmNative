import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { UserState, UserProfile, User } from "@/types/user";

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: false,
  error: null,

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      set({ loading: false });
    } catch (error) {
      handleError(error, set);
    }
  },

  signIn: async (email: string, password: string): Promise<User | null> => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      set({ user, loading: false, error: null });

      return user;
    } catch (error) {
      handleError(error, set);
      return null;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      set({ user: null, loading: false, error: null });
    } catch (error) {
      handleError(error, set);
    }
  },

  checkUser: async () => {
    set({ loading: true });
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      set({ user, loading: false });
    } catch (error) {
      handleError(error, set);
    }
  },

  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    set({ loading: true });
    try {
      const { data: userProfile, error } = await supabase
        .from("user_profiles")
        .select(
          "user_id, full_name, user_email, created_at, avatar_url, last_active"
        )
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      set({ userProfile, loading: false, error: null });

      return userProfile;
    } catch (error) {
      handleError(error, set);
      return null;
    }
  },

  createProfileForLoggedInUser: async () => {
    const { user } = get();

    if (user) {
      set({ loading: true });
      try {
        const { error } = await supabase.from("user_profiles").insert([
          {
            user_id: user.id,
            full_name:
              user.user_metadata?.full_name || user.email?.split("@")[0] || "",
            user_email: user.email,
            last_active: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        await get().getUserProfile(user.id);
        set({ loading: false });
      } catch (error) {
        handleError(error, set);
      }
    }
  },

  setError: (error: string) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
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
