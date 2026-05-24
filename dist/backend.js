// src/backend/injectionService.ts
function describeInjectionStatus(settings, permissions) {
  if (!settings.promptInjectionEnabled) return "Prompt injection is off for Milestone 1.";
  if (!permissions.generation) return "Prompt injection needs interceptor support in the next milestone.";
  return "Prompt injection foundation is ready; interceptor registration is planned for Milestone 2.";
}

// src/backend/companionService.ts
function getCompanionMilestoneStatus() {
  return "Companion sovereignty tools are not registered in Milestone 1.";
}

// src/backend/entityCaptureService.ts
function getEntityCaptureMilestoneStatus() {
  return "Entity capture inbox is not enabled in Milestone 1.";
}

// src/shared/defaults.ts
var LOOM_VERSION = "1.0.8";
var LOOM_SCHEMA_VERSION = "1";
var SLIM_SCENE_PRESET_ID = "slim_scene_loom";
var STORAGE_KEYS = {
  settings: "settings.json",
  presets: "presets.json",
  trackerStates: "tracker-states.json"
};
var now = "2026-01-01T00:00:00.000Z";
var defaultSettings = {
  enabled: true,
  activePresetId: SLIM_SCENE_PRESET_ID,
  autoGenerate: false,
  useDefaultConnectionFallback: true,
  stripTrackerBlocksFromMessages: false,
  showFloatingButton: false,
  showMessageButtons: true,
  debugMode: false,
  promptInjectionEnabled: false,
  showChatHudLauncher: true,
  hudDefaultView: "full",
  renderInMessages: false,
  messageCardPlacement: "top",
  cardDensity: "compact",
  trackerHistoryLimit: 5,
  sidecarGenerationTimeoutMs: 18e4
};
var microLoomPreset = {
  id: "micro_loom",
  name: "Micro Loom",
  version: "1.0.0",
  description: "Smallest, fastest tracker. Best for low token usage and fast models.",
  mode: "hybrid",
  schemaJson: {
    type: "object",
    required: ["schemaVersion", "sceneTitle", "location", "time", "mood", "delta"],
    properties: {
      schemaVersion: { type: "string", default: LOOM_SCHEMA_VERSION },
      sceneTitle: { type: "string", default: "" },
      location: { type: "string", default: "" },
      time: { type: "string", default: "" },
      mood: { type: "string", default: "" },
      delta: { type: "string", default: "" },
      cast: { type: "array", maxItems: 4, default: [], items: { type: "string" } },
      activeThread: { type: "string", default: "" }
    }
  },
  htmlTemplate: [
    '<section class="sotl-card sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
    '  <header class="sotl-card__head">',
    '    <div class="sotl-card__header-main">',
    '      <div class="sotl-card__eyebrow">Micro Loom</div>',
    '      <h3 class="sotl-card__title">{{sceneTitle}}</h3>',
    "    </div>",
    '    <span class="sotl-pill sotl-pill--mood">{{mood}}</span>',
    "  </header>",
    '  <dl class="sotl-grid">',
    '    <div class="sotl-grid-item"><dt>Location</dt><dd>{{location}}</dd></div>',
    '    <div class="sotl-grid-item"><dt>Time</dt><dd>{{time}}</dd></div>',
    "  </dl>",
    '  <p class="sotl-delta">{{delta}}</p>',
    '  <details class="sotl-card-details" open><summary>Cast Present</summary><ul class="sotl-anchors-list">{{#each cast}}<li>{{.}}</li>{{/each}}</ul></details>',
    '  {{#if activeThread}}<details class="sotl-card-details" open><summary>Active Thread</summary><p class="sotl-thread-desc">{{activeThread}}</p></details>{{/if}}',
    "</section>"
  ].join(""),
  promptInstructions: [
    "You are State of the Loom, a micro-sized continuity tracker for an AI roleplay chat.",
    "Return valid JSON only. Do not use markdown fences.",
    "Use the Micro Loom schema exactly.",
    "Preserve stable facts from the previous tracker unless the latest assistant message clearly changes them.",
    "Only update what changed this turn. Do not invent missing details.",
    "Use empty strings and [] for unknowns.",
    "Keep cast array under 4 items."
  ].join("\n"),
  injectionTemplate: "[Micro Loom]\n{{compactSummary}}",
  maxInjectionTokens: 150,
  defaultPlacement: "top",
  renderOptions: {
    density: "compact",
    theme: "system",
    showControls: true
  },
  parserOptions: {
    fenceNames: ["tracker", "loom"],
    strictJson: true,
    repairInvalidJson: false
  },
  sampleData: {
    schemaVersion: LOOM_SCHEMA_VERSION,
    sceneTitle: "Quick word in the foyer",
    location: "Foyer",
    time: "Late evening",
    mood: "tense",
    delta: "Mira entered quietly without shaking off her wet coat.",
    cast: ["Mira", "Josh"],
    activeThread: "Learn what Mira is hiding."
  },
  createdAt: now,
  updatedAt: now
};
var slimSceneSampleData = {
  schemaVersion: LOOM_SCHEMA_VERSION,
  sceneTitle: "A quiet turn in the old hall",
  location: "Lantern Hall",
  time: "Late evening",
  mood: "watchful",
  delta: "Mira noticed the sealed letter and did not comment on it.",
  showCast: true,
  cast: [
    {
      name: "Mira",
      role: "barkeep",
      position: "behind the counter",
      outfit: "rolled sleeves, dark apron",
      emotion: "guarded",
      inventory: ["sealed letter"]
    }
  ],
  showInventory: true,
  inventory: ["sealed letter", "brass key"],
  showThreads: true,
  activeThread: "Find out who left the letter.",
  anchors: ["The cellar door is locked.", "Rain is getting heavier outside."],
  avoidNext: ["Do not reveal the letter contents yet."]
};
var slimScenePreset = {
  id: SLIM_SCENE_PRESET_ID,
  name: "Slim Scene Loom",
  version: "1.0.0",
  description: "A low-token continuity tracker for location, cast, mood, inventory, deltas, and active story anchors.",
  mode: "hybrid",
  schemaJson: {
    type: "object",
    required: ["schemaVersion", "sceneTitle", "location", "time", "mood", "delta"],
    properties: {
      schemaVersion: { type: "string", default: LOOM_SCHEMA_VERSION },
      sceneTitle: { type: "string", default: "" },
      location: { type: "string", default: "" },
      time: { type: "string", default: "" },
      mood: { type: "string", default: "" },
      delta: { type: "string", default: "" },
      showCast: { type: "boolean", default: false },
      cast: {
        type: "array",
        maxItems: 6,
        default: [],
        items: {
          type: "object",
          properties: {
            name: { type: "string", default: "" },
            role: { type: "string", default: "" },
            position: { type: "string", default: "" },
            outfit: { type: "string", default: "" },
            emotion: { type: "string", default: "" },
            inventory: { type: "array", maxItems: 6, default: [], items: { type: "string" } }
          }
        }
      },
      showInventory: { type: "boolean", default: false },
      inventory: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
      showThreads: { type: "boolean", default: false },
      activeThread: { type: "string", default: "" },
      anchors: { type: "array", maxItems: 6, default: [], items: { type: "string" } },
      avoidNext: { type: "array", maxItems: 5, default: [], items: { type: "string" } }
    }
  },
  htmlTemplate: [
    '<section class="sotl-card sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
    '  <header class="sotl-card__head">',
    '    <div class="sotl-card__header-main">',
    '      <div class="sotl-card__eyebrow">State of the Loom</div>',
    '      <h3 class="sotl-card__title">{{sceneTitle}}</h3>',
    "    </div>",
    '    <span class="sotl-pill sotl-pill--mood">{{mood}}</span>',
    "  </header>",
    '  <dl class="sotl-grid">',
    '    <div class="sotl-grid-item"><dt>Location</dt><dd>{{location}}</dd></div>',
    '    <div class="sotl-grid-item"><dt>Time</dt><dd>{{time}}</dd></div>',
    "  </dl>",
    '  <p class="sotl-delta">{{delta}}</p>',
    '  {{#if showCast}}<div class="sotl-section sotl-cast-section"><h4>Cast Members</h4><div class="sotl-cast-grid">{{#each cast}}<article class="sotl-cast-chip"><strong>{{name}}</strong> <span class="sotl-cast-role">{{role}}</span> <span class="sotl-cast-pos">{{position}}</span> <em class="sotl-cast-emo">{{emotion}}</em></article>{{/each}}</div></div>{{/if}}',
    '  {{#if showInventory}}<details class="sotl-card-details" open><summary>Inventory Items</summary><ul class="sotl-inventory-list">{{#each inventory}}<li>{{.}}</li>{{/each}}</ul></details>{{/if}}',
    '  {{#if showThreads}}<details class="sotl-card-details" open><summary>Active Thread</summary><p class="sotl-thread-desc">{{activeThread}}</p></details>{{/if}}',
    '  <details class="sotl-card-details" open><summary>Scene Anchors</summary><ul class="sotl-anchors-list">{{#each anchors}}<li>{{.}}</li>{{/each}}</ul></details>',
    '  <details class="sotl-card-details"><summary>Avoid Next (Instructions)</summary><ul class="sotl-avoid-list">{{#each avoidNext}}<li>{{.}}</li>{{/each}}</ul></details>',
    "</section>"
  ].join(""),
  promptInstructions: [
    "You are State of the Loom, a continuity tracker for an AI roleplay chat.",
    "Return valid JSON only. Do not use markdown fences.",
    "Use the Slim Scene Loom schema exactly.",
    "Preserve stable facts from the previous tracker unless the latest assistant message clearly changes them.",
    "Only update what changed this turn. Do not invent missing details.",
    "Use empty strings, false, 0, and [] for unknowns.",
    "Keep arrays within their maxItems caps."
  ].join("\n"),
  injectionTemplate: "[State of the Loom placeholder]\n{{compactSummary}}",
  maxInjectionTokens: 350,
  defaultPlacement: "top",
  renderOptions: {
    density: "compact",
    theme: "system",
    showControls: true
  },
  parserOptions: {
    fenceNames: ["tracker", "loom"],
    strictJson: true,
    repairInvalidJson: false
  },
  sampleData: slimSceneSampleData,
  createdAt: now,
  updatedAt: now
};
var balancedStoryPreset = {
  id: "balanced_story_loom",
  name: "Balanced Story Loom",
  version: "1.0.0",
  description: "Medium-detail continuity tracker. Monitors environment, relationships, and cast pockets.",
  mode: "hybrid",
  schemaJson: {
    type: "object",
    required: ["schemaVersion", "sceneTitle", "location", "environment", "time", "mood", "delta"],
    properties: {
      schemaVersion: { type: "string", default: LOOM_SCHEMA_VERSION },
      sceneTitle: { type: "string", default: "" },
      location: { type: "string", default: "" },
      environment: { type: "string", default: "" },
      time: { type: "string", default: "" },
      mood: { type: "string", default: "" },
      delta: { type: "string", default: "" },
      cast: {
        type: "array",
        maxItems: 5,
        default: [],
        items: {
          type: "object",
          properties: {
            name: { type: "string", default: "" },
            role: { type: "string", default: "" },
            position: { type: "string", default: "" },
            outfit: { type: "string", default: "" },
            emotion: { type: "string", default: "" },
            pockets: { type: "array", maxItems: 4, default: [], items: { type: "string" } }
          }
        }
      },
      relationships: {
        type: "array",
        maxItems: 4,
        default: [],
        items: {
          type: "object",
          properties: {
            parties: { type: "string", default: "" },
            tone: { type: "string", default: "" },
            details: { type: "string", default: "" }
          }
        }
      },
      inventory: { type: "array", maxItems: 6, default: [], items: { type: "string" } },
      activeThread: { type: "string", default: "" },
      anchors: { type: "array", maxItems: 6, default: [], items: { type: "string" } },
      contradictions: { type: "array", maxItems: 4, default: [], items: { type: "string" } }
    }
  },
  htmlTemplate: [
    '<section class="sotl-card sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
    '  <header class="sotl-card__head">',
    '    <div class="sotl-card__header-main">',
    '      <div class="sotl-card__eyebrow">Balanced Story Loom</div>',
    '      <h3 class="sotl-card__title">{{sceneTitle}}</h3>',
    "    </div>",
    '    <span class="sotl-pill sotl-pill--mood">{{mood}}</span>',
    "  </header>",
    '  <p class="sotl-delta" style="font-size: 11px; color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d)); margin-bottom: 8px;"><strong>Environment:</strong> {{environment}}</p>',
    '  <dl class="sotl-grid">',
    '    <div class="sotl-grid-item"><dt>Location</dt><dd>{{location}}</dd></div>',
    '    <div class="sotl-grid-item"><dt>Time</dt><dd>{{time}}</dd></div>',
    "  </dl>",
    '  <p class="sotl-delta">{{delta}}</p>',
    '  <div class="sotl-section sotl-cast-section">',
    "    <h4>Cast Details</h4>",
    '    <div class="sotl-cast-grid">',
    "      {{#each cast}}",
    '      <article class="sotl-cast-chip" style="flex-direction: column; align-items: flex-start; gap: 2px;">',
    '        <div><strong>{{name}}</strong> <span class="sotl-cast-role">({{role}})</span></div>',
    '        <div style="font-size: 11px;">\u{1F4CD} {{position}} \u2022 \u{1F455} {{outfit}}</div>',
    '        <div style="font-size: 11px;">\u{1F3AD} <em class="sotl-cast-emo">{{emotion}}</em></div>',
    '        {{#if pockets}}<div style="font-size: 10px; color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));">\u{1F392} Pockets: {{pockets}}</div>{{/if}}',
    "      </article>",
    "      {{/each}}",
    "    </div>",
    "  </div>",
    "  {{#if relationships}}",
    '  <details class="sotl-card-details" open><summary>Relationships</summary>',
    '    <ul class="sotl-anchors-list">',
    "      {{#each relationships}}",
    "      <li><strong>{{parties}}</strong>: <em>{{tone}}</em> \u2014 {{details}}</li>",
    "      {{/each}}",
    "    </ul>",
    "  </details>",
    "  {{/if}}",
    '  <details class="sotl-card-details"><summary>Inventory Items</summary><ul class="sotl-inventory-list">{{#each inventory}}<li>{{.}}</li>{{/each}}</ul></details>',
    '  {{#if activeThread}}<details class="sotl-card-details" open><summary>Active Thread</summary><p class="sotl-thread-desc">{{activeThread}}</p></details>{{/if}}',
    '  <details class="sotl-card-details" open><summary>Scene Anchors</summary><ul class="sotl-anchors-list">{{#each anchors}}<li>{{.}}</li>{{/each}}</ul></details>',
    '  {{#if contradictions}}<details class="sotl-card-details"><summary>Contradictions</summary><ul class="sotl-anchors-list">{{#each contradictions}}<li>{{.}}</li>{{/each}}</ul></details>{{/if}}',
    "</section>"
  ].join(""),
  promptInstructions: [
    "You are State of the Loom, a medium-detail story tracking system.",
    "Return valid JSON only. Do not use markdown fences.",
    "Use the Balanced Story Loom schema exactly.",
    "Provide stable facts, tracking details, and active threads.",
    "Keep arrays capped. Empty strings and [] are used for unknown or empty blocks."
  ].join("\n"),
  injectionTemplate: "[Balanced Story Loom]\n{{compactSummary}}",
  maxInjectionTokens: 400,
  defaultPlacement: "top",
  renderOptions: {
    density: "normal",
    theme: "system",
    showControls: true
  },
  parserOptions: {
    fenceNames: ["tracker", "loom"],
    strictJson: true,
    repairInvalidJson: false
  },
  sampleData: {
    schemaVersion: LOOM_SCHEMA_VERSION,
    sceneTitle: "A shared secret in Lantern Hall",
    location: "Lantern Hall",
    environment: "Dimly lit, warm hearth, rain drumming on high windows",
    time: "Late evening",
    mood: "intimate but guarded",
    delta: "Mira showed Josh the letter but refused to let him hold it.",
    cast: [
      {
        name: "Mira",
        role: "barkeep",
        position: "by the fireplace",
        outfit: "dark woolen coat, damp leather boots",
        emotion: "hesitant",
        pockets: ["sealed letter"]
      },
      {
        name: "Josh",
        role: "guest",
        position: "sitting on the rug",
        outfit: "casual knits",
        emotion: "curious",
        pockets: ["pocket knife"]
      }
    ],
    relationships: [
      { parties: "Mira & Josh", tone: "cautious trust", details: "Mira shared the letter but is holding back its full history." }
    ],
    inventory: ["sealed letter", "brass key", "pocket knife"],
    activeThread: "Find out who wrote the letter.",
    anchors: ["The cellar door remains locked.", "The storm outside is intensifying."],
    contradictions: ["None."]
  },
  createdAt: now,
  updatedAt: now
};
var castContinuityPreset = {
  id: "cast_continuity_loom",
  name: "Cast Continuity Loom",
  version: "1.0.0",
  description: "Focuses entirely on character consistency: posture, proximity, intent, and speech traits.",
  mode: "hybrid",
  schemaJson: {
    type: "object",
    required: ["schemaVersion", "sceneTitle", "location", "time", "delta"],
    properties: {
      schemaVersion: { type: "string", default: LOOM_SCHEMA_VERSION },
      sceneTitle: { type: "string", default: "" },
      location: { type: "string", default: "" },
      time: { type: "string", default: "" },
      delta: { type: "string", default: "" },
      cast: {
        type: "array",
        maxItems: 4,
        default: [],
        items: {
          type: "object",
          properties: {
            name: { type: "string", default: "" },
            appearance: { type: "string", default: "" },
            outfit: { type: "string", default: "" },
            posture: { type: "string", default: "" },
            proximity: { type: "string", default: "" },
            hands: { type: "string", default: "" },
            emotion: { type: "string", default: "" },
            intent: { type: "string", default: "" },
            dialogueColor: { type: "string", default: "" },
            pockets: { type: "array", maxItems: 4, default: [], items: { type: "string" } }
          }
        }
      }
    }
  },
  htmlTemplate: [
    '<section class="sotl-card sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
    '  <header class="sotl-card__head">',
    '    <div class="sotl-card__header-main">',
    '      <div class="sotl-card__eyebrow">Cast Continuity Loom</div>',
    '      <h3 class="sotl-card__title">{{sceneTitle}}</h3>',
    "    </div>",
    '    <span class="sotl-pill sotl-pill--mood">{{time}}</span>',
    "  </header>",
    '  <p class="sotl-delta" style="margin-top: 6px;">\u{1F4CD} <strong>Location:</strong> {{location}}</p>',
    '  <p class="sotl-delta">{{delta}}</p>',
    '  <div class="sotl-section sotl-cast-section">',
    "    <h4>Character Continuities</h4>",
    '    <div style="display: grid; gap: 10px; margin-top: 6px;">',
    "      {{#each cast}}",
    '      <article class="sotl-panel" style="background: var(--lumiverse-fill-subtle, rgba(255,255,255,0.3)); padding: 10px; display: grid; gap: 4px;">',
    '        <h4 style="font-size: 13px; color: var(--lv-accent, #3864d9);">{{name}}</h4>',
    '        <div style="font-size: 12px; line-height: 1.4;">',
    "          <strong>Look:</strong> {{appearance}}<br>",
    "          <strong>Outfit:</strong> {{outfit}}<br>",
    "          <strong>Posture:</strong> {{posture}}<br>",
    "          <strong>Proximity:</strong> {{proximity}}<br>",
    "          <strong>Hands:</strong> {{hands}}<br>",
    '          <strong>Emotion:</strong> <em class="sotl-cast-emo">{{emotion}}</em><br>',
    "          <strong>Intent:</strong> {{intent}}<br>",
    '          <strong>Dialogue:</strong> <span style="font-style: italic;">{{dialogueColor}}</span>',
    "        </div>",
    '        {{#if pockets}}<div style="font-size: 11px; margin-top: 4px; color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));">\u{1F392} Pockets: {{pockets}}</div>{{/if}}',
    "      </article>",
    "      {{/each}}",
    "    </div>",
    "  </div>",
    "</section>"
  ].join(""),
  promptInstructions: [
    "You are State of the Loom, focusing entirely on roleplay character continuity details.",
    "Return valid JSON only. Do not use markdown fences.",
    "Use the Cast Continuity Loom schema exactly.",
    "Document precise character appearances, outfits, gestures, distance, emotional states, goals, and dialogue details.",
    "Only record facts grounded in active dialogue and physical actions."
  ].join("\n"),
  injectionTemplate: "[Cast Continuity Loom]\n{{compactSummary}}",
  maxInjectionTokens: 400,
  defaultPlacement: "top",
  renderOptions: {
    density: "normal",
    theme: "system",
    showControls: true
  },
  parserOptions: {
    fenceNames: ["tracker", "loom"],
    strictJson: true,
    repairInvalidJson: false
  },
  sampleData: {
    schemaVersion: LOOM_SCHEMA_VERSION,
    sceneTitle: "Anxious alignment",
    location: "Hallway entry",
    time: "Sunset",
    delta: "Mira crossed her arms tightly, avoiding Josh\u2019s direct gaze.",
    cast: [
      {
        name: "Mira",
        appearance: "pale, brown hair tied back messily",
        outfit: "damp green sweater",
        posture: "arms crossed, shoulders hunched",
        proximity: "two feet from door frame",
        hands: "clutching her elbows",
        emotion: "apprehensive",
        intent: "deflect questions about the key",
        dialogueColor: "hushed, clipped tone",
        pockets: ["brass key"]
      }
    ]
  },
  createdAt: now,
  updatedAt: now
};
var fullContinuityLedgerPreset = {
  id: "full_continuity_ledger",
  name: "Full Continuity Ledger",
  version: "1.0.0",
  description: "Largest preset tracking weather, lighting, secrets, relationships, meters, and anchors.",
  mode: "hybrid",
  schemaJson: {
    type: "object",
    required: ["schemaVersion", "sceneTitle", "location", "time", "weather", "lighting", "mood", "delta"],
    properties: {
      schemaVersion: { type: "string", default: LOOM_SCHEMA_VERSION },
      sceneTitle: { type: "string", default: "" },
      location: { type: "string", default: "" },
      time: { type: "string", default: "" },
      weather: { type: "string", default: "" },
      lighting: { type: "string", default: "" },
      mood: { type: "string", default: "" },
      delta: { type: "string", default: "" },
      cast: {
        type: "array",
        maxItems: 4,
        default: [],
        items: {
          type: "object",
          properties: {
            name: { type: "string", default: "" },
            outfit: { type: "string", default: "" },
            emotion: { type: "string", default: "" },
            pockets: { type: "array", maxItems: 4, default: [], items: { type: "string" } }
          }
        }
      },
      inventory: { type: "array", maxItems: 6, default: [], items: { type: "string" } },
      relationships: {
        type: "array",
        maxItems: 4,
        default: [],
        items: {
          type: "object",
          properties: {
            parties: { type: "string", default: "" },
            status: { type: "string", default: "" }
          }
        }
      },
      activeThread: { type: "string", default: "" },
      secrets: { type: "array", maxItems: 4, default: [], items: { type: "string" } },
      rumors: { type: "array", maxItems: 4, default: [], items: { type: "string" } },
      anchors: { type: "array", maxItems: 6, default: [], items: { type: "string" } },
      contradictions: { type: "array", maxItems: 4, default: [], items: { type: "string" } },
      avoidNext: { type: "array", maxItems: 4, default: [], items: { type: "string" } },
      meters: {
        type: "array",
        maxItems: 4,
        default: [],
        items: {
          type: "object",
          properties: {
            name: { type: "string", default: "" },
            value: { type: "string", default: "" }
          }
        }
      }
    }
  },
  htmlTemplate: [
    '<section class="sotl-card sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
    '  <header class="sotl-card__head">',
    '    <div class="sotl-card__header-main">',
    '      <div class="sotl-card__eyebrow">Full Continuity Ledger</div>',
    '      <h3 class="sotl-card__title">{{sceneTitle}}</h3>',
    "    </div>",
    '    <span class="sotl-pill sotl-pill--mood">{{mood}}</span>',
    "  </header>",
    '  <dl class="sotl-grid" style="grid-template-columns: repeat(3, 1fr); gap: 4px;">',
    '    <div class="sotl-grid-item"><dt>Location</dt><dd style="font-size: 11px;">{{location}}</dd></div>',
    '    <div class="sotl-grid-item"><dt>Time/Weather</dt><dd style="font-size: 11px;">{{time}} \u2022 {{weather}}</dd></div>',
    '    <div class="sotl-grid-item"><dt>Lighting</dt><dd style="font-size: 11px;">{{lighting}}</dd></div>',
    "  </dl>",
    '  <p class="sotl-delta">{{delta}}</p>',
    '  <div class="sotl-section sotl-cast-section">',
    "    <h4>Cast Continuity</h4>",
    '    <div class="sotl-cast-grid">',
    "      {{#each cast}}",
    '      <article class="sotl-cast-chip">',
    '        <strong>{{name}}</strong> <em class="sotl-cast-emo">({{emotion}})</em> <span style="font-size: 11px; margin-left: 4px;">\u{1F455} {{outfit}}</span>',
    '        {{#if pockets}}<span style="font-size: 10px; color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d)); margin-left: 6px;">\u{1F392} {{pockets}}</span>{{/if}}',
    "      </article>",
    "      {{/each}}",
    "    </div>",
    "  </div>",
    "  {{#if meters}}",
    '  <div style="margin-top: 8px;">',
    '    <h4 style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));">Meters</h4>',
    '    <div style="display: flex; flex-wrap: wrap; gap: 6px;">',
    '      {{#each meters}}<span class="sotl-chip" style="background: rgba(220,10,10,0.06); border-color: rgba(220,10,10,0.15);">\u{1F525} {{name}}: {{value}}</span>{{/each}}',
    "    </div>",
    "  </div>",
    "  {{/if}}",
    '  <details class="sotl-card-details" open><summary>Inventory & Relationships</summary>',
    '    <div style="font-size: 12px; margin-top: 4px;">',
    "      <strong>Inventory:</strong> {{inventory}}<br>",
    "      {{#each relationships}}<strong>{{parties}}</strong>: {{status}}<br>{{/each}}",
    "    </div>",
    "  </details>",
    '  <details class="sotl-card-details" open><summary>Story Continuum</summary>',
    '    <div style="font-size: 12px; line-height: 1.4; display: grid; gap: 4px;">',
    "      {{#if activeThread}}<div><strong>Active Thread:</strong> {{activeThread}}</div>{{/if}}",
    "      {{#if secrets}}<div><strong>Secrets:</strong> {{secrets}}</div>{{/if}}",
    "      {{#if rumors}}<div><strong>Rumors:</strong> {{rumors}}</div>{{/if}}",
    "      {{#if anchors}}<div><strong>Anchors:</strong> {{anchors}}</div>{{/if}}",
    "      {{#if contradictions}}<div><strong>Contradictions:</strong> {{contradictions}}</div>{{/if}}",
    "      {{#if avoidNext}}<div><strong>Avoid Next:</strong> {{avoidNext}}</div>{{/if}}",
    "    </div>",
    "  </details>",
    "</section>"
  ].join(""),
  promptInstructions: [
    "You are State of the Loom, tracking full roleplay continuity details.",
    "Return valid JSON only. Do not use markdown fences.",
    "Use the Full Continuity Ledger schema exactly.",
    "Preserve long-running secrets, rumors, active story arcs, lighting changes, weather state, and relationships.",
    "Keep arrays capped. Empty strings and [] are used for unknown or empty blocks."
  ].join("\n"),
  injectionTemplate: "[Full Continuity Ledger]\n{{compactSummary}}",
  maxInjectionTokens: 450,
  defaultPlacement: "top",
  renderOptions: {
    density: "normal",
    theme: "system",
    showControls: true
  },
  parserOptions: {
    fenceNames: ["tracker", "loom"],
    strictJson: true,
    repairInvalidJson: false
  },
  sampleData: {
    schemaVersion: LOOM_SCHEMA_VERSION,
    sceneTitle: "Storm over Ward House",
    location: "Ward House Kitchen",
    time: "5:45 PM",
    weather: "heavy rain, thunder",
    lighting: "dim, flickering overhead fixture",
    mood: "tense, electric",
    delta: "Bridget\u2019s sudden questioning spiked the tension in the room.",
    cast: [
      {
        name: "Bridget Hanley",
        outfit: "dark knit sweater",
        emotion: "wryly curious",
        pockets: ["lighter"]
      },
      {
        name: "Diane Ward",
        outfit: "denim shorts, simple tee",
        emotion: "tolerant but weary",
        pockets: ["keyring"]
      }
    ],
    inventory: ["letter", "keyring", "lighter"],
    relationships: [
      { parties: "Bridget & Diane", status: "playful tension" }
    ],
    activeThread: "Resolve Marcus\u2019s sudden absence.",
    secrets: ["Marcus left under threat."],
    rumors: ["The cellar door leads to an old drainage system."],
    anchors: ["The house is locked from inside."],
    contradictions: ["None."],
    avoidNext: ["Do not reveal Marcus\u2019s whereabouts yet."],
    meters: [
      { name: "Tension", value: "High" },
      { name: "Rain intensity", value: "Severe" }
    ]
  },
  createdAt: now,
  updatedAt: now
};
var builtInPresets = [
  microLoomPreset,
  slimScenePreset,
  balancedStoryPreset,
  castContinuityPreset,
  fullContinuityLedgerPreset
];

