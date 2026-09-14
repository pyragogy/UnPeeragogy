import { getCollection } from "astro:content";

export async function GET() {
  const unpeeragogy = await getCollection("unpeeragogy");

  const parts = unpeeragogy
    .map((entry) => ({
      "@id": `https://unpeeragogy.pyragogy.org/${entry.slug}/`,
      "@type": "CreativeWork",
      name: entry.data.title,
      description: entry.data.description ?? undefined,
      license: { "@id": "https://creativecommons.org/publicdomain/zero/1.0/" },
      isPartOf: { "@id": "./" },
      keywords: entry.data.tags ?? [],
      additionalType: [
        `https://unpeeragogy.pyragogy.org/research-schema/v1#integrity-${entry.data.integrity_level ?? "legacy"}`,
        `https://unpeeragogy.pyragogy.org/research-schema/v1#origin-${entry.data.origin ?? "seed"}`,
      ],
      subjectOf: { "@id": "research.json" },
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const graph = [
    {
      "@id": "ro-crate-metadata.json",
      "@type": "CreativeWork",
      conformsTo: { "@id": "https://w3id.org/ro/crate/1.3" },
      about: { "@id": "./" },
    },
    {
      "@id": "./",
      "@type": "Dataset",
      name: "UnPeeragogy Open Research Corpus",
      description:
        "An open, continuously revisable qualitative and socio-technical research corpus examining the conditions under which peer-learning patterns hold, fracture, or require revision.",
      url: "https://unpeeragogy.pyragogy.org/",
      license: { "@id": "https://creativecommons.org/publicdomain/zero/1.0/" },
      creator: { "@id": "https://orcid.org/0009-0004-7191-0455" },
      identifier: "https://doi.org/10.5281/zenodo.22309102",
      mainEntity: { "@id": "research.json" },
      hasPart: parts.map((part) => ({ "@id": part["@id"] })),
      keywords: [
        "peeragogy",
        "qualitative research",
        "critical incident technique",
        "open research",
        "socio-technical systems",
        "knowledge provenance",
      ],
    },
    {
      "@id": "research.json",
      "@type": "Dataset",
      name: "Machine-readable UnPeeragogy research index",
      encodingFormat: "application/json",
      url: "https://unpeeragogy.pyragogy.org/research.json",
      isPartOf: { "@id": "./" },
    },
    {
      "@id": "https://orcid.org/0009-0004-7191-0455",
      "@type": "Person",
      name: "Fabrizio Terzi",
    },
    {
      "@id": "https://creativecommons.org/publicdomain/zero/1.0/",
      "@type": "CreativeWork",
      name: "CC0 1.0 Universal",
    },
    ...parts,
  ];

  const payload = {
    "@context": "https://w3id.org/ro/crate/1.3/context",
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
