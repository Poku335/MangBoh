import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") ?? undefined;
  const userId = searchParams.get("userId") ? parseInt(searchParams.get("userId")!) : undefined;
  const days = parseInt(searchParams.get("days") ?? "7");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 50;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const where = {
    createdAt: { gte: since },
    ...(type ? { type: type as "AUTH" | "ACTIVITY" | "ERROR" } : {}),
    ...(userId ? { userId } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.userLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.userLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, limit });
}
