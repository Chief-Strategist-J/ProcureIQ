"use client";

import React, { useEffect } from "react";
import {
  Search, ListChecks, Plus, RefreshCw, CheckCircle2, AlertCircle, X, Edit2, Trash2, Play, History,
} from "lucide-react";
import { Job } from "./types";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { jobsActions } from "@/features/jobs/jobsSlice";

import { useJobsPageState } from "@/features/jobs/JobsPageState";

export default function JobsPage() {
  const state = useJobsPageState();

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 shadow-md">
              <ListChecks className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Job Scheduler
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Trigger runs, configure category tasks, and adjust offline schedule configurations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => state.dispatch(jobsActions.fetchJobsRequest())}
            disabled={state.loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 backdrop-blur-md px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${state.loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => state.openModal()}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 active:scale-[0.98] px-4 py-2 text-xs font-semibold shadow-[0_0_15px_rgba(79,70,229,0.25)] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Job
          </button>
        </div>
      </div>

      {state.success && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-emerald-950 bg-emerald-950/30 px-4 py-3.5 text-xs text-emerald-400 animate-slideDown">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Job action successful.</span>
        </div>
      )}

      {state.triggerSuccess && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-emerald-950 bg-emerald-950/30 px-4 py-3.5 text-xs text-emerald-400 animate-slideDown">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Run triggered successfully.</span>
        </div>
      )}

      {state.error && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-red-950 bg-red-955/30 px-4 py-3.5 text-xs text-red-400 animate-slideDown">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state.runsError && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-red-950 bg-red-955/30 px-4 py-3.5 text-xs text-red-400 animate-slideDown">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{state.runsError}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search jobs by name, status, or ID..."
            value={state.searchQuery}
            onChange={(e) => state.dispatch(jobsActions.setSearchQuery(e.target.value))}
            className="w-full rounded-lg bg-zinc-950/60 border border-zinc-850 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
          />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-zinc-900 bg-zinc-955/20 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/50 text-[10px] uppercase tracking-widest text-zinc-505 font-semibold">
                <th className="px-5 py-4 w-20 text-center">ID</th>
                <th className="px-5 py-4 w-28 text-center">Org ID</th>
                <th className="px-5 py-4">Job Name</th>
                <th className="px-5 py-4 w-32">Status</th>
                <th className="px-5 py-4 max-w-xs">Configuration</th>
                <th className="px-5 py-4 w-36 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-zinc-500">
                    {state.loading ? "Syncing scheduler details..." : "No scheduled jobs match the filter criteria."}
                  </td>
                </tr>
              ) : (
                state.filteredItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-zinc-900/10 transition-all duration-300 border-b border-zinc-900">
                    <td className="px-5 py-4 text-xs font-mono text-zinc-500 text-center">{item.id}</td>
                    <td className="px-5 py-4 text-xs font-mono text-zinc-500 text-center">{item.orgId}</td>
                    <td className="px-5 py-4 font-medium text-xs text-zinc-200">{item.name}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium uppercase ${
                        item.status === "active" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30" : "bg-zinc-900 text-zinc-400 border-zinc-800"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-zinc-500 max-w-xs truncate">
                      {JSON.stringify(item.config)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => state.openRunsModal(item)}
                          title="View Run History"
                          className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:text-white transition-all text-zinc-400 cursor-pointer"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => state.handleTriggerRun(item.id)}
                          title="Trigger Run Now"
                          className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:text-white transition-all text-zinc-400 cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => state.openModal(item)}
                          className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:text-white transition-all text-zinc-400 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => state.handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-750 hover:bg-red-950/20 hover:text-red-400 transition-all text-zinc-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {state.isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" onClick={() => state.dispatch(jobsActions.closeModal())} />
 
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/90 text-white animate-scaleIn">
            <button
              onClick={() => state.dispatch(jobsActions.closeModal())}
              className="absolute right-5 top-5 p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all duration-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
 
            <h2 className="text-lg font-light tracking-tight mb-6">
              {state.modalMode === "create" ? "Schedule New Job" : "Edit Job Configuration"}
            </h2>
 
            <form onSubmit={state.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Org ID</label>
                  <input
                    type="number"
                    value={state.orgId}
                    onChange={(e) => state.dispatch(jobsActions.setFormField({ field: "orgId", value: e.target.value }))}
                    required
                    className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Category ID (Optional)</label>
                  <input
                    type="number"
                    value={state.categoryId}
                    onChange={(e) => state.dispatch(jobsActions.setFormField({ field: "categoryId", value: e.target.value }))}
                    className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
                  />
                </div>
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Job Name</label>
                <input
                  type="text"
                  value={state.name}
                  onChange={(e) => state.dispatch(jobsActions.setFormField({ field: "name", value: e.target.value }))}
                  placeholder="e.g. Nightly Vendor Sync"
                  required
                  className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
                />
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Status</label>
                <select
                  value={state.status}
                  onChange={(e) => state.dispatch(jobsActions.setFormField({ field: "status", value: e.target.value }))}
                  className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Config (JSON)</label>
                <textarea
                  value={state.configText}
                  onChange={(e) => state.dispatch(jobsActions.setFormField({ field: "configText", value: e.target.value }))}
                  rows={5}
                  spellCheck={false}
                  className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
                />
                {state.configError && <p className="text-[11px] text-red-400">{state.configError}</p>}
              </div>
 
              <div className="flex justify-end gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => state.dispatch(jobsActions.closeModal())}
                  className="px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold cursor-pointer transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {state.isRunsModalOpen && state.runsJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" onClick={() => state.dispatch(jobsActions.setFormField({ field: "isRunsModalOpen", value: false }))} />
 
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-955 p-6 shadow-2xl shadow-black/90 text-white animate-scaleIn">
            <button
              onClick={() => state.dispatch(jobsActions.setFormField({ field: "isRunsModalOpen", value: false }))}
              className="absolute right-5 top-5 p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-905 transition-all duration-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
 
            <h2 className="text-lg font-light tracking-tight mb-1 flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-indigo-400" />
              Runs — {state.runsJob.name}
            </h2>
            <p className="text-[11px] text-zinc-500 mb-4">Job #{state.runsJob.id}</p>
 
            <button
              onClick={() => state.handleTriggerRun(state.runsJob!.id)}
              className="mb-4 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              Trigger New Run
            </button>
 
            <div className="max-h-72 overflow-y-auto rounded-lg border border-zinc-900 divide-y divide-zinc-900">
              {state.runsLoading ? (
                <div className="flex items-center justify-center py-10 text-zinc-500">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
              ) : state.runs.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs">No runs recorded yet.</div>
              ) : (
                state.runs.map((run: any) => (
                  <div key={run.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-zinc-300">Run #{run.id}</span>
                      <span className="ml-2 text-zinc-505 font-light">
                        {run.startedAt ? new Date(run.startedAt).toLocaleString() : "Not started"}
                      </span>
                    </div>
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-zinc-900 text-zinc-400 border-zinc-800">
                      {run.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
