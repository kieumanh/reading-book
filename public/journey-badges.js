const finishes = [
  ["#2e4332", "#617652", "#9cab77", "#fff2cd", "M50 6 82 18V54Q82 77 50 94 18 77 18 54V18Z"],
  ["#173f36", "#3f8065", "#98c69c", "#eeffe4", "M50 5 81 17 91 41 83 68 50 96 17 68 9 41 19 17Z"],
  ["#23434b", "#538f8e", "#add7c6", "#f0fff7", "M50 5C72 7 88 26 88 50S73 87 50 96C27 87 12 74 12 50S28 7 50 5Z"],
  ["#362f46", "#70688d", "#c6add8", "#fff4ff", "M50 5 88 23 90 55 73 82 50 96 27 82 10 55 12 23Z"],
  ["#573b2e", "#a67349", "#e1b787", "#fff2da", "M50 4 82 12 93 36 86 65 68 86 50 98 32 86 14 65 7 36 18 12Z"],
  ["#2b4a33", "#759458", "#d5daa4", "#fffbd9", "M50 4 74 9 91 26 95 49 85 73 66 92 50 98 34 92 15 73 5 49 9 26 26 9Z"],
  ["#2b3855", "#586b9a", "#c1cbf4", "#f2f2ff", "M50 3 68 9 87 12 94 29 94 64 78 82 50 98 22 82 6 64 6 29 13 12 32 9Z"],
  ["#653a3d", "#a96669", "#f1c2a7", "#fff5da", "M50 4 73 9 91 22 96 43 89 64 80 82 62 92 50 99 38 92 20 82 11 64 4 43 9 22 27 9Z"],
  ["#243d4d", "#477995", "#a5e2dc", "#ebfffb", "M50 3 65 10 83 13 88 28 98 42 93 63 78 80 73 89 50 99 27 89 22 80 7 63 2 42 12 28 17 13 35 10Z"],
  ["#583920", "#ae7735", "#f4d490", "#fff5ce", "M50 2 66 10 84 9 89 27 97 41 92 61 82 72 78 89 61 92 50 101 39 92 22 89 18 72 8 61 3 41 11 27 16 9 34 10Z"],
  ["#3b2d68", "#7866a5", "#e5c4a2", "#fff3cf", "M50 2 67 12 83 7 89 24 98 37 92 53 93 68 79 76 72 93 61 92 50 101 39 92 28 93 21 76 7 68 8 53 2 37 11 24 17 7 33 12Z"],
  ["#523619", "#ad7432", "#ffda82", "#fff9df", "M50 1 63 10 82 5 88 21 97 31 91 44 98 58 86 68 83 84 66 90 50 102 34 90 17 84 14 68 2 58 9 44 3 31 12 21 18 5 37 10Z"]
];

const glyphs = [
  '<path d="M12 6C9 4 6 4 2 5v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1Zm0 1v12"/><path d="M5 9c2 0 3 .2 4 .8m6 0c1-.6 2-.8 4-.8"/>',
  '<path d="M4 18c-1-7 3-12 15-14 1 11-4 16-12 15m-4 3 11-12"/><path d="M8 15v-4m0 4h5"/>',
  '<path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10Z"/><path d="M20 3v4m-2-2h4"/>',
  '<path d="M7 5h10l2 4-2 11H7L5 9Zm2-3h6m-3 0v3M8 9h8m-4 2v6"/><path d="M10 20v2h4v-2"/>',
  '<path d="M2 18 9 7l4 6 3-4 6 9H2Z"/><path d="m7 10 2 1 2-1m5-7v3m-1.5-1.5h3"/>',
  '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Zm-3.5-6v2m0 14v2m-9-8h2m14 0h2"/>',
  '<path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0m-18 5c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M8 9a4 4 0 0 1 8 0m-4-7v2m-7 2 2 2m12-2-2 2"/>',
  '<path d="M12 21v-7m0 1C7 15 4 12 4 7c5 0 8 3 8 8Zm0 0c5 0 8-3 8-8-5 0-8 3-8 8Z"/><path d="M9 7c0-2 1-3 3-5 2 2 3 3 3 5"/>',
  '<path d="M12 19 4.5 12a4.4 4.4 0 0 1 0-6 4.3 4.3 0 0 1 6 0L12 7.5 13.5 6a4.3 4.3 0 0 1 6 0 4.4 4.4 0 0 1 0 6L12 19Z"/><path d="M9 22h6"/>',
  '<path d="M5 19C8 8 13 3 21 3c-1 7-6 13-12 13m-6 6 12-12"/><path d="M9 21h11"/>'
];

