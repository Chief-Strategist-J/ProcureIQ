"use client";

import { API_ENDPOINTS } from "@/config/api-endpoints";
import { AppConfig } from "@/config/app-config";
import { ActionTemplate, RepoInfo, WorkflowRun, CreateWorkflowResult } from "./types";
import { request } from "@/shared/utils/apiClient";
import { createResourceApi } from "@/shared/utils/resourceApi";

const BACKEND_URL = AppConfig.apiUrl;

const templatesApi = createResourceApi<ActionTemplate>({
  endpoints: {
    list: API_ENDPOINTS.github.templates,
    create: "",
    update: () => "",
    delete: () => "",
  },
  storageKey: "piq_github_templates",
  label: "GitHub Templates",
  seed: [
    {
      id: 1,
      name: "Lint & Static Analysis Sweep",
      category: "Code Quality & Review",
      description: "Run linters and static analysis across active branches",
      cronExpression: "15 7 * * *",
      eventType: "lint_static_analysis_sweep.requested",
      yamlContent: "name: \"[Daily] Lint & Static Analysis Sweep\"\non:\n  workflow_dispatch:\n",
    }
  ],
});

export const GitHubApi = {
  ...templatesApi,

  getRepoInfo: async (owner: string, repo: string): Promise<RepoInfo> => {
    const params = new URLSearchParams({ owner, repo });
    const url = `${BACKEND_URL}${API_ENDPOINTS.github.repoInfo}?${params.toString()}`;
    return await request<RepoInfo>(url, { method: "GET" }, "fetch repository info");
  },

  listWorkflowRuns: async (owner: string, repo: string): Promise<WorkflowRun[]> => {
    const params = new URLSearchParams({ owner, repo });
    const url = `${BACKEND_URL}${API_ENDPOINTS.github.workflowRuns}?${params.toString()}`;
    return (await request<WorkflowRun[]>(url, { method: "GET" }, "fetch workflow runs")) || [];
  },

  dispatch: async (owner: string, repo: string, eventType: string, clientPayload: Record<string, unknown> = {}): Promise<string> => {
    const url = `${BACKEND_URL}${API_ENDPOINTS.github.dispatch}`;
    return await request<string>(url, {
      method: "POST",
      body: JSON.stringify({ owner, repo, eventType, clientPayload }),
    }, "trigger repository dispatch");
  },

  deployTemplate: async (
    owner: string,
    repo: string,
    template: ActionTemplate,
    commitMessage?: string
  ): Promise<CreateWorkflowResult> => {
    const workflowName = `daily-${template.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
    const url = `${BACKEND_URL}${API_ENDPOINTS.github.createWorkflow}`;
    return await request<CreateWorkflowResult>(url, {
      method: "POST",
      body: JSON.stringify({
        owner,
        repo,
        workflowName,
        yamlContent: template.yamlContent,
        commitMessage,
      }),
    }, "deploy template workflow");
  }
};
