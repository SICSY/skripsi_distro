import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const orderId = await params.orderId;
    const order = await prisma.order.findUnique({
      where: { orderId: orderId },
      include: {
        customer: true,
        productKustom: true,
        design: {
          include: {
            designObjects: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error"
      },
      { status: 500 }
    );
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
        customer: true,
        productKustom: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated",
      data: order
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error"
      },
      { status: 500 }
    );
  }
}
