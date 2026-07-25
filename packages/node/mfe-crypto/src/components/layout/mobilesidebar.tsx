"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Bell, Clock, Briefcase, Bot, BarChart2 } from "lucide-react";
import { SidebarItem } from "./sidebarItem";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Crypto & Markets", href: "/crypto", icon: BarChart2 },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Reminders", href: "/reminders", icon: Clock },
  { label: "Work Orders", href: "/work-orders", icon: Briefcase },
  { label: "Agents", href: "/agent", icon: Bot },
];

interface UserSession {
  username?: string;
  email?: string;
  name?: string;
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {}
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-zinc-800 bg-black text-white sticky top-0 z-40">
        <span className="text-base font-light tracking-tight">ProcureIQ</span>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        <div
          className={`absolute left-0 top-0 h-full w-72 max-w-[80%] bg-zinc-950/95 backdrop-blur-md border-r border-zinc-800 flex flex-col transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-800 shrink-0">
            <span className="text-lg font-light tracking-tight text-white">
              ProcureIQ
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                onClick={() => setOpen(false)}
              />
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-zinc-800 shrink-0">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-350">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium text-white truncate">
                  {user?.username || "Guest User"}
                </span>
                <span className="text-[11px] text-zinc-550 truncate">
                  {user?.email || "guest@procureiq.internal"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}