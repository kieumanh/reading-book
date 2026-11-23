const omitted = new Set("cung nhung trong sach ngan tuoi tien minh thanh chuong khong duoc giua truoc theo nhieu viet noi dung phan mot cac chu de xong dang doc cua nay dieu nhu viec voi con neu khi lam tac gia tom tat chua duoc bang".split(" "));

export function normalized(value) {
  return String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replaceAll("đ","d").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function bookMemoryKey(book) {
  return normalized(book.title) + "|" + normalized(book.author);
}

export function topicWords(text, max = 6) {
  const words = new Map();
  for (const original of String(text || "").match(/[\p{L}]{3,}/gu) || []) {
    const key = normalized(original);
    if (omitted.has(key) || key.length < 3) continue;
    const term = words.get(key) || { original: original.toLocaleLowerCase("vi"), count: 0 };
    term.count++;
    words.set(key, term);
  }
  return [...words.values()].sort((a,b) => b.count - a.count).slice(0,max).map(word => word.original);
}

function phrases(note) {
  return (note.match(/[^.!?…\n]+(?:[.!?…]+(?:\s|$)|$)/gu) || note.split(/\n+/)).map(x=>x.trim()).filter(Boolean);
}

function shorten(text, limit = 215) {
  if (text.length <= limit) return text;
  const part = text.slice(0, limit);
  const last = part.lastIndexOf(" ");
  return (last > 0 ? part.slice(0,last) : part) + "…";
}

export function summarizeBook(book, notes, filter = "all") {
  const selected = filter.startsWith("part:") ? notes.filter(row=>row.part === filter.slice(5)) :
    filter.startsWith("chapter:") ? notes.filter(row=>row.chapter === Number(filter.slice(8))) : notes;
  const parts = [...new Set(notes.map(row=>row.part).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi"));
  const topic = topicWords(selected.map(row=>row.note).join(" "), 5);
  const tokens = new Set(topic.map(normalized));
  const lines = selected.map(row => {
    const sentences = phrases(row.note);
    const best = sentences.reduce((choice,sentence) => {
      const pts = topicWords(sentence,10).filter(word=>tokens.has(normalized(word))).length;
      return pts > choice.points ? { sentence, points:pts } : choice;
    }, {sentence:sentences[0] || row.note,points:-1});
    return { chapter:row.chapter, part:row.part, text:shorten(best.sentence), weight:best.points };
  }).sort((a,b)=>b.weight-a.weight || a.chapter-b.chapter).slice(0,6).sort((a,b)=>a.chapter-b.chapter);
  const anchor = lines[0];
  const focus = topic[0] || "ý chính vừa đọc";
  return {
    parts, lines, topic,
    userSummary: filter === "all" && !lines.length ? book.summary || "" : "",
    drills: [
      anchor ? `Gấp sách, kể lại chương ${anchor.chapter} trong ba câu rồi đối chiếu ghi chú.` : "Đọc một chương ngắn rồi viết lại ý chính bằng lời của bạn.",
      "Sau một ngày, trả lời lại một câu hỏi trước khi mở ghi chú.",
      `Tìm một việc nhỏ để thử áp dụng điều anh vừa đọc về ${focus}.`
    ],
    questions: [
      anchor ? `Trong chương ${anchor.chapter}, chi tiết nào làm anh thay đổi cách nhìn?` : "Anh đang muốn tìm lời giải cho câu hỏi nào khi mở sách này?",
      "Có trường hợp nào mà ý tưởng vừa đọc sẽ khó áp dụng? Vì sao?",
      "Anh sẽ giải thích điều đáng nhớ nhất của phần này cho một người chưa đọc sách như thế nào?"
    ]
  };
}

function overlap(text,tokens) {
  const hay = normalized(text);
  return tokens.reduce((sum,word)=>sum+Number(hay.split(" ").includes(word)),0);
}

export function relatedShelf(book, library, references = []) {
  const terms = topicWords([book.category,book.title,book.summary].join(" "),12).map(normalized);
  const author = normalized(book.author);
  const shelf = library.filter(item=>item.type==="book" && item.id!==book.id)
    .map(item=>({item, relevance: (author && normalized(item.author)===author?6:0) +
      (book.category && normalized(item.category)===normalized(book.category)?3:0) +
      overlap(item.title+" "+item.summary,terms)}))
    .filter(x=>x.relevance >= 2)
    .sort((a,b)=>b.relevance-a.relevance || a.item.title.localeCompare(b.item.title,"vi"))
    .map(x=>({...x.item,reason:normalized(x.item.author)===author?"Cùng tác giả":"Liên quan chủ đề",local:true}));
  const seen = new Set(shelf.map(item=>bookMemoryKey(item)));
  return [...shelf.slice(0,3), ...references.filter(item=>{
    const key = bookMemoryKey(item);
    if (seen.has(key) || key===bookMemoryKey(book)) return false;
    seen.add(key);
    return true;
  }).map(item=>({...item,reason:"Tác phẩm cùng tác giả · Open Library"}))].slice(0,5);
}

export function answerFromMemory(question, book, notes, sources, week) {
  const prompt = normalized(question);
  if (/\btuan\b|lich doc|bieu do|thong ke/.test(prompt)) {
    return week.active ? {
      text: `Tuần này anh đã ghi nhận ${week.chapters} chương trong ${week.active} ngày và hoàn thành ${week.books} sách. ${week.guidance}`
    } : {text:"Tuần này chưa ghi nhận chương đọc mới. Chọn một buổi ngắn và cập nhật tiến độ sau khi đọc để Mầm theo dõi."};
  }

  const chapter = prompt.match(/\bchuong (\d{1,4})\b/)?.[1];
  const part = !chapter && notes.find(row=> {
    const label = normalized(row.part);
    return label && (" "+prompt+" ").includes(" "+(label.startsWith("phan ")?label:"phan "+label)+" ");
  })?.part;
  const filter = chapter ? "chapter:"+chapter : part ? "part:"+part : "all";
  const subset = notes.filter(row=>chapter ? row.chapter===Number(chapter) : !part || row.part===part);
  const summary = summarizeBook(book || {summary:""},notes,filter);
  const asksSummary = /tom tat|tong ket|noi dung/.test(prompt);
  const asksAuthor = /tac gia|ai viet|viet sach/.test(prompt);
  if (/\bcau hoi\b|\bgoi mo\b|\btu kiem tra\b/.test(prompt)) return {text:summary.questions[0],followup:summary.questions[1]};
  if (/\bcach hoc\b|\bon tap\b|\bnhac lai\b/.test(prompt)) return {text:summary.drills[0],followup:summary.drills[1]};
  if ((asksSummary || part) && summary.lines.length) {
    return {text:summary.lines.slice(0,3).map(row=>"Chương "+row.chapter+" · "+row.text).join("\n"),evidence:"Trích ý từ ghi chú của anh"};
  }
  if (asksAuthor && !chapter && !part) {
    const person=sources.find(item=>item.kind==="author");
    if (person) return {text:person.title+" · "+person.text,evidence:person.provider,url:person.url};
    if (book?.author) return {text:book.author,evidence:"Tên tác giả anh đã lưu cho “"+book.title+"”"};
  }
  const words = topicWords(question,10).map(normalized);
  const candidates = subset
    .map(row=>({row,points:overlap(row.note+" "+row.part,words)}))
    .sort((a,b)=>b.points-a.points || a.row.chapter-b.row.chapter);
  const direct = candidates.find(x=>x.points>0 || chapter)?.row;
  if (direct) {
    return { text: shorten(direct.note, 385), evidence: `Ghi chú chương ${direct.chapter}${direct.part?" · "+direct.part:""}`,
      followup:"Điều gì trong ghi chú này khiến anh muốn xem lại chương gốc?" };
  }

  if (!book) return {text:"Thêm một cuốn sách để Mầm có thể ghi nhớ tác giả, theo dõi chương và giúp ôn lại."};
  if (asksSummary && book.summary && filter==="all") {
    return {text:shorten(book.summary,330),evidence:"Mô tả đã lưu cho “"+book.title+"”"};
  }
  if (filter==="all") {
    const reference = sources.find(item=>asksSummary && item.kind==="overview") ||
      sources.find(item=>overlap(item.title+" "+item.text,words)>=2);
    if (reference) return {text:reference.text,evidence:reference.provider,url:reference.url};
  }
  return {text:"Mầm chưa tìm thấy căn cứ cho câu hỏi này trong ghi chú và các nguồn đã lưu.",
    followup:chapter?"Ghi lại ý chính của chương "+chapter+" rồi hỏi Mầm lần nữa.":"Thử chỉ rõ tên chương, phần hoặc từ khóa xuất hiện trong ghi chú."};
}

const vietnamOffset = 7 * 3600000;
const dayLength = 86400000;
export const studyDay = (time = Date.now()) => new Date(time + vietnamOffset).toISOString().slice(0,10);

export function weekReport(days, offset = 0, time = Date.now()) {
  const today = new Date(time + vietnamOffset);
  const monday = Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()) -
    ((today.getUTCDay()+6)%7 + offset*7)*dayLength;
  const recorded = new Map(days.map(row=>[row.day,row]));
  const scores = Array.from({length:7},(_,index)=>{
    const date = new Date(monday+index*dayLength);
    const day = date.toISOString().slice(0,10);
    const row = recorded.get(day);
    return {day, short:index===6?"CN":"T"+(index+2), date:date.getUTCDate()+"/"+(date.getUTCMonth()+1),
      chapters:Number(row?.chapters)||0,books:Number(row?.books)||0, future:day>studyDay(time)};
  });
  const chapters = scores.reduce((total,row)=>total+row.chapters,0);
  const books = scores.reduce((total,row)=>total+row.books,0);
  const active = scores.filter(row=>row.chapters>0 || row.books>0).length;
  return {scores, chapters, books, active, max:Math.max(1,...scores.map(row=>row.chapters)),
    guidance:active===0?"Thử đặt lịch một buổi đọc 10 phút." : active<3 ?
      `Anh đã đọc vào ${active} ngày. Thử hẹn thêm một buổi vừa sức.` : "Nhịp đọc khá đều. Dành một buổi để ôn ý đáng nhớ thay vì chỉ thêm chương."};
}
