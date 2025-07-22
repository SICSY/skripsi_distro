import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"

// Enhanced validation schema for both product types
const checkoutSchema = z.discriminatedUnion("type", [
  // ProductKustom checkout schema
  z.object({
    type: z.literal("kustom"),
    customer: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      address: z.string().min(1),
      notes: z.string().optional().default(""),
      userId: z.string().optional(),
    }),
    productKustom: z.object({
      modelId: z.union([z.string(), z.number()]).transform(String),
      modelName: z.string(),
      modelUrl: z.string(),
      modelPhoto: z.string().optional(),
      uvUrl: z.string().optional(),
    }),
    design: z.object({
      fabricData: z.any().optional(),
      designImage: z.string().optional(),
      backgroundColor: z.string().default("#ffffff"),
      decalColor: z.string().default("#ffffff"),
      objects: z.array(z.any()).default([]),
    }),
    metadata: z.object({
      orderId: z.string(),
      totalObjects: z.number().default(0),
      hasUVGuide: z.boolean().default(false),
      canvasSize: z
        .object({
          width: z.number(),
          height: z.number(),
        })
        .optional()
        .default({ width: 400, height: 400 }),
    }),
  }),
  // Regular Product checkout schema
  z.object({
    type: z.literal("regular"),
    customer: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      address: z.string().min(1),
      notes: z.string().optional().default(""),
      userId: z.string().optional(),
    }),
    product: z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      images: z.array(z.string()).optional(),
      category: z.string().optional(),
      size: z.string().optional(),
    }),
    orderDetails: z.object({
      quantity: z.number().min(1),
      orderId: z.string(),
      totalAmount: z.number(),
    }),
  }),
])

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ensure user exists in our database first
      let userData = await tx.user.findUnique({
        where: { providerId: userId },
      })

      if (!userData) {
        // Create user if doesn't exist
        userData = await tx.user.create({
          data: {
            providerId: userId,
            email: validatedData.customer.email,
            name: validatedData.customer.name,
          },
        })
      }

      // 2. Create or find customer linked to this user
      let customer = await tx.customer.findUnique({
        where: { userId: userId },
      })

      if (!customer) {
        // Create new customer linked to user
        customer = await tx.customer.create({
          data: {
            userId: userId, // Link to Clerk userId
            name: validatedData.customer.name,
            email: validatedData.customer.email,
            phone: validatedData.customer.phone,
            address: validatedData.customer.address,
            notes: validatedData.customer.notes || "",
          },
        })
      } else {
        // Update existing customer info
        customer = await tx.customer.update({
          where: { userId: userId },
          data: {
            name: validatedData.customer.name,
            email: validatedData.customer.email,
            phone: validatedData.customer.phone,
            address: validatedData.customer.address,
            notes: validatedData.customer.notes || "",
          },
        })
      }

      if (validatedData.type === "kustom") {
        // Handle ProductKustom checkout
        let productKustom = await tx.productKustom.findFirst({
          where: { id: validatedData.productKustom.modelId },
        })

        if (!productKustom) {
          productKustom = await tx.productKustom.create({
            data: {
              modelId: validatedData.productKustom.modelId,
              name: validatedData.productKustom.modelName,
              modelUrl: validatedData.productKustom.modelUrl,
              photo: validatedData.productKustom.modelPhoto,
              uvUrl: validatedData.productKustom.uvUrl,
              price: 100000, // Default price
            },
          })
        }

        // Create order
        const order = await tx.order.create({
          data: {
            orderId: validatedData.metadata.orderId,
            customerId: customer.id,
            productKustomId: productKustom.id,
            totalAmount: productKustom.price,
            status: "PENDING",
          },
        })

        // Create design
        const design = await tx.design.create({
          data: {
            orderId: order.id,
            fabricData: validatedData.design.fabricData,
            designImage: validatedData.design.designImage,
            backgroundColor: validatedData.design.backgroundColor,
            decalColor: validatedData.design.decalColor,
            totalObjects: validatedData.metadata.totalObjects,
            hasUVGuide: validatedData.metadata.hasUVGuide,
            canvasWidth: validatedData.metadata.canvasSize.width,
            canvasHeight: validatedData.metadata.canvasSize.height,
          },
        })

        // Create design objects
        if (validatedData.design.objects.length > 0) {
          await tx.designObject.createMany({
            data: validatedData.design.objects.map((obj: any) => ({
              designId: design.id,
              type: obj.type || "unknown",
              name: obj.name || "object",
              left: obj.properties?.left,
              top: obj.properties?.top,
              width: obj.properties?.width,
              height: obj.properties?.height,
              radius: obj.properties?.radius,
              fill: obj.properties?.fill,
              fontSize: obj.properties?.fontSize,
              text: obj.properties?.text,
              fontFamily: obj.properties?.fontFamily,
              opacity: obj.properties?.opacity,
            })),
          })
        }

        return {
          type: "kustom",
          order,
          customer,
          productKustom,
          design,
        }
      } else {
        // Handle Regular Product checkout
        const product = await tx.product.findUniqueOrThrow({
          where: { id: validatedData.product.id },
        })

        // Check stock
        if (product.stock < validatedData.orderDetails.quantity) {
          throw new Error("Insufficient stock")
        }

        // Create order
        const order = await tx.order.create({
          data: {
            orderId: validatedData.orderDetails.orderId,
            customerId: customer.id,
            productId: product.id,
            quantity: validatedData.orderDetails.quantity,
            totalAmount: validatedData.orderDetails.totalAmount,
            status: "PENDING",
          },
        })

        // Update product stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: validatedData.orderDetails.quantity,
            },
          },
        })

        return {
          type: "regular",
          order,
          customer,
          product,
        }
      }
    })

    // Return appropriate response based on product type
    if (result.type === "kustom") {
      return NextResponse.json(
        {
          success: true,
          message: "Custom order created successfully",
          data: {
            orderId: result.order.orderId,
            orderDbId: result.order.id,
            status: result.order.status,
            totalAmount: result.order.totalAmount,
            customer: {
              name: result.customer.name,
              email: result.customer.email,
            },
            productKustom: {
              name: result.productKustom?.name,
            },
          },
        },
        { status: 201 },
      )
    } else {
      return NextResponse.json(
        {
          success: true,
          message: "Order created successfully",
          data: {
            orderId: result.order.orderId,
            orderDbId: result.order.id,
            status: result.order.status,
            totalAmount: result.order.totalAmount,
            quantity: result.order.quantity,
            customer: {
              name: result.customer.name,
              email: result.customer.email,
            },
            product: {
              name: result.product?.name,
            },
          },
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Checkout error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 },
      )
    }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}
