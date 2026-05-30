// src/backend/injectionService.ts
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function asArray(value) {
  return Array.isArray(value) ? value : [];
}
function cleanText(value) {
  if (value === void 0 || value === null) return "";
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}
function clampText(value, max = 260) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trim()}...`;
}
function uniq(values) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const value of values) {
    const text = cleanText(value);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}
function readPath(source, path) {
  let current = source;
  for (const part of path) {
    const record = asRecord(current);
    if (!record || !(part in record)) return void 0;
    current = record[part];
  }
  return current;
}
function firstText(data, paths, max = 260) {
  for (const path of paths) {
    const value = clampText(readPath(data, path), max);
    if (value) return value;
  }
  return "";
}
function firstArray(data, paths) {
  for (const path of paths) {
    const value = asArray(readPath(data, path));
    if (value.length > 0) return value;
  }
  return [];
}
function itemText(value, preferredKeys = ["text", "fact", "note", "summary", "title", "name", "goal", "label"]) {
  const direct = cleanText(value);
  if (direct) return direct;
  const record = asRecord(value);
  if (!record) return "";
  for (const key of preferredKeys) {
    const text = clampText(record[key], 220);
    if (text) return text;
  }
  const parts = Object.entries(record).filter(([, entry]) => typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean").slice(0, 3).map(([key, entry]) => `${key}: ${cleanText(entry)}`).filter(Boolean);
  return clampText(parts.join("; "), 220);
}
function listItems(data, paths, limit, preferredKeys) {
  return firstArray(data, paths).map((item) => itemText(item, preferredKeys)).filter(Boolean).slice(0, limit);
}
function fieldList(data, paths, max = 220) {
  return paths.map(([label, candidates]) => {
    const value = firstText(data, candidates, max);
    return value ? `${label}: ${value}` : "";
  }).filter(Boolean);
}
function summarizeCharacter(value, includeAppearance = true) {
  const record = asRecord(value);
  if (!record) return clampText(value, 240);
  const identity = asRecord(record.identity) ?? {};
  const appearance = asRecord(record.appearance) ?? {};
  const clothing = asRecord(record.clothing) ?? {};
  const state = asRecord(record.state) ?? {};
  const name = cleanText(record.name ?? record.characterName ?? record.id) || "Unnamed";
  const role = cleanText(record.role ?? record.kind ?? record.relationshipToUser);
  const location = cleanText(record.location ?? state.location ?? record.presence);
  const visual = includeAppearance ? clampText(
    identity.fullDesc ?? appearance.fullDesc ?? appearance.summary ?? record.fullDesc ?? record.description ?? identity.anchor,
    260
  ) : "";
  const clothingSummary = includeAppearance ? clampText(clothing.summary ?? record.clothingSummary, 180) : "";
  const condition = uniq([
    cleanText(state.injury ?? record.injury ?? record.visibleCondition),
    cleanText(state.emotion ?? record.emotionalState ?? record.mood),
    cleanText(state.intent ?? record.intent ?? record.currentAction)
  ]).join("; ");
  const relations = clampText(record.relSummary ?? record.relationshipSummary ?? record.relationshipToUser, 180);
  const parts = [
    role ? `role ${role}` : "",
    location ? `at ${location}` : ""
  ].filter(Boolean).join(", ");
  return [
    `${name}${parts ? ` (${parts})` : ""}:`,
    visual,
    clothingSummary ? `Clothing: ${clothingSummary}.` : "",
    condition ? `State: ${condition}.` : "",
    relations ? `Relations: ${relations}.` : ""
  ].filter(Boolean).join(" ");
}
function summarizeRelationships(data) {
  const direct = listItems(data, [["relationships"]], 5, ["summary", "label", "status", "target"]);
  if (direct.length > 0) return direct;
  return firstArray(data, [["characters"], ["cast"]]).map((item) => {
    const record = asRecord(item);
    if (!record) return "";
    const name = cleanText(record.name ?? record.characterName ?? record.id);
    const rel = cleanText(record.relSummary ?? record.relationshipSummary ?? record.relationshipToUser);
    return name && rel ? `${name}: ${rel}` : "";
  }).filter(Boolean).slice(0, 5);
}
function addSection(output, title, lines, tokenBudget, truncated) {
  const cleanLines = uniq(lines).map((line) => clampText(line, 300)).filter(Boolean);
  if (cleanLines.length === 0) return;
  const header = output.length === 0 ? `## ${title}` : `
