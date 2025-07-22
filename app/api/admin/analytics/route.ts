import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d";

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get orders within the period with related data
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        customer: true,
        product: true,
        productKustom: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // Get all customers to calculate new vs returning
    const allCustomers = await prisma.customer.findMany({
      include: {
        orders: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + Number(order.totalAmount);
    }, 0);

    // Calculate total orders
    const totalOrders = orders.length;

    // Group orders by date for revenue trend
    const revenueByDate = orders.reduce((acc: any, order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += Number(order.totalAmount);
      acc[date].orders += 1;
      return acc;
    }, {});

    const revenueData = Object.values(revenueByDate).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate new vs returning customers
    const customersInPeriod = orders.map((order) => order.customerId);
    const uniqueCustomersInPeriod = [...new Set(customersInPeriod)];

    let newCustomers = 0;
    let returningCustomers = 0;

    uniqueCustomersInPeriod.forEach((customerId) => {
      const customer = allCustomers.find((c) => c.id === customerId);
      if (customer) {
        const firstOrderDate = customer.orders[0]?.createdAt;
        if (firstOrderDate && firstOrderDate >= startDate) {
          newCustomers++;
        } else {
          returningCustomers++;
        }
      }
    });

    // Calculate conversion rate (orders per unique customer)
    const conversionRate = uniqueCustomersInPeriod.length > 0 ? (totalOrders / uniqueCustomersInPeriod.length) * 100 : 0;

    // Calculate top products
    const productStats = orders.reduce((acc: any, order) => {
      const productId = order.productKustomId;
      if (!acc[productId]) {
        acc[productId] = {
          id: productId,
          name: order.productKustom.name,
          photo: order.productKustom.photo,
          orderCount: 0,
          revenue: 0
        };
      }
      acc[productId].orderCount += 1;
      acc[productId].revenue += Number(order.totalAmount);
      return acc;
    }, {});

    const topProducts = Object.values(productStats)
      .sort((a: any, b: any) => b.orderCount - a.orderCount)
      .slice(0, 10);

    // Format response
    const analyticsData = {
      revenue: {
        total: totalRevenue,
        data: revenueData
      },
      orders: {
        total: totalOrders
      },
      customers: {
        new: newCustomers,
        returning: returningCustomers,
        conversionRate: conversionRate
      },
      products: {
        top: topProducts
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
