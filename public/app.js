import { samples, views } from "./catalog.js";
import { quotes } from "./quotes.js";

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  book: '<path d="M12 6.5C9.5 4 6 4 3 5v14c3-1 6.5-1 9 1.5 2.5-2.5 6-2.5 9-1.5V5c-3-1-6.5-1-9 1.5Zm0 0v14"/>',
  headphones: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="12" width="5" height="8" rx="2"/><rect x="16" y="12" width="5" height="8" rx="2"/>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.4 1.2Z" transform="translate(-1.3 -.7)"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  chart: '<path d="M4 4v16h16M8 15l4-4 3 2 5-7"/>',
  spark: '<path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10ZM19 2v4m-2-2h4"/>',
  user: '<circle cx="12" cy="8" r="3"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/>'
};

const $ = selector => document.querySelector(selector);
const content = $("#content");
const editor = $("#editor");
const reminder = $("#reminder");
const sortCollator = new Intl.Collator("vi", { sensitivity: "base" });
const weekdays = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const guestDefaults = { name: "Bạn đọc", avatar: "", theme: "auto", reminders: true, fireworks: true };
const keys = { items: "readingbook-demo-v1", profile: "readingbook-guest-v1", reminder: "readingbook-quote-v1" };
const state = {
  user: null,
  guest: readLocal(keys.profile, guestDefaults),
  demo: readLocal(keys.items, samples),
  items: [],
  view: "",
  filters: { query: "", category: "", status: "" },
  quote: 0,
  dismissed: "",
  pending: false,
  offline: false,
  weekly: null,
  install: null
};

function readLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function icon(name) {
  return `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg></span>`;
}

function button(label, action, { glyph = "", extra = "", data = "", type = "button" } = {}) {
  return `<button type="${type}" class="button ${extra}" data-action="${action}" ${data}>${glyph ? icon(glyph) : ""}${label}</button>`;
}

function safeImage(value) {
  return /^\/assets\/cover-[1-6]\.webp$/.test(value || "") ||
    /^data:image\/jpeg;base64,\/9j\/[a-z0-9+/]+={0,2}$/i.test(value || "") ? escapeHtml(value) : "";
}

function allItems() {
  return state.user ? state.items : state.demo;
}

function profile() {
  return state.user || state.guest;
}

function isBook(item) {
  return item.type === "book";
}

function unit(item, capital = false) {
  if (isBook(item)) return capital ? "Chương" : "chương";
  return capital ? "Tập" : "tập";
}

function status(item) {
  if (item.done >= item.total) return "done";
  return item.done > 0 ? "active" : "new";
}

