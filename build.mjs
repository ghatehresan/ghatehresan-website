#!/usr/bin/env node
/* =============================================================
   قطعه‌رسان — استاتیک‌ساز
   صفحات را از روی src/pages + src/partials به public/ می‌سازد.
   بدون وابستگی خارجی؛ فقط ماژول‌های داخلی Node.

   خروجی:
   - public/*.html        (هر صفحهٔ داخل src/pages)
   - public/sitemap.xml
   - public/robots.txt
   - public/assets/images/logo-horizontal-light.svg (نسخهٔ معکوس برای زمینهٔ تیره)
   ============================================================= */

import fs from "node:fs";
import path from "node:path";
import { icons } from "./src/partials/icons.mjs";

const ROOT = process.cwd();
const PAGES_DIR = path.join(ROOT, "src/pages");
const PARTIALS_DIR = path.join(ROOT, "src/partials");
const OUT_DIR = path.join(ROOT, "public");

// دامنهٔ اصلی طبق کتاب برند. تا زمان ثبت قطعی دامنه، این مقدار
// در خروجی به‌عنوان نشانی رسمی استفاده می‌شود و در صورت تغییر
// دامنه فقط همین‌جا ویرایش کنید.
const SITE = {
  origin: "https://ghatehresan.ir",
  name: "قطعه‌رسان",
  latin: "GhatehResan",
  slogan: "قطعه‌ات رو می‌رسونیم",
  handle: "@ghatehresan",
  year: new Intl.DateTimeFormat("fa-IR-u-nu-fa", { year: "numeric" }).format(new Date()),
};

/* ---------- ابزار ---------- */

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function loadPartials() {
  const map = {};
  for (const f of fs.readdirSync(PARTIALS_DIR)) {
    if (f.endsWith(".html")) map[f.replace(/\.html$/, "")] = read(path.join(PARTIALS_DIR, f));
  }
  return map;
}

function renderLogoVariants() {
  // نسخهٔ استاندارد: برای زمینهٔ روشن (فوتر سفید و…)
  const src = read(path.join(OUT_DIR, "assets/images/logo-horizontal.svg"));
  // حذف وابستگی به فونت خارجی — فونت وزیرمتن روی خود سایت میزبانی می‌شود
  const selfHosted = src.replace(/<defs>\s*<style>[\s\S]*?<\/style>\s*<\/defs>/, "");

  // نسخهٔ معکوس برای زمینهٔ سرمه‌ای/تیره — فقط نگاشت رنگ طبق کتاب برند
  const light = selfHosted
    .replace(/stroke="#0E2A47"/g, 'stroke="#FFFFFF"')
    .replace(/<tspan fill="#0E2A47">/g, '<tspan fill="#FFFFFF">')
    .replace(/fill="#55616E"/g, 'fill="#B9C6D4"');

  const outPath = path.join(OUT_DIR, "assets/images/logo-horizontal-light.svg");
  fs.writeFileSync(outPath, light);
  return { standard: selfHosted, light };
}

function applyConditionals(html, vars) {
  // <!--#if key--> … <!--#endif-->  (غیر تودرتو)
  return html.replace(/<!--#if\s+([\w.]+)\s*-->([\s\S]*?)<!--#endif-->/g, (_, key, body) =>
    vars[key] ? body : ""
  );
}

function render(template, vars, partials, depth = 0) {
  if (depth > 6) throw new Error("partial recursion too deep");
  let out = applyConditionals(template, vars);

  out = out.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in partials)) throw new Error(`partial not found: ${name}`);
    return render(partials[name], vars, partials, depth + 1);
  });

  out = out.replace(/\{\{icon:([\w-]+)\}\}/g, (_, name) => {
    if (!(name in icons)) throw new Error(`icon not found: ${name}`);
    return icons[name];
  });

  out = out.replace(/\{\{([\w.-]+)\}\}/g, (m, key) => {
    if (key in vars) return vars[key];
    throw new Error(`unresolved variable: ${key}`);
  });

  return out;
}

/* ---------- ساخت صفحات ---------- */

function build() {
  const partials = loadPartials();
  const logos = renderLogoVariants();
  const base = read(path.join(PARTIALS_DIR, "base.html"));

  const pages = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".html"));
  const manifest = [];

  for (const file of pages) {
    const name = file.replace(/\.html$/, "");
    const metaFile = path.join(PAGES_DIR, `${name}.json`);
    const meta = fs.existsSync(metaFile) ? JSON.parse(read(metaFile)) : {};

    const content = read(path.join(PAGES_DIR, file));
    const title = meta.title
      ? meta.isHome
        ? `${meta.title} — ${SITE.slogan}`
        : `${meta.title} | ${SITE.name}`
      : SITE.name;

    const vars = {
      ...SITE,
      ...meta,
      page_title: title,
      canonical: `${SITE.origin}${meta.path}`,
      "logo-standard": logos.standard,
      "logo-light": logos.light,
      jsonld_blocks: (meta.jsonld || [])
        .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
        .join("\n"),
    };

    let html;
    try {
      // محتوای صفحه را ابتدا رندر کن تا جزئی‌ها/آیکون‌های داخلش
      // پیش از تزریق در قالب پایه حل شوند.
      vars.content = render(content, vars, partials);
      html = render(base, vars, partials);
    } catch (e) {
      throw new Error(`[${file}] ${e.message}`);
    }

    // sanity check — هیچ placeholder حل‌نشده‌ای نباید باقی بماند
    const leftovers = html.match(/\{\{[^}]+\}\}/g);
    if (leftovers) throw new Error(`[${file}] unresolved placeholders: ${leftovers.join(", ")}`);

    fs.writeFileSync(path.join(OUT_DIR, file), html);
    manifest.push({
      path: meta.path,
      priority: meta.priority ?? 0.5,
      changefreq: meta.changefreq ?? "monthly",
      noindex: Boolean(meta.noindex),
    });
    console.log(`✓ ${file}`);
  }

  writeSitemap(manifest);
  writeRobots();
  console.log(`\n${pages.length} صفحه در ${path.relative(ROOT, OUT_DIR)}/ ساخته شد.`);
}

function writeSitemap(manifest) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = manifest
    .filter((m) => !m.noindex)
    .map(
      (m) => `  <url>
    <loc>${SITE.origin}${m.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${m.changefreq}</changefreq>
    <priority>${m.priority}</priority>
  </url>`
    )
    .join("\n");
  fs.writeFileSync(
    path.join(OUT_DIR, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
  console.log("✓ sitemap.xml");
}

function writeRobots() {
  fs.writeFileSync(
    path.join(OUT_DIR, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`
  );
  console.log("✓ robots.txt");
}

build();
