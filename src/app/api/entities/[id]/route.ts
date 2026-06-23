import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entity = await prisma.entity.findUnique({
      where: {
        id,
      },
      include: {
        reports: {
          where: {
            status: "APPROVED",
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            evidence: true,
          },
        },
      },
    });

    if (!entity) {
      return NextResponse.json(
        { error: "Entity not found" },
        { status: 404 }
      );
    }

    const serializedReports = entity.reports.map((report) => ({
      ...report,
      amountLost: report.amountLost ? Number(report.amountLost) : null,
    }));

    const serializedEntity = {
      ...entity,
      reports: serializedReports,
    };

    return NextResponse.json(serializedEntity);
  } catch (error) {
    console.error("Error fetching entity profile:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}