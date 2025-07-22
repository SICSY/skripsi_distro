// import useSWR from "swr";
// import { toast } from "sonner";
// import { saveProductKustomWithFiles, deleteProductKustomWithFiles } from "@/lib/action/admin/product/file-upload"; // Import Server Actions

// // Assuming your API structure for fetching products
// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// // Dashboard hooks
// export function useDashboardStats() {
//   return useSWR("/api/admin/dashboard", fetcher, {
//     refreshInterval: 30000 // Refresh every 30 seconds
//   });
// }

// // Orders hooks
// export function useOrders(page = 1, limit = 10, status?: string, search?: string) {
//   const params = new URLSearchParams({
//     page: page.toString(),
//     limit: limit.toString(),
//     ...(status && { status }),
//     ...(search && { search })
//   });

//   return useSWR(`/api/admin/orders?${params}`, fetcher);
// }

// export function useOrder(orderId: string) {
//   return useSWR(orderId ? `/api/admin/orders/${orderId}` : null, fetcher);
// }

// // Products hooks
// export function useProductKustoms(page: number, limit: number, search: string) {
//   const query = new URLSearchParams();
//   query.append("page", page.toString());
//   query.append("limit", limit.toString());
//   if (search) {
//     query.append("search", search);
//   }
//   return useSWR(`/api/admin/productKustom?${query.toString()}`, fetcher);
// }
// export function useProductKustom(productId: string) {
//   return useSWR(productId ? `/api/admin/productKustom/${productId}` : null, fetcher);
// }

// // Customers hooks
// export function useCustomers(page = 1, limit = 10, search?: string) {
//   const params = new URLSearchParams({
//     page: page.toString(),
//     limit: limit.toString(),
//     ...(search && { search })
//   });

//   return useSWR(`/api/admin/customers?${params}`, fetcher);
// }

// export function useCustomer(customerId: string) {
//   return useSWR(customerId ? `/api/admin/customers/${customerId}` : null, fetcher);
// }

// // Analytics hooks
// export function useAnalytics(period = "7d") {
//   return useSWR(`/api/admin/analytics?period=${period}`, fetcher);
// }

// // Settings hooks
// export function useSettings() {
//   return useSWR("/api/admin/settings", fetcher);
// }

// // Mutation helpers
// export async function updateOrderStatus(orderId: string, status: string) {
//   try {
//     const response = await fetch(`/api/admin/orders/${orderId}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status })
//     });

//     const result = await response.json();
//     if (result.success) {
//       toast.success("Order status updated successfully");
//       return result;
//     } else {
//       toast.error(result.message || "Failed to update order status");
//       throw new Error(result.message);
//     }
//   } catch (error) {
//     toast.error("Failed to update order status");
//     throw error;
//   }
// }

// // Modified createProduct to use Server Action
// export async function createProductKustom(data: any, newFiles: any) {
//   const result = await saveProductKustomWithFiles({ formData: data, newFiles });
//   if (!result.success) {
//     throw new Error(result.message);
//   }
//   return result.data;
// }

// // Modified updateProduct to use Server Action
// export async function updateProductKustom(id: string, data: any, newFiles: any, originalFiles: any) {
//   const result = await saveProductKustomWithFiles({ id, formData: data, newFiles, originalFiles });
//   if (!result.success) {
//     throw new Error(result.message);
//   }
//   return result.data;
// }

// // Modified deleteProduct to use Server Action
// export async function deleteProductKustom(id: string, fileUrls: string[]) {
//   const result = await deleteProductKustomWithFiles(id, fileUrls);
//   if (!result.success) {
//     throw new Error(result.message);
//   }
//   return result.message;
// }

// export interface Product {
//   id: string;
//   name: string;
//   description?: string;
//   price: number;
//   stock: number;
//   category?: string;
//   imageUrl?: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
//   _count: {
//     orders: number;
//   };
// }

// export interface ProductsResponse {
//   success: boolean;
//   data: {
//     products: Product[];
//     pagination: {
//       page: number;
//       limit: number;
//       total: number;
//       pages: number;
//     };
//   };
// }

// export interface ProductResponse {
//   success: boolean;
//   data: Product;
// }

// // Hook to fetch products with pagination and search
// export function useProducts(page = 1, limit = 10, search = "", category = "") {
//   const params = new URLSearchParams({
//     page: page.toString(),
//     limit: limit.toString(),
//     ...(search && { search }),
//     ...(category && { category })
//   });

//   const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(`/api/admin/products?${params.toString()}`, fetcher);

//   return {
//     data,
//     error,
//     isLoading,
//     mutate
//   };
// }

// // Hook to fetch single product
// export function useProduct(id: string) {
//   const { data, error, isLoading, mutate } = useSWR<ProductResponse>(id ? `/api/products/${id}` : null, fetcher);

//   return {
//     data,
//     error,
//     isLoading,
//     mutate
//   };
// }

