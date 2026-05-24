import { builtInPresets, SLIM_SCENE_PRESET_ID, STORAGE_KEYS } from '../shared/defaults.js';
import type { LoomPreset } from '../shared/types.js';
import type { LoomSpindle } from './lumiverseApi.js';
import { getJsonWithRecovery, setJsonWithRecovery, type StorageWarningSink } from './storageRecovery.js';

function isPreset(value: unknown): value is LoomPreset {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value)
    && typeof (value as LoomPreset).id === 'string'
    && typeof (value as LoomPreset).name === 'string'
    && typeof (value as LoomPreset).htmlTemplate === 'string';
}

export class LoomPresetService {
  constructor(
    private readonly spindle: LoomSpindle,
    private readonly onStorageWarning?: StorageWarningSink,
  ) {}

  async loadAll(userId: string): Promise<LoomPreset[]> {
    const stored = await getJsonWithRecovery<unknown[]>(
      this.spindle,
      STORAGE_KEYS.presets,
      userId,
      [],
      this.onStorageWarning,
    );
    const custom = Array.isArray(stored) ? stored.filter(isPreset) : [];
    const customIds = new Set(custom.map((preset) => preset.id));
    return [
      ...builtInPresets.filter((preset) => !customIds.has(preset.id)),
      ...custom,
    ];
  }

  async resolve(userId: string, presetId: string): Promise<LoomPreset> {
    const presets = await this.loadAll(userId);
    return presets.find((preset) => preset.id === presetId)
      ?? presets.find((preset) => preset.id === SLIM_SCENE_PRESET_ID)
      ?? builtInPresets[0];
  }

  async reset(userId: string): Promise<LoomPreset[]> {
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.presets, userId, []);
    return this.loadAll(userId);
  }
}
