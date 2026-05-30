import type {
  LoomInjectionMode,
  LoomInjectionReport,
  LoomPermissionState,
  LoomSettings,
  LoomTrackerState,
} from '../shared/types.js';

type AnyRecord = Record<string, unknown>;

export interface LoomContinuityInjection {
  content: string;
  report: LoomInjectionReport;
}

function asRecord(value: unknown): AnyRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as AnyRecord : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function cleanText(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value.replace(/\s+/g, ' ').trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function clampText(value: unknown, max = 260): string {
  const text = cleanText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trim()}...`;
}

function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const text = cleanText(value);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function readPath(source: unknown, path: string[]): unknown {
  let current: unknown = source;
  for (const part of path) {
    const record = asRecord(current);
    if (!record || !(part in record)) return undefined;
    current = record[part];
  }
  return current;
}

function firstText(data: AnyRecord, paths: string[][], max = 260): string {
  for (const path of paths) {
    const value = clampText(readPath(data, path), max);
    if (value) return value;
  }
  return '';
}

function firstArray(data: AnyRecord, paths: string[][]): unknown[] {
  for (const path of paths) {
    const value = asArray(readPath(data, path));
    if (value.length > 0) return value;
  }
  return [];
}

function itemText(value: unknown, preferredKeys: string[] = ['text', 'fact', 'note', 'summary', 'title', 'name', 'goal', 'label']): string {
  const direct = cleanText(value);
  if (direct) return direct;
  const record = asRecord(value);
  if (!record) return '';
  for (const key of preferredKeys) {
    const text = clampText(record[key], 220);
    if (text) return text;
  }
  const parts = Object.entries(record)
    .filter(([, entry]) => typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean')
    .slice(0, 3)
    .map(([key, entry]) => `${key}: ${cleanText(entry)}`)
    .filter(Boolean);
  return clampText(parts.join('; '), 220);
}

function listItems(data: AnyRecord, paths: string[][], limit: number, preferredKeys?: string[]): string[] {
  return firstArray(data, paths)
    .map((item) => itemText(item, preferredKeys))
    .filter(Boolean)
    .slice(0, limit);
}

function fieldList(data: AnyRecord, paths: Array<[string, string[][]]>, max = 220): string[] {
  return paths
    .map(([label, candidates]) => {
      const value = firstText(data, candidates, max);
      return value ? `${label}: ${value}` : '';
    })
    .filter(Boolean);
}

function summarizeCharacter(value: unknown, includeAppearance = true): string {
  const record = asRecord(value);
  if (!record) return clampText(value, 240);
  const identity = asRecord(record.identity) ?? {};
  const appearance = asRecord(record.appearance) ?? {};
  const clothing = asRecord(record.clothing) ?? {};
  const state = asRecord(record.state) ?? {};
  const name = cleanText(record.name ?? record.characterName ?? record.id) || 'Unnamed';
  const role = cleanText(record.role ?? record.kind ?? record.relationshipToUser);
  const location = cleanText(record.location ?? state.location ?? record.presence);
  const visual = includeAppearance ? clampText(
    identity.fullDesc
    ?? appearance.fullDesc
    ?? appearance.summary
    ?? record.fullDesc
    ?? record.description
    ?? identity.anchor,
    260,
  ) : '';
  const clothingSummary = includeAppearance ? clampText(clothing.summary ?? record.clothingSummary, 180) : '';
  const condition = uniq([
    cleanText(state.injury ?? record.injury ?? record.visibleCondition),
    cleanText(state.emotion ?? record.emotionalState ?? record.mood),
    cleanText(state.intent ?? record.intent ?? record.currentAction),
  ]).join('; ');
  const relations = clampText(record.relSummary ?? record.relationshipSummary ?? record.relationshipToUser, 180);
  const parts = [
    role ? `role ${role}` : '',
    location ? `at ${location}` : '',
  ].filter(Boolean).join(', ');
  return [
    `${name}${parts ? ` (${parts})` : ''}:`,
    visual,
    clothingSummary ? `Clothing: ${clothingSummary}.` : '',
    condition ? `State: ${condition}.` : '',
    relations ? `Relations: ${relations}.` : '',
  ].filter(Boolean).join(' ');
}

function summarizeRelationships(data: AnyRecord): string[] {
  const direct = listItems(data, [['relationships']], 5, ['summary', 'label', 'status', 'target']);
  if (direct.length > 0) return direct;
  return firstArray(data, [['characters'], ['cast']])
    .map((item) => {
      const record = asRecord(item);
      if (!record) return '';
      const name = cleanText(record.name ?? record.characterName ?? record.id);
      const rel = cleanText(record.relSummary ?? record.relationshipSummary ?? record.relationshipToUser);
      return name && rel ? `${name}: ${rel}` : '';
    })
    .filter(Boolean)
    .slice(0, 5);
}

function addSection(
  output: string[],
  title: string,
  lines: string[],
  tokenBudget: number,
  truncated: { value: boolean },
): void {
  const cleanLines = uniq(lines).map((line) => clampText(line, 300)).filter(Boolean);
  if (cleanLines.length === 0) return;
  const header = output.length === 0 ? `## ${title}` : `\n## ${title}`;
  const before = output.join('\n');
  const withHeader = `${before}${before ? '\n' : ''}${header}`;
  if (estimateTokens(withHeader) > tokenBudget) {
    truncated.value = true;
    return;
  }
  output.push(header);
  for (const line of cleanLines) {
    const candidate = [...output, `- ${line}`].join('\n');
    if (estimateTokens(candidate) > tokenBudget) {
      truncated.value = true;
      break;
    }
    output.push(`- ${line}`);
  }
}