// src/shared/parser.ts
function findMatchingBrace(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function parseJsonObject(raw) {
  const trimmed = raw.trim();
  const firstBrace = trimmed.indexOf("{");
  if (firstBrace < 0) throw new Error("No JSON object found.");
  const lastBrace = findMatchingBrace(trimmed, firstBrace);
  if (lastBrace < 0) throw new Error("JSON object is not closed.");
  const objectText = trimmed.slice(firstBrace, lastBrace + 1);
  const parsed = JSON.parse(objectText);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Tracker JSON must be an object.");
  }
  return parsed;
}
function extractTrackerBlock(content, fenceNames) {
  const names = fenceNames.length > 0 ? fenceNames : ["tracker", "loom"];
  const escapedNames = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const fencePattern = new RegExp("```\\s*(" + escapedNames + ")\\s*\\r?\\n([\\s\\S]*?)\\r?\\n```", "i");
  const match = fencePattern.exec(content);
  if (!match) return { found: false };
  const rawBlock = match[0];
  const fenceName = match[1] || "tracker";
  const body = match[2] || "";
  try {
    const data = parseJsonObject(body);
    const cleanedContent = content.slice(0, match.index) + content.slice(match.index + rawBlock.length);
    return { found: true, data, rawBlock, cleanedContent, fenceName };
  } catch (error) {
    return {
      found: true,
      rawBlock,
      error: error instanceof Error ? error.message : String(error),
      fenceName
    };
  }
}

