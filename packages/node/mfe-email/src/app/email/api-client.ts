import { API_ENDPOINTS } from "@/config/api-endpoints";
import { AppConfig } from "@/config/app-config";
import { EmailSendRequest, EmailScheduleRequest, EmailResponse, EmailScheduleResponse } from "./types";
import { createResourceApi } from "@/shared/utils/resourceApi";
import { request } from "@/shared/utils/apiClient";

export const ScheduledEmailApi = createResourceApi<EmailScheduleResponse>({
  endpoints: {
    list: API_ENDPOINTS.email.scheduled,
    create: API_ENDPOINTS.email.schedule,
    get: "",
    update: (id: string) => "",
    delete: (id: string) => ""
  },
  storageKey: "piq_scheduled_emails",
  label: "scheduled email",
  seed: [
    {
      id: 1,
      recipients: ["procurement@acme.example"],
      subject: "Vendor Insurance Certificate Reminder",
      body: "Please renew your general liability certificate before it expires.",
      scheduled_for: "2026-07-15T09:00:00.000Z",
      status: "pending",
      created_at: "2026-07-11T12:00:00.000Z",
    }
  ],
});

export class EmailApi {
  static async sendNow(data: EmailSendRequest): Promise<EmailResponse> {
    const BACKEND_URL = AppConfig.pythonApiUrl;
    const url = `${BACKEND_URL}${API_ENDPOINTS.email.send}`;
    try {
      const result = await request<EmailResponse>(url, { method: "POST", body: JSON.stringify(data) }, "send email");
      return result;
    } catch (e) {
      console.warn("Offline: simulating email send locally", e);
      return { status: "success", message: "[Offline Sandbox] Email queued for local simulation." };
    }
  }

  static async scheduleEmail(data: EmailScheduleRequest): Promise<EmailScheduleResponse> {
    return ScheduledEmailApi.create(data as unknown as Omit<EmailScheduleResponse, "id">);
  }

  static async listScheduled(): Promise<EmailScheduleResponse[]> {
    return ScheduledEmailApi.list();
  }
}
