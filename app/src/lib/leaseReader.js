// Reads text out of a lease file entirely inside the browser. Nothing is sent anywhere.
// Supports: plain text, Word (.docx), and PDFs that contain real (selectable) text.

const latin1 = (u8) => {
  let out = "";
  const CH = 0x8000;
  for (let i = 0; i < u8.length; i += CH) out += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
  return out;
};
const utf8 = (u8) => new TextDecoder("utf-8").decode(u8);

async function inflate(bytes, format) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export class ReadError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/* ------------------------------ DOCX ------------------------------ */
async function readDocx(buf) {
  const u8 = new Uint8Array(buf);
  const dv = new DataView(buf);
  let e = u8.length - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new ReadError("unreadable", "Not a Word file");
  const count = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nl = dv.getUint16(p + 28, true);
    const el = dv.getUint16(p + 30, true);
    const cl = dv.getUint16(p + 32, true);
    const lo = dv.getUint32(p + 42, true);
    const name = utf8(u8.subarray(p + 46, p + 46 + nl));
    if (name === "word/document.xml") {
      const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
      const data = u8.subarray(start, start + csize);
      const xml = utf8(method === 0 ? data : await inflate(data, "deflate-raw"));
      return xml
        .replace(/<w:tab\/>/g, "\t")
        .replace(/<w:br[^>]*\/>/g, "\n")
        .replace(/<\/w:tc>/g, "  ")
        .replace(/<\/w:p>/g, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/&amp;/g, "&");
    }
    p += 46 + nl + el + cl;
  }
  throw new ReadError("unreadable", "No document body found");
}

/* ------------------------------- PDF ------------------------------- */
function balanced(str, from) {
  // str[from] must be the start of "<<"; returns the substring including the closing ">>"
  let depth = 0;
  for (let i = from; i < str.length - 1; i++) {
    if (str[i] === "<" && str[i + 1] === "<") {
      depth++;
      i++;
    } else if (str[i] === ">" && str[i + 1] === ">") {
      depth--;
      i++;
      if (depth === 0) return str.slice(from, i + 1);
    }
  }
  return str.slice(from);
}

function parseCMap(text) {
  const map = new Map();
  let bytes = 1;
  const hex = (h) => {
    let s = "";
    for (let i = 0; i + 3 < h.length + 1; i += 4) {
      const chunk = h.slice(i, i + 4);
      if (chunk.length < 4) break;
      s += String.fromCharCode(parseInt(chunk, 16));
    }
    return s;
  };
  for (const blk of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const m of blk[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      bytes = Math.max(bytes, m[1].length / 2);
      map.set(parseInt(m[1], 16), hex(m[2].padStart(4, "0")));
    }
  }
  for (const blk of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const m of blk[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*(<[0-9a-fA-F]+>|\[[^\]]*\])/g)) {
      bytes = Math.max(bytes, m[1].length / 2);
      const lo = parseInt(m[1], 16);
      const hi = Math.min(parseInt(m[2], 16), lo + 0xffff);
      if (m[3][0] === "[") {
        const items = [...m[3].matchAll(/<([0-9a-fA-F]+)>/g)].map((x) => hex(x[1].padStart(4, "0")));
        for (let c = lo; c <= hi && c - lo < items.length; c++) map.set(c, items[c - lo]);
      } else {
        const dst = m[3].slice(1, -1).padStart(4, "0");
        const base = parseInt(dst.slice(-4), 16);
        const prefix = hex(dst.slice(0, -4));
        for (let c = lo; c <= hi; c++) map.set(c, prefix + String.fromCharCode(base + (c - lo)));
      }
    }
  }
  return { map, bytes };
}

function decodeShown(raw, font) {
  if (!font || !font.cmap) return raw;
  const { map, bytes } = font.cmap;
  let out = "";
  for (let i = 0; i < raw.length; i += bytes) {
    let code = 0;
    for (let b = 0; b < bytes; b++) code = code * 256 + (raw.charCodeAt(i + b) || 0);
    out += map.has(code) ? map.get(code) : bytes === 1 ? raw[i] : "";
  }
  return out;
}