## ${title}`;
  const before = output.join("\n");
  const withHeader = `${before}${before ? "\n" : ""}${header}`;
  if (estimateTokens(withHeader) > tokenBudget) {
    truncated.value = true;
    return;
  }
  output.push(header);
  for (const line of cleanLines) {
    const candidate = [...output, `- ${line}`].join("\n");
    if (estimateTokens(candidate) > tokenBudget) {
      truncated.value = true;
      break;
    }
    output.push(`- ${line}`);
  }
}
function normalizeMode(value) {
  return value === "latest_brief" ? "latest_brief" : "latest_plus_history";
}
function numberSetting(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}
function estimateTokens(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return 0;
  return Math.max(1, Math.ceil(compact.length / 4));
}
function buildContinuityInjection(input) {
  const mode = normalizeMode(input.settings.promptInjectionMode);
  const tokenBudget = numberSetting(input.settings.promptInjectionTokenBudget, 700, 200, 2e3);
  const trackerLimit = numberSetting(input.settings.promptInjectionTrackerLimit, 5, 1, 10);
  const baseReport = {
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
    lastSkippedReason: input.skippedReason
  };
  if (!input.settings.promptInjectionEnabled) {
    return { content: "", report: { ...baseReport, lastSkippedReason: "Prompt injection is disabled." } };
  }
  const latest = input.latestTracker;
  if (!latest) {
    return { content: "", report: { ...baseReport, available: false, lastSkippedReason: "No tracker is available for this chat." } };
  }
  const data = latest.data || {};
  const output = [
    "STATE OF THE LOOM CONTINUITY BRIEF",
    "Use this as compact continuity reference for the next roleplay response. Do not mention the tracker. Do not reveal hidden facts or secrets unless the scene makes them discoverable."
  ];
  const truncated = { value: false };
  addSection(output, "Scene", fieldList(data, [
    ["Title", [["sceneIdentity", "title"], ["sceneTitle"], ["title"], ["topic"]]],
    ["Location", [["sceneIdentity", "location"], ["location"]]],
    ["Time", [["sceneIdentity", "time"], ["time"]]],
    ["Weather", [["sceneIdentity", "weather"], ["weather"]]],
    ["Mood", [["sceneIdentity", "mood"], ["mood"], ["tone"]]],
    ["Privacy", [["sceneIdentity", "privacy"], ["privacy"]]],
    ["Tension", [["sceneIdentity", "tension"], ["tension"]]]
  ], 180), tokenBudget, truncated);
  addSection(output, "What Changed", uniq([
    latest.compactSummary,
    firstText(data, [["narrativeDelta", "summary"], ["delta"], ["summary"]], 260),
    ...listItems(data, [["narrativeDelta", "whatChanged"], ["changes"]], 5, ["text", "summary", "age"]),
    ...listItems(data, [["narrativeDelta", "immediateConsequences"]], 4),
    ...listItems(data, [["narrativeDelta", "unresolvedBeats"], ["beats"]], 4)
  ]), tokenBudget, truncated);
  const characterSource = firstArray(data, [["characters"], ["cast"]]);
  addSection(
    output,
    "Characters",
    characterSource.slice(0, 6).map((item) => summarizeCharacter(item, input.settings.promptInjectionIncludeAppearance !== false)).filter(Boolean),
    tokenBudget,
    truncated
  );
  addSection(output, "Relationships", summarizeRelationships(data), tokenBudget, truncated);
  addSection(output, "World And Objects", uniq([
    ...listItems(data, [["worldState", "importantObjects"], ["items"]], 6, ["name", "summary", "condition", "location"]),
    ...listItems(data, [["worldState", "hazards"], ["hazards"], ["loaded"]], 5, ["thing", "hazard", "summary", "state"]),
    ...listItems(data, [["worldState", "activeThreads"], ["threads"]], 5, ["title", "summary", "label"]),
    ...listItems(data, [["space"]], 5)
  ]), tokenBudget, truncated);
  if (input.settings.promptInjectionIncludeRules !== false) {
    const rules = asRecord(readPath(data, ["rules"])) ?? {};
    addSection(output, "Continuity Rules", uniq([
      ...listItems(data, [["worldState", "loreFacts"], ["facts"]], 5, ["fact", "summary"]),
      ...asArray(rules.cant).map((item) => `Cannot: ${itemText(item)}`).filter(Boolean),
      ...asArray(rules.offscreen).map((item) => `Offscreen: ${itemText(item)}`).filter(Boolean),
      ...listItems(data, [["bans"]], 4).map((item) => `Avoid next: ${item}`),
      ...listItems(data, [["narrativeDelta", "continuityWarnings"], ["worldState", "continuityWarnings"], ["continuityWarnings"]], 5)
    ]), tokenBudget, truncated);
  }
  if (input.settings.promptInjectionIncludeNextTurn !== false) {
    addSection(output, "Next Turn Guidance", uniq([
      ...fieldList(data, [
        ["Likely focus", [["nextTurnGuidance", "likelyFocus"], ["focus", "next"]]],
        ["Fragile detail", [["nextTurnGuidance", "fragileDetails"]]],
        ["Risk", [["focus", "risk"]]]
      ], 220),
      ...listItems(data, [["nextTurnGuidance", "thingsNotToForget"]], 5),
      ...listItems(data, [["goals"]], 5, ["goal", "status", "note"]),
      ...listItems(data, [["countdowns"]], 4, ["title", "left"]),
      ...listItems(data, [["autonomy"]], 3, ["who", "action"])
    ]), tokenBudget, truncated);
  }
  const history = mode === "latest_plus_history" ? (input.trackers || []).filter((tracker) => tracker.generatedAt !== latest.generatedAt || tracker.messageId !== latest.messageId).slice(0, Math.max(0, trackerLimit)).map((tracker) => `${tracker.generatedAt}: ${tracker.compactSummary}`).filter(Boolean) : [];
  addSection(output, "Recent Tracker History", history, tokenBudget, truncated);
  if (truncated.value) {
    const candidate = [...output, "\nNote: Lower-priority tracker details were omitted to fit the injection token budget."].join("\n");
    if (estimateTokens(candidate) <= tokenBudget) output.push("\nNote: Lower-priority tracker details were omitted to fit the injection token budget.");
  }
  const content = output.join("\n").trim();
  const estimatedTokens = estimateTokens(content);
  const report = {
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
    preview: content.length > 900 ? `${content.slice(0, 900).trim()}...` : content
  };
  return { content, report };
}
function describeInjectionStatus(settings, permissions, registered = false) {
  if (!settings.promptInjectionEnabled) return "Prompt injection is off.";
  if (!permissions.generation) return "Prompt injection can run when generation support is available.";
  if (!permissions.interceptor && !registered) return "Prompt injection is enabled, but Lumiverse interceptor permission/support was not detected.";
  return registered ? "Prompt injection is active: the latest Loom is compressed into the live roleplay prompt." : "Prompt injection is configured and will activate when Lumiverse exposes interceptor support.";
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
var LOOM_VERSION = "1.0.20";
var LOOM_SCHEMA_VERSION = "1";
var GRAND_CONTINUITY_ATLAS_PRESET_ID = "grand_continuity_atlas";
var SLIM_SCENE_PRESET_ID = "slim_scene_loom";
var STORAGE_KEYS = {
  settings: "settings.json",
  presets: "presets.json",
  trackerStates: "tracker-states.json"
};
var now = "2026-01-01T00:00:00.000Z";
var defaultSettings = {
  enabled: true,
  activePresetId: GRAND_CONTINUITY_ATLAS_PRESET_ID,
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
  trackerHistoryLimit: 20,
  sidecarGenerationTimeoutMs: 18e4,
  useSafeRenderer: false,
  customTemplateMode: "trusted_layout",
  promptInjectionMode: "latest_plus_history",
  promptInjectionTrackerLimit: 5,
  promptInjectionTokenBudget: 700,
  trackerGenerationHistoryLimit: 5,
  promptInjectionIncludeAppearance: true,
  promptInjectionIncludeRules: true,
  promptInjectionIncludeNextTurn: true
};
var grandContinuityAtlasPreset = {
  id: GRAND_CONTINUITY_ATLAS_PRESET_ID,
  name: "Grand Continuity Atlas",
  version: "1.0.20",
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
  version: "1.0.20",
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
  const sample = JSON.stringify(input.preset.sampleData || {}, null, 2);
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
        "Sample JSON shape and naming conventions:",
        sample,
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
function makeCompactSummary(data) {
  const scene = String(getFallbackField(data, [
    "sceneIdentity.title",
    "sceneTitle",
    "location",
    "title",
    "name",
    "scene"
  ]) || "Current scene");
  const delta = String(getFallbackField(data, [
    "narrativeDelta.summary",
    "delta",
    "activeThread",
    "summary",
    "description"
  ]) || "").trim();
  return delta ? `${scene}: ${delta}` : scene;
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
function getPresetOrigin(preset) {
  if (isBuiltInPresetId(preset.id)) return "built-in";
  if (preset.origin && VALID_ORIGINS.has(preset.origin) && preset.origin !== "built-in") return preset.origin;
  return "custom";
}
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
function asString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
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
function validateNode(value, schema, path, issues) {
  const expected = schemaType(schema);
  let isTypeMatch = expected ? valueType(value) === expected : true;
  if (expected === "integer" && typeof value === "number" && Number.isInteger(value)) {
    isTypeMatch = true;
  }
  if (expected && !isTypeMatch) {
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
  const [chats, chatMutation, generation, appManipulation, interceptor] = await Promise.all([
    hasPermission(spindle2, "chats"),
    hasPermission(spindle2, "chat_mutation"),
    hasPermission(spindle2, "generation"),
    hasPermission(spindle2, "app_manipulation"),
    hasPermission(spindle2, "interceptor")
  ]);
  return {
    chats,
    chat_mutation: chatMutation,
    generation,
    interceptor,
    app_manipulation: appManipulation
  };
}
function asRecord2(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function asMessageArray(value) {
  const recordValue = asRecord2(value);
  const source = Array.isArray(value) ? value : Array.isArray(recordValue?.messages) ? recordValue.messages : Array.isArray(recordValue?.data) ? recordValue.data : [];
  return source.map((item, index) => {
    const record = asRecord2(item) ?? {};
    const swipes = Array.isArray(record.swipes) ? record.swipes.filter((swipe2) => typeof swipe2 === "string") : [];
    const swipeId = typeof record.swipe_id === "number" ? record.swipe_id : typeof record.swipeId === "number" ? record.swipeId : 0;
    const activeSwipe = typeof swipes[swipeId] === "string" ? swipes[swipeId] : void 0;
    const content = record.content ?? activeSwipe ?? record.text ?? record.message;
    const role = record.role ?? record.sender ?? record.type;
    const id = record.id ?? record.messageId ?? record.message_id ?? String(index);
    const metadata = asRecord2(record.metadata) ?? void 0;
    const swipe = record.swipeId ?? record.swipe_id ?? (swipes.length > 0 ? swipeId : void 0);
    const normalized = {
      id: typeof id === "string" || typeof id === "number" ? String(id) : String(index),
      role: typeof role === "string" ? role : void 0,
      content: typeof content === "string" ? content : ""
    };
    if (metadata) normalized.metadata = metadata;
    if (typeof swipe === "number") normalized.swipe_id = swipe;
    if (swipes.length > 0) normalized.swipes = swipes;
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
function registerPromptInterceptor(spindle2, handler, priority = 80) {
  if (typeof spindle2.registerInterceptor === "function") {
    try {
      const unsubscribe = spindle2.registerInterceptor(handler, priority);
      return typeof unsubscribe === "function" ? unsubscribe : void 0;
    } catch {
      return void 0;
    }
  }
  const interceptors = asRecord2(spindle2.interceptors) ?? {};
  const register = interceptors.register ?? interceptors.add ?? interceptors.use;
  if (typeof register !== "function") return void 0;
  try {
    const unsubscribe = register(handler, priority);
    return typeof unsubscribe === "function" ? unsubscribe : void 0;
  } catch {
    return void 0;
  }
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
  const chatsApi = asRecord2(spindle2.chats) ?? {};
  const legacyChatApi = asRecord2(spindle2.chat) ?? {};
  const active = await tryCall(chatsApi.getActive ?? chatsApi.getCurrent ?? chatsApi.active, [
    [{ userId }],
    [userId],
    []
  ]) ?? await tryCall(legacyChatApi.getActive ?? legacyChatApi.getCurrent ?? legacyChatApi.active, [
    [{ userId }],
    [userId],
    []
  ]);
  const activeRecord = asRecord2(active);
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
  const chatApi = asRecord2(spindle2.chat) ?? {};
  const chatsApi = asRecord2(spindle2.chats) ?? {};
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
  const connectionsApi = asRecord2(spindle2.connections) ?? {};
  const generationApi = asRecord2(spindle2.generate) ?? asRecord2(spindle2.generation) ?? {};
  const raw = await tryCall(
    connectionsApi.list ?? connectionsApi.getAll ?? generationApi.listConnectionProfiles ?? generationApi.getConnectionProfiles ?? generationApi.listConnections,
    [
      [{ userId }],
      [userId],
      []
    ]
  );
  const list = Array.isArray(raw) ? raw : Array.isArray(asRecord2(raw)?.profiles) ? asRecord2(raw)?.profiles : [];
  return list.map((item, index) => {
    const record = asRecord2(item) ?? {};
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
  const generationApi = asRecord2(spindle2.generate) ?? asRecord2(spindle2.generation) ?? {};
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
  const record = asRecord2(response);
  const content = record?.content ?? record?.text ?? record?.message ?? record?.output ?? record?.response ?? response;
  if (typeof content !== "string") throw new Error("Generation API did not return text content.");
  return content;
}
async function updateMessageContent(spindle2, chatId, messageId, content, userId) {
  const chatApi = asRecord2(spindle2.chat) ?? {};
  const chatsApi = asRecord2(spindle2.chats) ?? {};
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
var LoomGenerationFailure = class extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "LoomGenerationFailure";
    this.rawOutput = options.rawOutput;
    this.parseFailureCategory = options.parseFailureCategory;
  }
};
function classifyParseFailure(raw, message) {
  if (!raw || !raw.trim()) return "empty";
  if (/```/.test(raw)) return "fenced_markdown";
  if (/required field|schema/i.test(message)) return "schema_invalid";
  if (/json|object|brace|unexpected|closed/i.test(message)) return "invalid_json";
  return "unknown";
}
function withRequestedSwipe(message, requestedSwipeId, contentOverride) {
  if (typeof requestedSwipeId !== "number") {
    return contentOverride !== void 0 ? { ...message, content: contentOverride } : message;
  }
  const swipeContent = Array.isArray(message.swipes) && typeof message.swipes[requestedSwipeId] === "string" ? message.swipes[requestedSwipeId] : contentOverride;
  return {
    ...message,
    swipe_id: requestedSwipeId,
    content: swipeContent ?? message.content ?? ""
  };
}
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
  async findLatestAssistantTarget(userId, requestedChatId, requestedMessageId, requestedSwipeId) {
    const { chat, messages } = await getActiveChat(this.spindle, userId);
    const chatId = requestedChatId || chat.id;
    if (!chatId) return null;
    const assistantMessages = messages.filter((message) => {
      const role = (message.role || "").toLowerCase();
      return role === "assistant" || role === "model" || role === "ai" || !role && Boolean(message.content);
    });
    const selectedBase = requestedMessageId ? assistantMessages.find((message) => message.id === requestedMessageId) : assistantMessages[assistantMessages.length - 1];
    const selected = selectedBase ? withRequestedSwipe(selectedBase, requestedSwipeId) : void 0;
    if (!selected || !selected.content) return null;
    const contextMessages = messages.slice(Math.max(0, messages.length - 8));
    const context = contextMessages.map((message) => {
      const role = message.role || "message";
      return `${role}: ${message.content || ""}`;
    }).join("\n\n");
    return { chatId, message: selected, recentContext: context, recentContextMessageCount: contextMessages.length };
  }
  async findPayloadTarget(input) {
    if (!input.chatId) return null;
    const messages = await getChatMessages(this.spindle, input.chatId, input.userId);
    const selected = input.messageId ? messages.find((message2) => message2.id === input.messageId) : null;
    const message = withRequestedSwipe(selected ?? {
      id: input.messageId,
      role: "assistant",
      content: input.content || ""
    }, input.swipeId, input.content);
    if (!message.content) return null;
    const contextMessages = messages.length > 0 ? messages : [message];
    const recentMessages = contextMessages.slice(Math.max(0, contextMessages.length - 8));
    const recentContext = recentMessages.map((item) => {
      const role = item.role || "message";
      return `${role}: ${item.content || ""}`;
    }).join("\n\n");
    return { chatId: input.chatId, message, recentContext, recentContextMessageCount: recentMessages.length };
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
      cleanedContent: parse.cleanedContent,
      generationStartedAt: tracker.generatedAt,
      generationCompletedAt: tracker.generatedAt,
      elapsedMs: 0,
      timeoutMs: 0
    };
  }
  async generateSidecar(input) {
    const messageId = input.message.id || "latest";
    const key = `${input.chatId}:${messageId}:${input.message.swipe_id ?? "main"}`;
    if (this.runningKeys.has(key)) throw new Error("Generation already running for this message.");
    this.runningKeys.add(key);
    const startTime = Date.now();
    const generationStartedAt = new Date(startTime).toISOString();
    this.status = { running: true, message: "Generating tracker... 0s" };
    let elapsedTimer;
    let timeoutTimer;
    let timeoutMs = 18e4;
    try {
      const prompt = buildTrackerPrompt({
        preset: input.preset,
        latestAssistantMessage: input.message.content || "",
        previousTracker: input.previousTracker,
        previousSummaries: input.previousSummaries,
        recentContext: input.recentContext
      });
      timeoutMs = typeof input.settings.sidecarGenerationTimeoutMs === "number" ? input.settings.sidecarGenerationTimeoutMs : 18e4;
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
      let data;
      try {
        data = parseJsonObject(raw);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new LoomGenerationFailure(message, {
          rawOutput: raw,
          parseFailureCategory: classifyParseFailure(raw, message)
        });
      }
      const validation = validateAgainstSchema(data, input.preset.schemaJson);
      const generationCompletedAt = (/* @__PURE__ */ new Date()).toISOString();
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
      return {
        tracker,
        generationStartedAt,
        generationCompletedAt,
        elapsedMs: Date.now() - startTime,
        timeoutMs
      };
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
function withBuiltInOrigin(preset) {
  return { ...preset, origin: "built-in" };
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
    const custom = Array.isArray(stored) ? stored.filter(isPreset).map((preset) => this.normalizeCustomPreset(preset)) : [];
    const customIds = new Set(custom.map((preset) => preset.id));
    return [
      ...builtInPresets.filter((preset) => !customIds.has(preset.id)).map(withBuiltInOrigin),
      ...custom
    ];
  }
  async resolve(userId, presetId) {
    const presets = await this.loadAll(userId);
    return presets.find((preset) => preset.id === presetId) ?? presets.find((preset) => preset.id === GRAND_CONTINUITY_ATLAS_PRESET_ID) ?? builtInPresets[0];
  }
  async reset(userId) {
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.presets, userId, []);
    return this.loadAll(userId);
  }
  async save(userId, preset) {
    const normalized = this.normalizeCustomPreset(preset);
    const stored = await getJsonWithRecovery(
      this.spindle,
      STORAGE_KEYS.presets,
      userId,
      [],
      this.onStorageWarning
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
  normalizeCustomPreset(preset) {
    const normalized = normalizePreset(preset);
    let id = normalizePresetId(normalized.id);
    if (isBuiltInPresetId(id)) id = `${id}_custom`;
    return {
      ...normalized,
      id,
      origin: getPresetOrigin({ ...normalized, id })
    };
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
    if (next.customTemplateMode !== "trusted_layout" && next.customTemplateMode !== "strict_sanitized" && next.customTemplateMode !== "safe_generic") {
      next.customTemplateMode = defaultSettings.customTemplateMode;
    }
    if (next.useSafeRenderer) next.customTemplateMode = "safe_generic";
    if (next.promptInjectionMode !== "latest_brief" && next.promptInjectionMode !== "latest_plus_history") {
      next.promptInjectionMode = defaultSettings.promptInjectionMode;
    }
    const injectionTrackerLimit = Number(next.promptInjectionTrackerLimit);
    next.promptInjectionTrackerLimit = Number.isFinite(injectionTrackerLimit) ? Math.max(1, Math.min(10, Math.round(injectionTrackerLimit))) : defaultSettings.promptInjectionTrackerLimit;
    const injectionBudget = Number(next.promptInjectionTokenBudget);
    next.promptInjectionTokenBudget = Number.isFinite(injectionBudget) ? Math.max(200, Math.min(2e3, Math.round(injectionBudget))) : defaultSettings.promptInjectionTokenBudget;
    const generationHistoryLimit = Number(next.trackerGenerationHistoryLimit);
    next.trackerGenerationHistoryLimit = Number.isFinite(generationHistoryLimit) ? Math.max(0, Math.min(10, Math.round(generationHistoryLimit))) : defaultSettings.trackerGenerationHistoryLimit;
    next.promptInjectionIncludeAppearance = next.promptInjectionIncludeAppearance !== false;
    next.promptInjectionIncludeRules = next.promptInjectionIncludeRules !== false;
    next.promptInjectionIncludeNextTurn = next.promptInjectionIncludeNextTurn !== false;
    return next;
  }
};

// src/backend/simulationService.ts
function getSimulationMilestoneStatus() {
  return "Simulation modules are intentionally deferred until Milestone 2.";
}

// src/backend/trackerStateService.ts
function isRecord2(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function makeMessageKey(messageId, swipeId) {
  const base = messageId || "latest";
  return typeof swipeId === "number" ? `${base}::swipe:${swipeId}` : base;
}
function sameMessage(tracker, messageId) {
  return (tracker.messageId || "latest") === (messageId || "latest");
}
function newestTracker(trackers) {
  return trackers.filter((tracker) => tracker.version === LOOM_VERSION).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
}
function normalizeIndex(value) {
  if (!isRecord2(value)) return {};
  const index = {};
  for (const [chatId, chatValue] of Object.entries(value)) {
    if (!isRecord2(chatValue)) continue;
    const messages = isRecord2(chatValue.messages) ? chatValue.messages : {};
    const latest = isRecord2(chatValue.latest) ? chatValue.latest : void 0;
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
  async getLatestForActive(userId, chatId, messageId, swipeId) {
    if (!chatId) return null;
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return null;
    if (messageId) {
      if (typeof swipeId === "number") {
        const exact = chat.messages[makeMessageKey(messageId, swipeId)];
        if (exact?.version === LOOM_VERSION) return exact;
        const sameMessageTrackers = Object.values(chat.messages).filter((tracker) => sameMessage(tracker, messageId));
        const hasSwipeAwareTracker = sameMessageTrackers.some((tracker) => typeof tracker.swipeId === "number");
        if (hasSwipeAwareTracker) return null;
      }
      const matching = newestTracker(Object.values(chat.messages).filter((tracker) => sameMessage(tracker, messageId)));
      if (matching) return matching;
    }
    if (chat.latest?.version === LOOM_VERSION) return chat.latest;
    return newestTracker(Object.values(chat.messages)) ?? null;
  }
  async listForChat(userId, chatId) {
    if (!chatId) return [];
    const index = await this.loadIndex(userId);
    return Object.values(index[chatId]?.messages ?? {}).filter((tracker) => tracker.version === LOOM_VERSION).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
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
  async pruneChatHistory(userId, chatId, limit, protectedMessageId) {
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
      if (protectedMessageId) {
        for (const [key, tracker] of Object.entries(existing.messages)) {
          if (sameMessage(tracker, protectedMessageId)) keptKeys.add(key);
        }
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
  async pruneInactiveSwipeAlternatives(userId, chatId, activeSwipeByMessageId2, protectedMessageId) {
    if (!chatId) return { removedCount: 0, keptCount: 0 };
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return { removedCount: 0, keptCount: 0 };
    const groups = /* @__PURE__ */ new Map();
    for (const [key, tracker] of Object.entries(chat.messages)) {
      if (!tracker.messageId || tracker.version !== LOOM_VERSION) continue;
      const group = groups.get(tracker.messageId) ?? [];
      group.push({ key, tracker });
      groups.set(tracker.messageId, group);
    }
    const keptKeys = /* @__PURE__ */ new Set();
    let removedCount = 0;
    let warning;
    for (const [messageId, items] of groups) {
      if (items.length <= 1) {
        keptKeys.add(items[0].key);
        continue;
      }
      if (messageId === protectedMessageId) {
        for (const item of items) keptKeys.add(item.key);
        continue;
      }
      const activeSwipe = activeSwipeByMessageId2[messageId];
      const exact = typeof activeSwipe === "number" ? items.find((item) => item.tracker.swipeId === activeSwipe) : void 0;
      const keeper = exact ?? items.sort((a, b) => b.tracker.generatedAt.localeCompare(a.tracker.generatedAt))[0];
      if (!exact) {
        warning = warning || `Active swipe could not be determined for message ${messageId}; kept newest tracker.`;
      }
      keptKeys.add(keeper.key);
      removedCount += items.filter((item) => item.key !== keeper.key).length;
    }
    if (removedCount === 0) {
      return { removedCount: 0, keptCount: Object.keys(chat.messages).length, warning };
    }
    const nextMessages = {};
    for (const [key, tracker] of Object.entries(chat.messages)) {
      const grouped = tracker.messageId ? groups.get(tracker.messageId) : void 0;
      if (!grouped || grouped.length <= 1 || keptKeys.has(key)) {
        nextMessages[key] = tracker;
      }
    }
    chat.messages = nextMessages;
    if (chat.latest) {
      const latestKey = makeMessageKey(chat.latest.messageId, chat.latest.swipeId);
      if (!chat.messages[latestKey]) {
        const nextLatest = newestTracker(Object.values(chat.messages));
        if (nextLatest) chat.latest = nextLatest;
        else delete chat.latest;
      }
    }
    index[chatId] = chat;
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
    return { removedCount, keptCount: Object.keys(chat.messages).length, warning };
  }
  async delete(userId, chatId, messageId, swipeId) {
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return;
    if (messageId) {
      if (typeof swipeId === "number") {
        delete chat.messages[makeMessageKey(messageId, swipeId)];
      } else {
        for (const [key, tracker] of Object.entries(chat.messages)) {
          if (sameMessage(tracker, messageId)) delete chat.messages[key];
        }
      }
      if (chat.latest?.messageId === messageId && (typeof swipeId !== "number" || chat.latest.swipeId === swipeId)) {
        const nextLatest = newestTracker(Object.values(chat.messages));
        if (nextLatest) chat.latest = nextLatest;
        else delete chat.latest;
      }
    } else {
      delete index[chatId];
    }
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
  }
  async setHidden(userId, chatId, messageId, swipeId, hidden) {
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return null;
    const key = makeMessageKey(messageId, swipeId);
    const tracker = messageId ? typeof swipeId === "number" ? chat.messages[key] : newestTracker(Object.values(chat.messages).filter((candidate) => sameMessage(candidate, messageId))) : chat.latest;
    if (!tracker) return null;
    const updated = { ...tracker, hidden, placement: hidden ? "hidden" : tracker.placement };
    const updatedKey = makeMessageKey(updated.messageId, updated.swipeId);
    if (messageId) chat.messages[updatedKey] = updated;
    if (!messageId || chat.latest?.messageId === updated.messageId && chat.latest?.swipeId === updated.swipeId) chat.latest = updated;
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
    return updated;
  }
  async reset(userId) {
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, {});
  }
};

// src/backend/backend.ts
function isRecord3(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isFrontendMessage(value) {
  return isRecord3(value) && typeof value.type === "string";
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
function previewRawOutput(value) {
  if (!value) return void 0;
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 700 ? `${compact.slice(0, 700)}...` : compact;
}
function activeSwipeByMessageId(messages) {
  const map = {};
  for (const message of messages) {
    if (message.id && typeof message.swipe_id === "number") {
      map[message.id] = message.swipe_id;
    }
  }
  return map;
}
function latestAssistantMessage(messages) {
  return [...messages].reverse().find(isAssistantMessage);
}
function countSwipeAlternatives(trackers) {
  const grouped = /* @__PURE__ */ new Map();
  let stored = 0;
  for (const tracker of trackers) {
    if (!tracker.messageId || typeof tracker.swipeId !== "number") continue;
    stored += 1;
    grouped.set(tracker.messageId, (grouped.get(tracker.messageId) ?? 0) + 1);
  }
  let alternatives = 0;
  for (const count of grouped.values()) {
    if (count > 1) alternatives += count - 1;
  }
  return { stored, alternatives };
}
function activeSwipeTrackers(trackers, swipeMap) {
  const grouped = /* @__PURE__ */ new Map();
  const passthrough = [];
  for (const tracker of trackers) {
    if (!tracker.messageId) {
      passthrough.push(tracker);
      continue;
    }
    const group = grouped.get(tracker.messageId) ?? [];
    group.push(tracker);
    grouped.set(tracker.messageId, group);
  }
  for (const [messageId, group] of grouped) {
    const activeSwipe = swipeMap[messageId];
    const chosen = typeof activeSwipe === "number" ? group.find((tracker) => tracker.swipeId === activeSwipe) : void 0;
    const newest = group.slice().sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
    const active = chosen ?? newest;
    if (active) passthrough.push(active);
  }
  return passthrough.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}
var StateOfTheLoomBackend = class {
  constructor(spindle2) {
    this.spindle = spindle2;
    this.knownUsers = /* @__PURE__ */ new Set();
    this.chatUsers = /* @__PURE__ */ new Map();
    this.lastFrontendUserId = null;
    this.reportedUnknownGenerationUser = false;
    this.interceptorRegistered = false;
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
    const unregisterInterceptor = registerPromptInterceptor(this.spindle, async (messages, context) => {
      return this.handlePromptInjection(messages, context);
    }, 80);
    this.interceptorRegistered = typeof unregisterInterceptor === "function" || typeof this.spindle.registerInterceptor === "function" || Boolean(this.spindle.interceptors?.register);
    if (!this.interceptorRegistered) {
      this.diagnostics = {
        ...this.diagnostics,
        injectionReport: {
          enabled: false,
          registered: false,
          available: false,
          mode: "latest_plus_history",
          trackerCount: 0,
          historyCount: 0,
          estimatedTokens: 0,
          tokenBudget: 700,
          truncated: false,
          lastSkippedReason: "Lumiverse interceptor API was not detected in this runtime."
        }
      };
    }
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
  async handlePromptInjection(messages, context) {
    try {
      const source = context?.source ?? context?.extensionId ?? context?.extension_id;
      const generationType = context?.generationType ?? context?.generation_type;
      const internal = context?.internal;
      if (source === "state_of_the_loom" || generationType === "quiet" || internal === true) return messages;
      const looksLikeTrackerSidecar = messages.some((message) => {
        const content2 = typeof message.content === "string" ? message.content : "";
        return content2.includes("Latest assistant message to track:") && content2.includes("Return JSON only. No markdown.");
      });
      if (looksLikeTrackerSidecar) return messages;
      let chatId = this.payloadString(context?.chatId ?? context?.chat_id ?? context?.conversationId ?? context?.conversation_id);
      const contextUserId = this.payloadString(context?.userId ?? context?.user_id);
      const userId = contextUserId ?? this.resolveUserForEvent(context ?? {}, chatId) ?? this.lastFrontendUserId;
      if (!userId) return messages;
      if (!chatId) {
        const active = await getActiveChat(this.spindle, userId).catch(() => null);
        chatId = active?.chat.id ?? null;
      }
      if (!chatId) {
        this.diagnostics = {
          ...this.diagnostics,
          injectionReport: {
            enabled: false,
            registered: this.interceptorRegistered,
            available: false,
            mode: "latest_plus_history",
            trackerCount: 0,
            historyCount: 0,
            estimatedTokens: 0,
            tokenBudget: 700,
            truncated: false,
            lastSkippedReason: "Skipped prompt injection because no active chat id was available."
          }
        };
        return messages;
      }
      const settings = await this.settingsService.load(userId);
      const activeForInjection = await getActiveChat(this.spindle, userId).catch(() => null);
      const activeInjectionMessage = activeForInjection?.chat.id === chatId ? latestAssistantMessage(activeForInjection.messages) : void 0;
      const injectionSwipeMap = activeForInjection?.chat.id === chatId ? activeSwipeByMessageId(activeForInjection.messages) : {};
      const latestTracker = await this.trackerService.getLatestForActive(
        userId,
        chatId,
        activeInjectionMessage?.id,
        activeInjectionMessage?.swipe_id
      ).catch(() => null);
      const trackers = activeSwipeTrackers(await this.trackerService.listForChat(userId, chatId).catch(() => []), injectionSwipeMap);
      const { content, report } = buildContinuityInjection({
        settings,
        latestTracker,
        trackers,
        registered: this.interceptorRegistered,
        injectedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      report.latestTrackerAvailable = Boolean(latestTracker);
      report.activeMessageId = activeInjectionMessage?.id;
      report.activeSwipeId = activeInjectionMessage?.swipe_id;
      report.activeSwipeTrackerUsed = Boolean(
        latestTracker && activeInjectionMessage?.id && latestTracker.messageId === activeInjectionMessage.id && (typeof activeInjectionMessage.swipe_id !== "number" || latestTracker.swipeId === activeInjectionMessage.swipe_id)
      );
      report.wrongSwipeFallbackAvoided = Boolean(
        activeInjectionMessage?.id && typeof activeInjectionMessage.swipe_id === "number" && !latestTracker && trackers.some((tracker) => tracker.messageId === activeInjectionMessage.id && typeof tracker.swipeId === "number")
      );
      report.contextDepthSetting = settings.promptInjectionTrackerLimit ?? 5;
      report.storageRetentionSetting = settings.trackerHistoryLimit;
      report.historyCompactOnly = true;
      this.diagnostics = {
        ...this.diagnostics,
        injectionReport: report
      };
      if (!content) return messages;
      const injectionMessage = {
        role: "system",
        content,
        source: "state_of_the_loom"
      };
      const firstNonSystem = messages.findIndex((message) => String(message.role || "").toLowerCase() !== "system");
      if (firstNonSystem <= 0) return [injectionMessage, ...messages];
      return [
        ...messages.slice(0, firstNonSystem),
        injectionMessage,
        ...messages.slice(firstNonSystem)
      ];
    } catch (error) {
      this.recordRuntimeError("Prompt injection failed", error);
      return messages;
    }
  }
  async buildState(userId) {
    let [settings, permissions] = await Promise.all([
      this.settingsService.load(userId),
      getPermissionState(this.spindle).catch((error) => {
        this.recordRuntimeError("Permission lookup failed", error);
        return { chats: false, chat_mutation: false, generation: false, app_manipulation: false };
      })
    ]);
    const presets = await this.presetService.loadAll(userId);
    const activePreset = await this.presetService.resolve(userId, settings.activePresetId);
    if (activePreset.id !== settings.activePresetId) {
      settings = await this.settingsService.save(userId, { activePresetId: activePreset.id });
    }
    const active = permissions.chats ? await getActiveChat(this.spindle, userId).catch((error) => {
      this.recordRuntimeError("Active chat lookup failed", error);
      return { chat: { id: null, name: "Active chat unavailable" }, messages: [] };
    }) : { chat: { id: null, name: "Chat permission missing" }, messages: [] };
    const activeChat = {
      id: active.chat.id,
      name: activeChatName(active.chat.id, active.chat.name)
    };
    if (activeChat.id) this.rememberUser(userId, activeChat.id);
    const activeSwipeMap = activeSwipeByMessageId(active.messages);
    const activeAssistant = latestAssistantMessage(active.messages);
    const connections = await this.generationService.listConnections(userId, permissions).catch((error) => {
      this.recordRuntimeError("Connection profile lookup failed", error);
      return [];
    });
    const [latestTracker, messageTrackers] = await Promise.all([
      this.trackerService.getLatestForActive(userId, activeChat.id, activeAssistant?.id, activeAssistant?.swipe_id).catch((error) => {
        this.recordRuntimeError("Latest tracker lookup failed", error);
        return null;
      }),
      this.trackerService.listForChat(userId, activeChat.id).catch((error) => {
        this.recordRuntimeError("Message tracker lookup failed", error);
        return [];
      })
    ]);
    const activeMessageTrackers = activeSwipeTrackers(messageTrackers, activeSwipeMap);
    const injectionPreview = buildContinuityInjection({
      settings,
      latestTracker,
      trackers: activeMessageTrackers,
      registered: this.interceptorRegistered,
      skippedReason: this.interceptorRegistered ? void 0 : "Lumiverse interceptor API was not detected in this runtime."
    }).report;
    injectionPreview.latestTrackerAvailable = Boolean(latestTracker);
    injectionPreview.activeMessageId = activeAssistant?.id;
    injectionPreview.activeSwipeId = activeAssistant?.swipe_id;
    injectionPreview.activeSwipeTrackerUsed = Boolean(
      latestTracker && activeAssistant?.id && latestTracker.messageId === activeAssistant.id && (typeof activeAssistant.swipe_id !== "number" || latestTracker.swipeId === activeAssistant.swipe_id)
    );
    injectionPreview.wrongSwipeFallbackAvoided = Boolean(
      activeAssistant?.id && typeof activeAssistant.swipe_id === "number" && !latestTracker && messageTrackers.some((tracker) => tracker.messageId === activeAssistant.id && typeof tracker.swipeId === "number")
    );
    injectionPreview.contextDepthSetting = settings.promptInjectionTrackerLimit ?? 5;
    injectionPreview.storageRetentionSetting = settings.trackerHistoryLimit;
    injectionPreview.historyCompactOnly = true;
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
      const activeSwipe = latestTracker.messageId ? activeSwipeMap[latestTracker.messageId] : void 0;
      if (trackedMsgIndex === -1) {
        isStale = true;
      } else if (typeof activeSwipe === "number" && latestTracker.swipeId !== activeSwipe) {
        isStale = true;
      } else if (trackedMsgIndex < active.messages.length - 1) {
        isStale = true;
      }
    }
    const swipeCounts = countSwipeAlternatives(messageTrackers);
    const previousSwipeReport = this.diagnostics.swipeReport;
    const swipeReport = {
      activeMessageId: activeAssistant?.id,
      activeSwipeId: activeAssistant?.swipe_id,
      activeSwipeByMessageId: activeSwipeMap,
      storedSwipeTrackerCount: swipeCounts.stored,
      alternativeSwipeTrackerCount: swipeCounts.alternatives,
      cleanupLastRunAt: previousSwipeReport?.cleanupLastRunAt,
      cleanupRemovedCount: previousSwipeReport?.cleanupRemovedCount,
      cleanupKeptCount: previousSwipeReport?.cleanupKeptCount,
      cleanupWarning: previousSwipeReport?.cleanupWarning
    };
    const diagnostics = {
      ...this.diagnostics,
      backendReady: true,
      lastParserError: this.diagnostics.lastParserError,
      lastGenerationError: this.diagnostics.lastGenerationError,
      storageWarning: this.diagnostics.storageWarning,
      lastRenderStatus: isStale ? latestTracker?.messageId && typeof activeSwipeMap[latestTracker.messageId] === "number" && latestTracker.swipeId !== activeSwipeMap[latestTracker.messageId] ? "Current Loom state is Stale (active swipe changed)." : "Current Loom state is Stale (new user or assistant messages have been added)." : this.diagnostics.lastRenderStatus,
      swipeReport
    };
    const simulationNote = getSimulationMilestoneStatus();
    const entityNote = getEntityCaptureMilestoneStatus();
    const companionNote = getCompanionMilestoneStatus();
    const injectionNote = describeInjectionStatus(settings, permissions, this.interceptorRegistered);
    const lastInjectionReport = this.diagnostics.injectionReport;
    diagnostics.injectionReport = lastInjectionReport?.injectedAt && lastInjectionReport.chatId === activeChat.id ? {
      ...injectionPreview,
      injectedAt: lastInjectionReport.injectedAt,
      lastSkippedReason: lastInjectionReport.lastSkippedReason,
      registered: this.interceptorRegistered
    } : injectionPreview;
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
      activeSwipeByMessageId: activeSwipeMap,
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
        const activeAssistant = active ? latestAssistantMessage(active.messages) : void 0;
        if (activeChatId && settings.trackerHistoryLimit > 0) {
          await this.trackerService.pruneChatHistory(userId, activeChatId, settings.trackerHistoryLimit, activeAssistant?.id);
        }
        await this.send(userId, { type: "settings_saved", settings });
        await this.send(userId, { type: "state", state: await this.buildState(userId) });
        return;
      }
      if (message.type === "select_preset") {
        const settings = await this.settingsService.save(userId, { activePresetId: message.presetId });
        const active = await getActiveChat(this.spindle, userId).catch(() => null);
        const activeChatId = active?.chat?.id;
        const activeAssistant = active ? latestAssistantMessage(active.messages) : void 0;
        if (activeChatId && settings.trackerHistoryLimit > 0) {
          await this.trackerService.pruneChatHistory(userId, activeChatId, settings.trackerHistoryLimit, activeAssistant?.id);
        }
        await this.send(userId, { type: "settings_saved", settings });
        await this.send(userId, { type: "state", state: await this.buildState(userId) });
        return;
      }
      if (message.type === "generate_tracker") {
        await this.generateTrackerForUser(userId, message.chatId, message.messageId, message.swipeId);
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
        await this.trackerService.delete(userId, message.chatId, message.messageId, message.swipeId);
        await this.send(userId, { type: "tracker_deleted", state: await this.buildState(userId) });
        return;
      }
      if (message.type === "hide_tracker") {
        const tracker = await this.trackerService.setHidden(userId, message.chatId, message.messageId, message.swipeId, message.hidden);
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
        const savedPreset = await this.presetService.save(userId, message.preset);
        if (message.makeActive) {
          await this.settingsService.save(userId, { activePresetId: savedPreset.id });
        }
        const state = await this.buildState(userId);
        await this.send(userId, { type: "state", state });
        await this.send(userId, { type: "toast", level: "success", message: `Template '${savedPreset.name}' saved.` });
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
  async generateTrackerForUser(userId, chatId, messageId, swipeId, targetOverride) {
    try {
      const state = await this.buildState(userId);
      const target = targetOverride ?? await this.generationService.findLatestAssistantTarget(userId, chatId, messageId, swipeId);
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
      const recentTrackers = activeSwipeTrackers(
        await this.trackerService.listForChat(userId, target.chatId),
        state.activeSwipeByMessageId
      );
      const generationHistoryLimit = settings.trackerGenerationHistoryLimit ?? 5;
      const previousSummaries = recentTrackers.slice(1, 1 + Math.max(0, generationHistoryLimit)).map((t) => `${t.generatedAt}: ${t.compactSummary}`);
      const previousFullTrackerIncluded = Boolean(state.latestTracker);
      const estimatedSidecarPromptTokens = estimateTokens([
        preset.promptInstructions,
        JSON.stringify(preset.schemaJson),
        state.latestTracker ? JSON.stringify(state.latestTracker.data) : "",
        previousSummaries.join("\n"),
        target.recentContext,
        target.message.content || ""
      ].join("\n"));
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
      await this.trackerService.save(userId, result.tracker, 0);
      const cleanup = await this.cleanupSwipeAlternatives(
        userId,
        target.chatId,
        settings.trackerHistoryLimit,
        target.message.id
      );
      const retainedTrackers = await this.trackerService.listForChat(userId, target.chatId).catch(() => recentTrackers);
      await this.generationService.stripPassiveBlockIfAllowed({
        permissions: state.permissions,
        settings,
        userId,
        chatId: target.chatId,
        messageId: target.message.id,
        cleanedContent: result.cleanedContent
      });
      const presetSource = getPresetOrigin(preset);
      const completedAt = result.generationCompletedAt ?? result.tracker.generatedAt;
      const report = {
        activePresetId: preset.id,
        presetName: preset.name,
        presetSource,
        timestamp: completedAt,
        generationStartedAt: result.generationStartedAt ?? result.tracker.generatedAt,
        generationCompletedAt: completedAt,
        elapsedMs: result.elapsedMs,
        timeoutMs: result.timeoutMs ?? settings.sidecarGenerationTimeoutMs ?? 18e4,
        previousFullTrackerIncluded,
        previousFullTrackerMessageId: state.latestTracker?.messageId,
        previousFullTrackerSwipeId: state.latestTracker?.swipeId,
        recentTrackerSummariesIncluded: previousSummaries.length,
        recentTrackerSummariesCompactOnly: true,
        recentChatContextIncluded: Boolean(target.recentContext),
        recentChatContextMessageCount: target.recentContextMessageCount,
        estimatedSidecarPromptTokens,
        worldInfoIncluded: false,
        worldInfoStatus: "Not included: no stable Lumiverse world info/lorebook context API was detected in this runtime.",
        storageRetentionLimit: settings.trackerHistoryLimit,
        trackerGenerationHistoryLimit: generationHistoryLimit,
        promptInjectionTrackerLimit: settings.promptInjectionTrackerLimit ?? 5,
        rawResponseAvailable: Boolean(result.tracker.rawOutput),
        rawResponsePreview: previewRawOutput(result.tracker.rawOutput),
        parseSuccess: true,
        schemaValidationSuccess: result.tracker.validation.ok,
        schemaValidationIssues: result.tracker.validation.issues,
        renderSuccess: true,
        // Will be updated dynamically on frontend
        sanitizerRemovedContent: false,
        // Will be updated dynamically on frontend
        templateMode: settings.useSafeRenderer ? "safe_generic" : settings.customTemplateMode || "trusted_layout",
        preservedData: false,
        fallbackUsed: false,
        // Will be updated dynamically on frontend
        trackerPresetId: result.tracker.presetId,
        messageId: target.message.id || "latest",
        swipeId: result.tracker.swipeId,
        chatId: target.chatId,
        hudView: settings.hudDefaultView,
        retainedCount: retainedTrackers.length
      };
      const valError = result.tracker.validation.issues.filter((i) => i.severity === "error").map((i) => i.message).join(", ");
      if (valError) {
        report.schemaValidationError = valError;
      }
      this.diagnostics = {
        ...this.diagnostics,
        lastParserError: void 0,
        lastGenerationError: void 0,
        pipelineReport: report,
        swipeReport: {
          activeMessageId: cleanup.activeMessageId,
          activeSwipeId: cleanup.activeSwipeId,
          activeSwipeByMessageId: cleanup.activeSwipeByMessageId,
          storedSwipeTrackerCount: countSwipeAlternatives(retainedTrackers).stored,
          alternativeSwipeTrackerCount: countSwipeAlternatives(retainedTrackers).alternatives,
          cleanupLastRunAt: cleanup.cleanupLastRunAt,
          cleanupRemovedCount: cleanup.cleanupRemovedCount,
          cleanupKeptCount: cleanup.cleanupKeptCount,
          cleanupWarning: cleanup.cleanupWarning
        }
      };
      await this.send(userId, { type: "tracker_generated", tracker: result.tracker, state: await this.buildState(userId) });
    } catch (error) {
      this.generationService.clearStuckState();
      const message = error instanceof Error ? error.message : String(error);
      this.diagnostics = {
        ...this.diagnostics,
        lastGenerationError: message
      };
      try {
        const state = await this.buildState(userId);
        const preset = state.activePreset;
        const presetSource = getPresetOrigin(preset);
        const recentTrackers = chatId ? await this.trackerService.listForChat(userId, chatId).catch(() => []) : [];
        const generationFailure = error instanceof LoomGenerationFailure ? error : null;
        const rawOutput = generationFailure?.rawOutput;
        const generationHistoryLimit = state.settings.trackerGenerationHistoryLimit ?? 5;
        const report = {
          activePresetId: preset.id,
          presetName: preset.name,
          presetSource,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          generationCompletedAt: (/* @__PURE__ */ new Date()).toISOString(),
          timeoutMs: state.settings.sidecarGenerationTimeoutMs ?? 18e4,
          previousFullTrackerIncluded: Boolean(state.latestTracker),
          previousFullTrackerMessageId: state.latestTracker?.messageId,
          previousFullTrackerSwipeId: state.latestTracker?.swipeId,
          recentTrackerSummariesIncluded: Math.min(Math.max(0, recentTrackers.length - 1), Math.max(0, generationHistoryLimit)),
          recentTrackerSummariesCompactOnly: true,
          recentChatContextIncluded: false,
          recentChatContextMessageCount: 0,
          estimatedSidecarPromptTokens: void 0,
          worldInfoIncluded: false,
          worldInfoStatus: "Not included: no stable Lumiverse world info/lorebook context API was detected in this runtime.",
          storageRetentionLimit: state.settings.trackerHistoryLimit,
          trackerGenerationHistoryLimit: generationHistoryLimit,
          promptInjectionTrackerLimit: state.settings.promptInjectionTrackerLimit ?? 5,
          rawResponseAvailable: Boolean(rawOutput),
          rawResponsePreview: previewRawOutput(rawOutput),
          parseSuccess: false,
          parseFailureCategory: generationFailure?.parseFailureCategory ?? "unknown",
          schemaValidationSuccess: false,
          renderSuccess: false,
          sanitizerRemovedContent: false,
          templateMode: state.settings.useSafeRenderer ? "safe_generic" : state.settings.customTemplateMode || "trusted_layout",
          preservedData: false,
          fallbackUsed: true,
          trackerPresetId: preset.id,
          messageId: messageId || "latest",
          swipeId,
          chatId: chatId || "unknown",
          hudView: state.settings.hudDefaultView,
          retainedCount: recentTrackers.length,
          lastError: message
        };
        report.parseError = message;
        this.diagnostics.pipelineReport = report;
      } catch {
      }
      const errorState = await this.buildState(userId);
      await this.send(userId, { type: "tracker_error", message, state: errorState });
    }
  }
  async cleanupSwipeAlternatives(userId, chatId, historyLimit, protectedMessageId) {
    const active = await getActiveChat(this.spindle, userId).catch(() => null);
    const activeMessages = active?.chat.id === chatId ? active.messages : [];
    const activeSwipeMap = activeSwipeByMessageId(activeMessages);
    const activeAssistant = latestAssistantMessage(activeMessages);
    const protect = activeAssistant?.id ?? protectedMessageId;
    const cleanup = await this.trackerService.pruneInactiveSwipeAlternatives(userId, chatId, activeSwipeMap, protect);
    if (historyLimit > 0) {
      await this.trackerService.pruneChatHistory(userId, chatId, historyLimit, protect);
    }
    const trackers = await this.trackerService.listForChat(userId, chatId).catch(() => []);
    const counts = countSwipeAlternatives(trackers);
    return {
      activeMessageId: activeAssistant?.id,
      activeSwipeId: activeAssistant?.swipe_id,
      activeSwipeByMessageId: activeSwipeMap,
      storedSwipeTrackerCount: counts.stored,
      alternativeSwipeTrackerCount: counts.alternatives,
      cleanupLastRunAt: (/* @__PURE__ */ new Date()).toISOString(),
      cleanupRemovedCount: cleanup.removedCount,
      cleanupKeptCount: cleanup.keptCount,
      cleanupWarning: cleanup.warning
    };
  }
  async saveManualTracker(userId, tracker) {
    const preset = await this.presetService.resolve(userId, tracker.presetId);
    const settings = await this.settingsService.load(userId);
    const validation = validateAgainstSchema(tracker.data, preset.schemaJson);
    const updated = {
      ...tracker,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      source: "manual_edit",
      validation,
      compactSummary: makeCompactSummary(tracker.data)
    };
    await this.trackerService.save(userId, updated, 0);
    await this.cleanupSwipeAlternatives(userId, updated.chatId, settings.trackerHistoryLimit, updated.messageId);
    await this.send(userId, { type: "tracker_updated", tracker: updated, state: await this.buildState(userId) });
  }
  async handleGenerationEnded(payload) {
    try {
      if (!isRecord3(payload)) return;
      const source = payload.source ?? payload.extensionId ?? payload.extension_id;
      const generationType = payload.generationType ?? payload.generation_type;
      if (source === "state_of_the_loom" || generationType === "quiet") return;
      const chatId = this.payloadString(payload.chatId ?? payload.chat_id);
      const messageId = this.payloadString(payload.messageId ?? payload.message_id ?? payload.targetMessageId ?? payload.target_message_id) ?? void 0;
      const content = this.payloadString(payload.content) ?? void 0;
      const swipeId = this.payloadNumber(payload.swipeId ?? payload.swipe_id ?? payload.swipeIndex ?? payload.swipe_index);
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
        const target = chatId ? await this.generationService.findPayloadTarget({ userId, chatId, messageId, content, swipeId }) : null;
        await this.generateTrackerForUser(userId, chatId ?? state.activeChat.id, messageId, swipeId, target);
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
  payloadNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return void 0;
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
