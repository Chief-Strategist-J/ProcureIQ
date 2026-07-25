export interface ActionTemplate {
  id: number;
  name: string;
  category: string;
  description: string;
  cronExpression: string;
  eventType: string;
  yamlContent: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RepoInfo {
  fullName: string;
  name: string;
  description: string;
  htmlUrl: string;
  stars: number;
  openIssues: number;
}

export interface WorkflowRun {
  id: number;
  status: string;
  conclusion: string;
  event: string;
  htmlUrl: string;
}

export interface CreateWorkflowResult {
  path: string;
  sha: string;
  htmlUrl: string;
  message: string;
  mock: boolean;
}
