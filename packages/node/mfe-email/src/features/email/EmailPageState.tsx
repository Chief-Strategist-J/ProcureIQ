import React, { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { fetchRequest, selectEmailState } from "./emailSlice";

export function useEmailPageState() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const emailState = useAppSelector(selectEmailState);

  const items = useMemo(() => emailState.items.data ?? [], [emailState.items.data]);
  const loading = emailState.items.status === "loading";
  const error = emailState.items.error;

  const fetchItems = useCallback(() => {
    dispatch(fetchRequest());
  }, [dispatch]);

  useEffect(() => {
    if (emailState.items.status === "idle") {
      fetchItems();
    }
  }, [emailState.items.status, fetchItems]);

  return {
    router,
    dispatch,
    emailState,
    items,
    loading,
    error,
    fetchItems,
  };
}
