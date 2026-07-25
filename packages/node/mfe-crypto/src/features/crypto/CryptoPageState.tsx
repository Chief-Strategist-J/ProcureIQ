import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { cryptoActions } from "./cryptoSlice";
import { useCallback } from "react";

export function useCryptoPageState() {
  const dispatch = useAppDispatch();
  const cryptoState = useAppSelector((state) => state.crypto);

  const setSymbol = useCallback((sym: string) => {
    dispatch(cryptoActions.setSymbol(sym));
  }, [dispatch]);

  const setCurrency = useCallback((curr: string) => {
    dispatch(cryptoActions.setCurrency(curr));
  }, [dispatch]);

  const openModal = useCallback(() => {
    dispatch(cryptoActions.openReminderModal());
  }, [dispatch]);

  const closeModal = useCallback(() => {
    dispatch(cryptoActions.closeReminderModal());
  }, [dispatch]);

  const setTargetPrice = useCallback((val: string) => {
    dispatch(cryptoActions.setTargetPrice(val));
  }, [dispatch]);

  const setDueAt = useCallback((val: string) => {
    dispatch(cryptoActions.setDueAt(val));
  }, [dispatch]);

  const setChannel = useCallback((val: string) => {
    dispatch(cryptoActions.setChannel(val));
  }, [dispatch]);

  const setReminderSuccess = useCallback((val: string | null) => {
    dispatch(cryptoActions.setReminderSuccess(val));
  }, [dispatch]);

  return {
    ...cryptoState,
    setSymbol,
    setCurrency,
    openModal,
    closeModal,
    setTargetPrice,
    setDueAt,
    setChannel,
    setReminderSuccess,
  };
}
