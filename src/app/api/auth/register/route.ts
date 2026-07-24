import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { fullName, email, password } = body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!fullName || !normalizedEmail || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
const verificationToken = crypto.randomBytes(32).toString("hex");

const hashedVerificationToken = crypto
  .createHash("sha256")
  .update(verificationToken)
  .digest("hex");

    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpiry: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const verificationLink = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail({
        email: normalizedEmail,
        verificationLink,
      });
    } catch (error) {
      console.error("Verification email error:", error);
      await prisma.user.delete({ where: { id: user.id } });
      throw error;
    }
    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
