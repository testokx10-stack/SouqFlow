export type ProductCondition = 'neuf' | 'tres_bon' | 'bon' | 'use';
export type ListingStatus = 'active' | 'sold' | 'inactive';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: ProductCondition;
  location: string;
  seller_name: string;
  seller_whatsapp: string;
  image_url: string | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  condition: ProductCondition;
  location: string;
  seller_name: string;
  seller_whatsapp: string;
  image_url: string | null;
}
