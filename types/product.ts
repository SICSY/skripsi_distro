export interface ProductKustomFormData {
  modelId: string;
  name: string;
  price: number;
  isActive: boolean;
  modelUrl?: string | null;
  photo?: string | null;
  uvUrl?: string | null;
}

export interface ProductFormData {
  name: string;
  description?: string;
  size: string;
  price: number;
  stock: number;
  category?: string;
  images?: string[]; // Changed from imageUrl to images array
  isActive: boolean;
}

export interface FileData {
  model?: File | null;
  photo?: File | null;
  uv?: File | null;
}

export interface ProductFileData {
  images?: File[]; // Changed from single image to multiple images
}

export interface SaveProductKustomParams {
  id?: string;
  formData: ProductKustomFormData;
  newFiles: FileData;
  originalFiles?: {
    modelUrl?: string | null;
    photo?: string | null;
    uvUrl?: string | null;
  };
}

export interface SaveProductParams {
  id?: string;
  formData: ProductFormData;
  newFiles: ProductFileData;
  originalFiles?: {
    images?: string[]; // Changed from imageUrl to images array
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  size: string;
  price: number;
  stock: number;
  category?: string;
  images?: string[]; // Changed from imageUrl to images array
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
  };
}

export interface SerializedProduct {
  id: string;
  name: string;
  description?: string;
  size: string;
  price: number;
  stock: number;
  category?: string;
  images?: string[]; // Changed from imageUrl to images array
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
