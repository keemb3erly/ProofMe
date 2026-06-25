import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const value = searchParams.get("value");

    console.log("SEARCH VALUE:", value);

    if (!value) {
      return NextResponse.json(
        { error: "Search value is required" },
        { status: 400 }
      );
    }

    const entity = await prisma.entity.findFirst({
      where: {
        value,
      },
    });

    console.log("FOUND ENTITY:", entity);

    if (!entity) {
      return NextResponse.json(
        {
          status: "UNVERIFIED",
          message: "No reports found.",
          warning: "No trust data available. Proceed with caution.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(entity);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { value, entityType, trustScore, riskLevel } = body;

    if (!value || typeof value !== "string" || !value.trim()) {
      return NextResponse.json(
        { error: "value is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!entityType || typeof entityType !== "string") {
      return NextResponse.json(
        { error: "entityType is required and must be a string" },
        { status: 400 }
      );
    }

    const normalizedType = entityType.toUpperCase();
    const validTypes = ["PHONE", "BANK", "USERNAME", "BUSINESS"];
    if (!validTypes.includes(normalizedType)) {
      return NextResponse.json(
        { error: `Invalid entityType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    let normalizedRisk = "LOW";
    if (riskLevel !== undefined) {
      if (typeof riskLevel !== "string") {
        return NextResponse.json(
          { error: "riskLevel must be a string" },
          { status: 400 }
        );
      }
      normalizedRisk = riskLevel.toUpperCase();
      const validRiskLevels = ["LOW", "MEDIUM", "HIGH"];
      if (!validRiskLevels.includes(normalizedRisk)) {
        return NextResponse.json(
          { error: `Invalid riskLevel. Must be one of: ${validRiskLevels.join(", ")}` },
          { status: 400 }
        );
      }
    }

    let parsedTrustScore = 100;
    if (trustScore !== undefined) {
      const scoreNum = Number(trustScore);
      if (isNaN(scoreNum) || !Number.isInteger(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        return NextResponse.json(
          { error: "trustScore must be an integer between 0 and 100" },
          { status: 400 }
        );
      }
      parsedTrustScore = scoreNum;
    }

    // Check if the entity already exists
    let entity = await prisma.entity.findFirst({
      where: {
        value,
        entityType: normalizedType as any,
      },
    });

    if (entity) {
      return NextResponse.json(entity, { status: 200 });
    }

    entity = await prisma.entity.create({
      data: {
        value,
        entityType: normalizedType as any,
        trustScore: parsedTrustScore,
        riskLevel: normalizedRisk as any,
      },
    });

    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    console.error("Error creating entity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}