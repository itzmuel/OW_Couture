"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type AuthContextValue = {
  currentUser: PublicUser | null;
  isReady: boolean;
  signUp: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function toPublicUser(user: User): Promise<PublicUser> {
  const supabase = createSupabaseBrowserClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const profileName = typeof profile?.full_name === "string" ? profile.full_name : null;
  const fallbackName = user.email ? user.email.split("@")[0] : "Member";

  return {
    id: user.id,
    name: profileName ?? metadataName ?? fallbackName,
    email: user.email ?? "",
    createdAt: user.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const supabase = useMemo(() => {
    if (!isSupabaseConfigured) {
      return null;
    }

    return createSupabaseBrowserClient();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setCurrentUser(null);
      setIsReady(true);
      return;
    }

    let isMounted = true;

    const hydrate = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!isMounted) {
        return;
      }

      if (!user) {
        setCurrentUser(null);
        setIsReady(true);
        return;
      }

      const publicUser = await toPublicUser(user);
      if (!isMounted) {
        return;
      }

      setCurrentUser(publicUser);
      setIsReady(true);
    };

    void hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        setCurrentUser(null);
        return;
      }

      void toPublicUser(user).then((mappedUser) => {
        if (isMounted) {
          setCurrentUser(mappedUser);
        }
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      currentUser,
      isReady,
      signUp: async (name, email, password) => {
        const cleanedName = name.trim();
        const cleanedEmail = email.trim().toLowerCase();
        const cleanedPassword = password.trim();

        if (!supabase) {
          return { ok: false, message: "Supabase is not configured yet. Add env values to .env.local." };
        }

        if (!cleanedName) {
          return { ok: false, message: "Name is required." };
        }

        if (!cleanedEmail) {
          return { ok: false, message: "Email is required." };
        }

        if (cleanedPassword.length < 6) {
          return { ok: false, message: "Password must be at least 6 characters." };
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanedEmail,
          password: cleanedPassword,
          options: {
            data: {
              full_name: cleanedName,
            },
          },
        });

        if (error) {
          return { ok: false, message: error.message };
        }

        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: cleanedName,
          });
        }

        return { ok: true };
      },
      logIn: async (email, password) => {
        const cleanedEmail = email.trim().toLowerCase();
        const cleanedPassword = password.trim();

        if (!supabase) {
          return { ok: false, message: "Supabase is not configured yet. Add env values to .env.local." };
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: cleanedEmail,
          password: cleanedPassword,
        });

        if (error) {
          return { ok: false, message: error.message };
        }

        return { ok: true };
      },
      logOut: async () => {
        if (!supabase) {
          setCurrentUser(null);
          return;
        }

        await supabase.auth.signOut();
        setCurrentUser(null);
      },
    };
  }, [currentUser, isReady, supabase]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}