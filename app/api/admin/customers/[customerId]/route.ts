import { type NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.customerId },
      include: {
        orders: {
          include: {
            product: { select: { name: true, photo: true } },
            design: { select: { totalObjects: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { orders: true } },
      },
    })

    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 })
    }

    // Calculate customer stats
    const totalSpent = customer.orders
      .filter((order) => order.status === "COMPLETED")
      .reduce((sum, order) => sum + Number(order.totalAmount), 0)

    const ordersByStatus = customer.orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        stats: {
          totalSpent,
          ordersByStatus,
        },
      },
    })
  } catch (error) {
    console.error("Customer detail API error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch customer" }, { status: 500 })
  }
}
