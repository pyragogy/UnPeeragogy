import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const SECTION_COLORS: Record<string, string> = {
  "Peeragogy in Practice":                  "#6366f1",
  "Resources":                              "#8b5cf6",
  "Cooperation":                            "#06b6d4",
  "Convening a Group":                      "#d946ef",
  "Introduction":                           "#10b981",
  "Organizing a Learning Context":          "#f59e0b",
  "Technologies, Services, and Platforms":  "#f97316",
  "Motivation":                             "#ec4899",
  "Assessment":                             "#84cc16",
  "Altri":                                  "#a1a1aa",
};

type GraphNode = {
  id: string;
  name: string;
  group: "peeragogy" | "unpeeragogy" | "unpeeragogy-only";
  val: number;
  tension: number | null;
  section: string;
  sectionColor: string;
  readingTime: number;
};

type GraphLink = {
  source: string;
  target: string;
  type: string;
  weight?: number;
  sharedTags?: string[];
};

type SectionInfo = {
  color: string;
  order: number;
  peerCount: number;
  unpeerCount: number;
  entries: { slug: string; title: string }[];
};

type GraphResponse = {
  nodes: GraphNode[];
  links: GraphLink[];
  sections: Record<string, SectionInfo>;
  metrics: {
    nodeCount: number;
    linkCount: number;
    peerCount: number;
    unpeerCount: number;
    unpeerOnlyCount: number;
    totalPeerEntries: number;
    unpeerPairedCount: number;
    avgTension: number;
    coverage: number;
    density: number;
    unpeerOnlyRatio: number;
  };
  buildTimestamp: string;
};

