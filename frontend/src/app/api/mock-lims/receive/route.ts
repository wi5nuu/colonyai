import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[MOCK LIMS] Received payload:", JSON.stringify(body, null, 2));

    // Simulated processing time
    await new Promise((resolve) => setTimeout(resolve, 800));

    const limsRecordId = `LIMS-${uuidv4().split("-")[0].toUpperCase()}`;
    const timestamp = new Date().toISOString();

    return NextResponse.json({
      status: "received",
      lims_record_id: limsRecordId,
      message: "Sample result accepted by SampleManager. Record created.",
      timestamp: timestamp,
      next_action: "Awaiting supervisor approval in LIMS queue.",
    });
  } catch (error) {
    console.error("[MOCK LIMS] Error processing request:", error);
    return NextResponse.json(
      { status: "error", message: "Invalid payload format" },
      { status: 400 }
    );
  }
}
