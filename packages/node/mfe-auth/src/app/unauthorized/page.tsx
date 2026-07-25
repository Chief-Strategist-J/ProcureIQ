"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Key, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useUnauthorizedPageState } from "@/features/signup/UnauthorizedPageState";

export default function UnauthorizedPage() {
  const state = useUnauthorizedPageState();

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-black text-white relative overflow-hidden px-6 selection:bg-zinc-800 font-sans">
      {/* Warm amber warning radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,oklch(0.12_0.04_50/0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-xl text-center space-y-8 flex flex-col items-center">
        {/* Shield Alert Icon with warning aura */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-full border border-amber-500/20 bg-zinc-950 flex items-center justify-center relative shadow-2xl">
            <Lock className="w-9 h-9 text-amber-400" />
          </div>
        </div>

        {/* Header content */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            Security Rule Violation (403)
          </span>
          <h1 className="text-3xl font-light tracking-tight text-white mt-2">
            Restricted System Node
          </h1>
          <p className="text-zinc-500 text-sm font-light leading-relaxed max-w-md mx-auto">
            Your current security credentials do not grant access to this workspace. Access log record has been cataloged.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-sm pt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 active:scale-95 transition-all text-center cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Safety</span>
          </Link>

          {state.requestStatus === "requested" ? (
            <div className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Override Requested</span>
            </div>
          ) : (
            <Button
              onClick={state.handleRequestAccess}
              disabled={state.requestStatus === "requesting"}
              variant="outline"
              className="w-full border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 active:scale-95 transition-all py-6 cursor-pointer"
            >
              <Key className={`w-4 h-4 mr-2 text-amber-400 ${state.requestStatus === "requesting" ? "animate-spin" : ""}`} />
              <span>{state.requestStatus === "requesting" ? "Broadcasting Request..." : "Request Override"}</span>
            </Button>
          )}
        </div>

        {/* Details card */}
        <div className="text-[10px] text-zinc-650 font-mono tracking-widest uppercase">
          ProcureIQ Security Engine v1.12 • Policy Conflict
        </div>
      </div>
    </div>
  );
}
