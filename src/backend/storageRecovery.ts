import type { LoomSpindle } from './lumiverseApi.js';

export type StorageWarningSink = (message: string) => void;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function setJsonWithRecovery(
  spindle: LoomSpindle,
  key: string,
  userId: string,
  value: unknown,
): Promise<void> {
  const setJson = spindle.userStorage?.setJson;
  if (!setJson) return;
  try {
    await setJson(key, value, { userId, indent: 2 });
  } catch {
    await setJson(key, value, { userId });
  }
}

export async function getJsonWithRecovery<T>(
  spindle: LoomSpindle,
  key: string,
  userId: string,
  fallback: T,
  onWarning?: StorageWarningSink,
): Promise<T> {
  const getJson = spindle.userStorage?.getJson;
  if (!getJson) return fallback;
  try {
    const value = await getJson(key, { userId, fallback });
    return value === undefined ? fallback : value as T;
  } catch (error) {
    const warning = `Recovered corrupt ${key}; reset it to a safe default.`;
    spindle.log?.warn?.(`State of the Loom storage recovery: ${warning} ${errorText(error)}`);
    onWarning?.(warning);
    try {
      await setJsonWithRecovery(spindle, key, userId, fallback);
    } catch (writeError) {
      const writeWarning = `Could not rewrite ${key} after recovery: ${errorText(writeError)}`;
      spindle.log?.warn?.(`State of the Loom storage recovery: ${writeWarning}`);
      onWarning?.(writeWarning);
    }
    return fallback;
  }
}
