import { bookMemoryKey, normalized, answerFromMemory, studyDay, weekReport } from "./tutor-core.js";
import { tutorView, tutorPrompts } from "./tutor-view.js";
import { playMam, mamScenes } from "./mam-scenes.js";

const activeKey = "reading-book-tutor-active-v1";
const localKey = scope => "reading-book-tutor-v1:" + encodeURIComponent(scope);
const expiryFor = source => source?.sources?.length ? 6 * 86400000 : 6 * 3600000;

function stored(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function store(key,value) {
  try { localStorage.setItem(key,JSON.stringify(value)); } catch { /* The current session still has its in-memory data. */ }
}
function freshMemory(scope) {
  const data=stored(localKey(scope),{});
  return { auto:data.auto!==false, books:Array.isArray(data.books)?data.books:[],
    refs:data.refs||{}, notes:Object.assign(Object.create(null),data.notes),
    days:Array.isArray(data.days)?data.days:[], shelf:Array.isArray(data.shelf)?data.shelf:[] };
}

export function createTutor({ api, repaint, toast, motion, isVisible }) {
  const state = { scope:":demo", signed:false, offline:false, books:[], bookId:"", tab:"learn", week:0,
    mem:freshMemory(":demo"), filter:"all", question:"", answer:null, editChapter:0, noteOpen:false, notesError:"",
    loadingNotes:false, lookupBusy:false, lookupStatus:"", mood:"greet", scene:"greet-1" };
  let generation=0;
  let weekFresh=0;
  let autoCount=0;
  const refreshedNotes=new Set();
  const noteRequests=new Map();
  const referenceRequests=new Map();

  function persist() { store(localKey(state.scope),state.mem); }
  function currentBook() { return state.books.find(book=>book.id===state.bookId); }
  function animate(scene, root=".tutor-hero") { playMam(document.querySelector(root),scene,motion()); }
  function view() { return tutorView(state); }

  function sync(items, user, offline = false, preserveActive = false) {
    const available = user?.username || (offline && stored(activeKey,null));
    const scope = available || ":demo";
    if (scope !== state.scope || state.offline !== offline) {
      generation++;
      state.scope=scope;
      state.mem=freshMemory(scope);
      state.bookId="";
      resetBook();
      state.lookupBusy=false;
      autoCount=0;
      weekFresh=0;
      refreshedNotes.clear();
      noteRequests.clear();
    }
    if (!offline && !preserveActive) store(activeKey,user?.username || null);
    state.signed=Boolean(available);
    state.offline=offline;
    if (offline && available) {
      state.books=state.mem.shelf;
    } else {
      state.books=items.filter(item=>item.type==="book").map(({id,title,author,category,summary,checkpoint,done,total,updated,demo})=>
        ({id,title,author,category,summary:String(summary||"").slice(0,1200),checkpoint,done,total,updated,demo,type:"book"}))
        .sort((a,b)=>Number(b.done>0&&b.done<b.total)-Number(a.done>0&&a.done<a.total) || b.updated-a.updated);
      const seen=new Set(state.books.map(bookMemoryKey));
      for (const key of Object.keys(state.mem.notes)) {
        if (!state.books.some(book=>book.id===key)) delete state.mem.notes[key];
      }
      state.mem.shelf=state.books;
      state.mem.books=[...state.books.map(({id,title,author})=>({id,title,author})),
        ...state.mem.books.filter(row=>!seen.has(bookMemoryKey(row)))].slice(0,400);
      persist();
    }
    if (!state.books.some(book=>book.id===state.bookId)) {
      state.bookId=state.books[0]?.id || "";
      resetBook();
    }
  }

  function resetBook() {
    state.filter="all";
    state.editChapter=0;
    state.noteOpen=false;
    state.loadingNotes=false;
    state.notesError="";
    state.answer=null;
    state.question="";
    state.lookupStatus="";
  }

  function selectTab(tab) {
    state.tab=tab;
    repaint();
    open();
  }

  function selectBook(id) {
    if (!state.books.some(book=>book.id===id)) return;
    if (state.bookId!==id) {
      state.bookId=id;
      resetBook();
    }
    state.tab="learn";
    repaint();
    void fetchNotes();
  }

  async function fetchNotes() {
    const book=currentBook();
    if (!book || !state.signed || state.offline || refreshedNotes.has(book.id)) return;
    if (noteRequests.has(book.id)) return;
    const check=generation;
    state.loadingNotes=true;
    state.notesError="";
    const request=api("tutor/notes/"+book.id);
    noteRequests.set(book.id,request);
    try {
      const {notes}=await request;
      if (generation!==check) return;
      state.mem.notes[book.id]=notes;
      refreshedNotes.add(book.id);
      persist();
    } catch {
      if (generation!==check) return;
      if (state.bookId===book.id) state.notesError="Đang dùng ghi chú đã lưu. Có thể thử lại khi kết nối ổn định.";
    } finally {
      if (generation===check) {
        noteRequests.delete(book.id);
        if (state.bookId===book.id) {
          state.loadingNotes=false;
          repaint(true);
        }
      }
    }
  }

  function invalidateWeek() { weekFresh=0; }

  async function fetchWeek() {
    if (!state.signed || state.offline || Date.now()-weekFresh<60000) return;
    const check=generation;
    weekFresh=Date.now();
    try {
      const {days}=await api("tutor/week");
      if (generation!==check) return;
      state.mem.days=days;
      persist();
      repaint(true);
    } catch {
      if (generation===check) weekFresh=0;
    }
  }

  function recordDemo(chapters,books) {
    if (state.signed || chapters+books<=0) return;
    const day=studyDay();
    const last=state.mem.days.find(row=>row.day===day) || {day,chapters:0,books:0};
    state.mem.days=[...state.mem.days.filter(row=>row.day!==day),{day,chapters:last.chapters+chapters,books:last.books+books}].slice(-21);
    persist();
  }

  async function searchBook(book, manual) {
    if (!book || book.demo || !state.signed || state.offline || navigator.onLine===false) return;
    const id=bookMemoryKey(book);
    const requestKey=state.scope+"|"+id;
    const check=generation;
    if (referenceRequests.has(requestKey)) return referenceRequests.get(requestKey);
    if (manual) {
      state.lookupBusy=true;
      state.lookupStatus="Đang đối chiếu nguồn công khai…";
      repaint();
      animate("search-1");
    }
    const response=(async()=>{
      try {
        const reference=await api("tutor/sources/"+book.id);
        if (generation!==check) return;
        const previous=state.mem.refs[id];
        if (reference.reachable && reference.sources?.length) state.mem.refs[id]=reference;
        else state.mem.refs[id]={...(previous||{sources:[],related:[]}),checkedAt:Date.now()};
        const ordered=Object.entries(state.mem.refs).sort((a,b)=>b[1].checkedAt-a[1].checkedAt);
        state.mem.refs=Object.fromEntries(ordered.slice(0,120));
        persist();
        if (state.bookId===book.id) { state.lookupStatus=reference.sources?.length ?
          "Đã đối chiếu và cập nhật nguồn." : reference.reachable ?
          "Chưa tìm được kết quả khớp tên sách hoặc tác giả." : "Nguồn công khai đang bận. Mầm dùng dữ liệu đã lưu."; }
      } catch (error) {
        if (generation===check && state.bookId===book.id) state.lookupStatus=error.message || "Kết nối tra cứu chưa sẵn sàng.";
      } finally {
        referenceRequests.delete(requestKey);
        if (generation===check) {
          if (manual) state.lookupBusy=false;
          repaint(!manual);
          if (manual) animate("search-7");
        }
      }
    })();
    referenceRequests.set(requestKey,response);
    return response;
  }

  function autoLearn() {
    if (autoCount>=2 || !state.mem.auto || !state.signed || state.offline || navigator.onLine===false) return;
    const now=Date.now();
    const books=state.books.filter(book=>{
      const reference=state.mem.refs[bookMemoryKey(book)];
      return !book.demo && now-(reference?.checkedAt||0)>=expiryFor(reference) &&
        !referenceRequests.has(state.scope+"|"+bookMemoryKey(book));
    });
    const first=books[0];
    if (!first) return;
    const check=generation;
    const refresh=()=>{
      if (generation!==check || !state.mem.auto || autoCount>=2 ||
          referenceRequests.has(state.scope+"|"+bookMemoryKey(first))) return;
      autoCount++;
      void searchBook(first,false).then(()=> { if (generation===check) autoLearn(); });
    };
    if (typeof requestIdleCallback==="function") requestIdleCallback(refresh,{timeout:2400});
    else setTimeout(refresh,500);
  }

  function open() {
    if (!isVisible()) return;
    animate(state.tab==="week"?"review-1":"greet-1");
    void fetchNotes();
    void fetchWeek();
  }

  async function saveNote(fields) {
    const book=currentBook();
    const chapter=Number(fields.chapter);
    const part=String(fields.part||"").trim().slice(0,120);
    const note=String(fields.note||"").trim().slice(0,2200);
    if (!book || !Number.isSafeInteger(chapter) || chapter<1 || chapter>book.total || !note) {
      throw Error("Chọn chương hợp lệ và nhập điều anh ghi nhớ.");
    }
    if (state.signed && state.offline) throw Error("Kết nối lại để đồng bộ ghi chú.");
    const check=generation;
    await noteRequests.get(book.id)?.catch(()=>{});
    if (generation!==check) return;
    const original=state.mem.notes[book.id]||[];
    if (!state.signed && original.length>=500 && !original.some(row=>row.chapter===chapter)) {
      throw Error("Mỗi sách lưu tối đa 500 chương ghi chú.");
    }
    const saved=state.signed ? (await api("tutor/notes/"+book.id,"PUT",{chapter,part,note})).note :
      {chapter,part,note,updated:Date.now()};
    if (generation!==check) return;
    const latest=state.mem.notes[book.id]||[];
    state.mem.notes[book.id]=[...latest.filter(row=>row.chapter!==chapter),saved].sort((a,b)=>a.chapter-b.chapter);
    persist();
    if (state.bookId===book.id) {
      state.editChapter=chapter;
      state.noteOpen=true;
      state.filter="chapter:"+chapter;
      state.notesError="";
      repaint();
      animate("guide-6");
      toast("Đã lưu ghi chú chương "+chapter+".");
    }
  }

  function ask(question) {
    const clean=String(question||"").trim().slice(0,260);
    if (!clean) throw Error("Nhập một câu hỏi trước khi hỏi Mầm.");
    const query=" "+normalized(clean)+" ";
    const mentions=value=> {
      const name=normalized(value);
      return name.length>=4 && query.includes(" "+name+" ");
    };
    const shelf=[...state.books,...state.mem.books];
    const book=shelf.find(item=>mentions(item.title)) || shelf.find(item=>mentions(item.author)) || currentBook();
    const notes=state.mem.notes[book?.id]||[];
    const sources=book && state.mem.refs[bookMemoryKey(book)]?.sources || [];
    state.question=clean;
    state.answer=answerFromMemory(clean,book,notes,sources,weekReport(state.mem.days));
    repaint();
    animate("thinking-2");
  }

  function click(target) {
    switch(target.dataset.action) {
      case "tutor-tab":
        selectTab(target.dataset.tutorTab);
        return true;
      case "tutor-related": selectBook(target.dataset.id); return true;
      case "tutor-prompt": ask(tutorPrompts[target.dataset.prompt]); return true;
      case "tutor-refresh": void searchBook(currentBook(),true); return true;
      case "tutor-scene": {
        const chosen=mamScenes.find(row=>row.id===target.dataset.scene);
        if (!chosen) return true;
        state.scene=chosen.id;
        target.closest(".scene-list")?.querySelectorAll("[data-scene]").forEach(node=>node.setAttribute("aria-pressed",String(node===target)));
        const stage=document.querySelector(".tutor-scene-stage");
        stage.querySelector("[data-scene-label]").textContent=chosen.name;
        playMam(stage,chosen.id,motion());
        return true;
      }
      default: return false;
    }
  }
  function change(target) {
    if (target.id==="tutor-book") {
      if (state.tab==="memory") {
        state.bookId=target.value;
        resetBook();
        repaint();
      } else selectBook(target.value);
    } else if (target.id==="tutor-scope") { state.filter=target.value; repaint(); }
    else if (target.id==="tutor-edit-note") { state.editChapter=Number(target.value)||0; state.noteOpen=true; repaint(); }
    else if (target.id==="tutor-week") { state.week=Number(target.value); repaint(); }
    else if (target.id==="tutor-scenes") { state.mood=target.value; repaint(); }
    else if (target.id==="tutor-auto") { state.mem.auto=target.checked; persist(); autoLearn(); }
    else return false;
    return true;
  }

  return { view,sync,open,selectBook,selectTab,autoLearn,saveNote,ask,click,change,recordDemo,invalidateWeek };
}
