import { create } from "zustand";
import { apiRequest } from "../lib/apiClient";
import { AuthResponse } from "../types/api";
import { User } from "../types/domain";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  demoLogin: () => Promise<User>;
  hydrateMe: () => Promise<void>;
  logout: () => void;
};

function readUser() {
  const raw = localStorage.getItem("carbon-coach-user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function saveSession(response: AuthResponse) {
  localStorage.setItem("carbon-coach-token", response.token);
  localStorage.setItem("carbon-coach-user", JSON.stringify(response.user));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readUser(),
  token: localStorage.getItem("carbon-coach-token"),
  isLoading: false,

  async login(email, password) {
    set({ isLoading: true });
    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
        token: null
      });
      saveSession(response);
      set({ user: response.user, token: response.token, isLoading: false });
      return response.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async register(email, password, displayName) {
    set({ isLoading: true });
    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: { email, password, displayName },
        token: null
      });
      saveSession(response);
      set({ user: response.user, token: response.token, isLoading: false });
      return response.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async demoLogin() {
    set({ isLoading: true });
    try {
      const response = await apiRequest<AuthResponse>("/demo/login", {
        method: "POST",
        token: null
      });
      saveSession(response);
      set({ user: response.user, token: response.token, isLoading: false });
      return response.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  async hydrateMe() {
    const token = get().token;
    if (!token) return;
    try {
      const response = await apiRequest<{ user: User }>("/auth/me", { token });
      localStorage.setItem("carbon-coach-user", JSON.stringify(response.user));
      set({ user: response.user });
    } catch {
      get().logout();
    }
  },

  logout() {
    localStorage.removeItem("carbon-coach-token");
    localStorage.removeItem("carbon-coach-user");
    set({ user: null, token: null });
  }
}));

