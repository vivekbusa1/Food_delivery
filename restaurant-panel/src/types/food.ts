export interface FoodCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  itemCount?: number;
  createdAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {
  isActive?: boolean;
}

export interface FoodVariant {
  id?: string;
  name: string;
  price: number;
}

export interface FoodAddOn {
  id?: string;
  name: string;
  price: number;
}

export interface FoodItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  discountPercent: number;
  effectivePrice: number;
  images: string[];
  isVeg: boolean;
  isAvailable: boolean;
  variants: FoodVariant[];
  addOns: FoodAddOn[];
  tags?: string[];
  avgRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodPayload {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  discountPercent?: number;
  isVeg: boolean;
  isAvailable?: boolean;
  variants?: FoodVariant[];
  addOns?: FoodAddOn[];
  tags?: string[];
  images?: string[];
}

export interface FoodListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
}