// src/shared/prompts.ts
function buildTrackerPrompt(input) {
  const previous = input.previousTracker ? JSON.stringify(input.previousTracker.data, null, 2) : "{}";
  const schema = JSON.stringify(input.preset.schemaJson, null, 2);
  const histories = input.previousSummaries && input.previousSummaries.length > 0 ? "\n\nRecent tracker history:\n" + input.previousSummaries.map((s, idx) => `[T-${idx + 1}] ${s}`).join("\n") : "";
  return [
    {
      role: "system",
      content: input.preset.promptInstructions
    },
    {
      role: "user",
      content: [
        "Schema:",
        schema,
        "",
        "Previous tracker state:",
        previous,
        histories,
        "",
        "Recent context:",
        input.recentContext || "(none)",
        "",
        "Latest assistant message to track:",
        input.latestAssistantMessage,
        "",
        "Return JSON only. No markdown. No commentary."
      ].join("\n")
    }
  ];
}

// src/shared/renderer.ts
function makeCompactSummary(data) {
  const scene = String(data.sceneTitle || data.location || "Current scene");
  const delta = String(data.delta || data.activeThread || "").trim();
  return delta ? `${scene}: ${delta}` : scene;
}

// src/shared/validation.ts
function valueType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}
function schemaType(schema) {
  const type = schema.type;
  return typeof type === "string" ? type : void 0;
}
function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function validateNode(value, schema, path, issues) {
  const expected = schemaType(schema);
  if (expected && valueType(value) !== expected) {
    issues.push({ path, message: `Expected ${expected}, received ${valueType(value)}.`, severity: "error" });
    return;
  }
  if (expected === "object") {
    const record = asObject(value);
    const required = Array.isArray(schema.required) ? schema.required.filter((item) => typeof item === "string") : [];
    for (const key of required) {
      if (!(key in record)) {
        issues.push({ path: `${path}.${key}`, message: "Required field is missing.", severity: "error" });
      }
    }
    const properties = asObject(schema.properties);
    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in record && childSchema && typeof childSchema === "object" && !Array.isArray(childSchema)) {
        validateNode(record[key], childSchema, path ? `${path}.${key}` : key, issues);
      }
    }
    return;
  }
  if (expected === "array") {
    const arrayValue = Array.isArray(value) ? value : [];
    const maxItems = typeof schema.maxItems === "number" ? schema.maxItems : void 0;
    if (maxItems !== void 0 && arrayValue.length > maxItems) {
      issues.push({ path, message: `Array exceeds maxItems ${maxItems}.`, severity: "warning" });
    }
    const itemSchema = schema.items;
    if (itemSchema && typeof itemSchema === "object" && !Array.isArray(itemSchema)) {
      arrayValue.forEach((item, index) => validateNode(item, itemSchema, `${path}[${index}]`, issues));
    }
  }
}
function validateAgainstSchema(data, schema) {
  if (!schema || typeof schema !== "object") {
    return { ok: false, issues: [{ path: "", message: "Invalid or missing schema.", severity: "error" }] };
  }
  const issues = [];
  try {
    validateNode(data, schema, "", issues);
  } catch (err) {
    issues.push({ path: "", message: `Validation crash: ${err instanceof Error ? err.message : String(err)}`, severity: "error" });
  }
  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues
  };
}
function normalizePreset(preset) {
  const now2 = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: String(preset.id || `custom_loom_${Date.now()}`),
    name: String(preset.name || "Custom Loom Template"),
    version: String(preset.version || "1.0.8"),
    description: String(preset.description || ""),
    mode: preset.mode === "passive_extract" || preset.mode === "sidecar_generate" || preset.mode === "hybrid" ? preset.mode : "hybrid",
    schemaJson: preset.schemaJson && typeof preset.schemaJson === "object" && !Array.isArray(preset.schemaJson) ? preset.schemaJson : {
      type: "object",
      required: ["schemaVersion", "sceneTitle", "location", "time", "mood", "delta"],
      properties: {
        schemaVersion: { type: "string", default: "1" },
        sceneTitle: { type: "string", default: "" },
        location: { type: "string", default: "" },
        time: { type: "string", default: "" },
        mood: { type: "string", default: "" },
        delta: { type: "string", default: "" }
      }
    },
    htmlTemplate: String(preset.htmlTemplate || ""),
    promptInstructions: String(preset.promptInstructions || "Return valid JSON only. Do not use markdown fences. Update what changed."),
    injectionTemplate: String(preset.injectionTemplate || "[Custom Loom]\n{{compactSummary}}"),
    maxInjectionTokens: typeof preset.maxInjectionTokens === "number" ? preset.maxInjectionTokens : 150,
    defaultPlacement: preset.defaultPlacement === "top" || preset.defaultPlacement === "bottom" ? preset.defaultPlacement : "top",
    renderOptions: {
      density: preset.renderOptions?.density === "compact" || preset.renderOptions?.density === "normal" || preset.renderOptions?.density === "expanded" ? preset.renderOptions.density : "compact",
      theme: preset.renderOptions?.theme === "system" || preset.renderOptions?.theme === "glass" || preset.renderOptions?.theme === "paper" || preset.renderOptions?.theme === "terminal" || preset.renderOptions?.theme === "minimal" ? preset.renderOptions.theme : "system",
      showControls: typeof preset.renderOptions?.showControls === "boolean" ? preset.renderOptions.showControls : true
    },
    parserOptions: {
      fenceNames: Array.isArray(preset.parserOptions?.fenceNames) ? preset.parserOptions.fenceNames : ["tracker", "loom"],
      strictJson: typeof preset.parserOptions?.strictJson === "boolean" ? preset.parserOptions.strictJson : true,
      repairInvalidJson: typeof preset.parserOptions?.repairInvalidJson === "boolean" ? preset.parserOptions.repairInvalidJson : false
    },
    sampleData: preset.sampleData && typeof preset.sampleData === "object" && !Array.isArray(preset.sampleData) ? preset.sampleData : { sceneTitle: "New Scene", location: "Foyer" },
    createdAt: String(preset.createdAt || now2),
    updatedAt: now2
  };
}

