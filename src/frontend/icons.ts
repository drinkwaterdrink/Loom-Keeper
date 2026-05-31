/**
 * Highly polished, crisp 5-toed bear paw print icon.
 * Arranges rounded heel pad and 5 oval toes with generous spacing.
 * Claws are spaced with a distinct 20-23px vertical gap above each toe
 * to prevent blobbing at small scales while preserving CSS keyframe animations.
 */
export function bearPawSvg(className = 'sotl-paw-svg'): string {
  return [
    `<svg class="${className}" viewBox="0 0 512 512" width="26" height="26" fill="currentColor" aria-hidden="true">`,
    '  <path class="sotl-bear-claw sotl-bear-claw--1" d="M62,135 Q85,170 95,205 Q99,170 62,135 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--2" d="M141,75 Q154,110 161,145 Q168,110 141,75 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--3" d="M256,45 C250,80 248,115 248,115 Q262,80 256,45 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--4" d="M371,75 Q358,110 351,145 Q344,110 371,75 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--5" d="M450,135 Q427,170 417,205 Q413,170 450,135 Z"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--1" cx="108" cy="255" rx="22" ry="28" transform="rotate(-20 108 255)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--2" cx="172" cy="195" rx="24" ry="30" transform="rotate(-10 172 195)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--3" cx="256" cy="170" rx="26" ry="32"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--4" cx="340" cy="195" rx="24" ry="30" transform="rotate(10 340 195)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--5" cx="404" cy="255" rx="22" ry="28" transform="rotate(20 404 255)"/>',
    '  <path class="sotl-paw-main sotl-bear-main" d="M120,360 C100,310 185,280 256,290 C327,280 412,310 392,360 C372,420 310,440 256,440 C202,440 140,420 120,360 Z"/>',
    '</svg>',
  ].join('');
}
