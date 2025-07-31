import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: params.orderId },
      include: {
        customer: true,
        product: true,
        productKustom: true,
        design: {
          include: {
            designObjects: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Order detail API error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const body = await request.json();
    const { status } = body;

    const order = await prisma.order.update({
      where: { orderId: params.orderId },
      data: { status },
      include: {
        customer: { select: { name: true, email: true } },
        product: true,
        productKustom: { select: { name: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    console.error("Update order API error:", error);
    return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 });
  }
}
