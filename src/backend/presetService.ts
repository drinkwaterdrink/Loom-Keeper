import { builtInPresets, SLIM_SCENE_PRESET_ID, STORAGE_KEYS } from '../shared/defaults.js';
import type { LoomPreset } from '../shared/types.js';
import type { LoomSpindle } from './lumiverseApi.js';
import { getJsonWithRecovery, setJsonWithRecovery, type StorageWarningSink } from './storageRecovery.js';
import { getPresetOrigin, isBuiltInPresetId, normalizePreset, normalizePresetId } from '../shared/validation.js';

function isPreset(value: unknown): value is LoomPreset {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value)
    && typeof (value as LoomPreset).id === 'string'
    && typeof (value as LoomPreset).name === 'string'
    && typeof (value as LoomPreset).htmlTemplate === 'string';
}

function withBuiltInOrigin(preset: LoomPreset): LoomPreset {
  return { ...preset, origin: 'built-in' };
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
    const custom = Array.isArray(stored) ? stored.filter(isPreset).map((preset) => this.normalizeCustomPreset(preset)) : [];
    const customIds = new Set(custom.map((preset) => preset.id));
    return [
      ...builtInPresets.filter((preset) => !customIds.has(preset.id)).map(withBuiltInOrigin),
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

  async save(userId: string, preset: LoomPreset): Promise<LoomPreset> {
    const normalized = this.normalizeCustomPreset(preset);

    const stored = await getJsonWithRecovery<unknown[]>(
      this.spindle,
      STORAGE_KEYS.presets,
      userId,
      [],
      this.onStorageWarning,
    );
    const custom = Array.isArray(stored) ? stored.filter(isPreset).map((item) => this.normalizeCustomPreset(item)) : [];
    
    const existingIndex = custom.findIndex((p) => p.id === normalized.id);
    if (existingIndex >= 0) {
      custom[existingIndex] = normalized;
    } else {
      custom.push(normalized);
    }

    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.presets, userId, custom);
    return normalized;
  }

  async delete(userId: string, presetId: string): Promise<LoomPreset[]> {
    // Prevent deleting built-in presets
    if (builtInPresets.some((p) => p.id === presetId)) {
      throw new Error(`Cannot delete built-in preset: ${presetId}`);
    }

    const stored = await getJsonWithRecovery<unknown[]>(
      this.spindle,
      STORAGE_KEYS.presets,
      userId,
      [],
      this.onStorageWarning,
    );
    const custom = Array.isArray(stored) ? stored.filter(isPreset) : [];
    const filtered = custom.filter((p) => p.id !== presetId);

    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.presets, userId, filtered);
    return this.loadAll(userId);
  }

  private normalizeCustomPreset(preset: Partial<LoomPreset>): LoomPreset {
    const normalized = normalizePreset(preset);
    let id = normalizePresetId(normalized.id);
    if (isBuiltInPresetId(id)) id = `${id}_custom`;
    return {
      ...normalized,
      id,
      origin: getPresetOrigin({ ...normalized, id }),
    };
  }
}
