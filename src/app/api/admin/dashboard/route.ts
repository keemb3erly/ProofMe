import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return authResult.response;
    }

    const [
      totalUsers,
      totalEntities,
      pendingReports,
      approvedReports,
      rejectedReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.entity.count(),
      prisma.report.count({
        where: {
          status: "PENDING",
        },
      }),
      prisma.report.count({
        where: {
          status: "APPROVED",
        },
      }),
      prisma.report.count({
        where: {
          status: "REJECTED",
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalEntities,
      pendingReports,
      approvedReports,
      rejectedReports,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}