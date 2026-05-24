import { defaultSettings, STORAGE_KEYS } from '../shared/defaults.js';
import type { LoomSettings } from '../shared/types.js';
import type { LoomSpindle } from './lumiverseApi.js';
import { getJsonWithRecovery, setJsonWithRecovery, type StorageWarningSink } from './storageRecovery.js';

export class LoomSettingsService {
  constructor(
    private readonly spindle: LoomSpindle,
    private readonly onStorageWarning?: StorageWarningSink,
  ) {}

  async load(userId: string): Promise<LoomSettings> {
    const stored = await getJsonWithRecovery(
      this.spindle,
      STORAGE_KEYS.settings,
      userId,
      defaultSettings,
      this.onStorageWarning,
    );
    return this.merge(stored);
  }

  async save(userId: string, patch: Partial<LoomSettings>): Promise<LoomSettings> {
    const current = await this.load(userId);
    const next = this.merge({ ...current, ...patch });
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.settings, userId, next);
    return next;
  }

  async reset(userId: string): Promise<LoomSettings> {
    const next = this.merge(defaultSettings);
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.settings, userId, next);
    return next;
  }

  private merge(value: unknown): LoomSettings {
    const raw = value && typeof value === 'object' && !Array.isArray(value) ? { ...value as Record<string, any> } : {};

    // 1. Conservative Settings Migration: map old layout/display keys to new keys
    if ('showChatLoomPanel' in raw && typeof raw.showChatLoomPanel === 'boolean') {
      raw.showChatHudLauncher = raw.showChatLoomPanel;
    }
    if ('trackerHudView' in raw && (raw.trackerHudView === 'compact' || raw.trackerHudView === 'full')) {
      raw.hudDefaultView = raw.trackerHudView;
    }
    if ('renderTrackersInMessages' in raw && typeof raw.renderTrackersInMessages === 'boolean') {
      raw.renderInMessages = raw.renderTrackersInMessages;
    }
    if ('defaultPlacement' in raw) {
      if (raw.defaultPlacement === 'top' || raw.defaultPlacement === 'bottom') {
        raw.messageCardPlacement = raw.defaultPlacement;
      }
    }

    // Clean up deprecated layout keys
    delete raw.showChatLoomPanel;
    delete raw.trackerHudView;
    delete raw.renderTrackersInMessages;
    delete raw.defaultPlacement;
    delete raw.trackerPlacement;
    delete raw.trackerDisplayScope;

    const next: LoomSettings = {
      ...defaultSettings,
      ...raw,
    } as unknown as LoomSettings;

    if (!next.activePresetId) next.activePresetId = defaultSettings.activePresetId;
    if (!next.messageCardPlacement) next.messageCardPlacement = defaultSettings.messageCardPlacement;
    return next;
  }
}
