import type { Metadata } from "next";

export const metadata: Metadata = { title: "แนะนำเพื่อน | MangBoh" };

export default function ReferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
