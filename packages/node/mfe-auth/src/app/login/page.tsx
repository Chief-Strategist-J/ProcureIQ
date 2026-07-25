"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";
import { RefreshCw, KeyRound, User, ChevronRight } from "lucide-react";
import { useLoginPageState } from "@/features/signup/LoginPageState";
import { signupSlice } from "@/features/signup/signupSlice";

export default function LoginPage() {
  const state = useLoginPageState();

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center min-h-screen bg-black text-white font-sans p-4 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Card className="relative w-full max-w-md border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md shadow-2xl shadow-black/80 rounded-2xl overflow-hidden p-2">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />
        
        <CardHeader className="space-y-2 pt-8 pb-4">
          <div className="flex justify-center mb-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg shadow-black/50">
              <KeyRound className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-light text-center tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Welcome back
          </CardTitle>
          <CardDescription className="text-zinc-500 text-center text-xs">
            Authenticate to access the ProcureIQ control panel
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          <form onSubmit={state.handleLogin} className="space-y-4">
            {state.error && (
              <div className="p-3 text-xs bg-red-955/20 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-zinc-400 text-xs font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-650" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={state.username}
                  onChange={(e) => state.dispatch(signupSlice.actions.setFormField({ field: "username", value: e.target.value }))}
                  className="bg-zinc-900/60 border-zinc-800 text-white placeholder-zinc-600 text-sm pl-10 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-750 transition-all duration-300 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-400 text-xs font-medium">Password</Label>
                <button
                  type="button"
                  onClick={() => state.dispatch(signupSlice.actions.setFormField({ field: "isResetOpen", value: true }))}
                  className="text-xs text-zinc-505 hover:text-zinc-300 hover:underline focus:outline-none cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-650" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={state.password}
                  onChange={(e) => state.dispatch(signupSlice.actions.setFormField({ field: "password", value: e.target.value }))}
                  className="bg-zinc-900/60 border-zinc-800 text-white placeholder-zinc-600 text-sm pl-10 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-750 transition-all duration-300 rounded-lg"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={state.loading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-2.5 text-xs uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-white/5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {state.loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 text-center text-xs text-zinc-500 px-6 pb-8 pt-4">
          <div className="border-t border-zinc-900/60 w-full pt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-zinc-300 hover:text-white font-medium hover:underline transition-colors">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
      <ForgotPasswordDialog open={state.isResetOpen} onOpenChange={(val) => state.dispatch(signupSlice.actions.setFormField({ field: "isResetOpen", value: val }))} />
    </div>
  );
}
