import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Next Level Audio",
  description: "Admin panel for managing bookings and products",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
