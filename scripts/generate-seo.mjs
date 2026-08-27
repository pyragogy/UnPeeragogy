/**
 * Genera sitemap.xml e robots.txt per il progetto Unpeeragogy.
 * 
 * Eseguito prima della build via `astro.config.mjs`.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = process.env.SITE_URL || "https://unpeeragogy.pyragogy.org";
const OUT_DIR = path.resolve(__dirname, "..", "dist");

// Pages statice che conosciamo (non derive da content collections dinamiche)
const staticPages = [
  { slug: "/", priority: 1.0, changefreq: "weekly" },
  { slug: "/vault/", priority: 0.9, changefreq: "weekly" },
  { slug: "/log/", priority: 0.7, changefreq: "monthly" },
];

// Legge le slug delle content collections dal filesystem
function getContentSlugs(dir) {
  const fullPath = path.resolve(__dirname, "..", "src", "content", dir);
  if (!fs.existsSync(fullPath)) return [];
  return fs.readdirSync(fullPath)
    .filter(f => f.endsWith(".mdx"))
    .map(f => "/" + f.replace(/\.mdx$/, "") + "/");
}

function getLogSlugs() {
  const fullPath = path.resolve(__dirname, "..", "src", "content", "log");
  if (!fs.existsSync(fullPath)) return [];
  return fs.readdirSync(fullPath)
    .filter(f => f.endsWith(".mdx"))
    .map(f => "/log/" + f.replace(/\.mdx$/, "") + "/");
}

function generateSitemap() {
  const now = new Date().toISOString();

  const peerSlugs = getContentSlugs("peeragogy");
  const unpeerSlugs = getContentSlugs("unpeeragogy");
  const logSlugs = getLogSlugs();

  // Union of all slugs (each URL appears once)
  const allSlugs = new Set([
    ...staticPages.map(p => p.slug),
    ...peerSlugs,
    ...unpeerSlugs,
    ...logSlugs,
  ]);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `  xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const slug of allSlugs) {
    const staticEntry = staticPages.find(p => p.slug === slug);
    const priority = staticEntry?.priority || 0.6;
    const changefreq = staticEntry?.changefreq || "monthly";

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${slug}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

function generateRobots() {
  return `# Robots.txt per Unpeeragogy
# https://unpeeragogy.pyragogy.org

User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function generateSchemaOrg(slug, title, description, type = "WebPage") {
  const url = `${SITE_URL}${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": url,
    url: url,
    name: title,
    description: description,
    inLanguage: "it",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Unpeeragogy",
      description: "Decostruzione radicale della teoria peer-to-peer",
      inLanguage: "it",
    },
    about: {
      "@type": "Thing",
      name: "Peeragogy",
      description: "Teoria e pratica dell'apprendimento peer-to-peer, analizzata criticamente",
    },
  };
  return schema;
}

// Main
try {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // sitemap.xml
  const sitemap = generateSitemap();
  fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sitemap, "utf-8");
  console.log(`✅ sitemap.xml (${sitemap.split("\n").length - 2} URLs)`);

  // robots.txt
  const robots = generateRobots();
  fs.writeFileSync(path.join(OUT_DIR, "robots.txt"), robots, "utf-8");
  console.log("✅ robots.txt");

  // schema.org per homepage
  const schema = generateSchemaOrg("/", "Unpeeragogy", "Decostruzione radicale della teoria peer-to-peer, confrontata con la realtà operativa quotidiana.");
  const schemaPath = path.join(OUT_DIR, "schema.json");
  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), "utf-8");
  console.log("✅ schema.json");

  console.log("📄 SEO assets generati.");
} catch (err) {
  console.error("❌ SEO generation error:", err.message);
  process.exit(1);
}