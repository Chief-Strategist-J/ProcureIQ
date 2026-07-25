export interface BaseRole {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  createdAt: string;
}

export interface Role extends BaseRole {
  organizationId?: string;
  parentRoleId?: string;
}

export interface BaseRoleAssignment {
  id: string;
  principalType: 'user' | 'service_account' | 'group';
  principalId: string;
  scopeType: 'org' | 'workspace' | 'resource';
  scopeId?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface RoleAssignment extends BaseRoleAssignment {
  organizationId: string;
  roleId: string;
  grantedBy: string;
}

export interface BaseAuditEvent {
  id: string;
  actorType: 'user' | 'service_account' | 'api_key' | 'system';
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  severity: 'info' | 'warning' | 'security_critical';
  beforeValue?: Record<string, any>;
  afterValue?: Record<string, any>;
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  prevHash: string;
  entryHash: string;
  occurredAt: string;
}

export interface AuditEvent extends BaseAuditEvent {
  organizationId: string;
}

export interface AssignRoleRequest {
  roleId: string;
  principalType: 'user' | 'service_account' | 'group';
  principalId: string;
  scopeType: 'org' | 'workspace' | 'resource';
  scopeId?: string;
  expiresAfterSeconds?: number;
}

export interface ChainVerificationResult {
  isValid: boolean;
  failedEventId?: string;
  failedEventAction?: string;
  message: string;
}
