"use client";

import Link from "next/link";
import React from "react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}

export function SidebarItem({ icon: Icon, label, href, isActive, onClick }: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        isActive
          ? "bg-zinc-900 text-white border border-zinc-850"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
      }`}
    >
      <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
      <span>{label}</span>
    </Link>
  );
}
