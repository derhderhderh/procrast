import { NextRequest, NextResponse } from "next/server"

// This route handles cashout status checks. 
// Actual cashout processing is done via Firestore from the client.
// This could be extended with admin webhooks for fulfillment.

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cashoutId = searchParams.get("id")

  if (!cashoutId) {
    return NextResponse.json({ error: "Missing cashout ID" }, { status: 400 })
  }

  // Placeholder for admin fulfillment logic
  return NextResponse.json({
    message: "Cashout status check. Implement admin fulfillment webhooks here.",
    cashoutId,
  })
}
