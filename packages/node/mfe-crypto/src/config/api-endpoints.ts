export const API_ENDPOINTS = {
  identity: {
    assignments: (orgId: string) => `/api/v1/identity/organizations/${orgId}/assignments`,
    auditEvents: (orgId: string) => `/api/v1/identity/organizations/${orgId}/audit-events`,
    verifyAudit: (orgId: string) => `/api/v1/identity/organizations/${orgId}/audit-events/verify`,
  },
  auth: {
    login: `/api/v1/auth/login`,
    signup: `/api/v1/auth/signup`,
    resetPassword: `/api/v1/auth/reset-password`,
  },
  campaigns: {
    list: `/api/v1/campaigns`,
    create: `/api/v1/campaigns`,
    update: (id: string) => `/api/v1/campaigns/${id}`,
    delete: (id: string) => `/api/v1/campaigns/${id}`,
    recipients: {
      list: `/api/v1/campaigns/recipients`,
      create: `/api/v1/campaigns/recipients`,
      update: (id: string) => `/api/v1/campaigns/recipients/${id}`,
      delete: (id: string) => `/api/v1/campaigns/recipients/${id}`,
    },
    schedules: {
      list: `/api/v1/campaigns/schedules`,
      create: `/api/v1/campaigns/schedules`,
      update: (id: string) => `/api/v1/campaigns/schedules/${id}`,
      delete: (id: string) => `/api/v1/campaigns/schedules/${id}`,
    },
  },
  crypto: {
    symbols: `/api/v1/crypto/symbols`,
    ticker: (symbol: string) => `/api/v1/crypto/ticker?symbol=${symbol}`,
    allTickers: `/api/v1/crypto/all-tickers`,
    price: (symbol: string) => `/api/v1/crypto/price?symbol=${symbol}`,
    avgPrice: (symbol: string) => `/api/v1/crypto/avg-price?symbol=${symbol}`,
    bookTicker: (symbol: string) => `/api/v1/crypto/book-ticker?symbol=${symbol}`,
    orderbook: (symbol: string, limit = 5) => `/api/v1/crypto/orderbook?symbol=${symbol}&limit=${limit}`,
    trades: (symbol: string, limit = 5) => `/api/v1/crypto/trades?symbol=${symbol}&limit=${limit}`,
    movers: `/api/v1/crypto/movers`,
    details: (symbol: string) => `/api/v1/crypto/details?symbol=${symbol}`,
    klines: (symbol: string, interval = '1d', limit = 5) => `/api/v1/crypto/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
  },
  email: {
    send: `/api/v1/email/send`,
    schedule: `/api/v1/email/schedule`,
    scheduled: `/api/v1/email/scheduled`,
  },
  fieldService: {
    operatingHours: {
      list: `/api/v1/fieldservice/operating-hours`,
      create: `/api/v1/fieldservice/operating-hours`,
      update: (id: string) => `/api/v1/fieldservice/operating-hours/${id}`,
      delete: (id: string) => `/api/v1/fieldservice/operating-hours/${id}`,
    },
    territories: {
      list: `/api/v1/fieldservice/territories`,
      create: `/api/v1/fieldservice/territories`,
      update: (id: string) => `/api/v1/fieldservice/territories/${id}`,
      delete: (id: string) => `/api/v1/fieldservice/territories/${id}`,
    },
    resources: {
      list: `/api/v1/fieldservice/resources`,
      create: `/api/v1/fieldservice/resources`,
      update: (id: string) => `/api/v1/fieldservice/resources/${id}`,
      delete: (id: string) => `/api/v1/fieldservice/resources/${id}`,
    },
    appointments: {
      list: `/api/v1/fieldservice/appointments`,
      create: `/api/v1/fieldservice/appointments`,
      update: (id: string) => `/api/v1/fieldservice/appointments/${id}`,
      delete: (id: string) => `/api/v1/fieldservice/appointments/${id}`,
      candidates: (id: string) => `/api/v1/fieldservice/appointments/${id}/candidates`,
      assign: (id: string) => `/api/v1/fieldservice/appointments/${id}/assign`,
    },
    workOrders: {
      list: `/api/v1/fieldservice/work-orders`,
      create: `/api/v1/fieldservice/work-orders`,
      update: (id: string) => `/api/v1/fieldservice/work-orders/${id}`,
      delete: (id: string) => `/api/v1/fieldservice/work-orders/${id}`,
    },
  },
  github: {
    templates: `/api/v1/github/templates`,
    repoInfo: `/api/v1/github/repo-info`,
    workflowRuns: `/api/v1/github/workflow-runs`,
    dispatch: `/api/v1/github/dispatch`,
    createWorkflow: `/api/v1/github/create-workflow`,
  },
  jobs: {
    list: `/api/v1/jobs`,
    create: `/api/v1/jobs`,
    update: (id: string) => `/api/v1/jobs/${id}`,
    delete: (id: string) => `/api/v1/jobs/${id}`,
    runs: (jobId: string) => `/api/v1/jobs/${jobId}/runs`,
    trigger: (jobId: string) => `/api/v1/jobs/${jobId}/runs`,
  },
  notifications: {
    list: `/api/v1/notifications`,
    create: `/api/v1/notifications`,
    updateStatus: (id: string) => `/api/v1/notifications/${id}/status`,
    unreadCount: `/api/v1/notifications/unread-count`,
    devices: `/api/v1/notifications/devices`,
  },
  reminders: {
    list: `/api/v1/reminders`,
    create: `/api/v1/reminders`,
    update: (id: string) => `/api/v1/reminders/${id}`,
    delete: (id: string) => `/api/v1/reminders/${id}`,
  },
  workflows: {
    list: `/api/v1/workflows`,
    create: `/api/v1/workflows`,
    update: (id: string) => `/api/v1/workflows/${id}`,
    delete: (id: string) => `/api/v1/workflows/${id}`,
    runs: (workflowId: string) => `/api/v1/workflows/${workflowId}/runs`,
    trigger: (workflowId: string) => `/api/v1/workflows/${workflowId}/runs`,
  },
};

export interface ValidationErrorResponse {
  message: string;
  details: Record<string, string>;
}

export class ApiValidationError extends Error {
  public details: Record<string, string>;
  constructor(message: string, details: Record<string, string>) {
    super(message);
    this.name = 'ApiValidationError';
    this.details = details;
  }
}
