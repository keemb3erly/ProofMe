import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RiskLevel } from "@prisma/client";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return authResult.response;
    }

    const { id: reportId } = await params;

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      include: {
        entity: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.status === "APPROVED") {
      return NextResponse.json(
        { error: "Report already approved" },
        { status: 400 }
      );
    }

    const newTotalReports = report.entity.totalReports + 1;

    const newTrustScore = Math.max(
      100 - newTotalReports * 10,
      0
    );

    let newRiskLevel: RiskLevel = "LOW";

    if (newTrustScore < 50) {
      newRiskLevel = "HIGH";
    } else if (newTrustScore < 80) {
      newRiskLevel = "MEDIUM";
    }

    await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: "APPROVED",
      },
    });

    await prisma.entity.update({
      where: {
        id: report.entityId,
      },
      data: {
        totalReports: newTotalReports,
        trustScore: newTrustScore,
        riskLevel: newRiskLevel,
      },
    });

    return NextResponse.json({
      message: "Report approved successfully",
      trustScore: newTrustScore,
      totalReports: newTotalReports,
      riskLevel: newRiskLevel,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
