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
