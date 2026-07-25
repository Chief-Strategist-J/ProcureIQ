export interface Job {
  id: number;
  orgId: number;
  categoryId?: number;
  name: string;
  status: string;
  config: Record<string, unknown>;
}

export interface JobRun {
  id: number;
  jobId: number;
  status: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}
