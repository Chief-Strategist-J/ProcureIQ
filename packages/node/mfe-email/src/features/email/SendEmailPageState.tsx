import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { sendRequest, selectEmailSendState, resetSendState, selectEmailState } from "./emailSlice";

export function useSendEmailPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sendState = useAppSelector(selectEmailSendState);
  const emailState = useAppSelector(selectEmailState);

  const { formFields = {} } = emailState.ui;
  const { recipients = "", subject = "", body = "" } = formFields;

  const sending = sendState.status === "loading";
  const error = sendState.error;
  const success = emailState.lastAction?.status === "success" && emailState.lastAction?.type === "create" ? emailState.lastAction.message : "";

  const handleSend = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const recipientList = recipients
      .split(",")
      .map((r: string) => r.trim())
      .filter((r: string) => r.length > 0);

    dispatch(sendRequest({ recipients: recipientList, subject, body }));
  }, [dispatch, recipients, subject, body]);

  useEffect(() => {
    return () => {
      dispatch(resetSendState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (sendState.status === "succeeded") {
      const timer = setTimeout(() => router.push("/email"), 1500);
      return () => clearTimeout(timer);
    }
  }, [sendState.status, router]);

  return {
    router,
    dispatch,
    sendState,
    emailState,
    ui: emailState.ui,
    recipients,
    subject,
    body,
    sending,
    error,
    success,
    handleSend,
  };
}
