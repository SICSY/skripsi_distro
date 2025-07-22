import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get orders for the current user
    const orders = await prisma.order.findMany({
      where: {
        customer: {
          userId: userId // Filter by Clerk userId
        }
      },
      include: {
        productKustom: {
          select: {
            id: true,
            name: true,
            price: true,
            photo: true,
            modelUrl: true,
            uvUrl: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            category: true,
            size: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            notes: true
          }
        },
        design: {
          include: {
            designObjects: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Serialize the data
    const serializedOrders = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      productKustom: order.productKustom
        ? {
            ...order.productKustom,
            price: Number(order.productKustom.price)
          }
        : null,
      product: order.product
        ? {
            ...order.product,
            price: Number(order.product.price)
          }
        : null
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Orders retrieved successfully",
        data: serializedOrders,
        userId: userId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders"
      },
      { status: 500 }
    );
  }
}
