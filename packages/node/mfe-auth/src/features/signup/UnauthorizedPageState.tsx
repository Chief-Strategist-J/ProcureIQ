import React, { useState, useCallback } from "react";

export function useUnauthorizedPageState() {
  const [requestStatus, setRequestStatus] = useState<"idle" | "requesting" | "requested">("idle");

  const handleRequestAccess = useCallback(() => {
    setRequestStatus("requesting");
    setTimeout(() => {
      setRequestStatus("requested");
    }, 2000);
  }, []);

  return {
    requestStatus,
    setRequestStatus,
    handleRequestAccess,
  };
}
