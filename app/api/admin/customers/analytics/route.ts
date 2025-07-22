import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d"

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Revenue analytics
    const revenueData = await prisma.order.groupBy({
      by: ["createdAt"],
      _sum: { totalAmount: true },
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
        status: "COMPLETED",
      },
      orderBy: { createdAt: "asc" },
    })

    // Orders analytics
    const ordersData = await prisma.order.groupBy({
      by: ["createdAt", "status"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    })

    // Top products
    const topProducts = await prisma.productKustom.findMany({
      include: {
        orders: {
          where: {
            createdAt: { gte: startDate },
            status: "COMPLETED",
          },
        },
        _count: {
          select: {
            orders: {
              where: {
                createdAt: { gte: startDate },
                status: "COMPLETED",
              },
            },
          },
        },
      },
      orderBy: {
        orders: { _count: "desc" },
      },
      take: 10,
    })

    // Customer analytics
    const newCustomers = await prisma.customer.count({
      where: {
        createdAt: { gte: startDate },
      },
    })

    const returningCustomers = await prisma.customer.count({
      where: {
        orders: {
          some: {
            createdAt: { gte: startDate },
          },
        },
        createdAt: { lt: startDate },
      },
    })

    // Conversion rate (orders vs customers)
    const totalOrders = await prisma.order.count({
      where: { createdAt: { gte: startDate } },
    })
    const totalCustomers = await prisma.customer.count({
      where: { createdAt: { gte: startDate } },
    })

    return NextResponse.json({
      success: true,
      data: {
        period,
        dateRange: { start: startDate, end: now },
        revenue: {
          data: revenueData.map((item) => ({
            date: item.createdAt,
            revenue: Number(item._sum.totalAmount || 0),
            orders: item._count.id,
          })),
          total: revenueData.reduce((sum, item) => sum + Number(item._sum.totalAmount || 0), 0),
        },
        orders: {
          data: ordersData,
          total: totalOrders,
        },
        products: {
          top: topProducts.map((product) => ({
            id: product.id,
            name: product.name,
            photo: product.photo,
            orderCount: product._count.orders,
            revenue: product.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
          })),
        },
        customers: {
          new: newCustomers,
          returning: returningCustomers,
          conversionRate: totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0,
        },
      },
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch analytics data" }, { status: 500 })
  }
}
