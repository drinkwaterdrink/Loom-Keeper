// src/shared/defaults.ts
var LOOM_SCHEMA_VERSION = "1";
var SLIM_SCENE_PRESET_ID = "slim_scene_loom";
var now = "2026-01-01T00:00:00.000Z";
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
var chronoscopeOccultLedgerPreset = {
  id: "chronoscope_occult_ledger",
  name: "Chronoscope Occult Ledger",
  version: "1.0.12",
  description: "A premium, highly-styled Gothic/Occult ledger with custom CSS, visual progress bars, and flexible tables.",
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
      dangerLevel: { type: "integer", default: 50 },
      aetherSanity: { type: "integer", default: 80 },
      activeOmen: { type: "string", default: "" },
      whispers: { type: "array", maxItems: 4, default: [], items: { type: "string" } },
      codexEntries: {
        type: "array",
        maxItems: 4,
        default: [],
        items: {
          type: "object",
          properties: {
            subject: { type: "string", default: "" },
            notes: { type: "string", default: "" },
            threat: { type: "string", default: "" }
          }
        }
      }
    }
  },
  htmlTemplate: [
    '<div class="sotl-chronoscope sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
    "  <style>",
    "    .sotl-chronoscope {",
    "      font-family: 'Outfit', 'Inter', sans-serif;",
    "      background: linear-gradient(135deg, rgba(26, 15, 36, 0.95) 0%, rgba(12, 10, 20, 0.98) 100%);",
    "      border: 1px solid rgba(168, 85, 247, 0.4);",
    "      border-radius: 12px;",
    "      padding: 18px;",
    "      color: #e9d5ff;",
    "      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(168, 85, 247, 0.1);",
    "    }",
    "    .sotl-ledger-header {",
    "      display: flex;",
    "      justify-content: space-between;",
    "      align-items: center;",
    "      border-bottom: 2px solid rgba(168, 85, 247, 0.25);",
    "      padding-bottom: 8px;",
    "      margin-bottom: 12px;",
    "    }",
    "    .sotl-ledger-title-group h3 {",
    "      font-size: 16px;",
    "      font-weight: 700;",
    "      color: #f3e8ff;",
    "      margin: 0;",
    "      letter-spacing: 0.5px;",
    "      text-shadow: 0 0 8px rgba(168, 85, 247, 0.4);",
    "    }",
    "    .sotl-ledger-subtitle {",
    "      font-size: 9px;",
    "      text-transform: uppercase;",
    "      color: #c084fc;",
    "      letter-spacing: 1.5px;",
    "      margin-top: 2px;",
    "    }",
    "    .sotl-ledger-mood-badge {",
    "      background: rgba(168, 85, 247, 0.2);",
    "      border: 1px solid rgba(168, 85, 247, 0.5);",
    "      color: #f3e8ff;",
    "      padding: 3px 8px;",
    "      border-radius: 9999px;",
    "      font-size: 11px;",
    "      font-weight: 500;",
    "    }",
    "    .sotl-ledger-stats-table {",
    "      width: 100%;",
    "      border-collapse: collapse;",
    "      margin-bottom: 12px;",
    "    }",
    "    .sotl-ledger-stats-table td {",
    "      padding: 6px;",
    "      vertical-align: middle;",
    "    }",
    "    .sotl-ledger-label {",
    "      font-size: 10px;",
    "      text-transform: uppercase;",
    "      color: #a78bfa;",
    "      letter-spacing: 0.5px;",
    "      width: 30%;",
    "    }",
    "    .sotl-ledger-value {",
    "      font-size: 12px;",
    "      color: #f3e8ff;",
    "      font-weight: 500;",
    "    }",
    "    .sotl-ledger-bar-container {",
    "      background: rgba(255, 255, 255, 0.05);",
    "      border-radius: 4px;",
    "      height: 8px;",
    "      overflow: hidden;",
    "      border: 1px solid rgba(168, 85, 247, 0.2);",
    "      position: relative;",
    "    }",
    "    .sotl-ledger-bar-fill-danger {",
    "      background: linear-gradient(90deg, #ef4444, #f43f5e);",
    "      height: 100%;",
    "      box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);",
    "    }",
    "    .sotl-ledger-bar-fill-sanity {",
    "      background: linear-gradient(90deg, #3b82f6, #06b6d4);",
    "      height: 100%;",
    "      box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);",
    "    }",
    "    .sotl-ledger-delta-box {",
    "      background: rgba(0, 0, 0, 0.2);",
    "      border-left: 3px solid #a855f7;",
    "      padding: 10px;",
    "      border-radius: 0 8px 8px 0;",
    "      margin-bottom: 12px;",
    "      font-size: 12px;",
    "      line-height: 1.5;",
    "      color: #f3e8ff;",
    "    }",
    "    .sotl-ledger-whispers-list {",
    "      margin: 0;",
    "      padding-left: 18px;",
    "      font-size: 11.5px;",
    "      color: #d8b4fe;",
    "      line-height: 1.5;",
    "    }",
    "    .sotl-ledger-codex-grid {",
    "      display: grid;",
    "      grid-template-columns: 1fr 1fr;",
    "      gap: 8px;",
    "      margin-top: 6px;",
    "    }",
    "    .sotl-ledger-codex-card {",
    "      background: rgba(168, 85, 247, 0.05);",
    "      border: 1px solid rgba(168, 85, 247, 0.2);",
    "      border-radius: 6px;",
    "      padding: 8px;",
    "    }",
    "    .sotl-ledger-codex-subject {",
    "      font-size: 11px;",
    "      font-weight: 700;",
    "      color: #f3e8ff;",
    "      margin-bottom: 2px;",
    "    }",
    "    .sotl-ledger-codex-notes {",
    "      font-size: 10.5px;",
    "      color: #c084fc;",
    "      margin-bottom: 4px;",
    "    }",
    "    .sotl-ledger-codex-threat {",
    "      font-size: 9px;",
    "      text-transform: uppercase;",
    "      font-weight: bold;",
    "      color: #ef4444;",
    "    }",
    "  </style>",
    '  <header class="sotl-ledger-header">',
    '    <div class="sotl-ledger-title-group">',
    '      <div class="sotl-ledger-subtitle">Chronoscope Occult Ledger</div>',
    "      <h3>{{sceneTitle}}</h3>",
    "    </div>",
    '    <span class="sotl-ledger-mood-badge">\u{1F52E} {{mood}}</span>',
    "  </header>",
    '  <table class="sotl-ledger-stats-table">',
    "    <tr>",
    '      <td class="sotl-ledger-label">\u{1F4CD} Location</td>',
    '      <td class="sotl-ledger-value" colspan="2">{{location}}</td>',
    "    </tr>",
    "    <tr>",
    '      <td class="sotl-ledger-label">\u23F3 Epoch / Time</td>',
    '      <td class="sotl-ledger-value" colspan="2">{{time}}</td>',
    "    </tr>",
    "    <tr>",
    '      <td class="sotl-ledger-label">\u{1F525} Danger</td>',
    '      <td style="width: 50%;">',
    '        <div class="sotl-ledger-bar-container">',
    '          <div class="sotl-ledger-bar-fill-danger" style="width: {{dangerLevel}}%;"></div>',
    "        </div>",
    "      </td>",
    '      <td class="sotl-ledger-value" style="text-align: right; width: 20%;">{{dangerLevel}}%</td>',
    "    </tr>",
    "    <tr>",
    '      <td class="sotl-ledger-label">\u{1F300} Sanity</td>',
    "      <td>",
    '        <div class="sotl-ledger-bar-container">',
    '          <div class="sotl-ledger-bar-fill-sanity" style="width: {{aetherSanity}}%;"></div>',
    "        </div>",
    "      </td>",
    '      <td class="sotl-ledger-value" style="text-align: right;">{{aetherSanity}}%</td>',
    "    </tr>",
    "    {{#if activeOmen}}",
    "    <tr>",
    '      <td class="sotl-ledger-label">\u{1F480} Omen</td>',
    '      <td class="sotl-ledger-value" colspan="2" style="color: #f43f5e; font-weight: 600;">{{activeOmen}}</td>',
    "    </tr>",
    "    {{/if}}",
    "  </table>",
    '  <div class="sotl-ledger-delta-box">{{delta}}</div>',
    "  {{#if whispers}}",
    '  <details class="sotl-card-details" open>',
    '    <summary style="font-size: 11px; text-transform: uppercase; color: #a78bfa; letter-spacing: 0.5px;">Whispers of the Loom</summary>',
    '    <ul class="sotl-ledger-whispers-list">',
    "      {{#each whispers}}<li>{{.}}</li>{{/each}}",
    "    </ul>",
    "  </details>",
    "  {{/if}}",
    "  {{#if codexEntries}}",
    '  <details class="sotl-card-details" open>',
    '    <summary style="font-size: 11px; text-transform: uppercase; color: #a78bfa; letter-spacing: 0.5px;">Active Codex Entities</summary>',
    '    <div class="sotl-ledger-codex-grid">',
    "      {{#each codexEntries}}",
    '      <div class="sotl-ledger-codex-card">',
    '        <div class="sotl-ledger-codex-subject">\u{1F464} {{subject}}</div>',
    '        <div class="sotl-ledger-codex-notes">{{notes}}</div>',
    '        {{#if threat}}<div class="sotl-ledger-codex-threat">\u26A0\uFE0F {{threat}}</div>{{/if}}',
    "      </div>",
    "      {{/each}}",
    "    </div>",
    "  </details>",
    "  {{/if}}",
    "</div>"
  ].join(""),
  promptInstructions: [
    "You are State of the Loom, tracking the Gothic Chronoscope Occult continuity ledger details.",
    "Return valid JSON only. Do not use markdown fences.",
    "Use the Chronoscope Occult Ledger schema exactly.",
    "Ensure you track the active location, time/epoch, mood, and delta.",
    "Compute dangerLevel (0 to 100) and aetherSanity (0 to 100) as whole integers reflecting current scene elements.",
    "Record whispers and active codex entry details if supernatural, cosmic, or threatening entities or facts are described."
  ].join("\n"),
  injectionTemplate: "[Chronoscope Occult Ledger]\n{{compactSummary}}",
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
    sceneTitle: "A flicker in the dark vault",
    location: "Catacomb Chamber VII",
    time: "Midnight (The Third Watch)",
    mood: "ominous and claustrophobic",
    delta: "The high torch extinguished with a sudden hiss, leaving only an eerie crimson purple static from the central sarcophagus.",
    dangerLevel: 85,
    aetherSanity: 45,
    activeOmen: "The Blood Moon rises behind the stained vault.",
    whispers: [
      "He who sleeps under the stone is dreaming of you.",
      "The static is growing louder by the minute."
    ],
    codexEntries: [
      {
        subject: "The Vault Keeper",
        notes: "A tall skeletal apparition wearing decayed velvet robes and a brass chronoscope lens.",
        threat: "High"
      }
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
  fullContinuityLedgerPreset,
  chronoscopeOccultLedgerPreset
];

