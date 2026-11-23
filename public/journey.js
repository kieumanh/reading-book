import { journeyLands, journeyLevels } from "./journey-levels.js";
import { journeyBadge } from "./journey-badges.js";
import { formatXp, journeyProgress, MAX_READING_LEVEL, xpAtLevel } from "./journey-score.js";

const traveler = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11h14M8 11l1.7-5h4.6l1.7 5m-7 1.4a3 3 0 0 0 6 0M6 21v-1a6 6 0 0 1 12 0v1"/></svg>';
const compass = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-1.8 5.2-5.2 1.8 1.8-5.2 5.2-1.8Z"/></svg>';
const locked = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="8" height="6" rx="1.4"/><path d="M5.5 7V5a2.5 2.5 0 1 1 5 0v2"/></svg>';

export function getJourneyLevel(level) {
  return journeyLevels[level - 1];
}

function progressText(progress) {
  return progress.next === null
    ? "Bạn đã tới Đỉnh Thông Tuệ."
    : `Còn <strong>${formatXp(progress.next - progress.xp)} XP</strong> đến cấp ${progress.level + 1}.`;
}

function progressBar(progress) {
  return `<progress value="${progress.percent}" max="100" aria-label="Tiến độ giữa hai cấp">${progress.percent}%</progress>`;
}

export function journeyOverview(record) {
  const progress = journeyProgress(record);
  const level = getJourneyLevel(progress.level);
  return `<section class="journey-overview" aria-label="Hành trình đọc sách">
    <div class="journey-overview-mark">${level ? journeyBadge(level, "overview") : compass}</div>
    <div class="journey-overview-content">
      <h2>${level ? `Cấp ${level.level} · ${level.title}` : "Bắt đầu hành trình"}</h2>
      <p>${formatXp(progress.xp)} XP · ${progressText(progress)}</p>
      ${progressBar(progress)}
    </div>
    <a href="#hanh-trinh" class="button secondary">Mở bản đồ</a>
  </section>`;
}

function slot(index, columns, count) {
  if (count === 1) return { column: (columns - 1) / 2, row: 0 };
  const row = Math.floor(index / columns);
  const lane = index % columns;
  return { column: row % 2 ? columns - 1 - lane : lane, row };
}

function routeGraphic(count, columns, className, passed) {
  if (count < 2) return "";
  const points = Array.from({ length: count }, (_, index) => {
    const { column, row } = slot(index, columns, count);
    return [column * 100 + 50, row * 100 + 50];
  });
  const segments = points.slice(1).map(([x, y], index) => {
    const [fromX, fromY] = points[index];
    if (y === fromY) return `L${x} ${y}`;
    const curve = fromX + (fromX > columns * 50 ? 52 : -52);
    return `C${curve} ${fromY} ${curve} ${y} ${x} ${y}`;
  });
  const path = length => `M${points[0].join(" ")} ${segments.slice(0, length).join(" ")}`;
  return `<svg class="journey-route ${className}" viewBox="0 0 ${columns * 100} ${100 * Math.ceil(count / columns)}" preserveAspectRatio="none" aria-hidden="true">
    <path class="journey-trail" d="${path(segments.length)}" vector-effect="non-scaling-stroke"/>
    ${passed > 1 ? `<path class="journey-trail-covered" d="${path(passed - 1)}" vector-effect="non-scaling-stroke"/>` : ""}
  </svg>`;
}

function landmark(item, progress, count, avatar) {
  const { level, step } = item;
  const here = level === progress.level;
  const status = here ? "Vị trí của bạn" : level < progress.level ? "Đã mở" : "Chưa mở";
  const desktop = slot(step, 5, count);
  const mobile = slot(step, 3, count);
  return `<li class="journey-pin" style="--desktop-col:${desktop.column + 1};--desktop-row:${desktop.row + 1};--mobile-col:${mobile.column + 1};--mobile-row:${mobile.row + 1}">
    <button type="button" class="journey-stop ${level > progress.level ? "is-locked" : "is-open"}" id="journey-stop-${level}"
      data-action="journey-detail" data-level="${level}" title="Cấp ${level} · ${item.title}" aria-label="Cấp ${level}, ${item.title}, ${status}" ${here ? 'aria-current="step"' : ""}>
      ${here ? `<span class="journey-location"><span class="journey-token">${avatar || traveler}</span><span>Bạn ở đây</span></span>` : ""}
      ${journeyBadge(item, "map")}
      ${level > progress.level ? `<span class="journey-lock">${locked}</span>` : ""}
    </button>
  </li>`;
}

