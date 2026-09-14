import { getCollection } from "astro:content";

export async function GET() {
  const peeragogy = await getCollection("peeragogy");
  const unpeeragogy = await getCollection("unpeeragogy");

  const theoryBySlug = new Map(peeragogy.map((entry) => [entry.slug, entry]));

  const records = unpeeragogy
    .map((entry) => {
      const theory = theoryBySlug.get(entry.slug);
      return {
        id: `unpeeragogy:${entry.slug}`,
        slug: entry.slug,
        url: `https://unpeeragogy.pyragogy.org/${entry.slug}/`,
        title: entry.data.title,
        section: entry.data.section ?? theory?.data.section ?? null,
        description: entry.data.description ?? null,
        origin: entry.data.origin ?? "seed",
        integrity_level: entry.data.integrity_level ?? "legacy",
        epistemic_status: entry.data.epistemic_status ?? null,
        verification_status: entry.data.verification_status ?? null,
        research_channels: entry.data.research_channels ?? [],
        method_version: entry.data.method_version ?? null,
        tension_index: entry.data.tension_index ?? null,
        tension_scale: entry.data.tension_index == null ? null : { min: 0, max: 3 },
        tags: entry.data.tags ?? [],
        synthetic_scenario: entry.data.synthetic_scenario ?? false,
        claim_id: entry.data.claim_id ?? null,
        revised_from: entry.data.revised_from ?? null,
        revised_to: entry.data.revised_to ?? null,
        provenance: entry.data.provenance ?? [],
        paired_theory: theory
          ? {
              id: `peeragogy:${entry.slug}`,
              url: `https://unpeeragogy.pyragogy.org/${entry.slug}/`,
              title: theory.data.title,
            }
          : null,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const counts = records.reduce(
    (acc, record) => {
      acc.total += 1;
      acc.integrity[record.integrity_level] = (acc.integrity[record.integrity_level] ?? 0) + 1;
      acc.origin[record.origin] = (acc.origin[record.origin] ?? 0) + 1;
      return acc;
    },
    { total: 0, integrity: {} as Record<string, number>, origin: {} as Record<string, number> },
  );

  const payload = {
    schema: "https://unpeeragogy.pyragogy.org/research-schema/v1",
    schema_version: "1.0.0",
    title: "UnPeeragogy Open Research Corpus",
    description:
      "Machine-readable index of UnPeeragogy research records, preserving epistemic state, verification state, research channel and provenance where available.",
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    project: "https://unpeeragogy.pyragogy.org/",
    repository: "https://github.com/pyragogy/UnPeeragogy",
    protocol: "https://unpeeragogy.pyragogy.org/protocol/",
    data_model: "https://github.com/pyragogy/UnPeeragogy/blob/main/docs/RESEARCH_DATA_MODEL.md",
    migration_note:
      "Records marked legacy predate the research-grade schema and must not be assumed to have provenance-enforced empirical status.",
    counts,
    records,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
