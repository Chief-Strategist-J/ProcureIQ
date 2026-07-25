export const VALIDATION_RULES = {
  principalTypes: ['user', 'service_account', 'group'] as const,
  scopeTypes: ['org', 'workspace', 'resource'] as const,
  expiresSecondsMin: 1,
};