export const GET: APIRoute = async () => {
  const peeragogyEntries = await getCollection("peeragogy");
  const unpeeragogyEntries = await getCollection("unpeeragogy");

  // Sections
  const sections = new Map<string, typeof peeragogyEntries>();
  for (const entry of peeragogyEntries) {
    const section = entry.data.section || "Altri";
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section)!.push(entry);
  }
  for (const [, entries] of sections) {
    entries.sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
  }

  const sectionOrder = Array.from(sections.keys()).sort((a, b) => {
    const aMin = Math.min(...sections.get(a)!.map((e) => e.data.order || 99));
    const bMin = Math.min(...sections.get(b)!.map((e) => e.data.order || 99));
    return aMin - bMin;
  });

  // Nodes
  const nodes: GraphNode[] = [];
  const nodeMap = new Map<string, GraphNode>();

  for (const pe of peeragogyEntries) {
    const ue = unpeeragogyEntries.find((e) => e.slug === pe.slug);
    const sec = pe.data.section || "Altri";
    const node: GraphNode = {
      id: pe.slug,
      name: pe.data.title || pe.slug,
      group: ue ? "unpeeragogy" : "peeragogy",
      val: ue ? 2 : 1,
      tension: ue?.data?.tension_index ?? null,
      section: sec,
      sectionColor: SECTION_COLORS[sec] || "#a1a1aa",
      readingTime: pe.data.readingTime ?? 0,
    };
    nodeMap.set(pe.slug, node);
    nodes.push(node);
  }

  for (const ue of unpeeragogyEntries) {
    if (!peeragogyEntries.find((e) => e.slug === ue.slug)) {
      const sec = ue.data.section || "Altri";
      const node: GraphNode = {
        id: ue.slug,
        name: ue.data.title || ue.slug,
        group: "unpeeragogy-only",
        val: 2,
        tension: ue.data.tension_index ?? null,
        section: sec,
        sectionColor: SECTION_COLORS[sec] || "#a1a1aa",
        readingTime: ue.data.readingTime ?? 0,
      };
      nodeMap.set(ue.slug, node);
      nodes.push(node);
    }
  }

  // Links
  const links: GraphLink[] = [];

  for (const [, entries] of sections) {
    for (let i = 0; i < entries.length - 1; i++) {
      links.push({ source: entries[i].slug, target: entries[i + 1].slug, type: "chain" });
    }
  }

  for (let i = 0; i < sectionOrder.length - 1; i++) {
    const cur = sections.get(sectionOrder[i]);
    const next = sections.get(sectionOrder[i + 1]);
    if (cur?.length && next?.length) {
      links.push({ source: cur[cur.length - 1].slug, target: next[0].slug, type: "bridge" });
    }
  }

  const tagGroups = new Map<string, string[]>();
  for (const pe of peeragogyEntries) {
    if (pe.data.tags) {
      for (const tag of pe.data.tags) {
        if (!tagGroups.has(tag)) tagGroups.set(tag, []);
        tagGroups.get(tag)!.push(pe.slug);
      }
    }
  }
  for (const [, slugs] of tagGroups) {
    if (slugs.length >= 3 && slugs.length <= 15) {
      for (let i = 0; i < slugs.length - 1; i++) {
        links.push({ source: slugs[i], target: slugs[i + 1], type: "tag-" + slugs.length });
      }
    }
  }

  // Map tags per slug (peer + unpeer combined)
  const nodeTags: Record<string, string[]> = {};
  for (const pe of peeragogyEntries) {
    const tags = new Set<string>();
    if (pe.data.tags) pe.data.tags.forEach(t => tags.add(t));
    const ue = unpeeragogyEntries.find(e => e.slug === pe.slug);
    if (ue?.data.tags) ue.data.tags.forEach(t => tags.add(t));
    if (tags.size > 0) nodeTags[pe.slug] = Array.from(tags);
  }
  for (const ue of unpeeragogyEntries) {
    if (!peeragogyEntries.find(e => e.slug === ue.slug) && ue.data.tags) {
      nodeTags[ue.slug] = ue.data.tags;
    }
  }

  const tensionNodes = nodes
    .filter((n) => n.tension !== null && n.tension > 0)
    .sort((a, b) => (a.tension ?? 0) - (b.tension ?? 0));
  for (let i = 0; i < tensionNodes.length; i++) {
    for (let j = i + 1; j < tensionNodes.length; j++) {
      const a = tensionNodes[i];
      const b = tensionNodes[j];
      if ((b.tension ?? 0) - (a.tension ?? 0) > 0.3) break;
      if (a.section !== b.section) {
        // Only connect if nodes share at least one semantic tag (not base)
        const aTags = nodeTags[a.id] || [];
        const bTags = nodeTags[b.id] || [];
        const baseTags = new Set(["unpeeragogy", "decostruzione", "anti-pattern"]);
        const shared = aTags.filter(t => bTags.includes(t) && !baseTags.has(t));
        if (shared.length > 0) {
          links.push({ source: a.id, target: b.id, type: "tension", weight: shared.length, sharedTags: shared });
          break;
        }
      }
    }
  }

  // Sections info
  const sectionInfoMap: Record<string, SectionInfo> = {};
  for (let i = 0; i < sectionOrder.length; i++) {
    const s = sectionOrder[i];
    const entries = sections.get(s)!;
    sectionInfoMap[s] = {
      color: SECTION_COLORS[s] || "#a1a1aa",
      order: i,
      peerCount: entries.length,
      unpeerCount: unpeeragogyEntries.filter((e) =>
        entries.some((pe) => pe.slug === e.slug)
      ).length,
      entries: entries.map((e) => ({ slug: e.slug, title: e.data.title || e.slug })),
    };
  }

  // Metrics
  const unpeerCount = nodes.filter((n) => n.group === "unpeeragogy" || n.group === "unpeeragogy-only").length;
  const unpeerOnlyCount = nodes.filter((n) => n.group === "unpeeragogy-only").length;
  const tensions = nodes
    .map((n) => n.tension)
    .filter((t): t is number => t !== null && t > 0);
  const avgTension = tensions.length > 0
    ? tensions.reduce((a, b) => a + b, 0) / tensions.length
    : 0;
  const peerCount = nodes.length - unpeerCount;
  const unpeerPairedCount = unpeeragogyEntries.filter((ue) =>
    peeragogyEntries.some((pe) => pe.slug === ue.slug)
  ).length;
  const totalPeerEntries = peeragogyEntries.length;

  const response: GraphResponse = {
    nodes,
    links,
    sections: sectionInfoMap,
    metrics: {
      nodeCount: nodes.length,
      linkCount: links.length,
      peerCount,
      unpeerCount,
      unpeerOnlyCount,
      totalPeerEntries,
      unpeerPairedCount,
      avgTension: Math.round(avgTension * 100) / 100,
      coverage: Math.round((unpeerPairedCount / Math.max(totalPeerEntries, 1)) * 100) / 100,
      density: Math.round((links.length / Math.max(nodes.length, 1)) * 100) / 100,
      unpeerOnlyRatio: Math.round((unpeerOnlyCount / Math.max(nodes.length, 1)) * 10000) / 100,
    },
    buildTimestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=600",
    },
  });
};
