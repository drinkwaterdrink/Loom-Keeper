// src/shared/defaults.ts
var LOOM_VERSION = "1.0.31";
var LOOM_SCHEMA_VERSION = "1";
var GRAND_CONTINUITY_ATLAS_PRESET_ID = "grand_continuity_atlas";
var SLIM_SCENE_PRESET_ID = "slim_scene_loom";
var now = "2026-01-01T00:00:00.000Z";
var grandContinuityAtlasPreset = {
  id: GRAND_CONTINUITY_ATLAS_PRESET_ID,
  name: "Grand Continuity Atlas",
  version: "1.0.27",
  description: "A detailed, visually polished continuity atlas for rich roleplay scenes, character appearance, relationships, world state, and fragile details.",
  origin: "built-in",
  templateEngine: "handlebars_compat",
  sourceFormat: "loom",
  mode: "hybrid",
  schemaJson: {
    type: "object",
    required: ["schemaVersion", "sceneIdentity", "narrativeDelta", "characters", "worldState", "nextTurnGuidance"],
    properties: {
      schemaVersion: { type: "string", default: LOOM_SCHEMA_VERSION },
      sceneIdentity: {
        type: "object",
        properties: {
          title: { type: "string", default: "" },
          location: { type: "string", default: "" },
          subLocation: { type: "string", default: "" },
          time: { type: "string", default: "" },
          date: { type: "string", default: "" },
          weather: { type: "string", default: "" },
          lighting: { type: "string", default: "" },
          privacy: { type: "string", default: "" },
          pacing: { type: "string", default: "" },
          tension: { type: "string", default: "" },
          mood: { type: "string", default: "" },
          sensoryAtmosphere: { type: "string", default: "" },
          atmosphere: { type: "array", maxItems: 8, default: [], items: { type: "string" } }
        }
      },
      narrativeDelta: {
        type: "object",
        properties: {
          summary: { type: "string", default: "" },
          whatChanged: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
          immediateConsequences: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
          unresolvedBeats: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
          continuityWarnings: { type: "array", maxItems: 6, default: [], items: { type: "string" } }
        }
      },
      characters: {
        type: "array",
        maxItems: 8,
        default: [],
        items: {
          type: "object",
          properties: {
            name: { type: "string", default: "" },
            role: { type: "string", default: "" },
            presence: { type: "string", default: "" },
            location: { type: "string", default: "" },
            currentAction: { type: "string", default: "" },
            appearance: {
              type: "object",
              properties: {
                overview: { type: "string", default: "" },
                face: { type: "string", default: "" },
                hair: { type: "string", default: "" },
                eyes: { type: "string", default: "" },
                bodyBuild: { type: "string", default: "" },
                clothing: { type: "string", default: "" },
                posture: { type: "string", default: "" },
                voice: { type: "string", default: "" },
                scent: { type: "string", default: "" },
                visibleCondition: { type: "string", default: "" }
              }
            },
            state: {
              type: "object",
              properties: {
                emotion: { type: "string", default: "" },
                hiddenTension: { type: "string", default: "" },
                injuries: { type: "array", maxItems: 6, default: [], items: { type: "string" } },
                fatigue: { type: "string", default: "" },
                goals: { type: "array", maxItems: 6, default: [], items: { type: "string" } },
                knowledge: { type: "array", maxItems: 6, default: [], items: { type: "string" } },
                secrets: { type: "array", maxItems: 6, default: [], items: { type: "string" } },
                boundaries: { type: "array", maxItems: 6, default: [], items: { type: "string" } }
              }
            },
            relationshipToUser: {
              type: "object",
              properties: {
                label: { type: "string", default: "" },
                trust: { type: "integer", default: 0 },
                warmth: { type: "integer", default: 0 },
                attraction: { type: "integer", default: 0 },
                irritation: { type: "integer", default: 0 },
                fear: { type: "integer", default: 0 },
                leverage: { type: "string", default: "" },
                recentShift: { type: "string", default: "" }
              }
            },
            props: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
            inventory: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
            changesThisTurn: { type: "array", maxItems: 6, default: [], items: { type: "string" } }
          }
        }
      },
      relationships: {
        type: "array",
        maxItems: 10,
        default: [],
        items: {
          type: "object",
          properties: {
            parties: { type: "string", default: "" },
            trust: { type: "string", default: "" },
            warmth: { type: "string", default: "" },
            attraction: { type: "string", default: "" },
            irritation: { type: "string", default: "" },
            fear: { type: "string", default: "" },
            promises: { type: "array", maxItems: 4, default: [], items: { type: "string" } },
            conflicts: { type: "array", maxItems: 4, default: [], items: { type: "string" } },
            debts: { type: "array", maxItems: 4, default: [], items: { type: "string" } },
            recentShift: { type: "string", default: "" }
          }
        }
      },
      worldState: {
        type: "object",
        properties: {
          importantObjects: { type: "array", maxItems: 10, default: [], items: { type: "string" } },
          hazards: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
          activeThreads: { type: "array", maxItems: 10, default: [], items: { type: "string" } },
          loreFacts: { type: "array", maxItems: 10, default: [], items: { type: "string" } },
          constraints: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
          timelineAnchors: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
          sceneRules: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
          contradictions: { type: "array", maxItems: 6, default: [], items: { type: "string" } }
        }
      },
      nextTurnGuidance: {
        type: "object",
        properties: {
          likelyFocus: { type: "string", default: "" },
          fragileDetails: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
          doNotForget: { type: "array", maxItems: 8, default: [], items: { type: "string" } },
          avoidInventing: { type: "array", maxItems: 8, default: [], items: { type: "string" } }
        }
      }
    }
  },
  htmlTemplate: [
    '<section class="sotl-atlas sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
    "<style>",
    ".sotl-atlas{font-family:var(--lv-font-sans,Inter,ui-sans-serif,system-ui,sans-serif);color:var(--lumiverse-text,var(--lv-text,#eef2ff));background:linear-gradient(145deg,rgba(12,16,24,.96),rgba(21,27,38,.94));border:1px solid rgba(130,150,190,.3);border-radius:14px;padding:14px;box-shadow:0 16px 44px rgba(0,0,0,.38);display:grid;gap:12px;overflow:hidden}",
    ".sotl-atlas *{box-sizing:border-box}",
    ".sotl-atlas__head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start;border-bottom:1px solid rgba(255,255,255,.11);padding-bottom:10px}",
    ".sotl-atlas__eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#9fb7ff;font-weight:800}",
    ".sotl-atlas h3{margin:2px 0 0;font-size:18px;line-height:1.15;color:#fff}",
    ".sotl-atlas__mood{display:inline-flex;align-items:center;border:1px solid rgba(159,183,255,.35);background:rgba(95,122,255,.14);border-radius:999px;padding:4px 9px;font-size:11px;color:#dbe5ff;white-space:nowrap}",
    ".sotl-atlas__chips{display:flex;flex-wrap:wrap;gap:6px}",
    ".sotl-atlas__chip{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.055);border-radius:7px;padding:5px 7px;font-size:11px;color:#d8deea;line-height:1.25}",
    ".sotl-atlas__delta{font-size:13px;line-height:1.5;color:#f4f7ff;margin:0;padding:10px;border-radius:10px;background:rgba(255,255,255,.06);border-left:3px solid #8fb0ff}",
    ".sotl-atlas__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}",
    ".sotl-atlas__panel{border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.045);border-radius:10px;padding:10px;min-width:0}",
    ".sotl-atlas__panel h4{margin:0 0 7px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9fb7ff}",
    ".sotl-atlas__list{margin:0;padding-left:16px;font-size:12px;line-height:1.45;color:#e1e7f2}",
    ".sotl-atlas__cast{display:grid;gap:9px}",
    ".sotl-atlas__person{border:1px solid rgba(159,183,255,.18);background:rgba(159,183,255,.06);border-radius:10px;padding:10px;display:grid;gap:8px}",
    ".sotl-atlas__person-head{display:flex;align-items:center;justify-content:space-between;gap:8px}",
    ".sotl-atlas__person h5{margin:0;font-size:14px;color:#fff}.sotl-atlas__role{font-size:11px;color:#b6c2d8}",
    ".sotl-atlas__kv{display:grid;grid-template-columns:82px minmax(0,1fr);gap:4px 8px;font-size:12px;line-height:1.38}.sotl-atlas__kv b{color:#9fb7ff;font-size:10px;text-transform:uppercase;letter-spacing:.05em}.sotl-atlas__kv span{min-width:0;overflow-wrap:anywhere}",
    ".sotl-atlas__meters{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}.sotl-atlas__meter{background:rgba(0,0,0,.18);border-radius:7px;padding:5px;text-align:center}.sotl-atlas__meter b{display:block;font-size:9px;color:#9fb7ff;text-transform:uppercase}.sotl-atlas__meter span{font-size:12px;color:#fff;font-weight:800}",
    "@media(max-width:560px){.sotl-atlas{padding:11px;border-radius:10px}.sotl-atlas__head{grid-template-columns:1fr}.sotl-atlas__grid{grid-template-columns:1fr}.sotl-atlas__meters{grid-template-columns:repeat(3,minmax(0,1fr))}.sotl-atlas__kv{grid-template-columns:72px minmax(0,1fr)}}",
    "</style>",
    '<header class="sotl-atlas__head">',
    '  <div><div class="sotl-atlas__eyebrow">Grand Continuity Atlas</div><h3>{{sceneIdentity.title}}</h3></div>',
    '  <span class="sotl-atlas__mood">{{sceneIdentity.mood}}</span>',
    "</header>",
    '<div class="sotl-atlas__chips">',
    '  <span class="sotl-atlas__chip">Location: {{sceneIdentity.location}}{{#if sceneIdentity.subLocation}} / {{sceneIdentity.subLocation}}{{/if}}</span>',
    '  <span class="sotl-atlas__chip">Time: {{sceneIdentity.time}}</span>',
    '  <span class="sotl-atlas__chip">Weather: {{sceneIdentity.weather}}</span>',
    '  <span class="sotl-atlas__chip">Light: {{sceneIdentity.lighting}}</span>',
    '  <span class="sotl-atlas__chip">Privacy: {{sceneIdentity.privacy}}</span>',
    '  <span class="sotl-atlas__chip">Tension: {{sceneIdentity.tension}}</span>',
    "</div>",
    '<p class="sotl-atlas__delta">{{narrativeDelta.summary}}</p>',
    '<section class="sotl-atlas__cast">',
    "{{#each characters}}",
    '  <article class="sotl-atlas__person">',
    '    <div class="sotl-atlas__person-head"><div><h5>{{name}}</h5><div class="sotl-atlas__role">{{role}} - {{presence}} - {{location}}</div></div><span class="sotl-atlas__chip">{{state.emotion}}</span></div>',
    '    <div class="sotl-atlas__kv">',
    "      <b>Face</b><span>{{appearance.face}}</span><b>Hair</b><span>{{appearance.hair}}</span><b>Eyes</b><span>{{appearance.eyes}}</span><b>Build</b><span>{{appearance.bodyBuild}}</span><b>Clothes</b><span>{{appearance.clothing}}</span><b>Posture</b><span>{{appearance.posture}}</span><b>Voice</b><span>{{appearance.voice}}</span><b>Condition</b><span>{{appearance.visibleCondition}}</span>",
    "    </div>",
    '    <div class="sotl-atlas__meters"><div class="sotl-atlas__meter"><b>Trust</b><span>{{relationshipToUser.trust}}</span></div><div class="sotl-atlas__meter"><b>Warmth</b><span>{{relationshipToUser.warmth}}</span></div><div class="sotl-atlas__meter"><b>Attract</b><span>{{relationshipToUser.attraction}}</span></div><div class="sotl-atlas__meter"><b>Irrit.</b><span>{{relationshipToUser.irritation}}</span></div><div class="sotl-atlas__meter"><b>Fear</b><span>{{relationshipToUser.fear}}</span></div></div>',
    '    <div class="sotl-atlas__grid">',
    '      <div class="sotl-atlas__panel"><h4>Intent and Knowledge</h4><ul class="sotl-atlas__list">{{#each state.goals}}<li>{{this}}</li>{{/each}}{{#each state.knowledge}}<li>{{this}}</li>{{/each}}</ul></div>',
    '      <div class="sotl-atlas__panel"><h4>Props and Changes</h4><ul class="sotl-atlas__list">{{#each props}}<li>{{this}}</li>{{/each}}{{#each inventory}}<li>{{this}}</li>{{/each}}{{#each changesThisTurn}}<li>{{this}}</li>{{/each}}</ul></div>',
    "    </div>",
    "  </article>",
    "{{/each}}",
    "</section>",
    '<section class="sotl-atlas__grid">',
    '  <div class="sotl-atlas__panel"><h4>World State</h4><ul class="sotl-atlas__list">{{#each worldState.importantObjects}}<li>{{this}}</li>{{/each}}{{#each worldState.hazards}}<li>{{this}}</li>{{/each}}{{#each worldState.activeThreads}}<li>{{this}}</li>{{/each}}{{#each worldState.loreFacts}}<li>{{this}}</li>{{/each}}</ul></div>',
    '  <div class="sotl-atlas__panel"><h4>Next Turn Guidance</h4><p style="font-size:12px;line-height:1.45;margin:0 0 6px;color:#f4f7ff;">{{nextTurnGuidance.likelyFocus}}</p><ul class="sotl-atlas__list">{{#each nextTurnGuidance.fragileDetails}}<li>{{this}}</li>{{/each}}{{#each nextTurnGuidance.doNotForget}}<li>{{this}}</li>{{/each}}{{#each nextTurnGuidance.avoidInventing}}<li>{{this}}</li>{{/each}}</ul></div>',
    "</section>",
    '{{#if relationships}}<details class="sotl-card-details" open><summary>Relationship Ledger</summary><ul class="sotl-atlas__list">{{#each relationships}}<li><strong>{{parties}}</strong>: trust {{trust}}, warmth {{warmth}}, attraction {{attraction}}, irritation {{irritation}}, fear {{fear}}. {{recentShift}}</li>{{/each}}</ul></details>{{/if}}',
    "</section>"
  ].join(""),
  promptInstructions: [
    "You are State of the Loom: Grand Continuity Atlas, a high-detail continuity tracker for AI roleplay.",
    "Return raw JSON only. Do not use markdown fences, XML tags, comments, prose outside JSON, or explanations.",
    "Use the Grand Continuity Atlas schema exactly. Include every required top-level object.",
    "Target roughly 2200-2800 JSON tokens when the scene has enough material. Do not pad with invented facts; if information is unknown, use concise empty strings or empty arrays.",
    "Preserve stable facts from the previous tracker unless the latest assistant message clearly changes them.",
    "Track character appearance with unusually strong continuity: face, hair, eyes, build, clothing, posture, voice, scent, visible condition, injuries, fatigue, emotional state, hidden tension, goals, knowledge, secrets, boundaries, props, inventory, and changes this turn.",
    "Track relationships as state, not vibes only: trust, warmth, attraction, irritation, fear, leverage, promises, conflicts, debts, and recent shifts.",
    "Track world state: important objects, hazards, active threads, lore facts, constraints, timeline anchors, scene rules, contradictions, and continuity warnings.",
    "Use 0-100 integers for relationshipToUser meter values. Keep arrays within maxItems. Prefer specific compact phrases over vague labels.",
    "The latest assistant message is authoritative for what just happened; the previous tracker is authoritative for stable continuity that was not contradicted."
  ].join("\n"),
  injectionTemplate: "[Grand Continuity Atlas]\n{{compactSummary}}",
  maxInjectionTokens: 900,
  defaultPlacement: "top",
  renderOptions: {
    density: "expanded",
    theme: "glass",
    showControls: true
  },
  parserOptions: {
    fenceNames: ["tracker", "loom", "atlas"],
    strictJson: true,
    repairInvalidJson: false
  },
  sampleData: {
    schemaVersion: LOOM_SCHEMA_VERSION,
    sceneIdentity: {
      title: "Kitchen Introduction Under Stormlight",
      location: "Ward House",
      subLocation: "Kitchen threshold",
      time: "5:35 PM",
      date: "2024-07-12",
      weather: "hot, stagnant, humid late afternoon with thunder building outside",
      lighting: "low afternoon sun through windows and warm kitchen overheads",
      privacy: "semi-private; Bridget and Diane can observe Josh",
      pacing: "slow social pressure with physical discomfort",
      tension: "strained, awkward, mildly buzzed",
      mood: "tense but domestic",
      sensoryAtmosphere: "heavy summer heat, tile underfoot, old wood, glass clinks, storm scent near the door",
      atmosphere: ["heavy standing heat", "old kitchen wood", "wet storm smell near the threshold"]
    },
    narrativeDelta: {
      summary: "Josh enters the kitchen after Diane and makes a clumsy offer to leave while Bridget observes from the counter with wine in hand.",
      whatChanged: ["Josh has arrived in the kitchen.", "Bridget is confirmed present and watching.", "Marcus remains absent."],
      immediateConsequences: ["Josh must navigate Bridget and Diane while physically strained."],
      unresolvedBeats: ["Why Marcus is absent.", "Whether Josh can move upstairs safely."],
      continuityWarnings: ["Do not forget Josh is dealing with a severe right-leg cramp."]
    },
    characters: [
      {
        name: "Josh",
        role: "visitor",
        presence: "active in scene",
        location: "kitchen threshold",
        currentAction: "offering to leave despite pain",
        appearance: {
          overview: "strained, overheated, trying to look composed",
          face: "tight around the mouth from pain",
          hair: "slightly mussed from the humid house",
          eyes: "watchful and embarrassed",
          bodyBuild: "adult build, currently favoring one leg",
          clothing: "casual travel clothes, rumpled from the heat",
          posture: "weight shifted off the right leg",
          voice: "polite but strained",
          scent: "warm skin and storm-damp air",
          visibleCondition: "severe right-leg cramp limiting movement"
        },
        state: {
          emotion: "awkward and tense",
          hiddenTension: "does not want to look helpless in front of Bridget",
          injuries: ["severe right-leg cramp"],
          fatigue: "physically strained",
          goals: ["avoid imposing", "reach Marcus or learn where he is"],
          knowledge: ["Marcus is absent", "Diane and Bridget are watching him"],
          secrets: [],
          boundaries: ["should not sprint or climb quickly while cramped"]
        },
        relationshipToUser: {
          label: "player viewpoint",
          trust: 50,
          warmth: 45,
          attraction: 0,
          irritation: 15,
          fear: 10,
          leverage: "none established",
          recentShift: "more vulnerable after visible pain"
        },
        props: [],
        inventory: [],
        changesThisTurn: ["entered kitchen", "showed strain from leg cramp"]
      },
      {
        name: "Bridget Hanley",
        role: "aunt and drinker of wine",
        presence: "active observer",
        location: "leaning near the kitchen counter",
        currentAction: "watching Josh with sharp curiosity",
        appearance: {
          overview: "composed, amused, slightly buzzed",
          face: "sharp-eyed with a faintly assessing expression",
          hair: "neat enough but casual for the house",
          eyes: "focused on Josh",
          bodyBuild: "relaxed adult posture",
          clothing: "house casuals with a folded towel in hand",
          posture: "leaning at the counter, glass nearby",
          voice: "dry and curious",
          scent: "wine and warm kitchen air",
          visibleCondition: "mildly buzzed but observant"
        },
        state: {
          emotion: "curious and amused",
          hiddenTension: "testing Josh socially",
          injuries: [],
          fatigue: "none obvious",
          goals: ["understand who Josh is", "watch Diane handle him"],
          knowledge: ["Josh is struggling physically", "Marcus is not here"],
          secrets: [],
          boundaries: ["keeps social control through teasing observation"]
        },
        relationshipToUser: {
          label: "new acquaintance",
          trust: 30,
          warmth: 35,
          attraction: 0,
          irritation: 20,
          fear: 0,
          leverage: "social confidence in her own kitchen",
          recentShift: "became more interested after seeing Josh struggle"
        },
        props: ["wine glass", "folded towel"],
        inventory: [],
        changesThisTurn: ["identified as present and observing Josh"]
      }
    ],
    relationships: [
      {
        parties: "Josh and Bridget",
        trust: "low but open",
        warmth: "testing curiosity",
        attraction: "not established",
        irritation: "minor awkwardness",
        fear: "none",
        promises: [],
        conflicts: ["Josh may be judged for arriving while Marcus is absent"],
        debts: [],
        recentShift: "Bridget has begun evaluating Josh directly."
      }
    ],
    worldState: {
      importantObjects: ["wine glass on the counter", "kitchen threshold", "stair path toward Marcus room"],
      hazards: ["Josh right-leg cramp", "hot stagnant room", "social scrutiny"],
      activeThreads: ["Marcus absence", "Josh trying to reach upstairs", "Bridget assessing Josh"],
      loreFacts: ["Ward House kitchen is occupied by Diane and Bridget."],
      constraints: ["Josh movement is impaired.", "Marcus should not suddenly appear without setup."],
      timelineAnchors: ["Josh arrived after Diane entered the kitchen."],
      sceneRules: ["Domestic realism and social tension matter more than action."],
      contradictions: []
    },
    nextTurnGuidance: {
      likelyFocus: "Josh needs to answer Bridget or Diane while managing the leg cramp.",
      fragileDetails: ["Josh is at the threshold, not upstairs.", "Bridget has wine and is watching closely."],
      doNotForget: ["Marcus is absent.", "Diane is present.", "The right-leg cramp is severe."],
      avoidInventing: ["Do not invent Marcus location yet.", "Do not resolve the cramp instantly."]
    }
  },
  createdAt: now,
  updatedAt: now
};
var microLoomPreset = {
  id: "micro_loom",
  name: "Micro Loom",
  version: "1.0.6",
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
  version: "1.0.6",
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
  version: "1.0.6",
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
  version: "1.0.6",
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
  version: "1.0.6",
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
  version: "1.0.27",
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
  grandContinuityAtlasPreset,
  microLoomPreset,
  slimScenePreset,
  balancedStoryPreset,
  castContinuityPreset,
  fullContinuityLedgerPreset,
  chronoscopeOccultLedgerPreset
];

