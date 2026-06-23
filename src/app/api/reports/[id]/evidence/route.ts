import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const evidence = await prisma.evidence.findMany({
      where: { reportId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let fileUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided in form-data" },
          { status: 400 }
        );
      }

      // Check if Cloudinary configuration is missing
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return NextResponse.json(
          { error: "Cloudinary configuration is missing on the server" },
          { status: 500 }
        );
      }

      // Convert File to Buffer for upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "evidence" },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result as { secure_url: string });
            } else {
              reject(new Error("Cloudinary upload did not return a result"));
            }
          }
        );
        uploadStream.end(buffer);
      });

      fileUrl = uploadResult.secure_url;
    } else {
      // Expect JSON with fileUrl
      const body = await request.json();
      fileUrl = body.fileUrl;

      if (!fileUrl) {
        return NextResponse.json(
          { error: "fileUrl is required" },
          { status: 400 }
        );
      }
    }

    const evidence = await prisma.evidence.create({
      data: {
        fileUrl,
        reportId,
      },
    });

    return NextResponse.json(
      {
        message: "Evidence uploaded successfully",
        evidence,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating evidence:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
