import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const purchases = await prisma.purchase.findMany({
      include: {
        user: { select: { name: true, email: true } },
        chapter: { select: { chapterNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalCoins = purchases.reduce((sum, p) => sum + p.paidAmount, 0);

    return NextResponse.json({
      purchases,
      totalCoins,
      totalPurchases: purchases.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
