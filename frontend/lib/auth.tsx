"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

interface SessionResponse {
  token: string;
  user: { data: User } | User;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ data: User }>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const persistSession = useCallback(
    (res: SessionResponse) => {
      localStorage.setItem("token", res.token);
      const loggedUser = "data" in res.user ? res.user.data : res.user;
      setUser(loggedUser);
      router.push("/dashboard");
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<SessionResponse>("/auth/login", {
        email,
        password,
      });
      persistSession(res);
    },
    [persistSession]
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      passwordConfirmation: string;
    }) => {
      const res = await api.post<SessionResponse>("/auth/register", {
        name: input.name,
        email: input.email,
        password: input.password,
        password_confirmation: input.passwordConfirmation,
      });
      persistSession(res);
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
