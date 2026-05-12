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

export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const report = await prisma.siteReport.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(report ?? null, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const body = await req.json();
    const { summary, frontendIssues, backendIssues, generatedBy } = body;

    if (!summary || !frontendIssues || !backendIssues) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const report = await prisma.siteReport.create({
      data: {
        summary,
        frontendIssues,
        backendIssues,
        generatedBy: generatedBy ?? "AI Agent System",
        status: "active",
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
