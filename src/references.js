const agent = "ReadingBook/1.3 (https://reading-book.huongthiennature.com; huongthiennature@gmail.com)";
const openLibrary = "https://openlibrary.org";
const wikiLanguages = ["vi", "en"];

function clean(value, length = 260) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, length) : "";
}

function normalize(value) {
  return clean(value, 350).toLocaleLowerCase("vi").normalize("NFD").replace(/\p{Diacritic}/gu, "").replaceAll("đ","d").replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim();
}

function nearTitle(found, target) {
  const a = normalize(found);
  const b = normalize(target);
  return Boolean(a && b && (a === b || (b.length >= 12 && a.startsWith(b + " "))));
}

async function fromPublicJson(host, pathname, query) {
  const url = new URL(pathname, host);
  url.search = new URLSearchParams(query);
  const response = await fetch(url.href, {
    headers: { Accept: "application/json", "User-Agent": agent, "Api-User-Agent": agent },
    redirect: "manual",
    signal: AbortSignal.timeout(8500)
  });
  if (!response.ok) throw new Error("Reference unavailable");
  return response.json();
}

function catalogItem(doc) {
  const work = /^(?:\/works\/)?(OL[0-9]+W)$/.exec(doc.key || "")?.[1];
  if (!work || !clean(doc.title)) return null;
  return {
    title: clean(doc.title, 155),
    author: (doc.author_name || []).slice(0, 3).map(x => clean(x, 90)).filter(Boolean).join(", "),
    year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year : null,
    topics: (doc.subject || []).slice(0, 7).map(x => clean(x, 70)).filter(Boolean),
    url: openLibrary + "/works/" + work
  };
}

function matchesAuthor(authors, expected) {
  const key = normalize(expected);
  return normalize(authors) === key || authors.split(", ").some(author => normalize(author) === key);
}

async function findBooks(book) {
  const fields = "key,title,author_name,first_publish_year,subject";
  const exact = await fromPublicJson(openLibrary, "/search.json", {
    title: book.title, author: book.author, fields, limit: "4"
  });
  const work = (exact.docs || []).map(catalogItem).filter(Boolean)
    .find(doc => nearTitle(doc.title, book.title) && matchesAuthor(doc.author, book.author));
  if (!work) return { source: null, related: [] };

  let related = [];
  try {
    const more = await fromPublicJson(openLibrary, "/search.json", { author: book.author, fields, limit: "6" });
    const seen = new Set([normalize(work.title)]);
    for (const item of (more.docs || []).map(catalogItem).filter(Boolean)) {
      const title = normalize(item.title);
      if (seen.has(title) || nearTitle(item.title, work.title) || !matchesAuthor(item.author, book.author)) continue;
      seen.add(title);
      related.push(item);
      if (related.length === 3) break;
    }
  } catch { /* The matched catalog record remains useful. */ }

  const source = {
    ...work,
    provider: "Open Library",
    kind: "catalog",
    text: [work.author, work.year ? "Xuất bản lần đầu " + work.year : "", work.topics.slice(0, 3).join(", ")].filter(Boolean).join(" · ")
  };
  return { source, related };
}

function creditsAuthor(extract, author) {
  const name = normalize(author).split(" ").join("[\\s\\p{P}]+");
  const text = clean(extract, 900).normalize("NFD").replace(/\p{Diacritic}/gu, "").replaceAll("đ","d").replaceAll("Đ","D");
  const pattern = new RegExp("(?<![\\p{L}\\p{N}])" + name + "(?![\\p{L}\\p{N}])", "igu");
  return [...text.matchAll(pattern)].some(match => !/^\s+\p{Lu}\p{Ll}/u.test(text.slice(match.index + match[0].length)));
}

async function encyclopedia(book) {
  let answered = false;
  for (const lang of wikiLanguages) {
    const host = "https://" + lang + ".wikipedia.org";
    try {
      const result = await fromPublicJson(host, "/w/api.php", {
        action: "query", generator: "search", gsrsearch: book.title + " " + book.author, gsrlimit: "3",
        prop: "extracts", exintro: "1", explaintext: "1", exsentences: "2", exlimit: "3",
        format: "json", formatversion: "2", gsrnamespace: "0"
      });
      answered = true;
      const article = (result.query?.pages || []).find(page => nearTitle(page.title, book.title) &&
        creditsAuthor(page.extract, book.author) && Number.isSafeInteger(page.pageid));
      if (article) return {
        title: clean(article.title, 150), provider: lang === "vi" ? "Wikipedia tiếng Việt" : "Wikipedia tiếng Anh",
        kind: "overview", text: clean(article.extract, 440), url: host + "/?curid=" + article.pageid
      };
    } catch { /* Try the other language. */ }
  }
  if (!answered) throw new Error("Wikipedia unavailable");
  return null;
}

async function authorContext(book) {
  const site = "https://www.wikidata.org";
  for (const language of wikiLanguages) {
    const result = await fromPublicJson(site, "/w/api.php", {
      action: "wbsearchentities", search: book.author, language, uselang: language, type: "item",
      limit: "6", format: "json"
    });
    const evidence = (result.search || []).filter(item =>
      normalize(item.label) === normalize(book.author) &&
      /\b(writer|author|novelist|poet|philosopher|historian)\b|nha van|tac gia|nha tho|triet gia|su gia/.test(normalize(item.description)) &&
      /^Q\d+$/.test(item.id || ""));
    if (evidence.length === 1) {
      const person = evidence[0];
      return { title: clean(person.label, 150), provider: "Wikidata", kind: "author",
        text: clean(person.description), url: site + "/wiki/" + person.id };
    }
    if (evidence.length > 1) return null;
  }
  return null;
}

export async function collectReferences(book) {
  const jobs = await Promise.allSettled([findBooks(book), encyclopedia(book), authorContext(book)]);
  const values = jobs.map(job => job.status === "fulfilled" ? job.value : null);
  return {
    sources: [values[0]?.source, values[1], values[2]].filter(Boolean),
    related: values[0]?.related || [],
    reachable: jobs.some(job => job.status === "fulfilled"),
    checkedAt: Date.now()
  };
}
