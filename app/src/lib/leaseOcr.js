// Reads photos, scanned pages, PDFs and videos of a lease — entirely inside the browser.
// The reading tools are served from this site itself (no outside hosts), and the lease never leaves the device.
import { ReadError } from "./leaseReader.js";

const OCR_BASE = "/static/ocr";
const TESS_URL = `${OCR_BASE}/tesseract.min.js`;
const PDFJS_BASE = OCR_BASE;

/* ------------------------------ loading tools ------------------------------ */
const scripts = new Map();
function loadScript(src) {
  if (!scripts.has(src)) {
    scripts.set(
      src,
      new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => {
          scripts.delete(src);
          s.remove();
          reject(new Error("script"));
        };
        document.head.appendChild(s);
      }),
    );
  }
  return scripts.get(src);
}

let pdfjsPromise;
export function getPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      await loadScript(`${PDFJS_BASE}/pdf.min.js`);
      const lib = window.pdfjsLib;
      if (!lib) throw new Error("pdfjs");
      try {
        // Workers can't start straight from another host, so hand it over as a local blob.
        const code = await (await fetch(`${PDFJS_BASE}/pdf.worker.min.js`)).text();
        lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
      } catch {
        lib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
      }
      return lib;
    })().catch((e) => {
      pdfjsPromise = null;
      throw e;
    });
  }
  return pdfjsPromise;
}

let worker = null;
let workerPromise = null;
let onTick = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      await loadScript(TESS_URL);
      if (!window.Tesseract) throw new Error("tesseract");
      worker = await window.Tesseract.createWorker("eng", 1, {
        workerPath: `${OCR_BASE}/worker.min.js`,
        corePath: OCR_BASE,
        langPath: OCR_BASE,
        cacheMethod: "none",
        logger: (m) => onTick && onTick(m),
      });
      return worker;
    })().catch((e) => {
      workerPromise = null;
      throw new ReadError("ocrUnavailable", "Reading tool could not be loaded");
    });
  }
  return workerPromise;
}

export async function closeOcr() {
  const w = worker;
  worker = null;
  workerPromise = null;
  onTick = null;
  try {
    await w?.terminate();
  } catch {
    /* ignore */
  }
}

/* ------------------------------ picture prep ------------------------------ */
function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