function normalizeMode(value: unknown): LoomInjectionMode {
  return value === 'latest_brief' ? 'latest_brief' : 'latest_plus_history';
}

function numberSetting(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function estimateTokens(text: string): number {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) return 0;
  return Math.max(1, Math.ceil(compact.length / 4));
}

export function buildContinuityInjection(input: {
  settings: LoomSettings;
  latestTracker: LoomTrackerState | null;
  trackers?: LoomTrackerState[] | undefined;
  registered?: boolean | undefined;
  skippedReason?: string | undefined;
  injectedAt?: string | undefined;
}): LoomContinuityInjection {
  const mode = normalizeMode(input.settings.promptInjectionMode);
  const tokenBudget = numberSetting(input.settings.promptInjectionTokenBudget, 700, 200, 2000);
  const trackerLimit = numberSetting(input.settings.promptInjectionTrackerLimit, 5, 1, 10);
  const baseReport: LoomInjectionReport = {
    enabled: Boolean(input.settings.promptInjectionEnabled),
    registered: Boolean(input.registered),
    available: Boolean(input.latestTracker),
    latestTrackerAvailable: Boolean(input.latestTracker),
    mode,
    contextDepthSetting: trackerLimit,
    storageRetentionSetting: input.settings.trackerHistoryLimit,
    historyCompactOnly: true,
    trackerCount: input.trackers?.length ?? (input.latestTracker ? 1 : 0),
    historyCount: 0,
    estimatedTokens: 0,
    tokenBudget,
    truncated: false,
    lastSkippedReason: input.skippedReason,
  };

  if (!input.settings.promptInjectionEnabled) {
    return { content: '', report: { ...baseReport, lastSkippedReason: 'Prompt injection is disabled.' } };
  }
  const latest = input.latestTracker;
  if (!latest) {
    return { content: '', report: { ...baseReport, available: false, lastSkippedReason: 'No tracker is available for this chat.' } };
  }

  const data = latest.data || {};
  const output: string[] = [
    'STATE OF THE LOOM CONTINUITY BRIEF',
    'Use this as compact continuity reference for the next roleplay response. Do not mention the tracker. Do not reveal hidden facts or secrets unless the scene makes them discoverable.',
  ];
  const truncated = { value: false };

  addSection(output, 'Scene', fieldList(data, [
    ['Title', [['sceneIdentity', 'title'], ['sceneTitle'], ['title'], ['topic']]],
    ['Location', [['sceneIdentity', 'location'], ['location']]],
    ['Time', [['sceneIdentity', 'time'], ['time']]],
    ['Weather', [['sceneIdentity', 'weather'], ['weather']]],
    ['Mood', [['sceneIdentity', 'mood'], ['mood'], ['tone']]],
    ['Privacy', [['sceneIdentity', 'privacy'], ['privacy']]],
    ['Tension', [['sceneIdentity', 'tension'], ['tension']]],
  ], 180), tokenBudget, truncated);

  addSection(output, 'What Changed', uniq([
    latest.compactSummary,
    firstText(data, [['narrativeDelta', 'summary'], ['delta'], ['summary']], 260),
    ...listItems(data, [['narrativeDelta', 'whatChanged'], ['changes']], 5, ['text', 'summary', 'age']),
    ...listItems(data, [['narrativeDelta', 'immediateConsequences']], 4),
    ...listItems(data, [['narrativeDelta', 'unresolvedBeats'], ['beats']], 4),
  ]), tokenBudget, truncated);

  const characterSource = firstArray(data, [['characters'], ['cast']]);
  addSection(
    output,
    'Characters',
    characterSource.slice(0, 6).map((item) => summarizeCharacter(item, input.settings.promptInjectionIncludeAppearance !== false)).filter(Boolean),
    tokenBudget,
    truncated,
  );

  addSection(output, 'Relationships', summarizeRelationships(data), tokenBudget, truncated);

  addSection(output, 'World And Objects', uniq([
    ...listItems(data, [['worldState', 'importantObjects'], ['items']], 6, ['name', 'summary', 'condition', 'location']),
    ...listItems(data, [['worldState', 'hazards'], ['hazards'], ['loaded']], 5, ['thing', 'hazard', 'summary', 'state']),
    ...listItems(data, [['worldState', 'activeThreads'], ['threads']], 5, ['title', 'summary', 'label']),
    ...listItems(data, [['space']], 5),
  ]), tokenBudget, truncated);

  if (input.settings.promptInjectionIncludeRules !== false) {
    const rules = asRecord(readPath(data, ['rules'])) ?? {};
    addSection(output, 'Continuity Rules', uniq([
      ...listItems(data, [['worldState', 'loreFacts'], ['facts']], 5, ['fact', 'summary']),
      ...asArray(rules.cant).map((item) => `Cannot: ${itemText(item)}`).filter(Boolean),
      ...asArray(rules.offscreen).map((item) => `Offscreen: ${itemText(item)}`).filter(Boolean),
      ...listItems(data, [['bans']], 4).map((item) => `Avoid next: ${item}`),
      ...listItems(data, [['narrativeDelta', 'continuityWarnings'], ['worldState', 'continuityWarnings'], ['continuityWarnings']], 5),
    ]), tokenBudget, truncated);
  }

  if (input.settings.promptInjectionIncludeNextTurn !== false) {
    addSection(output, 'Next Turn Guidance', uniq([
      ...fieldList(data, [
        ['Likely focus', [['nextTurnGuidance', 'likelyFocus'], ['focus', 'next']]],
        ['Fragile detail', [['nextTurnGuidance', 'fragileDetails']]],
        ['Risk', [['focus', 'risk']]],
      ], 220),
      ...listItems(data, [['nextTurnGuidance', 'thingsNotToForget']], 5),
      ...listItems(data, [['goals']], 5, ['goal', 'status', 'note']),
      ...listItems(data, [['countdowns']], 4, ['title', 'left']),
      ...listItems(data, [['autonomy']], 3, ['who', 'action']),
    ]), tokenBudget, truncated);
  }

  const history = mode === 'latest_plus_history'
    ? (input.trackers || [])
      .filter((tracker) => tracker.generatedAt !== latest.generatedAt || tracker.messageId !== latest.messageId)
      .slice(0, Math.max(0, trackerLimit))
      .map((tracker) => `${tracker.generatedAt}: ${tracker.compactSummary}`)
      .filter(Boolean)
    : [];
  addSection(output, 'Recent Tracker History', history, tokenBudget, truncated);

  if (truncated.value) {
    const candidate = [...output, '\nNote: Lower-priority tracker details were omitted to fit the injection token budget.'].join('\n');
    if (estimateTokens(candidate) <= tokenBudget) output.push('\nNote: Lower-priority tracker details were omitted to fit the injection token budget.');
  }

  const content = output.join('\n').trim();
  const estimatedTokens = estimateTokens(content);
  const report: LoomInjectionReport = {
    ...baseReport,
    available: true,
    chatId: latest.chatId,
    trackerPresetId: latest.presetId,
    trackerGeneratedAt: latest.generatedAt,
    trackerCount: input.trackers?.length ?? 1,
    historyCount: history.length,
    estimatedTokens,
    truncated: truncated.value,
    injectedAt: input.injectedAt,
    lastSkippedReason: input.skippedReason,
    preview: content.length > 900 ? `${content.slice(0, 900).trim()}...` : content,
  };
  return { content, report };
}

export function describeInjectionStatus(settings: LoomSettings, permissions: LoomPermissionState, registered = false): string {
  if (!settings.promptInjectionEnabled) return 'Prompt injection is off.';
  if (!permissions.generation) return 'Prompt injection can run when generation support is available.';
  if (!permissions.interceptor && !registered) return 'Prompt injection is enabled, but Lumiverse interceptor permission/support was not detected.';
  return registered
    ? 'Prompt injection is active: the latest Loom is compressed into the live roleplay prompt.'
    : 'Prompt injection is configured and will activate when Lumiverse exposes interceptor support.';
}
