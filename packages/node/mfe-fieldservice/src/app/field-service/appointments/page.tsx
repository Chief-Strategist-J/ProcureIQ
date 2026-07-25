"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useAppointmentsPageState } from "@/features/fieldService/AppointmentsPageState";

export default function AppointmentsPage() {
  const state = useAppointmentsPageState();

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="flex items-center gap-3 mb-8 border-b border-zinc-900 pb-6">
        <CalendarDays className="h-5 w-5 text-blue-400" />
        <h1 className="text-2xl font-light tracking-tight">Service Appointments</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm text-left">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.status}</td>
                <td><button onClick={() => state.handleDelete(item.id)}><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
