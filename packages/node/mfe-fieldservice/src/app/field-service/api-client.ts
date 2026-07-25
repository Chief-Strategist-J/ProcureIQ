"use client";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { AppConfig } from "@/config/app-config";
import {
  OperatingHours,
  ServiceTerritory,
  ServiceResource,
  ServiceAppointment,
  AssignedResourceResponse
} from "./types";
import { createResourceApi } from "@/shared/utils/resourceApi";
import { request } from "@/shared/utils/apiClient";

const BACKEND_URL = AppConfig.apiUrl;

export const operatingHoursApi = createResourceApi<OperatingHours>({
  endpoints: API_ENDPOINTS.fieldService.operatingHours,
  storageKey: "piq_operating_hours",
  label: "operating hours",
});

export const territoriesApi = createResourceApi<ServiceTerritory>({
  endpoints: API_ENDPOINTS.fieldService.territories,
  storageKey: "piq_territories",
  label: "territory",
});

export const resourcesApi = createResourceApi<ServiceResource>({
  endpoints: API_ENDPOINTS.fieldService.resources,
  storageKey: "piq_resources",
  label: "resource",
});

export const appointmentsApi = createResourceApi<ServiceAppointment>({
  endpoints: API_ENDPOINTS.fieldService.appointments,
  storageKey: "piq_appointments",
  label: "appointment",
  seed: [
    {
      id: 1,
      parentId: 1001,
      parentType: "work_order",
      status: "new",
      earliestStartPermitted: "2026-07-11T08:00:00.000Z",
      dueDate: "2026-07-18T17:00:00.000Z",
      duration: 2.5,
    } as ServiceAppointment
  ]
});

export class FieldServiceApi {
  static async getCandidates(appointmentId: number): Promise<ServiceResource[]> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.fieldService.appointments.candidates(String(appointmentId))}`;
    return (await request<ServiceResource[]>(url, { method: "GET" }, "get candidates")) || [];
  }

  static async assignResource(appointmentId: number, resourceId: number): Promise<AssignedResourceResponse> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.fieldService.appointments.assign(String(appointmentId))}?resourceId=${resourceId}`;
    return await request<AssignedResourceResponse>(url, { method: "POST" }, "assign resource");
  }
}
