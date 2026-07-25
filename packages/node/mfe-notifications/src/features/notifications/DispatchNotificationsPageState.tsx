import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { notificationsActions } from "./notificationsSlice";

export function useDispatchNotificationPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const notificationsState = useAppSelector((s) => s.notifications.notifications);
  const ui = notificationsState.ui;

  const { localError = null, successMessage = null, formFields = {} } = ui;
  const { typeCode = "system_alert", sourceService = "procurement-service", targetScope = "USER", targetId = "1", priority = 2, title = "", message = "" } = formFields;

  const creating = notificationsState.status === "loading";
  const error = localError || notificationsState.error || "";
  const success = notificationsState.lastAction || successMessage || "";

  const handleSubmit = useCallback((e: React.FormEvent) => {
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

  useEffect(() => {
    if (notificationsState.lastAction === 'Notification sent successfully!') {
      dispatch(notificationsActions.setSuccessMessage("Notification event dispatched successfully!"));
      dispatch(notificationsActions.setFormField({ field: "title", value: "" }));
      dispatch(notificationsActions.setFormField({ field: "message", value: "" }));

      const timer = setTimeout(() => {
        router.push("/notifications");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [notificationsState.lastAction, router, dispatch]);

  return {
    router,
    dispatch,
    notificationsState,
    ui,
    typeCode,
    sourceService,
    targetScope,
    targetId,
    priority,
    title,
    message,
    creating,
    error,
    success,
    handleSubmit,
  };
}
