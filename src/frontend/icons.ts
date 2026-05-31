export function bearPawSvg(className = 'sotl-paw-svg'): string {
  return [
    `<svg class="${className}" viewBox="0 0 512 512" width="26" height="26" fill="currentColor" aria-hidden="true">`,
    '  <path class="sotl-bear-claw sotl-bear-claw--1" d="M66,138 Q92,164 102,189 C110,186 113,181 113,179 Q97,153 66,138 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--2" d="M143,72 Q159,102 166,130 C174,128 177,123 177,120 Q164,92 143,72 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--3" d="M256,46 Q251,82 248,110 C256,112 256,112 264,110 Q261,82 256,46 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--4" d="M369,72 Q353,102 346,130 C338,128 335,123 335,120 Q348,92 369,72 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--5" d="M446,138 Q420,164 410,189 C402,186 399,181 399,179 Q415,153 446,138 Z"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--1" cx="113" cy="230" rx="26" ry="33" transform="rotate(-20 113 230)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--2" cx="174" cy="169" rx="28" ry="36" transform="rotate(-10 174 169)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--3" cx="256" cy="143" rx="31" ry="39"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--4" cx="338" cy="169" rx="28" ry="36" transform="rotate(10 338 169)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--5" cx="399" cy="230" rx="26" ry="33" transform="rotate(20 399 230)"/>',
    '  <path class="sotl-paw-main sotl-bear-main" d="M102,333 C92,266 179,235 256,245 C333,235 420,266 410,333 C400,400 317,420 256,420 C195,420 112,400 102,333 Z"/>',
    '</svg>',
  ].join('');
}
