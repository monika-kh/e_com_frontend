import api from "./api";
import { Profile, ProfileUpdatePayload } from "../types/profile";

const profileError = (error: any, fallback: string) =>
  new Error(error?.response?.data?.detail || error?.response?.data?.error || error?.message || fallback);

export const ProfileService = {
  async get(): Promise<Profile> {
    try {
      const response = await api.get<Profile>("/users/profile/");
      return response.data;
    } catch (error: any) {
      throw profileError(error, "Failed to load profile.");
    }
  },

  async update(payload: ProfileUpdatePayload): Promise<Profile> {
    try {
      const response = await api.put<Profile>("/users/profile/", payload);
      return response.data;
    } catch (error: any) {
      const data = error?.response?.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const firstKey = Object.keys(data)[0];
        const firstMessage = firstKey ? data[firstKey]?.[0] : null;
        if (firstMessage) throw new Error(String(firstMessage));
      }
      throw profileError(error, "Failed to update profile.");
    }
  },
};