// Brings any picture to a size and tone that text recognition reads best.
function prepare(source, sw, sh) {
  const long = Math.max(sw, sh);
  const k = long < 1800 || long > 3200 ? 2600 / long : 1;
  const c = makeCanvas(sw * k, sh * k);
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(source, 0, 0, c.width, c.height);
  // grayscale + gentle contrast stretch (works in every browser)
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  let lo = 255;
  let hi = 0;
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) {
    const g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
    d[i] = d[i + 1] = d[i + 2] = g;
    hist[g]++;
  }
  const total = d.length / 4;
  let acc = 0;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc > total * 0.01) {
      lo = v;
      break;
    }
  }
  acc = 0;
  for (let v = 255; v >= 0; v--) {
    acc += hist[v];
    if (acc > total * 0.2) {
      hi = v;
      break;
    }
  }
  if (hi - lo > 40) {
    const scale = 255 / (hi - lo);
    for (let i = 0; i < d.length; i += 4) {
      const g = Math.max(0, Math.min(255, ((d[i] - lo) * scale) | 0));
      d[i] = d[i + 1] = d[i + 2] = g;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

async function recognize(canvas) {
  const w = await getWorker();
  const { data } = await w.recognize(canvas);
  const lines = (data.lines || [])
    .map((l) => ({ t: (l.text || "").replace(/\s+/g, " ").trim(), c: l.confidence ?? data.confidence ?? 0 }))
    .filter((l) => l.t);
  if (!lines.length && data.text) {
    for (const t of data.text.split("\n")) if (t.trim()) lines.push({ t: t.trim(), c: data.confidence ?? 0 });
  }
  return { lines, confidence: data.confidence ?? 0 };
}

// Drops characters that are almost always noise from specks, folds and borders.
const clean = (t) => t.replace(/[|_~`^]{2,}/g, " ").replace(/\s{2,}/g, " ").trim();
const linesToText = (lines) => lines.map((l) => clean(l.t)).filter((t) => /[A-Za-z0-9]/.test(t)).join("\n");

function trackProgress(label, report) {
  onTick = (m) => {
    if (m.status === "recognizing text" && typeof m.progress === "number") report(`${label} · ${Math.round(m.progress * 100)}%`);
  };
}

/* ------------------------------ images ------------------------------ */
async function decodeImage(file) {
  try {
    if (window.createImageBitmap) {
      const bmp = await createImageBitmap(file);
      return { source: bmp, w: bmp.width, h: bmp.height };
    }
  } catch {
    /* fall through to <img> */
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, w: img.naturalWidth, h: img.naturalHeight };
  } catch {
    throw new ReadError("imageFormat", "Picture format not supported");
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export async function readImage(file, report, label) {
  report(`Opening ${label}…`);
  const { source, w, h } = await decodeImage(file);
  const canvas = prepare(source, w, h);
  source.close?.();
  trackProgress(`Reading ${label}`, report);
  const { lines } = await recognize(canvas);
  return linesToText(lines);
}

/* ------------------------------ PDFs ------------------------------ */
function rowsToText(items) {
  const rows = [];
  for (const it of items) {
    const str = it.str;
    if (!str || !str.trim()) continue;
    const x = it.transform[4];
    const y = it.transform[5];
    const size = Math.abs(it.height || it.transform[3] || 10) || 10;
    let row = rows.find((r) => Math.abs(r.y - y) <= Math.max(2, size * 0.45));
    if (!row) rows.push((row = { y, size, parts: [] }));
    row.parts.push({ x, w: it.width || str.length * size * 0.5, str });
  }
  rows.sort((a, b) => b.y - a.y);
  const out = [];
  let prevY = null;
  let prevSize = 10;
  for (const r of rows) {
    r.parts.sort((a, b) => a.x - b.x);
    let line = "";
    let end = null;
    for (const p of r.parts) {
      if (end !== null) {
        const gap = p.x - end;
        if (gap > r.size * 1.5) line += "   ";
        else if (gap > r.size * 0.12 && !line.endsWith(" ") && !p.str.startsWith(" ")) line += " ";
      }
      line += p.str;
      end = p.x + p.w;
    }
    if (prevY !== null && prevY - r.y > Math.max(prevSize, r.size) * 2) out.push("");
    out.push(line.trim());
    prevY = r.y;
    prevSize = r.size;
  }
  return out.join("\n");
}

const letters = (t) => (t.match(/[A-Za-z]/g) || []).length;

export async function readPdfWithOcr(buf, report, label) {
  const lib = await getPdfJs();
  let doc;
  try {
    doc = await lib.getDocument({
      data: new Uint8Array(buf.slice(0)),
      cMapUrl: `${PDFJS_BASE}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${PDFJS_BASE}/standard_fonts/`,
      isEvalSupported: false,
    }).promise;
  } catch (err) {
    if (err?.name === "PasswordException") throw new ReadError("locked", "Password protected");
    throw err;
  }

  const pages = [];
  let usedOcr = false;
  let skipped = 0;
  let ocrFailed = false;
  const MAX_OCR_PAGES = 40;
  let ocrCount = 0;

  for (let n = 1; n <= doc.numPages; n++) {
    report(`Reading ${label} · page ${n} of ${doc.numPages}`);
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const items = [...content.items];
    try {
      // Filled-in form fields (typed answers in DocuSign-style forms) are kept in their place on the page.
      for (const a of await page.getAnnotations()) {
        const v = a.fieldValue ?? a.contents;
        const val = Array.isArray(v) ? v.join(", ") : v;
        if (a.subtype !== "Widget" && a.subtype !== "FreeText") continue;
        if (a.checkBox || a.radioButton || a.pushButton || !val || typeof val !== "string" || /^(off|yes|on|true|false)$/i.test(val)) continue;
        items.push({ str: val, transform: [1, 0, 0, 1, a.rect[0], a.rect[1] + 2], width: a.rect[2] - a.rect[0], height: 10 });
      }
    } catch {
      /* annotations are a bonus */
    }
    const typed = rowsToText(items);

    let best = typed;
    // Scanned or photographed pages have little or no real text, so read the picture of the page instead.
    if (letters(typed) < 150) {
      if (ocrCount >= MAX_OCR_PAGES) {
        skipped++;
      } else {
        ocrCount++;
        const vp1 = page.getViewport({ scale: 1 });
        const k = Math.max(1.5, Math.min(3.5, 2600 / Math.max(vp1.width, vp1.height)));
        const vp = page.getViewport({ scale: k });
        const canvas = makeCanvas(vp.width, vp.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        trackProgress(`Reading ${label} · page ${n} of ${doc.numPages}`, report);
        try {
          const { lines } = await recognize(prepare(canvas, canvas.width, canvas.height));
          const ocr = linesToText(lines);
          usedOcr = true;
          if (letters(ocr) > letters(typed)) best = ocr;
        } catch (err) {
          if (!(err instanceof ReadError)) throw err;
          ocrFailed = true;
        }
      }
    }
    pages.push(best);
    page.cleanup();
  }
  doc.destroy?.();
  return { text: pages.join("\n\n"), usedOcr, skipped, ocrFailed };
}

/* ------------------------------ video ------------------------------ */
const words = (t) => new Set(t.toLowerCase().match(/[a-z0-9$]{2,}/g) || []);
function similar(a, b) {
  if (!a.size || !b.size) return false;
  let hit = 0;
  for (const w of a) if (b.has(w)) hit++;
  return hit / Math.min(a.size, b.size) >= 0.75 && hit / Math.max(a.size, b.size) >= 0.55;
}

function waitFor(el, ok, bad, ms = 20000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => done(new Error("timeout")), ms);
    function done(err) {
      clearTimeout(t);
      el.removeEventListener(ok, onOk);
      el.removeEventListener(bad, onBad);
      err ? reject(err) : resolve();
    }
    const onOk = () => done();
    const onBad = () => done(new Error("video"));
    el.addEventListener(ok, onOk);
    el.addEventListener(bad, onBad);
  });
}

export async function readVideo(file, report, label) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  try {
    report(`Opening ${label}…`);
    try {
      await waitFor(video, "loadeddata", "error");
    } catch {
      throw new ReadError("videoFormat", "Video format not supported");
    }
    const dur = video.duration;
    if (!isFinite(dur) || dur <= 0 || !video.videoWidth) throw new ReadError("videoFormat", "Video format not supported");

    const count = Math.min(24, Math.max(4, Math.ceil(dur / 1.5)));
    const kept = []; // {t, set, c}
    for (let i = 0; i < count; i++) {
      const at = Math.min(dur - 0.05, 0.2 + ((dur - 0.3) * i) / Math.max(1, count - 1));
      report(`Reading ${label} · frame ${i + 1} of ${count}`);
      video.currentTime = Math.max(0, at);
      try {
        await waitFor(video, "seeked", "error", 10000);
      } catch {
        continue;
      }
      const canvas = prepare(video, video.videoWidth, video.videoHeight);
      trackProgress(`Reading ${label} · frame ${i + 1} of ${count}`, report);
      const { lines } = await recognize(canvas);
      for (const l of lines) {
        const t = clean(l.t);
        if (t.length < 8 || l.c < 45 || !/[A-Za-z]{3}/.test(t)) continue;
        const set = words(t);
        const dup = kept.find((k) => similar(k.set, set));
        if (!dup) kept.push({ t, set, c: l.c });
        else if (l.c > dup.c + 8) Object.assign(dup, { t, set, c: l.c });
      }
    }
    return kept.map((k) => k.t).join("\n");
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
