import React, { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { signupSlice } from "./signupSlice";

export function useResetPasswordFormState() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.signup.ui);

  const { localError = null, formFields = {} } = ui;
  const { resetPassword = "", resetConfirmPassword = "", resetLoading = false, resetSuccess = false } = formFields;

  const token = searchParams.get("token") ?? "";
  const password = resetPassword;
  const confirmPassword = resetConfirmPassword;
  const loading = !!resetLoading;
  const success = !!resetSuccess;
  const error = localError;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      dispatch(signupSlice.actions.setLocalError("Authorization reset token is missing from the query payload."));
      return;
    }
    if (password.length < 8) {
      dispatch(signupSlice.actions.setLocalError("Password must be at least 8 characters in length."));
      return;
    }
    if (password !== confirmPassword) {
      dispatch(signupSlice.actions.setLocalError("Confirmation password does not match."));
      return;
    }

    dispatch(signupSlice.actions.setFormField({ field: "resetLoading", value: true }));
    dispatch(signupSlice.actions.setLocalError(""));

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Reset request rejected by server. Token may be expired.");
      }

      dispatch(signupSlice.actions.setFormField({ field: "resetSuccess", value: true }));
    } catch (err: any) {
      dispatch(signupSlice.actions.setLocalError(err.message || "Failed to update credentials. Please try again."));
    } finally {
      dispatch(signupSlice.actions.setFormField({ field: "resetLoading", value: false }));
    }
  }, [dispatch, token, password, confirmPassword]);

  return {
    searchParams,
    dispatch,
    ui,
    token,
    password,
    confirmPassword,
    loading,
    success,
    error,
    handleSubmit,
  };
}
