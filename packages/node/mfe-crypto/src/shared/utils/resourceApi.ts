

import { AppConfig } from '@/config/app-config';
import { fetchWithFallback, mutateWithFallback } from '@/shared/utils/fallbackClient';
import { request } from '@/shared/utils/apiClient';

function getBaseUrl(): string {
  return AppConfig.apiUrl;
}

export interface ResourceEndpoints {
  list: string;
  create: string;
  update: (id: string) => string;
  delete: (id: string) => string;
  [key: string]: string | ((id: string) => string);
}

export interface ResourceApiOptions<T extends { id: number }> {
  
  endpoints: ResourceEndpoints;
  
  storageKey: string;
  
  label: string;
  
  seed?: T[];
}

export function createResourceApi<T extends { id: number }>(opts: ResourceApiOptions<T>) {
  const { endpoints, storageKey, label, seed } = opts;

  function init() {
    if (typeof window !== 'undefined' && !localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(seed ?? []));
    }
  }

  function getAll(): T[] {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }

  const api = {
    init,

    async list(): Promise<T[]> {
      init();
      return fetchWithFallback<T[]>(
        `${getBaseUrl()}${endpoints.list}`,
        { method: 'GET' },
        storageKey,
        `list ${label}`,
        getAll
      );
    },

    async create(data: Omit<T, 'id'>): Promise<T> {
      init();
      return mutateWithFallback<T>(
        `${getBaseUrl()}${endpoints.create}`,
        { method: 'POST', body: JSON.stringify(data) },
        storageKey,
        `create ${label}`,
        (list) => {
          const newId = list.length > 0 ? Math.max(...list.map((x: any) => x.id)) + 1 : 1;
          const newItem = { id: newId, ...data } as T;
          return { updatedList: [...list, newItem], returnVal: newItem };
        }
      );
    },

    async update(id: number, data: Omit<T, 'id'>): Promise<T> {
      init();
      return mutateWithFallback<T>(
        `${getBaseUrl()}${endpoints.update(String(id))}`,
        { method: 'PUT', body: JSON.stringify(data) },
        storageKey,
        `update ${label}`,
        (list) => {
          const updatedList = list.map((x: any) => (x.id === id ? { ...x, ...data } : x));
          return { updatedList, returnVal: { id, ...data } as T };
        }
      );
    },

    async remove(id: number): Promise<void> {
      init();
      await mutateWithFallback<any>(
        `${getBaseUrl()}${endpoints.delete(String(id))}`,
        { method: 'DELETE' },
        storageKey,
        `delete ${label}`,
        (list) => ({
          updatedList: list.filter((x: any) => x.id !== id),
          returnVal: {},
        })
      );
    },

    
    async get<R>(url: string, context: string): Promise<R> {
      return (await request<R>(`${getBaseUrl()}${url}`, { method: 'GET' }, context)) as R;
    },

    
    async post<R>(url: string, body: object, context: string): Promise<R> {
      return (await request<R>(`${getBaseUrl()}${url}`, { method: 'POST', body: JSON.stringify(body) }, context)) as R;
    },
  };

  return Object.assign(api, {
    listWorkflows: api.list,
    createWorkflow: api.create,
    updateWorkflow: api.update,
    deleteWorkflow: api.remove,

    listJobs: api.list,
    createJob: api.create,
    updateJob: api.update,
    deleteJob: api.remove,

    listReminders: api.list,
    createReminder: api.create,
    updateReminder: api.update,
    deleteReminder: api.remove,
  });
}
