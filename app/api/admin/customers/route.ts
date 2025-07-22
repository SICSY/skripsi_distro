import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }, { phone: { contains: search, mode: "insensitive" } }];
    }

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { orders: true } },
          orders: {
            select: { totalAmount: true, status: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.customer.count({ where })
    ]);
    console.log(customers);

    // Calculate total spent for each customer
    const customersWithStats = customers.map((customer) => ({
      ...customer,
      totalSpent: customer.orders.filter((order) => order.status === "COMPLETED").reduce((sum, order) => sum + Number(order.totalAmount), 0)
    }));

    return NextResponse.json({
      success: true,
      data: {
        customers: customersWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Customers API error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch customers" }, { status: 500 });
  }
}
