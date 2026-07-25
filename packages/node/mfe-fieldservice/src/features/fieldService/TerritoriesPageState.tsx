import React, { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { territoriesSlice, operatingHoursSlice } from "./fieldServiceSlice";
import { ServiceTerritory, OperatingHours } from "@/app/field-service/types";

export function useTerritoriesPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.fieldService.territories.items.data) ?? [];
  const operatingHours = useAppSelector((s) => s.fieldService.operatingHours.items.data) ?? [];
  const loading = useAppSelector((s) => s.fieldService.territories.items.status === "loading");
  const storeError = useAppSelector((s) => s.fieldService.territories.items.error);
  const ui = useAppSelector((s) => s.fieldService.territories.ui);

  const { searchQuery = "", isModalOpen = false, modalMode = "create", editingId = null, formFields = {}, localError = null, successMessage = null } = ui;
  const { name = "", operatingHoursId = "", isActive = true } = formFields;

  const error = localError || storeError || "";
  const success = successMessage || "";
  const saving = loading && isModalOpen;

  const fetchItems = useCallback(() => {
    dispatch(territoriesSlice.actions.fetchRequest(undefined));
    dispatch(operatingHoursSlice.actions.fetchRequest(undefined));
  }, [dispatch]);

  const openModal = useCallback((item?: ServiceTerritory) => {
    if (item) {
      dispatch(territoriesSlice.actions.openModal({
        mode: "edit",
        editingId: item.id,
        initialFields: { name: item.name, operatingHoursId: item.operatingHoursId ? item.operatingHoursId.toString() : "", isActive: item.isActive }
      }));
    } else {
      dispatch(territoriesSlice.actions.openModal({
        mode: "create",
        initialFields: { name: "", operatingHoursId: "", isActive: true }
      }));
    }
  }, [dispatch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedOpId = parseInt(operatingHoursId, 10);
    const opId = operatingHoursId && !Number.isNaN(parsedOpId) ? parsedOpId : 0;

    if (modalMode === "create") {
      dispatch(territoriesSlice.actions.createRequest({ name, operatingHoursId: opId, isActive }));
      dispatch(territoriesSlice.actions.setSuccessMessage("Service territory creation initiated."));
    } else if (modalMode === "edit" && editingId !== null) {
      dispatch(territoriesSlice.actions.updateRequest({ id: editingId, data: { name, operatingHoursId: opId, isActive } }));
      dispatch(territoriesSlice.actions.setSuccessMessage("Service territory update initiated."));
    }
  }, [dispatch, name, operatingHoursId, isActive, modalMode, editingId]);

  const handleDelete = useCallback((id: number) => {
    if (!confirm("Are you sure you want to delete this service territory?")) return;
    dispatch(territoriesSlice.actions.deleteRequest(id));
    dispatch(territoriesSlice.actions.setSuccessMessage("Service territory deletion initiated."));
  }, [dispatch]);

  const getOperatingHoursName = useCallback((opId?: number) => {
    if (!opId) return "None";
    const op = operatingHours.find((x) => x.id === opId);
    return op ? op.name : `ID: ${opId}`;
  }, [operatingHours]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const opName = getOperatingHoursName(item.operatingHoursId).toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        opName.includes(q) ||
        item.id.toString().includes(q)
      );
    });
  }, [items, searchQuery, getOperatingHoursName]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    router,
    dispatch,
    items,
    operatingHours,
    loading,
    ui,
    searchQuery,
    isModalOpen,
    modalMode,
    editingId,
    name,
    operatingHoursId,
    error,
    success,
    saving,
    fetchItems,
    openModal,
    handleSubmit,
    handleDelete,
    getOperatingHoursName,
    filteredItems,
  };
}
