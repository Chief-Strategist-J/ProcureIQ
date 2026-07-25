"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Users, CalendarDays, ArrowRight, ShieldCheck, Settings, Activity } from "lucide-react";
import { useFieldServiceDashboardState } from "@/features/fieldService/FieldServiceDashboardState";

export default function FieldServiceDashboard() {
  const state = useFieldServiceDashboardState();

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans relative">
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[380px] h-[380px] bg-emerald-500/3 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 shadow-md">
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Field Service Hub
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Unified FSL dispatcher operations, constraint scheduling, and territory mapping.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <ShieldCheck className="h-3 w-3" />
            Scheduling Engine Online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {state.sections.map((sec) => (
          <div
            key={sec.title}
            onClick={() => state.router.push(sec.href)}
            className="group relative rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/20 backdrop-blur-md p-6 hover:border-zinc-700 transition-all duration-300 cursor-pointer overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-x-8 -translate-y-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex items-start justify-between gap-4">
              <div className={`p-2.5 rounded-lg border ${sec.color}`}>
                <sec.icon className="h-5 w-5" />
              </div>
              <span className="text-3xl font-extralight tracking-tight font-mono text-zinc-400">
                {sec.count.toString().padStart(2, "0")}
              </span>
            </div>

            <h3 className="text-lg font-light tracking-tight text-white mt-4 group-hover:text-indigo-400 transition-colors duration-300">
              {sec.title}
            </h3>
            
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              {sec.description}
            </p>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 group-hover:text-white mt-6 transition-colors duration-300">
              Manage Records
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-6 backdrop-blur-md">
        <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3 flex items-center gap-2">
          <Settings className="h-3.5 w-3.5 text-zinc-650" />
          FSL Engine Constraints Configuration
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-400">
          <div className="p-4 rounded-lg bg-zinc-950/40 border border-zinc-900">
            <span className="block font-medium text-white mb-1">Time Slot Matching</span>
            Verify candidate working hours and shift availability before booking appointments.
          </div>
          <div className="p-4 rounded-lg bg-zinc-950/40 border border-zinc-900">
            <span className="block font-medium text-white mb-1">Territory Boundaries</span>
            Enforce geofence mapping restrictions to only show technicians active in target zone.
          </div>
          <div className="p-4 rounded-lg bg-zinc-950/40 border border-zinc-900">
            <span className="block font-medium text-white mb-1">Crew Capacity Allocation</span>
            Auto-resolve service resource types between individual technicians and service crews.
          </div>
        </div>
      </div>
    </div>
  );
}
