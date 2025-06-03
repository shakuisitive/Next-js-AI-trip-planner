import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "../../../node_modules/next/navigation";

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
  return children;

  // return <div>{children}</div>;
}

export default LayoutForAdminPages;
