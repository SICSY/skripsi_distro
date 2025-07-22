import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for temporary checkout data
// In production, you should use Redis or database
const tempStorage = new Map<string, any>()

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of tempStorage.entries()) {
    if (now - value.timestamp > 3600000) {
      // 1 hour
      tempStorage.delete(key)
    }
  }
}, 3600000)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkoutData } = body

    // Generate unique ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store with timestamp
    tempStorage.set(tempId, {
      data: checkoutData,
      timestamp: Date.now(),
    })

    return NextResponse.json({
      success: true,
      tempId,
      message: "Checkout data stored temporarily",
    })
  } catch (error) {
    console.error("Temp storage error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to store checkout data",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tempId = searchParams.get("id")

    if (!tempId) {
      return NextResponse.json(
        {
          success: false,
          message: "Temp ID is required",
        },
        { status: 400 },
      )
    }

    const stored = tempStorage.get(tempId)

    if (!stored) {
      return NextResponse.json(
        {
          success: false,
          message: "Checkout data not found or expired",
        },
        { status: 404 },
      )
    }

    // Delete after retrieval for security
    tempStorage.delete(tempId)

    return NextResponse.json({
      success: true,
      data: stored.data,
    })
  } catch (error) {
    console.error("Temp retrieval error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve checkout data",
      },
      { status: 500 },
    )
  }
}
