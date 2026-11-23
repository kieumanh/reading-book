import { mamFigure, mamScenes } from "./mam-scenes.js";
import { bookMemoryKey, relatedShelf, summarizeBook, weekReport } from "./tutor-core.js";

const svg = {
  spark:'<path d="M12 2v20M2 12h20m-17-7 14 14M19 5 5 19"/>',
  book:'<path d="M12 6c-3-2-6-2-9-.5v13c3-1 6-1 9 1 3-2 6-2 9-1v-13C18 4 15 4 12 6Zm0 0v13"/>',
  chart:'<path d="M3 4v16h18M8 15v-4m5 4V7m5 8V4"/>',
  brain:'<path d="M12 19c-5 4-9-2-6-4-4-3-3-8 1-9 0-3 3-4 5-2 2-2 5-1 5 2 4 1 5 6 1 9 3 2-1 8-6 4Zm0-15v15m-5-7h2m6 2h2"/>',
  play:'<path d="m9 5 11 7-11 7V5Z"/>',
  cloud:'<path d="M6 18h12a3 3 0 0 0 .4-6A6.2 6.2 0 0 0 6.5 10 4 4 0 0 0 6 18Z"/>'
};
export function tutorIcon(key) {
  return `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${svg[key] || svg.spark}</svg></span>`;
}
export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
}
const tabs = [["learn","Ôn sách","book"],["week","Tổng kết tuần","chart"],["memory","Trí nhớ","brain"],["scenes","Hoạt cảnh","play"]];
const moods = [["greet","Chào hỏi"],["reading","Đọc sách"],["thinking","Suy nghĩ"],["guide","Hướng dẫn"],
  ["search","Tra cứu"],["celebrate","Ăn mừng"],["encourage","Động viên"],["review","Tổng kết"]];
const picks = [["summary","Tóm tắt sách đang chọn"],["practice","Gợi ý cách học"],["question","Đặt câu hỏi mở"],["week","Tổng kết tuần này"]];
export const tutorPrompts = Object.fromEntries(picks);

function sourceUrl(raw) {
  try {
    const url = new URL(raw);
    if (url.protocol==="https:" && ["openlibrary.org","www.wikidata.org","vi.wikipedia.org","en.wikipedia.org"].includes(url.hostname)) return esc(url.href);
  } catch { /* A malformed source stays plain text. */ }
  return "";
}
function sourceLink(item, label = item.provider || "Mở nguồn") {
  const url = sourceUrl(item.url);
  return url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : "";
}
function button(title, action, extra = "", attrs = "") {
  return `<button class="button ${extra}" type="button" data-action="${action}" ${attrs}>${title}</button>`;
}
function orderedList(values) {
  return `<ol class="tutor-list">${values.map(value=>`<li>${esc(value)}</li>`).join("")}</ol>`;
}
function noteForm(book, notes, state) {
  const existing = notes.find(row=>row.chapter===state.editChapter);
  const chapter = existing?.chapter || Math.max(1, Math.min(book.done || 1,book.total));
  const buttonLabel = existing ? "Cập nhật ghi chú" : "Lưu ghi chú";
  return `<details class="tutor-notes" ${state.noteOpen || !notes.length ? "open" : ""}>
    <summary>Ghi chú chương và phần</summary>
    ${state.offline && state.signed ? '<p class="hint">Đang xem ghi chú đã lưu trên trình duyệt. Kết nối lại để sửa ghi chú tài khoản.</p>' : `
    <form class="form" data-form="tutor-note">
      <div class="form-row">
        <label class="control-label">Số chương<input type="number" name="chapter" min="1" max="${book.total}" required value="${chapter}"></label>
        <label class="control-label">Tên phần sách<input name="part" maxlength="120" value="${esc(existing?.part)}" placeholder="Ví dụ: Phần I"></label>
      </div>
      <label class="control-label">Điều anh ghi nhớ<textarea name="note" required maxlength="2200" placeholder="Viết lại ý chính bằng lời của anh.">${esc(existing?.note)}</textarea></label>
      <p class="error" role="alert" hidden></p>
      <button class="button" type="submit">${buttonLabel}</button>
    </form>`}
    ${notes.length && !(state.offline && state.signed) ? `<label class="control-label tutor-edit-picker">Mở ghi chú đã lưu<select id="tutor-edit-note"><option value="">Chọn chương</option>
      ${notes.map(row=>`<option value="${row.chapter}" ${row.chapter===state.editChapter?"selected":""}>Chương ${row.chapter}${row.part?" · "+esc(row.part):""}</option>`).join("")}</select></label>` : ""}
    ${state.loadingNotes ? '<p class="hint" role="status">Đang đồng bộ ghi chú…</p>' : ""}
    ${state.notesError ? `<p class="hint">${esc(state.notesError)}</p>` : ""}
  </details>`;
}

