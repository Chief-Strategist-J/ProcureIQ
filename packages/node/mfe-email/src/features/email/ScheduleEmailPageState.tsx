import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { createRequest, selectEmailState, resetLastAction } from "./emailSlice";

export function useScheduleEmailPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const emailState = useAppSelector(selectEmailState);

  const { formFields = {} } = emailState.ui;
  const { recipients = "", subject = "", body = "", scheduledFor = "" } = formFields;

  const error = emailState.lastAction?.status === "error" ? emailState.lastAction.message : "";
  const success = emailState.lastAction?.status === "success" && emailState.lastAction?.type === "create" ? "Email scheduled successfully." : "";
  const saving = emailState.items.status === "loading";

  const handleSchedule = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const recipientList = recipients
      .split(",")
      .map((r: string) => r.trim())
      .filter((r: string) => r.length > 0);

    dispatch(createRequest({
      recipients: recipientList,
      subject,
      body,
      scheduled_for: new Date(scheduledFor).toISOString(),
      status: "pending",
      created_at: new Date().toISOString()
    }));
  }, [dispatch, recipients, subject, body, scheduledFor]);

  useEffect(() => {
    return () => {
      dispatch(resetLastAction());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/email");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  return {
    router,
    dispatch,
    emailState,
    ui: emailState.ui,
    recipients,
    subject,
    body,
    scheduledFor,
    saving,
    error,
    success,
    handleSchedule,
  };
}
