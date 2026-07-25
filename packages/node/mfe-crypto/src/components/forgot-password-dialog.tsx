"use client";

import { useState } from "react";
import { Mail, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

interface ForgotPasswordDialogProps {
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ForgotPasswordDialog({
  trigger,
  open,
  onOpenChange
}: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please specify an email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Unable to dispatch reset authorization. Verify user account exists.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Unable to dispatch reset authorization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
    if (!isOpen) {
      setTimeout(() => {
        setEmail("");
        setSuccess(false);
        setError("");
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="border-zinc-800 bg-zinc-950/95 backdrop-blur-md max-w-sm sm:max-w-md w-full p-6 text-zinc-100 shadow-2xl rounded-xl">
        
        {}
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader className="space-y-2">
              <div className="size-10 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center mb-1">
                <KeyRound className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-light tracking-tight text-white">
                Request Password Reset
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-xs">
                Provide your registered corporate email to receive a secure recovery payload.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <FieldError className="p-2.5 text-xs bg-red-950/40 border border-red-900/50 text-red-400 rounded-md">
                {error}
              </FieldError>
            )}

            <Field className="space-y-1.5">
              <FieldLabel htmlFor="reset-email" className="text-zinc-400 text-xs font-mono">
                Email Address
              </FieldLabel>
              <InputGroup className="bg-black border-zinc-800 focus-within:border-zinc-700">
                <InputGroupAddon align="inline-start">
                  <Mail className="w-4 h-4 text-zinc-500" />
                </InputGroupAddon>
                <InputGroupInput
                  id="reset-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="text-zinc-100 text-sm"
                  required
                />
              </InputGroup>
            </Field>

            <DialogFooter className="pt-2">
              <div className="flex gap-3 w-full justify-end">
                <DialogClose render={<Button variant="ghost" disabled={loading} className="text-zinc-500 hover:text-zinc-300 text-xs" />}>
                  Cancel
                </DialogClose>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-white hover:bg-zinc-200 text-black text-xs font-medium px-4 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5">
                      <Spinner className="w-3.5 h-3.5 text-black" />
                      Dispatching...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        ) : (
          
          <div className="space-y-5 py-4 text-center flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
              <div className="w-14 h-14 rounded-full border border-emerald-500/20 bg-zinc-950 flex items-center justify-center relative shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-lg font-light tracking-tight text-white">
                Dispatched Successfully
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-xs max-w-sm mx-auto">
                If the email <strong className="text-zinc-300 font-mono text-[11px]">{email}</strong> matches our user records, you will receive a password recovery payload shortly.
              </DialogDescription>
            </div>

            <DialogFooter className="w-full pt-2">
              <DialogClose render={<Button className="w-full bg-white hover:bg-zinc-200 text-black text-xs font-medium cursor-pointer" />}>
                Acknowledge
              </DialogClose>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
