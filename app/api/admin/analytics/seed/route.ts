import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create sample customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+62812345678",
          address: "Jakarta, Indonesia"
        }
      }),
      prisma.customer.create({
        data: {
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+62812345679",
          address: "Bandung, Indonesia"
        }
      }),
      prisma.customer.create({
        data: {
          name: "Bob Wilson",
          email: "bob@example.com",
          phone: "+62812345680",
          address: "Surabaya, Indonesia"
        }
      })
    ]);

    // Create sample products
    const products = await Promise.all([
      prisma.productKustom.create({
        data: {
          modelId: "model-1",
          name: "Custom T-Shirt",
          modelUrl: "/models/tshirt.glb",
          photo: "/images/tshirt.jpg",
          uvUrl: "/models/tshirt-uv.jpg",
          price: 150000,
          isActive: true
        }
      }),
      prisma.productKustom.create({
        data: {
          modelId: "model-2",
          name: "Custom Hoodie",
          modelUrl: "/models/hoodie.glb",
          photo: "/images/hoodie.jpg",
          uvUrl: "/models/hoodie-uv.jpg",
          price: 250000,
          isActive: true
        }
      }),
      prisma.productKustom.create({
        data: {
          modelId: "model-3",
          name: "Custom Cap",
          modelUrl: "/models/cap.glb",
          photo: "/images/cap.jpg",
          uvUrl: "/models/cap-uv.jpg",
          price: 100000,
          isActive: true
        }
      })
    ]);

    // Create sample orders with different dates
    const now = new Date();
    const orders = [];

    // Generate orders for the last 30 days
    for (let i = 0; i < 50; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - randomDaysAgo);

      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];

      const order = await prisma.order.create({
        data: {
          orderId: `ORD-${Date.now()}-${i}`,
          status: ["PENDING", "PROCESSING", "COMPLETED"][Math.floor(Math.random() * 3)] as any,
          totalAmount: randomProduct.price,
          customerId: randomCustomer.id,
          productId: randomProduct.id,
          createdAt: orderDate,
          updatedAt: orderDate
        }
      });

      orders.push(order);
    }

    return NextResponse.json({
      success: true,
      message: "Sample data created successfully",
      data: {
        customers: customers.length,
        products: products.length,
        orders: orders.length
      }
    });
  } catch (error) {
    console.error("Seed Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create sample data"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
