import type { Session } from "next-auth";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  coins: number;
}

export function getSessionUser(session: Session | null): SessionUser | null {
  if (!session?.user?.email) return null;
  const u = session.user;
  return {
    id: u.id ?? "",
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role ?? "USER",
    coins: u.coins ?? 0,
  };
}