function conversation(state) {
  return `<section class="tutor-card tutor-conversation" aria-labelledby="tutor-chat-title">
    <h2 id="tutor-chat-title">Hỏi Mầm</h2>
    <div class="tutor-prompts">${picks.map(([id,label])=>button(esc(label),"tutor-prompt","secondary",`data-prompt="${id}"`)).join("")}</div>
    <form class="form" data-form="tutor-question">
      <label class="control-label">Câu hỏi của anh<input name="question" maxlength="260" placeholder="Mình ghi gì ở chương 2?" value="${esc(state.question)}" required></label>
      <p class="error" role="alert" hidden></p>
      <button class="button" type="submit">Hỏi Mầm</button>
    </form>
    ${state.answer ? `<div class="tutor-answer" role="status">
      <strong>Mầm</strong><p>${esc(state.answer.text)}</p>
      ${state.answer.followup ? `<p>${esc(state.answer.followup)}</p>` : ""}
      ${state.answer.evidence ? `<small>${esc(state.answer.evidence)} ${sourceLink(state.answer,"Xem nguồn")}</small>` : ""}
    </div>` : ""}
  </section>`;
}

function learn(state, book, notes) {
  if (!book) return `<section class="tutor-card"><h2>Chọn một cuốn để bắt đầu</h2><p>Thêm sách vào thư viện, rồi mở Gia sư để ghi chú và ôn tập.</p><a href="#sach-doc" class="button secondary">Đến thư viện</a></section>`;
  const summary = summarizeBook(book,notes,state.filter);
  const record = state.mem.refs[bookMemoryKey(book)];
  const sources = record?.sources || [];
  const wiki = sources.find(source=>source.kind==="overview");
  const suggestions = relatedShelf(book,state.books,record?.related);
  return `<div class="tutor-columns">
    <section class="tutor-card tutor-main">
      <label class="control-label">Sách để ôn<select id="tutor-book">
        ${state.books.map(item=>`<option value="${esc(item.id)}" ${item.id===state.bookId?"selected":""}>${esc(item.title)} · ${esc(item.author)}</option>`).join("")}
      </select></label>
      <div class="tutor-book-line"><span>${book.done} / ${book.total} chương</span><span>${notes.length} chương có ghi chú</span></div>
      ${noteForm(book,notes,state)}
      <div class="tutor-divider"></div>
      <div class="tutor-summary-head"><h2>Tổng kết sách</h2>
        ${notes.length ? `<label class="control-label">Phạm vi<select id="tutor-scope">
          <option value="all">Tất cả ghi chú</option>
          ${summary.parts.map(part=>`<option value="part:${esc(part)}" ${state.filter==="part:"+part?"selected":""}>Phần · ${esc(part)}</option>`).join("")}
          ${notes.map(row=>`<option value="chapter:${row.chapter}" ${state.filter==="chapter:"+row.chapter?"selected":""}>Chương ${row.chapter}</option>`).join("")}
        </select></label>` : ""}
      </div>
      ${summary.lines.length ? `<ul class="tutor-evidence">${summary.lines.map(line=>`<li><strong>Chương ${line.chapter}${line.part?" · "+esc(line.part):""}</strong><p>${esc(line.text)}</p></li>`).join("")}</ul>` :
        summary.userSummary ? `<p class="tutor-brief">${esc(summary.userSummary)} <small>Mô tả anh đã lưu</small></p>` :
        wiki ? `<p class="tutor-brief">${esc(wiki.text)} <small>Tổng quan công khai · ${sourceLink(wiki)}</small></p>` :
        '<p class="hint">Ghi lại điều anh nhớ sau khi đọc. Mầm sẽ rút ý từ ghi chú đó.</p>'}
      ${summary.topic.length ? `<div class="tutor-keywords">${summary.topic.map(word=>`<span>${esc(word)}</span>`).join("")}</div>` : ""}
    </section>
    <div class="tutor-side">
      ${conversation(state)}
      <section class="tutor-card tutor-exercises"><h2>Cách ôn tiếp</h2>${orderedList(summary.drills)}</section>
    </div>
    <section class="tutor-card tutor-questions"><h2>Câu hỏi mở</h2>${orderedList(summary.questions)}</section>
    <section class="tutor-card tutor-related"><h2>Sách liên quan</h2>
      ${suggestions.length ? `<ul>${suggestions.map(item=>`<li>
        <div><strong>${esc(item.title)}</strong><small>${esc(item.author)} · ${esc(item.reason)}</small></div>
        ${item.local ? button("Ôn sách","tutor-related","secondary",`data-id="${esc(item.id)}"`) : sourceLink(item,"Xem sách")}
      </li>`).join("")}</ul>` : '<p class="hint">Mầm sẽ gợi ý từ các sách đã lưu cùng chủ đề hoặc tác phẩm cùng tác giả tìm được.</p>'}
    </section>
  </div>`;
}

