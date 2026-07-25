"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send, CalendarClock, RefreshCw, AlertCircle } from "lucide-react";
import { useEmailPageState } from "@/features/email/EmailPageState";

export default function EmailPage() {
  const state = useEmailPageState();

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 shadow-md">
              <Mail className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Email Dispatch Console
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Send emails immediately or queue them for scheduled delivery via Gmail SMTP.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={state.fetchItems}
            disabled={state.loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 backdrop-blur-md px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${state.loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={() => state.router.push("/email/schedule")}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 backdrop-blur-md px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/80 transition-all duration-300 cursor-pointer"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Schedule Email
          </button>

          <button
            onClick={() => state.router.push("/email/send")}
            className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.08)]"
          >
            <Send className="h-4 w-4" />
            Send Now
          </button>
        </div>
      </div>

      {state.error && (
        <div className="mb-6 p-3.5 text-xs bg-red-955/20 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2.5 animate-fadeIn backdrop-blur-md">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
          <span className="font-medium">{state.error}</span>
        </div>
      )}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/80">
        <div className="border-b border-zinc-900/80 bg-zinc-900/10 px-6 py-4">
          <h2 className="text-sm font-medium tracking-tight text-white">Scheduled Queue</h2>
          <p className="text-[11px] text-zinc-550 mt-0.5">Emails queued for future delivery.</p>
        </div>
        <div className="overflow-x-auto">
          {state.loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
              <RefreshCw className="h-8 w-8 animate-spin text-zinc-600 mb-3" />
              <p className="text-xs tracking-wider">Syncing scheduled email queue...</p>
            </div>
          ) : (
            <table className="w-full min-w-[750px] text-sm text-left">
              <thead>
                <tr className="bg-zinc-950/80 text-left text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <th className="px-5 py-4 font-medium w-20">ID</th>
                  <th className="px-5 py-4 font-medium w-64">Subject</th>
                  <th className="px-5 py-4 font-medium w-64">Recipients</th>
                  <th className="px-5 py-4 font-medium w-52">Scheduled For</th>
                  <th className="px-5 py-4 font-medium w-32">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-zinc-900/20 transition-all duration-300 border-b border-zinc-900 text-zinc-300">
                    <td className="px-5 py-4 text-xs font-mono font-semibold text-white">#{item.id}</td>
                    <td className="px-5 py-4 text-xs font-medium text-zinc-200">{item.subject}</td>
                    <td className="px-5 py-4 text-xs font-mono text-zinc-400">{item.recipients.join(", ")}</td>
                    <td className="px-5 py-4 text-xs font-mono text-zinc-400">{new Date(item.scheduled_for).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-zinc-900 text-zinc-400 border-zinc-800">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {state.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-zinc-500 text-xs">
                      No scheduled emails in queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
