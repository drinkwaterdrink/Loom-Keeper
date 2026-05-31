export function bearPawSvg(className = 'sotl-paw-svg'): string {
  return [
    `<svg class="${className}" viewBox="0 0 512 512" width="26" height="26" fill="currentColor" aria-hidden="true">`,
    '  <path class="sotl-bear-claw sotl-bear-claw--1" d="M62,130 Q88,156 98,181 C106,178 109,173 109,171 Q93,145 62,130 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--2" d="M141,63 Q157,93 164,121 C172,119 175,114 175,111 Q162,83 141,63 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--3" d="M256,33 Q251,69 248,97 C256,99 256,99 264,97 Q261,69 256,33 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--4" d="M371,63 Q355,93 348,121 C340,119 337,114 337,111 Q350,83 371,63 Z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--5" d="M450,130 Q424,156 414,181 C406,178 403,173 403,171 Q419,145 450,130 Z"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--1" cx="108" cy="225" rx="22" ry="28" transform="rotate(-20 108 225)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--2" cx="172" cy="160" rx="24" ry="30" transform="rotate(-10 172 160)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--3" cx="256" cy="130" rx="26" ry="32"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--4" cx="340" cy="160" rx="24" ry="30" transform="rotate(10 340 160)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--5" cx="404" cy="225" rx="22" ry="28" transform="rotate(20 404 225)"/>',
    '  <path class="sotl-paw-main sotl-bear-main" d="M102,348 C92,281 179,250 256,260 C333,250 420,281 410,348 C400,415 317,435 256,435 C195,435 112,415 102,348 Z"/>',
    '</svg>',
  ].join('');
}

