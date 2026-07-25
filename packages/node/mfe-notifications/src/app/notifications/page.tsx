"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Plus, RefreshCw, CheckCircle2, AlertCircle, X, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { notificationsActions } from "@/features/notifications/notificationsSlice";

import { useNotificationsPageState } from "@/features/notifications/NotificationsPageState";

export default function NotificationsPage() {
  const state = useNotificationsPageState();

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-emerald-500/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 shadow-md">
              <Bell className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-505 bg-clip-text text-transparent">
                System Registry & Notifications
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Monitor, filter, and dispatch real-time system, process, and agent communications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => {
              state.dispatch(notificationsActions.setFormField({ field: "refreshing", value: true }));
              state.dispatch(notificationsActions.fetchNotificationsRequest({ page: state.page, statusFilter: state.statusFilter }));
              setTimeout(() => state.dispatch(notificationsActions.setFormField({ field: "refreshing", value: false })), 800);
            }}
            disabled={state.refreshing || state.loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-850 bg-zinc-950/60 backdrop-blur-md px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/80 hover:border-zinc-800 transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${state.refreshing ? "animate-spin" : ""}`} />
            Sync Feed
          </button>

          <button
            onClick={() => state.router.push("/notifications/dispatch")}
            className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.08)]"
          >
            <Plus className="h-4 w-4" />
            Dispatch
          </button>
        </div>
      </div>

      {state.error && (
        <div className="mb-6 p-3.5 text-xs bg-red-955/20 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2.5 animate-fadeIn backdrop-blur-md">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
          <span className="font-medium">{state.error}</span>
        </div>
      )}
      
      {state.success && (
        <div className="mb-6 p-3.5 text-xs bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2.5 animate-fadeIn backdrop-blur-md">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
          <span className="font-medium">{state.success}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1.5 p-1 rounded-lg border border-zinc-850/80 bg-zinc-955/80 backdrop-blur-md w-fit">
          {["all", "UNREAD", "READ"].map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => {
                state.dispatch(notificationsActions.setFormField({ field: "statusFilter", value: statusOption }));
                state.dispatch(notificationsActions.setFormField({ field: "page", value: 0 }));
              }}
              className={`px-4 py-1.5 text-xs rounded-md capitalize transition-all duration-300 cursor-pointer ${
                state.statusFilter === statusOption
                  ? "bg-zinc-900 text-white font-medium border border-zinc-800 shadow-lg"
                  : "text-zinc-500 hover:text-zinc-350 border border-transparent"
              }`}
            >
              {statusOption === "all" ? "All Feed" : statusOption.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search payload content, type..."
            value={state.searchQuery}
            onChange={(e) => state.dispatch(notificationsActions.setSearchQuery(e.target.value))}
            className="w-full sm:w-72 rounded-lg bg-zinc-900/60 border border-zinc-800 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700/80 focus:border-zinc-700/80 focus:bg-zinc-900 transition-all duration-300"
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/80">
        <div className="overflow-x-auto">
          {state.loading && !state.refreshing ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
              <RefreshCw className="h-8 w-8 animate-spin text-zinc-600 mb-3" />
              <p className="text-xs tracking-wider">Syncing communications feed...</p>
            </div>
          ) : (
            <table className="w-full min-w-[850px] text-sm text-left">
              <thead>
                <tr className="bg-zinc-950/80 text-left text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-850">
                  <th className="px-5 py-4 font-medium w-16 text-center">ID</th>
                  <th className="px-5 py-4 font-medium w-32">Event Type</th>
                  <th className="px-5 py-4 font-medium w-40">Source Service</th>
                  <th className="px-5 py-4 font-medium">Message Details</th>
                  <th className="px-5 py-4 font-medium w-32">Priority</th>
                  <th className="px-5 py-4 font-medium w-28 text-center">Target Scope</th>
                  <th className="px-5 py-4 font-medium w-36">Timestamp</th>
                  <th className="px-5 py-4 font-medium w-28 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {state.filteredNotifications.map((notification: any) => (
                  <tr
                    key={notification.id}
                    className={`group hover:bg-zinc-900/20 transition-all duration-300 border-b border-zinc-900 ${
                      notification.status === "UNREAD" ? "bg-zinc-900/10" : "bg-transparent text-zinc-350"
                    }`}
                  >
                    <td className="px-5 py-4 text-xs font-mono text-zinc-650 text-center">
                      {notification.id}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md border border-zinc-800 bg-zinc-900/30 px-2 py-0.5 text-xs font-mono text-indigo-400 font-medium">
                        {notification.typeCode}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-zinc-500">
                      {notification.sourceService}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {notification.status === "UNREAD" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          )}
                          <span className={`text-xs font-semibold ${notification.status === "UNREAD" ? "text-white" : "text-zinc-300"}`}>
                            {notification.title || notification.payload?.title || "No Title"}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500 mt-1 line-clamp-1 leading-relaxed">
                          {notification.message || notification.payload?.message || "No message content."}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium transition-all ${state.getPriorityStyles(notification.priority ?? 1)}`}>
                        {state.getPriorityLabel(notification.priority ?? 1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-center font-medium">
                      <span className="text-zinc-450 uppercase tracking-widest text-[9px] border border-zinc-850 px-1.5 py-0.5 rounded bg-zinc-900/20">
                        {notification.targetScope}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500 font-mono whitespace-nowrap">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "-"}
                    </td>
                    <td className="px-5 py-4 text-right pr-6 whitespace-nowrap">
                      <button
                        onClick={() => state.handleToggleRead(notification.id, notification.status)}
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded transition-all duration-300 cursor-pointer ${
                          notification.status === "READ"
                            ? "border border-zinc-800 text-zinc-550 hover:text-zinc-350 hover:bg-zinc-905 hover:border-zinc-700"
                            : "border border-emerald-500/20 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/50 hover:border-emerald-500/40"
                        }`}
                      >
                        {notification.status === "READ" ? "Mark Unread" : "Mark Read"}
                      </button>
                    </td>
                  </tr>
                ))}

                {state.filteredNotifications.length === 0 && !state.loading && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-zinc-500 text-xs">
                      No notifications match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {state.isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" onClick={() => state.dispatch(notificationsActions.closeModal())} />
          
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/90 text-white animate-scaleIn">
            <button
              onClick={() => state.dispatch(notificationsActions.closeModal())}
              className="absolute right-5 top-5 p-1 rounded-full text-zinc-550 hover:text-white hover:bg-zinc-900 transition-all duration-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-light tracking-tight mb-5 flex items-center gap-2">
              <Send className="h-4.5 w-4.5 text-indigo-400" />
              Dispatch Notification Registry
            </h2>

            <form onSubmit={state.handleCreateNotification} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-555 uppercase tracking-widest block font-medium">Event Code</label>
                  <select
                    value={state.typeCode}
                    onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "typeCode", value: e.target.value }))}
                    className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 transition-all duration-300"
                  >
                    <option value="system_alert">System Alert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-555 uppercase tracking-widest block font-medium">Source Service</label>
                  <select
                    value={state.sourceService}
                    onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "sourceService", value: e.target.value }))}
                    className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 transition-all duration-300"
                  >
                    <option value="procurement-service">Procurement Service</option>
                    <option value="finance-service">Finance Service</option>
                    <option value="bidding-service">Bidding Service</option>
                    <option value="system-orchestrator">System Orchestrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] text-zinc-555 uppercase tracking-widest block font-medium">Target Scope</label>
                  <select
                    value={state.targetScope}
                    onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "targetScope", value: e.target.value }))}
                    className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 transition-all duration-300"
                  >
                    <option value="USER">User (Direct)</option>
                    <option value="ROLE">Role (Group)</option>
                    <option value="SYSTEM">System Broadcast</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-555 uppercase tracking-widest block font-medium">Target ID</label>
                  <input
                    type="number"
                    value={state.targetId}
                    onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "targetId", value: e.target.value }))}
                    placeholder="1"
                    className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-555 uppercase tracking-widest block font-medium">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => state.dispatch(notificationsActions.setFormField({ field: "priority", value: level }))}
                      className={`py-2 rounded-lg border text-xs cursor-pointer text-center font-medium transition-all duration-300 ${
                        state.priority === level
                          ? level === 3
                            ? "border-red-500/40 bg-red-950/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                            : level === 2
                            ? "border-amber-500/40 bg-amber-950/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                            : "border-blue-500/40 bg-blue-950/30 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      {level === 3 ? "High" : level === 2 ? "Medium" : "Low"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-555 uppercase tracking-widest block font-medium">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Purchase Order #42 Created"
                  value={state.title}
                  onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "title", value: e.target.value }))}
                  className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-750 focus:border-zinc-700 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-555 uppercase tracking-widest block font-medium">Message Payload</label>
                <textarea
                  placeholder="e.g. A new purchase order PO-10293 has been created and requires your review."
                  value={state.message}
                  onChange={(e) => state.dispatch(notificationsActions.setFormField({ field: "message", value: e.target.value }))}
                  className="w-full h-20 rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-750 focus:border-zinc-700 transition-all duration-300 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => state.dispatch(notificationsActions.closeModal())}
                  className="px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-xs font-semibold cursor-pointer transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={state.creating}
                  className="px-5 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] text-xs font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all duration-300"
                >
                  {state.creating && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Dispatch event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
