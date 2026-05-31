/**
 * Sleek, native-style Loom Needle & Thread Icon.
 * Replaces the bear paw print to prevent visual confusion with native star buttons.
 * Renders a crisp diagonal roleplay needle woven with flowing loops of thread.
 * Compatible with the original class animation bindings for sequential generation pulses.
 */
export function bearPawSvg(className = 'sotl-paw-svg'): string {
  return [
    `<svg class="${className}" viewBox="0 0 512 512" width="26" height="26" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="overflow: visible;">`,
    // Woven continuity thread loops ( warp / weft )
    '  <path class="sotl-bear-claw sotl-bear-claw--1" d="M 370 142 C 460 60, 480 200, 320 220" opacity="0.4"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--2" d="M 370 142 C 260 80, 220 240, 280 280" opacity="0.6"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--3" d="M 250 240 C 160 180, 120 320, 190 350" opacity="0.8"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--4" d="M 170 330 C 80 280, 60 420, 120 440" opacity="0.5"/>',
    
    // Sleek needle body
    '  <path class="sotl-paw-main sotl-bear-main" d="M 90 422 L 390 122 C 408 104, 436 132, 418 150 L 118 450 C 100 468, 72 440, 90 422 Z" fill="currentColor" stroke="none"/>',
    
    // Needle eye slot (long oval hole)
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--3" cx="372" cy="140" rx="8" ry="24" transform="rotate(45 372 140)" fill="var(--lv-surface, var(--lumiverse-fill, #1a202c))" stroke="none"/>',
    '</svg>',
  ].join('');
}
