export const loomStyles = `
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
  width: var(--sotl-native-glyph-size, 22px);
  height: var(--sotl-native-glyph-size, 22px);
  overflow: visible;
}
.sotl-paw-pad,
.sotl-paw-main,
.sotl-bear-claw {
  transform-box: fill-box;
  transform-origin: center;
}
.sotl-chat-pill--generating::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 1px solid var(--lv-accent, #3864d9);
  opacity: 0.5;
  animation: sotl-paw-ring 1.35s ease-out infinite;
  pointer-events: none;
}
.sotl-chat-pill--generating .sotl-paw-pad,
.sotl-chat-pill--generating .sotl-bear-claw {
  animation: sotl-paw-pad-bounce 1.1s ease-in-out infinite;
}
.sotl-chat-pill--generating .sotl-bear-toe--1,
.sotl-chat-pill--generating .sotl-bear-claw--1 {
  animation-delay: 0s;
}
.sotl-chat-pill--generating .sotl-bear-toe--2,
.sotl-chat-pill--generating .sotl-bear-claw--2 {
  animation-delay: 0.08s;
}
.sotl-chat-pill--generating .sotl-bear-toe--3,
.sotl-chat-pill--generating .sotl-bear-claw--3 {
  animation-delay: 0.16s;
}
.sotl-chat-pill--generating .sotl-bear-toe--4,
.sotl-chat-pill--generating .sotl-bear-claw--4 {
  animation-delay: 0.24s;
}
.sotl-chat-pill--generating .sotl-bear-toe--5,
.sotl-chat-pill--generating .sotl-bear-claw--5 {
  animation-delay: 0.32s;
}
.sotl-chat-pill--generating .sotl-paw-main {
  animation: sotl-paw-main-pulse 1.35s ease-in-out infinite;
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
  width: var(--sotl-native-glyph-size, 16px);
  height: var(--sotl-native-glyph-size, 16px);
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

`;
