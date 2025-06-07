import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "../../../node_modules/next/navigation";
import React from "react";

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
  return <div className="max-w-screen-xl mx-auto my-10">{children}</div>;

  // return <div>{children}</div>;
}

export default LayoutForAdminPages;
