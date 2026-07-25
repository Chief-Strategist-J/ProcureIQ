/**
 * Notifications API — built on the shared createResourceApi factory.
 */
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { AppConfig } from '@/config/app-config';
import { createResourceApi } from '@/shared/utils/resourceApi';
import { request } from '@/shared/utils/apiClient';
import { fetchWithFallback, mutateWithFallback } from '@/shared/utils/fallbackClient';

function getBaseUrl(): string {
  return AppConfig.apiUrl;
}

export interface NotificationItem {
  id: number;
  userId?: number;
  typeCode?: string;
  sourceService?: string;
  payload?: Record<string, any>;
  metadata?: Record<string, any>;
  priority?: number;
  targetScope?: string;
  title?: string;
  message?: string;
  status: 'READ' | 'UNREAD';
  channel?: string;
  createdAt: string;
}

const SEED: NotificationItem[] = [
  {
    id: 101, typeCode: 'PO_CREATED', sourceService: 'procurement-service',
    payload: { title: 'Purchase Order PO-2026-001 Logged', message: 'New procurement order ready for Acme Corp.' },
    priority: 2, targetScope: 'USER', status: 'UNREAD', createdAt: new Date().toISOString(),
  },
  {
    id: 102, typeCode: 'ESC_TRIGGERED', sourceService: 'system-orchestrator',
    payload: { title: 'Contract Compliance Alert', message: 'Escalation triggered: GL cert missing.' },
    priority: 3, targetScope: 'SYSTEM', status: 'UNREAD',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
];

const base = createResourceApi<NotificationItem>({
  endpoints: API_ENDPOINTS.notifications as any,
  storageKey: 'piq_notifications',
  label: 'notification',
  seed: SEED,
});

export const NotificationsApi = {
  listNotifications: (page = 0, statusFilter = 'all') =>
    fetchWithFallback<NotificationItem[]>(
      `${getBaseUrl()}${API_ENDPOINTS.notifications.list}?page=${page}&size=20&status=${statusFilter}`,
      { method: 'GET', headers: { 'X-User-Id': '1' } },
      'piq_notifications',
      'list notifications',
      () => {
        const all: NotificationItem[] = JSON.parse(localStorage.getItem('piq_notifications') || JSON.stringify(SEED));
        return statusFilter === 'all' ? all : all.filter(n => n.status === statusFilter);
      }
    ),

  updateStatus: (id: number, status: 'READ' | 'UNREAD') =>
    request<void>(
      `${getBaseUrl()}${API_ENDPOINTS.notifications.updateStatus(String(id))}`,
      { method: 'PUT', headers: { 'X-User-Id': '1' }, body: JSON.stringify({ status }) },
      'update notification status'
    ),

  dispatch: (userId: number, title: string, message: string, channels: string[]) =>
    mutateWithFallback<NotificationItem>(
      `${getBaseUrl()}${API_ENDPOINTS.notifications.create}`,
      { method: 'POST', headers: { 'X-User-Id': String(userId) }, body: JSON.stringify({ userId, title, message, channels, payload: {} }) },
      'piq_notifications',
      'dispatch notification',
      (list) => {
        const newNotif: NotificationItem = {
          id: Math.floor(Math.random() * 1000000),
          userId,
          typeCode: 'SYSTEM_ALERT',
          sourceService: 'frontend-service',
          title,
          message,
          status: 'UNREAD',
          channel: channels[0] || 'SMS',
          createdAt: new Date().toISOString(),
        };
        return { updatedList: [newNotif, ...(list || [])], returnVal: newNotif };
      }
    ),
};