function tokenize(src) {
  const toks = [];
  let i = 0;
  const n = src.length;
  const isWs = (c) => c === " " || c === "\n" || c === "\r" || c === "\t" || c === "\f" || c === "\0";
  const isDelim = (c) => "()<>[]{}/%".includes(c);
  while (i < n) {
    const c = src[i];
    if (isWs(c)) {
      i++;
    } else if (c === "%") {
      while (i < n && src[i] !== "\n" && src[i] !== "\r") i++;
    } else if (c === "(") {
      let depth = 1;
      let s = "";
      i++;
      while (i < n && depth > 0) {
        const d = src[i];
        if (d === "\\") {
          const nx = src[i + 1];
          if (nx === "n") s += "\n";
          else if (nx === "r") s += "\r";
          else if (nx === "t") s += "\t";
          else if (nx === "b") s += "\b";
          else if (nx === "f") s += "\f";
          else if (nx >= "0" && nx <= "7") {
            let o = nx;
            while (o.length < 3 && src[i + 1 + o.length] >= "0" && src[i + 1 + o.length] <= "7") o += src[i + 1 + o.length];
            s += String.fromCharCode(parseInt(o, 8) & 255);
            i += o.length - 1;
          } else if (nx === "\n" || nx === "\r") {
            if (nx === "\r" && src[i + 2] === "\n") i++;
          } else s += nx;
          i += 2;
        } else {
          if (d === "(") depth++;
          else if (d === ")") depth--;
          if (depth > 0) s += d;
          i++;
        }
      }
      toks.push({ t: "str", v: s });
    } else if (c === "<" && src[i + 1] === "<") {
      toks.push({ t: "op", v: "<<" });
      i += 2;
    } else if (c === ">" && src[i + 1] === ">") {
      toks.push({ t: "op", v: ">>" });
      i += 2;
    } else if (c === "<") {
      const j = src.indexOf(">", i);
      const h = src.slice(i + 1, j < 0 ? n : j).replace(/\s+/g, "");
      let s = "";
      for (let k = 0; k < h.length; k += 2) s += String.fromCharCode(parseInt((h.slice(k, k + 2) + "0").slice(0, 2), 16));
      toks.push({ t: "str", v: s });
      i = j < 0 ? n : j + 1;
    } else if (c === "[" || c === "]") {
      toks.push({ t: c });
      i++;
    } else if (c === "/") {
      let j = i + 1;
      while (j < n && !isWs(src[j]) && !isDelim(src[j])) j++;
      toks.push({ t: "name", v: src.slice(i + 1, j) });
      i = j;
    } else {
      let j = i;
      while (j < n && !isWs(src[j]) && !isDelim(src[j])) j++;
      if (j === i) {
        i++;
        continue;
      }
      const w = src.slice(i, j);
      toks.push(/^[+-]?(\d+\.?\d*|\.\d+)$/.test(w) ? { t: "num", v: parseFloat(w) } : { t: "op", v: w });
      i = j;
    }
  }
  return toks;
}

function extractPageText(content, fonts) {
  const toks = tokenize(content);
  let out = "";
  let font = null;
  let y = null;
  let lastY = null;
  let needBreak = false;
  let needSpace = false;
  let stack = [];
  let arr = null;

  const emit = (s) => {
    if (!s) return;
    if (needBreak && out && !out.endsWith("\n")) out += "\n";
    else if (needSpace && out && !/\s$/.test(out) && !/^\s/.test(s)) out += " ";
    needBreak = false;
    needSpace = false;
    lastY = y;
    out += s;
  };
  const moveTo = (newY, sameLineJump) => {
    if (newY !== null && lastY !== null && Math.abs(newY - lastY) > 1.5) needBreak = true;
    else if (sameLineJump) needSpace = true;
    y = newY;
  };

  for (const tk of toks) {
    if (tk.t === "[") {
      arr = [];
      continue;
    }
    if (tk.t === "]") {
      stack.push({ t: "arr", v: arr || [] });
      arr = null;
      continue;
    }
    if (arr) {
      arr.push(tk);
      continue;
    }
    if (tk.t !== "op") {
      stack.push(tk);
      if (stack.length > 12) stack.shift();
      continue;
    }
    const op = tk.v;
    const nums = stack.filter((s) => s.t === "num").map((s) => s.v);
    const last = stack[stack.length - 1];
    if (op === "BT") {
      y = null;
    } else if (op === "Tf") {
      const nm = stack.find((s) => s.t === "name");
      font = nm ? fonts[nm.v] || null : null;
    } else if (op === "Tj" && last && last.t === "str") {
      emit(decodeShown(last.v, font));
    } else if ((op === "'" || op === '"') && last && last.t === "str") {
      needBreak = true;
      emit(decodeShown(last.v, font));
    } else if (op === "TJ" && last && last.t === "arr") {
      for (const el of last.v) {
        if (el.t === "str") emit(decodeShown(el.v, font));
        else if (el.t === "num" && el.v < -200) needSpace = true;
      }
    } else if (op === "Td" || op === "TD") {
      const [tx = 0, ty = 0] = nums.slice(-2);
      const base = y === null ? lastY : y;
      moveTo(base === null ? null : base + ty, Math.abs(ty) <= 1.5 && tx > 0);
    } else if (op === "Tm" && nums.length >= 6) {
      moveTo(nums[nums.length - 1], true);
    } else if (op === "T*") {
      needBreak = true;
    }
    stack = [];
  }
  return out;
}

