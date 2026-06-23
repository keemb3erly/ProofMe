import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      category,
      amountLost,
      incidentDate,
      isAnonymous,
      userId,
      entityId,
    } = body;

    if (
      !title ||
      !description ||
      !category ||
      !userId ||
      !entityId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        amountLost,
        incidentDate: incidentDate
          ? new Date(incidentDate)
          : null,
        isAnonymous,
        userId,
        entityId,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Report submitted successfully",
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}