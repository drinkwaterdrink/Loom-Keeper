export interface LoomUiStatus {
  backendTimedOut?: boolean;
  lastFrontendError?: string | undefined;
  lastRenderStatus?: string | undefined;
  lastToast?: {
    level: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | undefined;
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
  return `<button class="sotl-icon-button" type="button" data-sotl-action="${escapeHtml(action)}" data-sotl-message-id="${escapeHtml(id)}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${escapeHtml(label.slice(0, 1))}</button>`;
}
