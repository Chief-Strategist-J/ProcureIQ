"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, CheckCircle2, ArrowLeft, AlertCircle, KeyRound } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useResetPasswordFormState } from "@/features/signup/ResetPasswordFormState";
import { signupSlice } from "@/features/signup/signupSlice";

function ResetPasswordForm() {
  const state = useResetPasswordFormState();

  return (
    <Card className="w-full max-w-md border-zinc-800 bg-zinc-955/80 backdrop-blur-md relative overflow-hidden shadow-2xl rounded-2xl">
      {!state.token && (
        <div className="absolute inset-x-0 top-0 h-1 bg-amber-500/80" />
      )}

      {!state.success ? (
        <>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-light text-center tracking-tight text-white flex items-center justify-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              Reset Credentials
            </CardTitle>
            <CardDescription className="text-zinc-400 text-center text-xs">
              Establish a new secure access key for your ProcureIQ account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={state.handleSubmit} className="space-y-4">
              {!state.token && (
                <div className="p-3 text-xs bg-amber-955/40 border border-amber-900/50 text-amber-400 rounded-lg flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Token Missing:</strong> You arrived without a valid URL authorization signature. Submissions will fail.
                  </div>
                </div>
              )}

              {state.error && (
                <FieldError className="p-3 text-xs bg-red-955/40 border border-red-900/55 text-red-400 rounded-lg">
                  {state.error}
                </FieldError>
              )}

              <Field className="space-y-1.5">
                <FieldLabel htmlFor="new-password" className="text-zinc-300 text-xs">
                  New Password
                </FieldLabel>
                <InputGroup className="bg-zinc-900 border-zinc-800 focus-within:border-zinc-700">
                  <InputGroupAddon align="inline-start">
                    <Lock className="w-4 h-4 text-zinc-500" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={state.password}
                    onChange={(e) => state.dispatch(signupSlice.actions.setFormField({ field: "resetPassword", value: e.target.value }))}
                    disabled={state.loading}
                    className="text-white text-sm"
                    required
                  />
                </InputGroup>
              </Field>

              <Field className="space-y-1.5">
                <FieldLabel htmlFor="confirm-password" className="text-zinc-300 text-xs">
                  Confirm Password
                </FieldLabel>
                <InputGroup className="bg-zinc-900 border-zinc-800 focus-within:border-zinc-700">
                  <InputGroupAddon align="inline-start">
                    <Lock className="w-4 h-4 text-zinc-500" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={state.confirmPassword}
                    onChange={(e) => state.dispatch(signupSlice.actions.setFormField({ field: "resetConfirmPassword", value: e.target.value }))}
                    disabled={state.loading}
                    className="text-white text-sm"
                    required
                  />
                </InputGroup>
              </Field>

              <Button
                type="submit"
                disabled={state.loading}
                className="w-full bg-white hover:bg-zinc-200 text-black font-medium py-2.5 text-sm rounded-lg transition-all mt-2 cursor-pointer"
              >
                {state.loading ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <Spinner className="w-4 h-4 text-black" />
                    Updating Credentials...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-zinc-400 border-t border-zinc-900 pt-4">
            <Link href="/login" className="hover:underline text-white font-medium flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </CardFooter>
        </>
      ) : (
        <div className="p-8 text-center flex flex-col items-center space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
            <div className="w-16 h-16 rounded-full border border-emerald-500/20 bg-zinc-950 flex items-center justify-center relative shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-tight text-white">
              Credentials Revitalized
            </h2>
            <p className="text-zinc-500 text-xs max-w-xs mx-auto leading-relaxed">
              Your security account payload has been updated successfully. You can now use your new password to log in.
            </p>
          </div>

          <Link href="/login" className="w-full">
            <Button className="w-full bg-white hover:bg-zinc-200 text-black text-sm font-medium py-2.5 rounded-lg cursor-pointer">
              Go to Login
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

function LoadingPlaceholder() {
  return (
    <Card className="w-full max-w-md border-zinc-800 bg-zinc-950/80 backdrop-blur-md p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
      <Spinner className="w-6 h-6 text-emerald-400" />
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-black text-white font-sans p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.12_0.03_145/0.12),transparent_50%)] pointer-events-none" />
      
      <Suspense fallback={<LoadingPlaceholder />}>
        <ResetPasswordForm />
      </Suspense>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-zinc-650 font-mono tracking-widest uppercase">
        ProcureIQ Security Engine • Recovery Link
      </div>
    </div>
  );
}