// src/backend/lumiverseApi.ts
function getGlobalSpindle() {
  if (typeof spindle !== "undefined" && spindle && typeof spindle === "object") return spindle;
  const globalValue = globalThis;
  const candidate = globalValue.spindle ?? globalValue.lumiverseSpindle;
  if (candidate && typeof candidate === "object") return candidate;
  return {};
}
function getSenderUserId(meta) {
  const direct = meta?.userId ?? meta?.user_id ?? meta?.senderUserId;
  return typeof direct === "string" && direct.trim() ? direct : "default";
}
async function hasPermission(spindle2, permission) {
  const api = spindle2.permissions;
  if (!api) return false;
  if (typeof api.has === "function") {
    try {
      return Boolean(await api.has(permission));
    } catch {
      return false;
    }
  }
  if (typeof api.getGranted === "function") {
    try {
      return (await api.getGranted()).includes(permission);
    } catch {
      return false;
    }
  }
  return false;
}
async function getPermissionState(spindle2) {
  const [chats, chatMutation, generation, appManipulation] = await Promise.all([
    hasPermission(spindle2, "chats"),
    hasPermission(spindle2, "chat_mutation"),
    hasPermission(spindle2, "generation"),
    hasPermission(spindle2, "app_manipulation")
  ]);
  return {
    chats,
    chat_mutation: chatMutation,
    generation,
    app_manipulation: appManipulation
  };
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function asMessageArray(value) {
  const recordValue = asRecord(value);
  const source = Array.isArray(value) ? value : Array.isArray(recordValue?.messages) ? recordValue.messages : Array.isArray(recordValue?.data) ? recordValue.data : [];
  return source.map((item, index) => {
    const record = asRecord(item) ?? {};
    const swipes = Array.isArray(record.swipes) ? record.swipes : [];
    const swipeId = typeof record.swipe_id === "number" ? record.swipe_id : typeof record.swipeId === "number" ? record.swipeId : 0;
    const activeSwipe = typeof swipes[swipeId] === "string" ? swipes[swipeId] : void 0;
    const content = record.content ?? activeSwipe ?? record.text ?? record.message;
    const role = record.role ?? record.sender ?? record.type;
    const id = record.id ?? record.messageId ?? record.message_id ?? String(index);
    const metadata = asRecord(record.metadata) ?? void 0;
    const swipe = record.swipeId ?? record.swipe_id;
    const normalized = {
      id: typeof id === "string" || typeof id === "number" ? String(id) : String(index),
      role: typeof role === "string" ? role : void 0,
      content: typeof content === "string" ? content : ""
    };
    if (metadata) normalized.metadata = metadata;
    if (typeof swipe === "number") normalized.swipe_id = swipe;
    return normalized;
  });
}
async function sendFrontend(spindle2, userId, message) {
  if (typeof spindle2.sendToFrontend === "function") {
    await spindle2.sendToFrontend(message, userId);
    return;
  }
  const frontend = spindle2.frontend;
  if (frontend?.sendToFrontend) {
    await frontend.sendToFrontend(message, userId);
    return;
  }
  if (frontend?.send) await frontend.send(message, { userId });
}
function onFrontendMessage(spindle2, handler) {
  if (typeof spindle2.onFrontendMessage === "function") {
    const unsubscribe2 = spindle2.onFrontendMessage(async (message, userId) => {
      await handler(message, typeof userId === "string" ? userId : "default");
    });
    return typeof unsubscribe2 === "function" ? unsubscribe2 : void 0;
  }
  if (!spindle2.frontend?.onMessage) return void 0;
  const unsubscribe = spindle2.frontend.onMessage(async (message, meta) => {
    await handler(message, getSenderUserId(meta));
  });
  return typeof unsubscribe === "function" ? unsubscribe : void 0;
}
async function tryCall(fn, args) {
  if (typeof fn !== "function") return null;
  for (const callArgs of args) {
    try {
      const value = await fn(...callArgs);
      if (value !== void 0 && value !== null) return value;
    } catch {
    }
  }
  return null;
}
async function getActiveChat(spindle2, userId) {
  const chatsApi = asRecord(spindle2.chats) ?? {};
  const legacyChatApi = asRecord(spindle2.chat) ?? {};
  const active = await tryCall(chatsApi.getActive ?? chatsApi.getCurrent ?? chatsApi.active, [
    [{ userId }],
    [userId],
    []
  ]) ?? await tryCall(legacyChatApi.getActive ?? legacyChatApi.getCurrent ?? legacyChatApi.active, [
    [{ userId }],
    [userId],
    []
  ]);
  const activeRecord = asRecord(active);
  const chatId = activeRecord?.id ?? activeRecord?.chatId ?? activeRecord?.chat_id;
  const chatName = activeRecord?.name ?? activeRecord?.title ?? activeRecord?.label;
  const chat = {
    id: typeof chatId === "string" || typeof chatId === "number" ? String(chatId) : null,
    name: typeof chatName === "string" ? chatName : ""
  };
  if (!chat.id) return { chat, messages: asMessageArray(activeRecord?.messages) };
  const messages = await getChatMessages(spindle2, chat.id, userId);
  if (messages.length > 0) return { chat, messages };
  return { chat, messages: asMessageArray(activeRecord?.messages) };
}
async function getChatMessages(spindle2, chatId, userId) {
  const chatApi = asRecord(spindle2.chat) ?? {};
  const chatsApi = asRecord(spindle2.chats) ?? {};
  const messages = await tryCall(chatApi.getMessages ?? chatApi.messages ?? chatApi.listMessages, [
    [chatId, { userId }],
    [{ chatId, userId }],
    [chatId]
  ]).catch(() => null);
  if (messages !== null) return asMessageArray(messages);
  const fallback = await tryCall(chatsApi.getMessages ?? chatsApi.messages ?? chatsApi.listMessages, [
    [chatId, { userId }],
    [{ chatId, userId }],
    [chatId]
  ]);
  return asMessageArray(fallback);
}
async function listConnectionProfiles(spindle2, userId) {
  const connectionsApi = asRecord(spindle2.connections) ?? {};
  const generationApi = asRecord(spindle2.generate) ?? asRecord(spindle2.generation) ?? {};
  const raw = await tryCall(
    connectionsApi.list ?? connectionsApi.getAll ?? generationApi.listConnectionProfiles ?? generationApi.getConnectionProfiles ?? generationApi.listConnections,
    [
      [{ userId }],
      [userId],
      []
    ]
  );
  const list = Array.isArray(raw) ? raw : Array.isArray(asRecord(raw)?.profiles) ? asRecord(raw)?.profiles : [];
  return list.map((item, index) => {
    const record = asRecord(item) ?? {};
    const id = record.id ?? record.connectionId ?? record.connection_id ?? record.name ?? String(index);
    const name = record.name ?? record.label ?? record.displayName ?? id;
    const provider = record.provider ?? record.providerName;
    const model = record.model ?? record.modelName ?? record.selectedModel;
    const isDefault = record.is_default ?? record.isDefault ?? record.default;
    const hasApiKey = record.has_api_key ?? record.hasApiKey;
    const profile = {
      id: String(id),
      name: String(name)
    };
    if (typeof provider === "string") profile.provider = provider;
    if (typeof model === "string") profile.model = model;
    if (typeof isDefault === "boolean") profile.is_default = isDefault;
    if (typeof hasApiKey === "boolean") profile.has_api_key = hasApiKey;
    return profile;
  });
}
async function runSidecarGeneration(spindle2, userId, messages, connectionId) {
  const generationApi = asRecord(spindle2.generate) ?? asRecord(spindle2.generation) ?? {};
  const payload = {
    messages,
    internal: true,
    source: "state_of_the_loom",
    reasoning: "off",
    userId
  };
  if (connectionId) payload.connectionId = connectionId;
  if (connectionId) payload.connection_id = connectionId;
  if (connectionId) payload.connectionProfileId = connectionId;
  const response = await tryCall(
    generationApi.quiet ?? generationApi.generate ?? generationApi.create ?? generationApi.complete ?? generationApi.run,
    [
      [payload],
      [payload, { userId }],
      [{ ...payload, userId }],
      [messages, { userId, connectionId }]
    ]
  );
  const record = asRecord(response);
  const content = record?.content ?? record?.text ?? record?.message ?? record?.output ?? record?.response ?? response;
  if (typeof content !== "string") throw new Error("Generation API did not return text content.");
  return content;
}
async function updateMessageContent(spindle2, chatId, messageId, content, userId) {
  const chatApi = asRecord(spindle2.chat) ?? {};
  const chatsApi = asRecord(spindle2.chats) ?? {};
  const result = await tryCall(chatApi.updateMessage ?? chatApi.editMessage ?? chatApi.setMessageContent, [
    [chatId, messageId, { content, userId }],
    [{ chatId, messageId, content, userId }],
    [messageId, content]
  ]) ?? await tryCall(chatsApi.updateMessage ?? chatsApi.editMessage ?? chatsApi.setMessageContent, [
    [chatId, messageId, { content, userId }],
    [{ chatId, messageId, content, userId }],
    [messageId, content]
  ]);
  return result !== null;
}

// src/backend/generationService.ts
var LoomGenerationService = class {
  constructor(spindle2) {
    this.spindle = spindle2;
    this.runningKeys = /* @__PURE__ */ new Set();
    this.activeGenerations = /* @__PURE__ */ new Map();
    this.status = { running: false };
  }
  getStatus() {
    return { ...this.status };
  }
  cancel(userId) {
    const cancelFn = this.activeGenerations.get(userId);
    if (cancelFn) {
      cancelFn();
      return true;
    }
    return false;
  }
  clearStuckState() {
    this.runningKeys.clear();
    this.activeGenerations.clear();
    this.status = { running: false };
  }
  async listConnections(userId, permissions) {
    if (!permissions.generation) return [];
    return listConnectionProfiles(this.spindle, userId);
  }
  getDisabledReason(input) {
    if (!input.settings.enabled) return "State of the Loom is disabled.";
    if (!input.activeChatId) return "No active chat.";
    if (!input.activePreset) return "No active preset.";
    if (this.status.running) return "Generation already running.";
    if (!input.permissions.chat_mutation) return "Missing chat mutation permission; cannot read chat messages.";
    const needsSidecarOnly = input.activePreset.mode === "sidecar_generate";
    if (!input.permissions.generation && needsSidecarOnly) return "Missing generation permission.";
    if (input.permissions.generation && !input.settings.useDefaultConnectionFallback && !input.settings.sidecarConnectionId) {
      return "No sidecar connection profile selected.";
    }
    if (input.settings.sidecarConnectionId && input.connections.length > 0 && !input.connections.some((connection) => connection.id === input.settings.sidecarConnectionId)) {
      return "Selected sidecar connection profile is unavailable.";
    }
    return void 0;
  }
  async findLatestAssistantTarget(userId, requestedChatId, requestedMessageId) {
    const { chat, messages } = await getActiveChat(this.spindle, userId);
    const chatId = requestedChatId || chat.id;
    if (!chatId) return null;
    const assistantMessages = messages.filter((message) => {
      const role = (message.role || "").toLowerCase();
      return role === "assistant" || role === "model" || role === "ai" || !role && Boolean(message.content);
    });
    const selected = requestedMessageId ? assistantMessages.find((message) => message.id === requestedMessageId) : assistantMessages[assistantMessages.length - 1];
    if (!selected || !selected.content) return null;
    const context = messages.slice(Math.max(0, messages.length - 8)).map((message) => {
      const role = message.role || "message";
      return `${role}: ${message.content || ""}`;
    }).join("\n\n");
    return { chatId, message: selected, recentContext: context };
  }
  async findPayloadTarget(input) {
    if (!input.chatId) return null;
    const messages = await getChatMessages(this.spindle, input.chatId, input.userId);
    const selected = input.messageId ? messages.find((message2) => message2.id === input.messageId) : null;
    const message = selected ?? {
      id: input.messageId,
      role: "assistant",
      content: input.content || ""
    };
    if (!message.content) return null;
    const contextMessages = messages.length > 0 ? messages : [message];
    const recentContext = contextMessages.slice(Math.max(0, contextMessages.length - 8)).map((item) => {
      const role = item.role || "message";
      return `${role}: ${item.content || ""}`;
    }).join("\n\n");
    return { chatId: input.chatId, message, recentContext };
  }
  tryPassiveExtract(input) {
    const parse = extractTrackerBlock(input.message.content || "", input.preset.parserOptions.fenceNames);
    if (!parse.found || !parse.data) return null;
    const validation = validateAgainstSchema(parse.data, input.preset.schemaJson);
    const tracker = {
      version: LOOM_VERSION,
      schemaVersion: String(parse.data.schemaVersion || LOOM_SCHEMA_VERSION),
      presetId: input.preset.id,
      chatId: input.chatId,
      messageId: input.message.id,
      swipeId: input.message.swipe_id,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      source: "passive_extract",
      placement: input.settings.messageCardPlacement || "top",
      data: parse.data,
      compactSummary: makeCompactSummary(parse.data),
      validation,
      rawOutput: parse.rawBlock
    };
    return {
      tracker,
      cleanedContent: parse.cleanedContent
    };
  }
  async generateSidecar(input) {
    const messageId = input.message.id || "latest";
    const key = `${input.chatId}:${messageId}:${input.message.swipe_id ?? "main"}`;
    if (this.runningKeys.has(key)) throw new Error("Generation already running for this message.");
    this.runningKeys.add(key);
    const startTime = Date.now();
    this.status = { running: true, message: "Generating tracker... 0s" };
    let elapsedTimer;
    let timeoutTimer;
    try {
      const prompt = buildTrackerPrompt({
        preset: input.preset,
        latestAssistantMessage: input.message.content || "",
        previousTracker: input.previousTracker,
        previousSummaries: input.previousSummaries,
        recentContext: input.recentContext
      });
      const timeoutMs = typeof input.settings.sidecarGenerationTimeoutMs === "number" ? input.settings.sidecarGenerationTimeoutMs : 18e4;
      const timeoutPromise = new Promise((_, reject) => {
        if (timeoutMs > 0) {
          timeoutTimer = setTimeout(() => {
            reject(new Error(`Generation timed out after ${timeoutMs / 1e3} seconds.`));
          }, timeoutMs);
        }
      });
      let cancelFn;
      const cancelPromise = new Promise((_, reject) => {
        cancelFn = () => reject(new Error("Generation cancelled by user."));
      });
      this.activeGenerations.set(input.userId, cancelFn);
      elapsedTimer = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTime) / 1e3);
        let timeStr = `${elapsedSec}s`;
        if (elapsedSec >= 60) {
          const min = Math.floor(elapsedSec / 60);
          const sec = elapsedSec % 60;
          timeStr = `${min}m ${sec}s`;
        }
        this.status = { running: true, message: `Generating tracker... ${timeStr}` };
        if (input.onProgress) {
          try {
            input.onProgress();
          } catch {
          }
        }
      }, 1e3);
      const generationPromise = runSidecarGeneration(this.spindle, input.userId, prompt, input.settings.sidecarConnectionId);
      const raw = await Promise.race([
        generationPromise,
        timeoutPromise,
        cancelPromise
      ]);
      if (elapsedTimer) clearInterval(elapsedTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      const data = parseJsonObject(raw);
      const validation = validateAgainstSchema(data, input.preset.schemaJson);
      const tracker = {
        version: LOOM_VERSION,
        schemaVersion: String(data.schemaVersion || LOOM_SCHEMA_VERSION),
        presetId: input.preset.id,
        chatId: input.chatId,
        messageId: input.message.id,
        swipeId: input.message.swipe_id,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        source: "sidecar_generate",
        placement: input.settings.messageCardPlacement || "top",
        data,
        compactSummary: makeCompactSummary(data),
        validation,
        rawOutput: raw
      };
      return { tracker };
    } finally {
      if (elapsedTimer) clearInterval(elapsedTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      this.runningKeys.delete(key);
      this.activeGenerations.delete(input.userId);
      this.status = { running: false };
    }
  }
  async stripPassiveBlockIfAllowed(input) {
    if (!input.permissions.chat_mutation || !input.settings.stripTrackerBlocksFromMessages) return false;
    if (!input.messageId || input.cleanedContent === void 0) return false;
    return updateMessageContent(this.spindle, input.chatId, input.messageId, input.cleanedContent, input.userId);
  }
};

