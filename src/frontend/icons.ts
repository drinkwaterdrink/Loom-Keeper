export function bearPawSvg(className = 'sotl-paw-svg'): string {
  return [
    `<svg class="${className}" viewBox="0 0 512 512" width="26" height="26" fill="currentColor" aria-hidden="true">`,
    '  <path class="sotl-bear-claw sotl-bear-claw--1" d="M72 142C58 101 70 64 106 31c16 43 12 81-12 110-8 11-18 12-22 1z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--2" d="M159 90C155 48 178 16 222 4c3 45-15 75-47 89-9 4-15 5-16-3z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--3" d="M256 67C249 29 264 6 295 2c16 41 13 67-8 67-8 10-24 10-31-2z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--4" d="M353 90c4-42-19-74-63-86-3 45 15 75 47 89 9 4 15 5 16-3z"/>',
    '  <path class="sotl-bear-claw sotl-bear-claw--5" d="M440 142c14-41 2-78-34-111-16 43-12 81 12 110 8 11 18 12 22 1z"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--1" cx="87" cy="224" rx="50" ry="72" transform="rotate(-25 87 224)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--2" cx="174" cy="171" rx="52" ry="80" transform="rotate(-10 174 171)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--3" cx="256" cy="151" rx="56" ry="84"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--4" cx="338" cy="171" rx="52" ry="80" transform="rotate(10 338 171)"/>',
    '  <ellipse class="sotl-paw-pad sotl-bear-toe sotl-bear-toe--5" cx="425" cy="224" rx="50" ry="72" transform="rotate(25 425 224)"/>',
    '  <path class="sotl-paw-main sotl-bear-main" d="M74 411c0-76 52-132 116-153 29-10 49-12 66-12s37 2 66 12c64 21 116 77 116 153 0 48-31 84-78 91-37 6-62-10-96-10h-16c-34 0-59 16-96 10-47-7-78-43-78-91z"/>',
    '</svg>',
  ].join('');
}
