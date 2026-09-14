import { getCollection } from "astro:content";

const BASE = "https://unpeeragogy.pyragogy.org/";
const NS = `${BASE}research-schema/v1#`;

function sourceId(recordSlug: string, index: number, explicit?: string) {
  if (explicit) return `${BASE}prov/source/${encodeURIComponent(explicit)}`;
  return `${BASE}prov/source/${encodeURIComponent(recordSlug)}-${index + 1}`;
}

export async function GET() {
  const entries = await getCollection("unpeeragogy");
  const graph: Record<string, unknown>[] = [];

  graph.push({
    "@id": `${BASE}#project`,
    "@type": "prov:Agent",
    "schema:name": "UnPeeragogy",
    "schema:url": BASE,
  });

  graph.push({
    "@id": "https://orcid.org/0009-0004-7191-0455",
    "@type": "prov:Person",
    "schema:name": "Fabrizio Terzi",
  });

  for (const entry of entries) {
    const entityId = `${BASE}${entry.slug}/#research-record`;
    const method = entry.data.method_version ?? null;
    const methodId = method ? `${BASE}prov/activity/${encodeURIComponent(method)}` : null;

    const provenance = entry.data.provenance ?? [];
    const derived = provenance
      .filter((p) => p.kind !== "synthetic-scenario")
      .map((p, i) => ({ "@id": sourceId(entry.slug, i, p.id) }));

    graph.push({
      "@id": entityId,
      "@type": "prov:Entity",
      "schema:name": entry.data.title,
      "schema:url": `${BASE}${entry.slug}/`,
      "up:origin": entry.data.origin ?? "seed",
      "up:integrityLevel": entry.data.integrity_level ?? "legacy",
      "up:epistemicStatus": entry.data.epistemic_status ?? null,
      "up:verificationStatus": entry.data.verification_status ?? null,
      "up:tensionIndex": entry.data.tension_index ?? null,
      "prov:wasAttributedTo": { "@id": "https://orcid.org/0009-0004-7191-0455" },
      ...(methodId ? { "prov:wasGeneratedBy": { "@id": methodId } } : {}),
      ...(derived.length ? { "prov:wasDerivedFrom": derived } : {}),
      ...(entry.data.revised_from
        ? { "prov:wasRevisionOf": { "@id": `${BASE}${entry.data.revised_from}/#research-record` } }
        : {}),
    });

    if (methodId) {
      graph.push({
        "@id": methodId,
        "@type": "prov:Activity",
        "schema:name": method,
        "prov:wasAssociatedWith": { "@id": `${BASE}#project` },
      });
    }

    provenance.forEach((p, i) => {
      const sid = sourceId(entry.slug, i, p.id);
      graph.push({
        "@id": sid,
        "@type": p.kind === "synthetic-scenario" ? "up:IllustrativeScenario" : "prov:Entity",
        "schema:name": p.id ?? `${entry.slug} provenance ${i + 1}`,
        ...(p.uri ? { "schema:url": p.uri } : {}),
        ...(p.author ? { "schema:author": p.author } : {}),
        ...(p.date ? { "schema:dateCreated": p.date } : {}),
        ...(p.locator ? { "up:locator": p.locator } : {}),
        ...(p.claim ? { "up:claim": p.claim } : {}),
        ...(p.support ? { "up:supportRelation": p.support } : {}),
        ...(p.note ? { "schema:description": p.note } : {}),
      });
    });
  }

  const payload = {
    "@context": {
      prov: "http://www.w3.org/ns/prov#",
      schema: "https://schema.org/",
      up: NS,
    },
    "@id": `${BASE}prov.jsonld`,
    "@graph": graph,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/ld+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
