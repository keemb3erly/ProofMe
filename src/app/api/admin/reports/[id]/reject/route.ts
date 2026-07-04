import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.status === "REJECTED") {
      return NextResponse.json(
        { error: "Report already rejected" },
        { status: 400 }
      );
    }

    await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: "REJECTED",
      },
    });

    return NextResponse.json({
      message: "Report rejected successfully",
    });
  } catch (error) {
    console.error("Rejection error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
