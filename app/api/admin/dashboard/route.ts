import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get current date and 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total counts
    const [totalOrders, totalCustomers, totalProducts, totalRevenue] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.productKustom.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "COMPLETED" }
      })
    ]);

    // Recent orders (last 30 days)
    const recentOrders = await prisma.order.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true }
    });

    // Revenue trend (last 7 days)
    const revenueTrend = await prisma.order.groupBy({
      by: ["createdAt"],
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: "COMPLETED"
      },
      orderBy: { createdAt: "asc" }
    });

    // Top products
    const topProducts = await prisma.productKustom.findMany({
      include: {
        orders: {
          where: { status: "COMPLETED" }
        },
        _count: { select: { orders: true } }
      },
      orderBy: {
        orders: { _count: "desc" }
      },
      take: 5
    });

    // Recent orders with details
    const recentOrdersList = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        productKustom: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalCustomers,
          totalProducts,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          recentOrders
        },
        ordersByStatus: ordersByStatus.map((item) => ({
          status: item.status,
          count: item._count.status
        })),
        revenueTrend: revenueTrend.map((item) => ({
          date: item.createdAt,
          revenue: item._sum.totalAmount || 0
        })),
        topProducts: topProducts.map((product) => ({
          id: product.id,
          name: product.name,
          orderCount: product._count.orders,
          photo: product.photo
        })),
        recentOrders: recentOrdersList
      }
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