function weekly(state) {
  const report=weekReport(state.mem.days,state.week);
  const previous=weekReport(state.mem.days,1);
  const delta=report.chapters-previous.chapters;
  return `<section class="tutor-card tutor-week" aria-labelledby="tutor-week-title">
    <div class="tutor-summary-head"><div>
      <h2 id="tutor-week-title">Nhịp đọc trong tuần</h2>
      <p>${report.scores[0].date} – ${report.scores.at(-1).date} · Giờ Việt Nam</p>
    </div>
    <label class="control-label">Tuần<select id="tutor-week">
      <option value="0" ${state.week===0?"selected":""}>Tuần này</option><option value="1" ${state.week===1?"selected":""}>Tuần trước</option>
    </select></label></div>
    <div class="study-stats">
      <div><strong>${report.chapters}</strong><span>Chương mới</span></div>
      <div><strong>${report.books}</strong><span>Sách hoàn thành</span></div>
      <div><strong>${report.active}/7</strong><span>Ngày có đọc</span></div>
    </div>
    <figure class="study-chart" aria-label="Số chương mới theo từng ngày">
      ${report.scores.map(row=>`<div class="study-bar ${row.future?"is-future":""}">
        <span>${row.future?"–":row.chapters}</span><div class="study-meter"><i style="--bar:${Math.round(row.chapters/report.max*100)}%"></i></div>
        <strong>${row.short}</strong><small>${row.date}</small>
      </div>`).join("")}
    </figure>
    <div class="tutor-week-note"><strong>Mầm nhìn lại</strong><p>${esc(report.guidance)}</p>
      ${state.week===0 && previous.active ? `<p>${delta>0?`Nhiều hơn tuần trước ${delta} chương.`:delta<0?`Tuần trước ghi nhận thêm ${Math.abs(delta)} chương so với tuần này.`:"Số chương bằng tuần trước."}</p>`:""}
      <small>Biểu đồ ghi nhận chương mới từ khi tính năng tổng kết bắt đầu hoạt động.</small>
    </div>
  </section>`;
}

