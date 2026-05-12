import type { Metadata } from "next";

export const metadata: Metadata = { title: "การตั้งค่า | MangBoh" };

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
