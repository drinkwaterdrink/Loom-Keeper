/**
 * Sleek, native-style Loom Needle & Thread Icon.
 * Replaces the bear paw print to prevent visual confusion with native star buttons.
 * Renders a crisp diagonal roleplay needle woven with flowing loops of thread.
 * Compatible with the original class animation bindings for sequential generation pulses.
 */
/**
 * Sleek, native-style Loom Needle & Thread Icon.
 * Replaces the old bear paw print to prevent visual confusion with native star buttons.
 * Renders a crisp diagonal needle with a hollow, transparent eye and flowing thread loops.
 * 100% maskless and stroke-based to prevent duplicate SVG ID conflicts on dynamic mount sites.
 */
export function loomNeedleSvg(className = 'sotl-paw-svg'): string {
  return [
    `<svg class="${className}" viewBox="0 0 512 512" width="26" height="26" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="overflow: visible; display: inline-block; vertical-align: middle;">`,
    // Woven continuity thread loops (waving accents looping through the eye)
    '  <path d="M 366 146 C 440 70, 460 170, 330 190" stroke="var(--lv-accent, #3864d9)" stroke-width="14" fill="none" opacity="0.5" class="sotl-bear-claw sotl-bear-claw--1"/>',
    '  <path d="M 366 146 C 280 90, 240 210, 300 240" stroke="var(--lv-accent, #3864d9)" stroke-width="14" fill="none" opacity="0.7" class="sotl-bear-claw sotl-bear-claw--2"/>',
    '  <path d="M 280 210 C 200 160, 160 270, 220 290" stroke="var(--lv-accent, #3864d9)" stroke-width="14" fill="none" opacity="0.8" class="sotl-bear-claw sotl-bear-claw--3"/>',
    '  <path d="M 200 280 C 130 230, 110 330, 160 350" stroke="var(--lv-accent, #3864d9)" stroke-width="14" fill="none" opacity="0.6" class="sotl-bear-claw sotl-bear-claw--4"/>',
    
    // Group of needle elements (shaft + eye) that stitches as a single rigid body
    '  <g class="sotl-paw-main sotl-bear-main">',
    '    <!-- Needle Eye Loop -->',
    '    <ellipse cx="366" cy="146" rx="12" ry="28" transform="rotate(45 366 146)" stroke="currentColor" stroke-width="20" fill="none" class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--3"/>',
    '    <!-- Sleek needle shaft (Solid line pointing down-left) -->',
    '    <path d="M 90 422 L 350 162" stroke="currentColor" stroke-width="20" stroke-linecap="round"/>',
    '  </g>',
    '</svg>',
  ].join('');
}

// Backwards-compatibility alias for tests and older styles
export function bearPawSvg(className = 'sotl-paw-svg'): string {
  return loomNeedleSvg(className);
}

