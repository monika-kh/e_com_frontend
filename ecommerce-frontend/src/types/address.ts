export interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface CreateAddressPayload {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}

