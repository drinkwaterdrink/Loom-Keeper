export interface LoomUiStatus {
  backendTimedOut?: boolean;
  lastFrontendError?: string | undefined;
  lastRenderStatus?: string | undefined;
  lastToast?: {
    level: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | undefined;
  lastSettingsSavedAt?: number | undefined;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function badge(label: string, ok: boolean): string {
  return `<span class="sotl-chip" data-ok="${ok ? 'true' : 'false'}">${escapeHtml(label)}</span>`;
}

export function button(label: string, action: string, options: { primary?: boolean; disabled?: boolean; title?: string; style?: string } = {}): string {
  const disabled = options.disabled ? ' disabled' : '';
  const primary = options.primary ? ' data-primary="true"' : '';
  const title = options.title ? ` title="${escapeHtml(options.title)}"` : '';
  const style = options.style ? ` style="${escapeHtml(options.style)}"` : '';
  return `<button class="sotl-button" type="button" data-sotl-action="${escapeHtml(action)}"${primary}${disabled}${title}${style}>${escapeHtml(label)}</button>`;
}

export function iconButton(label: string, action: string, id: string): string {
  const icons: Record<string, string> = {
    Regenerate: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.7 6.3A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.3L13 11h8V3l-3.3 3.3Z" fill="currentColor"/></svg>',
    Edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16.7V20h3.3L18.6 9.7l-3.3-3.3L5 16.7Zm15-9.1c.4-.4.4-1 0-1.4L17.8 4c-.4-.4-1-.4-1.4 0l-1.1 1.1 3.3 3.3L20 7.6Z" fill="currentColor"/></svg>',
    Hide: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.3 2 18.7 18.7-1.3 1.3-3-3A12.8 12.8 0 0 1 12 20C6.5 20 2.2 16.5 1 12c.5-1.8 1.6-3.4 3-4.7L2 3.3 3.3 2Zm6.2 6.2 1.6 1.6A2.5 2.5 0 0 1 14.2 13l1.6 1.6A4.5 4.5 0 0 0 9.5 8.2ZM12 4c5.5 0 9.8 3.5 11 8a9.6 9.6 0 0 1-2.4 4.1l-3.1-3.1A5.5 5.5 0 0 0 11 6.1L8.7 3.8c1-.2 2.1.2 3.3.2Z" fill="currentColor"/></svg>',
    Show: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4C6.5 4 2.2 7.5 1 12c1.2 4.5 5.5 8 11 8s9.8-3.5 11-8c-1.2-4.5-5.5-8-11-8Zm0 13a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.2a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" fill="currentColor"/></svg>',
    Delete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21c-1.1 0-2-.9-2-2V8h14v11c0 1.1-.9 2-2 2H7ZM9 4h6l1 2h4v2H4V6h4l1-2Zm0 7v7h2v-7H9Zm4 0v7h2v-7h-2Z" fill="currentColor"/></svg>',
  };
  const icon = icons[label] || escapeHtml(label.slice(0, 1));
  return `<button class="sotl-icon-button" type="button" data-sotl-action="${escapeHtml(action)}" data-sotl-message-id="${escapeHtml(id)}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${icon}</button>`;
}
