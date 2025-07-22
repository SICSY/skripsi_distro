import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/products - Get all regular products with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [{ name: { contains: search, mode: "insensitive" as const } }, { description: { contains: search, mode: "insensitive" as const } }]
            }
          : {},
        // Only filter by category if it's not "all" or empty
        category && category !== "all" ? { category: { equals: category } } : {}
      ]
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { orders: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.count({ where })
    ]);

    const pages = Math.ceil(total / limit);

    // Serialize the products to ensure dates are strings
    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price), // Convert Decimal to number
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: serializedProducts,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