// src/shared/renderer.ts
var HELPER_NAMES = /* @__PURE__ */ new Set([
  "eq",
  "eqi",
  "gt",
  "gte",
  "lt",
  "lte",
  "and",
  "or",
  "not",
  "add",
  "subtract",
  "multiply",
  "divide",
  "divideRoundUp",
  "abs",
  "initials",
  "rawFirstLetter",
  "slugifyDash",
  "slugifyUnderscore",
  "camelCase",
  "clampPercent",
  "percentOf"
]);
function safeObjectToString(val) {
  if (val === null || val === void 0) return "";
  if (typeof val !== "object") return String(val);
  if (Array.isArray(val)) return val.map(safeObjectToString).filter(Boolean).join(", ");
  const obj = val;
  const keys = ["text", "value", "label", "name", "title", "summary", "description", "status"];
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
function stripHtml(html) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function normalizePath(path) {
  return path.trim().replace(/^\.\//, "").replace(/^\$root\./, "");
}
function readRecordPath(source, rawPath) {
  if (!rawPath) return void 0;
  if (rawPath === "." || rawPath === "this") return source;
  let path = normalizePath(rawPath);
  if (path.startsWith("this.")) path = path.slice(5);
  const parts = path.split(".").filter(Boolean);
  let current = source;
  for (const part of parts) {
    if (part === "length" && Array.isArray(current)) return current.length;
    if (!isRecord(current) && !Array.isArray(current)) return void 0;
    current = current[part];
  }
  return current;
}
function readPath(ctx, rawPath) {
  const path = normalizePath(rawPath);
  if (!path) return void 0;
  if (path in ctx.locals) return ctx.locals[path];
  if (path.startsWith("@")) return ctx.locals[path];
  if (path === "." || path === "this" || path.startsWith("this.")) {
    return readRecordPath(ctx.current, path);
  }
  const fromCurrent = readRecordPath(ctx.current, path);
  if (fromCurrent !== void 0 && fromCurrent !== "") return fromCurrent;
  return readRecordPath(ctx.root, path);
}
function truthy(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value === "false" || value === "0") return false;
  return Boolean(value);
}
function tokenizeExpression(expression) {
  const tokens = [];
  let current = "";
  let quote = "";
  let depth = 0;
  for (let i = 0; i < expression.length; i += 1) {
    const ch = expression[i];
    if (quote) {
      current += ch;
      if (ch === quote && expression[i - 1] !== "\\") quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "(") {
      depth += 1;
      current += ch;
      continue;
    }
    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }
    if (/\s/.test(ch) && depth === 0) {
      if (current.trim()) tokens.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}
function stripWrappedParens(value) {
  let out = value.trim();
  while (out.startsWith("(") && out.endsWith(")")) {
    let depth = 0;
    let balanced = true;
    for (let i = 0; i < out.length; i += 1) {
      if (out[i] === "(") depth += 1;
      if (out[i] === ")") depth -= 1;
      if (depth === 0 && i < out.length - 1) {
        balanced = false;
        break;
      }
    }
    if (!balanced) break;
    out = out.slice(1, -1).trim();
  }
  return out;
}
function numberValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function slugify(value, separator) {
  return String(value || "").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, separator);
}
function callHelper(name, values) {
  switch (name) {
    case "eq":
      return values[0] === values[1] || String(values[0]) === String(values[1]);
    case "eqi":
      return String(values[0] || "").toLowerCase() === String(values[1] || "").toLowerCase();
    case "gt":
      return numberValue(values[0]) > numberValue(values[1]);
    case "gte":
      return numberValue(values[0]) >= numberValue(values[1]);
    case "lt":
      return numberValue(values[0]) < numberValue(values[1]);
    case "lte":
      return numberValue(values[0]) <= numberValue(values[1]);
    case "and":
      return values.every(truthy);
    case "or":
      return values.some(truthy);
    case "not":
      return !truthy(values[0]);
    case "add":
      return numberValue(values[0]) + numberValue(values[1]);
    case "subtract":
      return numberValue(values[0]) - numberValue(values[1]);
    case "multiply":
      return numberValue(values[0]) * numberValue(values[1]);
    case "divide":
      return numberValue(values[1]) === 0 ? 0 : numberValue(values[0]) / numberValue(values[1]);
    case "divideRoundUp":
      return numberValue(values[1]) === 0 ? 0 : Math.ceil(numberValue(values[0]) / numberValue(values[1]));
    case "abs":
      return Math.abs(numberValue(values[0]));
    case "initials":
      return String(values[0] || "?").replace(/[^a-zA-Z0-9\s_-]+/g, " ").trim().split(/[\s_-]+/).filter(Boolean).slice(0, 3).map((word) => word.charAt(0).toUpperCase()).join("") || "?";
    case "rawFirstLetter":
      return String(values[0] || "?").charAt(0) || "?";
    case "slugifyDash":
      return slugify(values[0], "-");
    case "slugifyUnderscore":
      return slugify(values[0], "_");
    case "camelCase": {
      const words = String(values[0] || "").toLowerCase().replace(/[^a-z0-9\s]+/g, " ").trim().split(/\s+/);
      return words.map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join("");
    }
    case "clampPercent":
      return Math.max(0, Math.min(100, Math.round(numberValue(values[0]))));
    case "percentOf":
      return numberValue(values[1]) === 0 ? 0 : Math.max(0, Math.min(100, Math.round(numberValue(values[0]) / numberValue(values[1]) * 100)));
    default:
      return "";
  }
}
function evalExpression(expression, ctx) {
  const expr = stripWrappedParens(expression);
  if (!expr) return "";
  if (expr.startsWith('"') && expr.endsWith('"') || expr.startsWith("'") && expr.endsWith("'")) return expr.slice(1, -1);
  if (expr === "true") return true;
  if (expr === "false") return false;
  if (expr === "null") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(expr)) return Number(expr);
  const tokens = tokenizeExpression(expr);
  if (tokens.length > 1 && HELPER_NAMES.has(tokens[0])) {
    return callHelper(tokens[0], tokens.slice(1).map((token) => evalExpression(token, ctx)));
  }
  const value = readPath(ctx, expr);
  if (value === void 0 || value === null || value === "") ctx.missingFields.add(expr);
  else ctx.usedFields.add(expr);
  return value ?? "";
}
function tokenizeTemplate(template) {
  const tokens = [];
  const re = /{{{?\s*([^{}]+?)\s*}?}}/g;
  let match;
  while ((match = re.exec(template)) !== null) {
    tokens.push({ command: match[1].trim(), start: match.index, end: match.index + match[0].length });
  }
  return tokens;
}
function parseTemplate(template) {
  const tokens = tokenizeTemplate(template);
  function parseNodes(index, cursor, shouldStop) {
    const nodes = [];
    while (index < tokens.length) {
      const token = tokens[index];
      const command = token.command;
      if (shouldStop(command)) {
        if (token.start > cursor) nodes.push({ type: "text", value: template.slice(cursor, token.start) });
        return { nodes, index, cursor: token.end, stopCommand: command };
      }
      if (token.start > cursor) nodes.push({ type: "text", value: template.slice(cursor, token.start) });
      index += 1;
      if (command.startsWith("!")) {
        cursor = token.end;
        continue;
      }
      if (command.startsWith("#each ")) {
        const expression = command.slice(6).trim();
        const bodyResult = parseNodes(index, token.end, (cmd) => cmd === "/each" || cmd === "else");
        let alternate = [];
        let endIndex = bodyResult.index;
        if (bodyResult.stopCommand === "else") {
          const altResult = parseNodes(bodyResult.index + 1, tokens[bodyResult.index].end, (cmd) => cmd === "/each");
          alternate = altResult.nodes;
          endIndex = altResult.index;
        }
        nodes.push({ type: "each", expression, body: bodyResult.nodes, alternate });
        cursor = tokens[endIndex]?.end ?? bodyResult.cursor;
        index = endIndex + 1;
        continue;
      }
      if (command.startsWith("#if ") || command.startsWith("#unless ")) {
        const inverted = command.startsWith("#unless ");
        let expression = command.slice(inverted ? 8 : 4).trim();
        const branches = [];
        let alternate = [];
        let nextIndex = index;
        let nextCursor = token.end;
        let endIndex = index - 1;
        while (nextIndex <= tokens.length) {
          const bodyResult = parseNodes(nextIndex, nextCursor, (cmd) => cmd === (inverted ? "/unless" : "/if") || cmd === "else" || cmd.startsWith("else if "));
          branches.push({ expression, body: bodyResult.nodes });
          endIndex = bodyResult.index;
          if (bodyResult.stopCommand?.startsWith("else if ")) {
            expression = bodyResult.stopCommand.slice(8).trim();
            nextIndex = bodyResult.index + 1;
            nextCursor = tokens[bodyResult.index].end;
            continue;
          }
          if (bodyResult.stopCommand === "else") {
            const altResult = parseNodes(bodyResult.index + 1, tokens[bodyResult.index].end, (cmd) => cmd === (inverted ? "/unless" : "/if"));
            alternate = altResult.nodes;
            endIndex = altResult.index;
          }
          break;
        }
        nodes.push({ type: "if", branches, alternate, inverted });
        cursor = tokens[endIndex]?.end ?? token.end;
        index = endIndex + 1;
        continue;
      }
      if (!command.startsWith("/")) {
        nodes.push({ type: "var", expression: command });
      }
      cursor = token.end;
    }
    if (cursor < template.length) nodes.push({ type: "text", value: template.slice(cursor) });
    return { nodes, index, cursor: template.length };
  }
  return parseNodes(0, 0, () => false).nodes;
}
function renderNodes(nodes, ctx) {
  return nodes.map((node) => {
    if (node.type === "text") return node.value;
    if (node.type === "var") return escapeHtml(evalExpression(node.expression, ctx));
    if (node.type === "each") {
      const value = evalExpression(node.expression, ctx);
      if (!Array.isArray(value) || value.length === 0) {
        return node.alternate.length > 0 ? renderNodes(node.alternate, ctx) : "";
      }
      return value.map((item, index) => {
        const current = node.expression.trim() === "characters" && isRecord(item) ? buildCharacterContext(ctx.root, item) : item;
        return renderNodes(node.body, {
          ...ctx,
          current,
          locals: {
            ...ctx.locals,
            "@index": index,
            "@first": index === 0,
            "@last": index === value.length - 1
          }
        });
      }).join("");
    }
    if (node.type === "if") {
      for (const branch of node.branches) {
        const ok = truthy(evalExpression(branch.expression, ctx));
        if (node.inverted ? !ok : ok) return renderNodes(branch.body, ctx);
      }
      return renderNodes(node.alternate, ctx);
    }
    return "";
  }).join("");
}
function darkenHexColor(value) {
  const raw = String(value || "#475569").replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return "#1f2937";
  const n = parseInt(raw, 16);
  const r = Math.max(0, Math.round((n >> 16 & 255) * 0.72));
  const g = Math.max(0, Math.round((n >> 8 & 255) * 0.72));
  const b = Math.max(0, Math.round((n & 255) * 0.72));
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}
function buildCharacterContext(root, character) {
  const worldData = isRecord(root.worldData) ? root.worldData : {};
  const name = String(character.name || character.characterName || "Character");
  const nestedStats = isRecord(character.stats) ? character.stats : {};
  const stats = { ...character, ...nestedStats };
  const bgColor = String(character.bg || stats.bg || "#475569");
  return {
    ...root,
    ...character,
    name,
    characterName: name,
    currentDate: worldData.current_date || worldData.date || root.currentDate || "",
    currentTime: worldData.current_time || worldData.time || root.currentTime || "",
    stats,
    bgColor,
    darkerBgColor: darkenHexColor(bgColor),
    reactionEmoji: Number(stats.last_react) === 1 ? "+" : Number(stats.last_react) === 2 ? "-" : "=",
    healthIcon: Number(stats.health) === 1 ? "injured" : Number(stats.health) === 2 ? "critical" : ""
  };
}
function buildRenderData(tracker, preset) {
  const sceneIdentity = isRecord(tracker.data.sceneIdentity) ? tracker.data.sceneIdentity : {};
  const narrativeDelta = isRecord(tracker.data.narrativeDelta) ? tracker.data.narrativeDelta : {};
  const data = {
    ...tracker.data,
    data: tracker.data,
    density: preset.renderOptions.density,
    theme: preset.renderOptions.theme,
    compactSummary: tracker.compactSummary
  };
  if (sceneIdentity.title && !data.sceneTitle) data.sceneTitle = sceneIdentity.title;
  if (sceneIdentity.location && !data.location) data.location = sceneIdentity.location;
  if (sceneIdentity.time && !data.time) data.time = sceneIdentity.time;
  if (sceneIdentity.weather && !data.weather) data.weather = sceneIdentity.weather;
  if (sceneIdentity.lighting && !data.lighting) data.lighting = sceneIdentity.lighting;
  if (sceneIdentity.mood && !data.mood) data.mood = sceneIdentity.mood;
  if (narrativeDelta.summary && !data.delta) data.delta = narrativeDelta.summary;
  return data;
}
function shouldRenderPerCharacter(template, data, preset) {
  if (!Array.isArray(data.characters) || data.characters.length === 0) return false;
  if (template.includes("#each characters")) return false;
  if (preset.sourceFormat !== "simtracker" && preset.templateEngine !== "handlebars_compat") return false;
  return /\{\{\s*(?:characterName|stats\.|bgColor|darkerBgColor|reactionEmoji|healthIcon)\b/.test(template);
}
function renderTemplate(template, data, preset) {
  const nodes = parseTemplate(template);
  const missingFields = /* @__PURE__ */ new Set();
  const usedFields = /* @__PURE__ */ new Set();
  const baseContext = { root: data, current: data, locals: {}, missingFields, usedFields };
  if (shouldRenderPerCharacter(template, data, preset)) {
    const characters = data.characters;
    return {
      html: characters.map((item) => {
        const character = isRecord(item) ? item : { name: String(item) };
        const root = buildCharacterContext(data, character);
        return renderNodes(nodes, { root, current: root, locals: {}, missingFields, usedFields });
      }).join(""),
      missingFields: [...missingFields],
      usedFields: [...usedFields]
    };
  }
  return {
    html: renderNodes(nodes, baseContext),
    missingFields: [...missingFields],
    usedFields: [...usedFields]
  };
}
function cleanupTrustedHtml(html) {
  let cleaned = html;
  cleaned = cleaned.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "");
  cleaned = cleaned.replace(/<object\b[\s\S]*?<\/object>/gi, "");
  cleaned = cleaned.replace(/<embed\b[\s\S]*?>/gi, "");
  cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/g, "");
  cleaned = cleaned.replace(/javascript\s*:/gi, "");
  return { html: cleaned, removed: cleaned !== html };
}
function sanitizeDomHtml(html) {
  if (typeof document === "undefined") return cleanupTrustedHtml(html).html;
  try {
    let sanitizeNode2 = function(node) {
      if (node.nodeType === Node.TEXT_NODE) return node;
      if (node.nodeType !== Node.ELEMENT_NODE) return null;
      const el = node;
      const tag = el.tagName.toLowerCase();
      if (!allowedTags.has(tag)) return null;
      const cleanEl = document.createElement(tag);
      for (let i = 0; i < el.attributes.length; i += 1) {
        const attr = el.attributes[i];
        const name = attr.name.toLowerCase();
        if (!allowedAttrs.has(name) && !name.startsWith("data-")) continue;
        const cleanVal = attr.value.trim().toLowerCase();
        if (name.startsWith("on") || cleanVal.includes("javascript:")) continue;
        cleanEl.setAttribute(name, attr.value);
      }
      let child = el.firstChild;
      while (child) {
        const cleanChild = sanitizeNode2(child);
        if (cleanChild) cleanEl.appendChild(cleanChild);
        child = child.nextSibling;
      }
      return cleanEl;
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
      "label",
      "input",
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
      "for",
      "type",
      "checked",
      "name",
      "value",
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
    return cleanupTrustedHtml(html).html;
  }
}
function getByPath(data, path) {
  const value = readRecordPath(data, path);
  if (value !== void 0 && value !== "") return value;
  const lowerKey = path.toLowerCase();
  for (const [key, entryValue] of Object.entries(data)) {
    if (key.toLowerCase() === lowerKey) return entryValue;
  }
  return void 0;
}
function getFallbackField(data, keys) {
  if (!data || typeof data !== "object") return void 0;
  for (const key of keys) {
    const value = getByPath(data, key);
    if (value !== void 0 && value !== null && value !== "") return value;
  }
  return void 0;
}
function isCustomPreset(preset) {
  return !builtInPresets.some((p) => p.id === preset.id);
}
function resolveTemplateMode(modeOrSafe, preset) {
  if (modeOrSafe === true) return "safe_generic";
  if (modeOrSafe === "trusted_layout" || modeOrSafe === "strict_sanitized" || modeOrSafe === "safe_generic") return modeOrSafe;
  return isCustomPreset(preset) ? "trusted_layout" : "trusted_layout";
}
function isVisuallyEmptyHtml(html) {
  if (!html.trim()) return true;
  if (stripHtml(html)) return false;
  return !/<(?:svg|path|rect|circle|line|polygon|ellipse|table|td|th|hr|input)\b/i.test(html);
}
function renderValueBlock(value, depth = 0) {
  if (value === null || value === void 0 || value === "") return "";
  if (typeof value !== "object") return `<span>${escapeHtml(String(value))}</span>`;
  if (depth >= 3) {
    try {
      return `<pre class="sotl-code">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
    } catch {
      return "";
    }
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '<p class="sotl-empty">None</p>';
    const items = value.slice(0, 12).map((item) => `<li>${renderValueBlock(item, depth + 1)}</li>`).join("");
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
function renderPreservedDataDetails(tracker) {
  return `
    <details class="sotl-card-details sotl-template-remainder">
      <summary>Unrendered tracker data</summary>
      ${renderValueBlock(tracker.data)}
    </details>
  `;
}
function renderGenericSafeCard(tracker, preset, warningMessage) {
  const title = escapeHtml(String(getFallbackField(tracker.data, [
    "sceneIdentity.title",
    "sceneTitle",
    "title",
    "name",
    "sceneName",
    "scene"
  ]) || "Continuity State"));
  const mood = escapeHtml(String(getFallbackField(tracker.data, [
    "sceneIdentity.mood",
    "mood",
    "tone",
    "emotion",
    "scene_mood"
  ]) || ""));
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
function collectPresentFields(value, prefix = "", out = /* @__PURE__ */ new Set()) {
  if (value === null || value === void 0 || value === "") return out;
  if (prefix) out.add(prefix);
  if (Array.isArray(value)) {
    value.slice(0, 3).forEach((item) => collectPresentFields(item, prefix, out));
    return out;
  }
  if (isRecord(value)) {
    for (const [key, entryValue] of Object.entries(value)) {
      collectPresentFields(entryValue, prefix ? `${prefix}.${key}` : key, out);
    }
  }
  return out;
}
function isLiteralOrHelper(token) {
  return HELPER_NAMES.has(token) || token === "else" || token.startsWith("/") || token.startsWith("#") || token.startsWith("@") || token === "this" || token === "." || token === "true" || token === "false" || token === "null" || /^-?\d+(?:\.\d+)?$/.test(token) || /^['"]/.test(token);
}
function collectExpressionFields(expression, out) {
  const cleaned = stripWrappedParens(expression.replace(/^#(?:if|unless|each)\s+/, "").replace(/^else if\s+/, ""));
  for (const token of tokenizeExpression(cleaned)) {
    const inner = stripWrappedParens(token);
    if (inner !== token) {
      collectExpressionFields(inner, out);
      continue;
    }
    if (!isLiteralOrHelper(token)) out.add(token.replace(/^this\./, ""));
  }
}
function extractTemplateReferences(template) {
  const out = /* @__PURE__ */ new Set();
  for (const token of tokenizeTemplate(template)) collectExpressionFields(token.command, out);
  return [...out].filter(Boolean).sort();
}
function buildTemplateCompatibilityReport(preset, sampleData, latestData) {
  const referencedFields = extractTemplateReferences(preset.htmlTemplate || "");
  const samplePresentFields = [...collectPresentFields(sampleData)].sort();
  const latestPresentFields = latestData ? [...collectPresentFields(latestData)].sort() : [];
  const hasPath = (fields, field) => fields.some((candidate) => candidate === field || candidate.startsWith(`${field}.`) || field.startsWith(`${candidate}.`));
  return {
    templateEngine: preset.templateEngine || "loom",
    sourceFormat: preset.sourceFormat || "loom",
    referencedFields,
    samplePresentFields,
    latestPresentFields,
    missingFromSample: referencedFields.filter((field) => !hasPath(samplePresentFields, field)),
    missingFromLatest: latestData ? referencedFields.filter((field) => !hasPath(latestPresentFields, field)) : []
  };
}
function renderTrackerHtmlDetailed(tracker, preset, modeOrSafe = false) {
  const templateMode = resolveTemplateMode(modeOrSafe, preset);
  if (templateMode === "safe_generic") {
    return {
      html: renderGenericSafeCard(tracker, preset, "Safe generic renderer active."),
      success: true,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      templateMode,
      preservedData: true,
      warning: "Safe generic renderer active.",
      missingFields: [],
      compatibility: buildTemplateCompatibilityReport(preset, preset.sampleData || {}, tracker.data)
    };
  }
  try {
    const data = buildRenderData(tracker, preset);
    const rendered = renderTemplate(preset.htmlTemplate, data, preset);
    let html = rendered.html;
    let sanitizerRemovedContent = false;
    if (isCustomPreset(preset)) {
      if (templateMode === "strict_sanitized") {
        const sanitized = sanitizeDomHtml(html);
        sanitizerRemovedContent = sanitized.trim() !== html.trim();
        html = sanitized;
      } else {
        const cleanup = cleanupTrustedHtml(html);
        sanitizerRemovedContent = cleanup.removed;
        html = cleanup.html;
      }
    }
    const missing = rendered.missingFields.filter((field) => !field.startsWith("@"));
    const compatibility = buildTemplateCompatibilityReport(preset, preset.sampleData || {}, tracker.data);
    if (isVisuallyEmptyHtml(html)) {
      const message = missing.length > 0 ? `Custom template rendered no visible tracker content. Missing fields: ${missing.join(", ")}.` : "Template rendered no visible tracker content.";
      return {
        html: renderGenericSafeCard(tracker, preset, message),
        success: false,
        fallbackUsed: true,
        sanitizerRemovedContent,
        templateMode,
        preservedData: true,
        warning: message,
        error: message,
        missingFields: missing,
        compatibility
      };
    }
    const preservedData = isCustomPreset(preset) && missing.length > 0;
    if (preservedData) html += renderPreservedDataDetails(tracker);
    return {
      html,
      success: true,
      fallbackUsed: false,
      sanitizerRemovedContent,
      templateMode,
      preservedData,
      warning: missing.length > 0 ? `Missing template fields: ${missing.join(", ")}` : void 0,
      missingFields: missing,
      compatibility
    };
  } catch (error) {
    console.error("Loom template rendering failed, falling back to safe card:", error);
    const message = `Custom template failed: ${error instanceof Error ? error.message : String(error)}`;
    return {
      html: renderGenericSafeCard(tracker, preset, message),
      success: false,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      templateMode,
      preservedData: true,
      warning: message,
      error: error instanceof Error ? error.message : String(error),
      missingFields: [],
      compatibility: buildTemplateCompatibilityReport(preset, preset.sampleData || {}, tracker.data)
    };
  }
}
function renderTrackerHtml(tracker, preset, modeOrSafe = false) {
  return renderTrackerHtmlDetailed(tracker, preset, modeOrSafe).html;
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
function iconButton(label, action, id, options = {}) {
  const icons = {
    Regenerate: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.7 6.3A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.3L13 11h8V3l-3.3 3.3Z" fill="currentColor"/></svg>',
    Edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16.7V20h3.3L18.6 9.7l-3.3-3.3L5 16.7Zm15-9.1c.4-.4.4-1 0-1.4L17.8 4c-.4-.4-1-.4-1.4 0l-1.1 1.1 3.3 3.3L20 7.6Z" fill="currentColor"/></svg>',
    Hide: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.3 2 18.7 18.7-1.3 1.3-3-3A12.8 12.8 0 0 1 12 20C6.5 20 2.2 16.5 1 12c.5-1.8 1.6-3.4 3-4.7L2 3.3 3.3 2Zm6.2 6.2 1.6 1.6A2.5 2.5 0 0 1 14.2 13l1.6 1.6A4.5 4.5 0 0 0 9.5 8.2ZM12 4c5.5 0 9.8 3.5 11 8a9.6 9.6 0 0 1-2.4 4.1l-3.1-3.1A5.5 5.5 0 0 0 11 6.1L8.7 3.8c1-.2 2.1.2 3.3.2Z" fill="currentColor"/></svg>',
    Show: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4C6.5 4 2.2 7.5 1 12c1.2 4.5 5.5 8 11 8s9.8-3.5 11-8c-1.2-4.5-5.5-8-11-8Zm0 13a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.2a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" fill="currentColor"/></svg>',
    Delete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21c-1.1 0-2-.9-2-2V8h14v11c0 1.1-.9 2-2 2H7ZM9 4h6l1 2h4v2H4V6h4l1-2Zm0 7v7h2v-7H9Zm4 0v7h2v-7h-2Z" fill="currentColor"/></svg>'
  };
  const icon = icons[label] || escapeHtml2(label.slice(0, 1));
  const swipe = typeof options.swipeId === "number" ? ` data-sotl-swipe-id="${options.swipeId}"` : "";
  return `<button class="sotl-icon-button" type="button" data-sotl-action="${escapeHtml2(action)}" data-sotl-message-id="${escapeHtml2(id)}"${swipe} title="${escapeHtml2(label)}" aria-label="${escapeHtml2(label)}">${icon}</button>`;
}

// src/frontend/rendering.ts
function resolvePresetForTracker(state2, tracker) {
  const preset = state2.presets.find((candidate) => candidate.id === tracker.presetId);
  if (preset) return { preset, missing: false };
  return { preset: state2.activePreset, missing: true };
}
function renderTrackerForState(tracker, state2, mode = state2.settings.useSafeRenderer ? "safe_generic" : state2.settings.customTemplateMode || "trusted_layout") {
  const { preset, missing } = resolvePresetForTracker(state2, tracker);
  if (missing) {
    const warning = `Preset '${tracker.presetId}' is not available. Showing tracker data with the safe generic renderer.`;
    return {
      html: renderGenericSafeCard(tracker, preset, warning),
      success: false,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      templateMode: "safe_generic",
      preservedData: true,
      warning,
      error: warning,
      missingFields: []
    };
  }
  return renderTrackerHtmlDetailed(tracker, preset, mode);
}
function resolveActiveTrackerForState(state2) {
  const latest = state2.latestTracker;
  if (!latest?.messageId) {
    const activeMessageId = state2.diagnostics.swipeReport?.activeMessageId;
    const activeSwipe2 = typeof activeMessageId === "string" ? state2.activeSwipeByMessageId[activeMessageId] ?? state2.diagnostics.swipeReport?.activeSwipeId : void 0;
    if (activeMessageId) {
      const sameMessageTrackers2 = state2.messageTrackers.filter((tracker) => tracker.messageId === activeMessageId);
      const exact2 = typeof activeSwipe2 === "number" ? sameMessageTrackers2.find((tracker) => tracker.swipeId === activeSwipe2) : void 0;
      if (exact2) return { tracker: exact2 };
      if (typeof activeSwipe2 === "number" && sameMessageTrackers2.some((tracker) => typeof tracker.swipeId === "number")) {
        return {
          tracker: null,
          missingMessageId: activeMessageId,
          missingSwipeId: activeSwipe2
        };
      }
      const newest = sameMessageTrackers2.slice().sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
      if (newest) return { tracker: newest };
    }
    return { tracker: latest };
  }
  const activeSwipe = state2.activeSwipeByMessageId[latest.messageId];
  if (typeof activeSwipe !== "number" || latest.swipeId === activeSwipe) {
    return { tracker: latest };
  }
  const sameMessageTrackers = state2.messageTrackers.filter((tracker) => tracker.messageId === latest.messageId);
  const exact = sameMessageTrackers.find((tracker) => tracker.swipeId === activeSwipe);
  if (exact) return { tracker: exact };
  if (sameMessageTrackers.some((tracker) => typeof tracker.swipeId === "number")) {
    return {
      tracker: null,
      missingMessageId: latest.messageId,
      missingSwipeId: activeSwipe
    };
  }
  return { tracker: latest };
}

// src/shared/validation.ts
var VALID_ORIGINS = /* @__PURE__ */ new Set(["built-in", "custom", "imported", "duplicated"]);
var VALID_TEMPLATE_ENGINES = /* @__PURE__ */ new Set(["loom", "handlebars_compat"]);
var VALID_SOURCE_FORMATS = /* @__PURE__ */ new Set(["loom", "simtracker"]);
function normalizePresetId(value, fallbackPrefix = "custom_loom") {
  const raw = String(value || "").trim();
  const slug = raw.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 96);
  return slug || `${fallbackPrefix}_${Date.now()}`;
}
function isBuiltInPresetId(presetId) {
  return builtInPresets.some((preset) => preset.id === presetId);
}
function schemaType(schema) {
  const type = schema.type;
  return typeof type === "string" ? type : void 0;
}
function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function asString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function asStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim()) : [];
}
function normalizeTemplateField(value, index = 0) {
  const record = asObject(value);
  const key = asString(record.key, asString(record.path, asString(record.name, asString(record.label, `field_${index + 1}`))));
  const description = asString(record.description, asString(record.desc, asString(record.label, key)));
  const rawType = asString(record.type, asString(record.fieldType)).toLowerCase();
  const type = rawType === "number" || rawType === "integer" || rawType === "boolean" || rawType === "array" || rawType === "object" ? rawType : rawType === "list" || rawType === "tags" ? "array" : "string";
  const nested = record.itemSchema ?? record.fields ?? record.children;
  return {
    key,
    description,
    type,
    itemSchema: Array.isArray(nested) ? nested.map((item, childIndex) => normalizeTemplateField(item, childIndex)) : typeof nested === "string" ? nested : void 0
  };
}
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function normalizePath2(path) {
  return path.replace(/\[(\d+)\]/g, "").replace(/\[\]/g, "").split(".").map((part) => part.trim()).filter(Boolean);
}
function ensureObjectProperty(schema, key) {
  if (!isPlainObject(schema.properties)) schema.properties = {};
  const properties = schema.properties;
  if (!isPlainObject(properties[key])) {
    properties[key] = { type: "object", properties: {}, additionalProperties: true };
  }
  const child = properties[key];
  if (!isPlainObject(child.properties)) child.properties = {};
  return child;
}
function setNestedSchema(parent, path, fieldSchema) {
  if (path.length === 0) return;
  if (path.length === 1) {
    if (!isPlainObject(parent.properties)) parent.properties = {};
    parent.properties[path[0]] = fieldSchema;
    return;
  }
  const next = ensureObjectProperty(parent, path[0]);
  setNestedSchema(next, path.slice(1), fieldSchema);
}
function setNestedSample(parent, path, value) {
  if (path.length === 0) return;
  if (path.length === 1) {
    parent[path[0]] = value;
    return;
  }
  const key = path[0];
  if (!isPlainObject(parent[key])) parent[key] = {};
  setNestedSample(parent[key], path.slice(1), value);
}
function explicitFieldType(record) {
  const raw = asString(record.type, asString(record.fieldType, asString(record.inputType))).toLowerCase();
  if (raw === "integer" || raw === "int") return "integer";
  if (raw === "number" || raw === "float" || raw === "range" || raw === "slider") return "number";
  if (raw === "boolean" || raw === "bool" || raw === "checkbox" || raw === "toggle") return "boolean";
  if (raw === "array" || raw === "list" || raw === "tags" || raw === "multi-select" || raw === "multiselect") return "array";
  if (raw === "object" || raw === "group") return "object";
  if (raw === "string" || raw === "text" || raw === "textarea" || raw === "select" || raw === "enum" || raw === "color") return "string";
  return void 0;
}
function inferSchemaForField(value) {
  const record = asObject(value);
  const type = explicitFieldType(record);
  const keyText = asString(record.key, asString(record.path, asString(record.name, ""))).toLowerCase();
  const description = asString(record.description, asString(record.desc, asString(record.label, "")));
  const options = asStringArray(record.options ?? record.choices ?? record.enum);
  const base = {};
  if (description) base.description = description;
  if (options.length > 0) base.enum = options;
  if (type === "array") {
    const nested = record.itemSchema ?? record.fields ?? record.children;
    if (Array.isArray(nested) && nested.length > 0) {
      const child = { type: "object", properties: {}, additionalProperties: true };
      nested.forEach((item, index) => {
        const field = normalizeTemplateField(item, index);
        setNestedSchema(child, normalizePath2(field.key), inferSchemaForField(item));
      });
      return { ...base, type: "array", items: child };
    }
    return { ...base, type: "array", items: { type: "string" } };
  }
  if (type === "object") return { ...base, type: "object", properties: {}, additionalProperties: true };
  if (type === "number" || type === "integer" || type === "boolean") return { ...base, type };
  if (typeof record.default === "number" || typeof record.value === "number" || /\b(score|rating|level|trust|fear|warmth|attraction|irritation|leverage|tension|risk|progress|percent)\b/i.test(keyText)) {
    return { ...base, type: "number" };
  }
  if (typeof record.default === "boolean" || typeof record.value === "boolean") return { ...base, type: "boolean" };
  return { ...base, type: "string" };
}
function sampleForField(value, fieldSchema, key) {
  const record = asObject(value);
  const defaultValue = record.default ?? record.value ?? record.sample ?? record.example;
  if (defaultValue !== void 0) return defaultValue;
  const type = schemaType(fieldSchema);
  const keyLower = key.toLowerCase();
  if (type === "number" || type === "integer") return keyLower.includes("trust") || keyLower.includes("warmth") ? 55 : 1;
  if (type === "boolean") return true;
  if (type === "array") return ["sample"];
  if (type === "object") return {};
  if (keyLower.includes("color")) return "#7b8cff";
  if (keyLower.includes("name")) return "Sample Character";
  if (keyLower.includes("status")) return "observing";
  if (keyLower.includes("thought")) return "Quietly reassessing the scene.";
  return asString(record.description, asString(record.label, "Sample detail"));
}
function simFieldTarget(path) {
  const first = (path[0] || "").toLowerCase();
  if (first === "worlddata" || first === "world" || first === "global" || first === "tracker") {
    return { scope: "world", path: path.slice(1) };
  }
  if (first === "character" || first === "characters") {
    return { scope: "character", path: path.slice(1) };
  }
  if (first === "stats") {
    return { scope: "character", path };
  }
  if (["scenetitle", "title", "location", "time", "date", "weather", "lighting", "privacy", "mood", "delta", "summary", "compactsummary"].includes(first)) {
    return { scope: "root", path };
  }
  return { scope: "character", path };
}
function synthesizePresetFromCustomFields(customFields) {
  const fields = customFields.map((field, index) => normalizeTemplateField(field, index));
  const characterSchema = {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      characterName: { type: "string" },
      role: { type: "string" },
      statusTag: { type: "string" },
      stats: { type: "object", properties: {}, additionalProperties: true }
    },
    additionalProperties: true
  };
  const worldDataSchema = { type: "object", properties: {}, additionalProperties: true };
  const rootSchema = {
    type: "object",
    required: ["schemaVersion", "sceneTitle", "characters"],
    properties: {
      schemaVersion: { type: "string" },
      sceneTitle: { type: "string" },
      compactSummary: { type: "string" },
      worldData: worldDataSchema,
      characters: { type: "array", items: characterSchema, maxItems: 12 }
    },
    additionalProperties: true
  };
  const sampleCharacter = {
    name: "Sample Character",
    characterName: "Sample Character",
    role: "Present Character",
    statusTag: "present",
    stats: {}
  };
  const sampleData = {
    schemaVersion: "1",
    sceneTitle: "Imported Template Preview",
    compactSummary: "Imported template preview with synthesized sample data.",
    worldData: {},
    characters: [sampleCharacter]
  };
  customFields.forEach((rawField, index) => {
    const field = fields[index];
    const path = normalizePath2(field.key);
    if (path.length === 0) return;
    const fieldSchema = inferSchemaForField(rawField);
    const target = simFieldTarget(path);
    const targetPath = target.path.length > 0 ? target.path : [field.key];
    const sampleValue = sampleForField(rawField, fieldSchema, targetPath[targetPath.length - 1]);
    if (target.scope === "world") {
      setNestedSchema(worldDataSchema, targetPath, fieldSchema);
      const world = sampleData.worldData;
      setNestedSample(world, targetPath, sampleValue);
    } else if (target.scope === "root") {
      setNestedSchema(rootSchema, targetPath, fieldSchema);
      setNestedSample(sampleData, targetPath, sampleValue);
    } else {
      setNestedSchema(characterSchema, targetPath, fieldSchema);
      setNestedSample(sampleCharacter, targetPath, sampleValue);
    }
  });
  return { schemaJson: rootSchema, sampleData, fields };
}
function extractImportCandidates(value) {
  if (Array.isArray(value)) return value;
  const record = asObject(value);
  if (Array.isArray(record.presets)) return record.presets;
  if (Array.isArray(record.templates)) return record.templates;
  return [value];
}
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
    "label",
    "input",
    "button",
    "img",
    "figure",
    "figcaption",
    "main",
    "aside",
    "nav",
    "progress",
    "meter",
    "time",
    "mark",
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
function coerceImportedPreset(value, index = 0) {
  const record = asObject(value);
  if (Object.keys(record).length === 0) return null;
  const extSettings = asObject(record.extSettings);
  const templateName = asString(record.templateName, asString(record.name, `Imported Template ${index + 1}`));
  const htmlTemplate = asString(
    record.htmlTemplate,
    asString(record.templateHtml, asString(record.renderTemplate, asString(record.template)))
  );
  const hasNativeShape = typeof record.id === "string" && typeof record.name === "string" && typeof record.htmlTemplate === "string";
  const hasSimTrackerShape = Boolean(
    record.templateName || record.sysPrompt || record.customFields || record.extSettings || record.templatePosition
  );
  if (!hasNativeShape && !hasSimTrackerShape) return null;
  if (!htmlTemplate) return null;
  const rawFields = Array.isArray(record.customFields) ? record.customFields : Array.isArray(extSettings.customFields) ? extSettings.customFields : Array.isArray(record.fields) ? record.fields : [];
  const synthesized = rawFields.length > 0 ? synthesizePresetFromCustomFields(rawFields) : null;
  const schemaJson = isPlainObject(record.schemaJson) ? record.schemaJson : isPlainObject(record.schema) ? record.schema : synthesized?.schemaJson;
  const sampleData = isPlainObject(record.sampleData) ? record.sampleData : isPlainObject(record.sample) ? record.sample : synthesized?.sampleData;
  const rawId = asString(record.id, asString(record.templateId, templateName));
  const normalizedId = normalizePresetId(rawId, "imported_loom");
  const safeId = isBuiltInPresetId(normalizedId) ? `${normalizedId}_imported_${Date.now()}` : normalizedId;
  const codeBlockNames = [
    ...asStringArray(record.fenceNames),
    ...asStringArray(asObject(record.parserOptions).fenceNames),
    asString(record.codeBlockIdentifier),
    asString(extSettings.codeBlockIdentifier),
    "tracker",
    "loom"
  ].filter(Boolean);
  const templatePosition = asString(record.templatePosition).toUpperCase();
  const promptInstructions = asString(
    record.promptInstructions,
    asString(record.sysPrompt, asString(record.systemPrompt, asString(record.prompt)))
  );
  const isSimTracker = hasSimTrackerShape && !hasNativeShape;
  const promptWithOverride = [
    promptInstructions || "Track the current roleplay scene as structured continuity JSON.",
    isSimTracker ? [
      "",
      "STATE OF THE LOOM IMPORT COMPATIBILITY OVERRIDE:",
      "Return raw JSON only. Do not wrap output in markdown fences, SimTracker tags, HTML, prose, or comments.",
      "The JSON must match the State of the Loom schema below and should include a characters array when character fields are present."
    ].join("\n") : ""
  ].filter(Boolean).join("\n");
  const importedPreset = {
    ...record,
    id: safeId,
    name: templateName,
    version: asString(record.version, LOOM_VERSION),
    description: asString(record.description, asString(record.templateDescription, asString(record.displayInstructions, "Imported tracker template."))),
    origin: "imported",
    templateEngine: isSimTracker || record.templateEngine === "handlebars_compat" ? "handlebars_compat" : "loom",
    sourceFormat: isSimTracker ? "simtracker" : record.sourceFormat === "simtracker" ? "simtracker" : "loom",
    mode: record.mode === "passive_extract" || record.mode === "sidecar_generate" || record.mode === "hybrid" ? record.mode : "hybrid",
    htmlTemplate,
    promptInstructions: promptWithOverride,
    injectionTemplate: asString(record.injectionTemplate, "[Imported Loom]\n{{compactSummary}}"),
    maxInjectionTokens: typeof record.maxInjectionTokens === "number" ? record.maxInjectionTokens : 220,
    defaultPlacement: templatePosition === "TOP" || record.defaultPlacement === "top" ? "top" : record.defaultPlacement === "bottom" ? "bottom" : "top",
    parserOptions: {
      fenceNames: [...new Set(codeBlockNames)],
      strictJson: asObject(record.parserOptions).strictJson === false ? false : true,
      repairInvalidJson: asObject(record.parserOptions).repairInvalidJson === true
    }
  };
  const normalizedFields = synthesized?.fields ?? (rawFields.length > 0 ? rawFields.map((field, fieldIndex) => normalizeTemplateField(field, fieldIndex)) : void 0);
  if (normalizedFields) importedPreset.customFields = normalizedFields;
  if (schemaJson) importedPreset.schemaJson = schemaJson;
  if (sampleData) importedPreset.sampleData = sampleData;
  return normalizePreset(importedPreset);
}
function coerceImportedPresets(value) {
  const failures = [];
  const presets = extractImportCandidates(value).map((candidate, index) => {
    const preset = coerceImportedPreset(candidate, index);
    if (!preset) failures.push(`Item ${index + 1} is missing a supported template shape or htmlTemplate.`);
    return preset;
  }).filter((preset) => Boolean(preset));
  return { presets, failures };
}
function normalizePreset(preset) {
  const now2 = (/* @__PURE__ */ new Date()).toISOString();
  const id = normalizePresetId(preset.id || `custom_loom_${Date.now()}`);
  const origin = preset.origin && VALID_ORIGINS.has(preset.origin) ? preset.origin : "custom";
  const templateEngine = preset.templateEngine && VALID_TEMPLATE_ENGINES.has(preset.templateEngine) ? preset.templateEngine : "loom";
  const sourceFormat = preset.sourceFormat && VALID_SOURCE_FORMATS.has(preset.sourceFormat) ? preset.sourceFormat : "loom";
  return {
    id,
    name: String(preset.name || "Custom Loom Template"),
    version: String(preset.version || LOOM_VERSION),
    description: String(preset.description || ""),
    origin: id && isBuiltInPresetId(id) ? "built-in" : origin === "built-in" ? "custom" : origin,
    templateEngine,
    sourceFormat,
    customFields: Array.isArray(preset.customFields) ? preset.customFields.map((field, index) => normalizeTemplateField(field, index)) : void 0,
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
      fenceNames: Array.isArray(preset.parserOptions?.fenceNames) ? preset.parserOptions.fenceNames.filter((item) => typeof item === "string" && Boolean(item.trim())) : ["tracker", "loom"],
      strictJson: typeof preset.parserOptions?.strictJson === "boolean" ? preset.parserOptions.strictJson : true,
      repairInvalidJson: typeof preset.parserOptions?.repairInvalidJson === "boolean" ? preset.parserOptions.repairInvalidJson : false
    },
    sampleData: preset.sampleData && typeof preset.sampleData === "object" && !Array.isArray(preset.sampleData) ? preset.sampleData : { sceneTitle: "New Scene", location: "Foyer" },
    createdAt: String(preset.createdAt || now2),
    updatedAt: now2
  };
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

// src/frontend/uiState.ts
var sectionState = /* @__PURE__ */ new Map();
var focusedTrackerRef = null;
function documentRef() {
  return typeof document === "undefined" ? null : document;
}
function windowRef() {
  return typeof window === "undefined" ? null : window;
}
function attrEscape(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function activeSelector(element) {
  const htmlElement = element;
  if (htmlElement.id) return `[id="${attrEscape(htmlElement.id)}"]`;
  const editorField = htmlElement.getAttribute("data-sotl-editor-field");
  if (editorField) return `[data-sotl-editor-field="${attrEscape(editorField)}"]`;
  const settingsField = htmlElement.getAttribute("data-sotl-field");
  if (settingsField) return `[data-sotl-field="${attrEscape(settingsField)}"]`;
  const section = htmlElement.getAttribute("data-sotl-section");
  if (section) return `[data-sotl-section="${attrEscape(section)}"]`;
  const name = htmlElement.getAttribute("name");
  if (name) return `[name="${attrEscape(name)}"]`;
  return void 0;
}
function isInputWithSelection(value) {
  if (!value) return false;
  if (typeof HTMLInputElement !== "undefined" && value instanceof HTMLInputElement) return true;
  if (typeof HTMLTextAreaElement !== "undefined" && value instanceof HTMLTextAreaElement) return true;
  return false;
}
function isDetailsElement(value) {
  return typeof HTMLDetailsElement !== "undefined" && value instanceof HTMLDetailsElement;
}
function setUiSectionOpen(id, open) {
  if (!id) return;
  sectionState.set(id, open);
}
function isUiSectionOpen(id, defaultOpen = false) {
  const stored = sectionState.get(id);
  return stored === void 0 ? defaultOpen : stored;
}
function getOpenSectionIds() {
  return Array.from(sectionState.entries()).filter(([, open]) => open).map(([id]) => id);
}
function setFocusedTrackerRef(ref) {
  focusedTrackerRef = ref;
}
function getFocusedTrackerRef() {
  return focusedTrackerRef;
}
function clearFocusedTrackerRef() {
  focusedTrackerRef = null;
}
function syncFocusedTrackerSwipe(activeSwipeByMessageId) {
  if (!focusedTrackerRef || !activeSwipeByMessageId) return;
  const activeSwipe = activeSwipeByMessageId[focusedTrackerRef.messageId];
  if (typeof activeSwipe !== "number" || focusedTrackerRef.swipeId === activeSwipe) return;
  focusedTrackerRef = {
    messageId: focusedTrackerRef.messageId,
    swipeId: activeSwipe
  };
}
function captureUiState(root) {
  const doc = documentRef();
  const scope = root ?? doc;
  const details = scope?.querySelectorAll?.("details[data-sotl-section]");
  details?.forEach((node) => {
    if (isDetailsElement(node)) {
      setUiSectionOpen(node.dataset.sotlSection || "", node.open);
    }
  });
  const activeElement = doc?.activeElement ?? null;
  const selector = activeElement ? activeSelector(activeElement) : void 0;
  let active;
  if (selector) {
    active = { selector };
    if (isInputWithSelection(activeElement)) {
      active.selectionStart = activeElement.selectionStart;
      active.selectionEnd = activeElement.selectionEnd;
    }
  }
  return {
    openSections: getOpenSectionIds(),
    rootScrollTop: root && root instanceof HTMLElement ? root.scrollTop : void 0,
    windowScrollY: windowRef()?.scrollY,
    active
  };
}
function restoreUiState(root, snapshot) {
  const doc = documentRef();
  const scope = root ?? doc;
  const openSections = new Set(snapshot.openSections);
  scope?.querySelectorAll?.("details[data-sotl-section]").forEach((node) => {
    if (!isDetailsElement(node)) return;
    const id = node.dataset.sotlSection || "";
    node.open = openSections.has(id);
  });
  const restore = () => {
    if (root && root instanceof HTMLElement && typeof snapshot.rootScrollTop === "number") {
      root.scrollTop = snapshot.rootScrollTop;
    }
    if (typeof snapshot.windowScrollY === "number") {
      windowRef()?.scrollTo?.({ top: snapshot.windowScrollY });
    }
    if (!snapshot.active) return;
    const target = scope?.querySelector?.(snapshot.active.selector);
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: true });
      if (isInputWithSelection(target) && typeof snapshot.active.selectionStart === "number") {
        try {
          target.setSelectionRange(snapshot.active.selectionStart, snapshot.active.selectionEnd ?? snapshot.active.selectionStart);
        } catch {
        }
      }
    }
  };
  if (typeof globalThis.requestAnimationFrame === "function") {
    globalThis.requestAnimationFrame(restore);
  } else {
    restore();
  }
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
    lastPreviewReport = renderTrackerHtmlDetailed(mockTracker, editingPreset, "trusted_layout");
    lastPreviewHtml = lastPreviewReport.html;
    lastJsonParseError = null;
  } catch (err) {
    lastJsonParseError = `Preview failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}
function editorDetails(id, title, body, defaultOpen = false) {
  return [
    `<details class="sotl-details" data-sotl-section="${escapeHtml2(id)}"${isUiSectionOpen(id, defaultOpen) ? " open" : ""}>`,
    `<summary>${escapeHtml2(title)}</summary>`,
    body,
    "</details>"
  ].join("");
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
  const latestData = state2.latestTracker?.presetId === editingPreset.id ? state2.latestTracker.data : void 0;
  const compatibility = buildTemplateCompatibilityReport(editingPreset, editingPreset.sampleData || {}, latestData);
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
    isBuiltIn ? '<p class="sotl-note" style="color: var(--lv-accent, #3864d9);">Built-in templates are read-only. Click "Duplicate to Edit" to customize.</p>' : '<p class="sotl-note" style="color: var(--lv-success-text, #176b43);">Editing a custom template.</p>',
    (() => {
      const readiness = checkPresetReadiness(editingPreset);
      const warningsList = readiness.templateWarnings.length > 0 ? `<div style="margin-top: 4px; padding: 4px 6px; border-radius: 4px; background: rgba(176,104,0,0.08); color: var(--lv-warning-text,#8a4f00); font-size: 10px;">Template cleanup will remove: ${readiness.templateWarnings.map((w) => escapeHtml2(w)).join(", ")}</div>` : "";
      return [
        '<div class="sotl-panel" style="margin-top: 6px; padding: 10px; background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.45)); display: grid; gap: 4px; border: 1px dashed var(--lumiverse-border, rgba(80,88,100,0.2));">',
        '  <strong style="font-size: 11px; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">',
        readiness.ready ? '<span style="color: var(--lv-success-text, #176b43);">Ready to Generate</span>' : '<span style="color: var(--lv-error-text, #bd2130);">Not Ready to Generate</span>',
        "  </strong>",
        '  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; font-size: 11px;">',
        `    <div><strong>Schema:</strong> ${readiness.schemaValid ? "Valid" : `<span style="color:var(--lv-error-text,#bd2130);">${escapeHtml2(readiness.schemaError || "Invalid")}</span>`}</div>`,
        `    <div><strong>Sample Data:</strong> ${readiness.sampleDataValid ? "Valid" : `<span style="color:var(--lv-error-text,#bd2130);">${escapeHtml2(readiness.sampleDataError || "Invalid")}</span>`}</div>`,
        `    <div><strong>Template:</strong> ${readiness.templateSafe ? "Clean" : "Cleanup warnings"}</div>`,
        `    <div><strong>Instructions:</strong> ${readiness.promptPresent ? "Present" : "Missing"}</div>`,
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
    // Collapsible details sections preserve their open state during autosaves.
    editorDetails("editor-metadata", "Metadata", [
      '<div class="sotl-fields" style="margin-top: 8px;">',
      `  <p class="sotl-note">Origin: <code>${escapeHtml2(editingPreset.origin || (isBuiltIn ? "built-in" : "custom"))}</code> - Engine: <code>${escapeHtml2(editingPreset.templateEngine || "loom")}</code> - Source: <code>${escapeHtml2(editingPreset.sourceFormat || "loom")}</code></p>`,
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
      "</div>"
    ].join("")),
    editorDetails("editor-html-template", "HTML Template", [
      '<div class="sotl-fields" style="margin-top: 8px;">',
      `  <textarea class="sotl-textarea" data-sotl-editor-field="htmlTemplate" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(editingPreset.htmlTemplate)}</textarea>`,
      "</div>"
    ].join("")),
    editorDetails("editor-prompt", "Prompt Instructions", [
      '<div class="sotl-fields" style="margin-top: 8px;">',
      `  <textarea class="sotl-textarea" data-sotl-editor-field="promptInstructions" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(editingPreset.promptInstructions)}</textarea>`,
      "</div>"
    ].join("")),
    editorDetails("editor-schema", "Schema JSON", [
      '<div class="sotl-fields" style="margin-top: 8px;">',
      `  <textarea class="sotl-textarea" data-sotl-editor-field="schemaJson" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(JSON.stringify(editingPreset.schemaJson, null, 2))}</textarea>`,
      "</div>"
    ].join("")),
    editorDetails("editor-sample-data", "Sample Data JSON", [
      '<div class="sotl-fields" style="margin-top: 8px;">',
      `  <textarea class="sotl-textarea" data-sotl-editor-field="sampleData" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(JSON.stringify(editingPreset.sampleData, null, 2))}</textarea>`,
      "</div>"
    ].join("")),
    editorDetails("editor-legacy-injection", "Legacy Preset Injection Fields", [
      '<div class="sotl-fields" style="margin-top: 8px;">',
      '  <p class="sotl-note">Legacy per-preset fields. Context Injection Lite uses the global Context Injection settings in the drawer.</p>',
      '  <label class="sotl-label">Max Injection Tokens',
      `    <input class="sotl-input" type="number" data-sotl-editor-field="maxInjectionTokens" value="${editingPreset.maxInjectionTokens}" ${isBuiltIn ? "disabled" : ""}>`,
      "  </label>",
      '  <label class="sotl-label">Injection Template',
      `  <textarea class="sotl-textarea" data-sotl-editor-field="injectionTemplate" ${isBuiltIn ? "disabled" : ""}>${escapeHtml2(editingPreset.injectionTemplate)}</textarea>`,
      "  </label>",
      "</div>"
    ].join("")),
    editorDetails("editor-import-export", "Import / Export", [
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
        lastImportStatus.ok ? "Import succeeded" : "Import failed",
        "</strong>",
        `  <p style="margin: 4px 0 0; font-size: 12px; line-height: 1.4;">${escapeHtml2(lastImportStatus.message)}</p>`,
        lastImportStatus.presetName ? `  <p style="margin: 4px 0 0; font-size: 11px; color: var(--lumiverse-text-muted,#64707d);">Template: <strong>${escapeHtml2(lastImportStatus.presetName)}</strong></p>` : "",
        lastImportStatus.presetId ? `  <p style="margin: 2px 0 0; font-size: 11px; color: var(--lumiverse-text-muted,#64707d);">ID: <code>${escapeHtml2(lastImportStatus.presetId)}</code></p>` : "",
        "</div>"
      ].join("") : "",
      "</div>"
    ].join("")),
    // Preview / Validation Section
    editorDetails("editor-preview-validation", "Preview & Validation", [
      '<div style="margin-top: 8px;">',
      '  <div class="sotl-actions" style="margin-bottom: 8px;">',
      button("Run Template Preview", "editor-preview", { primary: true }),
      "  </div>",
      lastJsonParseError ? `<p class="sotl-note sotl-warning" style="margin-bottom: 8px; color: var(--lv-error-text, #bd2130);">${escapeHtml2(lastJsonParseError)}</p>` : "",
      lastSanitizerWarnings.length > 0 ? [
        '<div style="background: rgba(176,104,0,0.08); border-left: 3px solid var(--lv-warning-border, #b06800); padding: 8px; margin-bottom: 8px; border-radius: 4px;">',
        '  <strong style="color: var(--lv-warning-text, #8a4f00); font-size: 11px;">Template Cleanup Warnings:</strong>',
        '  <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 11px; color: var(--lv-warning-text, #8a4f00);">',
        ...lastSanitizerWarnings.map((w) => `    <li>${escapeHtml2(w)}</li>`),
        "  </ul>",
        "</div>"
      ].join("\n") : "",
      lastPreviewReport ? `<p class="sotl-note" style="margin-bottom: 8px;">Preview render: ${lastPreviewReport.success ? "template rendered" : "fallback used"}${lastPreviewReport.warning ? ` - ${escapeHtml2(lastPreviewReport.warning)}` : ""}</p>` : "",
      [
        '<div style="margin: 8px 0; padding: 8px; border-radius: 6px; background: rgba(0,0,0,0.04); display: grid; gap: 4px; font-size: 11px;">',
        "  <strong>Template Compatibility Report</strong>",
        `  <div>Engine: <code>${escapeHtml2(compatibility.templateEngine)}</code> - Source: <code>${escapeHtml2(compatibility.sourceFormat)}</code> - References: <code>${compatibility.referencedFields.length}</code></div>`,
        `  <div>Missing from sample: <code>${escapeHtml2(compatibility.missingFromSample.join(", ") || "none")}</code></div>`,
        latestData ? `  <div>Missing from latest tracker: <code>${escapeHtml2(compatibility.missingFromLatest.join(", ") || "none")}</code></div>` : "  <div>Latest tracker coverage: <code>no matching latest tracker</code></div>",
        "</div>"
      ].join("\n"),
      lastPreviewHtml ? [
        '<div style="margin-top: 8px;">',
        '  <span style="font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted, #64707d);">Mock Render Preview:</span>',
        `  <div class="sotl-preview" style="margin-top: 4px; max-height: 250px; overflow-y: auto;">${lastPreviewHtml}</div>`,
        "</div>"
      ].join("\n") : '<p class="sotl-note">Click "Run Template Preview" to check how this template renders with the sample data.</p>',
      "</div>"
    ].join(""), true),
    "</div>"
  ].join("");
}

// src/frontend/settingsPanel.ts
function renderFeatureBreakdown(collapsible = false) {
  const content = [
    '<div class="sotl-feature-grid">',
    "<article><strong>Drawer HUD</strong><span>Shows status, current tracker, controls, diagnostics, and preset details.</span></article>",
    "<article><strong>Settings panel</strong><span>Works from the extension list and exposes the core toggles.</span></article>",
    "<article><strong>Grand Continuity Atlas</strong><span>New default tracker with rich scene, appearance, relationship, world-state, and next-turn continuity sections.</span></article>",
    "<article><strong>Passive extraction</strong><span>Reads fenced <code>tracker</code> and <code>loom</code> JSON blocks from assistant replies.</span></article>",
    "<article><strong>Generate tracker</strong><span>Uses a sidecar connection or default fallback to make tracker JSON for the latest assistant message.</span></article>",
    "<article><strong>Context Injection Lite</strong><span>Compresses the latest tracker into a configurable continuity brief for live roleplay prompts.</span></article>",
    "<article><strong>Per-chat storage</strong><span>Saves latest and per-message tracker state through user storage.</span></article>",
    "<article><strong>Message cards</strong><span>Best-effort top or bottom card mounting when Lumiverse exposes message host ids.</span></article>",
    "<article><strong>Manual JSON edit</strong><span>Lets you correct the current tracker without regenerating.</span></article>",
    "<article><strong>Runtime recovery</strong><span>Repairs corrupt Loom storage and exposes Reset Loom Storage when the backend is slow or offline.</span></article>",
    "</div>",
    '<p class="sotl-note">Not in this milestone: simulation clocks, entity inbox, companion autonomy, Council tools, and arbitrary template JavaScript.</p>'
  ].join("");
  if (collapsible) {
    return [
      '<section class="sotl-panel">',
      '<details class="sotl-details" data-sotl-section="features"><summary>What this version does (Features)</summary>',
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
      "<h2>Loom Keeper</h2>",
      `<p class="sotl-note">${escapeHtml2(offlineText)}</p>`,
      status.lastFrontendError ? `<p class="sotl-note sotl-warning">${escapeHtml2(status.lastFrontendError)}</p>` : "",
      '<div class="sotl-actions">',
      button("Refresh", "refresh"),
      button("Open Loom Drawer", "open-drawer"),
      button("Reset Loom Storage", "reset-storage", { title: "Resets Loom Keeper settings, presets, and trackers for this user." }),
      "</div>",
      "</section>",
      "</div>"
    ].join("");
  }
  return [
    '<div class="sotl-root sotl-settings" data-sotl-settings="true">',
    '<section class="sotl-panel">',
    "<h2>Loom Keeper</h2>",
    `<p class="sotl-note">Active chat: ${escapeHtml2(state2.activeChat.name || state2.activeChat.id || "None")}</p>`,
    '<div class="sotl-status">',
    badge("Backend ready", state2.backendReady),
    badge("Chats", state2.permissions.chats),
    badge("Chat mutation", state2.permissions.chat_mutation),
    badge("Generation", state2.permissions.generation),
    badge("Prompt injection", Boolean(state2.permissions.interceptor || state2.diagnostics.injectionReport?.registered)),
    "</div>",
    '<div class="sotl-actions">',
    button("Open Loom Drawer", "open-drawer", { primary: true }),
    button("Reset Loom Storage", "reset-storage", { title: "Resets Loom Keeper settings, presets, and trackers for this user." }),
    "</div>",
    status.lastToast ? `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid ${status.lastToast.level === "success" ? "#176b43" : status.lastToast.level === "error" ? "#bd2130" : "#b06800"}; background: ${status.lastToast.level === "success" ? "rgba(27,126,80,0.07)" : status.lastToast.level === "error" ? "rgba(220,53,69,0.08)" : "rgba(255,193,7,0.08)"}; display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <strong>${escapeHtml2(status.lastToast.level)}</strong>
          <div style="flex: 1; line-height: 1.4; color: ${status.lastToast.level === "success" ? "var(--lv-success-text,#176b43)" : status.lastToast.level === "error" ? "var(--lv-error-text,#bd2130)" : "var(--lv-warning-text,#8a4f00)"}; font-weight: 500;">${escapeHtml2(status.lastToast.message)}</div>
        </div>` : "",
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Core configuration status</h3>",
    '<p class="sotl-note" style="margin-bottom: 12px;">All detailed settings, preset configurations, sidecar connections, and diagnostics are managed within the main Loom Drawer.</p>',
    '<div class="sotl-fields">',
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="enabled" ${state2.settings.enabled ? "checked" : ""}> Extension enabled</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatHudLauncher" ${state2.settings.showChatHudLauncher ? "checked" : ""}> Show chat HUD button</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionEnabled" ${state2.settings.promptInjectionEnabled ? "checked" : ""}> Inject compact continuity brief</label>`,
    state2.diagnostics.injectionReport ? `<p class="sotl-note">Injection estimate: ~${state2.diagnostics.injectionReport.estimatedTokens} / ${state2.diagnostics.injectionReport.tokenBudget} tokens.</p>` : "",
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
function effectiveTemplateMode(state2) {
  return state2.settings.useSafeRenderer ? "safe_generic" : state2.settings.customTemplateMode || "trusted_layout";
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
    else if (preset.id === "grand_continuity_atlas") suffix = "[~2500t - Grand]";
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
function detailOpenAttr(id, defaultOpen = false) {
  return isUiSectionOpen(id, defaultOpen) ? " open" : "";
}
function renderSettingsSection(id, title, meta, body, defaultOpen = false) {
  return [
    `<details class="sotl-details sotl-settings-section" data-sotl-section="${escapeHtml2(id)}"${detailOpenAttr(id, defaultOpen)}>`,
    `<summary><span class="sotl-summary-title">${escapeHtml2(title)}</span>${meta ? `<span class="sotl-summary-meta">${escapeHtml2(meta)}</span>` : ""}</summary>`,
    body,
    "</details>"
  ].join("");
}
function renderSavePulse(status) {
  if (!status.lastSettingsSavedAt) return "";
  return '<span class="sotl-save-pulse">Saved</span>';
}
function formatTrackerAge(generatedAt) {
  if (!generatedAt) return "none yet";
  const time = Date.parse(generatedAt);
  if (Number.isNaN(time)) return generatedAt;
  const seconds = Math.max(0, Math.round((Date.now() - time) / 1e3));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}
function renderTimeoutOptions(state2) {
  const timeoutMs = state2.settings.sidecarGenerationTimeoutMs ?? 18e4;
  return [
    `<option value="60000"${timeoutMs === 6e4 ? " selected" : ""}>60 seconds</option>`,
    `<option value="120000"${timeoutMs === 12e4 ? " selected" : ""}>120 seconds</option>`,
    `<option value="180000"${timeoutMs === 18e4 ? " selected" : ""}>180 seconds (default)</option>`,
    `<option value="300000"${timeoutMs === 3e5 ? " selected" : ""}>300 seconds</option>`,
    `<option value="0"${timeoutMs === 0 ? " selected" : ""}>No timeout (manual cancel only)</option>`
  ].join("");
}
function renderHistoryLimitOptions(state2) {
  const limit = state2.settings.trackerHistoryLimit ?? 20;
  return [
    `<option value="5"${limit === 5 ? " selected" : ""}>Last 5 full trackers</option>`,
    `<option value="10"${limit === 10 ? " selected" : ""}>Last 10 full trackers</option>`,
    `<option value="20"${limit === 20 ? " selected" : ""}>Last 20 full trackers (default)</option>`,
    `<option value="50"${limit === 50 ? " selected" : ""}>Last 50 full trackers</option>`,
    `<option value="0"${limit === 0 ? " selected" : ""}>Unlimited (manual cleanup)</option>`
  ].join("");
}
function renderInjectionBudgetOptions(state2) {
  const budget = state2.settings.promptInjectionTokenBudget ?? 700;
  return [300, 500, 700, 1e3, 1500, 2e3].map((value) => `<option value="${value}"${budget === value ? " selected" : ""}>~${value} tokens</option>`).join("");
}
function renderInjectionLimitOptions(state2) {
  const limit = state2.settings.promptInjectionTrackerLimit ?? 5;
  return [1, 3, 5, 10].map((value) => `<option value="${value}"${limit === value ? " selected" : ""}>Latest + ${value} compact summar${value === 1 ? "y" : "ies"}</option>`).join("");
}
function renderGenerationHistoryLimitOptions(state2) {
  const limit = state2.settings.trackerGenerationHistoryLimit ?? 5;
  return [0, 3, 5, 10].map((value) => `<option value="${value}"${limit === value ? " selected" : ""}>Previous full + ${value} compact summar${value === 1 ? "y" : "ies"}</option>`).join("");
}
function formatSwipeLabel(swipeId) {
  return typeof swipeId === "number" ? `Swipe ${swipeId + 1}` : "Main swipe";
}
function renderSwipeChip(swipeId, active = false) {
  if (typeof swipeId !== "number") return "";
  return `<span class="sotl-swipe-chip${active ? " sotl-swipe-chip--active" : ""}" title="${active ? "Currently selected assistant swipe" : "Stored assistant swipe"}">${escapeHtml2(formatSwipeLabel(swipeId))}${active ? " active" : ""}</span>`;
}
function trackerActionButton(label, action, tracker, options = {}) {
  const id = tracker.messageId || "latest";
  const primary = options.primary ? ' data-primary="true"' : "";
  const swipe = typeof tracker.swipeId === "number" ? ` data-sotl-swipe-id="${tracker.swipeId}"` : "";
  return `<button class="sotl-button" type="button" data-sotl-action="${escapeHtml2(action)}" data-sotl-message-id="${escapeHtml2(id)}"${swipe}${primary}>${escapeHtml2(label)}</button>`;
}
function formatMessageReference(id, index) {
  const match = id.match(/(?:message[-_:#]?|msg[-_:#]?|^)(\d+)$/i);
  if (match?.[1]) return `Message #${match[1]}`;
  return `Retained message ${index + 1}`;
}
function resolveFocusedTracker(state2, ref) {
  const trackers = state2.messageTrackers.filter((tracker) => tracker.messageId === ref.messageId);
  const activeSwipe = typeof ref.swipeId === "number" ? ref.swipeId : state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[ref.messageId] : void 0;
  if (typeof activeSwipe === "number") {
    const exact = trackers.find((tracker) => tracker.swipeId === activeSwipe);
    if (exact) return { tracker: exact, swipeId: activeSwipe, notice: ref.notice };
    if (trackers.some((tracker) => typeof tracker.swipeId === "number")) {
      return {
        swipeId: activeSwipe,
        notice: ref.notice || `No tracker is stored for ${formatSwipeLabel(activeSwipe)} on this message. It may not have generated yet or may have been pruned by the tracker history limit.`
      };
    }
  }
  if (trackers.length === 1 && trackers[0] && typeof trackers[0].swipeId !== "number") {
    return { tracker: trackers[0], swipeId: trackers[0].swipeId, notice: ref.notice };
  }
  if (trackers.length === 0) {
    return { swipeId: activeSwipe, notice: ref.notice || "No tracker is stored for this message." };
  }
  return {
    swipeId: activeSwipe,
    notice: ref.notice || "Loom Keeper did not guess between multiple stored swipe trackers because the active swipe is unclear."
  };
}
function renderFocusedTracker(state2) {
  const ref = getFocusedTrackerRef();
  if (!ref) return "";
  const resolved = resolveFocusedTracker(state2, ref);
  const swipeLabel = typeof resolved.swipeId === "number" ? formatSwipeLabel(resolved.swipeId) : "active swipe";
  const headerMeta = [
    `Message ${ref.messageId}`,
    swipeLabel
  ].filter(Boolean).join(" - ");
  const backButton = button("Back to Current Loom", "clear-focused-tracker", { title: "Return the drawer to the normal current tracker view." });
  if (!resolved.tracker) {
    return [
      '<section class="sotl-panel sotl-focused-tracker" data-sotl-focused-tracker="true">',
      "<h3>Focused Tracker</h3>",
      `<p class="sotl-note">${escapeHtml2(headerMeta)}</p>`,
      `<p class="sotl-note sotl-warning">${escapeHtml2(resolved.notice || "No tracker is available for this exact message and swipe.")}</p>`,
      '<div class="sotl-actions">',
      backButton,
      "</div>",
      "</section>"
    ].join("");
  }
  const render = renderTrackerForState(resolved.tracker, state2);
  const warning = render.warning ? `<p class="sotl-note sotl-warning" style="margin-top: 8px;">${escapeHtml2(render.warning)}</p>` : "";
  return [
    '<section class="sotl-panel sotl-focused-tracker" data-sotl-focused-tracker="true">',
    "<h3>Focused Tracker</h3>",
    `<p class="sotl-note">${escapeHtml2(headerMeta)} ${renderSwipeChip(resolved.tracker.swipeId, true)}</p>`,
    resolved.notice ? `<p class="sotl-note sotl-warning">${escapeHtml2(resolved.notice)}</p>` : "",
    `<p class="sotl-note">${escapeHtml2(resolved.tracker.compactSummary)}</p>`,
    `<div class="sotl-preview">${render.html}</div>`,
    warning,
    '<div class="sotl-actions">',
    backButton,
    trackerActionButton("Regenerate", `regenerate:${resolved.tracker.messageId || "latest"}`, resolved.tracker, { primary: true }),
    "</div>",
    "</section>"
  ].join("");
}
function renderLatestTracker(state2) {
  const activeResolution = resolveActiveTrackerForState(state2);
  const tracker = activeResolution.tracker;
  if (!tracker) {
    if (activeResolution.missingMessageId && typeof activeResolution.missingSwipeId === "number") {
      return `<p class="sotl-note sotl-warning">No tracker retained/generated for ${escapeHtml2(formatSwipeLabel(activeResolution.missingSwipeId))} on the currently selected response. Loom Keeper will not show another swipe's tracker here.</p>`;
    }
    const activeMessageId = state2.diagnostics.swipeReport?.activeMessageId;
    const activeSwipeId = state2.diagnostics.swipeReport?.activeSwipeId;
    const hasOtherSwipeTracker = Boolean(activeMessageId && state2.messageTrackers.some((tracker2) => tracker2.messageId === activeMessageId));
    if (hasOtherSwipeTracker && typeof activeSwipeId === "number") {
      return `<p class="sotl-note">No tracker has been stored for the selected ${escapeHtml2(formatSwipeLabel(activeSwipeId))} yet. Generate a tracker while this swipe is visible to attach the right state.</p>`;
    }
    return '<p class="sotl-note">No tracker has been stored for this chat yet.</p>';
  }
  const render = renderTrackerForState(tracker, state2);
  const html = render.html;
  const renderWarning = render.warning ? `<p class="sotl-note sotl-warning" style="margin-top: 8px;">${escapeHtml2(render.warning)}</p>` : "";
  const isActiveSwipe = Boolean(
    tracker.messageId && typeof tracker.swipeId === "number" && state2.activeSwipeByMessageId && state2.activeSwipeByMessageId[tracker.messageId] === tracker.swipeId
  );
  const attachmentStatus = state2.settings.renderInMessages && tracker.messageId ? `<p class="sotl-note" style="color: var(--lv-success-text, #176b43); font-weight: 600; margin-top: 8px;">Attached to message card (${escapeHtml2(tracker.messageId)})</p>` : '<p class="sotl-note" style="margin-top: 8px;">Status: Not attached to a message card.</p>';
  return [
    typeof tracker.swipeId === "number" ? `<div class="sotl-chip-row">${renderSwipeChip(tracker.swipeId, isActiveSwipe)}</div>` : "",
    `<p class="sotl-note">${escapeHtml2(tracker.compactSummary)}</p>`,
    `<div class="sotl-preview">${html}</div>`,
    renderWarning,
    attachmentStatus,
    '<details class="sotl-details"><summary>Manual JSON edit</summary>',
    '<div class="sotl-fields" style="margin-top: 10px;">',
    `<textarea class="sotl-textarea" data-sotl-field="latestJson">${escapeHtml2(JSON.stringify(tracker.data, null, 2))}</textarea>`,
    '<div class="sotl-actions">',
    button("Save JSON", "save-json"),
    button("Copy JSON", "copy-json", { title: "Copy Loom JSON to clipboard" }),
    "</div>",
    "</div>",
    "</details>"
  ].join("");
}
function renderMessageList(state2) {
  if (state2.messageTrackers.length === 0) return '<p class="sotl-note">No retained message trackers yet. The list uses your tracker history limit and shows message/swipe snapshots that have not been cleaned.</p>';
  const focused = getFocusedTrackerRef();
  const groups = /* @__PURE__ */ new Map();
  for (const tracker of state2.messageTrackers) {
    const id = tracker.messageId || "latest";
    const list = groups.get(id) ?? [];
    list.push(tracker);
    groups.set(id, list);
  }
  const currentTracker = resolveActiveTrackerForState(state2).tracker;
  const renderTrackerRow = (tracker, activeSwipe, compact = false, index = 0) => {
    const id = tracker.messageId || "latest";
    const active = typeof activeSwipe === "number" && tracker.swipeId === activeSwipe;
    const isFocused = Boolean(focused && focused.messageId === id && (typeof focused.swipeId !== "number" || focused.swipeId === tracker.swipeId));
    const isCurrent = Boolean(currentTracker && currentTracker.messageId === tracker.messageId && currentTracker.swipeId === tracker.swipeId);
    const rowClass = `${compact ? "sotl-swipe-row" : "sotl-message-row"}${isFocused ? " sotl-message-row--focused" : ""}`;
    const exactSwipe = typeof tracker.swipeId === "number" ? ` data-sotl-swipe-id="${tracker.swipeId}"` : "";
    const status = isCurrent ? "Current selected tracker" : active ? "Selected swipe tracker" : "Previous retained tracker";
    return [
      `<div class="${rowClass}" data-sotl-action="view-tracker" data-sotl-message-id="${escapeHtml2(id)}"${exactSwipe} role="button" tabindex="0" title="Open this retained tracker">`,
      '  <div class="sotl-message-row__main">',
      `    <p class="sotl-note sotl-message-row__eyebrow">${escapeHtml2(formatMessageReference(id, index))} - ${escapeHtml2(status)}</p>`,
      `    <h3>${escapeHtml2(tracker.compactSummary || id)}</h3>`,
      `    <p class="sotl-note">${renderSwipeChip(tracker.swipeId, active)} ${escapeHtml2(tracker.source)} - ${escapeHtml2(tracker.generatedAt)}</p>`,
      "  </div>",
      '  <div class="sotl-actions">',
      trackerActionButton("View", "view-tracker", tracker, { primary: isCurrent }),
      trackerActionButton("Regenerate", `regenerate:${id}`, tracker, { primary: false }),
      trackerActionButton(tracker.hidden ? "Show" : "Hide", `hide:${id}`, tracker),
      trackerActionButton("Delete", `delete:${id}`, tracker),
      "  </div>",
      "</div>"
    ].join("");
  };
  const intro = '<p class="sotl-note">Retained tracker snapshots for this chat. The list follows your tracker history limit; rows open the exact message/swipe tracker.</p>';
  return intro + Array.from(groups.entries()).map(([id, trackers], groupIndex) => {
    const activeSwipe = state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[id] : void 0;
    const sorted = trackers.slice().sort((a, b) => {
      if (typeof activeSwipe === "number") {
        if (a.swipeId === activeSwipe) return -1;
        if (b.swipeId === activeSwipe) return 1;
      }
      return b.generatedAt.localeCompare(a.generatedAt);
    });
    const primary = sorted[0];
    const alternatives = sorted.slice(1);
    if (!primary) return "";
    return [
      '<div class="sotl-panel sotl-message-group">',
      renderTrackerRow(primary, activeSwipe, false, groupIndex),
      alternatives.length > 0 ? [
        `<details class="sotl-details sotl-swipe-alternatives" data-sotl-section="swipe-alternatives-${escapeHtml2(id)}">`,
        `<summary><span class="sotl-summary-title">Swipe Alternatives</span><span class="sotl-summary-meta">${alternatives.length} stored</span></summary>`,
        '<div class="sotl-fields">',
        alternatives.map((tracker) => renderTrackerRow(tracker, activeSwipe, true, groupIndex)).join(""),
        "</div>",
        "</details>"
      ].join("") : "",
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
  const sanitizerVal = report.sanitizerRemovedContent ? `<span style="color: ${errorColor}; font-weight: 600;">Yes (cleanup removed unsafe content)</span>` : `<span style="color: ${successColor}; font-weight: 600;">No (layout preserved)</span>`;
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
      <div><strong>Previous Full Tracker JSON Included:</strong> <code>${report.previousFullTrackerIncluded ? "yes" : "no"}</code></div>
      ${report.previousFullTrackerMessageId ? `<div><strong>Previous Full Tracker Source:</strong> <code>${escapeHtml2(report.previousFullTrackerMessageId)}${typeof report.previousFullTrackerSwipeId === "number" ? ` - ${escapeHtml2(formatSwipeLabel(report.previousFullTrackerSwipeId))}` : ""}</code></div>` : ""}
      <div><strong>Recent Tracker Summaries Included:</strong> <code>${report.recentTrackerSummariesIncluded ?? 0}</code></div>
      <div><strong>Recent Summaries Compact Only:</strong> <code>${report.recentTrackerSummariesCompactOnly === false ? "no" : "yes"}</code></div>
      <div><strong>Recent Chat Context Included:</strong> <code>${report.recentChatContextIncluded ? "yes" : "no"}${typeof report.recentChatContextMessageCount === "number" ? ` - ${report.recentChatContextMessageCount} messages` : ""}</code></div>
      <div><strong>Activated World Info / Lorebook Included:</strong> <code>${report.worldInfoIncluded ? "yes" : "no"}</code></div>
      ${report.worldInfoStatus ? `<div><strong>World Info Status:</strong> <code>${escapeHtml2(report.worldInfoStatus)}</code></div>` : ""}
      <div><strong>Estimated Sidecar Prompt:</strong> <code>${typeof report.estimatedSidecarPromptTokens === "number" ? `~${report.estimatedSidecarPromptTokens} tokens` : "n/a"}</code></div>
      <div><strong>Stored Snapshot Retention:</strong> <code>${report.storageRetentionLimit === 0 ? "unlimited" : `last ${report.storageRetentionLimit ?? "n/a"}`}</code></div>
      <div><strong>Tracker Generation History:</strong> <code>previous full + ${report.trackerGenerationHistoryLimit ?? 5} compact summaries</code></div>
      <div><strong>RP Context Depth:</strong> <code>latest + ${report.promptInjectionTrackerLimit ?? 5} compact summaries setting</code></div>
      <div><strong>Raw Response Available:</strong> ${rawVal}</div>
      ${report.rawResponsePreview ? `<div><strong>Raw Response Preview:</strong> <code>${escapeHtml2(report.rawResponsePreview)}</code></div>` : ""}
      <div><strong>JSON Parse:</strong> ${parseVal}</div>
      ${report.parseFailureCategory ? `<div><strong>Parse Category:</strong> <code>${escapeHtml2(report.parseFailureCategory)}</code></div>` : ""}
      <div><strong>Schema Validation:</strong> ${valVal}</div>
      ${report.schemaValidationIssues && report.schemaValidationIssues.length > 0 ? `<div><strong>Schema Issues:</strong> <code>${escapeHtml2(report.schemaValidationIssues.map((issue) => `${issue.path || "(root)"} ${issue.message}`).join(" | "))}</code></div>` : ""}
      <div><strong>HTML Render:</strong> ${renderVal}</div>
      ${report.renderWarning ? `<div><strong>Render Warning:</strong> <code>${escapeHtml2(report.renderWarning)}</code></div>` : ""}
      <div><strong>Template Mode:</strong> <code>${escapeHtml2(report.templateMode || "n/a")}</code></div>
      <div><strong>Template Cleanup Removed Content:</strong> ${sanitizerVal}</div>
      <div><strong>Fallback Card Used:</strong> ${fallbackVal}</div>
      <div><strong>Unrendered Data Appended:</strong> ${report.preservedData ? `<span style="color: ${successColor}; font-weight: 600;">Yes</span>` : "No"}</div>
      ${report.templateCompatibility ? `<div><strong>Template Missing Latest Fields:</strong> <code>${escapeHtml2(report.templateCompatibility.missingFromLatest.join(", ") || "none")}</code></div>` : ""}
      ${report.trackerPresetId ? `<div><strong>Tracker Preset ID:</strong> <code>${escapeHtml2(report.trackerPresetId)}</code></div>` : ""}
      <div><strong>Latest Tracker Message ID:</strong> <code>${escapeHtml2(report.messageId)}</code></div>
      ${typeof report.swipeId === "number" ? `<div><strong>Latest Tracker Swipe:</strong> <code>${escapeHtml2(formatSwipeLabel(report.swipeId))}</code></div>` : ""}
      <div><strong>Chat ID:</strong> <code>${escapeHtml2(report.chatId)}</code></div>
      <div><strong>HUD View Mode:</strong> <code>${escapeHtml2(report.hudView)}</code></div>
      <div><strong>Retained Tracker Count:</strong> <code>${report.retainedCount}</code></div>
      ${report.lastError ? `<div><strong>Last Error:</strong> <code>${escapeHtml2(report.lastError)}</code></div>` : ""}
    </div>
  `;
}
function renderSwipeReport(state2) {
  const report = state2.diagnostics.swipeReport;
  if (!report) return '<p class="sotl-note">No swipe report is available yet.</p>';
  return [
    '<div class="sotl-diagnostic-grid sotl-swipe-report">',
    `  <div><strong>Active Message ID:</strong> <code>${escapeHtml2(report.activeMessageId || "unknown")}</code></div>`,
    `  <div><strong>Active Swipe ID:</strong> <code>${typeof report.activeSwipeId === "number" ? escapeHtml2(formatSwipeLabel(report.activeSwipeId)) : "unknown"}</code></div>`,
    `  <div><strong>Stored Swipe Trackers:</strong> <code>${report.storedSwipeTrackerCount}</code></div>`,
    `  <div><strong>Swipe Alternatives:</strong> <code>${report.alternativeSwipeTrackerCount}</code></div>`,
    `  <div><strong>Last Cleanup:</strong> <code>${escapeHtml2(report.cleanupLastRunAt || "not run yet")}</code></div>`,
    `  <div><strong>Cleanup Result:</strong> <code>${report.cleanupRemovedCount ?? 0} removed / ${report.cleanupKeptCount ?? 0} kept</code></div>`,
    report.cleanupWarning ? `  <div><strong>Cleanup Warning:</strong> <code>${escapeHtml2(report.cleanupWarning)}</code></div>` : "",
    "</div>"
  ].filter(Boolean).join("");
}
function renderInjectionReport(state2) {
  const report = state2.diagnostics.injectionReport;
  const successColor = "var(--lv-success-text, #176b43)";
  const warningColor = "var(--lv-warning-text, #8a4f00)";
  if (!report) return '<p class="sotl-note">No injection report is available yet.</p>';
  const enabled = report.enabled ? `<span style="color: ${successColor}; font-weight: 600;">Enabled</span>` : `<span style="color: ${warningColor}; font-weight: 600;">Disabled</span>`;
  const registered = report.registered ? `<span style="color: ${successColor}; font-weight: 600;">Interceptor detected</span>` : `<span style="color: ${warningColor}; font-weight: 600;">Interceptor not detected</span>`;
  const tokenColor = report.estimatedTokens > report.tokenBudget ? "var(--lv-error-text, #bd2130)" : successColor;
  return [
    '<div class="sotl-injection-report">',
    `<div><strong>Status:</strong> ${enabled} - ${registered}</div>`,
    `<div><strong>Mode:</strong> <code>${escapeHtml2(report.mode)}</code></div>`,
    `<div><strong>Latest tracker available:</strong> <code>${report.latestTrackerAvailable ?? report.available ? "yes" : "no"}</code></div>`,
    report.activeMessageId ? `<div><strong>Active message / swipe:</strong> <code>${escapeHtml2(report.activeMessageId)}${typeof report.activeSwipeId === "number" ? ` - ${escapeHtml2(formatSwipeLabel(report.activeSwipeId))}` : ""}</code></div>` : "",
    `<div><strong>Used current active swipe tracker:</strong> <code>${report.activeSwipeTrackerUsed ? "yes" : "no"}</code></div>`,
    `<div><strong>Wrong-swipe fallback avoided:</strong> <code>${report.wrongSwipeFallbackAvoided ? "yes" : "not needed"}</code></div>`,
    `<div><strong>Estimated prompt cost:</strong> <span style="color:${tokenColor};font-weight:700;">~${report.estimatedTokens} tokens</span> / ${report.tokenBudget}</div>`,
    `<div><strong>Trackers included in RP context:</strong> ${report.latestTrackerAvailable ?? report.available ? 1 : 0} latest + ${report.historyCount} compact summaries</div>`,
    `<div><strong>Tracker context depth setting:</strong> <code>latest + ${report.contextDepthSetting ?? state2.settings.promptInjectionTrackerLimit ?? 5}</code></div>`,
    `<div><strong>Full tracker retention setting:</strong> <code>${(report.storageRetentionSetting ?? state2.settings.trackerHistoryLimit) === 0 ? "unlimited" : `last ${report.storageRetentionSetting ?? state2.settings.trackerHistoryLimit}`}</code></div>`,
    `<div><strong>History format:</strong> <code>${report.historyCompactOnly === false ? "rich/full" : "compact summaries only"}</code></div>`,
    report.trackerPresetId ? `<div><strong>Latest preset:</strong> <code>${escapeHtml2(report.trackerPresetId)}</code></div>` : "",
    report.trackerGeneratedAt ? `<div><strong>Latest tracker:</strong> <code>${escapeHtml2(report.trackerGeneratedAt)}</code></div>` : "",
    report.truncated ? `<div><strong>Budget trim:</strong> <span style="color:${warningColor};font-weight:600;">Lower-priority details omitted</span></div>` : "",
    report.injectedAt ? `<div><strong>Last injected:</strong> <code>${escapeHtml2(report.injectedAt)}</code></div>` : "",
    report.lastSkippedReason ? `<div><strong>Note:</strong> ${escapeHtml2(report.lastSkippedReason)}</div>` : "",
    report.preview ? `<details class="sotl-details"><summary>Injection Preview</summary><pre class="sotl-code">${escapeHtml2(report.preview)}</pre></details>` : "",
    "</div>"
  ].filter(Boolean).join("");
}
function renderActiveTemplatePreview(state2) {
  return renderSettingsSection(
    "active-template-preview",
    "Active Template Preview",
    state2.activePreset.name,
    [
      '<div class="sotl-fields">',
      `  <p class="sotl-note sotl-strong-note">Template: ${escapeHtml2(state2.activePreset.name)}</p>`,
      `  <p class="sotl-note">${escapeHtml2(state2.activePreset.description || "No description.")}</p>`,
      '  <div class="sotl-preview sotl-preview--short">',
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
          return renderTrackerHtml(mockTracker, state2.activePreset, effectiveTemplateMode(state2));
        } catch (err) {
          return `<p class="sotl-note sotl-warning">Preview render failed: ${escapeHtml2(err instanceof Error ? err.message : String(err))}</p>`;
        }
      })(),
      "  </div>",
      "</div>"
    ].join("")
  );
}
function renderGenerationBanner(state2, disabledReason) {
  if (state2.generation.running) {
    return [
      '<div class="sotl-status-banner sotl-status-banner--info">',
      '  <span class="sotl-spin sotl-status-dot"></span>',
      `  <div>${escapeHtml2(state2.generation.message || "Generating tracker...")}</div>`,
      "</div>"
    ].join("");
  }
  if (disabledReason) {
    return [
      '<div class="sotl-status-banner sotl-status-banner--warning">',
      '  <span class="sotl-status-dot">!</span>',
      `  <div>Blocked: ${escapeHtml2(disabledReason)}</div>`,
      "</div>"
    ].join("");
  }
  return [
    '<div class="sotl-status-banner sotl-status-banner--success">',
    '  <span class="sotl-status-dot"></span>',
    "  <div>Ready to track the latest assistant message.</div>",
    "</div>"
  ].join("");
}
function renderToast(status) {
  if (!status.lastToast) return "";
  return [
    `<div class="sotl-toast sotl-toast--${escapeHtml2(status.lastToast.level)}">`,
    `  <strong>${escapeHtml2(status.lastToast.level)}</strong>`,
    `  <span>${escapeHtml2(status.lastToast.message)}</span>`,
    "</div>"
  ].join("");
}
function renderControlsPanel(state2, status, selectedConnection, disabledReason) {
  const report = state2.diagnostics.injectionReport;
  const tokenMeta = report ? `~${report.estimatedTokens}/${report.tokenBudget} tokens` : "no estimate";
  const latestAge = formatTrackerAge(state2.latestTracker?.generatedAt);
  const swipeMeta = state2.diagnostics.swipeReport?.activeSwipeId !== void 0 ? formatSwipeLabel(state2.diagnostics.swipeReport.activeSwipeId) : "active swipe unknown";
  return [
    '<section class="sotl-panel sotl-control-panel">',
    '<div class="sotl-panel-head">',
    "  <div>",
    "    <h3>Quick Status</h3>",
    `    <p class="sotl-note">Active chat: ${escapeHtml2(state2.activeChat.name || state2.activeChat.id || "Unavailable")}</p>`,
    "  </div>",
    renderSavePulse(status),
    "</div>",
    '<div class="sotl-quick-grid">',
    `  <article><span>Preset</span><strong>${escapeHtml2(state2.activePreset.name)}</strong><em>${escapeHtml2(state2.activePreset.origin || "built-in")}</em></article>`,
    `  <article><span>Generation</span><strong>${state2.generation.running ? "Running" : disabledReason ? "Blocked" : "Ready"}</strong><em>${escapeHtml2(disabledReason || state2.generation.message || "manual or auto")}</em></article>`,
    `  <article><span>Injection</span><strong>${state2.settings.promptInjectionEnabled ? "Enabled" : "Disabled"}</strong><em>${escapeHtml2(tokenMeta)}</em></article>`,
    `  <article><span>Latest Tracker</span><strong>${escapeHtml2(latestAge)}</strong><em>${state2.messageTrackers.length} retained cards - ${escapeHtml2(swipeMeta)}</em></article>`,
    "</div>",
    '<div class="sotl-status">',
    badge("Backend ready", state2.backendReady),
    badge("Chats", state2.permissions.chats),
    badge("Chat mutation", state2.permissions.chat_mutation),
    badge("Generation", state2.permissions.generation),
    badge("Prompt injection", Boolean(state2.permissions.interceptor || state2.diagnostics.injectionReport?.registered)),
    badge("Settings UI", Boolean(state2.permissions.app_manipulation)),
    "</div>",
    renderSettingsSection(
      "tracking",
      "Tracking",
      state2.generation.running ? "generating" : selectedConnection?.name || "default connection",
      [
        '<div class="sotl-fields">',
        '<label class="sotl-label">Preset',
        `<select class="sotl-select" data-sotl-field="preset">${renderPresetOptions(state2)}</select>`,
        "</label>",
        renderActiveTemplatePreview(state2),
        '<label class="sotl-label">Sidecar connection',
        `<select class="sotl-select" data-sotl-field="connection">${renderConnectionOptions(state2)}</select>`,
        "</label>",
        `<p class="sotl-note">Connection: ${escapeHtml2(selectedConnection?.name || (state2.settings.useDefaultConnectionFallback ? "default/current fallback" : "none selected"))}</p>`,
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="fallback" ' + (state2.settings.useDefaultConnectionFallback ? "checked" : "") + "> Use default/current connection when none is selected</label>",
        !state2.permissions.generation ? '<p class="sotl-note">Generation permission is missing; passive fenced extraction is still available.</p>' : "",
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="autoGenerate" ' + (state2.settings.autoGenerate ? "checked" : "") + "> Auto-generate after assistant messages</label>",
        '<label class="sotl-label">Generation timeout',
        `<select class="sotl-select" data-sotl-field="sidecarGenerationTimeoutMs">${renderTimeoutOptions(state2)}</select>`,
        "</label>",
        '<div class="sotl-actions">',
        state2.generation.running ? button("Stop Generation", "cancel-generation", { primary: true, style: "background: rgba(220,53,69,0.1); color: var(--lv-error-text,#bd2130); border-color: rgba(220,53,69,0.2);" }) : button("Generate tracker", "generate", { primary: true, disabled: Boolean(disabledReason), title: disabledReason }),
        button("Refresh", "refresh"),
        "</div>",
        renderGenerationBanner(state2, disabledReason),
        renderToast(status),
        "</div>"
      ].filter(Boolean).join(""),
      true
    ),
    renderSettingsSection(
      "injection",
      "Context Injection",
      state2.settings.promptInjectionEnabled ? tokenMeta : "off",
      [
        '<div class="sotl-fields">',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionEnabled" ' + (state2.settings.promptInjectionEnabled ? "checked" : "") + "> Inject compact continuity into roleplay prompts</label>",
        '<label class="sotl-label">Injection mode',
        `<select class="sotl-select" data-sotl-field="promptInjectionMode">`,
        `  <option value="latest_plus_history"${state2.settings.promptInjectionMode !== "latest_brief" ? " selected" : ""}>Latest tracker + recent summaries</option>`,
        `  <option value="latest_brief"${state2.settings.promptInjectionMode === "latest_brief" ? " selected" : ""}>Latest tracker only</option>`,
        "</select>",
        "</label>",
        '<div class="sotl-mini-grid">',
        '<label class="sotl-label">Token budget',
        `<select class="sotl-select" data-sotl-field="promptInjectionTokenBudget">${renderInjectionBudgetOptions(state2)}</select>`,
        "</label>",
        '<label class="sotl-label">Tracker context depth',
        `<select class="sotl-select" data-sotl-field="promptInjectionTrackerLimit">${renderInjectionLimitOptions(state2)}</select>`,
        "</label>",
        "</div>",
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionIncludeAppearance" ' + (state2.settings.promptInjectionIncludeAppearance !== false ? "checked" : "") + "> Include character appearance anchors</label>",
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionIncludeRules" ' + (state2.settings.promptInjectionIncludeRules !== false ? "checked" : "") + "> Include continuity rules and warnings</label>",
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionIncludeNextTurn" ' + (state2.settings.promptInjectionIncludeNextTurn !== false ? "checked" : "") + "> Include next-turn guidance</label>",
        '<p class="sotl-note">Best setup: latest detailed tracker plus a few compact summaries. This controls live RP context only; it does not delete stored tracker snapshots.</p>',
        renderInjectionReport(state2),
        "</div>"
      ].join(""),
      Boolean(state2.settings.promptInjectionEnabled)
    ),
    renderSettingsSection(
      "hud-display",
      "HUD & Display",
      `${state2.settings.hudDefaultView} HUD`,
      [
        '<div class="sotl-fields">',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatHudLauncher" ' + (state2.settings.showChatHudLauncher ? "checked" : "") + "> Show paw HUD launcher</label>",
        '<label class="sotl-label">HUD default view',
        `<select class="sotl-select" data-sotl-field="hudDefaultView">`,
        `  <option value="compact"${state2.settings.hudDefaultView === "compact" ? " selected" : ""}>Compact summary</option>`,
        `  <option value="full"${state2.settings.hudDefaultView === "full" ? " selected" : ""}>Full tracker</option>`,
        `</select>`,
        "</label>",
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="renderInMessages" ' + (state2.settings.renderInMessages ? "checked" : "") + "> Attach tracker cards to messages</label>",
        '<label class="sotl-label">New tracker card position',
        `<select class="sotl-select" data-sotl-field="messageCardPlacement">${renderPlacementOptions(state2)}</select>`,
        "</label>",
        state2.settings.renderInMessages ? '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="messageButtons" ' + (state2.settings.showMessageButtons ? "checked" : "") + "> Show message-card action buttons</label>" : "",
        '<p class="sotl-note">Message-card placement applies when trackers are created or regenerated.</p>',
        "</div>"
      ].join("")
    ),
    renderSettingsSection(
      "templates-rendering",
      "Templates & Rendering",
      effectiveTemplateMode(state2).replace("_", " "),
      [
        '<div class="sotl-fields">',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="useSafeRenderer" ' + (state2.settings.useSafeRenderer ? "checked" : "") + "> Force safe generic renderer for custom presets</label>",
        '<label class="sotl-label">Custom template mode',
        `<select class="sotl-select" data-sotl-field="customTemplateMode" ${state2.settings.useSafeRenderer ? "disabled" : ""}>`,
        `  <option value="trusted_layout"${effectiveTemplateMode(state2) === "trusted_layout" ? " selected" : ""}>Trusted layout (preserve custom HTML/CSS)</option>`,
        `  <option value="strict_sanitized"${effectiveTemplateMode(state2) === "strict_sanitized" ? " selected" : ""}>Strict sanitized</option>`,
        `  <option value="safe_generic"${effectiveTemplateMode(state2) === "safe_generic" ? " selected" : ""}>Safe generic renderer only</option>`,
        "</select>",
        "</label>",
        '<p class="sotl-note">Trusted layout keeps your custom styling but still removes executable hazards like scripts, event handlers, and javascript URLs.</p>',
        "</div>"
      ].join("")
    ),
    renderSettingsSection(
      "storage-cleanup",
      "Storage & Cleanup",
      `${state2.settings.trackerHistoryLimit === 0 ? "unlimited" : `last ${state2.settings.trackerHistoryLimit}`} full trackers`,
      [
        '<div class="sotl-fields">',
        '<label class="sotl-label">Full tracker retention',
        `<select class="sotl-select" data-sotl-field="trackerHistoryLimit">${renderHistoryLimitOptions(state2)}</select>`,
        "</label>",
        '<p class="sotl-note">Controls how many complete tracker snapshots are stored and viewable per chat. This is separate from live prompt context.</p>',
        '<label class="sotl-label">Tracker generation history',
        `<select class="sotl-select" data-sotl-field="trackerGenerationHistoryLimit">${renderGenerationHistoryLimitOptions(state2)}</select>`,
        "</label>",
        '<p class="sotl-note">Controls what the sidecar tracker generator sees: the latest previous tracker as full JSON plus older compact summaries. This does not delete stored trackers.</p>',
        '<div class="sotl-actions">',
        button("Reset Loom Storage", "reset-storage", { title: "Resets Loom Keeper settings, presets, and trackers for this user." }),
        "</div>",
        "</div>"
      ].join("")
    ),
    renderSettingsSection(
      "advanced-diagnostics",
      "Advanced & Diagnostics",
      "power-user controls",
      [
        '<div class="sotl-fields">',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="stripBlocks" ' + (state2.settings.stripTrackerBlocksFromMessages ? "checked" : "") + "> Strip passive tracker blocks when allowed</label>",
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="floating" ' + (state2.settings.showFloatingButton ? "checked" : "") + "> Legacy desktop floating button</label>",
        '<label class="sotl-label">Legacy density setting',
        `<select class="sotl-select" data-sotl-field="cardDensity">${renderCardDensityOptions(state2)}</select>`,
        "</label>",
        '<p class="sotl-note">Density is stored for compatibility; current cards use each preset renderer density.</p>',
        state2.diagnostics.storageWarning ? `<p class="sotl-note sotl-warning">${escapeHtml2(state2.diagnostics.storageWarning)}</p>` : "",
        state2.diagnostics.renderLimitation ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.renderLimitation)}</p>` : "",
        state2.diagnostics.lastError ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.lastError)}</p>` : "",
        state2.diagnostics.lastGenerationError ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.lastGenerationError)}</p>` : "",
        status.lastRenderStatus ? `<p class="sotl-note">${escapeHtml2(status.lastRenderStatus)}</p>` : "",
        state2.diagnostics.lastRenderStatus ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.lastRenderStatus)}</p>` : "",
        renderSettingsSection("pipeline-report", "Tracker Pipeline Report", state2.diagnostics.pipelineReport ? "available" : "empty", renderPipelineReport(state2)),
        renderSettingsSection("swipe-report", "Swipe Tracker Report", state2.diagnostics.swipeReport ? `${state2.diagnostics.swipeReport.storedSwipeTrackerCount} stored` : "empty", renderSwipeReport(state2)),
        renderSettingsSection("injection-report", "Context Injection Report", report ? tokenMeta : "empty", renderInjectionReport(state2)),
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
            '<div class="sotl-diagnostic-grid">',
            `  <div><strong>HUD Launcher:</strong> ${state2.settings.showChatHudLauncher ? "Enabled" : "Disabled"}</div>`,
            `  <div><strong>HUD DOM Status:</strong> ${isMounted ? "Mounted" : "Not mounted"}</div>`,
            `  <div><strong>HUD Placement State:</strong> ${escapeHtml2(reason)}</div>`,
            `  <div><strong>Message Cards:</strong> ${state2.settings.renderInMessages ? "Enabled" : "Disabled"}</div>`,
            "</div>"
          ].join("");
        })(),
        "</div>"
      ].filter(Boolean).join("")
    ),
    "</section>"
  ].join("");
}
function renderDrawer(state2, status = {}) {
  if (!state2) {
    const offlineText = status.backendTimedOut ? "Backend is not responding. Try Reset Loom Storage, then Refresh after the extension reloads." : "Frontend loaded. Waiting for backend state...";
    return [
      '<div class="sotl-root">',
      '<section class="sotl-panel">',
      "<h2>Loom Keeper</h2>",
      `<p class="sotl-note">${escapeHtml2(offlineText)}</p>`,
      status.lastFrontendError ? `<p class="sotl-note sotl-warning">${escapeHtml2(status.lastFrontendError)}</p>` : "",
      '<div class="sotl-actions">',
      button("Refresh", "refresh"),
      button("Reset Loom Storage", "reset-storage", { title: "Resets Loom Keeper settings, presets, and trackers for this user." }),
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
    renderControlsPanel(state2, status, selectedConnection, disabledReason),
    renderFocusedTracker(state2),
    '<section class="sotl-panel">',
    "<h3>Current Loom" + (state2.diagnostics.lastRenderStatus?.includes("Stale") ? ' <span class="sotl-inline-warning">Stale: New messages sent</span>' : "") + "</h3>",
    renderLatestTracker(state2),
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Message Tracker List</h3>",
    renderMessageList(state2),
    "</section>",
    renderFeatureBreakdown(true),
    '<section class="sotl-panel">',
    `<details class="sotl-details sotl-settings-section" data-sotl-section="template-editor"${detailOpenAttr("template-editor")}>`,
    '<summary><span class="sotl-summary-title">Custom Template Editor</span><span class="sotl-summary-meta">import, edit, preview</span></summary>',
    '<div class="sotl-section-pad">',
    renderPresetEditor(state2),
    "</div>",
    "</details>",
    "</section>",
    "</div>"
  ].join("");
}

// src/frontend/icons.ts
function loomNeedleSvg(className = "sotl-paw-svg") {
  return [
    `<svg class="${className}" viewBox="0 0 512 512" width="26" height="26" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="overflow: visible; display: inline-block; vertical-align: middle;">`,
    // Woven continuity thread loops (waving accents looping through the eye)
    '  <path d="M 366 146 C 440 70, 460 170, 330 190" stroke="var(--lv-accent, #3864d9)" stroke-width="14" fill="none" opacity="0.5" class="sotl-bear-claw sotl-bear-claw--1"/>',
    '  <path d="M 366 146 C 280 90, 240 210, 300 240" stroke="var(--lv-accent, #3864d9)" stroke-width="14" fill="none" opacity="0.7" class="sotl-bear-claw sotl-bear-claw--2"/>',
    '  <path d="M 280 210 C 200 160, 160 270, 220 290" stroke="var(--lv-accent, #3864d9)" stroke-width="14" fill="none" opacity="0.8" class="sotl-bear-claw sotl-bear-claw--3"/>',
    '  <path d="M 200 280 C 130 230, 110 330, 160 350" stroke="var(--lv-accent, #3864d9)" stroke-width="14" fill="none" opacity="0.6" class="sotl-bear-claw sotl-bear-claw--4"/>',
    // Group of needle elements (shaft + eye) that stitches as a single rigid body
    '  <g class="sotl-paw-main sotl-bear-main">',
    "    <!-- Needle Eye Loop -->",
    '    <ellipse cx="366" cy="146" rx="12" ry="28" transform="rotate(45 366 146)" stroke="currentColor" stroke-width="20" fill="none" class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--3"/>',
    "    <!-- Sleek needle shaft (Solid line pointing down-left) -->",
    '    <path d="M 90 422 L 350 162" stroke="currentColor" stroke-width="20" stroke-linecap="round"/>',
    "  </g>",
    "</svg>"
  ].join("");
}
function bearPawSvg(className = "sotl-paw-svg") {
  return loomNeedleSvg(className);
}

// src/frontend/messageCards.ts
var injectedWrappers = /* @__PURE__ */ new Map();
var injectedMessagePaws = /* @__PURE__ */ new Map();
var injectedHistoryBadges = /* @__PURE__ */ new Map();
var injectedContextMenuItems = /* @__PURE__ */ new Set();
var lastSelectedMessageTarget = null;
var lastHostsFound = 0;
var lastAssistantHostsFound = 0;
var lastBadgesMounted = 0;
var lastNativeToolbarButtonsMounted = 0;
var lastPortalToolbarsFound = 0;
var lastContextMenuItemsMounted = 0;
var lastInHostToolbarsFound = 0;
var lastMountReasonStr = "not-yet-run";
var isChatLoomPanelExpanded = false;
var isDrawerOpen = false;
var isSettingsOpen = false;
var rerenderCallback = null;
var openDrawerCallback = null;
var chatPanelContainer = null;
function registerOpenDrawerCallback(cb) {
  openDrawerCallback = cb;
}
function documentRef2() {
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
function findMessageHostById(doc, messageId) {
  const id = escapeSelector(messageId);
  const direct = doc.querySelector(`[data-message-id="${id}"]`) ?? doc.querySelector(`[data-lumiverse-message-id="${id}"]`) ?? doc.querySelector(`[data-lv-message-id="${id}"]`) ?? doc.querySelector(`[data-chat-message-id="${id}"]`) ?? doc.querySelector(`[data-message_id="${id}"]`) ?? doc.querySelector(`[data-messageid="${id}"]`) ?? doc.getElementById(`message-${messageId}`);
  if (direct) return direct;
  if (/^\d+$/.test(messageId)) {
    const idx = parseInt(messageId, 10);
    const hosts = doc.querySelectorAll('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]');
    if (hosts[idx]) return hosts[idx];
  }
  return null;
}
function messageIdFromElement(element) {
  if (!element) return void 0;
  const host = element.closest?.("[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid]");
  if (host instanceof HTMLElement) {
    const id = host.dataset.messageId ?? host.dataset.lumiverseMessageId ?? host.dataset.lvMessageId ?? host.dataset.chatMessageId ?? host.dataset.message_id ?? host.dataset.messageid;
    if (id) return id;
  }
  const idHost = element.closest?.('[id^="message-"]');
  if (idHost instanceof HTMLElement) {
    const match2 = idHost.id.match(/^message-(.+)$/);
    if (match2?.[1]) return match2[1];
  }
  const match = element.id.match(/^message-(.+)$/);
  return match?.[1];
}
function findNearestTrackedMessageIdForElement(element, state2) {
  const doc = element.ownerDocument || documentRef2();
  if (!doc) return void 0;
  const rect = element.getBoundingClientRect();
  const ids = /* @__PURE__ */ new Set();
  for (const tracker of state2.messageTrackers) {
    if (tracker.messageId) ids.add(tracker.messageId);
  }
  if (state2.latestTracker?.messageId) ids.add(state2.latestTracker.messageId);
  let best;
  for (const id of ids) {
    const host = findMessageHostById(doc, id);
    if (!(host instanceof HTMLElement) || !isVisibleElement(host)) continue;
    const hostRect = host.getBoundingClientRect();
    const verticalGap = rect.top > hostRect.bottom ? rect.top - hostRect.bottom : hostRect.top > rect.bottom ? hostRect.top - rect.bottom : 0;
    const horizontalGap = rect.left > hostRect.right ? rect.left - hostRect.right : hostRect.left > rect.right ? hostRect.left - rect.right : 0;
    const score = verticalGap + horizontalGap;
    if (score <= 96 && (!best || score < best.score)) {
      best = { id, score };
    }
  }
  return best?.id;
}
function rememberMessageActionTarget(target, state2) {
  if (!target || !state2) return;
  const directId = messageIdFromElement(target);
  if (directId) {
    lastSelectedMessageTarget = {
      chatId: state2.activeChat.id,
      messageId: directId,
      swipeId: state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[directId] : void 0,
      source: "dom-attribute",
      confidence: "high",
      seenAt: Date.now()
    };
    return;
  }
  const ancestor = target.closest?.("[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid]");
  if (ancestor instanceof HTMLElement) {
    const ancestorId = messageIdFromElement(ancestor);
    if (ancestorId) {
      lastSelectedMessageTarget = {
        chatId: state2.activeChat.id,
        messageId: ancestorId,
        swipeId: state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[ancestorId] : void 0,
        source: "closest-ancestor",
        confidence: "high",
        seenAt: Date.now()
      };
      return;
    }
  }
  const nearestId = findNearestTrackedMessageIdForElement(target, state2);
  if (nearestId) {
    lastSelectedMessageTarget = {
      chatId: state2.activeChat.id,
      messageId: nearestId,
      swipeId: state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[nearestId] : void 0,
      source: "toolbar-geometric",
      confidence: "medium",
      seenAt: Date.now()
    };
    return;
  }
  const nearestChatMsgId = findNearestChatMessageIdForElement(target, state2);
  if (nearestChatMsgId) {
    lastSelectedMessageTarget = {
      chatId: state2.activeChat.id,
      messageId: nearestChatMsgId,
      swipeId: state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[nearestChatMsgId] : void 0,
      source: "chat-message-list",
      confidence: "medium",
      seenAt: Date.now()
    };
    return;
  }
}
function findNearestChatMessageIdForElement(element, state2) {
  const doc = element.ownerDocument || documentRef2();
  if (!doc || !state2.chatAssistantMessages?.length) return void 0;
  const rect = element.getBoundingClientRect();
  let best;
  for (const msg of state2.chatAssistantMessages) {
    const host = findMessageHostById(doc, msg.id);
    if (!(host instanceof HTMLElement) || !isVisibleElement(host)) continue;
    const hostRect = host.getBoundingClientRect();
    const verticalGap = rect.top > hostRect.bottom ? rect.top - hostRect.bottom : hostRect.top > rect.bottom ? hostRect.top - rect.bottom : 0;
    const horizontalGap = rect.left > hostRect.right ? rect.left - hostRect.right : hostRect.left > rect.right ? hostRect.left - rect.right : 0;
    const score = verticalGap + horizontalGap;
    if (score <= 200 && (!best || score < best.score)) {
      best = { id: msg.id, score };
    }
  }
  return best?.id;
}
function getMessageActionDiagnostics() {
  const doc = documentRef2();
  return {
    globalLauncherMounted: doc ? Boolean(doc.querySelector(".sotl-chat-pill")) : false,
    messageHostsFound: lastHostsFound,
    assistantMessageHostsFound: lastAssistantHostsFound,
    messageHistoryBadgesMounted: lastBadgesMounted,
    nativeToolbarButtonsMounted: lastNativeToolbarButtonsMounted,
    portalToolbarsFound: lastPortalToolbarsFound,
    contextMenuItemsMounted: lastContextMenuItemsMounted,
    lastSelectedMessageTarget,
    lastMessageActionMountReason: lastMountReasonStr,
    // Backwards compatibility fields
    inHostToolbarsFound: lastInHostToolbarsFound,
    globalPortalToolbarsFound: lastPortalToolbarsFound,
    buttonsInjected: lastNativeToolbarButtonsMounted,
    contextMenuItemsInjected: lastContextMenuItemsMounted,
    lastMountReason: lastMountReasonStr
  };
}
function isToolbarLikeCluster(candidate) {
  if (!isVisibleElement(candidate)) return false;
  const rect = candidate.getBoundingClientRect();
  if (rect.height > 72 || rect.width > 420) return false;
  const buttons = Array.from(candidate.querySelectorAll('button, [role="button"], a, [data-action], [data-lv-action], svg'));
  if (buttons.length < 2) return false;
  return buttons.some((btn) => {
    const text = (btn.textContent || btn.getAttribute("aria-label") || btn.getAttribute("title") || btn.className || "").trim();
    return /\b(Copy|Edit|Delete|Hide|Fork|Breakdown|trash|pencil|clone)\b/i.test(text);
  });
}
function isInsideMessageHost(el) {
  return Boolean(el.closest('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]'));
}
function isAssistantMessageHost(_host, _messageId, _state) {
  return true;
}
function findVisibleGlobalToolbars(doc, state2) {
  const results = [];
  const toolbarSelectors = [
    "[data-message-actions]",
    "[data-lv-message-actions]",
    "[data-message-action-bar]",
    "[data-lumiverse-message-actions]",
    '[role="toolbar"]',
    ".message-actions",
    ".message-action-buttons",
    ".chat-message-actions",
    ".lv-message-actions",
    ".lv-message-action-bar",
    ".message-controls"
  ].join(",");
  const selectorMatches = Array.from(doc.querySelectorAll(toolbarSelectors)).filter(
    (el) => isVisibleElement(el) && !isInsideMessageHost(el) && !el.closest(".sotl-chat-panel-container, .sotl-root, [data-sotl-tracker-preview]")
  );
  const heuristicCandidates = Array.from(doc.querySelectorAll("div, nav, section, menu, span")).filter(
    (el) => !isInsideMessageHost(el) && !el.closest(".sotl-chat-panel-container, .sotl-root, [data-sotl-tracker-preview]") && isToolbarLikeCluster(el)
  );
  const seen = /* @__PURE__ */ new Set();
  const allToolbars = [];
  for (const t of [...selectorMatches, ...heuristicCandidates]) {
    if (seen.has(t)) continue;
    if ([...seen].some((s) => s.contains(t) || t.contains(s))) continue;
    seen.add(t);
    allToolbars.push(t);
  }
  for (const toolbar of allToolbars) {
    if (toolbar.querySelector(".sotl-message-paw-btn")) continue;
    const messageId = resolveMessageIdForToolbar(toolbar, doc, state2);
    if (!messageId) continue;
    const isAssistant = isAssistantMessageHost(toolbar, messageId, state2);
    if (!isAssistant) continue;
    const swipeId = state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[messageId] : void 0;
    results.push({ toolbar, messageId, swipeId, source: "global-toolbar" });
  }
  return results;
}
function resolveMessageIdForToolbar(toolbar, doc, state2) {
  const directAttr = toolbar.getAttribute("data-message-id") || toolbar.getAttribute("data-for-message") || toolbar.getAttribute("data-target-message") || toolbar.getAttribute("data-lv-message-id") || toolbar.closest("[data-message-id]")?.getAttribute("data-message-id") || toolbar.closest("[data-for-message-id]")?.getAttribute("data-for-message-id");
  if (directAttr) return directAttr;
  if (lastSelectedMessageTarget && Date.now() - lastSelectedMessageTarget.seenAt < 1e4 && lastSelectedMessageTarget.confidence !== "low") {
    return lastSelectedMessageTarget.messageId;
  }
  const toolbarRect = toolbar.getBoundingClientRect();
  const hosts = doc.querySelectorAll('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]');
  let bestId;
  let bestScore = Infinity;
  hosts.forEach((host) => {
    if (!(host instanceof HTMLElement) || !isVisibleElement(host)) return;
    const id = messageIdFromElement(host);
    if (!id) return;
    const hostRect = host.getBoundingClientRect();
    const vGap = toolbarRect.top > hostRect.bottom ? toolbarRect.top - hostRect.bottom : hostRect.top > toolbarRect.bottom ? hostRect.top - toolbarRect.bottom : 0;
    const hGap = toolbarRect.left > hostRect.right ? toolbarRect.left - hostRect.right : hostRect.left > toolbarRect.right ? hostRect.left - toolbarRect.right : 0;
    const score = vGap + hGap;
    if (score < bestScore) {
      bestScore = score;
      bestId = id;
    }
  });
  if (bestId && bestScore <= 200) return bestId;
  if (state2.chatAssistantMessages?.length) {
    let chatBestId;
    let chatBestScore = Infinity;
    for (const msg of state2.chatAssistantMessages) {
      const host = findMessageHostById(doc, msg.id);
      if (!(host instanceof HTMLElement) || !isVisibleElement(host)) continue;
      const hostRect = host.getBoundingClientRect();
      const vGap = toolbarRect.top > hostRect.bottom ? toolbarRect.top - hostRect.bottom : hostRect.top > toolbarRect.bottom ? hostRect.top - toolbarRect.bottom : 0;
      const hGap = toolbarRect.left > hostRect.right ? toolbarRect.left - hostRect.right : hostRect.left > toolbarRect.right ? hostRect.left - toolbarRect.right : 0;
      const score = vGap + hGap;
      if (score < chatBestScore) {
        chatBestScore = score;
        chatBestId = msg.id;
      }
    }
    if (chatBestId && chatBestScore <= 200) return chatBestId;
  }
  if (!lastSelectedMessageTarget || Date.now() - lastSelectedMessageTarget.seenAt > 15e3) {
    const assistants = state2.chatAssistantMessages;
    if (assistants?.length) return assistants[assistants.length - 1].id;
  }
  return void 0;
}
function findMessageHost(doc, tracker) {
  if (!tracker.messageId) return null;
  return findMessageHostById(doc, tracker.messageId);
}
function isVisibleElement(element) {
  if (!(element instanceof HTMLElement)) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const style = typeof getComputedStyle === "function" ? getComputedStyle(element) : null;
  return style?.display !== "none" && style?.visibility !== "hidden" && style?.opacity !== "0";
}
function isLargeBlockingSurface(element) {
  if (!isVisibleElement(element)) return false;
  const rect = element.getBoundingClientRect();
  const ariaModal = element.getAttribute("aria-modal") === "true";
  const role = element.getAttribute("role");
  if (ariaModal || role === "dialog" || role === "menu") return true;
  return rect.width >= 160 && rect.height >= 140;
}
function findFirstVisibleBlockingSurface(doc) {
  const selectors = [
    ".lumiverse-drawer",
    ".drawer",
    "[data-drawer]",
    "#drawer",
    ".sotl-drawer",
    ".lumiverse-settings",
    ".settings-modal",
    "[data-settings]",
    "#settings",
    ".sotl-settings",
    '[role="dialog"]',
    '[aria-modal="true"]',
    ".modal",
    ".popover",
    '[role="menu"]',
    "[data-context-menu]",
    "[data-lv-context-menu]",
    ".context-menu",
    ".lv-context-menu",
    '[data-sotl-tracker-preview="true"]',
    '[data-route*="branch" i]',
    '[data-screen*="branch" i]',
    '[data-route*="settings" i]',
    '[data-screen*="settings" i]'
  ].join(",");
  const candidates = Array.from(doc.querySelectorAll(selectors));
  for (const candidate of candidates) {
    if (candidate.closest(".sotl-chat-panel-container")) continue;
    if (isLargeBlockingSurface(candidate)) return candidate;
  }
  return null;
}
function isInExtensionOrMenu(element) {
  return Boolean(element.closest('.sotl-root, .sotl-chat-panel-container, [data-sotl-drawer-fallback], [data-sotl-tracker-preview], [role="dialog"], [role="menu"], .popover, .context-menu, .drawer, .lumiverse-drawer, .settings-modal'));
}
function hasVisibleComposer(doc) {
  const selectors = [
    "[data-chat-input]",
    "[data-input-bar]",
    "[data-composer]",
    ".chat-input",
    ".composer",
    ".input-bar",
    'textarea[placeholder*="message" i]',
    'input[placeholder*="message" i]',
    '[contenteditable="true"]'
  ].join(",");
  const viewportHeight = doc.defaultView?.innerHeight ?? 0;
  return Array.from(doc.querySelectorAll(selectors)).some((candidate) => {
    if (!isVisibleElement(candidate) || isInExtensionOrMenu(candidate)) return false;
    const rect = candidate.getBoundingClientRect();
    return rect.width >= 120 && rect.bottom >= viewportHeight * 0.55;
  });
}
function hasVisibleChatContent(doc) {
  const selectors = [
    "[data-message-id]",
    "[data-lumiverse-message-id]",
    "[data-lv-message-id]",
    "[data-chat-message-id]",
    "[data-message_id]",
    "[data-messageid]",
    '[class*="message" i]',
    '[class*="chat" i]'
  ].join(",");
  return Array.from(doc.querySelectorAll(selectors)).some((candidate) => {
    if (!isVisibleElement(candidate) || isInExtensionOrMenu(candidate)) return false;
    const rect = candidate.getBoundingClientRect();
    return rect.width >= 160 && rect.height >= 40;
  });
}
var lastGlobalPawHideReason = "";
function shouldShowGlobalPaw(doc, state2) {
  if (!state2) {
    lastGlobalPawHideReason = "state-unavailable";
    return false;
  }
  if (!state2.settings.showChatHudLauncher) {
    lastGlobalPawHideReason = "disabled-in-settings";
    return false;
  }
  if (isDrawerOpen || isSettingsOpen) {
    lastGlobalPawHideReason = "drawer-or-settings-open";
    return false;
  }
  if (isChatLoomPanelExpanded) {
    lastGlobalPawHideReason = "";
    return true;
  }
  const blockingEl = findFirstVisibleBlockingSurface(doc);
  if (blockingEl) {
    lastGlobalPawHideReason = `blocking-surface-active:${blockingEl.className || blockingEl.tagName}`;
    return false;
  }
  if (!hasVisibleComposer(doc)) {
    lastGlobalPawHideReason = "no-visible-composer";
    return false;
  }
  if (!hasVisibleChatContent(doc) && !state2.activeChat.id) {
    lastGlobalPawHideReason = "no-chat-content";
    return false;
  }
  lastGlobalPawHideReason = "";
  return true;
}
function cleanupDisconnectedMessagePaws() {
  for (const [key, button2] of injectedMessagePaws.entries()) {
    if (!button2.isConnected) injectedMessagePaws.delete(key);
  }
}
function cleanupMessageTrackerActions() {
  const doc = documentRef2();
  doc?.querySelectorAll('[data-sotl-message-paw="true"], [data-sotl-message-history-badge="true"], [data-sotl-context-menu-item="true"]').forEach((node) => {
    try {
      node.remove();
    } catch {
    }
  });
  for (const button2 of injectedMessagePaws.values()) {
    try {
      button2.remove();
    } catch {
    }
  }
  injectedMessagePaws.clear();
  for (const badge2 of injectedHistoryBadges.values()) {
    try {
      badge2.remove();
    } catch {
    }
  }
  injectedHistoryBadges.clear();
  for (const item of injectedContextMenuItems) {
    try {
      item.remove();
    } catch {
    }
  }
  injectedContextMenuItems.clear();
}
function syncNativeLikeButtonVariables(target, reference) {
  try {
    const rect = reference.getBoundingClientRect();
    const style = getComputedStyle(reference);
    if (rect.width > 0) {
      target.style.setProperty("--sotl-native-size", `${Math.round(Math.max(rect.width, rect.height))}px`);
      target.style.setProperty("--sotl-native-width", `${Math.round(rect.width)}px`);
    }
    if (rect.height > 0) target.style.setProperty("--sotl-native-height", `${Math.round(rect.height)}px`);
    target.style.setProperty("--sotl-native-radius", style.borderRadius);
    target.style.setProperty("--sotl-native-bg", style.background || style.backgroundColor);
    target.style.setProperty("--sotl-native-color", style.color);
    target.style.setProperty("--sotl-native-border", style.border);
    target.style.setProperty("--sotl-native-shadow", style.boxShadow);
    target.style.setProperty("--sotl-native-opacity", style.opacity);
    target.style.setProperty("--sotl-native-backdrop", style.backdropFilter && style.backdropFilter !== "none" ? style.backdropFilter : "blur(12px)");
    target.style.setProperty("--sotl-native-padding", style.padding);
    const inner = reference.querySelector('svg, img, [class*="icon" i], [data-icon]');
    const innerRect = inner?.getBoundingClientRect();
    if (innerRect && innerRect.width > 0 && innerRect.height > 0) {
      const glyphSize = Math.round(Math.max(innerRect.width, innerRect.height) * 1.12);
      target.style.setProperty("--sotl-native-glyph-size", `${glyphSize}px`);
    }
  } catch {
  }
}
function mountLauncherInNativeRail(doc, container) {
  void doc;
  void container;
  return false;
}
function isStockSideIconCandidate(doc, candidate) {
  if (!isVisibleElement(candidate) || candidate.closest(".sotl-chat-panel-container")) return false;
  const rect = candidate.getBoundingClientRect();
  const viewportWidth = doc.defaultView?.innerWidth ?? 0;
  return rect.width >= 24 && rect.width <= 72 && rect.height >= 24 && rect.height <= 72 && rect.right >= viewportWidth - 112 && rect.top >= 56 && rect.bottom <= (doc.defaultView?.innerHeight ?? 1e3) - 72;
}
function findStockSideIcon(doc) {
  const textMatches = [
    '[aria-label*="spark" i]',
    '[title*="spark" i]',
    '[aria-label*="star" i]',
    '[title*="star" i]',
    '[aria-label*="magic" i]',
    '[title*="magic" i]',
    '[data-action*="spark" i]',
    '[data-lv-action*="spark" i]',
    '[data-testid*="spark" i]',
    '[class*="spark" i]'
  ];
  for (const selector of textMatches) {
    const found = Array.from(doc.querySelectorAll(selector)).find((candidate) => candidate.dataset.sotlChatPanel !== "true" && isStockSideIconCandidate(doc, candidate));
    if (found) return found;
  }
  const candidates = Array.from(doc.querySelectorAll('button, [role="button"], a, [tabindex]')).filter((candidate) => {
    return isStockSideIconCandidate(doc, candidate) && Boolean(candidate.querySelector("svg"));
  }).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return candidates[0] ?? null;
}
function syncFixedLauncherToStockIcon(doc, container) {
  const reference = findStockSideIcon(doc);
  const pill = container.querySelector(".sotl-chat-pill");
  if (!pill) return;
  if (reference) {
    syncNativeLikeButtonVariables(pill, reference);
    const rect = reference.getBoundingClientRect();
    const gap = Math.max(6, Math.min(10, rect.height * 0.22));
    const nextLeft = Math.round(rect.left);
    const nextTop = Math.round(rect.bottom + gap);
    const nextWidth = Math.round(rect.width);
    const curLeft = parseInt(container.style.left || "0", 10);
    const curTop = parseInt(container.style.top || "0", 10);
    const curWidth = parseInt(container.style.width || "0", 10);
    if (Math.abs(nextLeft - curLeft) > 1 || Math.abs(nextTop - curTop) > 1 || Math.abs(nextWidth - curWidth) > 1 || container.style.position !== "fixed") {
      container.style.position = "fixed";
      container.style.left = `${nextLeft}px`;
      container.style.right = "auto";
      container.style.top = `${nextTop}px`;
      container.style.width = `${nextWidth}px`;
    }
  } else {
    container.style.position = "fixed";
    container.style.right = "12px";
    container.style.left = "auto";
    container.style.top = "180px";
    container.style.bottom = "auto";
    container.style.width = "36px";
    container.style.height = "36px";
    container.style.zIndex = "10002";
    pill.style.width = "100%";
    pill.style.height = "100%";
  }
}
function visibleContextMenuCandidate(element) {
  if (!isVisibleElement(element)) return false;
  const text = element.textContent || "";
  return /\b(Copy|Edit|Delete|Hide from AI context|Fork chat here|Prompt Breakdown)\b/i.test(text);
}
function mountContextMenuTrackerAction(doc, state2) {
  void state2;
  const target = lastSelectedMessageTarget;
  doc.querySelectorAll('[data-sotl-context-menu-item="true"]').forEach((item) => {
    if (!target || Date.now() - target.seenAt > 3e4 || item.dataset.sotlMessageId !== target.messageId) {
      item.remove();
      injectedContextMenuItems.delete(item);
    }
  });
  if (!target || Date.now() - target.seenAt > 3e4) return 0;
  let menus = Array.from(doc.querySelectorAll('[role="menu"], [role="listbox"], [role="dialog"], [class*="dropdown" i], [class*="menu" i], [class*="popup" i], .context-menu, .lv-context-menu, .menu, .popover, .dropdown')).filter(visibleContextMenuCandidate);
  menus = menus.filter((menu) => {
    return !menus.some((other) => other !== menu && menu.contains(other));
  });
  let mounted = 0;
  for (const menu of menus) {
    if (menu.querySelector('[data-sotl-context-menu-item="true"]')) continue;
    const candidates = Array.from(menu.querySelectorAll('button, [role="menuitem"], [role="button"], [data-menu-item], li, div, span, a'));
    const reference = candidates.find((candidate) => isVisibleElement(candidate) && /\b(Copy|Edit|Hide from AI context|Fork chat here|Prompt Breakdown)\b/i.test(candidate.textContent || ""));
    const item = doc.createElement(reference?.tagName.toLowerCase() === "button" ? "button" : "div");
    if (item instanceof HTMLButtonElement) item.type = "button";
    item.className = "sotl-context-menu-item " + (reference?.className || "");
    item.dataset.sotlContextMenuItem = "true";
    item.dataset.sotlAction = "message-paw";
    item.dataset.sotlMessagePaw = "true";
    item.dataset.sotlMessageId = target.messageId;
    if (typeof target.swipeId === "number") item.dataset.sotlSwipeId = String(target.swipeId);
    item.setAttribute("role", reference?.getAttribute("role") || "menuitem");
    item.setAttribute("tabindex", "0");
    item.innerHTML = `<span class="sotl-context-menu-item__icon">${bearPawSvg("sotl-message-paw-svg")}</span><span>Tracker History</span>`;
    if (reference) syncNativeLikeButtonVariables(item, reference);
    const promptBreakdownItem = candidates.find((candidate) => isVisibleElement(candidate) && /Prompt Breakdown/i.test(candidate.textContent || ""));
    const deleteItem = candidates.find((candidate) => isVisibleElement(candidate) && /Delete/i.test(candidate.textContent || ""));
    if (promptBreakdownItem) {
      promptBreakdownItem.insertAdjacentElement("afterend", item);
    } else if (deleteItem) {
      deleteItem.insertAdjacentElement("beforebegin", item);
    } else {
      menu.insertBefore(item, menu.firstChild);
    }
    injectedContextMenuItems.add(item);
    mounted += 1;
  }
  return mounted;
}
function renderTrackerHtmlCard(tracker, state2) {
  const id = tracker.messageId || "";
  const meta = { swipeId: tracker.swipeId };
  const controls = state2.settings.showMessageButtons ? `<div class="sotl-message-controls">${iconButton("Regenerate", "card-regenerate", id, meta)}${iconButton("Edit", "card-edit", id, meta)}${iconButton("Hide", "card-hide", id, meta)}${iconButton("Delete", "card-delete", id, meta)}</div>` : "";
  return controls + renderTrackerForState(tracker, state2).html;
}
function isActiveSwipeTracker(tracker, state2) {
  if (!tracker.messageId) return true;
  const activeSwipe = state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[tracker.messageId] : void 0;
  if (typeof activeSwipe !== "number") return true;
  return tracker.swipeId === activeSwipe;
}
function trackerMountKey(tracker) {
  return `${tracker.messageId || "latest"}::swipe:${typeof tracker.swipeId === "number" ? tracker.swipeId : "main"}`;
}
function selectVisibleMessageTrackers(trackers, state2) {
  const grouped = /* @__PURE__ */ new Map();
  for (const tracker of trackers) {
    const id = tracker.messageId || "latest";
    const list = grouped.get(id) ?? [];
    list.push(tracker);
    grouped.set(id, list);
  }
  const selected = [];
  for (const [id, list] of grouped) {
    const activeSwipe = state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[id] : void 0;
    const active = typeof activeSwipe === "number" ? list.find((tracker) => tracker.swipeId === activeSwipe) : void 0;
    if (typeof activeSwipe === "number" && !active && list.some((tracker) => typeof tracker.swipeId === "number")) {
      continue;
    }
    const newest = list.slice().sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
    const chosen = active ?? newest;
    if (chosen) selected.push(chosen);
  }
  return selected;
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
  const doc = documentRef2();
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
  const trackers = selectVisibleMessageTrackers(
    state2.messageTrackers.length > 0 ? state2.messageTrackers : state2.latestTracker ? [state2.latestTracker] : [],
    state2
  ).filter((tracker) => isActiveSwipeTracker(tracker, state2));
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
          injectedWrappers.set(trackerMountKey(tracker), wrapper);
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
      if (typeof tracker.swipeId === "number") wrapper.dataset.sotlSwipeId = String(tracker.swipeId);
      wrapper.innerHTML = cardHtml;
      if (tracker.placement === "bottom") {
        hostElement.append(wrapper);
      } else {
        hostElement.prepend(wrapper);
      }
      injectedWrappers.set(trackerMountKey(tracker), wrapper);
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
function findMessageToolbar(host) {
  const selector = [
    "[data-message-actions]",
    "[data-lv-message-actions]",
    "[data-message-action-bar]",
    "[data-lumiverse-message-actions]",
    '[role="toolbar"]',
    ".message-actions",
    ".message-action-buttons",
    ".chat-message-actions",
    ".lv-message-actions",
    ".lv-message-action-bar",
    ".message-controls"
  ].join(",");
  const found = host.querySelector(selector);
  if (found && isVisibleElement(found)) return found;
  const candidates = Array.from(host.querySelectorAll("div, nav, section, menu, span"));
  for (const candidate of candidates) {
    if (!isVisibleElement(candidate)) continue;
    const rect = candidate.getBoundingClientRect();
    if (rect.height > 72 || rect.width > 420) continue;
    const buttons = Array.from(candidate.querySelectorAll('button, [role="button"], a, [data-action], [data-lv-action], svg'));
    if (buttons.length < 2) continue;
    const hasCopyOrDelete = buttons.some((btn) => {
      const text = (btn.textContent || btn.getAttribute("aria-label") || btn.getAttribute("title") || btn.className || "").trim();
      return /\b(Copy|Edit|Delete|Hide|Fork|Breakdown|trash|pencil|clone)\b/i.test(text);
    });
    if (hasCopyOrDelete) return candidate;
  }
  return null;
}
function mountMessageHistoryBadges(ctx, state2) {
  void ctx;
  const doc = documentRef2();
  if (!doc) return { status: "Message history badge unavailable: no document." };
  if (!state2) {
    doc.querySelectorAll(".sotl-message-history-badge").forEach((btn) => btn.remove());
    injectedHistoryBadges.clear();
    lastAssistantHostsFound = 0;
    lastBadgesMounted = 0;
    return { status: "Message history badge waiting for state." };
  }
  doc.querySelectorAll(".sotl-message-history-badge").forEach((el) => {
    const toolbar = el.closest('[data-message-actions], [data-lv-message-actions], [data-message-action-bar], [data-lumiverse-message-actions], [role="toolbar"], .message-actions, .message-action-buttons, .chat-message-actions, .lv-message-actions, .lv-message-action-bar, .message-controls');
    if (!toolbar) {
      el.remove();
    }
  });
  const hosts = doc.querySelectorAll('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]');
  let assistantHostsFound = 0;
  let badgesMounted = 0;
  const activeKeys = /* @__PURE__ */ new Set();
  hosts.forEach((host) => {
    try {
      if (!(host instanceof HTMLElement)) return;
      const messageId = messageIdFromElement(host);
      if (!messageId) return;
      const isAssistant = isAssistantMessageHost(host, messageId, state2);
      if (!isAssistant) return;
      assistantHostsFound++;
      const activeSwipe = state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[messageId] : void 0;
      const key = `${messageId}::swipe:${typeof activeSwipe === "number" ? activeSwipe : "main"}`;
      activeKeys.add(key);
      let badge2 = host.querySelector(".sotl-message-history-badge");
      const toolbar = findMessageToolbar(host);
      if (badge2) {
        if (!toolbar || !toolbar.contains(badge2)) {
          badge2.remove();
          badge2 = null;
        } else if (!badge2.isConnected) {
          badge2 = null;
        }
      }
      if (!badge2) {
        if (toolbar) {
          badge2 = doc.createElement("button");
          badge2.type = "button";
          badge2.className = "sotl-message-history-badge";
          badge2.classList.add("sotl-message-history-badge--toolbar");
          const copyBtn = Array.from(toolbar.querySelectorAll('button, [role="button"], a, [data-action], [data-lv-action]')).find((btn) => isVisibleElement(btn) && !btn.classList.contains("sotl-message-history-badge") && !btn.classList.contains("sotl-message-paw-btn") && /\b(Copy|clone)\b/i.test(btn.textContent || btn.getAttribute("aria-label") || btn.getAttribute("title") || btn.className || ""));
          const referenceBtn = copyBtn || Array.from(toolbar.querySelectorAll('button, [role="button"], a')).find((btn) => isVisibleElement(btn) && !btn.classList.contains("sotl-message-history-badge") && !btn.classList.contains("sotl-message-paw-btn"));
          if (referenceBtn) {
            syncNativeLikeButtonVariables(badge2, referenceBtn);
            toolbar.insertBefore(badge2, referenceBtn);
          } else {
            toolbar.insertBefore(badge2, toolbar.firstChild);
          }
        } else {
          injectedHistoryBadges.set(key, null);
          badgesMounted++;
          return;
        }
      }
      badge2.dataset.sotlAction = "message-paw";
      badge2.dataset.sotlMessageId = messageId;
      badge2.dataset.sotlMessageHistoryBadge = "true";
      if (typeof activeSwipe === "number") {
        badge2.dataset.sotlSwipeId = String(activeSwipe);
      } else {
        delete badge2.dataset.sotlSwipeId;
      }
      badge2.title = "Tracker History";
      badge2.setAttribute("aria-label", "Open tracker history for this response");
      const hasTracker = state2.messageTrackers.some(
        (t) => t.messageId === messageId && !t.hidden && (typeof activeSwipe !== "number" || t.swipeId === activeSwipe)
      );
      badge2.classList.toggle("sotl-message-history-badge--has-tracker", hasTracker);
      badge2.classList.toggle("sotl-message-history-badge--missing-tracker", !hasTracker);
      badge2.classList.toggle("sotl-message-history-badge--generating", state2.generation.running);
      if (!badge2.querySelector(".sotl-message-paw-svg")) {
        badge2.innerHTML = bearPawSvg("sotl-message-paw-svg");
      }
      injectedHistoryBadges.set(key, badge2);
      badgesMounted++;
    } catch (err) {
      console.warn("Loom Keeper: failed to mount history badge", err);
    }
  });
  try {
    const globalToolbars = findVisibleGlobalToolbars(doc, state2);
    for (const match of globalToolbars) {
      try {
        const messageId = match.messageId;
        const activeSwipe = match.swipeId;
        const key = `global-badge::${messageId}::swipe:${typeof activeSwipe === "number" ? activeSwipe : "main"}`;
        activeKeys.add(key);
        let badge2 = match.toolbar.querySelector(".sotl-message-history-badge");
        if (!badge2) {
          badge2 = doc.createElement("button");
          badge2.type = "button";
          badge2.className = "sotl-message-history-badge";
          badge2.classList.add("sotl-message-history-badge--toolbar");
          const copyBtn = Array.from(match.toolbar.querySelectorAll('button, [role="button"], a, [data-action], [data-lv-action]')).find((btn) => isVisibleElement(btn) && !btn.classList.contains("sotl-message-history-badge") && !btn.classList.contains("sotl-message-paw-btn") && /\b(Copy|clone)\b/i.test(btn.textContent || btn.getAttribute("aria-label") || btn.getAttribute("title") || btn.className || ""));
          const referenceBtn = copyBtn || Array.from(match.toolbar.querySelectorAll('button, [role="button"], a')).find((btn) => isVisibleElement(btn) && !btn.classList.contains("sotl-message-history-badge") && !btn.classList.contains("sotl-message-paw-btn"));
          if (referenceBtn) {
            syncNativeLikeButtonVariables(badge2, referenceBtn);
            match.toolbar.insertBefore(badge2, referenceBtn);
          } else {
            match.toolbar.insertBefore(badge2, match.toolbar.firstChild);
          }
        }
        badge2.dataset.sotlAction = "message-paw";
        badge2.dataset.sotlMessageId = messageId;
        badge2.dataset.sotlMessageHistoryBadge = "true";
        if (typeof activeSwipe === "number") {
          badge2.dataset.sotlSwipeId = String(activeSwipe);
        } else {
          delete badge2.dataset.sotlSwipeId;
        }
        badge2.title = "Tracker History";
        badge2.setAttribute("aria-label", "Open tracker history for this response");
        const hasTracker = state2.messageTrackers.some(
          (t) => t.messageId === messageId && !t.hidden && (typeof activeSwipe !== "number" || t.swipeId === activeSwipe)
        );
        badge2.classList.toggle("sotl-message-history-badge--has-tracker", hasTracker);
        badge2.classList.toggle("sotl-message-history-badge--missing-tracker", !hasTracker);
        badge2.classList.toggle("sotl-message-history-badge--generating", state2.generation.running);
        if (!badge2.querySelector(".sotl-message-paw-svg")) {
          badge2.innerHTML = bearPawSvg("sotl-message-paw-svg");
        }
        injectedHistoryBadges.set(key, badge2);
        badgesMounted++;
      } catch (err) {
        console.warn("Loom Keeper: failed to mount message badge for global toolbar", err);
      }
    }
  } catch (err) {
    console.warn("Loom Keeper: global toolbar badge scan failed", err);
  }
  for (const [key, badge2] of injectedHistoryBadges.entries()) {
    if (!badge2 || !badge2.isConnected || !activeKeys.has(key)) {
      try {
        if (badge2) badge2.remove();
      } catch {
      }
      injectedHistoryBadges.delete(key);
    }
  }
  lastAssistantHostsFound = assistantHostsFound;
  lastBadgesMounted = badgesMounted;
  return { status: `Mounted ${badgesMounted} history badges.` };
}
function mountMessageTrackerActions(ctx, state2) {
  void ctx;
  const doc = documentRef2();
  if (!doc) return { status: "Message tracker paw unavailable: no document." };
  cleanupDisconnectedMessagePaws();
  lastHostsFound = 0;
  lastNativeToolbarButtonsMounted = 0;
  lastPortalToolbarsFound = 0;
  lastContextMenuItemsMounted = 0;
  lastMountReasonStr = "no-state";
  if (!state2) {
    doc.querySelectorAll(".sotl-message-paw-btn").forEach((btn) => btn.remove());
    injectedMessagePaws.clear();
    return { status: "Message tracker paw waiting for backend state." };
  }
  const hosts = doc.querySelectorAll('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]');
  let inlineMounted = 0;
  let inHostToolbarsFound = 0;
  const activeKeys = /* @__PURE__ */ new Set();
  hosts.forEach((host) => {
    try {
      if (!(host instanceof HTMLElement)) return;
      const messageId = messageIdFromElement(host);
      if (!messageId) return;
      const activeSwipe = state2.activeSwipeByMessageId ? state2.activeSwipeByMessageId[messageId] : void 0;
      const key = `${messageId}::swipe:${typeof activeSwipe === "number" ? activeSwipe : "main"}`;
      const isAssistant = isAssistantMessageHost(host, messageId, state2);
      if (!isAssistant) {
        const oldButton = host.querySelector(".sotl-message-paw-btn");
        if (oldButton) {
          oldButton.remove();
          injectedMessagePaws.delete(key);
        }
        return;
      }
      const toolbar = findMessageToolbar(host);
      if (!toolbar) {
        const oldButton = host.querySelector(".sotl-message-paw-btn");
        if (oldButton) {
          oldButton.remove();
          injectedMessagePaws.delete(key);
        }
        return;
      }
      inHostToolbarsFound++;
      activeKeys.add(key);
      inlineMounted += injectPawButtonIntoToolbar(doc, toolbar, messageId, activeSwipe, state2, "in-host");
      const existingBtn = toolbar.querySelector(".sotl-message-paw-btn");
      if (existingBtn) injectedMessagePaws.set(key, existingBtn);
    } catch (err) {
      console.warn("Loom Keeper: failed to mount message paw for host", host, err);
    }
  });
  let globalToolbarCount = 0;
  try {
    const globalToolbars = findVisibleGlobalToolbars(doc, state2);
    globalToolbarCount = globalToolbars.length;
    for (const match of globalToolbars) {
      try {
        const activeSwipe = match.swipeId;
        const key = `global::${match.messageId}::swipe:${typeof activeSwipe === "number" ? activeSwipe : "main"}`;
        activeKeys.add(key);
        inlineMounted += injectPawButtonIntoToolbar(doc, match.toolbar, match.messageId, activeSwipe, state2, "portal");
        const existingBtn = match.toolbar.querySelector(".sotl-message-paw-btn");
        if (existingBtn) injectedMessagePaws.set(key, existingBtn);
      } catch (err) {
        console.warn("Loom Keeper: failed to mount message paw for global toolbar", err);
      }
    }
  } catch (err) {
    console.warn("Loom Keeper: global toolbar scan failed", err);
  }
  for (const [key, btn] of injectedMessagePaws.entries()) {
    if (!btn.isConnected || !activeKeys.has(key)) {
      try {
        btn.remove();
      } catch {
      }
      injectedMessagePaws.delete(key);
    }
  }
  const menuMounted = mountContextMenuTrackerAction(doc, state2);
  const mountReason = inlineMounted > 0 ? globalToolbarCount > 0 ? "mounted-in-host-and-portal" : "mounted-in-host" : globalToolbarCount > 0 ? "mounted-portal-only" : hosts.length > 0 ? "no-visible-toolbars" : "no-message-hosts";
  lastHostsFound = hosts.length;
  lastNativeToolbarButtonsMounted = inlineMounted;
  lastPortalToolbarsFound = globalToolbarCount;
  lastContextMenuItemsMounted = menuMounted;
  lastInHostToolbarsFound = inHostToolbarsFound;
  lastMountReasonStr = mountReason;
  if (inlineMounted > 0 || globalToolbarCount > 0 || menuMounted > 0) {
    const tgt = lastSelectedMessageTarget;
    const tgtStr = tgt ? `${tgt.messageId} via ${tgt.source}/${tgt.confidence}` : "none";
    console.debug(
      `[Loom Keeper] hostsFound=${hosts.length}, inHostToolbars=${inHostToolbarsFound}, globalPortalToolbars=${globalToolbarCount}, selectedTarget=${tgtStr}, buttonsInjected=${inlineMounted}, menuItems=${menuMounted}, lastMountReason=${mountReason}`
    );
  }
  const reports = [];
  if (inlineMounted > 0) reports.push(`Injected ${inlineMounted} native toolbar button(s).`);
  if (globalToolbarCount > 0) reports.push(`Scanned ${globalToolbarCount} global/portal toolbar(s).`);
  if (menuMounted > 0) reports.push(`Mounted ${menuMounted} context menu tracker action(s).`);
  return { status: reports.join(" ") || "No active message toolbars found." };
}
function injectPawButtonIntoToolbar(doc, toolbar, messageId, activeSwipe, state2, source) {
  let button2 = toolbar.querySelector(".sotl-message-paw-btn");
  let created = 0;
  if (!button2) {
    button2 = doc.createElement("button");
    button2.type = "button";
    button2.className = "sotl-message-paw-btn";
    const copyBtn = Array.from(toolbar.querySelectorAll('button, [role="button"], a, [data-action], [data-lv-action]')).find((btn) => isVisibleElement(btn) && !btn.classList.contains("sotl-message-paw-btn") && /\b(Copy|clone)\b/i.test(btn.textContent || btn.getAttribute("aria-label") || btn.getAttribute("title") || btn.className || ""));
    const referenceBtn = copyBtn || Array.from(toolbar.querySelectorAll('button, [role="button"], a')).find((btn) => isVisibleElement(btn) && !btn.classList.contains("sotl-message-paw-btn"));
    if (referenceBtn) {
      syncNativeLikeButtonVariables(button2, referenceBtn);
      toolbar.insertBefore(button2, referenceBtn);
    } else {
      toolbar.insertBefore(button2, toolbar.firstChild);
    }
    created = 1;
  }
  const hasTracker = state2.messageTrackers.some(
    (t) => t.messageId === messageId && !t.hidden && (typeof activeSwipe !== "number" || t.swipeId === activeSwipe)
  );
  button2.dataset.sotlAction = "message-paw";
  button2.dataset.sotlMessagePaw = "true";
  button2.dataset.sotlMessageId = messageId;
  button2.dataset.sotlMountSource = source;
  if (typeof activeSwipe === "number") {
    button2.dataset.sotlSwipeId = String(activeSwipe);
  } else {
    delete button2.dataset.sotlSwipeId;
  }
  button2.title = hasTracker ? "View Continuity History" : "Generate Continuity State";
  button2.setAttribute("aria-label", button2.title);
  button2.innerHTML = bearPawSvg("sotl-message-paw-svg");
  button2.classList.toggle("sotl-message-paw-btn--has-tracker", hasTracker);
  button2.classList.toggle("sotl-message-paw-btn--generating", state2.generation.running);
  return created;
}
function renderCompactPanel(tracker, state2, missingSwipeId) {
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
    <button class="sotl-chat-panel__action-btn" data-sotl-panel-action="generate" ${!isGenerating && state2.generation.disabledReason ? "disabled" : ""} title="${escapeHtml3(isGenerating ? "Stop tracker generation" : state2.generation.disabledReason || "Generate Tracker State")}" aria-label="${isGenerating ? "Stop tracker generation" : "Generate Tracker State"}">
      <svg class="${isGenerating ? "sotl-spin" : ""}" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
        ${isGenerating ? '<rect x="6" y="6" width="12" height="12" rx="2"/>' : '<path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'}
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
    const missingText = typeof missingSwipeId === "number" ? `No tracker retained/generated for Swipe ${missingSwipeId + 1}. Loom Keeper will not show a sibling swipe's tracker here.` : "No tracker has been stored for this chat yet.";
    return [
      '<div class="sotl-chat-panel">',
      header,
      '  <div class="sotl-chat-panel__body">',
      `    <p class="sotl-chat-panel__desc">${escapeHtml3(missingText)}</p>`,
      `    <button class="sotl-button" data-sotl-panel-action="generate" ${!isGenerating && state2.generation.disabledReason ? "disabled" : ""} style="margin-top: 6px; width: 100%; justify-content: center;">${isGenerating ? "Stop Generation" : "Generate Tracker"}</button>`,
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
    const swipeChip = typeof tracker.swipeId === "number" ? `<span class="sotl-swipe-chip" title="Active assistant swipe">Swipe ${tracker.swipeId + 1}</span>` : "";
    bodyContent = `
      <div class="sotl-chat-panel__scroll-body">
        ${swipeChip}
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
  const doc = documentRef2();
  if (!doc) return;
  const show = Boolean(state2 && shouldShowGlobalPaw(doc, state2));
  const container = chatPanelContainer && chatPanelContainer.isConnected ? chatPanelContainer : doc.querySelector(".sotl-chat-panel-container") ?? doc.createElement("div");
  chatPanelContainer = container;
  container.className = "sotl-chat-panel-container";
  container.dataset.sotlChatPanel = "true";
  if (!show || !state2) {
    isChatLoomPanelExpanded = false;
    container.hidden = true;
    container.setAttribute("aria-hidden", "true");
    container.dataset.sotlHiddenReason = !state2 ? "state-unavailable" : lastGlobalPawHideReason || "not-normal-chat";
    if (!container.isConnected) doc.body.append(container);
    return;
  }
  container.hidden = false;
  container.removeAttribute("aria-hidden");
  container.dataset.sotlHiddenReason = "";
  container.classList.remove("sotl-chat-panel-container--expanded");
  if (isChatLoomPanelExpanded) {
    container.classList.add("sotl-chat-panel-container--expanded");
    container.removeAttribute("style");
    delete container.dataset.sotlNativeMounted;
  }
  if (!isChatLoomPanelExpanded) {
    const generatingClass = state2.generation.running ? " sotl-chat-pill--generating" : "";
    const pill = container.querySelector(".sotl-chat-pill");
    if (pill) {
      if (state2.generation.running) {
        pill.classList.add("sotl-chat-pill--generating");
      } else {
        pill.classList.remove("sotl-chat-pill--generating");
      }
    } else {
      container.innerHTML = `
        <div class="sotl-chat-pill${generatingClass}" data-sotl-panel-action="expand" title="Open Loom HUD" role="button" aria-label="Open Loom HUD" tabindex="0">
          ${bearPawSvg()}
        </div>
      `;
    }
    if (mountLauncherInNativeRail(doc, container)) {
      attachContainerClickHandler(container, ctx, state2, doc);
      return;
    }
    if (false) {
      if (false) {
        container.style.removeProperty("position");
        container.style.setProperty("display", "block");
        container.style.setProperty("margin-top", "8px");
        container.hidden = true;
        attachContainerClickHandler(container, ctx, state2, doc);
        return;
      }
    }
  } else {
    const resolution = resolveActiveTrackerForState(state2);
    container.innerHTML = renderCompactPanel(resolution.tracker, state2, resolution.missingSwipeId);
  }
  if (!isChatLoomPanelExpanded) {
    syncFixedLauncherToStockIcon(doc, container);
  }
  attachContainerClickHandler(container, ctx, state2, doc);
  if (!container.isConnected || container.parentElement !== doc.body) doc.body.append(container);
}
function attachContainerClickHandler(container, ctx, state2, doc) {
  container.__sotlState = state2;
  if (container.__sotlClickBound) return;
  container.__sotlClickBound = true;
  container.addEventListener("click", (e) => {
    const currentState = container.__sotlState ?? state2;
    const target = e.target;
    if (!target) return;
    const pill = target.closest(".sotl-chat-pill");
    if (pill && !isChatLoomPanelExpanded) {
      isChatLoomPanelExpanded = true;
      triggerRerender();
      return;
    }
    const action = target.dataset.sotlPanelAction || target.closest("[data-sotl-panel-action]")?.getAttribute("data-sotl-panel-action");
    if (action === "collapse") {
      isChatLoomPanelExpanded = false;
      triggerRerender();
    } else if (action === "expand") {
      isChatLoomPanelExpanded = true;
      triggerRerender();
    } else if (action === "toggle-hud-view") {
      const nextView = currentState.settings.hudDefaultView === "compact" ? "full" : "compact";
      currentState.settings.hudDefaultView = nextView;
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
            openDrawer("loom_keeper");
          } else {
            const openBtn = doc.querySelector('[data-sotl-action="open-drawer"]');
            openBtn?.click();
          }
        }
      }, 100);
    } else if (action === "generate") {
      if (typeof ctx.sendToBackend === "function") {
        if (currentState.generation.running) ctx.sendToBackend({ type: "cancel_generation" });
        else ctx.sendToBackend({ type: "generate_tracker" });
      } else {
        const genBtn = doc.querySelector(`[data-sotl-action="${currentState.generation.running ? "cancel-generation" : "generate"}"]`);
        genBtn?.click();
      }
    }
  });
}
function ensureFloatingButton(ctx, state2) {
  const doc = documentRef2();
  if (!doc) return;
  doc.querySelector('[data-sotl-dynamic-float="true"]')?.remove();
  if (!state2?.settings.showFloatingButton) return;
  if (isDrawerOpen || isSettingsOpen) return;
  if (typeof globalThis.matchMedia === "function" && globalThis.matchMedia("(max-width: 720px)").matches) return;
  const button2 = doc.createElement("button");
  button2.className = "sotl-float";
  button2.type = "button";
  button2.dataset.sotlDynamicFloat = "true";
  button2.title = "Loom Keeper (Experimental)";
  button2.textContent = "L";
  button2.addEventListener("click", () => {
    const ui = ctx.ui && typeof ctx.ui === "object" ? ctx.ui : {};
    const openDrawer = ui.openDrawer ?? ui.showDrawer ?? ui.openPanel;
    if (typeof openDrawer === "function") {
      openDrawer("loom_keeper");
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}
.sotl-root *, .sotl-chat-panel-container *, .sotl-message-card * {
  box-sizing: border-box;
}
.sotl-panel {
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  border-radius: var(--lumiverse-radius, 8px);
  background: var(--lumiverse-fill-subtle, var(--lv-surface, rgba(255, 255, 255, 0.78)));
  padding: 12px;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}
.sotl-control-panel {
  display: grid;
  gap: 10px;
  min-width: 0;
}
.sotl-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
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
.sotl-quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}
.sotl-quick-grid article {
  display: grid;
  gap: 2px;
  min-width: 0;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.16)));
  border-radius: 7px;
  padding: 8px;
  background: var(--lumiverse-fill, rgba(255, 255, 255, 0.46));
}
.sotl-quick-grid span,
.sotl-quick-grid em {
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  font-size: 11px;
  font-style: normal;
  overflow-wrap: anywhere;
}
.sotl-quick-grid strong {
  font-size: 12px;
  overflow-wrap: anywhere;
}
.sotl-mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.sotl-save-pulse {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(27, 126, 80, 0.28);
  background: rgba(27, 126, 80, 0.08);
  color: var(--lv-success-text, #176b43);
  font-size: 12px;
  font-weight: 700;
}
.sotl-inline-warning {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(176, 104, 0, 0.28);
  background: rgba(176, 104, 0, 0.1);
  color: var(--lv-warning-text, #8a4f00);
  font-size: 11px;
  font-weight: 700;
  vertical-align: middle;
}
.sotl-strong-note {
  color: var(--lv-accent, #3864d9);
  font-weight: 700;
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
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
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
  min-width: 0;
  max-width: 100%;
}
.sotl-label {
  display: grid;
  gap: 5px;
  font-size: 12px;
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  min-width: 0;
}
.sotl-select, .sotl-input, .sotl-textarea {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  border-radius: var(--lumiverse-radius, 6px);
  background: var(--lumiverse-fill, var(--lv-input-bg, #fff));
  color: inherit;
  padding: 8px;
  font: inherit;
}
.sotl-select {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  overflow-x: auto;
  max-height: 420px;
  max-width: 100%;
  min-width: 0;
  contain: inline-size;
}
.sotl-preview > * {
  max-width: 100%;
}
.sotl-preview .wtrk_ol_safe,
.sotl-preview .sotl-atlas,
.sotl-preview [data-sotl-card="true"] {
  max-width: 100% !important;
  min-width: 0 !important;
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
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
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
  max-width: 100%;
  overflow-x: hidden;
}
.sotl-message-group {
  display: grid;
  gap: 8px;
}
.sotl-message-row, .sotl-swipe-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
  min-width: 0;
  max-width: 100%;
}
.sotl-message-row__main {
  min-width: 0;
}
.sotl-message-row__main h3 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sotl-swipe-row {
  padding: 7px;
  border: 1px solid var(--lumiverse-border, rgba(80,88,100,0.12));
  border-radius: 6px;
  background: rgba(0,0,0,0.035);
}
.sotl-swipe-alternatives {
  margin-top: 0;
}
.sotl-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}
.sotl-swipe-chip {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  max-width: 100%;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid rgba(127, 201, 223, 0.28);
  background: rgba(127, 201, 223, 0.08);
  color: var(--lv-accent, #3864d9);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.sotl-swipe-chip--active {
  border-color: rgba(27, 126, 80, 0.38);
  background: rgba(27, 126, 80, 0.1);
  color: var(--lv-success-text, #176b43);
}
.sotl-message-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
  margin-bottom: 4px;
}
.sotl-icon-button {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  background: var(--lumiverse-fill, var(--lv-surface, #fff));
  color: inherit;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}
.sotl-icon-button svg {
  width: 16px;
  height: 16px;
  display: block;
}
.sotl-icon-button:hover {
  color: var(--lv-accent, #3864d9);
  border-color: var(--lv-accent, #3864d9);
  background: var(--lumiverse-fill-subtle, var(--lv-surface-subtle, rgba(56, 100, 217, 0.08)));
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
.sotl-injection-report {
  display: grid;
  gap: 5px;
  padding: 10px;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.18)));
  border-radius: 6px;
  background: rgba(56, 100, 217, 0.05);
  font-size: 11px;
  line-height: 1.45;
}
.sotl-injection-report code {
  overflow-wrap: anywhere;
}
.sotl-details {
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.18)));
  border-radius: var(--lumiverse-radius, 6px);
  background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.35));
  padding: 8px 10px;
  margin-top: 8px;
}
.sotl-settings-section {
  padding: 0;
  overflow: hidden;
  max-width: 100%;
  min-width: 0;
}
.sotl-details summary {
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: var(--lumiverse-text, var(--lv-text, #1e2329));
  user-select: none;
  outline: none;
}
.sotl-settings-section > summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
}
.sotl-settings-section[open] > summary {
  margin-bottom: 0;
  padding-bottom: 9px;
}
.sotl-summary-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sotl-summary-meta {
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  font-size: 11px;
  font-weight: 500;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sotl-settings-section > .sotl-fields,
.sotl-settings-section > .sotl-section-pad,
.sotl-settings-section > .sotl-injection-report,
.sotl-settings-section > div:not(.sotl-toast) {
  padding: 10px;
}
.sotl-details[open] summary {
  border-bottom: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.15)));
  padding-bottom: 6px;
  margin-bottom: 8px;
}
.sotl-preview--short {
  max-height: 220px;
  border: 1px dashed var(--lumiverse-border, rgba(80,88,100,0.18));
  border-radius: 6px;
  padding: 4px;
  background: rgba(0,0,0,0.05);
}
.sotl-status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 7px;
  border-left: 4px solid var(--lv-accent, #3864d9);
  font-size: 12px;
  font-weight: 700;
}
.sotl-status-banner--info {
  color: var(--lv-accent, #3864d9);
  background: rgba(56, 100, 217, 0.08);
}
.sotl-status-banner--warning {
  color: var(--lv-warning-text, #8a4f00);
  border-left-color: var(--lv-warning-border, #b06800);
  background: rgba(255, 193, 7, 0.08);
}
.sotl-status-banner--success {
  color: var(--lv-success-text, #176b43);
  border-left-color: var(--lv-success-border, #176b43);
  background: rgba(27, 126, 80, 0.08);
}
.sotl-status-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: currentColor;
}
.sotl-status-banner--warning .sotl-status-dot {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  background: transparent;
  border: 1px solid currentColor;
  font-size: 11px;
}
.sotl-toast {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 7px;
  border-left: 4px solid #b06800;
  background: rgba(255, 193, 7, 0.08);
  font-size: 12px;
}
.sotl-toast--success {
  border-left-color: #176b43;
  background: rgba(27,126,80,0.07);
}
.sotl-toast--error {
  border-left-color: #bd2130;
  background: rgba(220,53,69,0.08);
}
.sotl-diagnostic-grid {
  display: grid;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--lumiverse-border, rgba(80,88,100,0.15));
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
  font-size: 11px;
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
 * Loom Keeper Collapsed Paw Print HUD Launcher Position.
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
.sotl-chat-panel-container[data-sotl-native-mounted="true"]:not(.sotl-chat-panel-container--expanded) {
  position: static;
  right: auto;
  top: auto;
  display: block;
  margin-top: 8px;
  z-index: auto;
}
.sotl-chat-panel-container.sotl-chat-panel-container--expanded {
  position: fixed;
  top: 48px;
  right: 16px;
  left: 16px;
  width: auto;
  max-width: 720px;
  margin-left: auto;
}
.sotl-chat-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--sotl-native-width, var(--sotl-native-size, 36px));
  height: var(--sotl-native-height, var(--sotl-native-size, 36px));
  border-radius: var(--sotl-native-radius, 8px);
  background: var(--sotl-native-bg, var(--lumiverse-fill, var(--lv-surface-raised, rgba(255, 255, 255, 0.85))));
  backdrop-filter: var(--sotl-native-backdrop, blur(12px));
  -webkit-backdrop-filter: var(--sotl-native-backdrop, blur(12px));
  border: var(--sotl-native-border, 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.25))));
  cursor: pointer;
  box-shadow: var(--sotl-native-shadow, 0 4px 16px rgba(20, 24, 32, 0.12));
  opacity: var(--sotl-native-opacity, 1);
  user-select: none;
  transition: all 0.2s ease;
  padding: var(--sotl-native-padding, 0);
  color: var(--sotl-native-color, var(--lumiverse-text, var(--lv-text, #1e2329)));
  position: relative;
  overflow: visible;
}
.sotl-paw-svg,
.sotl-message-paw-svg {
  display: block;
  width: var(--sotl-native-glyph-size, 24px);
  height: var(--sotl-native-glyph-size, 24px);
  overflow: visible;
}
.sotl-chat-pill .sotl-paw-svg,
.sotl-context-menu-item .sotl-message-paw-svg,
.sotl-message-paw-action .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9);
}
.sotl-paw-pad,
.sotl-paw-main,
.sotl-bear-claw {
  transform-box: fill-box;
  transform-origin: center;
}
.sotl-chat-pill--generating::after,
.sotl-message-paw-btn--generating::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 1px solid var(--lv-accent, #3864d9);
  opacity: 0.5;
  animation: sotl-paw-ring 1.35s ease-out infinite;
  pointer-events: none;
}
.sotl-chat-pill--generating .sotl-bear-claw,
.sotl-message-paw-btn--generating .sotl-bear-claw {
  animation: sotl-thread-weave 1.2s ease-in-out infinite !important;
  transform-origin: 372px 140px;
}
.sotl-chat-pill--generating .sotl-bear-claw--1,
.sotl-message-paw-btn--generating .sotl-bear-claw--1 {
  animation-delay: 0s !important;
}
.sotl-chat-pill--generating .sotl-bear-claw--2,
.sotl-message-paw-btn--generating .sotl-bear-claw--2 {
  animation-delay: 0.15s !important;
}
.sotl-chat-pill--generating .sotl-bear-claw--3,
.sotl-message-paw-btn--generating .sotl-bear-claw--3 {
  animation-delay: 0.3s !important;
}
.sotl-chat-pill--generating .sotl-bear-claw--4,
.sotl-message-paw-btn--generating .sotl-bear-claw--4 {
  animation-delay: 0.45s !important;
}
.sotl-chat-pill--generating .sotl-paw-main,
.sotl-message-paw-btn--generating .sotl-paw-main {
  animation: sotl-needle-stitch 1.2s ease-in-out infinite !important;
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
.sotl-chat-panel-container--expanded .sotl-chat-panel {
  width: 100%;
  max-height: calc(100vh - 136px);
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
  min-height: 0;
}
.sotl-chat-panel-container--expanded .sotl-chat-panel__body {
  flex: 1 1 auto;
  overflow: hidden;
}
.sotl-chat-panel__scroll-body {
  overflow-y: auto;
  max-height: 280px;
  padding-right: 4px;
  min-height: 0;
}
.sotl-chat-panel-container--expanded .sotl-chat-panel__scroll-body {
  flex: 1 1 auto;
  max-height: calc(100vh - 190px);
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
@keyframes sotl-paw-pad-bounce {
  0%, 65%, 100% { transform: translateY(0); }
  28% { transform: translateY(-18px); }
}
@keyframes sotl-paw-ring {
  0% { transform: scale(0.9); opacity: 0.45; }
  100% { transform: scale(1.35); opacity: 0; }
}
@keyframes sotl-paw-main-pulse {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(56, 100, 217, 0)); opacity: 0.9; }
  45% { filter: drop-shadow(0 0 8px rgba(56, 100, 217, 0.65)); opacity: 1; }
}
@keyframes sotl-needle-stitch {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-10px, 10px); }
}
@keyframes sotl-thread-weave {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.4; }
  50% { transform: scale(1.08) rotate(4deg); opacity: 0.9; }
}
.sotl-message-paw-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--sotl-native-width, var(--sotl-native-size, 28px));
  height: var(--sotl-native-height, var(--sotl-native-size, 28px));
  min-width: var(--sotl-native-width, var(--sotl-native-size, 28px));
  min-height: var(--sotl-native-height, var(--sotl-native-size, 28px));
  border-radius: var(--sotl-native-radius, 6px);
  border: var(--sotl-native-border, 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.2))));
  background: var(--sotl-native-bg, transparent);
  color: var(--sotl-native-color, currentColor);
  box-shadow: var(--sotl-native-shadow, none);
  opacity: var(--sotl-native-opacity, 1);
  padding: var(--sotl-native-padding, 0);
  margin-left: 0;
  margin-right: 4px;
  cursor: pointer;
  line-height: 1;
  vertical-align: middle;
}
.sotl-message-paw-action:hover,
.sotl-message-paw-action:focus-visible {
  color: var(--lv-accent, #3864d9);
  border-color: var(--lv-accent, #3864d9);
  outline: none;
}
.sotl-message-paw-action .sotl-message-paw-svg {
  width: max(18px, var(--sotl-native-glyph-size, 18px));
  height: max(18px, var(--sotl-native-glyph-size, 18px));
}
.sotl-context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: var(--sotl-native-height, 40px);
  padding: var(--sotl-native-padding, 10px 14px);
  border: var(--sotl-native-border, 0);
  border-radius: var(--sotl-native-radius, 8px);
  background: var(--sotl-native-bg, transparent);
  color: var(--sotl-native-color, inherit);
  box-shadow: var(--sotl-native-shadow, none);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.sotl-context-menu-item:hover,
.sotl-context-menu-item:focus-visible {
  color: var(--lv-accent, #3864d9);
  outline: none;
}
.sotl-context-menu-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  min-width: 22px;
}
.sotl-message-row,
.sotl-swipe-row {
  cursor: pointer;
}
.sotl-message-row:focus-visible,
.sotl-swipe-row:focus-visible {
  outline: 2px solid var(--lv-accent, #3864d9);
  outline-offset: 2px;
}
.sotl-message-row__eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.sotl-focused-tracker {
  border-color: var(--lv-accent, #3864d9);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--lv-accent, #3864d9) 18%, transparent);
}
.sotl-message-row--focused {
  border-color: var(--lv-accent, #3864d9);
  background: color-mix(in srgb, var(--lv-accent, #3864d9) 8%, transparent);
}
.sotl-tracker-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: grid;
  place-items: center;
  padding: max(14px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  box-sizing: border-box;
  pointer-events: auto;
}
.sotl-tracker-preview__scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.sotl-tracker-preview {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
  max-height: min(80vh, calc(100vh - 40px));
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.28)));
  background: var(--lumiverse-fill, var(--lv-surface-raised, rgba(10, 12, 18, 0.96)));
  color: var(--lumiverse-text, var(--lv-text, #f3f5f8));
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
  padding: 12px;
}
.sotl-tracker-preview__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: start;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.2)));
}
.sotl-tracker-preview__head h3 {
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.sotl-tracker-preview__eyebrow,
.sotl-tracker-preview__meta {
  margin: 0;
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #8f9baa));
  font-size: 11px;
}
.sotl-tracker-preview__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.sotl-tracker-preview__badge {
  align-self: center;
  border: 1px solid color-mix(in srgb, var(--lv-accent, #3864d9) 40%, transparent);
  border-radius: 999px;
  padding: 3px 8px;
  color: var(--lv-accent, #3864d9);
  font-size: 11px;
  white-space: nowrap;
}
.sotl-tracker-preview__badge[data-status="missing"] {
  color: var(--lv-warning-text, #d4aa72);
  border-color: color-mix(in srgb, var(--lv-warning-text, #d4aa72) 45%, transparent);
}
.sotl-tracker-preview__close {
  align-self: start;
}
.sotl-tracker-preview__body {
  min-height: 120px;
  overflow: auto;
  overscroll-behavior: contain;
  padding-right: 2px;
}
.sotl-tracker-preview__body .sotl-preview,
.sotl-tracker-preview__body [data-sotl-card="true"],
.sotl-tracker-preview__body .sotl-card {
  max-width: 100%;
}
.sotl-tracker-preview__missing {
  border: 1px solid color-mix(in srgb, var(--lv-warning-text, #d4aa72) 35%, transparent);
  border-radius: 8px;
  padding: 14px;
  background: color-mix(in srgb, var(--lv-warning-text, #d4aa72) 10%, transparent);
  color: var(--lumiverse-text, var(--lv-text, #f3f5f8));
}
.sotl-tracker-preview__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.2)));
}
@media (prefers-reduced-motion: reduce) {
  .sotl-chat-pill--generating::after,
  .sotl-chat-pill--generating .sotl-paw-pad,
  .sotl-chat-pill--generating .sotl-bear-claw,
  .sotl-chat-pill--generating .sotl-paw-main {
    animation: none;
  }
  .sotl-chat-pill--generating::before {
    content: "";
    position: absolute;
    width: 7px;
    height: 7px;
    right: 4px;
    top: 4px;
    border-radius: 999px;
    background: var(--lv-accent, #3864d9);
  }
}
@media (max-width: 520px) {
  .sotl-root {
    padding: 10px;
  }
  .sotl-grid, .sotl-row, .sotl-feature-grid, .sotl-quick-grid, .sotl-mini-grid {
    grid-template-columns: 1fr;
  }
  .sotl-message-row, .sotl-swipe-row {
    grid-template-columns: 1fr;
  }
  .sotl-message-row .sotl-actions, .sotl-swipe-row .sotl-actions {
    margin-top: 4px;
  }
  .sotl-panel {
    padding: 10px;
  }
  .sotl-settings-section > summary {
    align-items: flex-start;
  }
  .sotl-summary-meta {
    max-width: 44%;
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
    left: 6px;
    right: 6px;
    top: 40px;
    bottom: 84px;
    width: auto;
    max-width: none;
    margin-left: 0;
  }
  .sotl-chat-panel {
    width: 100%;
  }
  .sotl-chat-panel-container--expanded .sotl-chat-panel {
    height: 100%;
    max-height: none;
    padding: 10px;
  }
  .sotl-chat-panel-container--expanded .sotl-chat-panel__scroll-body {
    max-height: none;
  }
}

.sotl-message-paw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  position: relative;
  top: auto;
  right: auto;
  width: var(--sotl-native-width, var(--sotl-native-size, 28px));
  height: var(--sotl-native-height, var(--sotl-native-size, 28px));
  border-radius: var(--sotl-native-radius, 6px);
  background: var(--sotl-native-bg, transparent);
  border: var(--sotl-native-border, none);
  padding: var(--sotl-native-padding, 0);
  opacity: var(--sotl-native-opacity, 0.75);
  box-shadow: var(--sotl-native-shadow, none);
  color: var(--sotl-native-color, inherit);
  margin: 0 !important;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.sotl-message-paw-btn .sotl-message-paw-svg {
  width: var(--sotl-native-glyph-size, 16px);
  height: var(--sotl-native-glyph-size, 16px);
  display: block;
  color: var(--lv-accent, #3864d9);
  transition: transform 0.2s ease, color 0.2s ease;
}

.sotl-message-paw-btn:hover {
  opacity: 1 !important;
  transform: scale(1.08);
  background: var(--lv-surface-hover, rgba(255, 255, 255, 0.15)) !important;
}

.sotl-message-paw-btn:hover .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
}

.sotl-message-paw-btn--has-tracker {
  opacity: 0.95;
  color: var(--lv-accent, #3864d9) !important;
}

.sotl-message-paw-btn--has-tracker .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
  filter: drop-shadow(0 0 4px var(--lv-accent-glow, rgba(56, 100, 217, 0.4)));
}

/* ---- Per-message Tracker History Badge/Button ---- */
.sotl-message-history-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: transparent;
  border: none;
  padding: 0;
  opacity: 0.65;
  color: inherit;
  margin: 0 !important;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.sotl-message-history-badge .sotl-message-paw-svg {
  width: 14px;
  height: 14px;
  display: block;
  color: var(--lv-text-muted, #8f9baa);
  transition: transform 0.2s ease, color 0.2s ease;
}

.sotl-message-history-badge--toolbar {
  width: var(--sotl-native-width, var(--sotl-native-size, 28px));
  height: var(--sotl-native-height, var(--sotl-native-size, 28px));
  border-radius: var(--sotl-native-radius, 6px);
  background: var(--sotl-native-bg, transparent);
  border: var(--sotl-native-border, none);
  padding: var(--sotl-native-padding, 0);
  opacity: var(--sotl-native-opacity, 0.75);
  box-shadow: var(--sotl-native-shadow, none);
  color: var(--sotl-native-color, inherit);
}

.sotl-message-history-badge--toolbar .sotl-message-paw-svg {
  width: var(--sotl-native-glyph-size, 16px);
  height: var(--sotl-native-glyph-size, 16px);
  color: var(--lv-accent, #3864d9);
}

/* Hover effects */
.sotl-message-history-badge:hover {
  opacity: 1 !important;
  transform: scale(1.08);
  background: rgba(255, 255, 255, 0.1) !important;
}

.sotl-message-history-badge:hover .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
}

/* Has tracker class */
.sotl-message-history-badge--has-tracker {
  opacity: 0.95;
}
.sotl-message-history-badge--has-tracker .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
  filter: drop-shadow(0 0 3px var(--lv-accent-glow, rgba(56, 100, 217, 0.3)));
}

/* Missing tracker class */
.sotl-message-history-badge--missing-tracker {
  opacity: 0.5;
}

/* Generating / weaving state styling */
.sotl-message-history-badge--generating .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
  animation: sotl-needle-stitch 1.2s infinite ease-in-out;
}

.sotl-message-history-badge--floating {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(12, 16, 24, 0.75) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  display: inline-flex !important;
}

.sotl-message-history-badge--floating:hover {
.sotl-message-row, .sotl-swipe-row {
    grid-template-columns: 1fr;
  }
  .sotl-message-row .sotl-actions, .sotl-swipe-row .sotl-actions {
    margin-top: 4px;
  }
  .sotl-panel {
    padding: 10px;
  }
  .sotl-settings-section > summary {
    align-items: flex-start;
  }
  .sotl-summary-meta {
    max-width: 44%;
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
    left: 6px;
    right: 6px;
    top: 40px;
    bottom: 84px;
    width: auto;
    max-width: none;
    margin-left: 0;
  }
  .sotl-chat-panel {
    width: 100%;
  }
  .sotl-chat-panel-container--expanded .sotl-chat-panel {
    height: 100%;
    max-height: none;
    padding: 10px;
  }
  .sotl-chat-panel-container--expanded .sotl-chat-panel__scroll-body {
    max-height: none;
  }
}

.sotl-message-paw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  position: relative;
  top: auto;
  right: auto;
  width: var(--sotl-native-width, var(--sotl-native-size, 28px));
  height: var(--sotl-native-height, var(--sotl-native-size, 28px));
  border-radius: var(--sotl-native-radius, 6px);
  background: var(--sotl-native-bg, transparent);
  border: var(--sotl-native-border, none);
  padding: var(--sotl-native-padding, 0);
  opacity: var(--sotl-native-opacity, 0.75);
  box-shadow: var(--sotl-native-shadow, none);
  color: var(--sotl-native-color, inherit);
  margin: 0 !important;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.sotl-message-paw-btn .sotl-message-paw-svg {
  width: var(--sotl-native-glyph-size, 16px);
  height: var(--sotl-native-glyph-size, 16px);
  display: block;
  color: var(--lv-accent, #3864d9);
  transition: transform 0.2s ease, color 0.2s ease;
}

.sotl-message-paw-btn:hover {
  opacity: 1 !important;
  transform: scale(1.08);
  background: var(--lv-surface-hover, rgba(255, 255, 255, 0.15)) !important;
}

.sotl-message-paw-btn:hover .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
}

.sotl-message-paw-btn--has-tracker {
  opacity: 0.95;
  color: var(--lv-accent, #3864d9) !important;
}

.sotl-message-paw-btn--has-tracker .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
  filter: drop-shadow(0 0 4px var(--lv-accent-glow, rgba(56, 100, 217, 0.4)));
}

/* ---- Per-message Tracker History Badge/Button ---- */
.sotl-message-history-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: transparent;
  border: none;
  padding: 0;
  opacity: 0.65;
  color: inherit;
  margin: 0 !important;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.sotl-message-history-badge .sotl-message-paw-svg {
  width: 14px;
  height: 14px;
  display: block;
  color: var(--lv-text-muted, #8f9baa);
  transition: transform 0.2s ease, color 0.2s ease;
}

.sotl-message-history-badge--toolbar {
  width: var(--sotl-native-width, var(--sotl-native-size, 28px));
  height: var(--sotl-native-height, var(--sotl-native-size, 28px));
  border-radius: var(--sotl-native-radius, 6px);
  background: var(--sotl-native-bg, transparent);
  border: var(--sotl-native-border, none);
  padding: var(--sotl-native-padding, 0);
  opacity: var(--sotl-native-opacity, 0.75);
  box-shadow: var(--sotl-native-shadow, none);
  color: var(--sotl-native-color, inherit);
}

.sotl-message-history-badge--toolbar .sotl-message-paw-svg {
  width: var(--sotl-native-glyph-size, 16px);
  height: var(--sotl-native-glyph-size, 16px);
  color: var(--lv-accent, #3864d9);
}

/* Hover effects */
.sotl-message-history-badge:hover {
  opacity: 1 !important;
  transform: scale(1.08);
  background: rgba(255, 255, 255, 0.1) !important;
}

.sotl-message-history-badge:hover .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
}

/* Has tracker class */
.sotl-message-history-badge--has-tracker {
  opacity: 0.95;
}
.sotl-message-history-badge--has-tracker .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
  filter: drop-shadow(0 0 3px var(--lv-accent-glow, rgba(56, 100, 217, 0.3)));
}

/* Missing tracker class */
.sotl-message-history-badge--missing-tracker {
  opacity: 0.5;
}

/* Generating / weaving state styling */
.sotl-message-history-badge--generating .sotl-message-paw-svg {
  color: var(--lv-accent, #3864d9) !important;
  animation: sotl-needle-stitch 1.2s infinite ease-in-out;
}

.sotl-message-history-badge--floating {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(12, 16, 24, 0.75) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  display: inline-flex !important;
}

.sotl-message-history-badge--floating:hover {
  background: rgba(20, 25, 35, 0.9) !important;
  border-color: var(--lv-accent, #3864d9) !important;
  transform: scale(1.08);
}

.sotl-message-history-badge--floating .sotl-message-paw-svg {
  width: 14px;
  height: 14px;
  color: var(--lv-accent, #3864d9) !important;
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
var lastSettingsSavedAt;
var settingsSavedTimer;
var ignoreMessageActionMutationsUntil = 0;
var cleanupFns = [];
var rootListenerCleanups = /* @__PURE__ */ new Map();
var pawIconSvg = bearPawSvg("sotl-drawer-tab-paw");
var swipeStateRefreshTimer;
var swipeStateRefreshBurstTimers = [];
var swipeDomPollTimer;
var lastSwipeControlSignature = "";
var trackerPreviewRef = null;
function documentRef3() {
  return typeof document === "undefined" ? null : document;
}
function isRecord2(value) {
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
    lastToast,
    lastSettingsSavedAt
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
function scheduleSwipeStateRefresh(delayMs = 160) {
  if (swipeStateRefreshTimer !== void 0 && typeof globalThis.clearTimeout === "function") {
    globalThis.clearTimeout(swipeStateRefreshTimer);
  }
  if (typeof globalThis.setTimeout !== "function") {
    requestBackendState({ type: "refresh_state" });
    return;
  }
  swipeStateRefreshTimer = globalThis.setTimeout(() => {
    swipeStateRefreshTimer = void 0;
    requestBackendState({ type: "refresh_state" });
    scheduleMessageCardRetry();
  }, delayMs);
}
function scheduleSwipeStateRefreshBurst() {
  if (typeof globalThis.clearTimeout === "function") {
    for (const timer of swipeStateRefreshBurstTimers) globalThis.clearTimeout(timer);
  }
  swipeStateRefreshBurstTimers = [];
  const delays = [80, 260, 700];
  if (typeof globalThis.setTimeout !== "function") {
    scheduleSwipeStateRefresh(80);
    return;
  }
  for (const delay of delays) {
    const timer = globalThis.setTimeout(() => {
      scheduleSwipeStateRefresh(delay);
    }, delay);
    swipeStateRefreshBurstTimers.push(timer);
  }
}
function looksLikeSwipeControl(target) {
  const control = target.closest('button, [role="button"], [data-action], [data-lv-action], [aria-label], [title]');
  if (!control) return false;
  const clusterText = control.closest("div, nav, section, menu")?.textContent ?? "";
  const text = [
    control.getAttribute("aria-label"),
    control.getAttribute("title"),
    control.dataset.action,
    control.dataset.lvAction,
    control.dataset.swipeAction,
    control.textContent,
    clusterText
  ].filter(Boolean).join(" ");
  return /\b(swipe|variant|alternate|previous response|next response|prev response|regenerate)\b/i.test(text) || /\b\d+\s*\/\s*\d+\b/.test(text) || /^[‹›<>←→]$/.test((control.textContent || "").trim());
}
function readSwipeControlSignature(doc) {
  const candidates = Array.from(doc.querySelectorAll('button, [role="button"], [aria-label], [title], [data-action], [data-lv-action], div, span')).filter((candidate) => {
    const rect = candidate.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || rect.width > 220 || rect.height > 80) return false;
    const style = typeof getComputedStyle === "function" ? getComputedStyle(candidate) : null;
    if (style?.display === "none" || style?.visibility === "hidden" || style?.opacity === "0") return false;
    const text = [
      candidate.getAttribute("aria-label"),
      candidate.getAttribute("title"),
      candidate.dataset.action,
      candidate.dataset.lvAction,
      candidate.textContent
    ].filter(Boolean).join(" ");
    return /\b(swipe|variant|alternate|previous response|next response)\b/i.test(text) || /\b\d+\s*\/\s*\d+\b/.test(text);
  }).slice(0, 12).map((candidate) => {
    const rect = candidate.getBoundingClientRect();
    return `${Math.round(rect.left)},${Math.round(rect.top)}:${(candidate.textContent || candidate.getAttribute("aria-label") || candidate.getAttribute("title") || "").replace(/\s+/g, " ").trim()}`;
  });
  return candidates.join("|");
}
function resolveActiveJsonTracker() {
  if (!state) return null;
  return resolveActiveTrackerForState(state).tracker ?? state.latestTracker;
}
function datasetSwipeId(element) {
  const value = element.dataset.sotlSwipeId;
  if (value === void 0 || value === "") return void 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : void 0;
}
function resolveTrackerForMessageSwipe(currentState, messageId, requestedSwipeId) {
  if (!currentState || !messageId) return { tracker: null, swipeId: requestedSwipeId, notice: "Tracker state is not ready yet." };
  const trackers = currentState.messageTrackers.filter((tracker) => tracker.messageId === messageId);
  const activeSwipe = typeof requestedSwipeId === "number" ? requestedSwipeId : currentState.activeSwipeByMessageId ? currentState.activeSwipeByMessageId[messageId] : void 0;
  if (typeof activeSwipe === "number") {
    const exact = trackers.find((tracker) => tracker.swipeId === activeSwipe);
    if (exact) return { tracker: exact, swipeId: activeSwipe };
    if (trackers.some((tracker) => typeof tracker.swipeId === "number")) {
      return {
        tracker: null,
        swipeId: activeSwipe,
        notice: `No tracker is stored for Swipe ${activeSwipe + 1}. It may not have generated yet or may have been pruned by the tracker history limit.`
      };
    }
  }
  if (trackers.length === 0) {
    return { tracker: null, swipeId: activeSwipe, notice: "No tracker is stored for this message." };
  }
  const onlyTracker = trackers[0];
  if (trackers.length === 1 && onlyTracker && typeof onlyTracker.swipeId !== "number") {
    return { tracker: onlyTracker, swipeId: onlyTracker.swipeId };
  }
  return {
    tracker: null,
    swipeId: activeSwipe,
    notice: "The active swipe could not be determined clearly, so Loom Keeper did not guess between stored swipe trackers."
  };
}
function installStyle(ctx) {
  const dom = ctx.dom && typeof ctx.dom === "object" ? ctx.dom : {};
  const addStyle = dom.addStyle ?? getUi(ctx).addStyle ?? ctx.addStyle;
  if (typeof addStyle === "function") {
    const cleanup = addStyle(loomStyles, "loom-keeper-styles");
    if (typeof cleanup === "function") cleanupFns.push(cleanup);
    return;
  }
  const doc = documentRef3();
  if (!doc || doc.getElementById("loom-keeper-styles")) return;
  const style = doc.createElement("style");
  style.id = "loom-keeper-styles";
  style.textContent = loomStyles;
  doc.head.append(style);
  cleanupFns.push(() => style.remove());
}
function renderInto(root, html) {
  if (root) root.innerHTML = html;
}
function formatShortId(value) {
  if (!value) return "unknown";
  return value.length > 12 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}
function formatSwipeLabel2(swipeId) {
  return typeof swipeId === "number" ? `Swipe ${swipeId + 1}` : "Main swipe";
}
function formatGeneratedAt(value) {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
function isMobileViewport() {
  const doc = documentRef3();
  const width = doc?.defaultView?.innerWidth ?? 1024;
  return width <= 720;
}
function markGenerationPending(message) {
  if (!state) return;
  state = {
    ...state,
    generation: {
      ...state.generation,
      running: true,
      message
    }
  };
}
function markGenerationStopping() {
  if (!state) return;
  state = {
    ...state,
    generation: {
      ...state.generation,
      running: true,
      message: "Stopping generation..."
    }
  };
}
function isCurrentTracker(tracker, currentState) {
  if (!tracker || !currentState) return false;
  const current = resolveActiveTrackerForState(currentState).tracker;
  return Boolean(current && current.messageId === tracker.messageId && current.swipeId === tracker.swipeId);
}
var lastPreviewRenderKey = "";
function closeTrackerPreview() {
  trackerPreviewRef = null;
  lastPreviewRenderKey = "";
  documentRef3()?.querySelector('[data-sotl-tracker-preview="true"]')?.remove();
}
function openTrackerPreview(messageId, swipeId) {
  if (!messageId) return;
  const resolved = resolveTrackerForMessageSwipe(state, messageId, swipeId);
  trackerPreviewRef = {
    messageId,
    swipeId: resolved.swipeId,
    notice: resolved.notice
  };
  renderTrackerPreviewOverlay();
}
function renderTrackerPreviewOverlay() {
  const doc = documentRef3();
  if (!doc) return;
  let overlay = doc.querySelector('[data-sotl-tracker-preview="true"]');
  if (!trackerPreviewRef) {
    overlay?.remove();
    lastPreviewRenderKey = "";
    return;
  }
  const resolved = resolveTrackerForMessageSwipe(state, trackerPreviewRef.messageId, trackerPreviewRef.swipeId);
  const isGenerating = Boolean(state?.generation.running);
  const trackerKey = resolved.tracker ? `${resolved.tracker.generatedAt}::${resolved.tracker.validation.ok}` : "missing";
  const coreRenderKey = `${trackerPreviewRef.messageId}::${resolved.swipeId}::${trackerKey}`;
  const tracker = resolved.tracker;
  const current = isCurrentTracker(tracker, state);
  const status = tracker ? current ? "current" : "previous retained" : "missing";
  if (coreRenderKey === lastPreviewRenderKey && overlay && overlay.isConnected) {
    const badge2 = overlay.querySelector(".sotl-tracker-preview__badge");
    if (badge2) {
      badge2.textContent = status;
      badge2.setAttribute("data-status", status);
    }
    let progressBanner = overlay.querySelector(".sotl-tracker-preview__progress-banner");
    if (isGenerating) {
      if (!progressBanner) {
        progressBanner = doc.createElement("p");
        progressBanner.className = "sotl-note sotl-tracker-preview__progress-banner";
        progressBanner.setAttribute("style", "font-size: 11px; margin: 0 0 2px;");
        const head = overlay.querySelector(".sotl-card-details") || overlay.querySelector(".sotl-tracker-preview__head");
        head?.insertAdjacentElement("afterend", progressBanner);
      }
      progressBanner.textContent = `${state?.generation.message || "Generating tracker..."} Existing content remains until replacement is saved.`;
    } else if (progressBanner) {
      progressBanner.remove();
    }
    const buttons = overlay.querySelectorAll('[data-sotl-action="preview-regenerate"]');
    buttons.forEach((btn) => {
      btn.textContent = isGenerating ? "Stop Generation" : tracker ? "Regenerate" : "Generate Tracker";
    });
    return;
  }
  lastPreviewRenderKey = coreRenderKey;
  if (!overlay) overlay = doc.createElement("div");
  overlay.className = "sotl-tracker-preview-overlay";
  overlay.dataset.sotlTrackerPreview = "true";
  const preset = tracker && state ? state.presets.find((candidate) => candidate.id === tracker.presetId) : void 0;
  const jsonButton = tracker ? '<button class="sotl-button" type="button" data-sotl-action="preview-copy-json">Copy JSON</button>' : "";
  const regenerateButton = tracker ? `<button class="sotl-button" type="button" data-sotl-action="preview-regenerate" data-sotl-message-id="${escapeHtml2(tracker.messageId || trackerPreviewRef.messageId)}"${typeof tracker.swipeId === "number" ? ` data-sotl-swipe-id="${tracker.swipeId}"` : ""}>${isGenerating ? "Stop Generation" : "Regenerate"}</button>` : `<button class="sotl-button" type="button" data-sotl-action="preview-regenerate" data-sotl-message-id="${escapeHtml2(trackerPreviewRef.messageId)}"${typeof resolved.swipeId === "number" ? ` data-sotl-swipe-id="${resolved.swipeId}"` : ""} style="margin-top: 10px; width: 100%; justify-content: center;">${isGenerating ? "Stop Generation" : "Generate Tracker"}</button>`;
  const drawerButton = tracker && !isMobileViewport() ? '<button class="sotl-button" type="button" data-sotl-action="preview-open-drawer">Open in Track drawer</button>' : "";
  const body = tracker && state ? renderTrackerForState(tracker, state).html : `<div class="sotl-tracker-preview__missing" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center;">
         <p style="margin: 0 0 10px; font-weight: 500; font-size: 14px;">No tracker history exists for this message.</p>
         ${regenerateButton}
       </div>`;
  const meta = [
    `Msg ${formatShortId(tracker?.messageId || trackerPreviewRef.messageId)}`,
    formatSwipeLabel2(resolved.swipeId ?? tracker?.swipeId),
    tracker ? formatGeneratedAt(tracker.generatedAt) : "not generated",
    tracker ? preset?.name || tracker.presetId : "no template"
  ];
  const detailsHtml = [
    '<details class="sotl-card-details" style="margin-top: 2px; width: 100%; border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.2))); border-radius: 6px; padding: 4px 8px; background: rgba(0,0,0,0.15); box-sizing: border-box;">',
    '  <summary style="font-size: 11px; font-weight: 600; cursor: pointer; user-select: none; outline: none;">Show Scene Summary & Metadata</summary>',
    '  <div style="margin-top: 6px; display: grid; gap: 4px;">',
    `    <h4 style="margin: 0; font-size: 12px; font-weight: 700; color: inherit;">${tracker ? escapeHtml2(tracker.compactSummary || preset?.name || "Retained Continuity") : "No Continuity Retained"}</h4>`,
    `    <p style="margin: 0; font-size: 10px; color: var(--lumiverse-text-muted, var(--lv-text-muted, #8f9baa));">${meta.map(escapeHtml2).join(" - ")}</p>`,
    "  </div>",
    "</details>"
  ].join("\n");
  overlay.innerHTML = [
    '<div class="sotl-tracker-preview__scrim" data-sotl-action="close-tracker-preview"></div>',
    '<section class="sotl-tracker-preview" role="dialog" aria-modal="true" aria-label="Loom Keeper tracker preview" style="padding: 10px; gap: 6px; display: flex; flex-direction: column;">',
    '  <header class="sotl-tracker-preview__head" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 4px; border-bottom: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80,88,100,0.15))); gap: 8px;">',
    '    <div style="display: flex; align-items: center; gap: 6px;">',
    `      <span style="font-size: 13px; font-weight: 700; color: var(--lv-accent, #3864d9);">Loom History</span>`,
    `      <span class="sotl-tracker-preview__badge" data-status="${escapeHtml2(status)}" style="padding: 1px 6px; font-size: 10px; height: auto;">${escapeHtml2(status)}</span>`,
    "    </div>",
    '    <button class="sotl-icon-button sotl-tracker-preview__close" type="button" data-sotl-action="close-tracker-preview" aria-label="Close tracker preview" style="width: 24px; height: 24px; font-size: 14px; display: flex; align-items: center; justify-content: center; line-height: 1;">\xD7</button>',
    "  </header>",
    detailsHtml,
    isGenerating ? `<p class="sotl-note" style="font-size: 11px; margin: 0 0 2px;">${escapeHtml2(state?.generation.message || "Generating tracker...")} Existing content remains until replacement is saved.</p>` : "",
    resolved.notice && tracker ? `<p class="sotl-note sotl-warning" style="font-size: 11px; margin: 0 0 2px;">${escapeHtml2(resolved.notice)}</p>` : "",
    `  <div class="sotl-tracker-preview__body" style="flex: 1; min-height: 120px; overflow-y: auto; padding-right: 2px;">${body}</div>`,
    '  <footer class="sotl-tracker-preview__actions" style="display: flex; gap: 6px; padding-top: 6px; border-top: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80,88,100,0.15))); flex-wrap: wrap;">',
    '    <button class="sotl-button" type="button" data-sotl-action="close-tracker-preview" style="min-height: 28px; font-size: 12px; padding: 0 8px; height: 28px;">Close</button>',
    drawerButton ? drawerButton.replace("sotl-button", 'sotl-button" style="min-height: 28px; font-size: 12px; padding: 0 8px; height: 28px;') : "",
    jsonButton ? jsonButton.replace("sotl-button", 'sotl-button" style="min-height: 28px; font-size: 12px; padding: 0 8px; height: 28px;') : "",
    tracker ? regenerateButton.replace("sotl-button", 'sotl-button" style="min-height: 28px; font-size: 12px; padding: 0 8px; height: 28px;') : "",
    "  </footer>",
    "</section>"
  ].filter(Boolean).join("\n");
  if (!overlay.isConnected) doc.body.append(overlay);
}
function bindRootEvents(root) {
  if (rootListenerCleanups.has(root)) return;
  const click = (event) => handleDrawerEvent(event);
  const change = (event) => handleDrawerEvent(event);
  const toggle = (event) => handleDrawerEvent(event);
  root.addEventListener("click", click);
  root.addEventListener("change", change);
  root.addEventListener("toggle", toggle, true);
  const cleanup = () => {
    root.removeEventListener("click", click);
    root.removeEventListener("change", change);
    root.removeEventListener("toggle", toggle, true);
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
        id: "loom_keeper",
        title: "Track",
        shortName: "Track",
        headerTitle: "Track",
        description: "Open the Loom Keeper tracker HUD",
        keywords: ["state", "loom", "tracker", "continuity", "roleplay"],
        iconSvg: pawIconSvg
      });
      drawerHandle = result ?? null;
      if (isRecord2(result) && isElement(result.root)) {
        drawerRoot = result.root;
        bindRootEvents(drawerRoot);
        renderInto(drawerRoot, html);
        return;
      }
      if (drawerHandle?.update) drawerHandle.update(html);
      return;
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      console.warn?.(`Loom Keeper drawer registration failed: ${text}`);
    }
  }
  const doc = documentRef3();
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
    if (isRecord2(result) && isElement(result.root)) {
      settingsHandle = result;
      settingsRoot = result.root;
      bindRootEvents(settingsRoot);
      renderInto(settingsRoot, renderSettingsPanel(state, uiStatus()));
    }
  } catch {
  }
}
function registerInputActions(ctx) {
  void ctx;
}
function activateDrawer() {
  setDrawerOpenState(true);
  const launcher = documentRef3()?.querySelector(".sotl-chat-panel-container");
  if (launcher) {
    launcher.hidden = true;
    launcher.setAttribute("aria-hidden", "true");
  }
  if (drawerHandle?.activate) {
    drawerHandle.activate();
  }
  const doc = documentRef3();
  if (doc) {
    setTimeout(() => {
      const currentLoom = doc.querySelector('[data-sotl-focused-tracker="true"]') ?? doc.querySelector(".sotl-card") ?? doc.querySelector('[data-sotl-card="true"]') ?? drawerRoot?.querySelector(".sotl-card");
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
function activateHudTarget() {
  if (isMobileViewport()) {
    const resolved = state ? resolveActiveTrackerForState(state) : { tracker: null };
    const messageId = resolved.tracker?.messageId ?? state?.diagnostics.swipeReport?.activeMessageId;
    if (messageId) {
      openTrackerPreview(messageId, resolved.tracker?.swipeId ?? state?.diagnostics.swipeReport?.activeSwipeId);
      return;
    }
    lastToast = {
      level: "info",
      message: "Open the Track tab for settings; mobile drawer opening is disabled from the HUD to avoid layout splits."
    };
    rerender();
    return;
  }
  activateDrawer();
}
function paint(status) {
  if (state && state.latestTracker && state.diagnostics.pipelineReport) {
    try {
      const render = renderTrackerForState(state.latestTracker, state);
      const report = state.diagnostics.pipelineReport;
      report.fallbackUsed = render.fallbackUsed;
      report.renderSuccess = render.success;
      report.sanitizerRemovedContent = render.sanitizerRemovedContent;
      report.templateMode = render.templateMode;
      report.preservedData = render.preservedData;
      report.templateCompatibility = render.compatibility;
      report.renderWarning = render.warning;
      report.renderError = render.error;
      report.trackerPresetId = state.latestTracker.presetId;
    } catch {
    }
  }
  const doc = documentRef3();
  const restoreRoot = drawerRoot ?? settingsRoot ?? fallbackRoot ?? doc;
  const snapshot = captureUiState(restoreRoot);
  const drawerHtml = renderDrawer(state, status);
  const settingsHtml = renderSettingsPanel(state, status);
  renderInto(drawerRoot, drawerHtml);
  renderInto(settingsRoot, settingsHtml);
  if (drawerHandle?.update) drawerHandle.update(drawerHtml);
  if (settingsHandle?.update) settingsHandle.update(settingsHtml);
  if (fallbackRoot) fallbackRoot.innerHTML = drawerHtml;
  restoreUiState(drawerRoot ?? fallbackRoot ?? doc, snapshot);
  restoreUiState(settingsRoot ?? doc, snapshot);
}
function updateMessageCardStatus() {
  if (contextRef) {
    let cardStatus = "";
    let pawStatus = "";
    try {
      const cardResult = mountMessageCards(contextRef, state);
      cardStatus = cardResult.status;
    } catch (err) {
      console.warn("Loom Keeper: mountMessageCards failed", err);
      cardStatus = "Cards failed to mount";
    }
    ignoreMessageActionMutationsUntil = Date.now() + 250;
    try {
      const pawResult = mountMessageTrackerActions(contextRef, state);
      pawStatus = pawResult.status;
    } catch (err) {
      console.warn("Loom Keeper: mountMessageTrackerActions failed", err);
      pawStatus = "Tracker actions failed to mount";
    }
    let badgeStatus = "";
    try {
      const badgeResult = mountMessageHistoryBadges(contextRef, state);
      badgeStatus = badgeResult.status;
    } catch (err) {
      console.warn("Loom Keeper: mountMessageHistoryBadges failed", err);
      badgeStatus = "Badges failed to mount";
    }
    lastRenderStatus = [cardStatus, pawStatus, badgeStatus].filter(Boolean).join(" ");
    try {
      const diag = getMessageActionDiagnostics();
      if (diag.nativeToolbarButtonsMounted > 0 || diag.messageHistoryBadgesMounted > 0 || diag.portalToolbarsFound > 0) {
        lastRenderStatus += ` [msg-action: hosts=${diag.messageHostsFound}, assistantHosts=${diag.assistantMessageHostsFound}, badges=${diag.messageHistoryBadgesMounted}, nativeBtns=${diag.nativeToolbarButtonsMounted}, portal=${diag.portalToolbarsFound}, reason=${diag.lastMessageActionMountReason}]`;
      }
    } catch {
    }
    try {
      ensureFloatingButton(contextRef, state);
    } catch (err) {
      console.warn("Loom Keeper: ensureFloatingButton failed", err);
    }
    try {
      ensureChatLoomPanel(contextRef, state);
    } catch (err) {
      console.warn("Loom Keeper: ensureChatLoomPanel failed", err);
    }
  }
}
function rerender() {
  const before = uiStatus();
  paint(before);
  updateMessageCardStatus();
  renderTrackerPreviewOverlay();
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
function pulseSettingsSaved() {
  lastSettingsSavedAt = Date.now();
  if (settingsSavedTimer !== void 0 && typeof globalThis.clearTimeout === "function") {
    globalThis.clearTimeout(settingsSavedTimer);
  }
  if (typeof globalThis.setTimeout !== "function") return;
  settingsSavedTimer = globalThis.setTimeout(() => {
    settingsSavedTimer = void 0;
    lastSettingsSavedAt = void 0;
    paint(uiStatus());
  }, 1600);
}
function saveSettings(patch) {
  if (!contextRef) return;
  if (state) {
    state = { ...state, settings: { ...state.settings, ...patch } };
    pulseSettingsSaved();
    paint(uiStatus());
  }
  postToBackend(contextRef, { type: "save_settings", settings: patch });
}
function handleDrawerEvent(event) {
  const markedEvent = event;
  if (markedEvent.__sotlHandled) return;
  const target = event.target;
  if (event.type === "toggle") {
    const section = target?.closest?.("details[data-sotl-section]");
    if (section?.dataset.sotlSection) {
      setUiSectionOpen(section.dataset.sotlSection, section.open);
    }
    return;
  }
  if (!target || !contextRef) return;
  const actionButton = target.closest("[data-sotl-action]");
  if (actionButton) {
    markedEvent.__sotlHandled = true;
    const action = actionButton.dataset.sotlAction || "";
    if (action === "open-drawer") activateDrawer();
    if (action === "clear-focused-tracker") {
      clearFocusedTrackerRef();
      rerender();
      return;
    }
    if (action === "message-paw") {
      const messageId = actionButton.dataset.sotlMessageId;
      const actionSwipeId2 = datasetSwipeId(actionButton);
      openTrackerPreview(messageId, actionSwipeId2);
      return;
    }
    if (action === "close-tracker-preview") {
      closeTrackerPreview();
      return;
    }
    if (action === "preview-open-drawer") {
      if (trackerPreviewRef) {
        const resolved = resolveTrackerForMessageSwipe(state, trackerPreviewRef.messageId, trackerPreviewRef.swipeId);
        setFocusedTrackerRef({
          messageId: trackerPreviewRef.messageId,
          swipeId: resolved.swipeId,
          notice: resolved.notice
        });
        closeTrackerPreview();
        rerender();
        activateDrawer();
      }
      return;
    }
    if (action === "preview-copy-json") {
      if (trackerPreviewRef) {
        const resolved = resolveTrackerForMessageSwipe(state, trackerPreviewRef.messageId, trackerPreviewRef.swipeId);
        if (resolved.tracker) {
          const jsonText = JSON.stringify(resolved.tracker, null, 2);
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(jsonText).catch((err) => console.error("Failed to copy preview JSON:", err));
          }
        }
      }
      return;
    }
    if (action === "preview-regenerate") {
      if (state?.generation.running) {
        markGenerationStopping();
        postToBackend(contextRef, { type: "cancel_generation" });
        renderTrackerPreviewOverlay();
        rerender();
        return;
      }
      const messageId = actionButton.dataset.sotlMessageId || trackerPreviewRef?.messageId;
      const actionSwipeId2 = datasetSwipeId(actionButton) ?? trackerPreviewRef?.swipeId;
      markGenerationPending("Generating tracker for this message...");
      postToBackend(contextRef, { type: "generate_tracker", messageId, swipeId: actionSwipeId2 });
      renderTrackerPreviewOverlay();
      rerender();
      startBackendTimer();
      return;
    }
    if (action === "view-tracker") {
      const messageId = actionButton.dataset.sotlMessageId;
      const actionSwipeId2 = datasetSwipeId(actionButton);
      const resolved = resolveTrackerForMessageSwipe(state, messageId, actionSwipeId2);
      if (messageId) {
        setFocusedTrackerRef({
          messageId,
          swipeId: typeof actionSwipeId2 === "number" ? actionSwipeId2 : resolved.swipeId,
          notice: resolved.notice
        });
      }
      rerender();
      return;
    }
    if (action === "generate") {
      if (state?.generation.running) {
        markGenerationStopping();
        postToBackend(contextRef, { type: "cancel_generation" });
      } else {
        markGenerationPending("Generating tracker...");
        postToBackend(contextRef, { type: "generate_tracker" });
      }
      rerender();
      return;
    }
    if (action === "cancel-generation") {
      markGenerationStopping();
      postToBackend(contextRef, { type: "cancel_generation" });
      rerender();
      return;
    }
    if (action === "refresh") requestBackendState({ type: "refresh_state" });
    if (action === "reset-storage") {
      const confirmFn = typeof globalThis.confirm === "function" ? globalThis.confirm : null;
      if (confirmFn && !confirmFn("Reset Loom Keeper settings, presets, and trackers for this user?")) return;
      postToBackend(contextRef, { type: "reset_storage" });
      startBackendTimer();
    }
    const actionSwipeId = datasetSwipeId(actionButton);
    if (action.startsWith("regenerate:")) {
      if (state?.generation.running) {
        markGenerationStopping();
        postToBackend(contextRef, { type: "cancel_generation" });
      } else {
        markGenerationPending("Regenerating tracker...");
        postToBackend(contextRef, { type: "generate_tracker", messageId: action.slice("regenerate:".length), swipeId: actionSwipeId });
      }
      rerender();
    }
    if (action.startsWith("hide:") && state?.activeChat.id) postToBackend(contextRef, { type: "hide_tracker", chatId: state.activeChat.id, messageId: action.slice("hide:".length), swipeId: actionSwipeId, hidden: true });
    if (action.startsWith("delete:") && state?.activeChat.id) postToBackend(contextRef, { type: "delete_tracker", chatId: state.activeChat.id, messageId: action.slice("delete:".length), swipeId: actionSwipeId });
    if (action === "card-regenerate") {
      if (state?.generation.running) {
        markGenerationStopping();
        postToBackend(contextRef, { type: "cancel_generation" });
      } else {
        markGenerationPending("Regenerating tracker...");
        postToBackend(contextRef, { type: "generate_tracker", messageId: actionButton.dataset.sotlMessageId, swipeId: actionSwipeId });
      }
      rerender();
    }
    if (action === "card-edit") activateDrawer();
    if (action === "card-hide" && state?.activeChat.id) postToBackend(contextRef, { type: "hide_tracker", chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId, swipeId: actionSwipeId, hidden: true });
    if (action === "card-delete" && state?.activeChat.id) postToBackend(contextRef, { type: "delete_tracker", chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId, swipeId: actionSwipeId });
    const activeJsonTracker = resolveActiveJsonTracker();
    if (action === "save-json" && activeJsonTracker) {
      const doc = documentRef3();
      const textarea = doc?.querySelector('[data-sotl-field="latestJson"]');
      if (!textarea) return;
      try {
        const parsed = JSON.parse(textarea.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Tracker JSON must be an object.");
        postToBackend(contextRef, {
          type: "edit_tracker",
          tracker: {
            ...activeJsonTracker,
            data: parsed
          }
        });
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        const alertFn = typeof globalThis.alert === "function" ? globalThis.alert : null;
        alertFn?.(`Loom Keeper JSON edit failed: ${text}`);
      }
    }
    if (action === "copy-json" && activeJsonTracker) {
      const jsonText = JSON.stringify(activeJsonTracker.data, null, 2);
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
        version: LOOM_VERSION,
        description: "User custom continuity tracker.",
        mode: "hybrid",
        templateEngine: "handlebars_compat",
        sourceFormat: "loom",
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
      const doc = documentRef3();
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
      const doc = documentRef3();
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
      const doc = documentRef3();
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
        const { presets: valid, failures } = coerceImportedPresets(candidates);
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
          } else {
            candidates = [parsed];
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
        const { presets: valid, failures } = coerceImportedPresets(candidates);
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
  if (fieldName === "promptInjectionEnabled" && field instanceof HTMLInputElement) {
    saveSettings({ promptInjectionEnabled: field.checked });
  }
  if (fieldName === "promptInjectionMode" && field instanceof HTMLSelectElement) {
    const value = field.value;
    if (value === "latest_brief" || value === "latest_plus_history") saveSettings({ promptInjectionMode: value });
  }
  if (fieldName === "promptInjectionTokenBudget" && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ promptInjectionTokenBudget: val });
  }
  if (fieldName === "promptInjectionTrackerLimit" && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ promptInjectionTrackerLimit: val });
  }
  if (fieldName === "promptInjectionIncludeAppearance" && field instanceof HTMLInputElement) {
    saveSettings({ promptInjectionIncludeAppearance: field.checked });
  }
  if (fieldName === "promptInjectionIncludeRules" && field instanceof HTMLInputElement) {
    saveSettings({ promptInjectionIncludeRules: field.checked });
  }
  if (fieldName === "promptInjectionIncludeNextTurn" && field instanceof HTMLInputElement) {
    saveSettings({ promptInjectionIncludeNextTurn: field.checked });
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
    saveSettings({
      useSafeRenderer: field.checked,
      customTemplateMode: field.checked ? "safe_generic" : "trusted_layout"
    });
  }
  if (fieldName === "customTemplateMode" && field instanceof HTMLSelectElement) {
    const value = field.value;
    if (value === "trusted_layout" || value === "strict_sanitized" || value === "safe_generic") {
      saveSettings({ customTemplateMode: value, useSafeRenderer: false });
    }
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
  if (fieldName === "trackerGenerationHistoryLimit" && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ trackerGenerationHistoryLimit: val });
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
  if (message.type === "tracker_error") {
    lastToast = { level: "error", message: message.message };
    lastFrontendError = message.message;
  }
  if (message.type === "storage_reset") clearImportStatus();
  if (message.type === "settings_saved" && state) {
    state = { ...state, settings: message.settings };
    pulseSettingsSaved();
  }
  if (message.type === "error") lastFrontendError = message.message;
  if (message.type === "toast") lastToast = { level: message.level, message: message.message };
  if (state) {
    backendTimedOut = false;
    clearBackendTimer();
    syncFocusedTrackerSwipe(state.activeSwipeByMessageId);
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
        if (eventName === "MESSAGE_RENDERED" || eventName === "CHAT_CHANGED" || eventName === "CHAT_SWITCHED") {
          scheduleSwipeStateRefreshBurst();
        }
      });
      if (typeof unsubscribe === "function") cleanupFns.push(unsubscribe);
    } catch {
    }
  }
  for (const eventName of ["SWIPE_CHANGED", "MESSAGE_SWIPE_CHANGED", "CHAT_SWIPE_CHANGED", "SWIPE_SELECTED", "MESSAGE_VARIANT_CHANGED"]) {
    try {
      const unsubscribe = on(eventName, () => {
        scheduleSwipeStateRefreshBurst();
      });
      if (typeof unsubscribe === "function") cleanupFns.push(unsubscribe);
    } catch {
    }
  }
}
function setup(ctx) {
  contextRef = ctx;
  registerRerenderCallback(() => rerender());
  registerOpenDrawerCallback(() => activateHudTarget());
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
  documentRef3()?.addEventListener("click", handleDrawerEvent);
  documentRef3()?.addEventListener("change", handleDrawerEvent);
  documentRef3()?.addEventListener("toggle", handleDrawerEvent, true);
  const swipeClickHandler = (event) => {
    const target = event.target;
    if (target && looksLikeSwipeControl(target)) scheduleSwipeStateRefreshBurst();
  };
  documentRef3()?.addEventListener("click", swipeClickHandler, true);
  documentRef3()?.addEventListener("pointerup", swipeClickHandler, true);
  documentRef3()?.addEventListener("touchend", swipeClickHandler, true);
  cleanupFns.push(() => documentRef3()?.removeEventListener("click", swipeClickHandler, true));
  cleanupFns.push(() => documentRef3()?.removeEventListener("pointerup", swipeClickHandler, true));
  cleanupFns.push(() => documentRef3()?.removeEventListener("touchend", swipeClickHandler, true));
  const messageActionRefreshHandler = (event) => {
    const target = event.target;
    if (!target) return;
    rememberMessageActionTarget(target, state);
    if (target.closest('[id^="message-"], [data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message-actions], [data-lv-message-actions], .message-actions, .message-action-buttons, .lv-message-actions, [role="toolbar"], [role="menu"], .context-menu, .popover')) {
      scheduleMessageCardRetry();
    }
  };
  documentRef3()?.addEventListener("pointerover", messageActionRefreshHandler, true);
  documentRef3()?.addEventListener("focusin", messageActionRefreshHandler, true);
  documentRef3()?.addEventListener("pointerdown", messageActionRefreshHandler, true);
  documentRef3()?.addEventListener("contextmenu", messageActionRefreshHandler, true);
  documentRef3()?.addEventListener("touchstart", messageActionRefreshHandler, true);
  cleanupFns.push(() => documentRef3()?.removeEventListener("pointerover", messageActionRefreshHandler, true));
  cleanupFns.push(() => documentRef3()?.removeEventListener("focusin", messageActionRefreshHandler, true));
  cleanupFns.push(() => documentRef3()?.removeEventListener("pointerdown", messageActionRefreshHandler, true));
  cleanupFns.push(() => documentRef3()?.removeEventListener("contextmenu", messageActionRefreshHandler, true));
  cleanupFns.push(() => documentRef3()?.removeEventListener("touchstart", messageActionRefreshHandler, true));
  const doc = documentRef3();
  if (doc && typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver((records) => {
      if (Date.now() < ignoreMessageActionMutationsUntil) return;
      const messageActionChanged = records.some((record) => {
        const target = record.target instanceof HTMLElement ? record.target : null;
        return Boolean(target?.closest('[id^="message-"], [data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message-actions], [data-lv-message-actions], .message-actions, .message-action-buttons, .lv-message-actions, [role="toolbar"], [role="menu"], .context-menu, .popover'));
      });
      const swipeChanged = records.some((record) => {
        const target = record.target instanceof HTMLElement ? record.target : null;
        if (!target) return false;
        const text = target.textContent || "";
        const attrText = [
          target.className,
          target.getAttribute("aria-label"),
          target.getAttribute("title"),
          target.getAttribute("data-action"),
          target.getAttribute("data-lv-action")
        ].filter(Boolean).join(" ");
        return /\b\d+\s*\/\s*\d+\b/.test(text) || /\b(swipe|variant|alternate)\b/i.test(attrText);
      });
      const surfaceChanged = records.some((record) => {
        const target = record.target instanceof HTMLElement ? record.target : null;
        return Boolean(target?.closest('.sotl-root, .lumiverse-drawer, .drawer, [data-drawer], .settings-modal, [role="dialog"], [role="menu"], .popover, .context-menu, [data-route*="branch" i], [data-screen*="branch" i]'));
      });
      if (messageActionChanged || surfaceChanged) {
        scheduleMessageCardRetry();
      }
      if (swipeChanged) scheduleSwipeStateRefreshBurst();
    });
    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "aria-hidden", "data-state", "data-open"]
    });
    cleanupFns.push(() => observer.disconnect());
  }
  if (doc && typeof globalThis.setInterval === "function") {
    lastSwipeControlSignature = readSwipeControlSignature(doc);
    swipeDomPollTimer = globalThis.setInterval(() => {
      const currentDoc = documentRef3();
      if (!currentDoc) return;
      const nextSignature = readSwipeControlSignature(currentDoc);
      if (nextSignature && nextSignature !== lastSwipeControlSignature) {
        lastSwipeControlSignature = nextSignature;
        scheduleSwipeStateRefreshBurst();
      }
    }, 1e3);
    cleanupFns.push(() => {
      if (swipeDomPollTimer !== void 0 && typeof globalThis.clearInterval === "function") {
        globalThis.clearInterval(swipeDomPollTimer);
      }
      swipeDomPollTimer = void 0;
    });
  }
  postToBackend(ctx, { type: "ready" });
  startBackendTimer();
  rerender();
  return () => {
    documentRef3()?.removeEventListener("click", handleDrawerEvent);
    documentRef3()?.removeEventListener("change", handleDrawerEvent);
    documentRef3()?.removeEventListener("toggle", handleDrawerEvent, true);
    while (cleanupFns.length > 0) cleanupFns.pop()?.();
    drawerHandle?.destroy?.();
    settingsHandle?.destroy?.();
    clearBackendTimer();
    if (messageCardRetryTimer !== void 0 && typeof globalThis.clearTimeout === "function") globalThis.clearTimeout(messageCardRetryTimer);
    if (settingsSavedTimer !== void 0 && typeof globalThis.clearTimeout === "function") globalThis.clearTimeout(settingsSavedTimer);
    if (typeof globalThis.clearTimeout === "function") {
      for (const timer of swipeStateRefreshBurstTimers) globalThis.clearTimeout(timer);
    }
    swipeStateRefreshBurstTimers = [];
    fallbackRoot?.remove();
    documentRef3()?.querySelector('[data-sotl-dynamic-float="true"]')?.remove();
    documentRef3()?.querySelector(".sotl-chat-panel-container")?.remove();
    closeTrackerPreview();
    cleanupMessageTrackerActions();
    documentRef3()?.querySelectorAll('[data-sotl-mounted="true"]').forEach((node) => node.remove());
    if (swipeStateRefreshTimer !== void 0 && typeof globalThis.clearTimeout === "function") globalThis.clearTimeout(swipeStateRefreshTimer);
    rootListenerCleanups.clear();
  };
}
export {
  setup as default,
  setup
};
