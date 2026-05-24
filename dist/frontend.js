// src/shared/renderer.ts
function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function readPath(data, path) {
  if (path === ".") return data;
  return path.split(".").reduce((current, part) => {
    if (!current || typeof current !== "object") return "";
    return current[part] ?? "";
  }, data);
}
function truthy(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}
function renderTemplate(template, data) {
  let output = template;
  const sectionPattern = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
  output = output.replace(sectionPattern, (_match, path, inner) => {
    return truthy(readPath(data, path)) ? renderTemplate(inner, data) : "";
  });
  const eachPattern = /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g;
  output = output.replace(eachPattern, (_match, path, inner) => {
    const value = readPath(data, path);
    if (!Array.isArray(value) || value.length === 0) return '<p class="sotl-empty">None</p>';
    return value.map((item) => {
      const scope = item && typeof item === "object" ? item : { ".": item };
      return renderTemplate(inner, { ...data, ...scope, ".": item });
    }).join("");
  });
  return output.replace(/{{\s*([\w.]+|\.)\s*}}/g, (_match, path) => escapeHtml(readPath(data, path)));
}
function renderTrackerHtml(tracker, preset) {
  const data = {
    ...tracker.data,
    density: preset.renderOptions.density,
    theme: preset.renderOptions.theme,
    compactSummary: tracker.compactSummary
  };
  return renderTemplate(preset.htmlTemplate, data);
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
  return `<button class="sotl-button" type="button" data-sotl-action="${escapeHtml2(action)}"${primary}${disabled}${title}>${escapeHtml2(label)}</button>`;
}
function iconButton(label, action, id) {
  return `<button class="sotl-icon-button" type="button" data-sotl-action="${escapeHtml2(action)}" data-sotl-message-id="${escapeHtml2(id)}" title="${escapeHtml2(label)}" aria-label="${escapeHtml2(label)}">${escapeHtml2(label.slice(0, 1))}</button>`;
}

// src/frontend/presetEditor.ts
function renderPresetDetails(preset) {
  return [
    '<div class="sotl-fields">',
    '<details class="sotl-details"><summary>Prompt instructions</summary>',
    `<pre class="sotl-code">${escapeHtml2(preset.promptInstructions)}</pre>`,
    "</details>",
    '<details class="sotl-details"><summary>Schema JSON</summary>',
    `<pre class="sotl-code">${escapeHtml2(JSON.stringify(preset.schemaJson, null, 2))}</pre>`,
    "</details>",
    '<details class="sotl-details"><summary>HTML Template</summary>',
    `<pre class="sotl-code">${escapeHtml2(preset.htmlTemplate)}</pre>`,
    "</details>",
    "</div>"
  ].join("");
}

