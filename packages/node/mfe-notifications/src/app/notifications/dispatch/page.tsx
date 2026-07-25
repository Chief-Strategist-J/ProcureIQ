"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useDispatchNotificationPageState } from "@/features/notifications/DispatchNotificationsPageState";
import { notificationsActions } from "@/features/notifications/notificationsSlice";

export default function DispatchNotificationPage() {
  const state = useDispatchNotificationPageState();

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans relative flex flex-col">
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4 mb-8 border-b border-zinc-900 pb-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-white transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-light tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Notification Dispatch Console
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Construct, review, and broadcast active notifications to target users or broadcast queues.
            </p>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="mb-6 p-4 text-xs bg-red-955/20 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2.5 animate-fadeIn backdrop-blur-md shrink-0">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
          <span className="font-medium">{state.error}</span>
        </div>
      )}
      
      {state.success && (
        <div className="mb-6 p-4 text-xs bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2.5 animate-fadeIn backdrop-blur-md shrink-0">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
          <span className="font-medium">{state.success}</span>
        </div>
      )}

      <form onSubmit={state.handleSubmit} className="space-y-8 flex-1 flex flex-col justify-between w-full">
        <div className="space-y-8 w-full">
          <div className="border-b border-zinc-900 pb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-450">Event Parameters</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Define metadata targets and scopes for dispatch execution.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Event Code</label>
              <select
                value={state.typeCode}
                onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "typeCode", value: e.target.value }))}
                className="w-full rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all focus:ring-1 focus:ring-zinc-700"
              >
                <option value="system_alert">System Alert</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Source Service</label>
              <select
                value={state.sourceService}
                onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "sourceService", value: e.target.value }))}
                className="w-full rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all focus:ring-1 focus:ring-zinc-700"
              >
                <option value="procurement-service">Procurement Service</option>
                <option value="finance-service">Finance Service</option>
                <option value="bidding-service">Bidding Service</option>
                <option value="system-orchestrator">System Orchestrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Target Scope</label>
              <select
                value={state.targetScope}
                onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "targetScope", value: e.target.value }))}
                className="w-full rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all focus:ring-1 focus:ring-zinc-700"
              >
                <option value="USER">User (Direct)</option>
                <option value="ROLE">Role (Group)</option>
                <option value="SYSTEM">System Broadcast</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Target ID</label>
              <input
                type="number"
                value={state.targetId}
                onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "targetId", value: e.target.value }))}
                placeholder="1"
                className="w-full rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all focus:ring-1 focus:ring-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Priority Level</label>
            <div className="grid grid-cols-3 gap-4 max-w-xl">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => state.dispatch(notificationsActions.setFormField({ field: "priority", value: level }))}
                  className={`py-3 rounded-lg border text-xs cursor-pointer text-center font-medium transition-all duration-300 ${
                    state.priority === level
                      ? level === 3
                        ? "border-red-500/40 bg-red-950/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                        : level === 2
                        ? "border-amber-500/40 bg-amber-950/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                        : "border-blue-500/40 bg-blue-950/30 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                      : "border-zinc-850 bg-zinc-900/20 text-zinc-500 hover:text-zinc-350 hover:border-zinc-750"
                  }`}
                >
                  {level === 3 ? "High Priority" : level === 2 ? "Medium" : "Low Priority"}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-zinc-900 pb-4 pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-450">Message Content</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Payload text loaded into user alerts and broadcast cards.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Payload Title</label>
            <input
              type="text"
              placeholder="e.g. Purchase Order #42 Created"
              value={state.title}
              onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "title", value: e.target.value }))}
              className="w-full rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all focus:ring-1 focus:ring-zinc-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Payload Message</label>
            <textarea
              placeholder="e.g. A new purchase order PO-10293 has been created and requires your review."
              value={state.message}
              onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "message", value: e.target.value }))}
              className="w-full h-40 rounded-lg bg-zinc-900/40 border border-zinc-800/80 p-3.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-all resize-none focus:ring-1 focus:ring-zinc-700"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-8 mt-12 border-t border-zinc-900">
          <Link
            href="/notifications"
            className="px-8 py-3 rounded-lg bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-xs font-semibold cursor-pointer transition-all text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={state.creating}
            className="px-10 py-3 rounded-lg bg-white text-black hover:bg-zinc-150 hover:scale-[1.02] active:scale-[0.98] text-xs font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all shadow-[0_4px_20px_rgba(255,255,255,0.08)]"
          >
            {state.creating && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            Dispatch Event
          </button>
        </div>
      </form>
    </div>
  );
}