function titleRow(title, description, action = "") {
  return `<div class="intro"><div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}

function addButton(label = "Thêm sách") {
  return button(label, "add", { glyph: "plus" });
}

function progressBlock(item) {
  const percent = Math.round((item.done * 100) / item.total);
  return `<div class="progress-block">
    <div class="progress-label"><span>${item.done} / ${item.total} ${unit(item)}</span><strong>${percent}%</strong></div>
    <progress value="${item.done}" max="${item.total}" aria-label="Tiến độ ${escapeHtml(item.title)}">${percent}%</progress>
  </div>`;
}

function checkpoint(item) {
  if (status(item) === "done") return "Đã hoàn thành";
  return item.checkpoint || `${unit(item, true)} ${item.done + 1}`;
}

function itemCard(item) {
  const text = status(item) === "done" ? "Xem lại" : (isBook(item) ? "Đọc tiếp" : "Nghe tiếp");
  const cover = safeImage(item.cover);
  const title = escapeHtml(item.title);
  return `<article class="card">
    <div class="card-cover">
      ${cover ? `<img src="${cover}" alt="" width="320" height="150" loading="lazy">` : icon(isBook(item) ? "book" : "headphones")}
      <span class="tag">${icon(isBook(item) ? "book" : "headphones")}${isBook(item) ? "Sách đọc" : "Podcast"}</span>
      <button class="round" data-action="star" data-id="${item.id}" aria-label="Đánh dấu sao cho ${title}" aria-pressed="${item.starred}">${icon("star")}</button>
    </div>
    <div class="card-body">
      <h3>${title}</h3>
      <p class="meta">${escapeHtml(item.author)}${item.category ? " · " + escapeHtml(item.category) : ""}</p>
      ${item.summary ? `<p class="summary">${escapeHtml(item.summary)}</p>` : ""}
      <p class="checkpoint">${escapeHtml(checkpoint(item))}</p>
      ${progressBlock(item)}
      ${button(text, "detail", { glyph: "arrow", extra: "secondary", data: `data-id="${item.id}" aria-label="${text} — ${title}"` })}
    </div>
  </article>`;
}

function itemGrid(items) {
  return `<div class="card-grid">${items.map(itemCard).join("")}</div>`;
}

function empty(title, message, action = "") {
  return `<div class="empty"><strong>${title}</strong><p>${message}</p>${action}</div>`;
}

function sectionHead(title, note = "", action = "") {
  return `<div class="section-head"><div><h2>${title}</h2>${note ? `<p>${note}</p>` : ""}</div>${action}</div>`;
}

function navButton(label, view, secondary = true) {
  return `<a href="#${view}" class="button ${secondary ? "secondary" : "hero-button"}">${label}${icon("arrow")}</a>`;
}

function overview() {
  const items = allItems();
  const books = items.filter(isBook);
  const podcasts = items.filter(item => !isBook(item));
  const shelves = [books, podcasts];
  const totals = shelves.map(entries => entries.reduce((stats, item) => ({
    done: stats.done + item.done,
    total: stats.total + item.total
  }), { done: 0, total: 0 }));
  const priorities = items.filter(item => item.starred && status(item) !== "done").sort((a, b) => b.updated - a.updated);
  const recent = items.filter(item => status(item) === "active").sort((a, b) => b.updated - a.updated);
  const feature = priorities[0] || recent[0];
  const stat = (glyph, value, label) => `<div class="stat"><span class="stat-icon">${icon(glyph)}</span><div><strong>${value}</strong><small>${label}</small></div></div>`;

  return `${titleRow("Hôm nay đọc gì?", state.user ? `Chào ${escapeHtml(state.user.name)}. Thư viện của bạn ở đây.` : "Theo dõi những trang đã đọc và những câu chuyện đang nghe.", addButton())}
    <section class="hero" aria-label="Chào mừng đến Reading Book">
      <div class="hero-content">
        <p class="hero-script">Mỗi chương, một bước.</p>
        <h2>Ghé lại cùng<br>một trang sách.</h2>
        <p>Đọc, nghe và lưu lại tiến độ theo nhịp của bạn.</p>
        ${feature ? button(isBook(feature) ? "Đọc tiếp" : "Nghe tiếp", "detail", { extra: "hero-button", glyph: "arrow", data: `data-id="${feature.id}"` }) : navButton("Mở thư viện", "sach-doc", false)}
      </div>
    </section>
    <section class="section">
      ${sectionHead("Tiến độ thư viện")}
      <div class="stats">
        ${stat("book", `${books.filter(item => status(item) === "done").length}/${books.length}`, "Sách đã đọc xong")}
        ${stat("layers", `${totals[0].done}/${totals[0].total}`, "Chương đã đọc")}
        ${stat("headphones", `${totals[1].done}/${totals[1].total}`, "Tập đã nghe")}
      </div>
      ${items.length ? `<div class="note" role="group" aria-label="Tỷ lệ hoàn thành">
        <span>${totals[0].total ? Math.round(100 * totals[0].done / totals[0].total) : 0}% số chương</span>
        <span>·</span>
        <span>${totals[1].total ? Math.round(100 * totals[1].done / totals[1].total) : 0}% số tập</span>
      </div>` : ""}
    </section>
    <section class="section">
      ${sectionHead("Ưu tiên hoàn thành", "Những mục có sao mà bạn đang muốn trở lại.", navButton("Tất cả mục có sao", "danh-dau"))}
      ${priorities.length ? itemGrid(priorities.slice(0, 3)) : empty("Chưa có mục ưu tiên", "Đánh dấu sao cho một cuốn sách hoặc podcast để đưa mục đó lên đây.")}
    </section>
    ${recent.filter(item => !item.starred).length ? `<section class="section">
      ${sectionHead("Đang đọc và nghe")}${itemGrid(recent.filter(item => !item.starred).slice(0, 3))}
    </section>` : ""}
    ${reminderStrip()}
    ${state.user ? "" : `<div class="note">${icon("user")}<span>Bạn đang dùng thử với dữ liệu minh họa. Mục thêm ở chế độ này lưu trong trình duyệt.</span>${button("Tạo tài khoản", "register", { extra: "secondary" })}</div>`}`;
}

function reminderStrip() {
  if (!profile().reminders || state.dismissed === getDismissalKey()) return "";
  return `<div class="note" id="daily-reminder">
    ${icon("spark")}<span>Lời nhắc hôm nay · ${quotes[state.quote]}</span>
    ${button("Mở lời nhắc", "reminder", { extra: "secondary" })}
    <button type="button" class="round" data-action="dismiss-daily" aria-label="Ẩn lời nhắc hôm nay">${icon("close")}</button>
  </div>`;
}

function baseShelf() {
  return allItems().filter(item => {
    if (state.view === "sach-doc") return isBook(item);
    if (state.view === "podcast") return !isBook(item);
    return item.starred;
  });
}

function library() {
  const starred = state.view === "danh-dau";
  const podcast = state.view === "podcast";
  const label = starred ? "Đánh dấu sao" : (podcast ? "Podcast" : "Sách đọc");
  const description = starred ? "Những mục bạn muốn dành thời gian trước." : (podcast ? "Lưu podcast và nhớ tập đang nghe." : "Ghi lại sách, từng chương và chỗ bạn dừng.");
  const categories = [...new Set(baseShelf().map(item => item.category).filter(Boolean))].sort(sortCollator.compare);
  return `${titleRow(label, description, starred ? "" : addButton(podcast ? "Thêm podcast" : "Thêm sách"))}
    <div class="controls">
      <label class="control-label">Tìm trong thư viện<input type="search" id="search" placeholder="Tên, tác giả hoặc thể loại" value="${escapeHtml(state.filters.query)}"></label>
      <label class="control-label">Thể loại<select id="category-filter"><option value="">Tất cả thể loại</option>${categories.map(category =>
        `<option ${category === state.filters.category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}</select></label>
      <label class="control-label">Tiến độ<select id="status-filter">
        ${[["", "Tất cả tiến độ"], ["new", "Chưa bắt đầu"], ["active", "Đang theo dõi"], ["done", "Đã hoàn thành"]].map(([value, text]) =>
          `<option value="${value}" ${value === state.filters.status ? "selected" : ""}>${text}</option>`).join("")}
      </select></label>
    </div>
    <div id="results"></div>`;
}

function normalizeSearch(value) {
  return value.toLocaleLowerCase("vi").normalize("NFD").replace(/\p{Diacritic}/gu, "").replaceAll("đ", "d").trim();
}

function refreshResults() {
  const results = $("#results");
  if (!results) return;
  const { query, category, status: progress } = state.filters;
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const found = baseShelf().filter(item =>
    (!category || item.category === category) && (!progress || status(item) === progress) &&
    words.every(word => normalizeSearch([item.title, item.author, item.category, item.summary].join(" ")).includes(word))
  ).sort((a, b) => {
    const priority = item => (status(item) === "done" ? 0 : item.starred ? 2 : 1);
    return priority(b) - priority(a) || b.updated - a.updated;
  });
  results.innerHTML = found.length ? itemGrid(found) : empty("Chưa tìm thấy mục nào", query || category || progress ?
    "Thử thay đổi từ khóa hoặc bộ lọc." : "Danh sách này sẽ hiện các mục bạn lưu.");
}

function settings() {
  const user = profile();
  const identity = state.user ? `<form class="form" data-form="profile">
    <label class="control-label">Tên hiển thị<input name="name" maxlength="60" required value="${escapeHtml(user.name)}"></label>
    <label class="control-label">Ảnh đại diện<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp"></label>
    ${user.avatar ? '<label class="check"><input type="checkbox" name="removeAvatar"> Xóa ảnh đại diện</label>' : ""}
    <p class="error" role="alert" hidden></p>${button("Lưu hồ sơ", "", { type: "submit" })}
  </form>` : `<p>Tạo tài khoản để đồng bộ thư viện và hồ sơ trên các thiết bị.</p>
    <div class="form-actions">${button("Đăng nhập", "login")}${button("Tạo tài khoản", "register", { extra: "secondary" })}</div>`;

  return `${titleRow("Cài đặt", "Tùy chỉnh Reading Book theo thói quen của bạn.")}
  <div class="settings-grid">
    <section class="panel"><h2>Hồ sơ</h2>${identity}</section>
    <section class="panel"><h2>Giao diện và lời nhắc</h2>
      <form class="form" data-form="preferences">
        <label class="control-label">Giao diện<select name="theme">${[
          ["auto", "Theo giờ thiết bị"], ["light", "Luôn sáng"], ["dark", "Luôn tối"]
        ].map(([value, text]) => `<option value="${value}" ${value === user.theme ? "selected" : ""}>${text}</option>`).join("")}</select></label>
        <label class="check"><input name="reminders" type="checkbox" ${user.reminders ? "checked" : ""}> Hiện lời nhắc đọc sách hằng ngày</label>
        <label class="check"><input name="fireworks" type="checkbox" ${user.fireworks ? "checked" : ""}> Bật hiệu ứng pháo hoa trong lời nhắc</label>
        <p class="error" role="alert" hidden></p>${button("Lưu tùy chỉnh", "", { type: "submit" })}
      </form>
    </section>
    ${weeklySettings()}
    <section class="panel" id="install"><h2>Cài đặt trên trình duyệt</h2>
      ${state.install ? button("Cài Reading Book", "install", { glyph: "plus" }) : ""}
      <ul>
        <li><strong>Android hoặc máy tính:</strong> mở menu Chrome/Edge, chọn <em>Cài đặt ứng dụng</em> hoặc <em>Thêm vào màn hình chính</em>.</li>
        <li><strong>iPhone/iPad:</strong> trong Safari, chạm <em>Chia sẻ</em> rồi chọn <em>Thêm vào màn hình chính</em>.</li>
      </ul>
    </section>
    ${state.user ? `<section class="panel"><h2>Phiên đăng nhập</h2><p>${state.user.role === "admin" ? "Quản trị viên" : "Đang đăng nhập"} · <strong>${escapeHtml(state.user.username)}</strong></p>
      ${button("Đăng xuất", "logout", { extra: "secondary danger" })}</section>` : ""}
  </div>`;
}

function weeklySettings() {
  const weekly = state.weekly;
  const enabled = Number.isInteger(weekly?.weekday);
  return `<section class="panel"><h2>Thông báo hằng tuần</h2>
    ${state.user ? `<p>Nhận lời nhắc đọc sách lúc 19:00 (giờ Việt Nam), vào ngày bạn chọn. Lịch áp dụng cho phiên đăng nhập trên trình duyệt này.</p>
      <form class="form" data-form="weekly">
        <label class="control-label">Ngày gửi<select name="weekday">
          ${weekdays.map((day, index) => `<option value="${index}" ${index === (weekly?.weekday ?? 1) ? "selected" : ""}>${day}</option>`).join("")}
        </select></label>
        <p class="hint">${enabled ? "Đã bật lời nhắc vào " + weekdays[weekly.weekday] + "." : "Chưa bật lời nhắc hằng tuần."}</p>
        <p class="error" role="alert" hidden></p>
        <div class="form-actions">
          ${button(enabled ? "Lưu ngày gửi" : "Bật thông báo", "", { type: "submit" })}
          ${enabled ? button("Tắt thông báo", "weekly-off", { extra: "secondary" }) : ""}
        </div>
      </form>` : "<p>Đăng nhập để chọn ngày gửi và bật thông báo trên trình duyệt.</p>"}
  </section>`;
}

async function loadWeekly() {
  const username = state.user?.username;
  if (!username) return;
  try {
    const weekly = await api("weekly");
    if (state.user?.username !== username) return;
    state.weekly = weekly;
    // Leave focused form fields intact while preferences are being edited.
    if (state.view === "cai-dat" && !state.pending && !document.activeElement?.closest("form")) render();
  } catch {
    // The save action reports an error if the schedule cannot be reached.
  }
}

async function subscribeWeekly(weekday) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    throw Error("Trình duyệt này chưa hỗ trợ thông báo. Trên iPhone/iPad, hãy mở Reading Book từ màn hình chính.");
  }
  if (Notification.permission !== "granted" && await Notification.requestPermission() !== "granted") {
    throw Error("Hãy cho phép thông báo cho Reading Book trong cài đặt của trình duyệt.");
  }
  const { key } = state.weekly || await api("weekly");
  if (!key) throw Error("Thông báo trình duyệt chưa được cấu hình.");
  const worker = await navigator.serviceWorker.getRegistration();
  if (!worker?.active) throw Error("Ứng dụng đang tải. Hãy thử lại sau khi trình duyệt hoàn tất.");
  const current = await worker.pushManager.getSubscription();
  const subscription = current || await worker.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  const saved = await api("weekly", "PUT", { endpoint: subscription.endpoint, weekday });
  state.weekly = { key, ...saved };
}

