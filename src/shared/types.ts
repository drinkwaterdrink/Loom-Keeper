export type LoomPlacement = 'top' | 'bottom' | 'pinned' | 'drawer' | 'hidden' | 'disabled';
export type LoomDensity = 'compact' | 'normal' | 'expanded';
export type LoomTheme = 'system' | 'glass' | 'paper' | 'terminal' | 'minimal';
export type LoomTrackerSource = 'passive_extract' | 'sidecar_generate' | 'manual_edit' | 'repair';
export type LoomPresetOrigin = 'built-in' | 'custom' | 'imported' | 'duplicated';
export type LoomParseFailureCategory = 'empty' | 'invalid_json' | 'fenced_markdown' | 'schema_invalid' | 'missing_required_fields' | 'unknown';
export type LoomTemplateEngine = 'loom' | 'handlebars_compat';
export type LoomTemplateSourceFormat = 'loom' | 'simtracker';
export type LoomCustomTemplateMode = 'trusted_layout' | 'strict_sanitized' | 'safe_generic';
export type LoomInjectionMode = 'latest_brief' | 'latest_plus_history';

export interface LoomTemplateField {
  key: string;
  description: string;
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | undefined;
  itemSchema?: string | LoomTemplateField[] | undefined;
}

export interface LoomValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface LoomValidationReport {
  ok: boolean;
  issues: LoomValidationIssue[];
}

export interface LoomTrackerState {
  version: string;
  schemaVersion: string;
  presetId: string;
  chatId: string;
  messageId?: string | undefined;
  swipeId?: number | undefined;
  generatedAt: string;
  source: LoomTrackerSource;
  placement: LoomPlacement;
  data: Record<string, unknown>;
  compactSummary: string;
  validation: LoomValidationReport;
  rawOutput?: string | undefined;
  hidden?: boolean | undefined;
}

