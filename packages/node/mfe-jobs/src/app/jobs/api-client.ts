/**
 * Jobs API — built on the shared createResourceApi factory.
 */
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { createResourceApi } from '@/shared/utils/resourceApi';

export interface Job {
  id: number;
  orgId: number;
  name: string;
  status: string;
  config: Record<string, any>;
  categoryId?: number;
}

export interface JobRun {
  id: number;
  jobId: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

const base = createResourceApi<Job>({
  endpoints: API_ENDPOINTS.jobs as any,
  storageKey: 'piq_jobs',
  label: 'job',
  seed: [
    { id: 1, orgId: 1, name: 'Nightly Vendor Sync', status: 'active', config: { cron: '0 2 * * *' } },
    { id: 2, orgId: 1, name: 'Contract Expiry Sweep', status: 'paused', config: {} },
  ],
});

export const JobsApi = Object.assign(base, {
  listRuns: (jobId: number) =>
    base.get<JobRun[]>(API_ENDPOINTS.jobs.runs(String(jobId)), 'list job runs'),
  triggerRun: (jobId: number) =>
    base.post<JobRun>(API_ENDPOINTS.jobs.trigger(String(jobId)), {}, 'trigger job run'),
});
