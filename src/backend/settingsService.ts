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
    const record = value && typeof value === 'object' && !Array.isArray(value) ? value as Partial<LoomSettings> : {};
    const next: LoomSettings = {
      ...defaultSettings,
      ...record,
    };
    if (!next.activePresetId) next.activePresetId = defaultSettings.activePresetId;
    if (!next.defaultPlacement) next.defaultPlacement = defaultSettings.defaultPlacement;
    return next;
  }
}