// // API functions for CRUD operations
// export async function createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "_count">) {
//   try {
//     const response = await fetch("/api/products", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(productData)
//     });

//     const result = await response.json();

//     if (!result.success) {
//       throw new Error(result.error || "Failed to create product");
//     }

//     return result.data;
//   } catch (error) {
//     console.error("Error creating product:", error);
//     throw error;
//   }
// }

// export async function updateProduct(id: string, productData: Partial<Product>) {
//   try {
//     const response = await fetch(`/api/products/${id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(productData)
//     });

//     const result = await response.json();

//     if (!result.success) {
//       throw new Error(result.error || "Failed to update product");
//     }

//     return result.data;
//   } catch (error) {
//     console.error("Error updating product:", error);
//     throw error;
//   }
// }

// export async function deleteProduct(id: string) {
//   try {
//     const response = await fetch(`/api/products/${id}`, {
//       method: "DELETE"
//     });

//     const result = await response.json();

//     if (!result.success) {
//       throw new Error(result.error || "Failed to delete product");
//     }

//     return true;
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     throw error;
//   }
// }
import useSWR from "swr";
import { toast } from "sonner";
import { saveProductKustomWithFiles, deleteProductKustomWithFiles, saveProductWithFiles, deleteProductWithFiles } from "@/lib/action/admin/product/action";
import type { Product, ProductFormData, ProductFileData } from "@/types/product";

// Assuming your API structure for fetching products
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Dashboard hooks
export function useDashboardStats() {
  return useSWR("/api/admin/dashboard", fetcher, {
    refreshInterval: 30000 // Refresh every 30 seconds
  });
}

// Orders hooks
export function useOrders(page = 1, limit = 10, status?: string, search?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(search && { search })
  });
  return useSWR(`/api/admin/orders?${params}`, fetcher);
}

export function useOrder(orderId: string) {
  return useSWR(orderId ? `/api/admin/orders/${orderId}` : null, fetcher);
}

// ProductKustom hooks
export function useProductKustoms(page: number, limit: number, search: string) {
  const query = new URLSearchParams();
  query.append("page", page.toString());
  query.append("limit", limit.toString());
  if (search) {
    query.append("search", search);
  }
  return useSWR(`/api/admin/productKustom?${query.toString()}`, fetcher);
}

export function useProductKustom(productId: string) {
  return useSWR(productId ? `/api/admin/productKustom/${productId}` : null, fetcher);
}

// Regular Products hooks
export function useProducts(page = 1, limit = 10, search = "", category = "") {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(category && { category })
  });
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: {
      products: Product[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }>(`/api/admin/products?${params.toString()}`, fetcher);

  return {
    data,
    error,
    isLoading,
    mutate
  };
}

export function useProduct(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: Product;
  }>(id ? `/api/admin/products/${id}` : null, fetcher);

  return {
    data,
    error,
    isLoading,
    mutate
  };
}

// Customers hooks
export function useCustomers(page = 1, limit = 10, search?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search })
  });
  return useSWR(`/api/admin/customers?${params}`, fetcher);
}

export function useCustomer(customerId: string) {
  return useSWR(customerId ? `/api/admin/customers/${customerId}` : null, fetcher);
}

// Analytics hooks
export function useAnalytics(period = "7d") {
  return useSWR(`/api/admin/analytics?period=${period}`, fetcher);
}

// Settings hooks
export function useSettings() {
  return useSWR("/api/admin/settings", fetcher);
}

// Mutation helpers for orders
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    if (result.success) {
      toast.success("Order status updated successfully");
      return result;
    } else {
      toast.error(result.message || "Failed to update order status");
      throw new Error(result.message);
    }
  } catch (error) {
    toast.error("Failed to update order status");
    throw error;
  }
}

// ProductKustom CRUD operations using Server Actions
export async function createProductKustom(data: any, newFiles: any) {
  const result = await saveProductKustomWithFiles({ formData: data, newFiles });
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
}

export async function updateProductKustom(id: string, data: any, newFiles: any, originalFiles: any) {
  const result = await saveProductKustomWithFiles({ id, formData: data, newFiles, originalFiles });
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
}

export async function deleteProductKustom(id: string, fileUrls: string[]) {
  const result = await deleteProductKustomWithFiles(id, fileUrls);
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.message;
}

// Regular Product CRUD operations using Server Actions
export async function createProduct(data: ProductFormData, newFiles: ProductFileData) {
  const result = await saveProductWithFiles({ formData: data, newFiles });
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
}

export async function updateProduct(id: string, data: ProductFormData, newFiles: ProductFileData, originalFiles?: { imageUrl?: string | null }) {
  const result = await saveProductWithFiles({ id, formData: data, newFiles, originalFiles });
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
}

export async function deleteProduct(id: string, imageUrl?: string) {
  const result = await deleteProductWithFiles(id, imageUrl);
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.message;
}

// Export types
export type { Product, ProductFormData };
