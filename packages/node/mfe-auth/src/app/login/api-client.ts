"use client";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { AppConfig } from "@/config/app-config";
import { request } from "@/shared/utils/apiClient";

const BACKEND_URL = AppConfig.apiUrl;

export class AuthApi {
  static async login(data: { username: string; password: string }): Promise<{ token: string; user: Record<string, any> }> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.auth.login}`;
    return await request<any>(url, { method: "POST", body: JSON.stringify(data) }, "login");
  }

  static async signup(data: { username: string; email: string; password: string }): Promise<void> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.auth.signup}`;
    await request<void>(url, { method: "POST", body: JSON.stringify(data) }, "signup");
  }

  static async resetPassword(data: { email: string }): Promise<void> {
    const url = `${BACKEND_URL}${API_ENDPOINTS.auth.resetPassword}`;
    await request<void>(url, { method: "POST", body: JSON.stringify(data) }, "reset password");
  }
}