// src/backend/storageRecovery.ts
function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}
async function setJsonWithRecovery(spindle2, key, userId, value) {
  const setJson = spindle2.userStorage?.setJson;
  if (!setJson) return;
  try {
    await setJson(key, value, { userId, indent: 2 });
  } catch {
    await setJson(key, value, { userId });
  }
}
async function getJsonWithRecovery(spindle2, key, userId, fallback, onWarning) {
  const getJson = spindle2.userStorage?.getJson;
  if (!getJson) return fallback;
  try {
    const value = await getJson(key, { userId, fallback });
    return value === void 0 ? fallback : value;
  } catch (error) {
    const warning = `Recovered corrupt ${key}; reset it to a safe default.`;
    spindle2.log?.warn?.(`State of the Loom storage recovery: ${warning} ${errorText(error)}`);
    onWarning?.(warning);
    try {
      await setJsonWithRecovery(spindle2, key, userId, fallback);
    } catch (writeError) {
      const writeWarning = `Could not rewrite ${key} after recovery: ${errorText(writeError)}`;
      spindle2.log?.warn?.(`State of the Loom storage recovery: ${writeWarning}`);
      onWarning?.(writeWarning);
    }
    return fallback;
  }
}

// src/backend/presetService.ts
function isPreset(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && typeof value.id === "string" && typeof value.name === "string" && typeof value.htmlTemplate === "string";
}
var LoomPresetService = class {
  constructor(spindle2, onStorageWarning) {
    this.spindle = spindle2;
    this.onStorageWarning = onStorageWarning;
  }
  async loadAll(userId) {
    const stored = await getJsonWithRecovery(
      this.spindle,
      STORAGE_KEYS.presets,
      userId,
      [],
      this.onStorageWarning
    );
    const custom = Array.isArray(stored) ? stored.filter(isPreset).map(normalizePreset) : [];
    const customIds = new Set(custom.map((preset) => preset.id));
    return [
      ...builtInPresets.filter((preset) => !customIds.has(preset.id)),
      ...custom
    ];
  }
  async resolve(userId, presetId) {
    const presets = await this.loadAll(userId);
    return presets.find((preset) => preset.id === presetId) ?? presets.find((preset) => preset.id === SLIM_SCENE_PRESET_ID) ?? builtInPresets[0];
  }
  async reset(userId) {
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.presets, userId, []);
    return this.loadAll(userId);
  }
  async save(userId, preset) {
    if (builtInPresets.some((p) => p.id === preset.id)) {
      throw new Error(`Cannot modify built-in preset: ${preset.id}`);
    }
    const normalized = normalizePreset(preset);
    const stored = await getJsonWithRecovery(
      this.spindle,
      STORAGE_KEYS.presets,
      userId,
      [],
      this.onStorageWarning
    );
    const custom = Array.isArray(stored) ? stored.filter(isPreset).map(normalizePreset) : [];
    const existingIndex = custom.findIndex((p) => p.id === normalized.id);
    if (existingIndex >= 0) {
      custom[existingIndex] = normalized;
    } else {
      custom.push(normalized);
    }
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.presets, userId, custom);
    return this.loadAll(userId);
  }
  async delete(userId, presetId) {
    if (builtInPresets.some((p) => p.id === presetId)) {
      throw new Error(`Cannot delete built-in preset: ${presetId}`);
    }
    const stored = await getJsonWithRecovery(
      this.spindle,
      STORAGE_KEYS.presets,
      userId,
      [],
      this.onStorageWarning
    );
    const custom = Array.isArray(stored) ? stored.filter(isPreset) : [];
    const filtered = custom.filter((p) => p.id !== presetId);
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.presets, userId, filtered);
    return this.loadAll(userId);
  }
};