async function readPdf(buf) {
  const u8 = new Uint8Array(buf);
  const raw = latin1(u8);
  if (/\/Encrypt\b/.test(raw.slice(-4000)) || /\/Encrypt\s+\d+\s+\d+\s+R/.test(raw)) {
    throw new ReadError("locked", "Protected PDF");
  }

  const objs = new Map();
  const re = /(\d+)\s+\d+\s+obj\b/g;
  let m;
  const starts = [];
  while ((m = re.exec(raw))) starts.push({ num: Number(m[1]), at: m.index + m[0].length });
  for (let k = 0; k < starts.length; k++) {
    const { num, at } = starts[k];
    const endObj = raw.indexOf("endobj", at);
    const body = raw.slice(at, endObj < 0 ? raw.length : endObj);
    const sIdx = body.search(/stream\r?\n/);
    if (sIdx >= 0) {
      const dict = body.slice(0, sIdx);
      let ds = at + sIdx + 6;
      if (raw[ds] === "\r") ds++;
      if (raw[ds] === "\n") ds++;
      let de = raw.indexOf("endstream", ds);
      if (de < 0) de = endObj < 0 ? raw.length : endObj;
      while (de > ds && (raw[de - 1] === "\n" || raw[de - 1] === "\r")) de--;
      objs.set(num, { dict, data: u8.subarray(ds, de) });
    } else {
      objs.set(num, { dict: body, data: null });
    }
  }

  const streamText = async (o) => {
    if (!o || !o.data) return "";
    try {
      if (/\/FlateDecode|\/Fl\b/.test(o.dict)) return latin1(await inflate(o.data, "deflate"));
      if (/\/Filter/.test(o.dict)) return "";
      return latin1(o.data);
    } catch {
      return "";
    }
  };

  // Expand compressed object streams (newer PDFs keep page and font info inside them)
  for (const [, o] of [...objs]) {
    if (o.data && /\/Type\s*\/ObjStm/.test(o.dict)) {
      const txt = await streamText(o);
      const N = Number((/\/N\s+(\d+)/.exec(o.dict) || [])[1]);
      const first = Number((/\/First\s+(\d+)/.exec(o.dict) || [])[1]);
      if (!N || !first) continue;
      const nums = txt.slice(0, first).trim().split(/\s+/).map(Number);
      for (let i = 0; i < N; i++) {
        const num = nums[i * 2];
        const off = nums[i * 2 + 1];
        const next = i + 1 < N ? nums[(i + 1) * 2 + 1] : txt.length - first;
        if (Number.isFinite(num) && Number.isFinite(off)) objs.set(num, { dict: txt.slice(first + off, first + next), data: null });
      }
    }
  }

  const ref = (s) => {
    const r = /(\d+)\s+\d+\s+R/.exec(s || "");
    return r ? Number(r[1]) : null;
  };
  const dictOf = (num) => (objs.get(num) ? objs.get(num).dict : "");

  const fontCache = new Map();
  const loadFont = async (num) => {
    if (fontCache.has(num)) return fontCache.get(num);
    const d = dictOf(num);
    const tu = /\/ToUnicode\s+(\d+)\s+\d+\s+R/.exec(d);
    let cmap = null;
    if (tu) {
      const txt = await streamText(objs.get(Number(tu[1])));
      if (txt) {
        const parsed = parseCMap(txt);
        if (parsed.map.size) cmap = parsed;
      }
    }
    const f = { cmap };
    fontCache.set(num, f);
    return f;
  };

  const fontMapFrom = async (resText) => {
    const out = {};
    if (!resText) return out;
    let res = resText;
    const rr = /^\s*(\d+)\s+\d+\s+R\s*$/.exec(res);
    if (rr) res = dictOf(Number(rr[1]));
    const fi = res.search(/\/Font\b/);
    if (fi < 0) return out;
    let fd = res.slice(fi + 5).trimStart();
    if (fd.startsWith("<<")) fd = balanced(fd, 0);
    else {
      const n = ref(fd);
      fd = n ? dictOf(n) : "";
    }
    for (const e of fd.matchAll(/\/([^\s/<>[\]()]+)\s+(\d+)\s+\d+\s+R/g)) out[e[1]] = await loadFont(Number(e[2]));
    return out;
  };

  const resourcesOf = (d) => {
    const i = d.search(/\/Resources\b/);
    if (i < 0) return null;
    const rest = d.slice(i + 10).trimStart();
    return rest.startsWith("<<") ? balanced(rest, 0) : rest.slice(0, 30);
  };

  // Walk the page tree in reading order
  const pages = [];
  const walk = (num, inheritedRes, depth) => {
    if (depth > 30) return;
    const d = dictOf(num);
    const res = resourcesOf(d) || inheritedRes;
    if (/\/Type\s*\/Pages\b/.test(d) || (/\/Kids\b/.test(d) && !/\/Type\s*\/Page\b(?!s)/.test(d))) {
      const ki = d.search(/\/Kids\b/);
      const arrTxt = ki >= 0 ? d.slice(ki).slice(0, d.slice(ki).indexOf("]") + 1) : "";
      for (const k of arrTxt.matchAll(/(\d+)\s+\d+\s+R/g)) walk(Number(k[1]), res, depth + 1);
    } else if (d) {
      pages.push({ d, res });
    }
  };
  let rootNum = null;
  for (const [num, o] of objs) {
    if (/\/Type\s*\/Catalog\b/.test(o.dict)) {
      const pr = /\/Pages\s+(\d+)\s+\d+\s+R/.exec(o.dict);
      if (pr) rootNum = Number(pr[1]);
      break;
    }
  }
  if (rootNum) walk(rootNum, null, 0);
  if (!pages.length) {
    for (const [, o] of objs) if (/\/Type\s*\/Page\b(?!s)/.test(o.dict)) pages.push({ d: o.dict, res: resourcesOf(o.dict) });
  }

  const texts = [];
  for (const pg of pages) {
    const fonts = await fontMapFrom(pg.res);
    const ci = pg.d.search(/\/Contents\b/);
    if (ci < 0) continue;
    const tail = pg.d.slice(ci + 9).trimStart();
    let refs = [];
    if (tail.startsWith("[")) refs = [...tail.slice(0, tail.indexOf("]")).matchAll(/(\d+)\s+\d+\s+R/g)].map((x) => Number(x[1]));
    else {
      const n = ref(tail.slice(0, 30));
      if (n) {
        const target = objs.get(n);
        if (target && !target.data && /\[/.test(target.dict)) refs = [...target.dict.matchAll(/(\d+)\s+\d+\s+R/g)].map((x) => Number(x[1]));
        else refs = [n];
      }
    }
    let content = "";
    for (const r of refs) content += (await streamText(objs.get(r))) + "\n";
    texts.push(extractPageText(content, fonts));
  }
  return texts.join("\n");
}

/* ------------------------------ helpers ------------------------------ */
const HEADING = /^(?:(?:section|article|clause|paragraph|addendum|schedule|exhibit|appendix)\b|\d{1,2}(?:\.\d{1,2}){0,2}[.)]\s+[A-Z(]|[A-Z][A-Z0-9 &,/'’\-—:]{3,60}$)/i;

// Joins hard-wrapped lines back into paragraphs, keeping headings on their own lines.
export function reflow(text) {
  const out = [];
  for (const para of text.split(/\n{2,}/)) {
    let cur = "";
    for (const line of para.split("\n")) {
      const l = line.trim();
      if (!l) continue;
      const startsNew = cur && (HEADING.test(l) || /[.!?:;]["”’)]?$/.test(cur) && /^[A-Z0-9(•\-–]/.test(l) && cur.length > 0 && l.length < 0);
      if (!cur) cur = l;
      else if (startsNew || (/[.!?:;]["”’)]?$/.test(cur) && HEADING.test(l))) {
        out.push(cur);
        cur = l;
      } else cur += (cur.endsWith("-") ? "" : " ") + l;
    }
    if (cur) out.push(cur);
    out.push("");
  }
  return out.join("\n");
}

function looksLikeText(t) {
  const words = t.match(/[A-Za-z]{2,}/g) || [];
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  return words.length >= 40 && letters / Math.max(1, t.length) > 0.5;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|heic|heif|avif|tiff?)$/;
const VIDEO_EXT = /\.(mp4|mov|m4v|webm|3gp|mkv|avi)$/;

/**
 * Reads a File and returns { text, kind, note }.
 * Throws ReadError with code: "unsupported" | "locked" | "noText" | "unreadable" | "tooBig"
 *   | "ocrUnavailable" | "imageFormat" | "videoFormat" | "oldWord"
 * `report(message)` is called with progress updates.
 */
export async function readLeaseFile(file, report = () => {}) {
  const isVideo = (file.type || "").startsWith("video/") || VIDEO_EXT.test((file.name || "").toLowerCase());
  const limit = isVideo ? 300 * 1024 * 1024 : 40 * 1024 * 1024;
  if (file.size > limit) throw new ReadError("tooBig", "File is too large");
  const name = (file.name || "").toLowerCase();
  const type = file.type || "";
  const isPdf = type === "application/pdf" || name.endsWith(".pdf");
  const isDocx = name.endsWith(".docx") || type.includes("wordprocessingml");
  const isOldWord = name.endsWith(".doc") || type === "application/msword";
  const isImage = type.startsWith("image/") || IMAGE_EXT.test(name);
  const isText = type.startsWith("text/") || /\.(txt|md|text)$/.test(name);

  let text = "";
  let kind = "text";
  let note = "";
  try {
    if (isPdf) {
      kind = "pdf";
      const buf = await file.arrayBuffer();
      let ocrErr = null;
      try {
        const { readPdfWithOcr } = await import("./leaseOcr.js");
        const r = await readPdfWithOcr(buf, report, file.name);
        text = reflow(r.text);
        if (r.usedOcr) note = "ocr";
        if (r.skipped) note = "ocr-partial";
        if (r.ocrFailed && !looksLikeText(text)) throw new ReadError("ocrUnavailable", "Reading tool unavailable");
      } catch (err) {
        if (err instanceof ReadError && err.code === "locked") throw err;
        ocrErr = err;
      }
      if (!looksLikeText(text)) {
        // Fall back to the built-in reader if the page reader could not start.
        try {
          const alt = reflow(await readPdf(buf));
          if (looksLikeText(alt)) {
            text = alt;
            note = "";
            ocrErr = null;
          }
        } catch (err) {
          if (err instanceof ReadError && err.code === "locked") throw err;
        }
        if (!looksLikeText(text) && ocrErr instanceof ReadError) throw ocrErr;
        if (!looksLikeText(text) && ocrErr) throw new ReadError("ocrUnavailable", "Reading tool unavailable");
      }
    } else if (isDocx) {
      kind = "docx";
      text = await readDocx(await file.arrayBuffer());
    } else if (isOldWord) {
      throw new ReadError("oldWord", "Old Word format");
    } else if (isImage) {
      kind = "image";
      const { readImage } = await import("./leaseOcr.js");
      text = reflow(await readImage(file, report, file.name));
      note = "ocr";
    } else if (isVideo) {
      kind = "video";
      const { readVideo } = await import("./leaseOcr.js");
      text = reflow(await readVideo(file, report, file.name));
      note = "ocr";
    } else if (isText) {
      text = reflow(await file.text());
    } else throw new ReadError("unsupported", "Unsupported file type");
  } catch (err) {
    if (err instanceof ReadError) throw err;
    throw new ReadError("unreadable", "Could not read file");
  } finally {
    if (isPdf || isImage || isVideo) import("./leaseOcr.js").then((m) => m.closeOcr()).catch(() => {});
  }
  if (!looksLikeText(text)) throw new ReadError("noText", "No readable text");
  return { text, kind, note };
}

export { looksLikeText };