// src/frontend/settingsPanel.ts
function renderPlacementOptions(state2) {
  return ["top", "bottom", "drawer", "hidden", "disabled"].map((placement) => {
    const selected = state2.settings.defaultPlacement === placement ? " selected" : "";
    return `<option value="${placement}"${selected}>${placement}</option>`;
  }).join("");
}
function renderConnectionOptions(state2) {
  const selected = state2.settings.sidecarConnectionId || "";
  const options = [
    `<option value=""${selected ? "" : " selected"}>Default/current connection</option>`,
    ...state2.connections.map((connection) => {
      const label = [connection.name, connection.model ? `(${connection.model})` : ""].filter(Boolean).join(" ");
      return `<option value="${escapeHtml2(connection.id)}"${selected === connection.id ? " selected" : ""}>${escapeHtml2(label)}</option>`;
    })
  ];
  return options.join("");
}
function renderTrackerPlacementOptions(state2) {
  return ["drawer", "chat_panel", "message_card", "both"].map((placement) => {
    const selected = state2.settings.trackerPlacement === placement ? " selected" : "";
    return `<option value="${placement}"${selected}>${placement}</option>`;
  }).join("");
}
function renderCardDensityOptions(state2) {
  return ["compact", "normal"].map((density) => {
    const selected = state2.settings.cardDensity === density ? " selected" : "";
    return `<option value="${density}"${selected}>${density}</option>`;
  }).join("");
}
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
    const offlineText = status.backendTimedOut ? "Backend is not responding. The runtime may still be crashed; use Reset Loom Storage, then Refresh after the extension reloads." : "Frontend loaded. Waiting for the backend state packet...";
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
      renderFeatureBreakdown(),
      "</div>"
    ].join("");
  }
  const disabledReason = state2.generation.disabledReason || "";
  return [
    '<div class="sotl-root sotl-settings" data-sotl-settings="true">',
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
    '<div class="sotl-actions">',
    button("Open Loom Drawer", "open-drawer", { primary: true }),
    button("Generate tracker", "generate", { disabled: Boolean(disabledReason), title: disabledReason }),
    button("Refresh", "refresh"),
    button("Reset Loom Storage", "reset-storage", { title: "Resets State of the Loom settings, presets, and trackers for this user." }),
    "</div>",
    disabledReason ? `<p class="sotl-note">${escapeHtml2(disabledReason)}</p>` : '<p class="sotl-note">Ready. Use Generate after an assistant reply, or open the drawer for the full HUD.</p>',
    status.lastToast ? `<p class="sotl-note">${escapeHtml2(status.lastToast.message)}</p>` : "",
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Core settings</h3>",
    '<div class="sotl-fields">',
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="enabled" ${state2.settings.enabled ? "checked" : ""}> Extension enabled</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="autoGenerate" ${state2.settings.autoGenerate ? "checked" : ""}> Auto-generate after assistant messages</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="fallback" ${state2.settings.useDefaultConnectionFallback ? "checked" : ""}> Use default/current connection fallback</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="floating" ${state2.settings.showFloatingButton ? "checked" : ""}> Show desktop floating launcher</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatLoomPanel" ${state2.settings.showChatLoomPanel ? "checked" : ""}> Show chat-screen Loom panel</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="renderTrackersInMessages" ${state2.settings.renderTrackersInMessages ? "checked" : ""}> Render trackers inside chat messages</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="messageButtons" ${state2.settings.showMessageButtons ? "checked" : ""}> Show message card buttons</label>`,
    '<label class="sotl-label">Sidecar connection',
    `<select class="sotl-select" data-sotl-field="connection">${renderConnectionOptions(state2)}</select>`,
    "</label>",
    '<label class="sotl-label">Default placement',
    `<select class="sotl-select" data-sotl-field="placement">${renderPlacementOptions(state2)}</select>`,
    "</label>",
    '<label class="sotl-label">Tracker display scope',
    `<select class="sotl-select" data-sotl-field="trackerPlacement">${renderTrackerPlacementOptions(state2)}</select>`,
    "</label>",
    '<label class="sotl-label">Card density',
    `<select class="sotl-select" data-sotl-field="cardDensity">${renderCardDensityOptions(state2)}</select>`,
    "</label>",
    "</div>",
    "</section>",
    renderFeatureBreakdown(),
    '<section class="sotl-panel">',
    "<h3>Diagnostics</h3>",
    state2.diagnostics.storageWarning ? `<p class="sotl-note sotl-warning">${escapeHtml2(state2.diagnostics.storageWarning)}</p>` : "",
    `<p class="sotl-note">${escapeHtml2(state2.diagnostics.renderLimitation || "")}</p>`,
    state2.diagnostics.lastError ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.lastError)}</p>` : "",
    state2.diagnostics.lastGenerationError ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.lastGenerationError)}</p>` : "",
    status.lastRenderStatus ? `<p class="sotl-note">${escapeHtml2(status.lastRenderStatus)}</p>` : "",
    state2.diagnostics.lastRenderStatus ? `<p class="sotl-note">${escapeHtml2(state2.diagnostics.lastRenderStatus)}</p>` : "",
    "</section>",
    "</div>"
  ].join("");
}