function region(land, progress, avatar) {
  const { index, name, description, levels } = land;
  const first = levels[0].level;
  const last = levels.at(-1).level;
  const passed = Math.max(0, Math.min(levels.length, progress.level - first + 1));
  const containsPlayer = progress.level >= first && progress.level <= last;
  return `<section class="journey-region ${containsPlayer ? "is-current-region" : ""}" id="journey-land-${index}" tabindex="-1" aria-labelledby="journey-land-title-${index}">
    <div class="journey-region-heading">
      <div>
        <p class="journey-range">${first === last ? `Cấp ${first}` : `Cấp ${first}–${last}`}</p>
        <h3 id="journey-land-title-${index}">${name}</h3>
        <p>${description}</p>
      </div>
      <span class="journey-region-count">${passed}/${levels.length}</span>
    </div>
    ${index === 0 && progress.level === 0 ? `<div id="journey-start" class="journey-start" tabindex="-1"><span class="journey-token">${avatar || traveler}</span><span>Bạn ở đây · Điểm khởi hành</span></div>` : ""}
    <div class="journey-stage ${first === last ? "journey-stage-final" : ""}">
      ${routeGraphic(levels.length, 5, "route-wide", passed)}
      ${routeGraphic(levels.length, 3, "route-narrow", passed)}
      <ol class="journey-path" start="${first}" role="list" aria-label="Các chặng của ${name}">
        ${levels.map(item => landmark(item, progress, levels.length, avatar)).join("")}
      </ol>
    </div>
  </section>`;
}

export function journeyView(record, { demo, avatar }) {
  const progress = journeyProgress(record);
  const level = getJourneyLevel(progress.level);
  const unread = progress.level - progress.seen;
  return `<div class="journey-view">
    <section class="journey-hero" aria-labelledby="journey-title">
      <div>
        <h1 id="journey-title">Hành trình<br>đọc sách</h1>
        <p>111 chặng từ trang sách đầu tiên đến Đỉnh Thông Tuệ.</p>
        ${demo ? '<span class="journey-demo">Bản đồ dùng thử</span>' : ""}
      </div>
      <div class="journey-pass">
        <div class="journey-pass-mark">${level ? journeyBadge(level, "pass") : compass}</div>
        <div>
          <p>${level ? `Cấp ${level.level} / ${MAX_READING_LEVEL}` : "Điểm khởi hành"}</p>
          <h2>${level ? level.title : "Chưa mở huy hiệu"}</h2>
          <p>${formatXp(progress.chapters)} chương · ${formatXp(progress.books)} sách hoàn thành</p>
          <p>${formatXp(progress.xp)} XP · ${progressText(progress)}</p>
          ${progressBar(progress)}
        </div>
      </div>
    </section>
    <details class="journey-rules">
      <summary>Cách tính XP và mở cấp</summary>
      <p><strong>1 chương đã đọc = 1 XP</strong> và <strong>1 sách hoàn thành = thêm 1 XP</strong>. Podcast theo dõi riêng.</p>
      <p>Huy hiệu đã đạt được giữ lại khi sửa hoặc xóa sách. Việc ghi lại cùng số chương trong một mục sách giữ nguyên XP.</p>
      <p>Mốc XP được nhân đôi qua từng cấp: 1, 2, 4, 8, 16… Cấp 111 cần 2<sup>110</sup> XP, một đích biểu tượng trên bản đồ.</p>
    </details>
    <section class="journey-atlas" aria-labelledby="journey-map-title">
      <div class="journey-atlas-heading">
        <div><h2 id="journey-map-title" tabindex="-1">Bản đồ 111 chặng</h2><p>Chạm huy hiệu để xem danh hiệu và mốc XP.</p></div>
        ${unread ? `<button type="button" class="button" data-action="journey-new">Xem lời chúc mới (${unread})</button>` : ""}
      </div>
      <div class="journey-map-controls">
        <label class="control-label">Đi đến vùng<select id="journey-land-picker">
          ${journeyLands.map(land => `<option value="${land.index}" ${land.index === (level?.land ?? 0) ? "selected" : ""}>${land.name}</option>`).join("")}
        </select></label>
        <button type="button" class="button secondary" data-action="journey-location">${compass} Vị trí của tôi</button>
      </div>
      <div class="journey-regions">
        ${journeyLands.map(land => region(land, progress, avatar)).join("")}
      </div>
    </section>
  </div>`;
}

export function journeyLevelDetails(item, progress) {
  const reached = item.level <= progress.level;
  return `<div class="journey-detail">
    ${journeyBadge(item, "detail")}
    <p class="journey-range">${journeyLands[item.land].name} · ${reached ? "Đã mở huy hiệu" : "Chưa mở huy hiệu"}</p>
    <p class="journey-insight">${item.insight}</p>
    <p class="journey-xp">Mốc mở cấp <strong>${formatXp(xpAtLevel(item.level))} XP</strong></p>
    ${reached ? `<blockquote>“${item.quote}”</blockquote>` : ""}
  </div>`;
}

export function journeyReward(item, remaining) {
  return `<div class="journey-reward-content">
    ${journeyBadge(item, "reward")}
    <h2 id="journey-reward-title">Chúc mừng lên cấp ${item.level}!</h2>
    <p class="journey-reward-name">${item.title}</p>
    <blockquote>“${item.quote}”</blockquote>
    <div class="form-actions">
      <button type="button" class="button" data-action="journey-reward-next" autofocus>${remaining ? `Lời chúc tiếp theo (${remaining})` : "Tiếp tục đọc"}</button>
      ${remaining ? '<button type="button" class="button secondary" data-action="journey-reward-later">Xem sau</button>' : ""}
    </div>
  </div>`;
}
