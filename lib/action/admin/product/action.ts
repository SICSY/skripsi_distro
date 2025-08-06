"use server";
import prisma from "@/lib/prisma";
import { saveFileToPublic, saveProductImages, deleteFileFromPublic, deleteMultipleFiles, validateFile, validateImages } from "@/lib/action/admin/product/file-upload";
import type { SaveProductKustomParams, SaveProductParams, SerializedProduct } from "@/types/product";

// Helper function to serialize a ProductKustom for client consumption
function serializeProductKustom(product: any) {
  return {
    id: product.id,
    modelId: product.modelId,
    name: product.name,
    modelUrl: product.modelUrl,
    photo: product.photo,
    uvUrl: product.uvUrl,
    price: Number(product.price), // Convert Decimal to number
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(), // Convert Date to string
    updatedAt: product.updatedAt.toISOString() // Convert Date to string
  };
}

// Helper function to serialize a regular Product for client consumption
function serializeProduct(product: any): SerializedProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    size: product.size,
    likes: product.likes,
    price: Number(product.price), // Convert Decimal to number
    stock: product.stock,
    category: product.category,
    images: product.images || [], // Handle images array
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(), // Convert Date to string
    updatedAt: product.updatedAt.toISOString() // Convert Date to string
  };
}

// ProductKustom CRUD operations (unchanged)
export async function saveProductKustomWithFiles({ id, formData, newFiles, originalFiles }: SaveProductKustomParams) {
  try {
    // Server-side validation
    if (!formData.modelId || !formData.name || formData.price === undefined || formData.price < 0) {
      return { success: false, message: "Model ID, Name, and Price are required and valid." };
    }

    const finalFileUrls: {
      modelUrl?: string | null;
      photo?: string | null;
      uvUrl?: string | null;
    } = {
      modelUrl: formData.modelUrl,
      photo: formData.photo,
      uvUrl: formData.uvUrl
    };

    // Process each file type
    for (const type of ["model", "photo", "uv"] as const) {
      const file = newFiles[type];
      const currentUrlKey = type === "model" ? "modelUrl" : type === "photo" ? "photo" : "uvUrl";
      const originalUrl = originalFiles?.[currentUrlKey];

      if (file) {
        // Validate file before processing
        const validation = validateFile(file, type);
        if (!validation.valid) {
          return { success: false, message: validation.error };
        }

        const newPublicUrl = await saveFileToPublic(file, type);
        finalFileUrls[currentUrlKey] = newPublicUrl;

        // If there was an original file and a new one is uploaded, delete the original
        if (originalUrl) {
          await deleteFileFromPublic(originalUrl);
        }
      } else if (originalUrl && !formData[currentUrlKey]) {
        // File was removed from the form, delete original
        await deleteFileFromPublic(originalUrl);
        finalFileUrls[currentUrlKey] = null;
      } else if (!file && formData[currentUrlKey]) {
        // No new file, but formData still has a URL (keeping original)
        finalFileUrls[currentUrlKey] = formData[currentUrlKey];
      } else {
        // No file ever, or file was removed and no original existed
        finalFileUrls[currentUrlKey] = null;
      }
    }

    // Ensure modelUrl is present for new products
    if (!id && !finalFileUrls.modelUrl) {
      return { success: false, message: "3D Model File is required for new products." };
    }

    // Perform database operation
    let product;
    if (id) {
      // Update existing product
      product = await prisma.productKustom.update({
        where: { id },
        data: {
          modelId: formData.modelId,
          name: formData.name,
          price: Number(formData.price),
          isActive: formData.isActive,
          modelUrl: finalFileUrls.modelUrl,
          photo: finalFileUrls.photo,
          uvUrl: finalFileUrls.uvUrl
        }
      });
    } else {
      // Create new product
      product = await prisma.productKustom.create({
        data: {
          modelId: formData.modelId,
          name: formData.name,
          price: formData.price,
          isActive: formData.isActive,
          modelUrl: finalFileUrls.modelUrl!, // Assert non-null as checked above
          photo: finalFileUrls.photo || null,
          uvUrl: finalFileUrls.uvUrl || null
        }
      });
    }

    // Serialize product before returning to client
    const serializedProduct = serializeProductKustom(product);
    return { success: true, message: "Product saved successfully", data: serializedProduct };
  } catch (error: any) {
    console.error("Error saving product with files:", error);
    return { success: false, message: error.message || "Failed to save product" };
  }
}

export async function deleteProductKustomWithFiles(productId: string, fileUrls: string[]) {
  try {
    // Delete product from database
    await prisma.productKustom.delete({
      where: { id: productId }
    });

    // Delete associated files from public folder
    for (const url of fileUrls) {
      await deleteFileFromPublic(url);
    }

    return { success: true, message: "Product deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting product with files:", error);
    return { success: false, message: error.message || "Failed to delete product" };
  }
}

// Regular Product CRUD operations - Updated for multiple images
export async function saveProductWithFiles({ id, formData, newFiles, originalFiles }: SaveProductParams) {
  try {
    // Server-side validation
    if (!formData.name || formData.price === undefined || formData.price < 0 || formData.stock < 0) {
      return { success: false, message: "Name, valid Price, and Stock are required." };
    }

    let finalImages = formData.images || [];

    // Process multiple images
    if (newFiles.images && newFiles.images.length > 0) {
      // Validate images before processing
      const validation = validateImages(newFiles.images);
      if (!validation.valid) {
        return { success: false, message: validation.error };
      }

      const newImageUrls = await saveProductImages(newFiles.images);

      // If there were original images and new ones are uploaded, delete the originals
      if (originalFiles?.images && originalFiles.images.length > 0) {
        await deleteMultipleFiles(originalFiles.images);
      }

      finalImages = newImageUrls;
    } else if (originalFiles?.images && (!formData.images || formData.images.length === 0)) {
      // Images were removed from the form, delete originals
      await deleteMultipleFiles(originalFiles.images);
      finalImages = [];
    }

    // Perform database operation
    let product;
    if (id) {
      // Update existing product
      product = await prisma.product.update({
        where: { id },
        data: {
          name: formData.name,
          description: formData.description,
          size: formData.size,
          price: Number(formData.price),
          stock: Number(formData.stock),
          category: formData.category,
          images: finalImages, // Store as JSON array
          isActive: formData.isActive
        }
      });
    } else {
      // Create new product
      product = await prisma.product.create({
        data: {
          name: formData.name,
          description: formData.description,
          size: formData.size,
          price: Number(formData.price),
          stock: Number(formData.stock),
          category: formData.category,
          images: finalImages, // Store as JSON array
          isActive: formData.isActive
        }
      });
    }

    // Serialize product before returning to client
    const serializedProduct = serializeProduct(product);
    return { success: true, message: "Product saved successfully", data: serializedProduct };
  } catch (error: any) {
    console.error("Error saving product with files:", error);
    return { success: false, message: error.message || "Failed to save product" };
  }
}

export async function deleteProductWithFiles(productId: string, images?: string[]) {
  try {
    // Delete product from database
    await prisma.product.delete({
      where: { id: productId }
    });

    // Delete associated images from public folder
    if (images && images.length > 0) {
      await deleteMultipleFiles(images);
    }

    return { success: true, message: "Product deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting product with files:", error);
    return { success: false, message: error.message || "Failed to delete product" };
  }
}

export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    return { success: true, data: serializeProduct(product) };
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return { success: false, message: error.message || "Failed to fetch product" };
  }
}

export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const serializedProducts = products.map(serializeProduct);
    return { success: true, data: serializedProducts };
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return { success: false, message: error.message || "Failed to fetch products" };
  }
}