// src/frontend/drawer.ts
function renderConnectionOptions2(state2) {
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
    return `<option value="${escapeHtml2(preset.id)}"${selected}>${escapeHtml2(preset.name)}</option>`;
  }).join("");
}
function renderLatestTracker(state2) {
  if (!state2.latestTracker) {
    return '<p class="sotl-note">No tracker has been stored for this chat yet.</p>';
  }
  const html = renderTrackerHtml(state2.latestTracker, state2.activePreset);
  const attachmentStatus = state2.settings.renderTrackersInMessages && state2.latestTracker.messageId ? `<p class="sotl-note" style="color: var(--lv-success-text, #176b43); font-weight: 600; margin-top: 8px;">\u{1F517} Attached to message card (${escapeHtml2(state2.latestTracker.messageId)})</p>` : '<p class="sotl-note" style="margin-top: 8px;">Status: Not attached to a message card.</p>';
  return [
    `<p class="sotl-note">${escapeHtml2(state2.latestTracker.compactSummary)}</p>`,
    `<div class="sotl-preview">${html}</div>`,
    attachmentStatus,
    '<details class="sotl-details"><summary>Manual JSON edit</summary>',
    '<div class="sotl-fields" style="margin-top: 10px;">',
    `<textarea class="sotl-textarea" data-sotl-field="latestJson">${escapeHtml2(JSON.stringify(state2.latestTracker.data, null, 2))}</textarea>`,
    '<div class="sotl-actions">',
    button("Save JSON", "save-json"),
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
    '<label class="sotl-label">Sidecar connection',
    `<select class="sotl-select" data-sotl-field="connection">${renderConnectionOptions2(state2)}</select>`,
    "</label>",
    `<p class="sotl-note">Connection: ${escapeHtml2(selectedConnection?.name || (state2.settings.useDefaultConnectionFallback ? "default/current fallback" : "none selected"))}</p>`,
    !state2.permissions.generation ? '<p class="sotl-note">Generation permission is missing; passive fenced extraction is still available.</p>' : "",
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="autoGenerate" ' + (state2.settings.autoGenerate ? "checked" : "") + "> Auto-generate after assistant messages</label>",
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatLoomPanel" ' + (state2.settings.showChatLoomPanel ? "checked" : "") + "> Show chat-screen Loom panel</label>",
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="renderTrackersInMessages" ' + (state2.settings.renderTrackersInMessages ? "checked" : "") + "> Render trackers inside chat messages</label>",
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="stripBlocks" ' + (state2.settings.stripTrackerBlocksFromMessages ? "checked" : "") + "> Strip passive tracker blocks when allowed</label>",
    "</div>",
    '<div class="sotl-actions">',
    button("Generate tracker", "generate", { primary: true, disabled: Boolean(disabledReason), title: disabledReason }),
    button("Refresh", "refresh"),
    button("Reset Loom Storage", "reset-storage", { title: "Resets State of the Loom settings, presets, and trackers for this user." }),
    "</div>",
    disabledReason ? `<p class="sotl-note">${escapeHtml2(disabledReason)}</p>` : '<p class="sotl-note">Ready to track the latest assistant message.</p>',
    status.lastToast ? `<p class="sotl-note">${escapeHtml2(status.lastToast.message)}</p>` : "",
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Current Loom</h3>",
    renderLatestTracker(state2),
    "</section>",
    '<section class="sotl-panel">',
    "<h3>Message Tracker List</h3>",
    renderMessageList(state2),
    "</section>",
    renderFeatureBreakdown(true),
    '<section class="sotl-panel">',
    '<details class="sotl-details"><summary>Preset Details</summary>',
    '<div style="margin-top: 10px;">',
    renderPresetDetails(state2.activePreset),
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
  return controls + renderTrackerHtml(tracker, state2.activePreset);
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
  if (!state2.settings.renderTrackersInMessages) {
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
function renderCompactPanel(tracker) {
  if (!tracker) {
    return [
      '<div class="sotl-chat-panel">',
      '  <header class="sotl-chat-panel__head">',
      '    <span class="sotl-chat-panel__title">Loom HUD</span>',
      '    <button class="sotl-chat-panel__close" data-sotl-panel-action="collapse" title="Collapse panel">\u2715</button>',
      "  </header>",
      '  <div class="sotl-chat-panel__body">',
      '    <p class="sotl-chat-panel__desc">No tracker has been stored for this chat yet. Click Generate below to start tracking.</p>',
      "  </div>",
      '  <div class="sotl-chat-panel__actions">',
      '    <button class="sotl-button sotl-chat-panel__btn" data-sotl-panel-action="drawer">Open Drawer</button>',
      '    <button class="sotl-button sotl-chat-panel__btn" data-sotl-panel-action="generate" style="background: var(--lv-accent, #3864d9); color: var(--lv-on-accent, #fff); border-color: var(--lv-accent, #3864d9);">Generate</button>',
      "  </div>",
      "</div>"
    ].join("\n");
  }
  const castChips = Array.isArray(tracker.data.cast) && tracker.data.cast.length > 0 ? `<div class="sotl-cast-grid" style="margin-top: 4px;">` + tracker.data.cast.slice(0, 3).map((c) => `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">${escapeHtml3(c.name || "Cast")}</span>`).join("") + (tracker.data.cast.length > 3 ? `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">+${tracker.data.cast.length - 3}</span>` : "") + `</div>` : "";
  return [
    '<div class="sotl-chat-panel">',
    '  <header class="sotl-chat-panel__head">',
    '    <span class="sotl-chat-panel__title">Loom HUD</span>',
    '    <button class="sotl-chat-panel__close" data-sotl-panel-action="collapse" title="Collapse panel">\u2715</button>',
    "  </header>",
    '  <div class="sotl-chat-panel__body">',
    `    <p class="sotl-chat-panel__scene">${escapeHtml3(tracker.data.sceneTitle || "Active Scene")}</p>`,
    `    <div class="sotl-chat-panel__meta">\u{1F4CD} ${escapeHtml3(tracker.data.location || "Unknown")} \u2022 \u{1F552} ${escapeHtml3(tracker.data.time || "Unknown")}</div>`,
    `    <p class="sotl-chat-panel__desc">${escapeHtml3(tracker.data.delta || "No deltas recorded.")}</p>`,
    castChips,
    "  </div>",
    '  <div class="sotl-chat-panel__actions">',
    '    <button class="sotl-button sotl-chat-panel__btn" data-sotl-panel-action="drawer">Open Drawer</button>',
    '    <button class="sotl-button sotl-chat-panel__btn" data-sotl-panel-action="generate" style="background: var(--lv-accent, #3864d9); color: var(--lv-on-accent, #fff); border-color: var(--lv-accent, #3864d9);">Generate</button>',
    "  </div>",
    "</div>"
  ].join("\n");
}
function ensureChatLoomPanel(ctx, state2) {
  const doc = documentRef();
  if (!doc) return;
  doc.querySelector(".sotl-chat-panel-container")?.remove();
  if (!state2 || !state2.settings.showChatLoomPanel) return;
  if (isDrawerOpen || isSettingsOpen) return;
  const container = doc.createElement("div");
  container.className = "sotl-chat-panel-container";
  container.dataset.sotlChatPanel = "true";
  if (!isChatLoomPanelExpanded) {
    container.innerHTML = `<div class="sotl-chat-pill" data-sotl-panel-action="expand">Loom HUD</div>`;
  } else {
    container.innerHTML = renderCompactPanel(state2.latestTracker);
  }
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
    } else if (action === "drawer") {
      const ui = ctx.ui && typeof ctx.ui === "object" ? ctx.ui : {};
      const openDrawer = ui.openDrawer ?? ui.showDrawer ?? ui.openPanel ?? ui.activateDrawer;
      if (typeof openDrawer === "function") {
        openDrawer("state_of_the_loom");
      } else {
        const openBtn = doc.querySelector('[data-sotl-action="open-drawer"]');
        openBtn?.click();
      }
    } else if (action === "generate") {
      if (typeof ctx.sendToBackend === "function") {
        ctx.sendToBackend({ type: "generate_tracker" });
      } else {
        const genBtn = doc.querySelector('[data-sotl-action="generate"]');
        genBtn?.click();
      }
    }
  });
  doc.body.append(container);
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
.sotl-chat-panel-container {
  position: fixed;
  top: 76px;
  right: 16px;
  z-index: 25;
  font-family: var(--lv-font-sans, Inter, ui-sans-serif, system-ui, sans-serif);
  color: var(--lumiverse-text, var(--lv-text, #1e2329));
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.sotl-chat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--lumiverse-fill, var(--lv-surface-raised, rgba(255, 255, 255, 0.85)));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.25)));
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(20, 24, 32, 0.12);
  user-select: none;
  transition: all 0.2s ease;
}
.sotl-chat-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(20, 24, 32, 0.18);
  border-color: var(--lv-accent, #3864d9);
}
.sotl-chat-pill::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--lv-success-text, #1b7e50);
  box-shadow: 0 0 6px var(--lv-success-text, #1b7e50);
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
.sotl-chat-panel__close {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 2px;
  font-size: 12px;
  color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));
}
.sotl-chat-panel__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
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
.sotl-chat-panel__actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
.sotl-chat-panel__btn {
  flex: 1;
  font-size: 11px;
  min-height: 28px;
  padding: 0 8px;
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
  .sotl-chat-panel-container {
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
    return;
  }
  drawerRoot?.scrollIntoView({ block: "start" });
  fallbackRoot?.scrollIntoView({ block: "start" });
}
function paint(status) {
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
  if (fieldName === "placement" && field instanceof HTMLSelectElement) {
    saveSettings({ defaultPlacement: field.value });
  }
  if (fieldName === "showChatLoomPanel" && field instanceof HTMLInputElement) {
    saveSettings({ showChatLoomPanel: field.checked });
  }
  if (fieldName === "renderTrackersInMessages" && field instanceof HTMLInputElement) {
    saveSettings({ renderTrackersInMessages: field.checked });
  }
  if (fieldName === "trackerPlacement" && field instanceof HTMLSelectElement) {
    saveSettings({ trackerPlacement: field.value });
  }
  if (fieldName === "cardDensity" && field instanceof HTMLSelectElement) {
    saveSettings({ cardDensity: field.value });
  }
}
function handleBackendMessage(message) {
  if (message.type === "state") state = message.state;
  if (message.type === "tracker_generated" || message.type === "tracker_updated" || message.type === "tracker_deleted" || message.type === "tracker_error" || message.type === "permissions_changed" || message.type === "storage_reset") {
    state = message.state;
  }
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
