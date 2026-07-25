import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { signupSlice } from "./signupSlice";
import { AuthApi } from "@/app/login/api-client";

export function useLoginPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.signup.ui);

  const { localError = null, formFields = {} } = ui;
  const { username = "", password = "", loading = false, isResetOpen = false } = formFields;

  const error = localError;

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      dispatch(signupSlice.actions.setLocalError("Please fill in all fields"));
      return;
    }

    dispatch(signupSlice.actions.setFormField({ field: "loading", value: true }));
    dispatch(signupSlice.actions.setLocalError(""));

    try {
      const data = await AuthApi.login({ username, password });
      localStorage.setItem("procureiq_token", data.token);
      localStorage.setItem("procureiq_user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      dispatch(signupSlice.actions.setLocalError(err.message || "Something went wrong. Please try again."));
    } finally {
      dispatch(signupSlice.actions.setFormField({ field: "loading", value: false }));
    }
  }, [dispatch, router, username, password]);

  return {
    router,
    dispatch,
    ui,
    username,
    password,
    error,
    loading: !!loading,
    isResetOpen: !!isResetOpen,
    handleLogin,
  };
}
