import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export async function requireAuth(
  request: Request
): Promise<{ user: User; response?: undefined } | { user: null; response: NextResponse }> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        user: null,
        response: NextResponse.json(
          { error: "Unauthorized: Missing or invalid authentication credentials" },
          { status: 401 }
        ),
      };
    }

    const userId = authHeader.substring(7).trim();
    if (!userId) {
      return {
        user: null,
        response: NextResponse.json(
          { error: "Unauthorized: Invalid session token" },
          { status: 401 }
        ),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        user: null,
        response: NextResponse.json(
          { error: "Unauthorized: User session not found" },
          { status: 401 }
        ),
      };
    }

    return { user };
  } catch (error) {
    console.error("Auth verification error:", error);
    return {
      user: null,
      response: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      ),
    };
  }
}

export async function requireAdmin(
  request: Request
): Promise<{ user: User; response?: undefined } | { user: null; response: NextResponse }> {
  const authResult = await requireAuth(request);
  if (authResult.response) {
    return authResult;
  }

  if (authResult.user.role !== "ADMIN") {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Forbidden: Admin privileges required" },
        { status: 403 }
      ),
    };
  }

  return { user: authResult.user };
}
