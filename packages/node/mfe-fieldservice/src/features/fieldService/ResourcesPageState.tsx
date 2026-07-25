import React, { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { resourcesSlice } from "./fieldServiceSlice";
import { ServiceResource } from "@/app/field-service/types";

export function useServiceResourcesPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.fieldService.resources.items.data) ?? [];
  const loading = useAppSelector((s) => s.fieldService.resources.items.status === "loading");
  const storeError = useAppSelector((s) => s.fieldService.resources.items.error);
  const ui = useAppSelector((s) => s.fieldService.resources.ui);

  const { searchQuery = "", isModalOpen = false, modalMode = "create", editingId = null, formFields = {}, localError = null, successMessage = null } = ui;
  const { name = "", resourceType = "technician", isActive = true } = formFields;

  const error = localError || storeError || "";
  const success = successMessage || "";
  const saving = loading && isModalOpen;

  const fetchItems = useCallback(() => {
    dispatch(resourcesSlice.actions.fetchRequest(undefined));
  }, [dispatch]);

  const openModal = useCallback((item?: ServiceResource) => {
    if (item) {
      dispatch(resourcesSlice.actions.openModal({
        mode: "edit",
        editingId: item.id,
        initialFields: { name: item.name, resourceType: item.resourceType, isActive: item.isActive }
      }));
    } else {
      dispatch(resourcesSlice.actions.openModal({
        mode: "create",
        initialFields: { name: "", resourceType: "technician", isActive: true }
      }));
    }
  }, [dispatch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (modalMode === "create") {
      dispatch(resourcesSlice.actions.createRequest({ name, resourceType, isActive }));
      dispatch(resourcesSlice.actions.setSuccessMessage("Service resource creation initiated."));
    } else if (modalMode === "edit" && editingId !== null) {
      dispatch(resourcesSlice.actions.updateRequest({ id: editingId, data: { name, resourceType, isActive } }));
      dispatch(resourcesSlice.actions.setSuccessMessage("Service resource update initiated."));
    }
  }, [dispatch, name, resourceType, isActive, modalMode, editingId]);

  const handleDelete = useCallback((id: number) => {
    if (!confirm("Are you sure you want to delete this service resource?")) return;
    dispatch(resourcesSlice.actions.deleteRequest(id));
    dispatch(resourcesSlice.actions.setSuccessMessage("Service resource deletion initiated."));
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.resourceType.toLowerCase().includes(q) ||
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
    resourceType,
    isActive,
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
