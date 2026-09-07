import { loadAllEntries } from "./loader.js";

/**
 * Pre-computed Phase 0 context for the Agent Perturbatore prompt.
 * Computed once at module load time (server startup), zero runtime cost.
 * No dependency on tools/index.ts to avoid circular imports.
 */

export interface Phase0Context {
  corpusStats: {
    totalEntries: number;
    theoryCount: number;
    realityCount: number;
    dualCoverage: number;
    coveragePercent: number;
    averageTension: number;
  };
  topFailureVectors: Array<{
    vector: string;
    count: number;
    avgTension: number;
  }>;
  topEntriesByTension: Array<{
    slug: string;
    title: string;
    tension: number;
  }>;
  corpusGaps: {
    theoryOrphans: number;
    realityOrphans: number;
    uncoveredVectors: string[];
    lowTensionAreas: number;
    topPriorities: Array<{
      type: string;
      recommendation: string;
      urgency: string;
    }>;
  };
}

let cached: Phase0Context | null = null;

function compute(): Phase0Context {
  const entries = loadAllEntries();
  const peerEntries = entries.filter((e) => e.collection === "peeragogy");
  const unpeerEntries = entries.filter((e) => e.collection === "unpeeragogy");

  const peerSlugs = new Set(peerEntries.map((e) => e.slug));
  const unpeerSlugs = new Set(unpeerEntries.map((e) => e.slug));
  const allSlugs = new Set([...peerSlugs, ...unpeerSlugs]);
  const dualSlugs = [...allSlugs].filter(
    (s) => peerSlugs.has(s) && unpeerSlugs.has(s)
  );

  const totalTi = unpeerEntries.reduce(
    (sum, e) => sum + (e.frontmatter.tension_index || 0),
    0
  );
  const avgTi =
    unpeerEntries.length > 0 ? totalTi / unpeerEntries.length : 0;

  // ── Top failure vectors by frequency ─────────────────────
  const vectorMap = new Map<
    string,
    { count: number; tensions: number[] }
  >();
  for (const e of entries) {
    for (const v of e.frontmatter.vectors || []) {
      const existing = vectorMap.get(v) || { count: 0, tensions: [] };
      existing.count++;
      if (e.frontmatter.tension_index !== undefined) {
        existing.tensions.push(e.frontmatter.tension_index);
      }
      vectorMap.set(v, existing);
    }
  }

  const topVectors = [...vectorMap.entries()]
    .map(([vector, data]) => ({
      vector,
      count: data.count,
      avgTension:
        data.tensions.length > 0
          ? data.tensions.reduce((a, b) => a + b, 0) / data.tensions.length
          : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // ── Top entries by tension (most fractured patterns) ────
  const topEntriesByTension = unpeerEntries
    .filter((e) => e.frontmatter.tension_index !== undefined)
    .sort(
      (a, b) =>
        (b.frontmatter.tension_index || 0) - (a.frontmatter.tension_index || 0)
    )
    .slice(0, 5)
    .map((e) => ({
      slug: e.slug,
      title: e.frontmatter.title || e.slug,
      tension: e.frontmatter.tension_index || 0,
    }));

  // ── Corpus gap analysis ──────────────────────────────────
  const theoryOrphans: string[] = [];
  for (const slug of allSlugs) {
    if (peerSlugs.has(slug) && !unpeerSlugs.has(slug)) {
      theoryOrphans.push(slug);
    }
  }

  const realityOrphans: string[] = [];
  for (const slug of allSlugs) {
    if (!peerSlugs.has(slug) && unpeerSlugs.has(slug)) {
      realityOrphans.push(slug);
    }
  }

  // Uncovered vectors: mentioned in theory but not in reality
  const allVectors = new Set<string>();
  for (const e of entries) {
    for (const v of e.frontmatter.vectors || []) {
      allVectors.add(v);
    }
  }
  const uncoveredVectors: string[] = [];
  for (const vector of allVectors) {
    const inTheory = peerEntries.filter(
      (e) => e.frontmatter.vectors?.includes(vector)
    ).length;
    const inReality = unpeerEntries.filter(
      (e) => e.frontmatter.vectors?.includes(vector)
    ).length;
    if (inReality === 0 && inTheory > 0) {
      uncoveredVectors.push(vector);
    }
  }

  // Low tension areas (possible false consensus)
  const lowTensionCount = unpeerEntries.filter(
    (e) =>
      e.frontmatter.tension_index !== undefined &&
      e.frontmatter.tension_index < 0.3
  ).length;

  // Top priorities
  const priorities: Phase0Context["corpusGaps"]["topPriorities"] = [];

  // Priority 1: theory orphans with vectors
  const orphanCandidates = theoryOrphans
    .map((slug) => {
      const p = peerEntries.find((e) => e.slug === slug)!;
      const vecCount = p.frontmatter.vectors?.length || 0;
      return { slug, title: p.frontmatter.title || slug, vecCount };
    })
    .filter((o) => o.vecCount > 0)
    .sort((a, b) => b.vecCount - a.vecCount)
    .slice(0, 3);

  for (const o of orphanCandidates) {
    priorities.push({
      type: "field-report-needed",
      recommendation: `Field report needed for "${o.title}" (${o.vecCount} vectors, no reality column)`,
      urgency: o.vecCount >= 2 ? "alta" : "media",
    });
  }

  // Priority 2: uncovered vectors
  for (const v of uncoveredVectors.slice(0, 3)) {
    priorities.push({
      type: "uncovered-vector",
      recommendation: `Vector "${v}" has theory entries but zero field reports`,
      urgency: "alta",
    });
  }

  // Priority 3: reality orphans (practice without theory — emerging patterns)
  for (const slug of realityOrphans.slice(0, 3)) {
    const u = unpeerEntries.find((e) => e.slug === slug);
    priorities.push({
      type: "theory-needed",
      recommendation: `"${u?.frontmatter.title || slug}" (\`${slug}\`) exists as field report but has no theory counterpart — possibly an emerging pattern`,
      urgency: "media",
    });
  }

  return {
    corpusStats: {
      totalEntries: entries.length,
      theoryCount: peerSlugs.size,
      realityCount: unpeerSlugs.size,
      dualCoverage: dualSlugs.length,
      coveragePercent:
        allSlugs.size > 0
          ? parseFloat(((dualSlugs.length / allSlugs.size) * 100).toFixed(1))
          : 0,
      averageTension: parseFloat(avgTi.toFixed(3)),
    },
    topFailureVectors: topVectors,
    topEntriesByTension,
    corpusGaps: {
      theoryOrphans: theoryOrphans.length,
      realityOrphans: realityOrphans.length,
      uncoveredVectors,
      lowTensionAreas: lowTensionCount,
      topPriorities: priorities,
    },
  };
}

/**
 * Get the pre-computed Phase 0 context (cached at module load).
 * Zero runtime cost after first call.
 */
export function getPhase0Context(): Phase0Context {
  if (!cached) {
    cached = compute();
  }
  return cached;
}

/**
 * Get a compact Phase 0 context block for embedding in the system prompt.
 * This is the data the AI model would otherwise call gap-analysis + map-failure-graph for.
 * Now it's pre-loaded — zero tool calls needed.
 */
export function getPhase0ContextBlock(): string {
  const ctx = getPhase0Context();
  const s = ctx.corpusStats;
  const lines: string[] = [];

  lines.push(`📊 CORPUS: ${s.totalEntries} entries, ${s.theoryCount} theory / ${s.realityCount} reality, ${s.coveragePercent}% dual coverage, avg tension ${s.averageTension}`);
  lines.push(``);

  lines.push(`🔍 TOP FAILURE VECTORS (pre-loaded):`);
  for (const v of ctx.topFailureVectors) {
    const bar = "█".repeat(Math.min(Math.round(v.avgTension * 3), 10));
    lines.push(`  • ${v.vector}: ${v.count} occurrences, avg tension ${v.avgTension.toFixed(2)} ${bar}`);
  }
  lines.push(``);

  lines.push(`🔥 MOST FRACTURED PATTERNS (pre-loaded):`);
  for (const e of ctx.topEntriesByTension) {
    lines.push(`  • ${e.title} (\`${e.slug}\`): tension ${e.tension.toFixed(2)}`);
  }
  lines.push(``);

  if (ctx.corpusGaps.topPriorities.length > 0) {
    lines.push(`⚠️ CORPUS GAPS (priority recommendations):`);
    for (const p of ctx.corpusGaps.topPriorities) {
      const tag = p.urgency === "alta" ? "HIGH" : p.urgency === "media" ? "MED" : "LOW";
      lines.push(`  [${tag}] ${p.recommendation}`);
    }
    lines.push(``);
  }

  if (ctx.corpusGaps.theoryOrphans > 0) {
    lines.push(`  📄 ${ctx.corpusGaps.theoryOrphans} theory-only slugs (no field reports yet)`);
  }
  if (ctx.corpusGaps.realityOrphans > 0) {
    lines.push(`  📄 ${ctx.corpusGaps.realityOrphans} reality-only slugs (no theory counterpart)`);
  }
  if (ctx.corpusGaps.uncoveredVectors.length > 0) {
    lines.push(`  🧩 ${ctx.corpusGaps.uncoveredVectors.length} vectors mentioned in theory but with zero field reports`);
  }
  if (ctx.corpusGaps.lowTensionAreas > 0) {
    lines.push(`  ⚠️ ${ctx.corpusGaps.lowTensionAreas} areas with tension < 0.3 (possible false consensus)`);
  }

  return lines.join("\n");
}

/**
 * Reset cache (used in tests or when content changes).
 */
export function resetPhase0Context(): void {
  cached = null;
}