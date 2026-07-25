"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, CalendarClock } from "lucide-react";
import { useScheduleEmailPageState } from "@/features/email/ScheduleEmailPageState";
import { emailSlice } from "@/features/email/emailSlice";

export default function ScheduleEmailPage() {
  const state = useScheduleEmailPageState();

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans relative flex flex-col">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4 mb-8 border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/email"
            className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-white transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-light tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-505 bg-clip-text text-transparent">
              Schedule Email
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Queue an email to be delivered automatically at a future date and time.
            </p>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="mb-6 p-4 text-xs bg-red-955/20 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2.5 animate-fadeIn backdrop-blur-md">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
          <span className="font-medium">{state.error}</span>
        </div>
      )}

      {state.success && (
        <div className="mb-6 p-4 text-xs bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2.5 animate-fadeIn backdrop-blur-md">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
          <span className="font-medium">{state.success}</span>
        </div>
      )}

      <form onSubmit={state.handleSchedule} className="space-y-8 flex-1 flex flex-col justify-between w-full max-w-2xl">
        <div className="space-y-8 w-full">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Recipients (comma-separated)</label>
            <input
              type="text"
              value={state.recipients}
              onChange={(e) => state.dispatch(emailSlice.actions.setFormField({ field: "recipients", value: e.target.value }))}
              placeholder="procurement@acme.example, supply@globex.example"
              required
              className="w-full rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Subject</label>
            <input
              type="text"
              value={state.subject}
              onChange={(e) => state.dispatch(emailSlice.actions.setFormField({ field: "subject", value: e.target.value }))}
              placeholder="Vendor Insurance Certificate Reminder"
              required
              className="w-full rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Body</label>
            <textarea
              value={state.body}
              onChange={(e) => state.dispatch(emailSlice.actions.setFormField({ field: "body", value: e.target.value }))}
              rows={8}
              placeholder="Write the message content here..."
              required
              className="w-full rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Scheduled For</label>
            <input
              type="datetime-local"
              value={state.scheduledFor}
              onChange={(e) => state.dispatch(emailSlice.actions.setFormField({ field: "scheduledFor", value: e.target.value }))}
              required
              className="w-full rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 mt-12 border-t border-zinc-900">
          <Link
            href="/email"
            className="px-8 py-3 rounded-lg bg-zinc-955 border border-zinc-850 hover:bg-zinc-900 text-xs font-semibold cursor-pointer transition-all text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={state.saving}
            className="px-10 py-3 rounded-lg bg-white text-black hover:bg-zinc-150 hover:scale-[1.02] active:scale-[0.98] text-xs font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all shadow-[0_4px_20px_rgba(255,255,255,0.08)]"
          >
            {state.saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CalendarClock className="h-3.5 w-3.5" />}
            Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
