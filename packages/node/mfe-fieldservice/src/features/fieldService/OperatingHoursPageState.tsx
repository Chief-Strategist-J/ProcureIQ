import React, { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { operatingHoursSlice } from "./fieldServiceSlice";
import { OperatingHours } from "@/app/field-service/types";

export function useOperatingHoursPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.fieldService.operatingHours.items.data) ?? [];
  const loading = useAppSelector((s) => s.fieldService.operatingHours.items.status === "loading");
  const storeError = useAppSelector((s) => s.fieldService.operatingHours.items.error);
  const ui = useAppSelector((s) => s.fieldService.operatingHours.ui);

  const { searchQuery = "", isModalOpen = false, modalMode = "create", editingId = null, formFields = {}, localError = null, successMessage = null } = ui;
  const { name = "", timezone = "America/New_York" } = formFields;

  const error = localError || storeError || "";
  const success = successMessage || "";
  const saving = loading && isModalOpen;

  const fetchItems = useCallback(() => {
    dispatch(operatingHoursSlice.actions.fetchRequest(undefined));
  }, [dispatch]);

  const openModal = useCallback((item?: OperatingHours) => {
    if (item) {
      dispatch(operatingHoursSlice.actions.openModal({
        mode: "edit",
        editingId: item.id,
        initialFields: { name: item.name, timezone: item.timezone }
      }));
    } else {
      dispatch(operatingHoursSlice.actions.openModal({
        mode: "create",
        initialFields: { name: "", timezone: "America/New_York" }
      }));
    }
  }, [dispatch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (modalMode === "create") {
      dispatch(operatingHoursSlice.actions.createRequest({ name, timezone }));
      dispatch(operatingHoursSlice.actions.setSuccessMessage("Operating hours creation initiated."));
    } else if (modalMode === "edit" && editingId !== null) {
      dispatch(operatingHoursSlice.actions.updateRequest({ id: editingId, data: { name, timezone } }));
      dispatch(operatingHoursSlice.actions.setSuccessMessage("Operating hours update initiated."));
    }
  }, [dispatch, name, timezone, modalMode, editingId]);

  const handleDelete = useCallback((id: number) => {
    if (!confirm("Are you sure you want to delete these operating hours?")) return;
    dispatch(operatingHoursSlice.actions.deleteRequest(id));
    dispatch(operatingHoursSlice.actions.setSuccessMessage("Operating hours deletion initiated."));
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.timezone.toLowerCase().includes(q) ||
        item.id.toString().includes(q)
      );
    });
  }, [items, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    router,
    dispatch,
    items,
    loading,
    ui,
    searchQuery,
    isModalOpen,
    modalMode,
    editingId,
    name,
    timezone,
    error,
    success,
    saving,
    fetchItems,
    openModal,
    handleSubmit,
    handleDelete,
    filteredItems,
  };
}
