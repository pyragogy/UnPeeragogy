import { getCollection } from "astro:content";

export async function GET() {
  const peeragogyEntries = await getCollection("peeragogy");
  const unpeeragogyEntries = await getCollection("unpeeragogy");

  // Build feed entries pairing peer + unpeer
  const sorted = peeragogyEntries
    .sort((a, b) => (a.data.order || 99) - (b.data.order || 99))
    .slice(0, 50);

  const items = sorted.map((pe) => {
    const ue = unpeeragogyEntries.find((e) => e.slug === pe.slug);
    const slug = `/${pe.slug}/`;
    const url = `https://unpeeragogy.pyragogy.org${slug}`;

    const isDual = ue ? " ⿻" : "";
    const content = ue
      ? `📖 Peeragogy: ${pe.data.description || ""}\n\n⚡ Unpeeragogy: ${ue.data.description || ""}`
      : pe.data.description || "";

    return `
  <entry>
    <id>${url}</id>
    <title>${pe.data.title}${isDual}</title>
    <link href="${url}"/>
    <summary type="html"><![CDATA[${content}]]></summary>
    <content type="html"><![CDATA[${content}]]></content>
    <category term="${pe.data.section || "Altri"}"/>
    <updated>${new Date().toISOString()}</updated>
  </entry>`;
  }).join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>https://unpeeragogy.pyragogy.org/feed.xml</id>
  <title>Unpeeragogy — Feed</title>
  <subtitle>Decostruzione radicale della teoria peer-to-peer, confrontata con la realtà operativa quotidiana.</subtitle>
  <link href="https://unpeeragogy.pyragogy.org/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="https://unpeeragogy.pyragogy.org/" rel="alternate" type="text/html"/>
  <updated>${new Date().toISOString()}</updated>
  <rights>CC0 1.0 Universal (Public Domain)</rights>
  <author>
    <name>Unpeeragogy</name>
    <uri>https://unpeeragogy.pyragogy.org/</uri>
  </author>
  ${items}
</feed>`;

  return new Response(feed, {
    status: 200,
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}