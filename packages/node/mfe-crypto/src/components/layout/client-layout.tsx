"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobilesidebar";
import { RefreshCw } from "lucide-react";

const publicPaths = ["/login", "/signup", "/reset-password"];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("procureiq_token");
    const isPublicPath = publicPaths.includes(pathname);

    if (!token && !isPublicPath) {
      setAuthorized(false);
      router.push("/login");
    } else if (token && isPublicPath) {
      setAuthorized(true);
      router.push("/");
    } else {
      setAuthorized(true);
    }
    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white">
        <RefreshCw className="h-8 w-8 animate-spin text-zinc-500 mb-2" />
        <span className="text-xs text-zinc-500 font-sans">Checking credentials...</span>
      </div>
    );
  }

  const isPublicPath = publicPaths.includes(pathname);

  if (!authorized && !isPublicPath) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white">
        <RefreshCw className="h-8 w-8 animate-spin text-zinc-500 mb-2" />
        <span className="text-xs text-zinc-500 font-sans">Redirecting to login...</span>
      </div>
    );
  }

  if (isPublicPath) {
    return <div className="min-h-screen bg-black">{children}</div>;
  }

  return (
    <>
      <Sidebar />
      <MobileSidebar />
      <main className="md:ml-64 min-h-screen bg-black">
        {children}
      </main>
    </>
  );
}
