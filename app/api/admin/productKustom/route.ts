import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
  modelId: z.string().min(1),
  name: z.string().min(1),
  modelUrl: z.string().optional(),
  photo: z.string().optional(),
  uvUrl: z.string().optional(),
  price: z.number().min(0),
  isActive: z.boolean().default(true)
});

// Helper function to serialize Prisma objects for client consumption
function serializeProduct(product: any) {
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
    updatedAt: product.updatedAt.toISOString(), // Convert Date to string
    _count: {
      orders: product._count.orders
    }
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" } }, { modelId: { contains: search, mode: "insensitive" } }]
        }
      : {};

    const [products, total] = await prisma.$transaction([
      prisma.productKustom.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          _count: {
            select: { orders: true }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.productKustom.count({ where: whereClause })
    ]);

    // Serialize all products to ensure they're safe for client consumption
    const serializedProducts = products.map(serializeProduct);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        productKustom: serializedProducts,
        pagination: {
          total,
          page,
          limit,
          pages: totalPages
        }
      }
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch products",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if modelId already exists
    const existingProduct = await prisma.productKustom.findUnique({
      where: { modelId: validatedData.modelId }
    });

    if (existingProduct) {
      return NextResponse.json({ success: false, message: "Product with this model ID already exists" }, { status: 400 });
    }

    const product = await prisma.productKustom.create({
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    console.error("Create product API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 });
  }
}
