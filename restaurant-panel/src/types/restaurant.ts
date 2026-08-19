export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface RestaurantProfile {
  id: string;
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  description?: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  cuisineTypes: string[];
  address: Address;
  gstNumber?: string;
  fssaiLicense?: string;
  panNumber?: string;
  bankDetails?: BankDetails;
  isOpen: boolean;
  avgRating: number;
  totalRatings: number;
  minOrderValue?: number;
  avgPreparationTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  restaurantName?: string;
  ownerName?: string;
  phone?: string;
  description?: string;
  cuisineTypes?: string[];
  address?: Address;
  minOrderValue?: number;
  avgPreparationTime?: number;
}

export interface UpdateBusinessDetailsPayload {
  gstNumber?: string;
  fssaiLicense?: string;
  panNumber?: string;
  bankDetails?: BankDetails;
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface WorkingHourSlot {
  openTime: string;
  closeTime: string;
}

export interface WorkingHourDay {
  day: WeekDay;
  isOpen: boolean;
  slots: WorkingHourSlot[];
}

export type WorkingHours = WorkingHourDay[];
