import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is missing." },
      { status: 400 }
    );
  }
  const hashedToken = crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");
  const user = await prisma.user.findFirst({
  where: {
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: {
      gt: new Date(),
    },
  },
});
if (!user) {
  return NextResponse.json(
    { error: "Verification link is invalid or has expired." },
    { status: 400 }
  );
}
await prisma.user.update({
  where: {
    id: user.id,
  },
  data: {
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpiry: null,
  },
});
return NextResponse.redirect(
  new URL("/?verified=true", request.url)
);
}