import { RoleAssignment, AssignRoleRequest, AuditEvent, ChainVerificationResult } from '@/shared/types/identity';
import { API_ENDPOINTS, ApiValidationError } from '@/config/api-endpoints';
import { VALIDATION_RULES } from '@/config/validation-rules';
import { AppConfig } from '@/config/app-config';
import { request } from './apiClient';

const API_BASE = AppConfig.apiUrl.includes("8080") ? "http://localhost:6565" : AppConfig.apiUrl;

export class IdentityService {
  private static instance: IdentityService;

  private constructor() {}

  public static getInstance(): IdentityService {
    if (!IdentityService.instance) {
      IdentityService.instance = new IdentityService();
    }
    return IdentityService.instance;
  }

  private validateRequest(req: AssignRoleRequest): void {
    const errors: Record<string, string> = {};

    if (!req.roleId) {
      errors.roleId = 'Role ID is required';
    }
    if (!req.principalType || !VALIDATION_RULES.principalTypes.includes(req.principalType)) {
      errors.principalType = `Principal type must be one of: ${VALIDATION_RULES.principalTypes.join(', ')}`;
    }
    if (!req.principalId) {
      errors.principalId = 'Principal ID is required';
    }
    if (!req.scopeType || !VALIDATION_RULES.scopeTypes.includes(req.scopeType)) {
      errors.scopeType = `Scope type must be one of: ${VALIDATION_RULES.scopeTypes.join(', ')}`;
    }
    if (req.expiresAfterSeconds !== undefined && req.expiresAfterSeconds < VALIDATION_RULES.expiresSecondsMin) {
      errors.expiresAfterSeconds = `Expiration seconds must be at least ${VALIDATION_RULES.expiresSecondsMin}`;
    }

    if (Object.keys(errors).length > 0) {
      throw new ApiValidationError('Local validation failed', errors);
    }
  }

  public async getAssignments(
    orgId: string,
    principalType: 'user' | 'service_account' | 'group',
    principalId: string
  ): Promise<RoleAssignment[]> {
    const params = new URLSearchParams({ principalType, principalId });
    const url = `${API_BASE}${API_ENDPOINTS.identity.assignments(orgId)}?${params.toString()}`;
    return (await request<RoleAssignment[]>(url, { method: 'GET' }, 'fetch role assignments')) || [];
  }

  public async assignRole(orgId: string, executorId: string, req: AssignRoleRequest): Promise<void> {
    this.validateRequest(req);
    
    const params = new URLSearchParams({ executorId });
    const url = `${API_BASE}${API_ENDPOINTS.identity.assignments(orgId)}?${params.toString()}`;
    await request<void>(url, {
      method: 'POST',
      body: JSON.stringify(req),
    }, 'assign role');
  }

  public async getAuditEvents(orgId: string): Promise<AuditEvent[]> {
    const url = `${API_BASE}${API_ENDPOINTS.identity.auditEvents(orgId)}`;
    return (await request<AuditEvent[]>(url, { method: 'GET' }, 'fetch audit events')) || [];
  }

  public async verifyAuditChain(orgId: string): Promise<ChainVerificationResult> {
    const url = `${API_BASE}${API_ENDPOINTS.identity.verifyAudit(orgId)}`;
    return await request<ChainVerificationResult>(url, { method: 'POST' }, 'verify audit chain');
  }
}

export const identityService = IdentityService.getInstance();
