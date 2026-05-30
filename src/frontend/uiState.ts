export interface UiStateSnapshot {
  openSections: string[];
  rootScrollTop?: number | undefined;
  windowScrollY?: number | undefined;
  active?: {
    selector: string;
    selectionStart?: number | null;
    selectionEnd?: number | null;
  } | undefined;
}

const sectionState = new Map<string, boolean>();

function documentRef(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

function windowRef(): Window | null {
  return typeof window === 'undefined' ? null : window;
}

function attrEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function activeSelector(element: Element): string | undefined {
  const htmlElement = element as HTMLElement;
  if (htmlElement.id) return `[id="${attrEscape(htmlElement.id)}"]`;
  const editorField = htmlElement.getAttribute('data-sotl-editor-field');
  if (editorField) return `[data-sotl-editor-field="${attrEscape(editorField)}"]`;
  const settingsField = htmlElement.getAttribute('data-sotl-field');
  if (settingsField) return `[data-sotl-field="${attrEscape(settingsField)}"]`;
  const section = htmlElement.getAttribute('data-sotl-section');
  if (section) return `[data-sotl-section="${attrEscape(section)}"]`;
  const name = htmlElement.getAttribute('name');
  if (name) return `[name="${attrEscape(name)}"]`;
  return undefined;
}

function isInputWithSelection(value: Element | null): value is HTMLInputElement | HTMLTextAreaElement {
  if (!value) return false;
  if (typeof HTMLInputElement !== 'undefined' && value instanceof HTMLInputElement) return true;
  if (typeof HTMLTextAreaElement !== 'undefined' && value instanceof HTMLTextAreaElement) return true;
  return false;
}

function isDetailsElement(value: Element | null): value is HTMLDetailsElement {
  return typeof HTMLDetailsElement !== 'undefined' && value instanceof HTMLDetailsElement;
}

export function setUiSectionOpen(id: string, open: boolean): void {
  if (!id) return;
  sectionState.set(id, open);
}

export function isUiSectionOpen(id: string, defaultOpen = false): boolean {
  const stored = sectionState.get(id);
  return stored === undefined ? defaultOpen : stored;
}

export function getOpenSectionIds(): string[] {
  return Array.from(sectionState.entries())
    .filter(([, open]) => open)
    .map(([id]) => id);
}

export function resetUiStateForTests(): void {
  sectionState.clear();
}

export function captureUiState(root: HTMLElement | Document | null): UiStateSnapshot {
  const doc = documentRef();
  const scope = root ?? doc;
  const details = scope?.querySelectorAll?.('details[data-sotl-section]');
  details?.forEach((node) => {
    if (isDetailsElement(node)) {
      setUiSectionOpen(node.dataset.sotlSection || '', node.open);
    }
  });

  const activeElement = doc?.activeElement ?? null;
  const selector = activeElement ? activeSelector(activeElement) : undefined;
  let active: UiStateSnapshot['active'];
  if (selector) {
    active = { selector };
    if (isInputWithSelection(activeElement)) {
      active.selectionStart = activeElement.selectionStart;
      active.selectionEnd = activeElement.selectionEnd;
    }
  }

  return {
    openSections: getOpenSectionIds(),
    rootScrollTop: root && root instanceof HTMLElement ? root.scrollTop : undefined,
    windowScrollY: windowRef()?.scrollY,
    active,
  };
}

export function restoreUiState(root: HTMLElement | Document | null, snapshot: UiStateSnapshot): void {
  const doc = documentRef();
  const scope = root ?? doc;
  const openSections = new Set(snapshot.openSections);
  scope?.querySelectorAll?.('details[data-sotl-section]').forEach((node) => {
    if (!isDetailsElement(node)) return;
    const id = node.dataset.sotlSection || '';
    node.open = openSections.has(id);
  });

  const restore = () => {
    if (root && root instanceof HTMLElement && typeof snapshot.rootScrollTop === 'number') {
      root.scrollTop = snapshot.rootScrollTop;
    }
    if (typeof snapshot.windowScrollY === 'number') {
      windowRef()?.scrollTo?.({ top: snapshot.windowScrollY });
    }
    if (!snapshot.active) return;
    const target = scope?.querySelector?.(snapshot.active.selector);
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: true });
      if (isInputWithSelection(target) && typeof snapshot.active.selectionStart === 'number') {
        try {
          target.setSelectionRange(snapshot.active.selectionStart, snapshot.active.selectionEnd ?? snapshot.active.selectionStart);
        } catch {
          // Some input types do not support text selections.
        }
      }
    }
  };

  if (typeof globalThis.requestAnimationFrame === 'function') {
    globalThis.requestAnimationFrame(restore);
  } else {
    restore();
  }
}
