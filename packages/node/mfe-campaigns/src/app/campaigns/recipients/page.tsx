"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Plus, RefreshCw, CheckCircle2, AlertCircle, X, Edit2, Trash2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/shared/store/hooks";
import { recipientsActions } from "@/features/campaigns/campaignsSlice";
import { Recipient } from "../types";

export default function RecipientsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: items = [], status: fetchStatus } = useAppSelector(state => state.campaigns.recipients.items);
  const { searchQuery, isModalOpen, modalMode, editingId, formFields, saving, localError, successMessage } = useAppSelector(state => state.campaigns.recipients.ui);

  const loading = fetchStatus === "loading";
  const error = localError;

  const accountId = formFields.accountId ?? "1";
  const name = formFields.name ?? "";
  const email = formFields.email ?? "";
  const phone = formFields.phone ?? "";

  const fetchItems = useCallback(() => {
    dispatch(recipientsActions.fetchRequest());
  }, [dispatch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    dispatch(recipientsActions.openModal({
      mode: "create",
      initialFields: { accountId: "1", name: "", email: "", phone: "" }
    }));
  };

  const openEditModal = (item: Recipient) => {
    dispatch(recipientsActions.openModal({
      mode: "edit",
      editingId: item.id,
      initialFields: { accountId: item.accountId.toString(), name: item.name, email: item.email || "", phone: item.phone || "" }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: Omit<Recipient, "id"> = { accountId: parseInt(accountId) || 1, name };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;

    if (modalMode === "create") {
      dispatch(recipientsActions.createRequest(payload));
    } else if (modalMode === "edit" && editingId !== null) {
      dispatch(recipientsActions.updateRequest({ id: editingId, data: payload }));
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this recipient?")) return;
    dispatch(recipientsActions.deleteRequest(id));
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      item.id.toString().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
        <span className="hover:text-zinc-300 cursor-pointer" onClick={() => router.push("/campaigns")}>Campaigns</span>
        <span>/</span>
        <span className="text-zinc-300">Recipients</span>
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 shadow-md">
              <Users className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Recipient Directory
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Manage contacts targeted by campaign email sends.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={fetchItems}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 backdrop-blur-md px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.08)]"
          >
            <Plus className="h-4 w-4" />
            Add Recipient
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 text-xs bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2.5 animate-fadeIn backdrop-blur-md">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-3.5 text-xs bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2.5 animate-fadeIn backdrop-blur-md">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchQuery}
            onChange={(e) => dispatch(recipientsActions.setSearchQuery(e.target.value))}
            className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/80">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
              <RefreshCw className="h-8 w-8 animate-spin text-zinc-600 mb-3" />
              <p className="text-xs tracking-wider">Syncing recipient directory...</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-sm text-left">
              <thead>
                <tr className="bg-zinc-950/80 text-left text-[11px] text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <th className="px-5 py-4 font-medium w-24">ID</th>
                  <th className="px-5 py-4 font-medium w-64">Name</th>
                  <th className="px-5 py-4 font-medium w-64">Email</th>
                  <th className="px-5 py-4 font-medium w-40">Phone</th>
                  <th className="px-5 py-4 font-medium text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/20 transition-all duration-300 border-b border-zinc-900 text-zinc-300">
                    <td className="px-5 py-4 text-xs font-mono font-semibold text-white">#{item.id}</td>
                    <td className="px-5 py-4 text-xs font-medium text-zinc-200">{item.name}</td>
                    <td className="px-5 py-4 text-xs font-mono text-zinc-400">{item.email || "—"}</td>
                    <td className="px-5 py-4 text-xs font-mono text-zinc-400">{item.phone || "—"}</td>
                    <td className="px-5 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:text-white transition-all text-zinc-400 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/20 bg-zinc-950/60 hover:text-red-400 transition-all text-zinc-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-zinc-500 text-xs">
                      No recipients found in directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" onClick={() => dispatch(recipientsActions.closeModal())} />

          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/90 text-white animate-scaleIn">
            <button
              onClick={() => dispatch(recipientsActions.closeModal())}
              className="absolute right-5 top-5 p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all duration-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-light tracking-tight mb-5 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-amber-400" />
              {modalMode === "create" ? "Add Recipient" : "Edit Recipient"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Account ID</label>
                <input
                  type="number"
                  value={accountId}
                  onChange={(e) => dispatch(recipientsActions.setFormField({ field: "accountId", value: e.target.value }))}
                  required
                  className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => dispatch(recipientsActions.setFormField({ field: "name", value: e.target.value }))}
                  placeholder="e.g. Acme Corp Procurement"
                  required
                  className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => dispatch(recipientsActions.setFormField({ field: "email", value: e.target.value }))}
                  placeholder="contact@example.com"
                  className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">Phone (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => dispatch(recipientsActions.setFormField({ field: "phone", value: e.target.value }))}
                  placeholder="+15550101"
                  className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-300"
                />
              </div>

              <div className="flex justify-end gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => dispatch(recipientsActions.closeModal())}
                  className="px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold cursor-pointer transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] text-xs font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all duration-300"
                >
                  {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
