import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  modelUrl: z.string().url().optional(),
  photo: z.string().optional(),
  uvUrl: z.string().optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional()
});

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const product = await prisma.productKustom.findUnique({
      where: { id: params.productId },
      include: {
        orders: {
          include: {
            customer: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: { select: { orders: true } }
      }
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Product detail API error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    const product = await prisma.productKustom.update({
      where: { id: params.productId },
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    console.error("Update product API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ produkId: string }> }) {
  const { produkId } = await params;
  try {
    await prisma.product.delete({
      where: { id: produkId }
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product API error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 });
  }
}
