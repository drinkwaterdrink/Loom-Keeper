export type LoomPlacement = 'top' | 'bottom' | 'pinned' | 'drawer' | 'hidden' | 'disabled';
export type LoomDensity = 'compact' | 'normal' | 'expanded';
export type LoomTheme = 'system' | 'glass' | 'paper' | 'terminal' | 'minimal';
export type LoomTrackerSource = 'passive_extract' | 'sidecar_generate' | 'manual_edit' | 'repair';

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
  defaultPlacement: LoomPlacement;
  stripTrackerBlocksFromMessages: boolean;
  showFloatingButton: boolean;
  showMessageButtons: boolean;
  debugMode: boolean;
  promptInjectionEnabled: boolean;
  showChatLoomPanel: boolean;
  renderTrackersInMessages: boolean;
  trackerPlacement: 'drawer' | 'chat_panel' | 'message_card' | 'both';
  cardDensity: 'compact' | 'normal';
  trackerHudView: 'compact' | 'full';
}

export interface LoomPermissionState {
  chats: boolean;
  chat_mutation: boolean;
  generation: boolean;
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

export interface LoomDiagnostics {
  backendReady: boolean;
  lastError?: string | undefined;
  lastParserError?: string | undefined;
  lastGenerationError?: string | undefined;
  lastRenderStatus?: string | undefined;
  lastRenderMessageId?: string | undefined;
  storageWarning?: string | undefined;
  renderLimitation?: string | undefined;
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
  generation: LoomGenerationStatus;
  diagnostics: LoomDiagnostics;
}

export type LoomFrontendMessage =
  | { type: 'ready'; chatId?: string | null | undefined }
  | { type: 'refresh_state'; chatId?: string | null | undefined }
  | { type: 'save_settings'; settings: Partial<LoomSettings> }
  | { type: 'select_preset'; presetId: string }
  | { type: 'generate_tracker'; chatId?: string | null | undefined; messageId?: string | undefined }
  | { type: 'edit_tracker'; tracker: LoomTrackerState }
  | { type: 'delete_tracker'; chatId: string; messageId?: string | undefined }
  | { type: 'hide_tracker'; chatId: string; messageId?: string | undefined; hidden: boolean }
  | { type: 'reset_storage' }
  | { type: 'export_diagnostics' };

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
}
