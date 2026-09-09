export interface Profile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image?: string;
}

export interface ProfileUpdatePayload {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}