// src/shared/renderer.ts
function safeObjectToString(val) {
  if (val === null || val === void 0) return "";
  if (typeof val !== "object") return String(val);
  if (Array.isArray(val)) return val.map(safeObjectToString).join(", ");
  const obj = val;
  const keys = ["text", "value", "label", "name", "title", "summary", "description"];
  for (const key of keys) {
    if (key in obj && obj[key] !== void 0 && obj[key] !== null && typeof obj[key] !== "object") {
      return String(obj[key]);
    }
  }
  try {
    return JSON.stringify(obj);
  } catch {
    return "[Object]";
  }
}
function escapeHtml(value) {
  return safeObjectToString(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function readPath(data, path) {
  if (path === ".") return data;
  let cleanPath = path;
  if (cleanPath.startsWith("this.")) {
    cleanPath = cleanPath.slice(5);
  } else if (cleanPath === "this") {
    return data;
  }
  return cleanPath.split(".").reduce((current, part) => {
    if (!current || typeof current !== "object") return "";
    return current[part] ?? "";
  }, data);
}
function truthy(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}
function renderTemplate(template, data, missingFields = /* @__PURE__ */ new Set()) {
  let output = template;
  const sectionPattern = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
  output = output.replace(sectionPattern, (_match, path, inner) => {
    return truthy(readPath(data, path)) ? renderTemplate(inner, data, missingFields) : "";
  });
  const eachPattern = /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g;
  output = output.replace(eachPattern, (_match, path, inner) => {
    const value = readPath(data, path);
    if (value === "" || value === void 0 || value === null) missingFields.add(path);
    if (!Array.isArray(value) || value.length === 0) return '<p class="sotl-empty">None</p>';
    return value.map((item) => {
      const scope = item && typeof item === "object" ? item : { ".": item };
      return renderTemplate(inner, { ...data, ...scope, ".": item }, missingFields);
    }).join("");
  });
  return output.replace(/{{\s*([\w.]+|\.)\s*}}/g, (_match, path) => {
    const value = readPath(data, path);
    if (value === "" || value === void 0 || value === null) missingFields.add(path);
    return escapeHtml(value);
  });
}
function sanitizeDomHtml(html) {
  if (typeof document === "undefined") return "";
  try {
    let sanitizeNode2 = function(node) {
      if (node.nodeType === Node.TEXT_NODE) return node;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        const tag = el.tagName.toLowerCase();
        if (!allowedTags.has(tag)) return null;
        const cleanEl = document.createElement(tag);
        for (let i = 0; i < el.attributes.length; i += 1) {
          const attr = el.attributes[i];
          const name = attr.name.toLowerCase();
          if (!allowedAttrs.has(name) && !name.startsWith("data-")) continue;
          const value = attr.value;
          const cleanVal = value.trim().toLowerCase();
          if (cleanVal.includes("javascript:") || cleanVal.includes("data:")) continue;
          cleanEl.setAttribute(name, value);
        }
        let child = el.firstChild;
        while (child) {
          const cleanChild = sanitizeNode2(child);
          if (cleanChild) cleanEl.appendChild(cleanChild);
          child = child.nextSibling;
        }
        return cleanEl;
      }
      return null;
    };
    var sanitizeNode = sanitizeNode2;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;
    const allowedTags = /* @__PURE__ */ new Set([
      "div",
      "section",
      "article",
      "header",
      "footer",
      "span",
      "p",
      "b",
      "strong",
      "i",
      "em",
      "small",
      "ul",
      "ol",
      "li",
      "dl",
      "dt",
      "dd",
      "details",
      "summary",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "br",
      "style",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "td",
      "th",
      "svg",
      "path",
      "line",
      "rect",
      "circle",
      "polygon",
      "ellipse",
      "g",
      "text",
      "defs",
      "lineargradient",
      "stop"
    ]);
    const allowedAttrs = /* @__PURE__ */ new Set([
      "class",
      "title",
      "aria-label",
      "role",
      "style",
      "viewbox",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
      "d",
      "x",
      "y",
      "width",
      "height",
      "x1",
      "y1",
      "x2",
      "y2",
      "cx",
      "cy",
      "r",
      "transform",
      "points",
      "opacity",
      "colspan",
      "rowspan",
      "cellspacing",
      "cellpadding",
      "border",
      "id",
      "offset",
      "stop-color",
      "stop-opacity",
      "gradientunits",
      "gradienttransform"
    ]);
    const cleanBody = document.createElement("body");
    let rootChild = body.firstChild;
    while (rootChild) {
      const cleanChild = sanitizeNode2(rootChild);
      if (cleanChild) cleanBody.appendChild(cleanChild);
      rootChild = rootChild.nextSibling;
    }
    return cleanBody.innerHTML;
  } catch (err) {
    console.error("DOM Parser sanitization failed:", err);
    return "";
  }
}
function getFallbackField(data, keys) {
  if (!data || typeof data !== "object") return void 0;
  for (const key of keys) {
    if (key in data) return data[key];
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(data)) {
      if (k.toLowerCase() === lowerKey) return data[k];
    }
  }
  return void 0;
}
function isCustomPreset(preset) {
  return !builtInPresets.some((p) => p.id === preset.id);
}
function isVisuallyEmptyHtml(html, missingFields) {
  if (!html.trim()) return true;
  if (typeof document === "undefined") return false;
  try {
    const template = document.createElement("template");
    template.innerHTML = html;
    const text = (template.content.textContent || "").replace(/\s+/g, "").trim();
    const hasVisualElement = Boolean(template.content.querySelector("svg,path,rect,circle,line,polygon,ellipse,table,td,th,hr"));
    return missingFields.length > 0 && !text && !hasVisualElement;
  } catch {
    return false;
  }
}
function renderValueBlock(value, depth = 0) {
  if (value === null || value === void 0 || value === "") return "";
  if (typeof value !== "object") return `<span>${escapeHtml(String(value))}</span>`;
  if (depth >= 3) return `<pre class="sotl-code">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
  if (Array.isArray(value)) {
    if (value.length === 0) return '<p class="sotl-empty">None</p>';
    const items = value.slice(0, 12).map((item) => {
      if (item && typeof item === "object") return `<li>${renderValueBlock(item, depth + 1)}</li>`;
      return `<li>${escapeHtml(String(item))}</li>`;
    }).join("");
    const more = value.length > 12 ? `<li>${escapeHtml(`+${value.length - 12} more`)}</li>` : "";
    return `<ul class="sotl-anchors-list">${items}${more}</ul>`;
  }
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== null && entryValue !== void 0 && entryValue !== "").slice(0, 16);
  if (entries.length === 0) return '<p class="sotl-empty">None</p>';
  return `<dl class="sotl-grid">${entries.map(([key, entryValue]) => `
    <div class="sotl-grid-item">
      <dt>${escapeHtml(key)}</dt>
      <dd>${renderValueBlock(entryValue, depth + 1)}</dd>
    </div>
  `).join("")}</dl>`;
}
function renderGenericSafeCard(tracker, preset, warningMessage) {
  const title = escapeHtml(String(getFallbackField(tracker.data, ["sceneTitle", "title", "name", "sceneName", "scene"]) || "Continuity State"));
  const mood = escapeHtml(String(getFallbackField(tracker.data, ["mood", "tone", "emotion", "scene_mood"]) || ""));
  const density = preset.renderOptions?.density || "compact";
  const theme = preset.renderOptions?.theme || "system";
  const warningHtml = warningMessage ? `
      <div class="sotl-pipeline-warning" style="margin-bottom: 8px; padding: 6px 10px; background: rgba(220,10,10,0.06); border: 1px solid rgba(220,10,10,0.15); border-radius: 4px; font-size: 11px; color: var(--lv-error-text, #bd2130);">
        <strong>Notice:</strong> ${escapeHtml(warningMessage)}
      </div>
    ` : "";
  const rows = [];
  const details = [];
  for (const [key, value] of Object.entries(tracker.data)) {
    if (key === "schemaVersion" || key === "schema_version") continue;
    if (["scenetitle", "title", "name", "mood", "tone", "emotion", "scenemood"].includes(key.toLowerCase())) continue;
    if (value === null || value === void 0 || value === "") continue;
    if (Array.isArray(value) || typeof value === "object") {
      details.push(`
        <details class="sotl-card-details" ${Array.isArray(value) ? "open" : ""}>
          <summary>${escapeHtml(key)}</summary>
          ${renderValueBlock(value)}
        </details>
      `);
      continue;
    }
    rows.push(`
      <div class="sotl-grid-item">
        <dt>${escapeHtml(key)}</dt>
        <dd>${escapeHtml(String(value))}</dd>
      </div>
    `);
  }
  const gridHtml = rows.length > 0 ? `<dl class="sotl-grid">${rows.join("")}</dl>` : "";
  return `
    <section class="sotl-card sotl-density-${density} sotl-theme-${theme}" data-sotl-card="true">
      <header class="sotl-card__head">
        <div class="sotl-card__header-main">
          <div class="sotl-card__eyebrow">State of the Loom (Safe Renderer)</div>
          <h3 class="sotl-card__title">${title}</h3>
        </div>
        ${mood ? `<span class="sotl-pill sotl-pill--mood">${mood}</span>` : ""}
      </header>
      ${warningHtml}
      ${gridHtml}
      ${details.join("")}
    </section>
  `;
}
function renderTrackerHtmlDetailed(tracker, preset, useSafeRenderer = false) {
  if (useSafeRenderer) {
    return {
      html: renderGenericSafeCard(tracker, preset, "Safe generic renderer active."),
      success: true,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      warning: "Safe generic renderer active.",
      missingFields: []
    };
  }
  const data = {
    ...tracker.data,
    data: tracker.data,
    density: preset.renderOptions.density,
    theme: preset.renderOptions.theme,
    compactSummary: tracker.compactSummary
  };
  try {
    const missingFields = /* @__PURE__ */ new Set();
    const rawHtml = renderTemplate(preset.htmlTemplate, data, missingFields);
    const missing = [...missingFields];
    if (isCustomPreset(preset)) {
      const sanitized = sanitizeDomHtml(rawHtml);
      if (!sanitized || sanitized.trim() === "") {
        throw new Error("Purified HTML is empty. The template might have invalid/unsupported tags or failed sanitization.");
      }
      if (isVisuallyEmptyHtml(sanitized, missing)) {
        throw new Error(`Custom template rendered no visible tracker content. Missing fields: ${missing.join(", ") || "unknown"}.`);
      }
      return {
        html: sanitized,
        success: true,
        fallbackUsed: false,
        sanitizerRemovedContent: sanitized.trim() !== rawHtml.trim(),
        warning: missing.length > 0 ? `Missing template fields: ${missing.join(", ")}` : void 0,
        missingFields: missing
      };
    }
    return {
      html: rawHtml,
      success: true,
      fallbackUsed: false,
      sanitizerRemovedContent: false,
      warning: missing.length > 0 ? `Missing template fields: ${missing.join(", ")}` : void 0,
      missingFields: missing
    };
  } catch (error) {
    console.error("Loom template rendering failed, falling back to safe card:", error);
    const message = `Custom template failed: ${error instanceof Error ? error.message : String(error)}`;
    return {
      html: renderGenericSafeCard(tracker, preset, message),
      success: false,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      warning: message,
      error: error instanceof Error ? error.message : String(error),
      missingFields: []
    };
  }
}
function renderTrackerHtml(tracker, preset, useSafeRenderer = false) {
  return renderTrackerHtmlDetailed(tracker, preset, useSafeRenderer).html;
}

// src/frontend/ui.ts
function escapeHtml2(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function badge(label, ok) {
  return `<span class="sotl-chip" data-ok="${ok ? "true" : "false"}">${escapeHtml2(label)}</span>`;
}
function button(label, action, options = {}) {
  const disabled = options.disabled ? " disabled" : "";
  const primary = options.primary ? ' data-primary="true"' : "";
  const title = options.title ? ` title="${escapeHtml2(options.title)}"` : "";
  const style = options.style ? ` style="${escapeHtml2(options.style)}"` : "";
  return `<button class="sotl-button" type="button" data-sotl-action="${escapeHtml2(action)}"${primary}${disabled}${title}${style}>${escapeHtml2(label)}</button>`;
}
function iconButton(label, action, id) {
  return `<button class="sotl-icon-button" type="button" data-sotl-action="${escapeHtml2(action)}" data-sotl-message-id="${escapeHtml2(id)}" title="${escapeHtml2(label)}" aria-label="${escapeHtml2(label)}">${escapeHtml2(label.slice(0, 1))}</button>`;
}

// src/frontend/rendering.ts
function resolvePresetForTracker(state2, tracker) {
  const preset = state2.presets.find((candidate) => candidate.id === tracker.presetId);
  if (preset) return { preset, missing: false };
  return { preset: state2.activePreset, missing: true };
}
function renderTrackerForState(tracker, state2, useSafeRenderer = Boolean(state2.settings.useSafeRenderer)) {
  const { preset, missing } = resolvePresetForTracker(state2, tracker);
  if (missing) {
    const warning = `Preset '${tracker.presetId}' is not available. Showing tracker data with the safe generic renderer.`;
    return {
      html: renderGenericSafeCard(tracker, preset, warning),
      success: false,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      warning,
      error: warning,
      missingFields: []
    };
  }
  return renderTrackerHtmlDetailed(tracker, preset, useSafeRenderer);
}
function compactValue(value) {
  if (value === null || value === void 0 || value === "") return "";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) {
    return value.slice(0, 3).map(compactValue).filter(Boolean).join(", ");
  }
  const record = value;
  for (const key of ["name", "title", "label", "summary", "description", "value", "text"]) {
    if (record[key] !== void 0 && record[key] !== null && typeof record[key] !== "object") return String(record[key]);
  }
  return Object.entries(record).filter(([, entryValue]) => entryValue !== null && entryValue !== void 0 && entryValue !== "").slice(0, 3).map(([key, entryValue]) => `${key}: ${compactValue(entryValue)}`).filter(Boolean).join("; ");
}
function collectCompactFields(data) {
  const skip = /* @__PURE__ */ new Set(["schemaversion", "schema_version", "scenetitle", "title", "name", "scene", "scenename"]);
  return Object.entries(data).filter(([key, value]) => !skip.has(key.toLowerCase()) && value !== null && value !== void 0 && value !== "").map(([key, value]) => ({ key, value: compactValue(value) })).filter((entry) => entry.value).slice(0, 5);
}
function renderCompactTrackerForState(tracker, state2) {
  const { preset, missing } = resolvePresetForTracker(state2, tracker);
  const title = String(getFallbackField(tracker.data, ["sceneTitle", "title", "name", "sceneName", "scene"]) || tracker.compactSummary || "Continuity State");
  const fields = collectCompactFields(tracker.data);
  const summary = tracker.compactSummary && tracker.compactSummary !== title ? tracker.compactSummary : fields[0]?.value || "No compact summary recorded.";
  const chips = fields.slice(1, 5).map((field) => {
    return `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">${escapeHtml2(field.key)}: ${escapeHtml2(field.value)}</span>`;
  }).join("");
  return [
    `    <p class="sotl-chat-panel__scene">${escapeHtml2(title)}</p>`,
    `    <div class="sotl-chat-panel__meta">Preset: ${escapeHtml2(preset.name)}${missing ? " (missing original preset)" : ""}</div>`,
    `    <p class="sotl-chat-panel__desc">${escapeHtml2(summary)}</p>`,
    chips ? `    <div class="sotl-cast-grid" style="margin-top: 4px;">${chips}</div>` : "",
    tracker.validation.ok ? "" : '    <p class="sotl-chat-panel__desc sotl-warning">Tracker JSON has validation warnings. Open the drawer for details.</p>'
  ].filter(Boolean).join("\n");
}

