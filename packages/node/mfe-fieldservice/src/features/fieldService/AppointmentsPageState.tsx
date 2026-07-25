import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { appointmentsSlice, resourcesSlice } from "./fieldServiceSlice";

export function useAppointmentsPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.fieldService.appointments.items.data) ?? [];
  const resources = useAppSelector((s) => s.fieldService.resources.items.data) ?? [];
  const loading = useAppSelector((s) => s.fieldService.appointments.items.status === "loading");

  const handleDelete = useCallback((id: number) => {
    if (!confirm("Are you sure?")) return;
    dispatch(appointmentsSlice.actions.deleteRequest(id));
  }, [dispatch]);

  const getResourceName = useCallback((resId?: number) => {
    if (!resId) return "Unassigned";
    const r = resources.find((x) => x.id === resId);
    return r ? r.name : `ID: ${resId}`;
  }, [resources]);

  useEffect(() => {
    dispatch(appointmentsSlice.actions.fetchRequest(undefined));
    dispatch(resourcesSlice.actions.fetchRequest(undefined));
  }, [dispatch]);

  return {
    router,
    dispatch,
    items,
    resources,
    loading,
    handleDelete,
    getResourceName,
  };
}