// src/backend/settingsService.ts
var LoomSettingsService = class {
  constructor(spindle2, onStorageWarning) {
    this.spindle = spindle2;
    this.onStorageWarning = onStorageWarning;
  }
  async load(userId) {
    const stored = await getJsonWithRecovery(
      this.spindle,
      STORAGE_KEYS.settings,
      userId,
      defaultSettings,
      this.onStorageWarning
    );
    return this.merge(stored);
  }
  async save(userId, patch) {
    const current = await this.load(userId);
    const next = this.merge({ ...current, ...patch });
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.settings, userId, next);
    return next;
  }
  async reset(userId) {
    const next = this.merge(defaultSettings);
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.settings, userId, next);
    return next;
  }
  merge(value) {
    const raw = value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
    if ("showChatLoomPanel" in raw && typeof raw.showChatLoomPanel === "boolean") {
      raw.showChatHudLauncher = raw.showChatLoomPanel;
    }
    if ("trackerHudView" in raw && (raw.trackerHudView === "compact" || raw.trackerHudView === "full")) {
      raw.hudDefaultView = raw.trackerHudView;
    }
    if ("renderTrackersInMessages" in raw && typeof raw.renderTrackersInMessages === "boolean") {
      raw.renderInMessages = raw.renderTrackersInMessages;
    }
    if ("defaultPlacement" in raw) {
      if (raw.defaultPlacement === "top" || raw.defaultPlacement === "bottom") {
        raw.messageCardPlacement = raw.defaultPlacement;
      }
    }
    delete raw.showChatLoomPanel;
    delete raw.trackerHudView;
    delete raw.renderTrackersInMessages;
    delete raw.defaultPlacement;
    delete raw.trackerPlacement;
    delete raw.trackerDisplayScope;
    const next = {
      ...defaultSettings,
      ...raw
    };
    if (!next.activePresetId) next.activePresetId = defaultSettings.activePresetId;
    if (!next.messageCardPlacement) next.messageCardPlacement = defaultSettings.messageCardPlacement;
    return next;
  }
};

// src/backend/simulationService.ts
function getSimulationMilestoneStatus() {
  return "Simulation modules are intentionally deferred until Milestone 2.";
}

