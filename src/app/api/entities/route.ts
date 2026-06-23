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