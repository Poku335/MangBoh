import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { id } = await params;
    const { action, note } = await req.json();

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const topupCheck = await prisma.topupRequest.findUnique({ where: { id: Number(id) } });
    if (!topupCheck) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let alreadyProcessed = false;
    await prisma.$transaction(async (tx) => {
      const topup = await tx.topupRequest.findUnique({ where: { id: Number(id) } });
      if (!topup || topup.status !== "pending") {
        alreadyProcessed = true;
        return;
      }

      await tx.topupRequest.update({
        where: { id: topup.id },
        data: {
          status: action === "approve" ? "approved" : "rejected",
          adminNote: note ?? null,
          approvedAt: new Date(),
          approvedBy: admin.id,
        },
      });

      if (action === "approve") {
        await tx.user.update({
          where: { id: topup.userId },
          data: { coins: { increment: topup.amount } },
        });
      }
    });

    if (alreadyProcessed) {
      return NextResponse.json({ error: "Request already processed" }, { status: 409 });
    }

    const topup = await prisma.topupRequest.findUnique({ where: { id: Number(id) } });
    await log({
      userId: admin.id,
      type: "ACTIVITY",
      action: action === "approve" ? "topup_approved" : "topup_rejected",
      meta: { requestId: Number(id), targetUserId: topup?.userId, amount: topup?.amount },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
