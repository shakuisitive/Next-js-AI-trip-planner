import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "../../../node_modules/next/navigation";
import React from "react";
import { Sidebar } from "@/components/Sidebar";
async function LayoutForAdminPages({ children }) {
  let session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!(user.role === "admin")) {
    redirect("/");
  }
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );

  // return <div>{children}</div>;
}

export default LayoutForAdminPages;

/*

import type React from "react"
import { Sidebar } from "@/components/admin/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}

*/