function memory(state,book) {
  const entries=state.mem.books;
  const authors=new Set(entries.map(item=>item.author).filter(Boolean));
  const key=book && bookMemoryKey(book);
  const item=state.mem.refs[key];
  const savedSources=Object.values(state.mem.refs).reduce((num,value)=>num+(value.sources?.length||0),0);
  const auto=state.mem.auto;
  return `<div class="tutor-columns">
    <section class="tutor-card tutor-main">
      <h2>Trí nhớ trên trình duyệt</h2>
      <div class="study-stats"><div><strong>${entries.length}</strong><span>Đầu sách</span></div><div><strong>${authors.size}</strong><span>Tác giả</span></div><div><strong>${savedSources}</strong><span>Nguồn đã lưu</span></div></div>
      <label class="check tutor-check"><input type="checkbox" id="tutor-auto" ${auto?"checked":""}> Tự tra cứu khi mở ứng dụng</label>
      <p class="hint">Khi có mạng và đang đăng nhập, Mầm gửi tên sách và tác giả đến nguồn công khai. Ghi chú và câu hỏi dùng để ôn ngay trên trình duyệt.</p>
      ${book ? `<label class="control-label">Sách tra cứu<select id="tutor-book">
        ${state.books.map(s=>`<option value="${esc(s.id)}" ${s.id===book.id?"selected":""}>${esc(s.title)} · ${esc(s.author)}</option>`).join("")}
      </select></label>` : ""}
      <p class="hint tutor-lookup" role="status">${esc(state.lookupStatus || (item?.sources?.length ? "Đã lưu nguồn của sách này." : "Chưa có nguồn xác thực cho đầu sách đang chọn."))}</p>
      ${state.signed && !state.offline && book ? button(state.lookupBusy?"Đang tra cứu…":"Tra cứu nguồn","tutor-refresh","",state.lookupBusy?"disabled":"") : ""}
      ${!state.signed ? `<a href="#dang-nhap" class="button secondary">Đăng nhập để bật tra cứu</a>` : ""}
      ${item?.sources?.length ? `<ul class="tutor-evidence tutor-source-list">
        ${item.sources.map(source=>`<li><strong>${esc(source.title)}</strong><p>${esc(source.text)}</p><small>${sourceLink(source)}${source.kind==="overview"?' · Trích đoạn giới thiệu Wikipedia (CC BY-SA)':''}</small></li>`).join("")}
      </ul>` : ""}
    </section>
    <section class="tutor-card tutor-memory-list"><h2>Đầu sách đã ghi nhớ</h2>
      ${entries.length ? `<ul>${entries.slice(0,30).map(row=>`<li><strong>${esc(row.title)}</strong><span>${esc(row.author)}</span></li>`).join("")}</ul>` : '<p class="hint">Thêm sách để lưu tên đầu sách và tác giả vào trí nhớ.</p>'}
    </section>
  </div>`;
}
function scenes(state) {
  const available=mamScenes.filter(item=>item.mood===state.mood);
  const selected=available.find(item=>item.id===state.scene) || available[0];
  return `<section class="tutor-card tutor-scenes">
    <div><h2>Hoạt cảnh của Mầm</h2>
      <label class="control-label">Nhóm hoạt cảnh<select id="tutor-scenes">
        ${moods.map(([value,label])=>`<option value="${value}" ${value===state.mood?"selected":""}>${label}</option>`).join("")}
      </select></label>
      <div class="scene-list">
        ${available.map(item=>button(tutorIcon("play")+" "+esc(item.name),"tutor-scene","secondary",`data-scene="${item.id}" aria-pressed="${item.id===selected.id}"`)).join("")}
      </div>
    </div>
    <div class="tutor-scene-stage">${mamFigure(selected.pose)}<strong data-scene-label>${esc(selected.name)}</strong><p>${mamScenes.length} hoạt cảnh</p></div>
  </section>`;
}
export function tutorView(state) {
  const book=state.books.find(item=>item.id===state.bookId);
  const notes=state.mem.notes[state.bookId]||[];
  return `<div class="tutor-page">
    <header class="tutor-hero">
      <div><p class="tutor-eyebrow">Gia sư đọc sách</p><h1>Học cùng Mầm</h1><p>Ôn điều vừa đọc, tìm ý liên quan và nhìn lại nhịp đọc mỗi tuần.</p>
      ${state.offline ? '<span class="tutor-chip">Đang dùng dữ liệu đã lưu</span>' : ""}
      </div>
      ${mamFigure(state.tab==="week"?"think":"guide")}
    </header>
    <nav class="tutor-tabs" aria-label="Các phần của Gia sư">
      ${tabs.map(([id,label,icon])=>button(tutorIcon(icon)+" "+label,"tutor-tab","secondary",`data-tutor-tab="${id}" aria-pressed="${id===state.tab}"`)).join("")}
    </nav>
    ${state.tab==="week" ? weekly(state) : state.tab==="memory" ? memory(state,book) : state.tab==="scenes" ? scenes(state) : learn(state,book,notes)}
  </div>`;
}
