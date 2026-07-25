import { API_ENDPOINTS } from "@/config/api-endpoints";
import { AppConfig } from "@/config/app-config";
import { request } from "@/shared/utils/apiClient";
import { fetchWithFallback, mutateWithFallback } from "@/shared/utils/fallbackClient";

const BACKEND_URL = AppConfig.apiUrl;

export class UnifiedApiClient {
  public static async listCampaigns(): Promise<any[]> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.campaigns.list}`;
    return fetchWithFallback<any[]>(url, { method: "GET" }, "piq_campaigns", "list campaigns", () =>
      JSON.parse(localStorage.getItem("piq_campaigns") || "[]")
    );
  }

  public static async createCampaign(data: any): Promise<any> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.campaigns.create}`;
    return mutateWithFallback<any>(url, { method: "POST", body: JSON.stringify(data) }, "piq_campaigns", "create campaign", (list) => {
      const newItem = { id: list.length > 0 ? Math.max(...list.map((c: any) => c.id)) + 1 : 1, ...data };
      return { updatedList: [...list, newItem], returnVal: newItem };
    });
  }

  public static async updateCampaign(id: number, data: any): Promise<any> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.campaigns.update(String(id))}`;
    return mutateWithFallback<any>(url, { method: "PUT", body: JSON.stringify(data) }, "piq_campaigns", "update campaign", (list) => {
      const updated = list.map((item: any) => (item.id === id ? { ...item, ...data } : item));
      return { updatedList: updated, returnVal: { id, ...data } };
    });
  }

  public static async deleteCampaign(id: number): Promise<void> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.campaigns.delete(String(id))}`;
    await mutateWithFallback<any>(url, { method: "DELETE" }, "piq_campaigns", "delete campaign", (list) => {
      return { updatedList: list.filter((c: any) => c.id !== id), returnVal: {} };
    });
  }

  public static async listRecipients(): Promise<any[]> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.campaigns.recipients.list}`;
    return fetchWithFallback<any[]>(url, { method: "GET" }, "piq_recipients", "list recipients", () =>
      JSON.parse(localStorage.getItem("piq_recipients") || "[]")
    );
  }

  public static async createRecipient(data: any): Promise<any> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.campaigns.recipients.create}`;
    return mutateWithFallback<any>(url, { method: "POST", body: JSON.stringify(data) }, "piq_recipients", "create recipient", (list) => {
      const newItem = { id: list.length > 0 ? Math.max(...list.map((r: any) => r.id)) + 1 : 1, ...data };
      return { updatedList: [...list, newItem], returnVal: newItem };
    });
  }

  public static async updateRecipient(id: number, data: any): Promise<any> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.campaigns.recipients.update(String(id))}`;
    return mutateWithFallback<any>(url, { method: "PUT", body: JSON.stringify(data) }, "piq_recipients", "update recipient", (list) => {
      const updated = list.map((item: any) => (item.id === id ? { ...item, ...data } : item));
      return { updatedList: updated, returnVal: { id, ...data } };
    });
  }

  public static async deleteRecipient(id: number): Promise<void> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.campaigns.recipients.delete(String(id))}`;
    await mutateWithFallback<any>(url, { method: "DELETE" }, "piq_recipients", "delete recipient", (list) => {
      return { updatedList: list.filter((r: any) => r.id !== id), returnVal: {} };
    });
  }

  public static async sendEmail(data: any): Promise<any> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.email.send}`;
    return request<any>(url, { method: "POST", body: JSON.stringify(data) }, "send email");
  }

  public static async scheduleEmail(data: any): Promise<any> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.email.schedule}`;
    return request<any>(url, { method: "POST", body: JSON.stringify(data) }, "schedule email");
  }

  public static async listScheduledEmails(): Promise<any[]> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.email.scheduled}`;
    return request<any[]>(url, { method: "GET" }, "list scheduled emails");
  }

  public static async listOperatingHours(): Promise<any[]> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.fieldService.operatingHours.list}`;
    return fetchWithFallback<any[]>(url, { method: "GET" }, "piq_operating_hours", "list operating hours", () =>
      JSON.parse(localStorage.getItem("piq_operating_hours") || "[]")
    );
  }

  public static async createOperatingHours(data: any): Promise<any> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.fieldService.operatingHours.create}`;
    return mutateWithFallback<any>(url, { method: "POST", body: JSON.stringify(data) }, "piq_operating_hours", "create operating hours", (list) => {
      const newItem = { id: list.length > 0 ? Math.max(...list.map((o: any) => o.id)) + 1 : 1, ...data };
      return { updatedList: [...list, newItem], returnVal: newItem };
    });
  }

  public static async listJobs(): Promise<any[]> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.jobs.list}`;
    return request<any[]>(url, { method: "GET" }, "list jobs");
  }

  public static async triggerJob(jobId: string): Promise<any> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.jobs.trigger(jobId)}`;
    return request<any>(url, { method: "POST" }, "trigger job");
  }

  public static async listNotifications(): Promise<any[]> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.notifications.list}`;
    return request<any[]>(url, { method: "GET" }, "list notifications");
  }

  public static async updateNotificationStatus(id: string, status: string): Promise<any> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.notifications.updateStatus(id)}`;
    return request<any>(url, { method: "PUT", body: JSON.stringify({ status }) }, "update notification status");
  }
}