const finaleGlyph = '<path d="M12 2v6m-3-3h6m-12 13 4-7 3 4m4 1 4-6 4 8M2 20h20"/><path d="M12 13c-3-4-7 .1 0 5 7-4.9 3-9 0-5Z"/><circle cx="19" cy="5" r=".9" fill="currentColor" stroke="none"/><circle cx="5" cy="5" r=".9" fill="currentColor" stroke="none"/>';

export function journeyBadge(item, placement) {
  const { level, land, step } = item;
  const [shade, light, rim, ink, outline] = finishes[land];
  const gradient = `badge-${placement}-${level}`;
  const glyph = land === finishes.length - 1 ? finaleGlyph : glyphs[(step + land * 3) % glyphs.length];

  const engraving = land >= 2 ? `<path d="${outline}" transform="translate(8 8) scale(.84)" fill="none" stroke="${rim}" stroke-width="1" opacity=".72"/>` : "";
  const rays = land >= 5 ? `<path d="M50 17v5m-20 2 3 5m34 0 3-5m8 20h-5m-46 0h-5m9 17 3-4m32 0 3 4" stroke="${rim}" stroke-width="1.55" stroke-linecap="round" opacity=".85"/>` : "";
  const laurels = land >= 7 ? `<g fill="none" stroke="${rim}" stroke-linecap="round" stroke-width="1.35">
    <path d="M37 68Q21 59 19 39m3 14-6-2m8 5 2-6m-4-3-5-4m10 18-6 1m10 3 1-6"/>
    <path d="M37 68Q21 59 19 39m3 14-6-2m8 5 2-6m-4-3-5-4m10 18-6 1m10 3 1-6" transform="translate(100 0) scale(-1 1)"/>
  </g>` : "";
  const gems = land >= 9 ? `<path d="M50 9l4 5-4 5-4-5Zm-30 17 2 4-2 4-2-4Zm60 0 2 4-2 4-2-4Z" fill="${ink}" opacity=".9"/>` : "";
  const marks = Array.from({ length: 1 + (step % 5) }, (_, index) =>
    `<circle cx="${50 + (index - (step % 5) / 2) * 5}" cy="64" r="1.2"/>`).join("");

  return `<svg class="journey-badge" viewBox="0 0 100 106" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${gradient}" x2=".9" y2="1"><stop stop-color="${light}"/><stop offset=".88" stop-color="${shade}"/></linearGradient></defs>
    <path d="${outline}" transform="translate(0 3)" fill="${shade}" opacity=".38"/>
    <path d="${outline}" fill="url(#${gradient})" stroke="${rim}" stroke-width="${land < 3 ? 2.5 : 3.2}" stroke-linejoin="round"/>
    ${engraving}${rays}${laurels}${gems}
    <circle cx="50" cy="43" r="${land < 4 ? 19 : 22}" fill="${shade}" fill-opacity=".82" stroke="${rim}" stroke-width="1.2"/>
    <g transform="translate(34 27) scale(1.33)" color="${ink}" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
    <g fill="${ink}">${marks}</g>
    <rect x="21" y="70" width="58" height="18" rx="9" fill="${shade}" stroke="${rim}" stroke-width="1.25"/>
    <text x="50" y="83.25" fill="${ink}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13.5" font-weight="750">${level}</text>
  </svg>`;
}