// src/backend/trackerStateService.ts
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function makeMessageKey(messageId, swipeId) {
  const base = messageId || "latest";
  return typeof swipeId === "number" ? `${base}::swipe:${swipeId}` : base;
}
function normalizeIndex(value) {
  if (!isRecord(value)) return {};
  const index = {};
  for (const [chatId, chatValue] of Object.entries(value)) {
    if (!isRecord(chatValue)) continue;
    const messages = isRecord(chatValue.messages) ? chatValue.messages : {};
    const latest = isRecord(chatValue.latest) ? chatValue.latest : void 0;
    index[chatId] = { messages };
    if (latest) index[chatId].latest = latest;
  }
  return index;
}
var LoomTrackerStateService = class {
  constructor(spindle2, onStorageWarning) {
    this.spindle = spindle2;
    this.onStorageWarning = onStorageWarning;
  }
  async loadIndex(userId) {
    const stored = await getJsonWithRecovery(
      this.spindle,
      STORAGE_KEYS.trackerStates,
      userId,
      {},
      this.onStorageWarning
    );
    return normalizeIndex(stored);
  }
  async getLatest(userId, chatId) {
    if (!chatId) return null;
    const index = await this.loadIndex(userId);
    return index[chatId]?.latest ?? null;
  }
  async listForChat(userId, chatId) {
    if (!chatId) return [];
    const index = await this.loadIndex(userId);
    return Object.values(index[chatId]?.messages ?? {}).filter((tracker) => tracker.version === LOOM_VERSION).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)).slice(0, 20);
  }
  async save(userId, tracker, limit = 5) {
    const index = await this.loadIndex(userId);
    const existing = index[tracker.chatId] ?? { messages: {} };
    const key = makeMessageKey(tracker.messageId, tracker.swipeId);
    existing.messages[key] = tracker;
    existing.latest = tracker;
    index[tracker.chatId] = existing;
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
    if (limit > 0) {
      await this.pruneChatHistory(userId, tracker.chatId, limit);
    }
  }
  async pruneChatHistory(userId, chatId, limit) {
    if (!chatId || limit <= 0) return;
    const index = await this.loadIndex(userId);
    const existing = index[chatId];
    if (!existing || !existing.messages) return;
    const allTrackers = Object.entries(existing.messages).map(([k, t]) => ({ k, t })).sort((a, b) => b.t.generatedAt.localeCompare(a.t.generatedAt));
    if (allTrackers.length > limit) {
      const kept = allTrackers.slice(0, limit);
      const keptKeys = new Set(kept.map((item) => item.k));
      if (existing.latest) {
        keptKeys.add(makeMessageKey(existing.latest.messageId, existing.latest.swipeId));
      }
      const newMessages = {};
      for (const [k, t] of Object.entries(existing.messages)) {
        if (keptKeys.has(k)) {
          newMessages[k] = t;
        }
      }
      existing.messages = newMessages;
      index[chatId] = existing;
      await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
    }
  }
  async delete(userId, chatId, messageId) {
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return;
    if (messageId) {
      delete chat.messages[makeMessageKey(messageId)];
      if (chat.latest?.messageId === messageId) {
        chat.latest = Object.values(chat.messages).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
      }
    } else {
      delete index[chatId];
    }
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
  }
  async setHidden(userId, chatId, messageId, hidden) {
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return null;
    const key = makeMessageKey(messageId);
    const tracker = messageId ? chat.messages[key] : chat.latest;
    if (!tracker) return null;
    const updated = { ...tracker, hidden, placement: hidden ? "hidden" : tracker.placement };
    if (messageId) chat.messages[key] = updated;
    if (!messageId || chat.latest?.messageId === messageId) chat.latest = updated;
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
    return updated;
  }
  async reset(userId) {
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, {});
  }
};

