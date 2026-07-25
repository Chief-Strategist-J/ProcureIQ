"use client";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { AppConfig } from "@/config/app-config";
import { request } from "@/shared/utils/apiClient";

const BACKEND_URL = AppConfig.apiUrl;

export interface DispatchPayload {
  typeCode: string;
  sourceService: string;
  targetScope: string;
  targetId: number | null;
  priority: number;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export class DispatchApi {
  static async dispatch(payload: DispatchPayload): Promise<void> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.notifications.create}`;
    await request<void>(url, {
      method: "POST",
      body: JSON.stringify({
        typeCode: payload.typeCode,
        sourceService: payload.sourceService,
        targetScope: payload.targetScope,
        targetId: payload.targetId,
        priority: payload.priority,
        payload: {
          title: payload.title,
          message: payload.message,
        },
        metadata: payload.metadata ?? {
          timestamp: new Date().toISOString(),
          environment: "production",
          dispatchMethod: "full_page_dispatcher",
        },
      }),
    }, "dispatch notification");
  }
}
