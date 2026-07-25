import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import {
  createRequest,
  selectSignupStatus,
  selectSignupLastAction,
  resetLastAction,
  signupSlice,
} from "./signupSlice";

export function useSignupPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const status = useAppSelector(selectSignupStatus);
  const lastAction = useAppSelector(selectSignupLastAction);
  const ui = useAppSelector((state) => state.signup.ui);

  const { localError = null, formFields = {} } = ui;
  const { username = "", email = "", password = "" } = formFields;

  const loading = status === "loading";
  const error = localError || (lastAction?.status === "error" ? lastAction.message : "");
  const success = lastAction?.status === "success" ? "Account created successfully! Redirecting to login..." : "";

  const handleSignup = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      dispatch(signupSlice.actions.setLocalError("Please fill in all fields"));
      return;
    }
    dispatch(signupSlice.actions.setLocalError(""));
    dispatch(createRequest({ username, email, password }));
  }, [dispatch, username, email, password]);

  useEffect(() => {
    if (lastAction?.status === "success") {
      const timer = setTimeout(() => {
        dispatch(resetLastAction());
        router.push("/login");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lastAction, router, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetLastAction());
    };
  }, [dispatch]);

  return {
    router,
    dispatch,
    status,
    lastAction,
    ui,
    username,
    email,
    password,
    localError,
    loading,
    error,
    success,
    handleSignup,
  };
}