export interface LoomPreset {
  id: string;
  name: string;
  version: string;
  description: string;
  origin?: LoomPresetOrigin | undefined;
  templateEngine?: LoomTemplateEngine | undefined;
  sourceFormat?: LoomTemplateSourceFormat | undefined;
  customFields?: LoomTemplateField[] | undefined;
  mode: 'passive_extract' | 'sidecar_generate' | 'hybrid';
  schemaJson: Record<string, unknown>;
  htmlTemplate: string;
  promptInstructions: string;
  injectionTemplate: string;
  maxInjectionTokens: number;
  defaultPlacement: LoomPlacement;
  renderOptions: {
    density: LoomDensity;
    theme: LoomTheme;
    showControls: boolean;
  };
  parserOptions: {
    fenceNames: string[];
    strictJson: boolean;
    repairInvalidJson: boolean;
  };
  sampleData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LoomSettings {
  enabled: boolean;
  activePresetId: string;
  autoGenerate: boolean;
  sidecarConnectionId?: string | undefined;
  useDefaultConnectionFallback: boolean;
  stripTrackerBlocksFromMessages: boolean;
  showFloatingButton: boolean;
  showMessageButtons: boolean;
  debugMode: boolean;
  promptInjectionEnabled: boolean;
  showChatHudLauncher: boolean;
  hudDefaultView: 'compact' | 'full';
  renderInMessages: boolean;
  messageCardPlacement: 'top' | 'bottom';
  cardDensity: 'compact' | 'normal';
  trackerHistoryLimit: number;
  sidecarGenerationTimeoutMs?: number | undefined;
  useSafeRenderer?: boolean | undefined;
  customTemplateMode?: LoomCustomTemplateMode | undefined;
  promptInjectionMode?: LoomInjectionMode | undefined;
  promptInjectionTrackerLimit?: number | undefined;
  promptInjectionTokenBudget?: number | undefined;
  trackerGenerationHistoryLimit?: number | undefined;
  promptInjectionIncludeAppearance?: boolean | undefined;
  promptInjectionIncludeRules?: boolean | undefined;
  promptInjectionIncludeNextTurn?: boolean | undefined;
}

export interface LoomPermissionState {
  chats: boolean;
  chat_mutation: boolean;
  generation: boolean;
  interceptor?: boolean | undefined;
  app_manipulation?: boolean | undefined;
}

export interface LoomConnectionProfile {
  id: string;
  name: string;
  provider?: string | undefined;
  model?: string | undefined;
  is_default?: boolean | undefined;
  has_api_key?: boolean | undefined;
}

export interface LoomActiveChatState {
  id: string | null;
  name: string;
}

export interface LoomGenerationStatus {
  running: boolean;
  message?: string | undefined;
  disabledReason?: string | undefined;
}

export interface LoomRenderReport {
  html: string;
  success: boolean;
  fallbackUsed: boolean;
  sanitizerRemovedContent: boolean;
  templateMode?: LoomCustomTemplateMode | undefined;
  preservedData?: boolean | undefined;
  compatibility?: LoomTemplateCompatibilityReport | undefined;
  warning?: string | undefined;
  error?: string | undefined;
  missingFields: string[];
}

export interface LoomTemplateCompatibilityReport {
  templateEngine: LoomTemplateEngine;
  sourceFormat: LoomTemplateSourceFormat;
  referencedFields: string[];
  samplePresentFields: string[];
  latestPresentFields: string[];
  missingFromSample: string[];
  missingFromLatest: string[];
}

export interface LoomPipelineReport {
  activePresetId: string;
  presetName: string;
  presetSource: LoomPresetOrigin | string;
  timestamp: string;
  generationStartedAt?: string | undefined;
  generationCompletedAt?: string | undefined;
  elapsedMs?: number | undefined;
  timeoutMs?: number | undefined;
  previousFullTrackerIncluded?: boolean | undefined;
  previousFullTrackerMessageId?: string | undefined;
  previousFullTrackerSwipeId?: number | undefined;
  recentTrackerSummariesIncluded?: number | undefined;
  recentTrackerSummariesCompactOnly?: boolean | undefined;
  recentChatContextIncluded?: boolean | undefined;
  recentChatContextMessageCount?: number | undefined;
  estimatedSidecarPromptTokens?: number | undefined;
  worldInfoIncluded?: boolean | undefined;
  worldInfoStatus?: string | undefined;
  storageRetentionLimit?: number | undefined;
  trackerGenerationHistoryLimit?: number | undefined;
  promptInjectionTrackerLimit?: number | undefined;
  rawResponseAvailable: boolean;
  rawResponsePreview?: string | undefined;
  parseSuccess: boolean;
  parseError?: string | undefined;
  parseFailureCategory?: LoomParseFailureCategory | undefined;
  schemaValidationSuccess: boolean;
  schemaValidationError?: string | undefined;
  schemaValidationIssues?: LoomValidationIssue[] | undefined;
  renderSuccess: boolean;
  renderError?: string | undefined;
  renderWarning?: string | undefined;
  sanitizerRemovedContent: boolean;
  templateMode?: LoomCustomTemplateMode | undefined;
  preservedData?: boolean | undefined;
  templateCompatibility?: LoomTemplateCompatibilityReport | undefined;
  fallbackUsed: boolean;
  trackerPresetId?: string | undefined;
  messageId: string;
  swipeId?: number | undefined;
  chatId: string;
  hudView: string;
  retainedCount: number;
  lastError?: string | undefined;
}

export interface LoomInjectionReport {
  enabled: boolean;
  registered: boolean;
  available: boolean;
  latestTrackerAvailable?: boolean | undefined;
  mode: LoomInjectionMode;
  chatId?: string | undefined;
  trackerPresetId?: string | undefined;
  trackerGeneratedAt?: string | undefined;
  activeMessageId?: string | undefined;
  activeSwipeId?: number | undefined;
  activeSwipeTrackerUsed?: boolean | undefined;
  wrongSwipeFallbackAvoided?: boolean | undefined;
  contextDepthSetting?: number | undefined;
  storageRetentionSetting?: number | undefined;
  historyCompactOnly?: boolean | undefined;
  trackerCount: number;
  historyCount: number;
  estimatedTokens: number;
  tokenBudget: number;
  truncated: boolean;
  injectedAt?: string | undefined;
  lastSkippedReason?: string | undefined;
  preview?: string | undefined;
}

export interface LoomSwipeReport {
  activeMessageId?: string | undefined;
  activeSwipeId?: number | undefined;
  activeSwipeByMessageId: Record<string, number>;
  storedSwipeTrackerCount: number;
  alternativeSwipeTrackerCount: number;
  cleanupLastRunAt?: string | undefined;
  cleanupRemovedCount?: number | undefined;
  cleanupKeptCount?: number | undefined;
  cleanupWarning?: string | undefined;
}

export interface LoomDiagnostics {
  backendReady: boolean;
  lastError?: string | undefined;
  lastParserError?: string | undefined;
  lastGenerationError?: string | undefined;
  lastRenderStatus?: string | undefined;
  lastRenderMessageId?: string | undefined;
  storageWarning?: string | undefined;
  renderLimitation?: string | undefined;
  pipelineReport?: LoomPipelineReport | undefined;
  injectionReport?: LoomInjectionReport | undefined;
  swipeReport?: LoomSwipeReport | undefined;
}

/** Compact message summary for frontend message identification — no content exposed. */
export interface LoomChatMessageSummary {
  id: string;
  role: string;
  swipeId?: number | undefined;
  index: number;
}

export interface LoomFrontendState {
  backendReady: boolean;
  settings: LoomSettings;
  permissions: LoomPermissionState;
  presets: LoomPreset[];
  activePreset: LoomPreset;
  activeChat: LoomActiveChatState;
  connections: LoomConnectionProfile[];
  latestTracker: LoomTrackerState | null;
  messageTrackers: LoomTrackerState[];
  activeSwipeByMessageId: Record<string, number>;
  chatAssistantMessages: LoomChatMessageSummary[];
  generation: LoomGenerationStatus;
  diagnostics: LoomDiagnostics;
}

export type LoomFrontendMessage =
  | { type: 'ready'; chatId?: string | null | undefined }
  | { type: 'refresh_state'; chatId?: string | null | undefined }
  | { type: 'save_settings'; settings: Partial<LoomSettings> }
  | { type: 'select_preset'; presetId: string }
  | { type: 'generate_tracker'; chatId?: string | null | undefined; messageId?: string | undefined; swipeId?: number | undefined }
  | { type: 'edit_tracker'; tracker: LoomTrackerState }
  | { type: 'delete_tracker'; chatId: string; messageId?: string | undefined; swipeId?: number | undefined }
  | { type: 'hide_tracker'; chatId: string; messageId?: string | undefined; swipeId?: number | undefined; hidden: boolean }
  | { type: 'reset_storage' }
  | { type: 'export_diagnostics' }
  | { type: 'save_preset'; preset: LoomPreset; makeActive?: boolean | undefined }
  | { type: 'delete_preset'; presetId: string }
  | { type: 'reset_presets' }
  | { type: 'cancel_generation' };

export type LoomBackendMessage =
  | { type: 'state'; state: LoomFrontendState }
  | { type: 'settings_saved'; settings: LoomSettings }
  | { type: 'tracker_generated'; tracker: LoomTrackerState; state: LoomFrontendState }
  | { type: 'tracker_updated'; tracker: LoomTrackerState; state: LoomFrontendState }
  | { type: 'tracker_deleted'; state: LoomFrontendState }
  | { type: 'tracker_error'; message: string; state: LoomFrontendState }
  | { type: 'storage_reset'; state: LoomFrontendState }
  | { type: 'permissions_changed'; permissions: LoomPermissionState; state: LoomFrontendState }
  | { type: 'diagnostics'; diagnostics: LoomDiagnostics }
  | { type: 'error'; message: string }
  | { type: 'toast'; level: 'success' | 'warning' | 'error' | 'info'; message: string };

export interface LoomParseResult {
  found: boolean;
  data?: Record<string, unknown> | undefined;
  rawBlock?: string | undefined;
  cleanedContent?: string | undefined;
  error?: string | undefined;
  fenceName?: string | undefined;
}

export interface LoomChatMessage {
  id?: string | undefined;
  role?: string | undefined;
  content?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  swipe_id?: number | undefined;
  swipes?: string[] | undefined;
}
