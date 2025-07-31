// import { type NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const page = Number.parseInt(searchParams.get("page") || "1");
//     const limit = Number.parseInt(searchParams.get("limit") || "10");
//     const search = searchParams.get("search");

//     const skip = (page - 1) * limit;

//     // Build where clause
//     const where: any = {};
//     if (search) {
//       where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }, { phone: { contains: search, mode: "insensitive" } }];
//     }

//     // Get customers with pagination
//     const [customers, total] = await Promise.all([
//       prisma.customer.findMany({
//         where,
//         include: {
//           _count: { select: { orders: true } },
//           orders: {
//             select: { totalAmount: true, status: true }
//           }
//         },
//         orderBy: { createdAt: "desc" },
//         skip,
//         take: limit
//       }),
//       prisma.customer.count({ where })
//     ]);
//     console.log(customers);

//     // Calculate total spent for each customer
//     const customersWithStats = customers.map((customer) => ({
//       ...customer,
//       totalSpent: customer.orders.filter((order) => order.status === "COMPLETED").reduce((sum, order) => sum + Number(order.totalAmount), 0)
//     }));

//     return NextResponse.json({
//       success: true,
//       data: {
//         customers: customersWithStats,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit)
//         }
//       }
//     });
//   } catch (error) {
//     console.error("Customers API error:", error);
//     return NextResponse.json({ success: false, message: "Failed to fetch customers" }, { status: 500 });
//   }
// }
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }, { phone: { contains: search, mode: "insensitive" as const } }]
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { orders: true }
          },
          orders: {
            select: {
              totalAmount: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.customer.count({ where })
    ]);

    const pages = Math.ceil(total / limit);

    // Calculate total spent for each customer
    const serializedCustomers = customers.map((customer) => {
      const totalSpent = customer.orders.filter((order) => order.status === "COMPLETED").reduce((sum, order) => sum + Number(order.totalAmount), 0);

      return {
        ...customer,
        totalSpent,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        customers: serializedCustomers,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      }
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 });
  }
}
