import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const value = searchParams.get("value");
    const query = searchParams.get("query") || searchParams.get("q");
    const type = searchParams.get("type");

    const where: any = {};

    if (value) {
      where.value = value;
    } else if (query) {
      where.value = {
        contains: query,
      };
    } else {
      return NextResponse.json(
        { error: "Search value or query is required" },
        { status: 400 }
      );
    }

    if (type) {
      where.entityType = type;
    }

    const entities = await prisma.entity.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (entities.length === 0) {
      return NextResponse.json(
        {
          status: "UNVERIFIED",
          message: "No reports found.",
          warning: "No trust data available. Proceed with caution.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        entities,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
