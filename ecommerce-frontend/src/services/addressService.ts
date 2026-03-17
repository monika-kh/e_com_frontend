import api from "./api";
import { Address, CreateAddressPayload } from "../types/address";

export const AddressService = {
  async list(): Promise<Address[]> {
    try {
      const res = await api.get<Address[]>("/users/addresses/");
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch addresses"
      );
    }
  },

  async add(payload: CreateAddressPayload): Promise<Address> {
    try {
      const res = await api.post<Address>("/users/addresses/", payload);
      return res.data;
    } catch (error: any) {
      const data = error?.response?.data;
      // DRF validation errors come back as field -> [messages]
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const firstKey = Object.keys(data)[0];
        const firstMsg = firstKey ? data[firstKey]?.[0] : null;
        if (firstMsg) throw new Error(String(firstMsg));
      }
      throw new Error(
        data?.detail || data?.error || error?.message || "Failed to add address"
      );
    }
  },

  async update(addressId: number, payload: Partial<CreateAddressPayload>): Promise<Address> {
    try {
      const res = await api.patch<Address>(`/users/addresses/${addressId}/update/`, payload);
      return res.data;
    } catch (error: any) {
      const data = error?.response?.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const firstKey = Object.keys(data)[0];
        const firstMsg = firstKey ? data[firstKey]?.[0] : null;
        if (firstMsg) throw new Error(String(firstMsg));
      }
      throw new Error(
        data?.detail || data?.error || error?.message || "Failed to update address"
      );
    }
  },

  async remove(addressId: number): Promise<void> {
    try {
      await api.delete(`/users/addresses/${addressId}/`);
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to delete address"
      );
    }
  },
};

