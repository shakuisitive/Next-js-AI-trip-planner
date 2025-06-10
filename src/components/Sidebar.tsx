"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MapPin,
  MessageSquare,
  UserCheck,
  Calendar,
  Settings,
  BarChart3,
  Clock,
  Star,
  Hotel,
  MapPinHouse,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Trips", href: "/dashboard/trips", icon: MapPin },
  { name: "Accommodations", href: "/dashboard/accommodations", icon: Hotel },
  { name: "Places", href: "/dashboard/places", icon: MapPinHouse },
  { name: "Feedback", href: "/dashboard/feedback", icon: MessageSquare },
  { name: "Sessions", href: "/dashboard/sessions", icon: UserCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="w-64 bg-white shadow-sm flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">TripAdmin</h2>
      </div>
      <nav className="flex-1">
        <div className="px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    isActive
                      ? "text-gray-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
