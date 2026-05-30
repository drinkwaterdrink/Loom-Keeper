export function bearPawSvg(className = 'sotl-paw-svg'): string {
  return [
    `<svg class="${className}" viewBox="0 0 512 512" width="22" height="22" fill="currentColor" aria-hidden="true">`,
    '  <path class="sotl-bear-claw sotl-bear-claw--1" d="M69 159c-12-35-7-68 21-103 13 43 14 78-3 105-7 11-14 12-18-2z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--2" d="M154 82c-7-38 8-70 43-96 7 44-3 77-27 99-9 8-14 7-16-3z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--3" d="M256 62c-5-38 6-72 32-103 19 41 22 76 8 105-7 13-34 13-40-2z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--4" d="M358 82c2-38-14-70-49-96-7 44 3 77 27 99 9 8 20 7 22-3z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--5" d="M443 159c12-35 7-68-21-103-13 43-14 78 3 105 7 11 14 12 18-2z"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--1" cx="87" cy="230" rx="48" ry="68" transform="rotate(-24 87 230)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--2" cx="171" cy="176" rx="48" ry="74" transform="rotate(-10 171 176)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--3" cx="256" cy="156" rx="51" ry="78"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--4" cx="341" cy="176" rx="48" ry="74" transform="rotate(10 341 176)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--5" cx="425" cy="230" rx="48" ry="68" transform="rotate(24 425 230)"/>',
    '  <path class="sotl-paw-main sotl-bear-main" d="M98 411c-2-63 42-111 91-128 26-9 45-10 67-10s41 1 67 10c49 17 93 65 91 128-1 38-25 67-62 73-32 5-58-5-91-5h-10c-33 0-59 10-91 5-37-6-61-35-62-73z"/>',
    '</svg>',
  ].join('');
}
