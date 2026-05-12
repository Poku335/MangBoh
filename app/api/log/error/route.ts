import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { log, getReqMeta } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!rateLimit(`log-error:${getIP(req)}`, 20, 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const session = await auth();
  let userId: number | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    userId = user?.id ?? null;
  }

  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.slice(0, 500) : "unknown";
  const page = typeof body.page === "string" ? body.page.slice(0, 200) : undefined;

  const { ip, userAgent } = getReqMeta(req);
  await log({ userId, type: "ERROR", action: "client_error", meta: { message, page }, ip, userAgent });

  return NextResponse.json({ ok: true });
}
