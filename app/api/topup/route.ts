import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { checkOrigin } from "@/lib/csrf";
import { log, getReqMeta } from "@/lib/logger";

const VALID_AMOUNTS = [10, 30, 50, 100, 200, 500];

export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!rateLimit(`topup:${getIP(req)}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await req.formData();
    const amount = Number(formData.get("amount"));
    const slip = formData.get("slip") as File | null;

    if (!VALID_AMOUNTS.includes(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!slip || slip.size === 0) {
      return NextResponse.json({ error: "Slip required" }, { status: 400 });
    }

    const request = await prisma.topupRequest.create({
      data: { userId: user.id, amount, status: "pending" },
    });

    const ext = slip.name.split(".").pop() ?? "jpg";
    const blob = await put(`slips/topup-${request.id}.${ext}`, slip, { access: "public" });

    await prisma.topupRequest.update({
      where: { id: request.id },
      data: { slipPath: blob.url },
    });

    const { ip, userAgent } = getReqMeta(req);
    await log({ userId: user.id, type: "ACTIVITY", action: "topup_request", meta: { amount, requestId: request.id }, ip, userAgent });

    return NextResponse.json({ success: true, requestId: request.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const requests = await prisma.topupRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(requests);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
