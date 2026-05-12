import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

type LogType = "AUTH" | "ACTIVITY" | "ERROR";

interface LogOptions {
  userId?: number | null;
  type: LogType;
  action: string;
  meta?: Prisma.InputJsonValue;
  ip?: string;
  userAgent?: string;
}

export async function log(opts: LogOptions): Promise<void> {
  try {
    await prisma.userLog.create({
      data: {
        userId: opts.userId ?? null,
        type: opts.type,
        action: opts.action,
        meta: opts.meta,
        ip: opts.ip?.slice(0, 45) ?? null,
        userAgent: opts.userAgent?.slice(0, 255) ?? null,
      },
    });
  } catch {
    // never crash main flow
  }
}

export function getReqMeta(req: Request): { ip?: string; userAgent?: string } {
  return {
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  };
}
