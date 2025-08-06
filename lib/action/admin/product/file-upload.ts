"use client";
import { promises as fs } from "fs";
import path from "path";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGES_COUNT = 5; // Maximum 5 images per product

export const ALLOWED_TYPES = {
  model: [".glb", ".gltf"],
  photo: [".jpg", ".jpeg", ".png", ".webp"],
  uv: [".jpg", ".jpeg", ".png", ".webp"],
  image: [".jpg", ".jpeg", ".png", ".webp"] // For regular products
} as const;

export type FileType = keyof typeof ALLOWED_TYPES;

// Helper function to save a file to the public directory
export async function saveFileToPublic(file: File, type: FileType): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", type);
  await fs.mkdir(uploadDir, { recursive: true });

  const fileExtension = path.extname(file.name).toLowerCase();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const filename = `${timestamp}-${randomString}${fileExtension}`;
  const filepath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await fs.writeFile(filepath, buffer);

  return `/uploads/${type}/${filename}`; // Return the public URL
}

// Helper function to save multiple product images
export async function saveProductImages(files: File[]): Promise<string[]> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "product");
  await fs.mkdir(uploadDir, { recursive: true });

  const savedUrls: string[] = [];

  for (const file of files) {
    const fileExtension = path.extname(file.name).toLowerCase();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${randomString}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filepath, buffer);

    savedUrls.push(`/uploads/product/${filename}`);
  }

  return savedUrls;
}

// Helper function to save regular product image (keep for backward compatibility)
export async function saveProductImage(file: File): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "product");
  await fs.mkdir(uploadDir, { recursive: true });

  const fileExtension = path.extname(file.name).toLowerCase();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const filename = `${timestamp}-${randomString}${fileExtension}`;
  const filepath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await fs.writeFile(filepath, buffer);

  return `/uploads/product/${filename}`; // Return the public URL
}

// Helper function to delete a file from the public directory
export async function deleteFileFromPublic(publicUrl: string) {
  if (!publicUrl) return;

  const fullPath = path.join(process.cwd(), "public", publicUrl);
  try {
    await fs.unlink(fullPath);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.warn(`File not found for deletion: ${fullPath}`);
    } else {
      console.error(`Error deleting file ${fullPath}:`, error);
      throw error; // Re-throw if it's another type of error
    }
  }
}

// Helper function to delete multiple files
export async function deleteMultipleFiles(publicUrls: string[]) {
  for (const url of publicUrls) {
    await deleteFileFromPublic(url);
  }
}

// Helper function to validate file
export function validateFile(file: File, type: FileType): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File ${type} size too large (max ${MAX_FILE_SIZE / (1024 * 1024)}MB)`
    };
  }

  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_TYPES[type].includes(fileExtension as any)) {
    return {
      valid: false,
      error: `Invalid file type for ${type}. Allowed: ${ALLOWED_TYPES[type].join(", ")}`
    };
  }

  return { valid: true };
}

// Helper function to validate multiple images
export function validateImages(files: File[]): { valid: boolean; error?: string } {
  if (files.length > MAX_IMAGES_COUNT) {
    return {
      valid: false,
      error: `Maximum ${MAX_IMAGES_COUNT} images allowed`
    };
  }

  for (const file of files) {
    const validation = validateFile(file, "image");
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
}
