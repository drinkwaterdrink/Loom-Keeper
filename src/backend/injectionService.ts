import type { LoomPermissionState, LoomSettings } from '../shared/types.js';

export function describeInjectionStatus(settings: LoomSettings, permissions: LoomPermissionState): string {
  if (!settings.promptInjectionEnabled) return 'Prompt injection is off for Milestone 1.';
  if (!permissions.generation) return 'Prompt injection needs interceptor support in the next milestone.';
  return 'Prompt injection foundation is ready; interceptor registration is planned for Milestone 2.';
}