function render() {
  const view = views.find(item => item.id === location.hash.slice(1)) || views[0];
  if (view.id !== state.view) {
    state.view = view.id;
    state.filters = { query: "", category: "", status: "" };
  }
  $("#navigation").innerHTML = views.map(item => `<a class="nav-link" href="#${item.id}" ${item.id === state.view ? 'aria-current="page"' : ""}>
    ${icon(item.icon)}<span class="nav-full">${item.label}</span><span class="nav-short">${item.mobile}</span>
  </a>`).join("");
  $("#breadcrumb").textContent = view.label;
  $("#bell").innerHTML = icon("bell");
  const user = profile();
  const avatar = safeImage(user.avatar);
  const account = $("#account");
  account.setAttribute("aria-label", state.user ? "Cài đặt hồ sơ" : "Đăng nhập vào Reading Book");
  account.innerHTML = `<span class="avatar">${avatar ? `<img src="${avatar}" alt="">` : state.user ? escapeHtml(user.name.trim()[0]?.toUpperCase()) : icon("user")}</span>
    <span><strong>${escapeHtml(user.name)}</strong><small>${state.user ? "Hồ sơ" : "Dùng thử"}</small></span><span>${icon("chevron")}</span>`;
  content.innerHTML = state.view === "tong-quan" ? overview() : state.view === "cai-dat" ? settings() : library();
  if (state.offline) content.insertAdjacentHTML("afterbegin", '<p class="note">Không kết nối được tài khoản. Dữ liệu đang hiển thị thuộc chế độ dùng thử.</p>');
  refreshResults();
  applyTheme();
}

