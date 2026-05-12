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

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    const key = req.nextUrl.searchParams.get("key");
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
    const row = await prisma.siteConfig.findUnique({ where: { key } });
    return NextResponse.json(row ?? null, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    const { key, value } = await req.json();
    if (!key || value === undefined) return NextResponse.json({ error: "key and value required" }, { status: 400 });
    if (key === "accentColor" && !/^#[0-9a-fA-F]{6}$/.test(value)) {
      return NextResponse.json({ error: "Invalid hex color" }, { status: 400 });
    }
    const row = await prisma.siteConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return NextResponse.json(row);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