// src/shared/validation.ts
function validateTemplateSafety(template) {
  const warnings = [];
  const lower = template.toLowerCase();
  if (lower.includes("<script")) {
    warnings.push("Script tags (<script>) are blocked for safety.");
  }
  if (lower.includes("<iframe")) {
    warnings.push("Iframe tags (<iframe>) are blocked for safety.");
  }
  if (lower.includes("<object") || lower.includes("<embed")) {
    warnings.push("Object and embed tags are blocked for safety.");
  }
  if (/\bon[a-zA-Z]+\s*=/i.test(template)) {
    warnings.push("Inline event handlers (e.g. onclick=) are blocked for safety.");
  }
  if (lower.includes("javascript:") || lower.includes("data:")) {
    warnings.push("javascript: and data: URIs inside attributes are blocked for safety.");
  }
  const allowedTags = /* @__PURE__ */ new Set([
    "div",
    "section",
    "article",
    "header",
    "footer",
    "span",
    "p",
    "b",
    "strong",
    "i",
    "em",
    "small",
    "ul",
    "ol",
    "li",
    "dl",
    "dt",
    "dd",
    "details",
    "summary",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "br",
    "style",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "td",
    "th",
    "svg",
    "path",
    "line",
    "rect",
    "circle",
    "polygon",
    "ellipse",
    "g",
    "text",
    "defs",
    "lineargradient",
    "stop"
  ]);
  const tagRegex = /<([a-zA-Z0-9:-]+)/g;
  let match;
  const foundTags = /* @__PURE__ */ new Set();
  while ((match = tagRegex.exec(template)) !== null) {
    foundTags.add(match[1].toLowerCase());
  }
  for (const tag of foundTags) {
    if (tag !== "if" && tag !== "each" && !tag.startsWith("/") && !allowedTags.has(tag)) {
      warnings.push(`Tag <${tag}> is not in the allowed list of safe tags.`);
    }
  }
  return warnings;
}
function checkPresetReadiness(preset) {
  const reasons = [];
  let schemaValid = false;
  let schemaError;
  if (!preset.schemaJson || typeof preset.schemaJson !== "object") {
    schemaError = "Schema JSON is missing or not an object.";
  } else {
    try {
      JSON.stringify(preset.schemaJson);
      schemaValid = true;
    } catch (err) {
      schemaError = `Schema JSON error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  if (!schemaValid) reasons.push("Invalid Schema JSON");
  let sampleDataValid = false;
  let sampleDataError;
  if (!preset.sampleData || typeof preset.sampleData !== "object") {
    sampleDataError = "Sample data is missing or not an object.";
  } else {
    try {
      JSON.stringify(preset.sampleData);
      sampleDataValid = true;
    } catch (err) {
      sampleDataError = `Sample data JSON error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  if (!sampleDataValid) reasons.push("Invalid Sample Data");
  const warnings = validateTemplateSafety(preset.htmlTemplate || "");
  const templateSafe = warnings.length === 0;
  if (!templateSafe) reasons.push("Unsafe HTML template elements found");
  const promptPresent = Boolean(preset.promptInstructions && preset.promptInstructions.trim());
  if (!promptPresent) reasons.push("Prompt instructions are missing");
  const ready = schemaValid && sampleDataValid && promptPresent;
  return {
    schemaValid,
    schemaError,
    sampleDataValid,
    sampleDataError,
    templateSafe,
    templateWarnings: warnings,
    promptPresent,
    ready,
    reasons
  };
}

// src/frontend/presetEditor.ts
var editingPreset = null;
var lastPreviewHtml = "";
var lastPreviewReport = null;
var lastSanitizerWarnings = [];
var lastJsonParseError = null;
var lastImportStatus = null;
function clearImportStatus() {
  lastImportStatus = null;
}
function setImportStatus(status) {
  lastImportStatus = status;
}
function selectPresetForEditing(preset) {
  editingPreset = JSON.parse(JSON.stringify(preset));
  lastPreviewHtml = "";
  lastPreviewReport = null;
  lastSanitizerWarnings = [];
  lastJsonParseError = null;
}
function updateEditingField(field, value) {
  if (!editingPreset) return;
  if (field === "name") editingPreset.name = value;
  if (field === "description") editingPreset.description = value;
  if (field === "mode") editingPreset.mode = value;
  if (field === "defaultPlacement") editingPreset.defaultPlacement = value;
  if (field === "maxInjectionTokens") editingPreset.maxInjectionTokens = parseInt(value, 10) || 150;
  if (field === "htmlTemplate") {
    editingPreset.htmlTemplate = value;
    lastSanitizerWarnings = validateTemplateSafety(value);
  }
  if (field === "promptInstructions") editingPreset.promptInstructions = value;
  if (field === "injectionTemplate") editingPreset.injectionTemplate = value;
  if (field === "schemaJson") {
    try {
      editingPreset.schemaJson = JSON.parse(value);
      lastJsonParseError = null;
    } catch (err) {
      lastJsonParseError = `Schema JSON error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  if (field === "sampleData") {
    try {
      editingPreset.sampleData = JSON.parse(value);
      lastJsonParseError = null;
    } catch (err) {
      lastJsonParseError = `Sample data JSON error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
function runPreview() {
  if (!editingPreset) return;
  try {
    lastSanitizerWarnings = validateTemplateSafety(editingPreset.htmlTemplate);
    const mockTracker = {
      version: editingPreset.version || "1.0.0",
      schemaVersion: "1",
      presetId: editingPreset.id,
      chatId: "preview-chat",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      source: "manual_edit",
      placement: editingPreset.defaultPlacement,
      data: editingPreset.sampleData || {},
      compactSummary: "Preview compact summary",
      validation: { ok: true, issues: [] }
    };
    lastPreviewReport = renderTrackerHtmlDetailed(mockTracker, editingPreset);
    lastPreviewHtml = lastPreviewReport.html;
    lastJsonParseError = null;
  } catch (err) {
    lastJsonParseError = `Preview failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}
function isPresetValid(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && typeof value.id === "string" && typeof value.name === "string" && typeof value.htmlTemplate === "string";
}
function renderPresetEditor(state2) {
  if (!editingPreset || !state2.presets.some((p) => p.id === editingPreset.id)) {
    const active = state2.presets.find((p) => p.id === state2.settings.activePresetId);
    editingPreset = active ? JSON.parse(JSON.stringify(active)) : state2.presets[0] ? JSON.parse(JSON.stringify(state2.presets[0])) : null;
  }
  if (!editingPreset) {
    return '<p class="sotl-note">No templates are available to edit.</p>';
  }
  const isBuiltIn = builtInPresets.some((p) => p.id === editingPreset.id);
  const presetsOptions = state2.presets.map((p) => {
    const selected = p.id === editingPreset.id ? " selected" : "";
    const isB = builtInPresets.some((bp) => bp.id === p.id);
    return `<option value="${escapeHtml2(p.id)}"${selected}>${escapeHtml2(p.name)}${isB ? " (Built-in)" : " (Custom)"}</option>`;
  }).join("");
  return [
    '<div class="sotl-fields" style="margin-top: 10px;">',
    '<label class="sotl-label">Template to edit/inspect',
    `  <select class="sotl-select" data-sotl-editor-field="selectedPresetId">${presetsOptions}</select>`,
    "</label>",
    isBuiltIn ? '<p class="sotl-note" style="color: var(--lv-accent, #3864d9);">\u2139\uFE0F Built-in templates are read-only. Click "Duplicate to Edit" to customize.</p>' : '<p class="sotl-note" style="color: var(--lv-success-text, #176b43);">\u270F\uFE0F You are editing a custom template.</p>',
    (() => {
      const readiness = checkPresetReadiness(editingPreset);
      const warningsList = readiness.templateWarnings.length > 0 ? `<div style="margin-top: 4px; padding: 4px 6px; border-radius: 4px; background: rgba(220,53,69,0.06); color: var(--lv-error-text,#bd2130); font-size: 10px;">\u26A0\uFE0F Unsafe elements: ${readiness.templateWarnings.map((w) => escapeHtml2(w)).join(", ")}</div>` : "";
      return [
        '<div class="sotl-panel" style="margin-top: 6px; padding: 10px; background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.45)); display: grid; gap: 4px; border: 1px dashed var(--lumiverse-border, rgba(80,88,100,0.2));">',
        '  <strong style="font-size: 11px; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">',
        readiness.ready ? '\u{1F7E2} <span style="color: var(--lv-success-text, #176b43);">Ready to Generate</span>' : '\u{1F534} <span style="color: var(--lv-error-text, #bd2130);">Not Ready to Generate</span>',
        "  </strong>",
        '  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; font-size: 11px;">',
        `    <div>${readiness.schemaValid ? "\u2705" : "\u274C"} <strong>Schema:</strong> ${readiness.schemaValid ? "Valid" : `<span style="color:var(--lv-error-text,#bd2130);">${escapeHtml2(readiness.schemaError || "Invalid")}</span>`}</div>`,
        `    <div>${readiness.sampleDataValid ? "\u2705" : "\u274C"} <strong>Sample Data:</strong> ${readiness.sampleDataValid ? "Valid" : `<span style="color:var(--lv-error-text,#bd2130);">${escapeHtml2(readiness.sampleDataError || "Invalid")}</span>`}</div>`,
        `    <div>${readiness.templateSafe ? "\u2705" : "\u26A0\uFE0F"} <strong>Safety:</strong> ${readiness.templateSafe ? "Safe" : "Unsafe elements"}</div>`,
        `    <div>${readiness.promptPresent ? "\u2705" : "\u274C"} <strong>Instructions:</strong> ${readiness.promptPresent ? "Present" : "Missing"}</div>`,
        "  </div>",
        warningsList,
        readiness.reasons.length > 0 ? `  <p style="margin: 2px 0 0; font-size: 10px; color: var(--lv-error-text, #bd2130);"><strong>Blockers:</strong> ${escapeHtml2(readiness.reasons.join(", "))}</p>` : "",
        "</div>"
      ].join("\n");
    })(),
    '<div class="sotl-actions" style="margin-top: 8px; margin-bottom: 12px;">',
    button("New Template", "editor-new", { primary: !isBuiltIn }),
    button("Duplicate to Edit", "editor-duplicate", { primary: isBuiltIn }),
    button("Save Template", "editor-save", { disabled: isBuiltIn, primary: !isBuiltIn, title: isBuiltIn ? "Built-in templates are read-only" : "Save edits" }),
    button("Delete Custom", "editor-delete", { disabled: isBuiltIn, title: isBuiltIn ? "Built-in templates cannot be deleted" : "Delete custom template" }),
    button("Reset Custom Templates", "editor-reset", { title: "Delete all custom templates" }),
    "</div>",
    // Collapsible Details Sections (All collapsed by default)
    '<details class="sotl-details" style="margin-top: 8px;"><summary>Metadata (Name, Description, Mode)</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    '  <label class="sotl-label">Template Name',
    `    <input class="sotl-input" type="text" data-sotl-editor-field="name" value="${escapeHtml2(editingPreset.name)}" ${isBuiltIn ? "disabled" : ""}>`,
    "  </label>",
    '  <label class="sotl-label">Description',
    `    <input class="sotl-input" type="text" data-sotl-editor-field="description" value="${escapeHtml2(editingPreset.description)}" ${isBuiltIn ? "disabled" : ""}>`,
    "  </label>",
    '  <label class="sotl-label">Mode',
    `    <select class="sotl-select" data-sotl-editor-field="mode" ${isBuiltIn ? "disabled" : ""}>`,
    `      <option value="hybrid"${editingPreset.mode === "hybrid" ? " selected" : ""}>Hybrid (passive extract + sidecar)</option>`,
    `      <option value="sidecar_generate"${editingPreset.mode === "sidecar_generate" ? " selected" : ""}>Sidecar generation only</option>`,
    `      <option value="passive_extract"${editingPreset.mode === "passive_extract" ? " selected" : ""}>Passive extraction only</option>`,
    "    </select>",
    "  </label>",
    '  <label class="sotl-label">Default Placement',
    `    <select class="sotl-select" data-sotl-editor-field="defaultPlacement" ${isBuiltIn ? "disabled" : ""}>`,
    `      <option value="top"${editingPreset.defaultPlacement === "top" ? " selected" : ""}>Top of message</option>`,
    `      <option value="bottom"${editingPreset.defaultPlacement === "bottom" ? " selected" : ""}>Bottom of message</option>`,
    "    </select>",
    "  </label>",
    '  <label class="sotl-label">Max Injection Tokens',
    `    <input class="sotl-input" type="number" data-sotl-editor-field="maxInjectionTokens" value="${editingPreset.maxInjectionTokens}" ${isBuiltIn ? "disabled" : ""}>`,
    "  </label>",
    "</div>",
    "</details>",
    '<details class="sotl-details" style="margin-top: 8px;"><summary>HTML Template</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="htmlTemplate" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(editingPreset.htmlTemplate)}</textarea>`,
    "</div>",
    "</details>",
    '<details class="sotl-details" style="margin-top: 8px;"><summary>Prompt Instructions</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="promptInstructions" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(editingPreset.promptInstructions)}</textarea>`,
    "</div>",
    "</details>",
    '<details class="sotl-details" style="margin-top: 8px;"><summary>Schema JSON</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="schemaJson" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(JSON.stringify(editingPreset.schemaJson, null, 2))}</textarea>`,
    "</div>",
    "</details>",
    '<details class="sotl-details" style="margin-top: 8px;"><summary>Sample Data JSON</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="sampleData" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(JSON.stringify(editingPreset.sampleData, null, 2))}</textarea>`,
    "</div>",
    "</details>",
    '<details class="sotl-details" style="margin-top: 8px;"><summary>Injection Template</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="injectionTemplate" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(editingPreset.injectionTemplate)}</textarea>`,
    "</div>",
    "</details>",
    '<details class="sotl-details" style="margin-top: 8px;"><summary>Import / Export</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    '  <div class="sotl-actions" style="margin-bottom: 8px; flex-wrap: wrap;">',
    button("Copy Template JSON", "editor-export"),
    button("Download Template JSON", "editor-download", { title: "Download current template as a .json file" }),
    "  </div>",
    '  <div class="sotl-actions" style="margin-bottom: 8px; flex-wrap: wrap;">',
    button("Upload Template JSON", "editor-upload-single", { title: "Upload a template .json file from your device" }),
    button("Download All Custom", "editor-download-all", { title: "Download all custom templates as a pack .json file" }),
    button("Upload Template Pack", "editor-upload-pack", { title: "Upload a template pack .json file" }),
    "  </div>",
    '  <input type="file" id="sotl-upload-single" accept=".json" style="display:none;" data-sotl-file-action="file-upload-single">',
    '  <input type="file" id="sotl-upload-pack" accept=".json" style="display:none;" data-sotl-file-action="file-upload-pack">',
    '  <label class="sotl-label">Paste Template JSON to Import',
    `    <textarea class="sotl-textarea" id="sotl-import-paste" placeholder='Paste preset JSON here (single preset or array of presets)...'></textarea>`,
    "  </label>",
    '  <div class="sotl-actions">',
    button("Import Pasted Template", "editor-import", { primary: true }),
    "  </div>",
    lastImportStatus ? [
      `<div style="margin-top: 10px; padding: 8px 10px; border-radius: 6px; border-left: 3px solid ${lastImportStatus.ok ? "var(--lv-success-text,#176b43)" : "#dc3545"}; background: ${lastImportStatus.ok ? "rgba(27,126,80,0.07)" : "rgba(220,53,69,0.08)"};">`,
      `  <strong style="font-size: 11px; color: ${lastImportStatus.ok ? "var(--lv-success-text,#176b43)" : "var(--lv-error-text,#bd2130)"};">`,
      lastImportStatus.ok ? "\u2705 Import succeeded" : "\u274C Import failed",
      "</strong>",
      `  <p style="margin: 4px 0 0; font-size: 12px; line-height: 1.4;">${escapeHtml2(lastImportStatus.message)}</p>`,
      lastImportStatus.presetName ? `  <p style="margin: 4px 0 0; font-size: 11px; color: var(--lumiverse-text-muted,#64707d);">Template: <strong>${escapeHtml2(lastImportStatus.presetName)}</strong></p>` : "",
      lastImportStatus.presetId ? `  <p style="margin: 2px 0 0; font-size: 11px; color: var(--lumiverse-text-muted,#64707d);">ID: <code>${escapeHtml2(lastImportStatus.presetId)}</code></p>` : "",
      "</div>"
    ].join("") : "",
    "</div>",
    "</details>",
    // Preview / Validation Section
    '<details class="sotl-details" style="margin-top: 8px;" open><summary>Preview & Validation</summary>',
    '<div style="margin-top: 8px;">',
    '  <div class="sotl-actions" style="margin-bottom: 8px;">',
    button("Run Template Preview", "editor-preview", { primary: true }),
    "  </div>",
    lastJsonParseError ? `<p class="sotl-note sotl-warning" style="margin-bottom: 8px; color: var(--lv-error-text, #bd2130);">${escapeHtml2(lastJsonParseError)}</p>` : "",
    lastSanitizerWarnings.length > 0 ? [
      '<div style="background: rgba(220,53,69,0.08); border-left: 3px solid var(--lv-error-border, #dc3545); padding: 8px; margin-bottom: 8px; border-radius: 4px;">',
      '  <strong style="color: var(--lv-error-text, #bd2130); font-size: 11px;">\u26A0\uFE0F Sanitizer Allowlist Warnings:</strong>',
      '  <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 11px; color: var(--lv-error-text, #bd2130);">',
      ...lastSanitizerWarnings.map((w) => `    <li>${escapeHtml2(w)}</li>`),
      "  </ul>",
      "</div>"
    ].join("\n") : "",
    lastPreviewReport ? `<p class="sotl-note" style="margin-bottom: 8px;">Preview render: ${lastPreviewReport.success ? "template rendered" : "fallback used"}${lastPreviewReport.warning ? ` - ${escapeHtml2(lastPreviewReport.warning)}` : ""}</p>` : "",
    lastPreviewHtml ? [
      '<div style="margin-top: 8px;">',
      '  <span style="font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted, #64707d);">Mock Render Preview:</span>',
      `  <div class="sotl-preview" style="margin-top: 4px; max-height: 250px; overflow-y: auto;">${lastPreviewHtml}</div>`,
      "</div>"
    ].join("\n") : '<p class="sotl-note">Click "Run Template Preview" to check how this template renders with the sample data.</p>',
    "</div>",
    "</details>",
    "</div>"
  ].join("");
}

// src/frontend/settingsPanel.ts
function renderFeatureBreakdown(collapsible = false) {
  const content = [
    '<div class="sotl-feature-grid">',
    "<article><strong>Drawer HUD</strong><span>Shows status, current tracker, controls, diagnostics, and preset details.</span></article>",
    "<article><strong>Settings panel</strong><span>Works from the extension list and exposes the core toggles.</span></article>",
    "<article><strong>Slim Scene Loom</strong><span>Tracks scene title, location, time, mood, cast, inventory, anchors, and avoid-next notes.</span></article>",
    "<article><strong>Passive extraction</strong><span>Reads fenced <code>tracker</code> and <code>loom</code> JSON blocks from assistant replies.</span></article>",
    "<article><strong>Generate tracker</strong><span>Uses a sidecar connection or default fallback to make tracker JSON for the latest assistant message.</span></article>",
    "<article><strong>Per-chat storage</strong><span>Saves latest and per-message tracker state through user storage.</span></article>",
    "<article><strong>Message cards</strong><span>Best-effort top or bottom card mounting when Lumiverse exposes message host ids.</span></article>",
    "<article><strong>Manual JSON edit</strong><span>Lets you correct the current tracker without regenerating.</span></article>",
    "<article><strong>Runtime recovery</strong><span>Repairs corrupt Loom storage and exposes Reset Loom Storage when the backend is slow or offline.</span></article>",
    "</div>",
    '<p class="sotl-note">Not in this milestone: prompt injection, simulation clocks, entity inbox, companion autonomy, Council tools, and the large Universal Loom Ledger preset.</p>'
  ].join("");
  if (collapsible) {
    return [
      '<section class="sotl-panel">',
      '<details class="sotl-details"><summary>What this version does (Features)</summary>',
      content,
      "</details>",
      "</section>"
    ].join("");
  }
  return [
    '<section class="sotl-panel">',
    "<h3>What this version does</h3>",
    content,
    "</section>"
  ].join("");
}
function renderSettingsPanel(state2, status = {}) {
  if (!state2) {
    const offlineText = status.backendTimedOut ? "Backend is not responding. Try Reset Loom Storage, then Refresh after the extension reloads." : "Frontend loaded. Waiting for backend state...";
    return [
      '<div class="sotl-root sotl-settings" data-sotl-settings="true">',
      '<section class="sotl-panel">',
      "<h2>State of the Loom</h2>",
      `<p class="sotl-note">${escapeHtml2(offlineText)}</p>`,
      status.lastFrontendError ? `<p class="sotl-note sotl-warning">${escapeHtml2(status.lastFrontendError)}</p>` : "",
      '<div class="sotl-actions">',
      button("Refresh", "refresh"),
      button("Open Loom Drawer", "open-drawer"),
      button("Reset Loom Storage", "reset-storage", { title: "Resets State of the Loom settings, presets, and trackers for this user." }),
      "</div>",
      "</section>",
      "</div>"
    ].join("");
  }
  return [
    '<div class="sotl-root sotl-settings" data-sotl-settings="true">',
    '<section class="sotl-panel">',
    "<h2>State of the Loom</h2>",
    `<p class="sotl-note">Active chat: ${escapeHtml2(state2.activeChat.name || state2.activeChat.id || "None")}</p>`,
    '<div class="sotl-status">',
    badge("Backend ready", state2.backendReady),
    badge("Chats", state2.permissions.chats),
    badge("Chat mutation", state2.permissions.chat_mutation),
    badge("Generation", state2.permissions.generation),
    "</div>",
    '<div class="sotl-actions">',
    button("Open Loom Drawer", "open-drawer", { primary: true }),
    button("Reset Loom Storage", "reset-storage", { title: "Resets State of the Loom settings, presets, and trackers for this user." }),
    "</div>",
    status.lastToast ? `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid ${status.lastToast.level === "success" ? "#176b43" : status.lastToast.level === "error" ? "#bd2130" : "#b06800"}; background: ${status.lastToast.level === "success" ? "rgba(27,126,80,0.07)" : status.lastToast.level === "error" ? "rgba(220,53,69,0.08)" : "rgba(255,193,7,0.08)"}; display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <span>${status.lastToast.level === "success" ? "\u2705" : status.lastToast.level === "error" ? "\u274C" : "\u26A0\uFE0F"}</span>
          <div style="flex: 1; line-height: 1.4; color: ${status.lastToast.level === "success" ? "var(--lv-success-text,#176b43)" : status.lastToast.level === "error" ? "var(--lv-error-text,#bd2130)" : "var(--lv-warning-text,#8a4f00)"}; font-weight: 500;">${escapeHtml2(status.lastToast.message)}</div>
        </div>` : "",
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Core configuration status</h3>",
    '<p class="sotl-note" style="margin-bottom: 12px;">All detailed settings, preset configurations, sidecar connections, and diagnostics are managed within the main Loom Drawer.</p>',
    '<div class="sotl-fields">',
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="enabled" ${state2.settings.enabled ? "checked" : ""}> Extension enabled</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatHudLauncher" ${state2.settings.showChatHudLauncher ? "checked" : ""}> Show chat HUD button</label>`,
    "</div>",
    "</section>",
    "</div>"
  ].join("");
}

// src/frontend/drawer.ts
function renderConnectionOptions(state2) {
  const selected = state2.settings.sidecarConnectionId || "";
  const options = [
    `<option value=""${selected ? "" : " selected"}>Use default/current connection</option>`,
    ...state2.connections.map((connection) => {
      const label = [
        connection.name,
        connection.model ? `(${connection.model})` : "",
        connection.is_default ? "default" : ""
      ].filter(Boolean).join(" ");
      return `<option value="${escapeHtml2(connection.id)}"${selected === connection.id ? " selected" : ""}>${escapeHtml2(label)}</option>`;
    })
  ];
  return options.join("");
}
function renderPresetOptions(state2) {
  return state2.presets.map((preset) => {
    const selected = preset.id === state2.settings.activePresetId ? " selected" : "";
    let suffix = `[~${preset.maxInjectionTokens || 200}t - Custom]`;
    if (preset.id === "micro_loom") suffix = "[~150t - Tiny]";
    else if (preset.id === "slim_scene_loom") suffix = "[~350t - Slim]";
    else if (preset.id === "balanced_story_loom") suffix = "[~400t - Balanced]";
    else if (preset.id === "cast_continuity_loom") suffix = "[~400t - Detailed]";
    else if (preset.id === "full_continuity_ledger") suffix = "[~450t - Full]";
    return `<option value="${escapeHtml2(preset.id)}"${selected}>${escapeHtml2(preset.name)} ${suffix}</option>`;
  }).join("");
}
function renderPlacementOptions(state2) {
  return ["top", "bottom"].map((placement) => {
    let label = placement === "top" ? "Top of message" : "Bottom of message";
    const selected = state2.settings.messageCardPlacement === placement ? " selected" : "";
    return `<option value="${placement}"${selected}>${label}</option>`;
  }).join("");
}
function renderCardDensityOptions(state2) {
  return ["compact", "normal"].map((density) => {
    let label = density === "compact" ? "Compact density" : "Normal density";
    const selected = state2.settings.cardDensity === density ? " selected" : "";
    return `<option value="${density}"${selected}>${label}</option>`;
  }).join("");
}
function renderLatestTracker(state2) {
  if (!state2.latestTracker) {
    return '<p class="sotl-note">No tracker has been stored for this chat yet.</p>';
  }
  const render = renderTrackerForState(state2.latestTracker, state2);
  const html = render.html;
  const renderWarning = render.warning ? `<p class="sotl-note sotl-warning" style="margin-top: 8px;">${escapeHtml2(render.warning)}</p>` : "";
  const attachmentStatus = state2.settings.renderInMessages && state2.latestTracker.messageId ? `<p class="sotl-note" style="color: var(--lv-success-text, #176b43); font-weight: 600; margin-top: 8px;">\u{1F517} Attached to message card (${escapeHtml2(state2.latestTracker.messageId)})</p>` : '<p class="sotl-note" style="margin-top: 8px;">Status: Not attached to a message card.</p>';
  return [
    `<p class="sotl-note">${escapeHtml2(state2.latestTracker.compactSummary)}</p>`,
    `<div class="sotl-preview">${html}</div>`,
    renderWarning,
    attachmentStatus,
    '<details class="sotl-details"><summary>Manual JSON edit</summary>',
    '<div class="sotl-fields" style="margin-top: 10px;">',
    `<textarea class="sotl-textarea" data-sotl-field="latestJson">${escapeHtml2(JSON.stringify(state2.latestTracker.data, null, 2))}</textarea>`,
    '<div class="sotl-actions">',
    button("Save JSON", "save-json"),
    button("Copy JSON", "copy-json", { title: "Copy Loom JSON to clipboard" }),
    "</div>",
    "</div>",
    "</details>"
  ].join("");
}
function renderMessageList(state2) {
  if (state2.messageTrackers.length === 0) return '<p class="sotl-note">No per-message trackers yet.</p>';
  return state2.messageTrackers.map((tracker) => {
    const id = tracker.messageId || "latest";
    return [
      '<div class="sotl-panel">',
      `<h3>${escapeHtml2(tracker.compactSummary || id)}</h3>`,
      `<p class="sotl-note">${escapeHtml2(tracker.source)} - ${escapeHtml2(tracker.generatedAt)}</p>`,
      '<div class="sotl-actions">',
      button("Regenerate", `regenerate:${id}`),
      button(tracker.hidden ? "Show" : "Hide", `hide:${id}`),
      button("Delete", `delete:${id}`),
      "</div>",
      "</div>"
    ].join("");
  }).join("");
}
function renderPipelineReport(state2) {
  const report = state2.diagnostics.pipelineReport;
  if (!report) {
    return '<p class="sotl-note" style="margin-top: 4px;">No generation has been performed yet in this session.</p>';
  }
  const successColor = "var(--lv-success-text, #176b43)";
  const errorColor = "var(--lv-error-text, #bd2130)";
  const rawVal = report.rawResponseAvailable ? `<span style="color: ${successColor}; font-weight: 600;">Yes</span>` : `<span style="color: ${errorColor}; font-weight: 600;">No</span>`;
  const parseVal = report.parseSuccess ? `<span style="color: ${successColor}; font-weight: 600;">Success</span>` : `<span style="color: ${errorColor}; font-weight: 600;">Failed: ${escapeHtml2(report.parseError || "Unknown parser error")}</span>`;
  const valVal = report.schemaValidationSuccess ? `<span style="color: ${successColor}; font-weight: 600;">Success</span>` : `<span style="color: ${errorColor}; font-weight: 600;">Failed: ${escapeHtml2(report.schemaValidationError || "Invalid schema")}</span>`;
  const renderVal = report.renderSuccess ? `<span style="color: ${successColor}; font-weight: 600;">Success</span>` : `<span style="color: ${errorColor}; font-weight: 600;">Failed: ${escapeHtml2(report.renderError || "Render error")}</span>`;
  const sanitizerVal = report.sanitizerRemovedContent ? `<span style="color: ${errorColor}; font-weight: 600;">Yes (Check template safe tags)</span>` : `<span style="color: ${successColor}; font-weight: 600;">No (Clean)</span>`;
  const fallbackVal = report.fallbackUsed ? `<span style="color: #b58900; font-weight: 600;">Yes (Fallback active)</span>` : `<span style="color: ${successColor}; font-weight: 600;">No (Template OK)</span>`;
  return `
    <div style="font-size: 11px; display: grid; gap: 4px; padding: 10px; background: rgba(0,0,0,0.06); border-radius: 6px; border: 1px solid var(--lumiverse-border, rgba(80,88,100,0.15)); margin-top: 8px; line-height: 1.4;">
      <div><strong>Active Preset ID:</strong> <code>${escapeHtml2(report.activePresetId)}</code></div>
      <div><strong>Preset Name:</strong> ${escapeHtml2(report.presetName)}</div>
      <div><strong>Preset Source:</strong> <code>${escapeHtml2(report.presetSource)}</code></div>
      <div><strong>Timestamp:</strong> <code>${escapeHtml2(report.timestamp)}</code></div>
      <div><strong>Generation Started:</strong> <code>${escapeHtml2(report.generationStartedAt || "n/a")}</code></div>
      <div><strong>Generation Completed:</strong> <code>${escapeHtml2(report.generationCompletedAt || "n/a")}</code></div>
      <div><strong>Elapsed:</strong> <code>${report.elapsedMs !== void 0 ? `${Math.round(report.elapsedMs / 100) / 10}s` : "n/a"}</code></div>
      <div><strong>Timeout:</strong> <code>${report.timeoutMs === 0 ? "manual cancel only" : report.timeoutMs ? `${Math.round(report.timeoutMs / 1e3)}s` : "n/a"}</code></div>
      <div><strong>Raw Response Available:</strong> ${rawVal}</div>
      ${report.rawResponsePreview ? `<div><strong>Raw Response Preview:</strong> <code>${escapeHtml2(report.rawResponsePreview)}</code></div>` : ""}
      <div><strong>JSON Parse:</strong> ${parseVal}</div>
      ${report.parseFailureCategory ? `<div><strong>Parse Category:</strong> <code>${escapeHtml2(report.parseFailureCategory)}</code></div>` : ""}
      <div><strong>Schema Validation:</strong> ${valVal}</div>
      ${report.schemaValidationIssues && report.schemaValidationIssues.length > 0 ? `<div><strong>Schema Issues:</strong> <code>${escapeHtml2(report.schemaValidationIssues.map((issue) => `${issue.path || "(root)"} ${issue.message}`).join(" | "))}</code></div>` : ""}
      <div><strong>HTML Render:</strong> ${renderVal}</div>
      ${report.renderWarning ? `<div><strong>Render Warning:</strong> <code>${escapeHtml2(report.renderWarning)}</code></div>` : ""}
      <div><strong>Sanitizer Removed Content:</strong> ${sanitizerVal}</div>
      <div><strong>Fallback Card Used:</strong> ${fallbackVal}</div>
      ${report.trackerPresetId ? `<div><strong>Tracker Preset ID:</strong> <code>${escapeHtml2(report.trackerPresetId)}</code></div>` : ""}
      <div><strong>Latest Tracker Message ID:</strong> <code>${escapeHtml2(report.messageId)}</code></div>
      <div><strong>Chat ID:</strong> <code>${escapeHtml2(report.chatId)}</code></div>
      <div><strong>HUD View Mode:</strong> <code>${escapeHtml2(report.hudView)}</code></div>
      <div><strong>Retained Tracker Count:</strong> <code>${report.retainedCount}</code></div>
      ${report.lastError ? `<div><strong>Last Error:</strong> <code>${escapeHtml2(report.lastError)}</code></div>` : ""}
    </div>
  `;
}
function renderDrawer(state2, status = {}) {
  if (!state2) {
    const offlineText = status.backendTimedOut ? "Backend is not responding. Try Reset Loom Storage, then Refresh after the extension reloads." : "Frontend loaded. Waiting for backend state...";
    return [
      '<div class="sotl-root">',
      '<section class="sotl-panel">',
      "<h2>State of the Loom</h2>",
      `<p class="sotl-note">${escapeHtml2(offlineText)}</p>`,
      status.lastFrontendError ? `<p class="sotl-note sotl-warning">${escapeHtml2(status.lastFrontendError)}</p>` : "",
      '<div class="sotl-actions">',
      button("Refresh", "refresh"),
      button("Reset Loom Storage", "reset-storage", { title: "Resets State of the Loom settings, presets, and trackers for this user." }),
      "</div>",
      "</section>",
      renderFeatureBreakdown(true),
      "</div>"
    ].join("");
  }
  const disabledReason = state2.generation.disabledReason || "";
  const selectedConnection = state2.connections.find((connection) => connection.id === state2.settings.sidecarConnectionId);
  return [
    '<div class="sotl-root" data-sotl-root="true">',
    '<section class="sotl-panel">',
    "<h2>State of the Loom</h2>",
    `<p class="sotl-note">Active chat: ${escapeHtml2(state2.activeChat.name || state2.activeChat.id || "Unavailable")}</p>`,
    '<div class="sotl-status">',
    badge("Backend ready", state2.backendReady),
    badge("Chats", state2.permissions.chats),
    badge("Chat mutation", state2.permissions.chat_mutation),
    badge("Generation", state2.permissions.generation),
    badge("Settings UI", Boolean(state2.permissions.app_manipulation)),
    "</div>",
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Controls</h3>",
    '<div class="sotl-fields">',
    '<label class="sotl-label">Preset',
    `<select class="sotl-select" data-sotl-field="preset">${renderPresetOptions(state2)}</select>`,
    "</label>",
    // Collapsible Active Preset Preview & Render (QoL #1)
    '<details class="sotl-details" style="margin-top: 4px; margin-bottom: 8px;"><summary>\u2139\uFE0F Active Template Preview & Sample Render</summary>',
    '<div style="margin-top: 8px;">',
    `  <p class="sotl-note" style="margin-bottom: 8px; color: var(--lv-accent, #3864d9); font-weight: 600;">Template: ${escapeHtml2(state2.activePreset.name)}</p>`,
    `  <p class="sotl-note" style="margin-bottom: 8px; font-style: italic;">${escapeHtml2(state2.activePreset.description || "No description.")}</p>`,
    '  <div class="sotl-preview" style="border: 1px dashed var(--lumiverse-border, rgba(80,88,100,0.18)); border-radius: 6px; padding: 4px; max-height: 200px; background: rgba(0,0,0,0.05); overflow-y: auto;">',
    (() => {
      try {
        const mockTracker = {
          version: state2.activePreset.version || "1.0.0",
          schemaVersion: "1",
          presetId: state2.activePreset.id,
          chatId: "preview-chat",
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          source: "manual_edit",
          placement: state2.activePreset.defaultPlacement,
          data: state2.activePreset.sampleData || {},
          compactSummary: "Sample preview for " + state2.activePreset.name,
          validation: { ok: true, issues: [] }
        };
        return renderTrackerHtml(mockTracker, state2.activePreset, state2.settings.useSafeRenderer);
      } catch (err) {
        return `<p class="sotl-note sotl-warning" style="color: var(--lv-error-text,#bd2130);">\u26A0\uFE0F Preview Render Failed: ${escapeHtml2(err instanceof Error ? err.message : String(err))}</p>`;
      }
    })(),
    "  </div>",
    "</div>",
    "</details>",
    '<label class="sotl-label">Sidecar connection',
    `<select class="sotl-select" data-sotl-field="connection">${renderConnectionOptions(state2)}</select>`,
    "</label>",
    `<p class="sotl-note">Connection: ${escapeHtml2(selectedConnection?.name || (state2.settings.useDefaultConnectionFallback ? "default/current fallback" : "none selected"))}</p>`,
    !state2.permissions.generation ? '<p class="sotl-note">Generation permission is missing; passive fenced extraction is still available.</p>' : "",
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="autoGenerate" ' + (state2.settings.autoGenerate ? "checked" : "") + "> Auto-generate after assistant messages</label>",
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatHudLauncher" ' + (state2.settings.showChatHudLauncher ? "checked" : "") + "> Show chat HUD button</label>",
    '<label class="sotl-label">HUD detail level',
    `<select class="sotl-select" data-sotl-field="hudDefaultView">`,
    `  <option value="compact"${state2.settings.hudDefaultView === "compact" ? " selected" : ""}>Compact summary</option>`,
    `  <option value="full"${state2.settings.hudDefaultView === "full" ? " selected" : ""}>Full tracker</option>`,
    `</select>`,
    "</label>",
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="renderInMessages" ' + (state2.settings.renderInMessages ? "checked" : "") + "> Attach tracker cards to messages (Experimental)</label>",
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="useSafeRenderer" ' + (state2.settings.useSafeRenderer ? "checked" : "") + "> Use safe generic renderer for custom presets</label>",
    '<label class="sotl-label">Message card position',
    `<select class="sotl-select" data-sotl-field="messageCardPlacement">${renderPlacementOptions(state2)}</select>`,
    "</label>",
    '<label class="sotl-label">Card density',
    `<select class="sotl-select" data-sotl-field="cardDensity">${renderCardDensityOptions(state2)}</select>`,
    "</label>",
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="stripBlocks" ' + (state2.settings.stripTrackerBlocksFromMessages ? "checked" : "") + "> Strip passive tracker blocks when allowed</label>",
    // Configurable Generation Timeout Dropdown (Issue 7)
    '<label class="sotl-label">Generation timeout',
    (() => {
      const timeoutMs = state2.settings.sidecarGenerationTimeoutMs ?? 18e4;
      const options = [
        `<option value="60000"${timeoutMs === 6e4 ? " selected" : ""}>60 seconds</option>`,
        `<option value="120000"${timeoutMs === 12e4 ? " selected" : ""}>120 seconds</option>`,
        `<option value="180000"${timeoutMs === 18e4 ? " selected" : ""}>180 seconds (default)</option>`,
        `<option value="300000"${timeoutMs === 3e5 ? " selected" : ""}>300 seconds</option>`,
        `<option value="0"${timeoutMs === 0 ? " selected" : ""}>No timeout (manual cancel only)</option>`
      ];
      return `<select class="sotl-select" data-sotl-field="sidecarGenerationTimeoutMs">${options.join("")}</select>`;
    })(),
    "</label>",
    '<label class="sotl-label">Tracker history limit',
    (() => {
      const limit = state2.settings.trackerHistoryLimit ?? 5;
      const options = [
        `<option value="1"${limit === 1 ? " selected" : ""}>Last 1 tracker</option>`,
        `<option value="3"${limit === 3 ? " selected" : ""}>Last 3 trackers</option>`,
        `<option value="5"${limit === 5 ? " selected" : ""}>Last 5 trackers (default)</option>`,
        `<option value="10"${limit === 10 ? " selected" : ""}>Last 10 trackers</option>`,
        `<option value="20"${limit === 20 ? " selected" : ""}>Last 20 trackers</option>`,
        `<option value="0"${limit === 0 ? " selected" : ""}>Unlimited (keep all)</option>`
      ];
      return `<select class="sotl-select" data-sotl-field="trackerHistoryLimit">${options.join("")}</select>`;
    })(),
    `<p class="sotl-note">Controls how many tracker snapshots are kept per chat. Generation context always uses a safe compact subset. Latest tracker is always preserved.</p>`,
    "</label>",
    "</div>",
    '<div class="sotl-actions">',
    button("Generate tracker", "generate", { primary: true, disabled: Boolean(disabledReason) && !state2.generation.running, title: disabledReason }),
    state2.generation.running ? button("Cancel Generation", "cancel-generation", { primary: false, style: "background: rgba(220,53,69,0.1); color: var(--lv-error-text,#bd2130); border-color: rgba(220,53,69,0.2);" }) : "",
    button("Refresh", "refresh"),
    button("Reset Loom Storage", "reset-storage", { title: "Resets State of the Loom settings, presets, and trackers for this user." }),
    "</div>",
    // Refined Generate Status Banner (Issue 7 & QoL #3)
    (() => {
      if (state2.generation.running) {
        return `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid var(--lv-accent, #3864d9); background: rgba(56, 100, 217, 0.08); display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--lv-accent, #3864d9);">
          <span class="sotl-spin" style="display: inline-block;">\u23F3</span>
          <div style="flex: 1;">${escapeHtml2(state2.generation.message || "Generating tracker...")}</div>
        </div>`;
      }
      if (disabledReason) {
        return `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid var(--lv-warning-border, #b06800); background: rgba(255, 193, 7, 0.08); display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--lv-warning-text, #8a4f00);">
          <span>\u{1F6AB}</span>
          <div style="flex: 1;">Blocked: ${escapeHtml2(disabledReason)}</div>
        </div>`;
      }
      return `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid var(--lv-success-border, #176b43); background: rgba(27, 126, 80, 0.08); display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--lv-success-text, #176b43);">
        <span>\u{1F7E2}</span>
        <div style="flex: 1;">Ready to track the latest assistant message.</div>
      </div>`;
    })(),
    // Refined premium banner toasts (QoL #3)
    status.lastToast ? `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid ${status.lastToast.level === "success" ? "#176b43" : status.lastToast.level === "error" ? "#bd2130" : "#b06800"}; background: ${status.lastToast.level === "success" ? "rgba(27,126,80,0.07)" : status.lastToast.level === "error" ? "rgba(220,53,69,0.08)" : "rgba(255,193,7,0.08)"}; display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <span>${status.lastToast.level === "success" ? "\u2705" : status.lastToast.level === "error" ? "\u274C" : "\u26A0\uFE0F"}</span>
          <div style="flex: 1; line-height: 1.4; color: ${status.lastToast.level === "success" ? "var(--lv-success-text,#176b43)" : status.lastToast.level === "error" ? "var(--lv-error-text,#bd2130)" : "var(--lv-warning-text,#8a4f00)"}; font-weight: 500;">${escapeHtml2(status.lastToast.message)}</div>
        </div>` : "",
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Current Loom" + (state2.diagnostics.lastRenderStatus?.includes("Stale") ? ' <span style="display: inline-block; background: rgba(255, 193, 7, 0.12); border: 1px solid #ffc107; color: #b58900; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; margin-left: 8px; vertical-align: middle;">\u26A0\uFE0F Stale: New messages sent</span>' : "") + "</h3>",
    renderLatestTracker(state2),
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Message Tracker List</h3>",
    renderMessageList(state2),
    "</section>",
    renderFeatureBreakdown(true),
    '<section class="sotl-panel">',
    '<details class="sotl-details"><summary>Custom Template Editor</summary>',
    '<div style="margin-top: 10px;">',
    renderPresetEditor(state2),
    "</div>",
    "</details>",
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Diagnostics</h3>",
    state2.diagnostics.storageWarning ? `<p class="sotl-note sotl-warning">${escapeHtml2(state2.diagnostics.storageWarning)}</p>` : "",
    `<p class="sotl-note">${escapeHtml2(state2.diagnostics.renderLimitation || "")}</p>`,
    state2.diagnostics.lastError ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.lastError)}</p>` : "",
    state2.diagnostics.lastGenerationError ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.lastGenerationError)}</p>` : "",
    status.lastRenderStatus ? `<p class="sotl-note">${escapeHtml2(status.lastRenderStatus)}</p>` : "",
    state2.diagnostics.lastRenderStatus ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.lastRenderStatus)}</p>` : "",
    '<details class="sotl-details" open style="margin-top: 8px;"><summary>\u{1F50D} Tracker Pipeline Report</summary>',
    renderPipelineReport(state2),
    "</details>",
    (() => {
      const doc = typeof document !== "undefined" ? document : null;
      const isMounted = doc ? Boolean(doc.querySelector('[data-sotl-chat-panel="true"]')) : false;
      const visibleDrawer = doc ? Boolean(doc.querySelector(".lumiverse-drawer, .drawer, [data-drawer], #drawer, .sotl-drawer")) : false;
      const visibleSettings = doc ? Boolean(doc.querySelector(".lumiverse-settings, .settings-modal, [data-settings], #settings, .sotl-settings")) : false;
      let reason = "Active";
      if (!state2.settings.showChatHudLauncher) reason = "Disabled by user settings";
      else if (visibleDrawer) reason = "Soft-hidden: Loom Drawer is open";
      else if (visibleSettings) reason = "Soft-hidden: Extension Settings are open";
      else if (!isMounted) reason = "Not mounted (waiting for DOM render)";
      return [
        '<div style="font-size: 11px; margin-top: 8px; border-top: 1px solid var(--lumiverse-border, rgba(80,88,100,0.15)); padding-top: 8px; display: grid; gap: 4px; color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));">',
        `  <div><strong>HUD Launcher:</strong> ${state2.settings.showChatHudLauncher ? '<span style="color: var(--lv-success-text, #176b43); font-weight: 600;">Enabled</span>' : "Disabled"}</div>`,
        `  <div><strong>HUD DOM Status:</strong> ${isMounted ? '<span style="color: var(--lv-success-text, #176b43); font-weight: 600;">Mounted</span>' : "Not Mounted"}</div>`,
        `  <div><strong>HUD Placement State:</strong> <em>${escapeHtml2(reason)}</em></div>`,
        `  <div><strong>Message Cards:</strong> ${state2.settings.renderInMessages ? '<span style="color: var(--lv-accent, #3864d9); font-weight: 600;">Enabled (Experimental)</span>' : "Disabled"}</div>`,
        "</div>"
      ].join("");
    })(),
    "</section>",
    "</div>"
  ].join("");
}

// src/frontend/messageCards.ts
var injectedWrappers = /* @__PURE__ */ new Map();
var isChatLoomPanelExpanded = false;
var isDrawerOpen = false;
var isSettingsOpen = false;
var rerenderCallback = null;
var openDrawerCallback = null;
function registerOpenDrawerCallback(cb) {
  openDrawerCallback = cb;
}
function documentRef() {
  return typeof document === "undefined" ? null : document;
}
function escapeHtml3(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeSelector(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
}
function registerRerenderCallback(cb) {
  rerenderCallback = cb;
}
function triggerRerender() {
  if (rerenderCallback) {
    rerenderCallback();
  }
}
function setDrawerOpenState(open) {
  isDrawerOpen = open;
}
function setSettingsOpenState(open) {
  isSettingsOpen = open;
}
function findMessageHost(doc, tracker) {
  if (!tracker.messageId) return null;
  const id = escapeSelector(tracker.messageId);
  return doc.querySelector(`[data-message-id="${id}"]`) ?? doc.querySelector(`[data-lumiverse-message-id="${id}"]`) ?? doc.querySelector(`[data-lv-message-id="${id}"]`) ?? doc.querySelector(`[data-chat-message-id="${id}"]`) ?? doc.querySelector(`[data-message_id="${id}"]`) ?? doc.querySelector(`[data-messageid="${id}"]`) ?? doc.getElementById(`message-${tracker.messageId}`);
}
function renderTrackerHtmlCard(tracker, state2) {
  const controls = state2.settings.showMessageButtons ? `<div class="sotl-message-controls">${iconButton("Regenerate", "card-regenerate", tracker.messageId || "")}${iconButton("Edit", "card-edit", tracker.messageId || "")}${iconButton("Hide", "card-hide", tracker.messageId || "")}${iconButton("Delete", "card-delete", tracker.messageId || "")}</div>` : "";
  return controls + renderTrackerForState(tracker, state2).html;
}
function cleanupMessageCards(ctx) {
  const domApi = ctx.dom && typeof ctx.dom === "object" ? ctx.dom : null;
  const uninject = domApi && typeof domApi.uninject === "function" ? domApi.uninject : null;
  for (const wrapper of injectedWrappers.values()) {
    try {
      if (uninject) {
        uninject(wrapper);
      } else {
        wrapper.remove();
      }
    } catch {
    }
  }
  injectedWrappers.clear();
}
function mountMessageCards(ctx, state2) {
  const doc = documentRef();
  if (!doc) return { status: "Message-card renderer unavailable: no document." };
  if (!state2) return { status: "Message-card renderer waiting for backend state." };
  const showCards = state2.settings.renderInMessages;
  if (!showCards) {
    cleanupMessageCards(ctx);
    return { status: "Message-card rendering is disabled in settings." };
  }
  const domApi = ctx.dom && typeof ctx.dom === "object" ? ctx.dom : null;
  const inject = domApi && typeof domApi.inject === "function" ? domApi.inject : null;
  const findMessageElement = domApi && typeof domApi.findMessageElement === "function" ? domApi.findMessageElement : null;
  cleanupMessageCards(ctx);
  const trackers = state2.messageTrackers.length > 0 ? state2.messageTrackers : state2.latestTracker ? [state2.latestTracker] : [];
  if (trackers.length === 0) return { status: "No tracker available for message-card mounting." };
  let mounted = 0;
  let lastMissing;
  let virtualizationActive = false;
  for (const tracker of trackers) {
    if (tracker.hidden || tracker.placement === "hidden" || tracker.placement === "drawer" || tracker.placement === "disabled") {
      continue;
    }
    const messageId = tracker.messageId;
    if (!messageId) continue;
    const cardHtml = renderTrackerHtmlCard(tracker, state2);
    if (!cardHtml) continue;
    let hostElement = null;
    if (findMessageElement) {
      hostElement = findMessageElement(messageId);
      virtualizationActive = true;
    } else {
      hostElement = findMessageHost(doc, tracker);
    }
    if (!hostElement) {
      lastMissing = messageId;
      continue;
    }
    const pos = tracker.placement === "bottom" ? "beforeend" : "afterbegin";
    if (inject) {
      try {
        const wrapper = inject(hostElement, cardHtml, pos);
        if (wrapper) {
          injectedWrappers.set(messageId, wrapper);
          mounted += 1;
        }
      } catch (err) {
        console.warn("DOM Helper inject failed", err);
      }
    } else {
      const wrapper = doc.createElement("div");
      wrapper.className = "sotl-message-card";
      wrapper.dataset.sotlMounted = "true";
      wrapper.dataset.sotlMessageId = messageId;
      wrapper.innerHTML = cardHtml;
      if (tracker.placement === "bottom") {
        hostElement.append(wrapper);
      } else {
        hostElement.prepend(wrapper);
      }
      injectedWrappers.set(messageId, wrapper);
      mounted += 1;
    }
  }
  const reports = [];
  if (mounted > 0) reports.push(`Mounted ${mounted} Loom tracker card${mounted === 1 ? "" : "s"}.`);
  if (virtualizationActive) reports.push(`Replay handled by virtualization registry.`);
  if (lastMissing) {
    reports.push(`Message host not currently mounted for messageId ${lastMissing}.`);
  }
  const fullStatus = reports.join(" ");
  return {
    status: fullStatus || "No mounted tracker cards.",
    messageId: lastMissing
  };
}
function renderCompactPanel(tracker, state2) {
  const isGenerating = state2.generation.running;
  const isCompact = state2.settings.hudDefaultView === "compact";
  const drawerIcon = `
    <button class="sotl-chat-panel__action-btn" data-sotl-panel-action="drawer" title="Open Loom Drawer" aria-label="Open Loom Drawer">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
      </svg>
    </button>
  `;
  const generateIcon = `
    <button class="sotl-chat-panel__action-btn" data-sotl-panel-action="generate" ${isGenerating || state2.generation.disabledReason ? "disabled" : ""} title="${escapeHtml3(state2.generation.disabledReason || "Generate Tracker State")}" aria-label="Generate Tracker State">
      <svg class="${isGenerating ? "sotl-spin" : ""}" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
        <path d="M23 4v6h-6"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    </button>
  `;
  const toggleIcon = `
    <button class="sotl-chat-panel__action-btn" data-sotl-panel-action="toggle-hud-view" title="${isCompact ? "Show Full Tracker View" : "Show Compact Summary View"}" aria-label="Toggle HUD Detail Level">
      ${isCompact ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
           </svg>` : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
           </svg>`}
    </button>
  `;
  const closeIcon = `
    <button class="sotl-chat-panel__action-btn sotl-chat-panel__action-btn--close" data-sotl-panel-action="collapse" title="Close Panel" aria-label="Close Panel">\u2715</button>
  `;
  const header = `
    <header class="sotl-chat-panel__head">
      <span class="sotl-chat-panel__title">Loom HUD</span>
      <div class="sotl-chat-panel__head-actions">
        ${toggleIcon}
        ${drawerIcon}
        ${generateIcon}
        ${closeIcon}
      </div>
    </header>
  `;
  if (!tracker) {
    return [
      '<div class="sotl-chat-panel">',
      header,
      '  <div class="sotl-chat-panel__body">',
      '    <p class="sotl-chat-panel__desc">No tracker has been stored for this chat yet.</p>',
      `    <button class="sotl-button" data-sotl-panel-action="generate" ${isGenerating || state2.generation.disabledReason ? "disabled" : ""} style="margin-top: 6px; width: 100%; justify-content: center;">Generate Tracker</button>`,
      "  </div>",
      "</div>"
    ].join("\n");
  }
  if (isCompact) {
    const bodyContent2 = renderCompactTrackerForState(tracker, state2);
    return [
      '<div class="sotl-chat-panel">',
      header,
      '  <div class="sotl-chat-panel__body">',
      bodyContent2,
      "  </div>",
      "</div>"
    ].join("\n");
  }
  let bodyContent = "";
  if (isCompact) {
    const castData = getFallbackField(tracker.data, ["cast", "present", "characters", "cast_present", "actors"]);
    const castArray = Array.isArray(castData) ? castData : [];
    const castChips = castArray.length > 0 ? `<div class="sotl-cast-grid" style="margin-top: 4px;">` + castArray.slice(0, 3).map((c) => `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">${escapeHtml3(c?.name || c || "Cast")}</span>`).join("") + (castArray.length > 3 ? `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">+${castArray.length - 3}</span>` : "") + `</div>` : "";
    const title = String(getFallbackField(tracker.data, ["sceneTitle", "title", "name", "sceneName", "scene"]) || "Active Scene");
    const location = String(getFallbackField(tracker.data, ["location", "current_location", "place", "scene_location", "environment"]) || "Unknown");
    const time = String(getFallbackField(tracker.data, ["time", "current_time", "timeOfDay", "scene_time"]) || "Unknown");
    const delta = String(getFallbackField(tracker.data, ["delta", "summary", "description", "updates", "delta_summary", "scene_delta"]) || "No deltas recorded.");
    bodyContent = [
      `    <p class="sotl-chat-panel__scene">${escapeHtml3(title)}</p>`,
      `    <div class="sotl-chat-panel__meta">\u{1F4CD} ${escapeHtml3(location)} \u2022 \u{1F552} ${escapeHtml3(time)}</div>`,
      `    <p class="sotl-chat-panel__desc">${escapeHtml3(delta)}</p>`,
      castChips
    ].join("\n");
  } else {
    bodyContent = `
      <div class="sotl-chat-panel__scroll-body">
        ${renderTrackerForState(tracker, state2).html}
      </div>
    `;
  }
  return [
    '<div class="sotl-chat-panel">',
    header,
    '  <div class="sotl-chat-panel__body">',
    bodyContent,
    "  </div>",
    "</div>"
  ].join("\n");
}
function ensureChatLoomPanel(ctx, state2) {
  const doc = documentRef();
  if (!doc) return;
  doc.querySelector(".sotl-chat-panel-container")?.remove();
  if (!state2) return;
  const showPanel = state2.settings.showChatHudLauncher;
  if (!showPanel) return;
  const visibleDrawer = doc.querySelector(".lumiverse-drawer, .drawer, [data-drawer], #drawer, .sotl-drawer");
  const visibleSettings = doc.querySelector(".lumiverse-settings, .settings-modal, [data-settings], #settings, .sotl-settings");
  let softHide = false;
  if (visibleDrawer) {
    const rect = visibleDrawer.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) softHide = true;
  }
  if (visibleSettings) {
    const rect = visibleSettings.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) softHide = true;
  }
  if (!visibleDrawer && isDrawerOpen) isDrawerOpen = false;
  if (!visibleSettings && isSettingsOpen) isSettingsOpen = false;
  if (isDrawerOpen || isSettingsOpen) softHide = true;
  const container = doc.createElement("div");
  container.className = "sotl-chat-panel-container";
  if (isChatLoomPanelExpanded) {
    container.classList.add("sotl-chat-panel-container--expanded");
  }
  container.dataset.sotlChatPanel = "true";
  if (softHide) {
    container.style.setProperty("display", "none", "important");
  }
  const pawSvg = `<svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor" style="display: block;" aria-hidden="true"><path d="M226.5 282.7c-5.5-12.8-18-20.7-31.9-20.7h-.2c-14 0-26.6 7.9-32.1 20.7l-35.3 82.5c-4 9.4-3.5 20.2 1.3 29.1 4.8 8.9 14.1 14.4 24.2 14.4h149c10.1 0 19.4-5.5 24.2-14.4 4.8-8.9 5.3-19.7 1.3-29.1l-35.3-82.5zM128 208c0-26.5-21.5-48-48-48S32 181.5 32 208s21.5 48 48 48 48-21.5 48-48zm256 0c0-26.5-21.5-48-48-48s-48 21.5-48 48 21.5 48 48 48 48-21.5 48-48zM192 96c0-26.5-21.5-48-48-48S96 69.5 96 96s21.5 48 48 48 48-21.5 48-48zm128 0c0-26.5-21.5-48-48-48s-48 21.5-48 48 21.5 48 48 48 48-21.5 48-48z"/></svg>`;
  if (!isChatLoomPanelExpanded) {
    container.innerHTML = `
      <div class="sotl-chat-pill" data-sotl-panel-action="expand" title="Open Loom HUD" role="button" aria-label="Open Loom HUD" tabindex="0">
        ${pawSvg}
      </div>
    `;
    if (!isChatLoomPanelExpanded && !softHide) {
      const hostSelectors = [
        ".chat-action-buttons",
        ".chat-actions",
        ".message-actions",
        ".right-actions",
        "[data-chat-actions]",
        "[data-message-actions]",
        ".lv-chat-actions",
        ".lv-action-strip"
      ];
      let hostContainer = null;
      for (const sel of hostSelectors) {
        hostContainer = doc.querySelector(sel);
        if (hostContainer) break;
      }
      if (hostContainer) {
        container.style.removeProperty("position");
        container.style.setProperty("display", "block");
        container.style.setProperty("margin-top", "8px");
        hostContainer.append(container);
        attachContainerClickHandler(container, ctx, state2, doc);
        return;
      }
    }
  } else {
    container.innerHTML = renderCompactPanel(state2.latestTracker, state2);
  }
  attachContainerClickHandler(container, ctx, state2, doc);
  doc.body.append(container);
}
function attachContainerClickHandler(container, ctx, state2, doc) {
  container.addEventListener("click", (e) => {
    const target = e.target;
    if (!target) return;
    const action = target.dataset.sotlPanelAction || target.closest("[data-sotl-panel-action]")?.getAttribute("data-sotl-panel-action");
    if (action === "collapse") {
      isChatLoomPanelExpanded = false;
      triggerRerender();
    } else if (action === "expand") {
      isChatLoomPanelExpanded = true;
      triggerRerender();
    } else if (action === "toggle-hud-view") {
      const nextView = state2.settings.hudDefaultView === "compact" ? "full" : "compact";
      state2.settings.hudDefaultView = nextView;
      triggerRerender();
      const msg = { type: "save_settings", settings: { hudDefaultView: nextView } };
      if (typeof ctx.sendToBackend === "function") {
        ctx.sendToBackend(msg);
      } else {
        const direct = ctx.sendToBackend || ctx.backend && typeof ctx.backend === "object" && ctx.backend.postMessage;
        if (typeof direct === "function") {
          direct(msg);
        }
      }
    } else if (action === "drawer") {
      isChatLoomPanelExpanded = false;
      triggerRerender();
      setTimeout(() => {
        if (openDrawerCallback) {
          openDrawerCallback();
        } else {
          const ui = ctx.ui && typeof ctx.ui === "object" ? ctx.ui : {};
          const openDrawer = ui.openDrawer ?? ui.showDrawer ?? ui.openPanel ?? ui.activateDrawer;
          if (typeof openDrawer === "function") {
            openDrawer("state_of_the_loom");
          } else {
            const openBtn = doc.querySelector('[data-sotl-action="open-drawer"]');
            openBtn?.click();
          }
        }
      }, 100);
    } else if (action === "generate") {
      if (typeof ctx.sendToBackend === "function") {
        ctx.sendToBackend({ type: "generate_tracker" });
      } else {
        const genBtn = doc.querySelector('[data-sotl-action="generate"]');
        genBtn?.click();
      }
    }
  });
}
function ensureFloatingButton(ctx, state2) {
  const doc = documentRef();
  if (!doc) return;
  doc.querySelector('[data-sotl-dynamic-float="true"]')?.remove();
  if (!state2?.settings.showFloatingButton) return;
  if (isDrawerOpen || isSettingsOpen) return;
  if (typeof globalThis.matchMedia === "function" && globalThis.matchMedia("(max-width: 720px)").matches) return;
  const button2 = doc.createElement("button");
  button2.className = "sotl-float";
  button2.type = "button";
  button2.dataset.sotlDynamicFloat = "true";
  button2.title = "State of the Loom (Experimental)";
  button2.textContent = "L";
  button2.addEventListener("click", () => {
    const ui = ctx.ui && typeof ctx.ui === "object" ? ctx.ui : {};
    const openDrawer = ui.openDrawer ?? ui.showDrawer ?? ui.openPanel;
    if (typeof openDrawer === "function") {
      openDrawer("state_of_the_loom");
    }
  });
  doc.body.append(button2);
}

// src/frontend/styles.ts
var loomStyles = `
.sotl-root, .sotl-card, .sotl-float {
  color: var(--lumiverse-text, var(--lv-text, #1e2329));
  font-family: var(--lv-font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
  letter-spacing: 0;
}
.sotl-root {
  display: grid;
  gap: 14px;
  padding: 14px;
}
.sotl-panel {
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  border-radius: var(--lumiverse-radius, 8px);
  background: var(--lumiverse-fill-subtle, var(--lv-surface, rgba(255, 255, 255, 0.78)));
  padding: 12px;
}
.sotl-panel h2, .sotl-panel h3, .sotl-card h3, .sotl-card h4 {
  margin: 0;
  line-height: 1.2;
  letter-spacing: 0;
}
.sotl-panel h2 {
  font-size: 16px;
}
.sotl-panel h3, .sotl-card h3 {
  font-size: 14px;
}
.sotl-card h4 {
  font-size: 12px;
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  text-transform: uppercase;
}
.sotl-muted, .sotl-note, .sotl-empty {
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
}
.sotl-note {
  font-size: 12px;
  margin: 6px 0 0;
}
.sotl-warning {
  color: var(--lv-warning-text, #8a4f00);
}
.sotl-status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.sotl-chip, .sotl-pill {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  background: var(--lumiverse-fill, var(--lv-surface-raised, rgba(248, 250, 252, 0.9)));
  font-size: 12px;
}
.sotl-chip[data-ok="true"] {
  color: var(--lv-success-text, #176b43);
  border-color: rgba(27, 126, 80, 0.35);
}
.sotl-chip[data-ok="false"] {
  color: var(--lv-warning-text, #8a4f00);
  border-color: rgba(176, 104, 0, 0.35);
}
.sotl-fields {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}
.sotl-label {
  display: grid;
  gap: 5px;
  font-size: 12px;
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
}
.sotl-select, .sotl-input, .sotl-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  border-radius: var(--lumiverse-radius, 6px);
  background: var(--lumiverse-fill, var(--lv-input-bg, #fff));
  color: inherit;
  padding: 8px;
  font: inherit;
}
.sotl-textarea {
  min-height: 180px;
  resize: vertical;
  font-family: var(--lv-font-mono, ui-monospace, SFMono-Regular, Consolas, monospace);
  font-size: 12px;
}
.sotl-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.sotl-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  border-radius: 6px;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  background: var(--lumiverse-fill-subtle, var(--lv-button-bg, #f7f8fa));
  color: inherit;
  padding: 0 10px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}
.sotl-button[data-primary="true"] {
  background: var(--lv-accent, #3864d9);
  border-color: var(--lv-accent, #3864d9);
  color: var(--lv-on-accent, #fff);
}
.sotl-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}
.sotl-button:focus-visible, .sotl-icon-button:focus-visible, .sotl-float:focus-visible {
  outline: 2px solid var(--lv-accent, #3864d9);
  outline-offset: 2px;
}
.sotl-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.sotl-preview {
  overflow: auto;
  max-height: 420px;
}
.sotl-card {
  --sotl-card-bg: var(--lumiverse-fill, var(--lv-surface-raised, #ffffff));
  display: grid;
  gap: 10px;
  margin: 8px 0;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  border-radius: 8px;
  background: var(--sotl-card-bg);
  padding: 12px;
  box-shadow: 0 1px 2px rgba(20, 24, 32, 0.06);
}
.sotl-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.sotl-card__eyebrow {
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  font-size: 11px;
  text-transform: uppercase;
}
.sotl-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}
.sotl-grid div {
  min-width: 0;
}
.sotl-grid dt {
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  font-size: 11px;
}
.sotl-grid dd {
  margin: 1px 0 0;
  overflow-wrap: anywhere;
}
.sotl-delta {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
}
.sotl-section {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.sotl-section ul {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.sotl-section li {
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.22)));
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.sotl-row {
  display: grid;
  grid-template-columns: minmax(70px, 1fr) minmax(70px, 1fr) minmax(90px, 1.2fr);
  gap: 6px;
  align-items: center;
  border-bottom: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.16)));
  padding-bottom: 6px;
  font-size: 12px;
}
.sotl-row span, .sotl-row em, .sotl-row strong {
  min-width: 0;
  overflow-wrap: anywhere;
}
.sotl-message-card {
  position: relative;
}
.sotl-message-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
  margin-bottom: 4px;
}
.sotl-icon-button {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  background: var(--lumiverse-fill, var(--lv-surface, #fff));
  color: inherit;
  cursor: pointer;
  line-height: 1;
}
.sotl-code {
  white-space: pre-wrap;
  overflow: auto;
  max-height: 240px;
  padding: 8px;
  border-radius: 6px;
  background: var(--lv-code-bg, rgba(40, 45, 55, 0.06));
  font-family: var(--lv-font-mono, ui-monospace, SFMono-Regular, Consolas, monospace);
  font-size: 12px;
}
.sotl-details {
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.18)));
  border-radius: var(--lumiverse-radius, 6px);
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.35));
  padding: 8px 10px;
  margin-top: 8px;
}
.sotl-details summary {
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: var(--lumiverse-text, var(--lv-text, #1e2329));
  user-select: none;
  outline: none;
}
.sotl-details[open] summary {
  border-bottom: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.15)));
  padding-bottom: 6px;
  margin-bottom: 8px;
}
.sotl-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}
.sotl-feature-grid article {
  display: grid;
  gap: 4px;
  min-width: 0;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.18)));
  border-radius: 7px;
  padding: 8px;
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.55));
}
.sotl-feature-grid strong {
  font-size: 12px;
}
.sotl-feature-grid span {
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  font-size: 12px;
  line-height: 1.35;
}
.sotl-float {
  position: fixed;
  right: 16px;
  bottom: 76px;
  z-index: 30;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  background: var(--lumiverse-fill, var(--lv-surface-raised, #fff));
  box-shadow: 0 8px 24px rgba(20, 24, 32, 0.18);
  cursor: pointer;
}
.sotl-boot {
  width: auto;
  min-width: 58px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
}
.sotl-card-details {
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.15)));
  border-radius: var(--lumiverse-radius, 6px);
  background: var(--lumiverse-fill-subtle, var(--lv-surface-subtle, rgba(255, 255, 255, 0.2)));
  padding: 6px 8px;
  margin-top: 6px;
  font-size: 12px;
}
.sotl-card-details summary {
  font-weight: 600;
  cursor: pointer;
  outline: none;
  user-select: none;
}
.sotl-card-details[open] summary {
  border-bottom: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.12)));
  padding-bottom: 4px;
  margin-bottom: 6px;
}
.sotl-cast-section {
  margin-top: 8px;
}
.sotl-cast-section h4 {
  margin: 0 0 6px;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
}
.sotl-cast-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sotl-cast-chip {
  background: var(--lumiverse-fill-subtle, var(--lv-surface-subtle, rgba(255, 255, 255, 0.2)));
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.15)));
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.sotl-cast-role {
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  font-size: 11px;
}
.sotl-cast-pos {
  font-style: italic;
  font-size: 11px;
}
.sotl-cast-emo {
  font-size: 11px;
  color: var(--lv-accent, #3864d9);
}
.sotl-card__title {
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 700;
}
.sotl-pill--mood {
  background: var(--lv-accent, #3864d9) !important;
  color: var(--lv-on-accent, #fff) !important;
  border-color: var(--lv-accent, #3864d9) !important;
}
/*
 * State of the Loom Collapsed Paw Print HUD Launcher Position.
 * Easily tune the placement coordinates by changing these CSS variables.
 * They are designed as a safe compatibility overlay, isolated from host DOM.
 */
.sotl-chat-panel-container {
  /*
   * Paw launcher coordinates. Tune these to match the host UI.
   * Target: flush right edge, just below the star/spark side icon.
   * --sotl-launcher-top: vertical position of the button from the top.
   * --sotl-launcher-right: distance from right edge (12px matches star icon).
   * --sotl-launcher-size: button size, matches star icon.
   * --sotl-launcher-gap: gap below star icon.
   */
  --sotl-launcher-top: 130px;
  --sotl-launcher-right: 12px;
  --sotl-launcher-size: 36px;
  --sotl-launcher-gap: 8px;
  --sotl-launcher-top-mobile: 130px;
  --sotl-launcher-right-mobile: 12px;

  font-family: var(--lv-font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
  color: var(--lumiverse-text, var(--lv-text, #1e2329));
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
}
.sotl-chat-panel-container:not(.sotl-chat-panel-container--expanded) {
  position: fixed;
  right: var(--sotl-launcher-right);
  top: var(--sotl-launcher-top);
  transform: none; /* Precise absolute coordinates matching star icon gap */
}
.sotl-chat-panel-container.sotl-chat-panel-container--expanded {
  position: fixed;
  top: 60px;
  right: 16px;
}
.sotl-chat-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--lumiverse-fill, var(--lv-surface-raised, rgba(255, 255, 255, 0.85)));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.25)));
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(20, 24, 32, 0.12);
  user-select: none;
  transition: all 0.2s ease;
  padding: 0;
  color: var(--lumiverse-text, var(--lv-text, #1e2329));
}
.sotl-chat-pill:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px var(--lv-accent-glow, rgba(56, 100, 217, 0.4)), 0 4px 16px rgba(20, 24, 32, 0.18);
  border-color: var(--lv-accent, #3864d9);
  color: var(--lv-accent, #3864d9);
  background: var(--lv-surface-hover, rgba(255, 255, 255, 0.95));
}
.sotl-chat-panel {
  width: 320px;
  background: var(--lumiverse-fill, var(--lv-surface-raised, rgba(255, 255, 255, 0.95)));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(20, 24, 32, 0.22);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sotl-chat-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.15)));
  padding-bottom: 6px;
}
.sotl-chat-panel__title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}
.sotl-chat-panel__head-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sotl-chat-panel__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.18)));
  background: var(--lumiverse-fill-subtle, var(--lv-surface-subtle, rgba(255, 255, 255, 0.2)));
  color: var(--lumiverse-text, var(--lv-text, #1e2329));
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}
.sotl-chat-panel__action-btn:hover {
  background: var(--lumiverse-fill, var(--lv-surface, rgba(255, 255, 255, 0.8)));
  border-color: var(--lv-accent, #3864d9);
  color: var(--lv-accent, #3864d9);
}
.sotl-chat-panel__action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sotl-chat-panel__action-btn--close {
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  font-size: 12px;
}
.sotl-chat-panel__action-btn--close:hover {
  color: var(--lv-warning-text, #b06800);
  border-color: var(--lv-warning-text, #b06800);
}
.sotl-chat-panel__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
}
.sotl-chat-panel__scroll-body {
  overflow-y: auto;
  max-height: 280px;
  padding-right: 4px;
}
.sotl-chat-panel__scroll-body::-webkit-scrollbar {
  width: 5px;
}
.sotl-chat-panel__scroll-body::-webkit-scrollbar-track {
  background: transparent;
}
.sotl-chat-panel__scroll-body::-webkit-scrollbar-thumb {
  background: var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.2)));
  border-radius: 99px;
}
.sotl-chat-panel__scroll-body::-webkit-scrollbar-thumb:hover {
  background: var(--lv-accent, #3864d9);
}
.sotl-chat-panel__scene {
  font-weight: 700;
  font-size: 13px;
  margin: 0;
}
.sotl-chat-panel__meta {
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  font-size: 11px;
}
.sotl-chat-panel__desc {
  margin: 2px 0 0;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
@keyframes sotl-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.sotl-spin {
  animation: sotl-spin 1.2s linear infinite;
}
@media (max-width: 520px) {
  .sotl-root {
    padding: 10px;
  }
  .sotl-grid, .sotl-row, .sotl-feature-grid {
    grid-template-columns: 1fr;
  }
  .sotl-card__head {
    flex-direction: column;
  }
  .sotl-float {
    right: 12px;
    bottom: 88px;
  }
  .sotl-chat-panel-container:not(.sotl-chat-panel-container--expanded) {
    right: var(--sotl-launcher-right-mobile);
    top: var(--sotl-launcher-top-mobile);
    display: flex !important;
  }
  .sotl-chat-panel-container.sotl-chat-panel-container--expanded {
    right: 12px;
    top: 70px;
    max-width: calc(100vw - 24px);
  }
  .sotl-chat-panel {
    width: 100%;
  }
}

`;

// src/frontend/frontend.ts
var state = null;
var contextRef = null;
var drawerHandle = null;
var settingsHandle = null;
var drawerRoot = null;
var settingsRoot = null;
var fallbackRoot = null;
var backendTimedOut = false;
var backendTimer;
var messageCardRetryTimer;
var lastFrontendError;
var lastRenderStatus;
var lastToast;
var cleanupFns = [];
var rootListenerCleanups = /* @__PURE__ */ new Map();
function documentRef2() {
  return typeof document === "undefined" ? null : document;
}
function isRecord(value) {
  return Boolean(value) && typeof value === "object";
}
function isElement(value) {
  return typeof HTMLElement !== "undefined" && value instanceof HTMLElement;
}
function getUi(ctx) {
  return ctx.ui && typeof ctx.ui === "object" ? ctx.ui : {};
}
function postToBackend(ctx, message) {
  if (typeof ctx.sendToBackend === "function") {
    ctx.sendToBackend(message);
    return;
  }
  const backend = ctx.backend && typeof ctx.backend === "object" ? ctx.backend : {};
  const send = backend.send ?? backend.postMessage ?? backend.emit;
  if (typeof send === "function") {
    send(message);
    return;
  }
  const direct = ctx.sendToBackend ?? ctx.postMessage;
  if (typeof direct === "function") direct(message);
}
function uiStatus() {
  return {
    backendTimedOut,
    lastFrontendError,
    lastRenderStatus,
    lastToast
  };
}
function clearBackendTimer() {
  if (backendTimer !== void 0 && typeof globalThis.clearTimeout === "function") {
    globalThis.clearTimeout(backendTimer);
  }
  backendTimer = void 0;
}
function startBackendTimer() {
  clearBackendTimer();
  backendTimedOut = false;
  if (typeof globalThis.setTimeout !== "function") return;
  backendTimer = globalThis.setTimeout(() => {
    if (!state) {
      backendTimedOut = true;
      rerender();
    }
  }, 3500);
}
function requestBackendState(message = { type: "refresh_state" }) {
  if (!contextRef) return;
  postToBackend(contextRef, message);
  startBackendTimer();
}
function installStyle(ctx) {
  const dom = ctx.dom && typeof ctx.dom === "object" ? ctx.dom : {};
  const addStyle = dom.addStyle ?? getUi(ctx).addStyle ?? ctx.addStyle;
  if (typeof addStyle === "function") {
    const cleanup = addStyle(loomStyles, "state-of-the-loom-styles");
    if (typeof cleanup === "function") cleanupFns.push(cleanup);
    return;
  }
  const doc = documentRef2();
  if (!doc || doc.getElementById("state-of-the-loom-styles")) return;
  const style = doc.createElement("style");
  style.id = "state-of-the-loom-styles";
  style.textContent = loomStyles;
  doc.head.append(style);
  cleanupFns.push(() => style.remove());
}
function renderInto(root, html) {
  if (root) root.innerHTML = html;
}
function bindRootEvents(root) {
  if (rootListenerCleanups.has(root)) return;
  const click = (event) => handleDrawerEvent(event);
  const change = (event) => handleDrawerEvent(event);
  root.addEventListener("click", click);
  root.addEventListener("change", change);
  const cleanup = () => {
    root.removeEventListener("click", click);
    root.removeEventListener("change", change);
    rootListenerCleanups.delete(root);
  };
  rootListenerCleanups.set(root, cleanup);
  cleanupFns.push(cleanup);
}
function registerDrawer(ctx) {
  const ui = getUi(ctx);
  const register = ui.registerDrawerTab ?? ui.registerTab ?? ui.addDrawerTab;
  const html = renderDrawer(state, uiStatus());
  if (typeof register === "function") {
    try {
      const result = register({
        id: "state_of_the_loom",
        title: "State of the Loom",
        shortName: "Loom",
        headerTitle: "Loom",
        description: "Open the State of the Loom continuity tracker HUD",
        keywords: ["state", "loom", "tracker", "continuity", "roleplay"],
        iconSvg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h2v18H5V3Zm12 0h2v18h-2V3ZM9 5h6v2H9V5Zm0 4h6v2H9V9Zm0 4h6v2H9v-2Zm0 4h6v2H9v-2Z"/></svg>'
      });
      drawerHandle = result ?? null;
      if (isRecord(result) && isElement(result.root)) {
        drawerRoot = result.root;
        bindRootEvents(drawerRoot);
        renderInto(drawerRoot, html);
        return;
      }
      if (drawerHandle?.update) drawerHandle.update(html);
      return;
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      console.warn?.(`State of the Loom drawer registration failed: ${text}`);
    }
  }
  const doc = documentRef2();
  if (!doc) return;
  fallbackRoot = doc.createElement("div");
  fallbackRoot.dataset.sotlDrawerFallback = "true";
  bindRootEvents(fallbackRoot);
  fallbackRoot.innerHTML = html;
  doc.body.append(fallbackRoot);
}
function registerSettingsMount(ctx) {
  const mount = getUi(ctx).mount;
  if (typeof mount !== "function") return;
  try {
    const result = mount("settings_extensions");
    if (isElement(result)) {
      settingsRoot = result;
      bindRootEvents(settingsRoot);
      renderInto(settingsRoot, renderSettingsPanel(state, uiStatus()));
      return;
    }
    if (isRecord(result) && isElement(result.root)) {
      settingsHandle = result;
      settingsRoot = result.root;
      bindRootEvents(settingsRoot);
      renderInto(settingsRoot, renderSettingsPanel(state, uiStatus()));
    }
  } catch {
  }
}
function registerInputActions(ctx) {
  const register = getUi(ctx).registerInputBarAction;
  if (typeof register !== "function") return;
  try {
    const openAction = register({
      id: "open_loom",
      label: "Open Loom",
      iconSvg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h2v18H5V3Zm12 0h2v18h-2V3ZM9 5h6v2H9V5Zm0 4h6v2H9V9Zm0 4h6v2H9v-2Zm0 4h6v2H9v-2Z"/></svg>',
      enabled: true
    });
    if (openAction?.onClick) cleanupFns.push(openAction.onClick(() => activateDrawer()));
    if (openAction?.destroy) cleanupFns.push(() => openAction.destroy?.());
    const generateAction = register({
      id: "generate_loom_tracker",
      label: "Generate Loom",
      iconSvg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l1.5 5.1L19 8l-4.4 3.3L16 17l-4-3-4 3 1.4-5.7L5 8l5.5-.9L12 2Zm-7 15h14v2H5v-2Z"/></svg>',
      enabled: true
    });
    if (generateAction?.onClick) cleanupFns.push(generateAction.onClick(() => {
      if (contextRef) postToBackend(contextRef, { type: "generate_tracker" });
    }));
    if (generateAction?.destroy) cleanupFns.push(() => generateAction.destroy?.());
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    console.warn?.(`State of the Loom input action registration failed: ${text}`);
  }
}
function activateDrawer() {
  if (drawerHandle?.activate) {
    drawerHandle.activate();
  }
  const doc = documentRef2();
  if (doc) {
    setTimeout(() => {
      const currentLoom = doc.querySelector(".sotl-card") ?? doc.querySelector('[data-sotl-card="true"]') ?? drawerRoot?.querySelector(".sotl-card");
      if (currentLoom) {
        currentLoom.scrollIntoView({ behavior: "smooth", block: "nearest" });
        if (currentLoom instanceof HTMLElement) currentLoom.focus?.();
      } else {
        drawerRoot?.scrollIntoView({ behavior: "smooth", block: "start" });
        fallbackRoot?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  }
}
function paint(status) {
  if (state && state.latestTracker && state.diagnostics.pipelineReport) {
    try {
      const render = renderTrackerForState(state.latestTracker, state);
      const report = state.diagnostics.pipelineReport;
      report.fallbackUsed = render.fallbackUsed;
      report.renderSuccess = render.success;
      report.sanitizerRemovedContent = render.sanitizerRemovedContent;
      report.renderWarning = render.warning;
      report.renderError = render.error;
      report.trackerPresetId = state.latestTracker.presetId;
    } catch {
    }
  }
  renderInto(drawerRoot, renderDrawer(state, status));
  renderInto(settingsRoot, renderSettingsPanel(state, status));
  if (drawerHandle?.update) drawerHandle.update(renderDrawer(state, status));
  if (settingsHandle?.update) settingsHandle.update(renderSettingsPanel(state, status));
  if (fallbackRoot) fallbackRoot.innerHTML = renderDrawer(state, status);
}
function updateMessageCardStatus() {
  if (contextRef) {
    const result = mountMessageCards(contextRef, state);
    lastRenderStatus = result.status;
    ensureFloatingButton(contextRef, state);
    ensureChatLoomPanel(contextRef, state);
  }
}
function rerender() {
  const before = uiStatus();
  paint(before);
  updateMessageCardStatus();
  if (lastRenderStatus !== before.lastRenderStatus) paint(uiStatus());
}
function scheduleMessageCardRetry() {
  if (messageCardRetryTimer !== void 0 && typeof globalThis.clearTimeout === "function") {
    globalThis.clearTimeout(messageCardRetryTimer);
  }
  if (typeof globalThis.setTimeout !== "function") return;
  messageCardRetryTimer = globalThis.setTimeout(() => {
    messageCardRetryTimer = void 0;
    updateMessageCardStatus();
    paint(uiStatus());
  }, 400);
}
function saveSettings(patch) {
  if (!contextRef) return;
  postToBackend(contextRef, { type: "save_settings", settings: patch });
}
function handleDrawerEvent(event) {
  const markedEvent = event;
  if (markedEvent.__sotlHandled) return;
  const target = event.target;
  if (!target || !contextRef) return;
  const actionButton = target.closest("[data-sotl-action]");
  if (actionButton) {
    markedEvent.__sotlHandled = true;
    const action = actionButton.dataset.sotlAction || "";
    if (action === "open-drawer") activateDrawer();
    if (action === "generate") postToBackend(contextRef, { type: "generate_tracker" });
    if (action === "cancel-generation") {
      postToBackend(contextRef, { type: "cancel_generation" });
      return;
    }
    if (action === "refresh") requestBackendState({ type: "refresh_state" });
    if (action === "reset-storage") {
      const confirmFn = typeof globalThis.confirm === "function" ? globalThis.confirm : null;
      if (confirmFn && !confirmFn("Reset State of the Loom settings, presets, and trackers for this user?")) return;
      postToBackend(contextRef, { type: "reset_storage" });
      startBackendTimer();
    }
    if (action.startsWith("regenerate:")) postToBackend(contextRef, { type: "generate_tracker", messageId: action.slice("regenerate:".length) });
    if (action.startsWith("hide:") && state?.activeChat.id) postToBackend(contextRef, { type: "hide_tracker", chatId: state.activeChat.id, messageId: action.slice("hide:".length), hidden: true });
    if (action.startsWith("delete:") && state?.activeChat.id) postToBackend(contextRef, { type: "delete_tracker", chatId: state.activeChat.id, messageId: action.slice("delete:".length) });
    if (action === "card-regenerate") postToBackend(contextRef, { type: "generate_tracker", messageId: actionButton.dataset.sotlMessageId });
    if (action === "card-edit") activateDrawer();
    if (action === "card-hide" && state?.activeChat.id) postToBackend(contextRef, { type: "hide_tracker", chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId, hidden: true });
    if (action === "card-delete" && state?.activeChat.id) postToBackend(contextRef, { type: "delete_tracker", chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId });
    if (action === "save-json" && state?.latestTracker) {
      const doc = documentRef2();
      const textarea = doc?.querySelector('[data-sotl-field="latestJson"]');
      if (!textarea) return;
      try {
        const parsed = JSON.parse(textarea.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Tracker JSON must be an object.");
        postToBackend(contextRef, {
          type: "edit_tracker",
          tracker: {
            ...state.latestTracker,
            data: parsed
          }
        });
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        const alertFn = typeof globalThis.alert === "function" ? globalThis.alert : null;
        alertFn?.(`State of the Loom JSON edit failed: ${text}`);
      }
    }
    if (action === "copy-json" && state?.latestTracker) {
      const jsonText = JSON.stringify(state.latestTracker.data, null, 2);
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(jsonText).then(() => {
          const alertFn = typeof globalThis.alert === "function" ? globalThis.alert : null;
          alertFn?.("Current Loom JSON copied to clipboard.");
        }).catch((err) => {
          console.error("Failed to copy JSON:", err);
        });
      }
      return;
    }
    if (action === "editor-new") {
      const newId = `custom_loom_${Date.now()}`;
      const newPreset = {
        id: newId,
        name: "New Custom Loom",
        version: "1.0.12",
        description: "User custom continuity tracker.",
        mode: "hybrid",
        schemaJson: {
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
        htmlTemplate: [
          '<section class="sotl-card sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
          '  <header class="sotl-card__head">',
          '    <div class="sotl-card__header-main">',
          '      <h3 class="sotl-card__title">{{sceneTitle}}</h3>',
          "    </div>",
          "  </header>",
          '  <dl class="sotl-grid">',
          '    <div class="sotl-grid-item"><dt>Location</dt><dd>{{location}}</dd></div>',
          "  </dl>",
          "</section>"
        ].join("\n"),
        promptInstructions: "Return valid JSON only. Do not use markdown fences. Update what changed.",
        injectionTemplate: "[Custom Loom]\n{{compactSummary}}",
        maxInjectionTokens: 150,
        defaultPlacement: "top",
        renderOptions: { density: "compact", theme: "system", showControls: true },
        parserOptions: { fenceNames: ["tracker", "loom"], strictJson: true, repairInvalidJson: false },
        sampleData: { sceneTitle: "New Scene", location: "Foyer" },
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      selectPresetForEditing(newPreset);
      rerender();
      return;
    }
    if (action === "editor-duplicate" && editingPreset) {
      const baseId = editingPreset.id.replace(/_copy_\d+/g, "");
      const newId = `${baseId}_copy_${Date.now()}`;
      const newPreset = {
        ...editingPreset,
        id: newId,
        name: `${editingPreset.name} Copy`,
        origin: "duplicated",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      postToBackend(contextRef, { type: "save_preset", preset: newPreset, makeActive: true });
      selectPresetForEditing(newPreset);
      lastToast = { level: "success", message: `Duplicated and active preset set to custom duplicate '${newPreset.name}'.` };
      rerender();
      return;
    }
    if (action === "editor-save" && editingPreset) {
      postToBackend(contextRef, { type: "save_preset", preset: editingPreset });
      return;
    }
    if (action === "editor-delete" && editingPreset) {
      const confirmFn = typeof globalThis.confirm === "function" ? globalThis.confirm : null;
      if (confirmFn && !confirmFn(`Delete custom template '${editingPreset.name}'?`)) return;
      postToBackend(contextRef, { type: "delete_preset", presetId: editingPreset.id });
      selectPresetForEditing(null);
      rerender();
      return;
    }
    if (action === "editor-reset") {
      const confirmFn = typeof globalThis.confirm === "function" ? globalThis.confirm : null;
      if (confirmFn && !confirmFn("Are you sure you want to delete all custom templates? This cannot be undone.")) return;
      postToBackend(contextRef, { type: "reset_presets" });
      selectPresetForEditing(null);
      rerender();
      return;
    }
    if (action === "editor-preview") {
      runPreview();
      rerender();
      return;
    }
    if (action === "editor-export" && editingPreset) {
      const jsonText = JSON.stringify(editingPreset, null, 2);
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(jsonText).then(() => {
          const alertFn = typeof globalThis.alert === "function" ? globalThis.alert : null;
          alertFn?.("Template JSON copied to clipboard.");
        }).catch((err) => {
          console.error("Failed to copy template JSON:", err);
        });
      }
      return;
    }
    if (action === "editor-download" && editingPreset) {
      try {
        const jsonText = JSON.stringify(editingPreset, null, 2);
        const blob = new Blob([jsonText], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${editingPreset.id}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 200);
      } catch (err) {
        console.error("Failed to download template:", err);
      }
      return;
    }
    if (action === "editor-download-all") {
      try {
        const customPresets = state?.presets.filter((p) => !builtInPresets.some((bp) => bp.id === p.id)) ?? [];
        if (customPresets.length === 0) {
          const alertFn = typeof globalThis.alert === "function" ? globalThis.alert : null;
          alertFn?.("No custom templates to download.");
          return;
        }
        const jsonText = JSON.stringify({ presets: customPresets }, null, 2);
        const blob = new Blob([jsonText], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "loom-custom-templates.json";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 200);
      } catch (err) {
        console.error("Failed to download custom templates pack:", err);
      }
      return;
    }
    if (action === "editor-upload-single") {
      const doc = documentRef2();
      const fileInput = doc?.getElementById("sotl-upload-single");
      if (fileInput) {
        fileInput.value = "";
        fileInput.click();
      } else {
        setImportStatus({ ok: false, message: "File upload is unavailable in this environment. Use the Paste import instead." });
        rerender();
      }
      return;
    }
    if (action === "editor-upload-pack") {
      const doc = documentRef2();
      const fileInput = doc?.getElementById("sotl-upload-pack");
      if (fileInput) {
        fileInput.value = "";
        fileInput.click();
      } else {
        setImportStatus({ ok: false, message: "File upload is unavailable in this environment. Use the Paste import instead." });
        rerender();
      }
      return;
    }
    if (action === "editor-import") {
      const doc = documentRef2();
      const textarea = doc?.getElementById("sotl-import-paste");
      const rawText = textarea?.value?.trim() ?? "";
      if (!rawText) {
        setImportStatus({ ok: false, message: "Paste area is empty. Paste valid template JSON above then click Import." });
        rerender();
        return;
      }
      try {
        const parsed = JSON.parse(rawText);
        let candidates;
        if (Array.isArray(parsed)) {
          candidates = parsed;
        } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.presets)) {
          candidates = parsed.presets;
        } else {
          candidates = [parsed];
        }
        const valid = [];
        const failures = [];
        for (const candidate of candidates) {
          if (!isPresetValid(candidate)) {
            failures.push("One item is missing required fields (id, name, htmlTemplate).");
            continue;
          }
          const p = { ...candidate };
          if (builtInPresets.some((bp) => bp.id === p.id)) {
            p.id = `${p.id}_custom_${Date.now()}`;
            p.name = `${p.name} (Custom Copy)`;
          }
          p.origin = "imported";
          if (!p.createdAt) p.createdAt = (/* @__PURE__ */ new Date()).toISOString();
          p.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
          valid.push(p);
        }
        if (valid.length === 0) {
          const failMsg = failures.length > 0 ? failures[0] : "No valid presets found in the pasted JSON.";
          setImportStatus({ ok: false, message: failMsg });
          rerender();
          return;
        }
        for (let i = 0; i < valid.length; i += 1) {
          postToBackend(contextRef, { type: "save_preset", preset: valid[i], makeActive: i === 0 });
        }
        const first = valid[0];
        selectPresetForEditing(first);
        if (textarea) textarea.value = "";
        const plural = valid.length > 1 ? `${valid.length} templates` : `"${first.name}"`;
        const failNote = failures.length > 0 ? ` (${failures.length} item(s) skipped \u2014 missing required fields)` : "";
        setImportStatus({
          ok: true,
          message: `Imported ${plural} successfully. Now auto-selected as active preset.${failNote}`,
          presetName: first.name,
          presetId: first.id
        });
        rerender();
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        setImportStatus({ ok: false, message: `JSON parse error: ${text}` });
        rerender();
      }
      return;
    }
    return;
  }
  if (event.type === "change" && target instanceof HTMLInputElement && target.type === "file") {
    const fileAction = target.dataset.sotlFileAction || target.getAttribute("data-sotl-file-action") || "";
    const file = target.files?.[0];
    if (!file || !contextRef) {
      setImportStatus({ ok: false, message: "No file was selected or file upload is unavailable." });
      rerender();
      return;
    }
    markedEvent.__sotlHandled = true;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === "string" ? reader.result : "";
        const parsed = JSON.parse(text);
        let candidates;
        if (fileAction === "file-upload-pack") {
          if (Array.isArray(parsed)) {
            candidates = parsed;
          } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.presets)) {
            candidates = parsed.presets;
          } else if (isPresetValid(parsed)) {
            candidates = [parsed];
          } else {
            throw new Error('Pack file must be a JSON array or an object with a "presets" array.');
          }
        } else {
          if (Array.isArray(parsed)) {
            candidates = parsed;
          } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.presets)) {
            candidates = parsed.presets;
          } else {
            candidates = [parsed];
          }
        }
        const valid = [];
        const failures = [];
        for (const candidate of candidates) {
          if (!isPresetValid(candidate)) {
            failures.push("One item is missing required fields.");
            continue;
          }
          const p = { ...candidate };
          if (builtInPresets.some((bp) => bp.id === p.id)) {
            p.id = `${p.id}_custom_${Date.now()}`;
            p.name = `${p.name} (Custom Copy)`;
          }
          p.origin = "imported";
          if (!p.createdAt) p.createdAt = (/* @__PURE__ */ new Date()).toISOString();
          p.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
          valid.push(p);
        }
        if (valid.length === 0) {
          const failMsg = failures.length > 0 ? failures[0] : "No valid presets found in the file.";
          setImportStatus({ ok: false, message: failMsg });
          rerender();
          target.value = "";
          return;
        }
        for (let i = 0; i < valid.length; i += 1) {
          if (contextRef) postToBackend(contextRef, { type: "save_preset", preset: valid[i], makeActive: i === 0 });
        }
        const first = valid[0];
        selectPresetForEditing(first);
        const plural = valid.length > 1 ? `${valid.length} templates` : `"${first.name}"`;
        const failNote = failures.length > 0 ? ` (${failures.length} skipped \u2014 missing fields)` : "";
        setImportStatus({
          ok: true,
          message: `Imported ${plural} from file. Auto-selected as active preset.${failNote}`,
          presetName: first.name,
          presetId: first.id
        });
        rerender();
      } catch (err) {
        const text = err instanceof Error ? err.message : String(err);
        setImportStatus({ ok: false, message: `File parse error: ${text}` });
        rerender();
      }
      target.value = "";
    };
    reader.onerror = () => {
      setImportStatus({ ok: false, message: "Failed to read the uploaded file. Please try again." });
      rerender();
      target.value = "";
    };
    reader.readAsText(file);
    return;
  }
  const editorField = target.closest("[data-sotl-editor-field]");
  if (editorField) {
    if (event.type !== "change") return;
    markedEvent.__sotlHandled = true;
    const fieldName2 = editorField.dataset.sotlEditorField || "";
    if (fieldName2 === "selectedPresetId" && target instanceof HTMLSelectElement) {
      const preset = state?.presets.find((p) => p.id === target.value);
      if (preset) {
        selectPresetForEditing(preset);
      }
    } else if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      updateEditingField(fieldName2, target.value);
    }
    rerender();
    return;
  }
  const field = target.closest("[data-sotl-field]");
  if (!field) return;
  if (event.type !== "change") return;
  markedEvent.__sotlHandled = true;
  const fieldName = field.dataset.sotlField;
  if (fieldName === "enabled" && field instanceof HTMLInputElement) {
    saveSettings({ enabled: field.checked });
  }
  if (fieldName === "preset" && field instanceof HTMLSelectElement) {
    postToBackend(contextRef, { type: "select_preset", presetId: field.value });
  }
  if (fieldName === "connection" && field instanceof HTMLSelectElement) {
    saveSettings({ sidecarConnectionId: field.value || void 0 });
  }
  if (fieldName === "autoGenerate" && field instanceof HTMLInputElement) {
    saveSettings({ autoGenerate: field.checked });
  }
  if (fieldName === "fallback" && field instanceof HTMLInputElement) {
    saveSettings({ useDefaultConnectionFallback: field.checked });
  }
  if (fieldName === "floating" && field instanceof HTMLInputElement) {
    saveSettings({ showFloatingButton: field.checked });
  }
  if (fieldName === "messageButtons" && field instanceof HTMLInputElement) {
    saveSettings({ showMessageButtons: field.checked });
  }
  if (fieldName === "stripBlocks" && field instanceof HTMLInputElement) {
    saveSettings({ stripTrackerBlocksFromMessages: field.checked });
  }
  if (fieldName === "useSafeRenderer" && field instanceof HTMLInputElement) {
    saveSettings({ useSafeRenderer: field.checked });
  }
  if (fieldName === "messageCardPlacement" && field instanceof HTMLSelectElement) {
    saveSettings({ messageCardPlacement: field.value });
  }
  if (fieldName === "showChatHudLauncher" && field instanceof HTMLInputElement) {
    saveSettings({ showChatHudLauncher: field.checked });
  }
  if (fieldName === "renderInMessages" && field instanceof HTMLInputElement) {
    saveSettings({ renderInMessages: field.checked });
  }
  if (fieldName === "cardDensity" && field instanceof HTMLSelectElement) {
    saveSettings({ cardDensity: field.value });
  }
  if (fieldName === "hudDefaultView" && field instanceof HTMLSelectElement) {
    saveSettings({ hudDefaultView: field.value });
  }
  if (fieldName === "trackerHistoryLimit" && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ trackerHistoryLimit: val });
  }
  if (fieldName === "sidecarGenerationTimeoutMs" && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ sidecarGenerationTimeoutMs: val });
  }
}
function handleBackendMessage(message) {
  if (message.type === "state") state = message.state;
  if (message.type === "tracker_generated" || message.type === "tracker_updated" || message.type === "tracker_deleted" || message.type === "tracker_error" || message.type === "permissions_changed" || message.type === "storage_reset") {
    state = message.state;
  }
  if (message.type === "storage_reset") clearImportStatus();
  if (message.type === "settings_saved" && state) state = { ...state, settings: message.settings };
  if (message.type === "error") lastFrontendError = message.message;
  if (message.type === "toast") lastToast = { level: message.level, message: message.message };
  if (state) {
    backendTimedOut = false;
    clearBackendTimer();
  }
  rerender();
  if (message.type === "tracker_generated" || message.type === "tracker_updated" || message.type === "state") {
    scheduleMessageCardRetry();
  }
}
function registerBackendListener(ctx) {
  const backend = ctx.backend && typeof ctx.backend === "object" ? ctx.backend : {};
  const on = ctx.onBackendMessage ?? backend.onMessage ?? backend.on;
  if (typeof on === "function") {
    const unsubscribe = on(handleBackendMessage);
    if (typeof unsubscribe === "function") cleanupFns.push(unsubscribe);
  }
}
function registerFrontendEvents(ctx) {
  const events = ctx.events && typeof ctx.events === "object" ? ctx.events : {};
  const on = events.on;
  if (typeof on !== "function") return;
  for (const eventName of ["CHARACTER_MESSAGE_RENDERED", "MESSAGE_RENDERED", "CHAT_CHANGED", "CHAT_SWITCHED"]) {
    try {
      const unsubscribe = on(eventName, () => {
        scheduleMessageCardRetry();
      });
      if (typeof unsubscribe === "function") cleanupFns.push(unsubscribe);
    } catch {
    }
  }
}
function setup(ctx) {
  contextRef = ctx;
  registerRerenderCallback(() => rerender());
  registerOpenDrawerCallback(() => activateDrawer());
  installStyle(ctx);
  registerDrawer(ctx);
  registerSettingsMount(ctx);
  registerInputActions(ctx);
  registerBackendListener(ctx);
  registerFrontendEvents(ctx);
  const ui = ctx.ui && typeof ctx.ui === "object" ? ctx.ui : {};
  const uiEvents = ui.events && typeof ui.events === "object" ? ui.events : {};
  if (typeof uiEvents.onDrawerChange === "function") {
    try {
      const unsub = uiEvents.onDrawerChange((payload) => {
        setDrawerOpenState(payload.open);
        rerender();
      });
      cleanupFns.push(unsub);
    } catch {
    }
  }
  if (typeof uiEvents.onSettingsChange === "function") {
    try {
      const unsub = uiEvents.onSettingsChange((payload) => {
        setSettingsOpenState(payload.open);
        rerender();
      });
      cleanupFns.push(unsub);
    } catch {
    }
  }
  documentRef2()?.addEventListener("click", handleDrawerEvent);
  documentRef2()?.addEventListener("change", handleDrawerEvent);
  postToBackend(ctx, { type: "ready" });
  startBackendTimer();
  rerender();
  return () => {
    documentRef2()?.removeEventListener("click", handleDrawerEvent);
    documentRef2()?.removeEventListener("change", handleDrawerEvent);
    while (cleanupFns.length > 0) cleanupFns.pop()?.();
    drawerHandle?.destroy?.();
    settingsHandle?.destroy?.();
    clearBackendTimer();
    if (messageCardRetryTimer !== void 0 && typeof globalThis.clearTimeout === "function") globalThis.clearTimeout(messageCardRetryTimer);
    fallbackRoot?.remove();
    documentRef2()?.querySelector('[data-sotl-dynamic-float="true"]')?.remove();
    documentRef2()?.querySelector(".sotl-chat-panel-container")?.remove();
    documentRef2()?.querySelectorAll('[data-sotl-mounted="true"]').forEach((node) => node.remove());
    rootListenerCleanups.clear();
  };
}
export {
  setup as default,
  setup
};