// src/backend/backend.ts
function isRecord2(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isFrontendMessage(value) {
  return isRecord2(value) && typeof value.type === "string";
}
function activeChatName(id, fallback) {
  if (!id) return fallback;
  return fallback || `Chat ${id}`;
}
function isAssistantMessage(message) {
  const role = (message.role || "").toLowerCase();
  return role === "assistant" || role === "model" || role === "ai" || !role && Boolean(message.content);
}
function messageChatId(message) {
  const record = message;
  return typeof record.chatId === "string" && record.chatId.trim() ? record.chatId : null;
}
var StateOfTheLoomBackend = class {
  constructor(spindle2) {
    this.spindle = spindle2;
    this.knownUsers = /* @__PURE__ */ new Set();
    this.chatUsers = /* @__PURE__ */ new Map();
    this.lastFrontendUserId = null;
    this.reportedUnknownGenerationUser = false;
    this.diagnostics = {
      backendReady: true,
      renderLimitation: "Top-of-message rendering uses Lumiverse render hooks when available and a scoped compatibility mount otherwise."
    };
    const onStorageWarning = (warning) => this.recordStorageWarning(warning);
    this.settingsService = new LoomSettingsService(spindle2, onStorageWarning);
    this.presetService = new LoomPresetService(spindle2, onStorageWarning);
    this.trackerService = new LoomTrackerStateService(spindle2, onStorageWarning);
    this.generationService = new LoomGenerationService(spindle2);
  }
  setup() {
    onFrontendMessage(this.spindle, async (message, userId) => {
      if (!isFrontendMessage(message)) return;
      this.rememberUser(userId, messageChatId(message));
      await this.handleMessage(userId, message);
    });
    this.spindle.permissions?.onChanged?.(async () => {
      await this.notifyPermissionsChanged();
    });
    const onEvent = this.spindle.on ?? this.spindle.events?.on;
    onEvent?.("generation_ended", async (payload) => {
      await this.handleGenerationEnded(payload);
    });
    onEvent?.("GENERATION_ENDED", async (payload) => {
      await this.handleGenerationEnded(payload);
    });
    onEvent?.("PERMISSION_CHANGED", async () => {
      await this.notifyPermissionsChanged();
    });
    this.spindle.log?.info?.("State of the Loom backend loaded.");
  }
  rememberUser(userId, chatId) {
    this.knownUsers.add(userId);
    if (userId && userId !== "default") this.lastFrontendUserId = userId;
    if (chatId && userId && userId !== "default") this.chatUsers.set(chatId, userId);
  }
  recordStorageWarning(warning) {
    this.diagnostics = { ...this.diagnostics, storageWarning: warning };
  }
  recordRuntimeError(message, error) {
    const detail = error instanceof Error ? error.message : error ? String(error) : "";
    const text = detail ? `${message}: ${detail}` : message;
    this.diagnostics = { ...this.diagnostics, lastError: text };
    this.spindle.log?.warn?.(`State of the Loom: ${text}`);
  }
  async notifyPermissionsChanged() {
    try {
      for (const userId of this.knownUsers) {
        const state = await this.buildState(userId);
        await this.send(userId, { type: "permissions_changed", permissions: state.permissions, state });
      }
    } catch (error) {
      this.recordRuntimeError("Permission change handling failed", error);
    }
  }
  async send(userId, message) {
    await sendFrontend(this.spindle, userId, message);
  }
  async buildState(userId) {
    const [settings, permissions] = await Promise.all([
      this.settingsService.load(userId),
      getPermissionState(this.spindle).catch((error) => {
        this.recordRuntimeError("Permission lookup failed", error);
        return { chats: false, chat_mutation: false, generation: false, app_manipulation: false };
      })
    ]);
    const presets = await this.presetService.loadAll(userId);
    const activePreset = await this.presetService.resolve(userId, settings.activePresetId);
    const active = permissions.chats ? await getActiveChat(this.spindle, userId).catch((error) => {
      this.recordRuntimeError("Active chat lookup failed", error);
      return { chat: { id: null, name: "Active chat unavailable" }, messages: [] };
    }) : { chat: { id: null, name: "Chat permission missing" }, messages: [] };
    const activeChat = {
      id: active.chat.id,
      name: activeChatName(active.chat.id, active.chat.name)
    };
    if (activeChat.id) this.rememberUser(userId, activeChat.id);
    const connections = await this.generationService.listConnections(userId, permissions).catch((error) => {
      this.recordRuntimeError("Connection profile lookup failed", error);
      return [];
    });
    const [latestTracker, messageTrackers] = await Promise.all([
      this.trackerService.getLatest(userId, activeChat.id).catch((error) => {
        this.recordRuntimeError("Latest tracker lookup failed", error);
        return null;
      }),
      this.trackerService.listForChat(userId, activeChat.id).catch((error) => {
        this.recordRuntimeError("Message tracker lookup failed", error);
        return [];
      })
    ]);
    const baseGenerationStatus = this.generationService.getStatus();
    const disabledReason = this.generationService.getDisabledReason({
      settings,
      permissions,
      activeChatId: activeChat.id,
      activePreset,
      connections
    }) ?? (activeChat.id && !active.messages.some(isAssistantMessage) ? "No assistant message is available to track." : void 0);
    const generation = {
      ...baseGenerationStatus,
      disabledReason
    };
    let isStale = false;
    if (latestTracker && active.messages && active.messages.length > 0) {
      const trackedMsgIndex = active.messages.findIndex((m) => m.id === latestTracker.messageId);
      if (trackedMsgIndex === -1) {
        isStale = true;
      } else if (trackedMsgIndex < active.messages.length - 1) {
        isStale = true;
      }
    }
    const diagnostics = {
      ...this.diagnostics,
      backendReady: true,
      lastParserError: this.diagnostics.lastParserError,
      lastGenerationError: this.diagnostics.lastGenerationError,
      storageWarning: this.diagnostics.storageWarning,
      lastRenderStatus: isStale ? "Current Loom state is Stale (new user or assistant messages have been added)." : this.diagnostics.lastRenderStatus
    };
    const simulationNote = getSimulationMilestoneStatus();
    const entityNote = getEntityCaptureMilestoneStatus();
    const companionNote = getCompanionMilestoneStatus();
    const injectionNote = describeInjectionStatus(settings, permissions);
    diagnostics.renderLimitation = [
      this.diagnostics.renderLimitation,
      injectionNote,
      simulationNote,
      entityNote,
      companionNote
    ].filter(Boolean).join(" ");
    return {
      backendReady: true,
      settings,
      permissions,
      presets,
      activePreset,
      activeChat,
      connections,
      latestTracker,
      messageTrackers,
      generation,
      diagnostics
    };
  }
  async handleMessage(userId, message) {
    try {
      this.rememberUser(userId, messageChatId(message));
      if (message.type === "ready" || message.type === "refresh_state") {
        await this.send(userId, { type: "state", state: await this.buildState(userId) });
        return;
      }
      if (message.type === "reset_storage") {
        await Promise.all([
          this.settingsService.reset(userId),
          this.presetService.reset(userId),
          this.trackerService.reset(userId)
        ]);
        this.recordStorageWarning("State of the Loom storage was reset to defaults.");
        const state = await this.buildState(userId);
        await this.send(userId, { type: "storage_reset", state });
        await this.send(userId, { type: "toast", level: "success", message: "State of the Loom storage was reset." });
        return;
      }
      if (message.type === "save_settings") {
        const settings = await this.settingsService.save(userId, message.settings);
        const active = await getActiveChat(this.spindle, userId).catch(() => null);
        const activeChatId = active?.chat?.id;
        if (activeChatId && settings.trackerHistoryLimit > 0) {
          await this.trackerService.pruneChatHistory(userId, activeChatId, settings.trackerHistoryLimit);
        }
        await this.send(userId, { type: "settings_saved", settings });
        await this.send(userId, { type: "state", state: await this.buildState(userId) });
        return;
      }
      if (message.type === "select_preset") {
        const settings = await this.settingsService.save(userId, { activePresetId: message.presetId });
        const active = await getActiveChat(this.spindle, userId).catch(() => null);
        const activeChatId = active?.chat?.id;
        if (activeChatId && settings.trackerHistoryLimit > 0) {
          await this.trackerService.pruneChatHistory(userId, activeChatId, settings.trackerHistoryLimit);
        }
        await this.send(userId, { type: "settings_saved", settings });
        await this.send(userId, { type: "state", state: await this.buildState(userId) });
        return;
      }
      if (message.type === "generate_tracker") {
        await this.generateTrackerForUser(userId, message.chatId, message.messageId);
        return;
      }
      if (message.type === "cancel_generation") {
        const cancelled = this.generationService.cancel(userId);
        if (cancelled) {
          await this.send(userId, { type: "toast", level: "info", message: "Generation cancelled." });
        } else {
          this.generationService.clearStuckState();
          await this.send(userId, { type: "toast", level: "info", message: "Stuck generation state cleared." });
        }
        const state = await this.buildState(userId);
        await this.send(userId, { type: "state", state });
        return;
      }
      if (message.type === "edit_tracker") {
        await this.saveManualTracker(userId, message.tracker);
        return;
      }
      if (message.type === "delete_tracker") {
        await this.trackerService.delete(userId, message.chatId, message.messageId);
        await this.send(userId, { type: "tracker_deleted", state: await this.buildState(userId) });
        return;
      }
      if (message.type === "hide_tracker") {
        const tracker = await this.trackerService.setHidden(userId, message.chatId, message.messageId, message.hidden);
        const state = await this.buildState(userId);
        if (tracker) await this.send(userId, { type: "tracker_updated", tracker, state });
        else await this.send(userId, { type: "tracker_error", message: "Tracker was not found.", state });
        return;
      }
      if (message.type === "export_diagnostics") {
        await this.send(userId, { type: "diagnostics", diagnostics: this.diagnostics });
        return;
      }
      if (message.type === "save_preset") {
        await this.presetService.save(userId, message.preset);
        const state = await this.buildState(userId);
        await this.send(userId, { type: "state", state });
        await this.send(userId, { type: "toast", level: "success", message: `Template '${message.preset.name}' saved.` });
        return;
      }
      if (message.type === "delete_preset") {
        await this.presetService.delete(userId, message.presetId);
        const state = await this.buildState(userId);
        await this.send(userId, { type: "state", state });
        await this.send(userId, { type: "toast", level: "success", message: "Template deleted." });
        return;
      }
      if (message.type === "reset_presets") {
        await this.presetService.reset(userId);
        const state = await this.buildState(userId);
        await this.send(userId, { type: "state", state });
        await this.send(userId, { type: "toast", level: "success", message: "Custom templates reset to defaults." });
        return;
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      this.diagnostics = { ...this.diagnostics, lastError: text };
      await this.send(userId, { type: "error", message: text });
    }
  }
  async generateTrackerForUser(userId, chatId, messageId, targetOverride) {
    const state = await this.buildState(userId);
    const target = targetOverride ?? await this.generationService.findLatestAssistantTarget(userId, chatId, messageId);
    if (state.generation.disabledReason && state.generation.disabledReason !== "No assistant message is available to track.") {
      await this.send(userId, { type: "tracker_error", message: state.generation.disabledReason, state });
      return;
    }
    if (!target) {
      const latestState = await this.buildState(userId);
      await this.send(userId, { type: "tracker_error", message: "No assistant message is available to track.", state: latestState });
      return;
    }
    const settings = state.settings;
    const preset = state.activePreset;
    const passive = preset.mode !== "sidecar_generate" ? this.generationService.tryPassiveExtract({ preset, settings, chatId: target.chatId, message: target.message }) : null;
    if (!passive && !state.permissions.generation) {
      await this.send(userId, {
        type: "tracker_error",
        message: "Missing generation permission; no passive tracker block was found in the assistant message.",
        state: await this.buildState(userId)
      });
      return;
    }
    if (!passive && !settings.useDefaultConnectionFallback && !settings.sidecarConnectionId) {
      await this.send(userId, {
        type: "tracker_error",
        message: "No sidecar connection profile selected.",
        state: await this.buildState(userId)
      });
      return;
    }
    const recentTrackers = await this.trackerService.listForChat(userId, target.chatId);
    const contextLimit = settings.trackerHistoryLimit > 0 ? settings.trackerHistoryLimit : 5;
    const previousSummaries = recentTrackers.slice(1, contextLimit).map((t) => `${t.generatedAt}: ${t.compactSummary}`);
    const result = passive ?? await this.generationService.generateSidecar({
      userId,
      settings,
      preset,
      previousTracker: state.latestTracker,
      previousSummaries,
      chatId: target.chatId,
      message: target.message,
      recentContext: target.recentContext,
      onProgress: async () => {
        try {
          const statePatch = await this.buildState(userId);
          await this.send(userId, { type: "state", state: statePatch });
        } catch {
        }
      }
    });
    await this.trackerService.save(userId, result.tracker, settings.trackerHistoryLimit);
    await this.generationService.stripPassiveBlockIfAllowed({
      permissions: state.permissions,
      settings,
      userId,
      chatId: target.chatId,
      messageId: target.message.id,
      cleanedContent: result.cleanedContent
    });
    this.diagnostics = { ...this.diagnostics, lastParserError: void 0, lastGenerationError: void 0 };
    await this.send(userId, { type: "tracker_generated", tracker: result.tracker, state: await this.buildState(userId) });
  }
  async saveManualTracker(userId, tracker) {
    const preset = await this.presetService.resolve(userId, tracker.presetId);
    const validation = validateAgainstSchema(tracker.data, preset.schemaJson);
    const updated = {
      ...tracker,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      source: "manual_edit",
      validation,
      compactSummary: makeCompactSummary(tracker.data)
    };
    await this.trackerService.save(userId, updated);
    await this.send(userId, { type: "tracker_updated", tracker: updated, state: await this.buildState(userId) });
  }
  async handleGenerationEnded(payload) {
    try {
      if (!isRecord2(payload)) return;
      const source = payload.source ?? payload.extensionId ?? payload.extension_id;
      const generationType = payload.generationType ?? payload.generation_type;
      if (source === "state_of_the_loom" || generationType === "quiet") return;
      const chatId = this.payloadString(payload.chatId ?? payload.chat_id);
      const messageId = this.payloadString(payload.messageId ?? payload.message_id ?? payload.targetMessageId ?? payload.target_message_id) ?? void 0;
      const content = this.payloadString(payload.content) ?? void 0;
      const userId = this.resolveUserForEvent(payload, chatId);
      if (!userId) {
        if (!this.reportedUnknownGenerationUser) {
          this.reportedUnknownGenerationUser = true;
          this.diagnostics = {
            ...this.diagnostics,
            lastGenerationError: "Skipped auto-generation because no frontend user is known yet. Open the Loom drawer once, then refresh."
          };
        }
        return;
      }
      this.rememberUser(userId, chatId);
      const settings = await this.settingsService.load(userId);
      if (!settings.enabled || !settings.autoGenerate) return;
      const state = await this.buildState(userId);
      if (!state.permissions.chats) return;
      try {
        const target = chatId ? await this.generationService.findPayloadTarget({ userId, chatId, messageId, content }) : null;
        await this.generateTrackerForUser(userId, chatId ?? state.activeChat.id, messageId, target);
      } catch (error) {
        this.diagnostics = {
          ...this.diagnostics,
          lastGenerationError: error instanceof Error ? error.message : String(error)
        };
      }
    } catch (error) {
      this.recordRuntimeError("Generation event handling failed", error);
    }
  }
  payloadString(value) {
    return typeof value === "string" && value.trim() ? value : null;
  }
  resolveUserForEvent(payload, chatId) {
    const payloadUserId = this.payloadString(payload.userId ?? payload.user_id);
    if (payloadUserId && payloadUserId !== "default") return payloadUserId;
    if (chatId) {
      const chatUser = this.chatUsers.get(chatId);
      if (chatUser && chatUser !== "default") return chatUser;
    }
    const concreteUsers = [...this.knownUsers].filter((candidate) => candidate && candidate !== "default");
    if (concreteUsers.length === 1) return concreteUsers[0];
    if (this.lastFrontendUserId && this.lastFrontendUserId !== "default") return this.lastFrontendUserId;
    return null;
  }
};
var backend = new StateOfTheLoomBackend(getGlobalSpindle());
backend.setup();
