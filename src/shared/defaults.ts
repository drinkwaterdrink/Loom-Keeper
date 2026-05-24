import type { LoomPreset, LoomSettings } from './types.js';

export const LOOM_VERSION = '1.0.3';
export const LOOM_SCHEMA_VERSION = '1';
export const SLIM_SCENE_PRESET_ID = 'slim_scene_loom';
export const STORAGE_KEYS = {
  settings: 'settings.json',
  presets: 'presets.json',
  trackerStates: 'tracker-states.json',
} as const;

const now = '2026-01-01T00:00:00.000Z';

export const defaultSettings: LoomSettings = {
  enabled: true,
  activePresetId: SLIM_SCENE_PRESET_ID,
  autoGenerate: false,
  useDefaultConnectionFallback: true,
  defaultPlacement: 'top',
  stripTrackerBlocksFromMessages: false,
  showFloatingButton: false,
  showMessageButtons: true,
  debugMode: false,
  promptInjectionEnabled: false,
  showChatLoomPanel: false,
  renderTrackersInMessages: true,
  trackerPlacement: 'both',
  cardDensity: 'compact',
};

export const slimSceneSampleData: Record<string, unknown> = {
  schemaVersion: LOOM_SCHEMA_VERSION,
  sceneTitle: 'A quiet turn in the old hall',
  location: 'Lantern Hall',
  time: 'Late evening',
  mood: 'watchful',
  delta: 'Mira noticed the sealed letter and did not comment on it.',
  showCast: true,
  cast: [
    {
      name: 'Mira',
      role: 'barkeep',
      position: 'behind the counter',
      outfit: 'rolled sleeves, dark apron',
      emotion: 'guarded',
      inventory: ['sealed letter'],
    },
  ],
  showInventory: true,
  inventory: ['sealed letter', 'brass key'],
  showThreads: true,
  activeThread: 'Find out who left the letter.',
  anchors: ['The cellar door is locked.', 'Rain is getting heavier outside.'],
  avoidNext: ['Do not reveal the letter contents yet.'],
};

export const slimScenePreset: LoomPreset = {
  id: SLIM_SCENE_PRESET_ID,
  name: 'Slim Scene Loom',
  version: '1.0.0',
  description: 'A low-token continuity tracker for location, cast, mood, inventory, deltas, and active story anchors.',
  mode: 'hybrid',
  schemaJson: {
    type: 'object',
    required: ['schemaVersion', 'sceneTitle', 'location', 'time', 'mood', 'delta'],
    properties: {
      schemaVersion: { type: 'string', default: LOOM_SCHEMA_VERSION },
      sceneTitle: { type: 'string', default: '' },
      location: { type: 'string', default: '' },
      time: { type: 'string', default: '' },
      mood: { type: 'string', default: '' },
      delta: { type: 'string', default: '' },
      showCast: { type: 'boolean', default: false },
      cast: {
        type: 'array',
        maxItems: 6,
        default: [],
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', default: '' },
            role: { type: 'string', default: '' },
            position: { type: 'string', default: '' },
            outfit: { type: 'string', default: '' },
            emotion: { type: 'string', default: '' },
            inventory: { type: 'array', maxItems: 6, default: [], items: { type: 'string' } },
          },
        },
      },
      showInventory: { type: 'boolean', default: false },
      inventory: { type: 'array', maxItems: 8, default: [], items: { type: 'string' } },
      showThreads: { type: 'boolean', default: false },
      activeThread: { type: 'string', default: '' },
      anchors: { type: 'array', maxItems: 6, default: [], items: { type: 'string' } },
      avoidNext: { type: 'array', maxItems: 5, default: [], items: { type: 'string' } },
    },
  },
  htmlTemplate: [
    '<section class="sotl-card sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
    '  <header class="sotl-card__head">',
    '    <div class="sotl-card__header-main">',
    '      <div class="sotl-card__eyebrow">State of the Loom</div>',
    '      <h3 class="sotl-card__title">{{sceneTitle}}</h3>',
    '    </div>',
    '    <span class="sotl-pill sotl-pill--mood">{{mood}}</span>',
    '  </header>',
    '  <dl class="sotl-grid">',
    '    <div class="sotl-grid-item"><dt>Location</dt><dd>{{location}}</dd></div>',
    '    <div class="sotl-grid-item"><dt>Time</dt><dd>{{time}}</dd></div>',
    '  </dl>',
    '  <p class="sotl-delta">{{delta}}</p>',
    '  {{#if showCast}}<div class="sotl-section sotl-cast-section"><h4>Cast Members</h4><div class="sotl-cast-grid">{{#each cast}}<article class="sotl-cast-chip"><strong>{{name}}</strong> <span class="sotl-cast-role">{{role}}</span> <span class="sotl-cast-pos">{{position}}</span> <em class="sotl-cast-emo">{{emotion}}</em></article>{{/each}}</div></div>{{/if}}',
    '  {{#if showInventory}}<details class="sotl-card-details" open><summary>Inventory Items</summary><ul class="sotl-inventory-list">{{#each inventory}}<li>{{.}}</li>{{/each}}</ul></details>{{/if}}',
    '  {{#if showThreads}}<details class="sotl-card-details" open><summary>Active Thread</summary><p class="sotl-thread-desc">{{activeThread}}</p></details>{{/if}}',
    '  <details class="sotl-card-details" open><summary>Scene Anchors</summary><ul class="sotl-anchors-list">{{#each anchors}}<li>{{.}}</li>{{/each}}</ul></details>',
    '  <details class="sotl-card-details"><summary>Avoid Next (Instructions)</summary><ul class="sotl-avoid-list">{{#each avoidNext}}<li>{{.}}</li>{{/each}}</ul></details>',
    '</section>',
  ].join(''),
  promptInstructions: [
    'You are State of the Loom, a continuity tracker for an AI roleplay chat.',
    'Return valid JSON only. Do not use markdown fences.',
    'Use the Slim Scene Loom schema exactly.',
    'Preserve stable facts from the previous tracker unless the latest assistant message clearly changes them.',
    'Only update what changed this turn. Do not invent missing details.',
    'Use empty strings, false, 0, and [] for unknowns.',
    'Keep arrays within their maxItems caps.',
  ].join('\n'),
  injectionTemplate: '[State of the Loom placeholder]\n{{compactSummary}}',
  maxInjectionTokens: 350,
  defaultPlacement: 'top',
  renderOptions: {
    density: 'compact',
    theme: 'system',
    showControls: true,
  },
  parserOptions: {
    fenceNames: ['tracker', 'loom'],
    strictJson: true,
    repairInvalidJson: false,
  },
  sampleData: slimSceneSampleData,
  createdAt: now,
  updatedAt: now,
};

export const builtInPresets: LoomPreset[] = [slimScenePreset];
