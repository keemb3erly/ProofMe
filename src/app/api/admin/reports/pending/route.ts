import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return authResult.response;
    }

    const reports = await prisma.report.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        evidence: true,
        entity: true,
      },
    });

    const serializedReports = reports.map((report) => ({
      ...report,
      amountLost: report.amountLost ? Number(report.amountLost) : null,
    }));

    return NextResponse.json(serializedReports);
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
