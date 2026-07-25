import React, { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { notificationsActions } from "./notificationsSlice";

export function useNotificationsPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const rawData = useAppSelector((s) => s.notifications.notifications.data);
  const notifications = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (Array.isArray((rawData as any)?.notifications)) return (rawData as any).notifications;
    if (Array.isArray((rawData as any)?.content)) return (rawData as any).content;
    return [];
  }, [rawData]);
  const loading = useAppSelector((s) => s.notifications.notifications.status === "loading");
  const storeError = useAppSelector((s) => s.notifications.notifications.error);
  const notificationsUi = useAppSelector((s) => s.notifications.notifications.ui);

  const { searchQuery = "", isModalOpen = false, localError = null, successMessage = null, formFields = {} } = notificationsUi;
  const { statusFilter = "all", page = 0, refreshing = false, typeCode = "system_alert", sourceService = "procurement-service", targetScope = "USER", targetId = "1", priority = 2, title = "", message = "" } = formFields;

  const error = localError || storeError || "";
  const success = successMessage || "";
  const creating = loading && isModalOpen;

  const handleToggleRead = useCallback((notificationId: number, currentStatus: string) => {
    const newStatus = currentStatus === "READ" ? "UNREAD" : "READ";
    dispatch(notificationsActions.updateStatusRequest({ id: notificationId, status: newStatus as "READ" | "UNREAD" }));
    dispatch(notificationsActions.setSuccessMessage(`Notification marked as ${newStatus.toLowerCase()}`));
    setTimeout(() => dispatch(notificationsActions.setSuccessMessage("")), 3000);
  }, [dispatch]);

  const handleCreateNotification = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      dispatch(notificationsActions.setLocalError("Please fill in title and message payload fields"));
      return;
    }

    dispatch(notificationsActions.setLocalError(""));
    dispatch(notificationsActions.setSuccessMessage(""));

    const parsedTargetId = targetId ? parseInt(targetId, 10) : 1;
    const finalTargetId = Number.isNaN(parsedTargetId) ? 1 : parsedTargetId;

    dispatch(notificationsActions.dispatchNotificationRequest({
      userId: finalTargetId,
      title,
      message,
      channels: ["EMAIL"],
    }));
  }, [dispatch, title, message, targetId]);

  const getPriorityStyles = useCallback((p: number) => {
    if (p >= 3) return "text-red-400 bg-red-955/30 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.07)]";
    if (p === 2) return "text-amber-400 bg-amber-955/30 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.07)]";
    return "text-blue-400 bg-blue-955/20 border-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.05)]";
  }, []);

  const getPriorityLabel = useCallback((p: number) => {
    if (p >= 3) return "High Priority";
    if (p === 2) return "Medium";
    return "Low Priority";
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const titleVal = n.payload?.title || n.title || "";
      const msgVal = n.payload?.message || n.message || "";
      return (
        (n.typeCode ?? "").toLowerCase().includes(q) ||
        (n.sourceService ?? "").toLowerCase().includes(q) ||
        titleVal.toLowerCase().includes(q) ||
        msgVal.toLowerCase().includes(q)
      );
    });
  }, [notifications, searchQuery]);

  useEffect(() => {
    dispatch(notificationsActions.fetchNotificationsRequest({ page, statusFilter }));
  }, [dispatch, page, statusFilter]);

  return {
    router,
    dispatch,
    notifications,
    loading,
    storeError,
    notificationsUi,
    searchQuery,
    isModalOpen,
    localError,
    successMessage,
    statusFilter,
    page,
    refreshing,
    typeCode,
    sourceService,
    targetScope,
    targetId,
    priority,
    title,
    message,
    error,
    success,
    creating,
    handleToggleRead,
    handleCreateNotification,
    getPriorityStyles,
    getPriorityLabel,
    filteredNotifications,
  };
}