function applyTheme() {
  const configured = profile().theme;
  const hour = new Date().getHours();
  const theme = configured !== "auto" ? configured : hour >= 21 || hour < 5 ? "dark" :
    hour < 9 ? "morning" : hour >= 17 ? "dusk" : "light";
  document.documentElement.dataset.theme = theme;
  $('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#132820" : "#244636");
}

function getDay() {
  const date = new Date();
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

function getDismissalKey() {
  return `${state.user?.username || "guest"}:${getDay()}`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.hidden = false;
  toast.textContent = message;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 4200);
}

function dialogTitle(title) {
  return `<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button type="button" class="round" data-action="close" aria-label="Đóng">${icon("close")}</button></div>`;
}

function openEditor(title, contents) {
  editor.innerHTML = dialogTitle(title) + contents;
  if (!editor.open) editor.showModal();
  else editor.querySelector("input, button")?.focus();
  editor.scrollTop = 0;
}

function openItemForm(item) {
  const type = item?.type || (state.view === "podcast" ? "podcast" : "book");
  const summary = item?.summary || "";
  openEditor(item ? "Chỉnh sửa mục" : (type === "podcast" ? "Thêm podcast" : "Thêm sách"), `
    <form class="form" data-form="item" data-id="${item?.id || ""}">
      <div class="form-row">
        <label class="control-label">Loại nội dung<select name="type"><option value="book" ${type === "book" ? "selected" : ""}>Sách đọc</option><option value="podcast" ${type === "podcast" ? "selected" : ""}>Podcast</option></select></label>
        <label class="control-label">Thể loại<input name="category" maxlength="60" value="${escapeHtml(item?.category)}" placeholder="Ví dụ: Tản văn"></label>
      </div>
      <label class="control-label"><span data-type-label="title">${type === "book" ? "Tên sách" : "Tên podcast"}</span><input name="title" maxlength="120" value="${escapeHtml(item?.title)}" required></label>
      <label class="control-label">Tác giả hoặc người dẫn<input name="author" maxlength="100" value="${escapeHtml(item?.author)}" required></label>
      <label class="control-label">Ảnh bìa<input name="cover" type="file" accept="image/jpeg,image/png,image/webp"></label>
      ${item?.cover ? '<label class="check"><input type="checkbox" name="removeCover"> Xóa ảnh bìa</label>' : ""}
      <label class="control-label">Tóm tắt<textarea name="summary" maxlength="2000">${escapeHtml(summary)}</textarea></label>
      <div class="form-row">
        <label class="control-label"><span data-type-label="total">${type === "book" ? "Tổng số chương" : "Tổng số tập"}</span><input type="number" name="total" min="1" max="9999" required value="${item?.total || ""}"></label>
        <label class="control-label">Đã hoàn thành<input type="number" name="done" min="0" max="9999" required value="${item?.done || 0}"></label>
      </div>
      <label class="control-label">Điểm dừng<input name="checkpoint" maxlength="240" value="${escapeHtml(item?.checkpoint)}" placeholder="Ví dụ: Chương 4 · trang 62"></label>
      <label class="control-label">Liên kết đọc hoặc nghe<input type="url" name="link" maxlength="600" value="${escapeHtml(item?.link)}" placeholder="https://"></label>
      <label class="check"><input name="starred" type="checkbox" ${item?.starred ? "checked" : ""}> Đánh dấu sao để ưu tiên</label>
      <p class="error" role="alert" hidden></p>
      <div class="form-actions">${button("Lưu vào thư viện", "", { type: "submit" })}${button("Hủy", "close", { extra: "secondary" })}</div>
    </form>`);
}

function itemDetail(item) {
  const cover = safeImage(item.cover);
  const canLink = /^https?:\/\//i.test(item.link);
  openEditor(escapeHtml(item.title), `<div class="dialog-body">
    ${cover ? `<img class="detail-cover" src="${cover}" alt="">` : ""}
    <p class="detail-meta">${escapeHtml(item.author)}${item.category ? " · " + escapeHtml(item.category) : ""}${item.demo ? " · Mục minh họa" : ""}</p>
    ${item.summary ? `<p class="detail-copy detail-summary">${escapeHtml(item.summary)}</p>` : ""}
    ${progressBlock(item)}
    <form class="form" data-form="progress" data-id="${item.id}">
      <label for="done-count" class="control-label">Số ${unit(item)} đã hoàn thành</label>
      <div class="counter">
        <button class="step" type="button" data-action="step" data-delta="-1" aria-label="Bớt một">−</button>
        <input id="done-count" type="number" name="done" min="0" max="${item.total}" value="${item.done}" required>
        <button class="step" type="button" data-action="step" data-delta="1" aria-label="Thêm một">+</button>
      </div>
      <label class="control-label">Điểm dừng<input name="checkpoint" maxlength="240" value="${escapeHtml(item.checkpoint)}" placeholder="${escapeHtml(checkpoint(item))}"></label>
      <p class="error" role="alert" hidden></p>
      <div class="form-actions">
        ${button("Lưu tiến độ", "", { type: "submit" })}
        ${canLink ? `<a class="button secondary" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">${isBook(item) ? "Mở link đọc" : "Mở link nghe"}${icon("arrow")}</a>` : ""}
        ${button("Chỉnh sửa", "edit", { extra: "secondary", data: `data-id="${item.id}"` })}
        ${button("Xóa", "confirm-remove", { extra: "secondary danger", data: `data-id="${item.id}"` })}
      </div>
    </form>
  </div>`);
}

function authForm(registering) {
  openEditor(registering ? "Tạo tài khoản" : "Đăng nhập", `<form class="form" data-form="${registering ? "register" : "login"}">
    ${registering ? '<label class="control-label">Tên hiển thị<input name="name" maxlength="60" autocomplete="nickname" required></label>' : ""}
    <label class="control-label">${registering ? "Email" : "Email hoặc tên đăng nhập"}<input type="${registering ? "email" : "text"}" name="username" maxlength="254" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" required></label>
    <label class="control-label">Mật khẩu<input name="password" type="password" minlength="10" maxlength="128" autocomplete="${registering ? "new-password" : "current-password"}" required></label>
    ${registering ? '<label class="control-label">Nhập lại mật khẩu<input name="confirmPassword" type="password" minlength="10" maxlength="128" autocomplete="new-password" required></label><p class="hint">Dùng ít nhất 10 ký tự.</p>' : ""}
    <p class="error" role="alert" hidden></p>
    <div class="form-actions">
      ${button(registering ? "Tạo tài khoản" : "Đăng nhập", "", { type: "submit" })}
      ${button(registering ? "Đã có tài khoản" : "Tạo tài khoản", registering ? "login" : "register", { extra: "secondary" })}
    </div>
  </form>`);
}

function openReminder() {
  reminder.className = "reminder-dialog";
  reminder.innerHTML = `<div class="dialog-head"><button type="button" class="round" data-action="close-reminder" aria-label="Đóng lời nhắc">${icon("close")}</button></div>
    <div class="dialog-body">
      <span class="quote-icon">${icon("spark")}</span>
      <h2 id="reminder-title">Một lời nhắc đọc sách</h2>
      <blockquote>“${quotes[state.quote]}”</blockquote>
      <div class="form-actions">${button("Lời nhắc kế tiếp", "next-quote", { glyph: "arrow" })}</div>
    </div>`;
  if (!reminder.open) reminder.showModal();
  else reminder.querySelector('[data-action="next-quote"]').focus();

  if (!profile().fireworks || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 20; i++) {
    const bit = document.createElement("i");
    const angle = Math.PI * 2 * i / 20;
    const distance = (i % 3) * 17 + 55;
    bit.className = "particle";
    bit.setAttribute("aria-hidden", "true");
    bit.style.setProperty("--dx", `${Math.round(Math.cos(angle) * distance)}px`);
    bit.style.setProperty("--dy", `${Math.round(Math.sin(angle) * distance)}px`);
    bit.style.setProperty("--particle", ["#eab56d", "#74a482", "#ba754c"][i % 3]);
    bit.addEventListener("animationend", () => bit.remove(), { once: true });
    reminder.append(bit);
  }
}

async function api(path, method = "GET", body) {
  const response = await fetch("/api/" + path, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (!response.headers.get("Content-Type")?.includes("application/json")) throw Error("Không thể kết nối với máy chủ.");
  const data = await response.json();
  if (!response.ok) throw Error(data.error || "Không thể thực hiện thao tác.");
  return data;
}

async function saveItem(item) {
  if (state.user) {
    const result = await api("library/" + item.id, "PUT", item);
    state.items = [result.item, ...state.items.filter(previous => previous.id !== item.id)];
  } else {
    const library = [{ ...item, updated: Date.now() }, ...state.demo.filter(previous => previous.id !== item.id)];
    writeLocal(keys.items, library);
    state.demo = library;
  }
}

async function removeItem(id) {
  if (state.user) {
    await api("library/" + id, "DELETE");
    state.items = state.items.filter(previous => previous.id !== id);
  } else {
    const library = state.demo.filter(previous => previous.id !== id);
    writeLocal(keys.items, library);
    state.demo = library;
  }
}

async function saveProfile(next) {
  if (state.user) {
    state.user = (await api("profile", "PUT", next)).user;
  } else {
    writeLocal(keys.profile, next);
    state.guest = next;
  }
}

async function convertImage(file, width) {
  if (!file?.size) return "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
    throw Error("Hãy chọn ảnh JPG, PNG hoặc WebP tối đa 8 MB.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, width / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f7f5ee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.68, 0.5, 0.34]) {
      const preview = canvas.toDataURL("image/jpeg", quality);
      if (preview.length <= 175000) return preview;
    }
    throw Error("Ảnh vẫn quá lớn sau khi thu nhỏ. Hãy chọn một ảnh khác.");
  } finally {
    bitmap.close();
  }
}

function getItem(id) {
  return allItems().find(item => item.id === id);
}

async function submit(form) {
  const fields = Object.fromEntries(new FormData(form));
  const kind = form.dataset.form;
  if (kind === "weekly") {
    await subscribeWeekly(Number(fields.weekday));
    render();
    showToast("Đã lưu lịch thông báo hằng tuần.");
    return;
  }
  if (kind === "register" || kind === "login") {
    if (kind === "register" && fields.password !== fields.confirmPassword) throw Error("Mật khẩu xác nhận chưa khớp.");
    const { user } = await api(kind, "POST", fields);
    try {
      state.items = (await api("library")).items;
    } catch (error) {
      state.items = [];
      showToast(error.message);
    }
    state.user = user;
    state.offline = false;
    editor.close();
    render();
    void loadWeekly();
    showToast(kind === "register" ? "Đã tạo tài khoản." : "Đã đăng nhập.");
    return;
  }
  if (kind === "profile" || kind === "preferences") {
    let next = { ...profile() };
    if (kind === "profile") {
      const avatar = await convertImage(fields.avatar, 300);
      next = { ...next, name: fields.name.trim(), avatar: avatar || (fields.removeAvatar ? "" : next.avatar) };
      if (!next.name) throw Error("Nhập tên hiển thị.");
    } else {
      next = { ...next, theme: fields.theme, reminders: Boolean(fields.reminders), fireworks: Boolean(fields.fireworks) };
    }
    await saveProfile(next);
    render();
    showToast("Đã lưu cài đặt.");
    return;
  }

  const item = getItem(form.dataset.id);
  if (kind === "remove") {
    if (!item) throw Error("Mục này không còn trong thư viện.");
    await removeItem(item.id);
    editor.close();
    render();
    showToast("Đã xóa khỏi thư viện.");
    return;
  }

  if (kind === "progress" && !item) throw Error("Mục này không còn trong thư viện.");
  const total = Number(fields.total ?? item?.total);
  const done = Number(fields.done);
  if (!Number.isInteger(done) || done < 0 || done > total) {
    throw Error("Số đã hoàn thành cần nằm trong tổng số chương hoặc tập.");
  }
  const checkpoint = fields.checkpoint.trim();
  if (kind === "progress") {
    await saveItem({ ...item, done, checkpoint });
    editor.close();
    render();
    showToast(done === total ? "Đã hoàn thành. Chúc mừng bạn!" : "Đã lưu tiến độ.");
    return;
  }

  const title = fields.title.trim();
  const author = fields.author.trim();
  if (!title || !author) throw Error("Hãy nhập tên và tác giả hoặc người dẫn.");
  const link = fields.link.trim();
  if (link) {
    const url = new URL(link);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      throw Error("Liên kết cần bắt đầu bằng https:// hoặc http://.");
    }
  }
  const uploaded = await convertImage(fields.cover, 900);
  const cover = uploaded || (fields.removeCover ? "" : item?.cover || "");
  await saveItem({
    id: item?.id || crypto.randomUUID(),
    demo: item?.demo || false,
    title, author, total, done, checkpoint, cover, link,
    type: fields.type,
    category: fields.category.trim(),
    summary: fields.summary.trim(),
    starred: Boolean(fields.starred)
  });
  editor.close();
  render();
  showToast("Đã lưu vào thư viện.");
}

document.addEventListener("submit", async event => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  if (state.pending) return;
  state.pending = true;
  const submitter = event.submitter;
  if (submitter) submitter.disabled = true;
  const errorNode = form.querySelector(".error");
  errorNode.hidden = true;
  try {
    await submit(form);
  } catch (error) {
    errorNode.textContent = error.name === "QuotaExceededError" ? "Bộ nhớ trình duyệt đã đầy." : error.message;
    errorNode.hidden = false;
  } finally {
    state.pending = false;
    if (submitter) submitter.disabled = false;
  }
});

document.addEventListener("click", async event => {
  const target = event.target.closest("button[data-action]");
  if (!target) return;
  const { action, id, delta } = target.dataset;
  const item = id && getItem(id);

  switch (action) {
    case "add": openItemForm(); break;
    case "edit": if (item) openItemForm(item); break;
    case "detail": if (item) itemDetail(item); break;
    case "close": if (!state.pending) editor.close(); break;
    case "account":
      if (state.user) location.hash = "cai-dat";
      else authForm(false);
      break;
    case "login":
    case "register": if (!state.pending) authForm(action === "register"); break;
    case "step": {
      const input = $("#done-count");
      input.value = Math.min(Number(input.max), Math.max(0, Number(input.value || 0) + Number(delta)));
      break;
    }
    case "star":
      if (!item || state.pending) break;
      state.pending = true;
      target.disabled = true;
      try {
        const next = !item.starred;
        await saveItem({ ...item, starred: next });
        render();
        document.querySelector(`[data-action="star"][data-id="${item.id}"]`)?.focus();
        showToast(next ? "Đã đánh dấu sao." : "Đã bỏ dấu sao.");
      } catch (error) {
        showToast(error.message);
      } finally {
        state.pending = false;
        target.disabled = false;
      }
      break;
    case "confirm-remove":
      if (item && !state.pending) openEditor("Xóa khỏi thư viện?", `<form class="form" data-form="remove" data-id="${item.id}">
        <p>Tiến độ và điểm dừng của <strong>${escapeHtml(item.title)}</strong> sẽ bị xóa.</p>
        <p class="error" role="alert" hidden></p>
        <div class="form-actions">${button("Quay lại", "detail", { extra: "secondary", data: `data-id="${item.id}"` })}
        ${button("Xóa mục", "", { extra: "secondary danger", type: "submit" })}</div>
      </form>`);
      break;
    case "reminder": openReminder(); break;
    case "next-quote": state.quote = (state.quote + 1) % quotes.length; openReminder(); break;
    case "close-reminder": reminder.close(); break;
    case "dismiss-daily":
      state.dismissed = getDismissalKey();
      try { writeLocal(keys.reminder, state.dismissed); } catch { /* Dismissal still works in this tab. */ }
      $("#daily-reminder")?.remove();
      break;
    case "weekly-off":
      if (state.pending) break;
      state.pending = true;
      target.disabled = true;
      try {
        await api("weekly", "DELETE");
        state.weekly = { ...state.weekly, weekday: null };
        render();
        showToast("Đã tắt thông báo hằng tuần.");
      } catch (error) {
        showToast(error.message);
      } finally {
        state.pending = false;
        target.disabled = false;
      }
      break;
    case "logout":
      if (state.pending) break;
      state.pending = true;
      target.disabled = true;
      try {
        await api("logout", "POST");
        state.user = null;
        state.weekly = null;
        state.items = [];
        if (state.view === "tong-quan") render();
        else location.hash = "tong-quan";
        showToast("Đã đăng xuất.");
      } catch (error) {
        showToast(error.message);
      } finally {
        target.disabled = false;
        state.pending = false;
      }
      break;
    case "install":
      await state.install?.prompt();
      state.install = null;
      render();
      break;
  }
});

document.addEventListener("input", event => {
  if (event.target.id !== "search") return;
  state.filters.query = event.target.value;
  refreshResults();
});

document.addEventListener("change", event => {
  const { id, value } = event.target;
  if (id === "category-filter" || id === "status-filter") {
    state.filters[id === "category-filter" ? "category" : "status"] = value;
    refreshResults();
  }
  if (event.target.matches('[data-form="item"] select[name="type"]')) {
    const podcast = value === "podcast";
    editor.querySelector('[data-type-label="title"]').textContent = podcast ? "Tên podcast" : "Tên sách";
    editor.querySelector('[data-type-label="total"]').textContent = podcast ? "Tổng số tập" : "Tổng số chương";
  }
});

editor.addEventListener("cancel", event => {
  if (state.pending) event.preventDefault();
});

window.addEventListener("hashchange", () => {
  if (!views.some(view => view.id === location.hash.slice(1))) return;
  render();
  content.focus({ preventScroll: true });
  window.scrollTo(0, 0);
});

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  state.install = event;
  if (state.view === "cai-dat") render();
});

async function start() {
  state.quote = getDay() % quotes.length;
  state.dismissed = readLocal(keys.reminder, "");
  render();
  try {
    const { user } = await api("session");
    if (user) {
      const { items } = await api("library");
      state.user = user;
      state.items = items;
      render();
      void loadWeekly();
    }
  } catch {
    state.offline = true;
    render();
  }
}

setInterval(applyTheme, 60_000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) applyTheme();
});
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
void start();
