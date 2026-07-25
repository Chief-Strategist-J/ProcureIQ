"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Bell, Clock, Briefcase, Bot, Activity, Megaphone, ListChecks, Workflow, Mail, GitBranch, BarChart2 } from "lucide-react";
import { SidebarItem } from "./sidebarItem";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Crypto & Markets", href: "/crypto", icon: BarChart2 },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Reminders", href: "/reminders", icon: Clock },
  { label: "Work Orders", href: "/work-orders", icon: Briefcase },
  { label: "Field Service", href: "/field-service", icon: Activity },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Jobs", href: "/jobs", icon: ListChecks },
  { label: "Workflows", href: "/workflows", icon: Workflow },
  { label: "Email", href: "/email", icon: Mail },
  { label: "GitHub", href: "/github", icon: GitBranch },
  { label: "Agents", href: "/agent", icon: Bot },
];

interface UserSession {
  username?: string;
  email?: string;
  name?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("procureiq_user");
    if (stored && stored !== "undefined") {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse user session", err);
      }
    }
  }, []);

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:fixed md:left-0 md:top-0 md:z-40 border-r border-zinc-800 bg-black text-white">
      {/* Brand */}
      <div className="flex items-center h-16 px-6 border-b border-zinc-800 shrink-0">
        <span className="text-lg font-light tracking-tight text-white">
          ProcureIQ
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-350">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium text-white truncate">
              {user?.username || "Guest User"}
            </span>
            <span className="text-[11px] text-zinc-500 truncate">
              {user?.email || "guest@procureiq.internal"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}