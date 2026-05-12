import type { Metadata } from "next";

export const metadata: Metadata = { title: "เติมเหรียญ | MangBoh" };

export default function TopUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
