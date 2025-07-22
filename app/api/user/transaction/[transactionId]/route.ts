import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await params;

  try {
    const transaction = await prisma.order.findUnique({
      where: { orderId: transactionId },
      include: {
        customer: true,
        productKustom: true,
        design: true
      }
    });
    console.log("dat ", transaction);
    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("Transaction detail API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
