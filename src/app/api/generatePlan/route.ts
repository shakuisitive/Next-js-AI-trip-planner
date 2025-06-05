import { NextResponse } from "next/server";
import { generateTravelPlanWithGemini } from "@/utils/gemini";
import { TravelPlanRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const travelPlanRequest: TravelPlanRequest = {
      destination: body.destination,
      startDate: body.startDate,
      endDate: body.endDate,
      budgetMin: body.budgetMin,
      budgetMax: body.budgetMax,
      groupType: body.groupType,
      travelStyle: body.travelStyle,
      pace: body.pace,
      interests: body.interests,
      userId: body.userId,
    };

    const plan = await generateTravelPlanWithGemini(travelPlanRequest);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate travel plan" },
      { status: 500 }
    );
  }
}
