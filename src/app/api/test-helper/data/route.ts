import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [reports, entities] = await Promise.all([
      prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          entity: true,
          evidence: true,
        },
      }),
      prisma.entity.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          reports: {
            include: {
              evidence: true,
            },
          },
        },
      }),
    ]);

    const serializedReports = reports.map((report) => ({
      ...report,
      amountLost: report.amountLost ? Number(report.amountLost) : null,
    }));

    return NextResponse.json({
      reports: serializedReports,
      entities,
    });
  } catch (error) {
    console.error("Error in test-helper data endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
