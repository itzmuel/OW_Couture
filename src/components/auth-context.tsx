"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

type PublicUser = Omit<StoredUser, "password">;

type AuthContextValue = {
  currentUser: PublicUser | null;
  isReady: boolean;
  signUp: (name: string, email: string, password: string) => { ok: true } | { ok: false; message: string };
  logIn: (email: string, password: string) => { ok: true } | { ok: false; message: string };
  logOut: () => void;
};

const USERS_STORAGE_KEY = "ow-couture-users";
const SESSION_STORAGE_KEY = "ow-couture-active-user";

const AuthContext = createContext<AuthContextValue | null>(null);

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getStoredUsers() {
  if (!isBrowser()) {
    return [] as StoredUser[];
  }

  try {
    const rawValue = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((item): item is StoredUser => {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.email === "string" &&
        typeof item.password === "string" &&
        typeof item.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const users = getStoredUsers();
    const activeUserId = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!activeUserId) {
      setIsReady(true);
      return;
    }

    const foundUser = users.find((user) => user.id === activeUserId);
    if (foundUser) {
      setCurrentUser(toPublicUser(foundUser));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    setIsReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      currentUser,
      isReady,
      signUp: (name, email, password) => {
        const cleanedName = name.trim();
        const cleanedEmail = normalizeEmail(email);
        const cleanedPassword = password.trim();

        if (!cleanedName) {
          return { ok: false, message: "Name is required." };
        }

        if (!cleanedEmail) {
          return { ok: false, message: "Email is required." };
        }

        if (cleanedPassword.length < 6) {
          return { ok: false, message: "Password must be at least 6 characters." };
        }

        const users = getStoredUsers();
        if (users.some((user) => normalizeEmail(user.email) === cleanedEmail)) {
          return { ok: false, message: "An account with that email already exists." };
        }

        const createdUser: StoredUser = {
          id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}`,
          name: cleanedName,
          email: cleanedEmail,
          password: cleanedPassword,
          createdAt: new Date().toISOString(),
        };

        saveStoredUsers([createdUser, ...users]);

        if (isBrowser()) {
          window.localStorage.setItem(SESSION_STORAGE_KEY, createdUser.id);
        }

        setCurrentUser(toPublicUser(createdUser));
        return { ok: true };
      },
      logIn: (email, password) => {
        const cleanedEmail = normalizeEmail(email);
        const cleanedPassword = password.trim();

        const users = getStoredUsers();
        const foundUser = users.find((user) => normalizeEmail(user.email) === cleanedEmail);

        if (!foundUser || foundUser.password !== cleanedPassword) {
          return { ok: false, message: "Invalid email or password." };
        }

        if (isBrowser()) {
          window.localStorage.setItem(SESSION_STORAGE_KEY, foundUser.id);
        }

        setCurrentUser(toPublicUser(foundUser));
        return { ok: true };
      },
      logOut: () => {
        if (isBrowser()) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }

        setCurrentUser(null);
      },
    };
  }, [currentUser, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}