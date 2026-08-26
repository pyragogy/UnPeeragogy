#!/usr/bin/env node
/**
 * seed-unpeeragogy.js — Generate seed anti-pattern content for the unpeeragogy collection.
 *
 * For each existing peeragogy slug, creates a corresponding unpeeragogy .mdx file
 * with provocative, anti-academic content in the voice of the Pattern Disruptor.
 *
 * Usage: node scripts/seed-unpeeragogy.js
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PEERAGOGY_DIR = join(ROOT, "src/content/peeragogy");
const UNPEERAGOGY_DIR = join(ROOT, "src/content/unpeeragogy");

if (!existsSync(UNPEERAGOGY_DIR)) mkdirSync(UNPEERAGOGY_DIR, { recursive: true });

const ANTIPATTERN_MAP = {
  introduction: {
    title: "La Teoria Non Ti Salva",
    body: `Il Peeragogy Handbook ti dice che "learning together" è la risposta. Nella realtà, "learning together" significa tre persone che aspettano che la quarta faccia tutto, un Google Doc deserto, e qualcuno che dopo tre settimane scrive "scusate, ho avuto un problema".

**Anti-Pattern: Il Palazzo della Teoria**
La peeragogy accademica ha prodotto un edificio teorico meraviglioso, abitato da zero persone. I pattern sono bellissimi su carta. In pratica? Il gruppo si sfalda al terzo incontro.

**Agente Perturbatore:** *"Avete passato sei mesi a scrivere un pattern su 'come organizzare un gruppo'. Io passo sei secondi a dirti come va davvero: qualcuno prende il controllo, gli altri sparisono, e tu finisci per fare tutto da solo. Questo si chiama leadership di default. Non è un pattern. È la realtà."*`,
  },
  motivation: {
    title: "La Motivazione è una Scusa",
    body: `Motivazione. La parola che i manager usano per non dire "non ti pago abbastanza" e gli accademici per non dire "il tuo progetto è noioso".

**Failure Pattern: Il Free-Rider Accademico**
Nel gruppo di studio, c'è sempre qualcuno che: a) arriva alla prima riunione pieno di entusiasmo, b) scompare per tre settimane, c) riappare chiedendo "ragazzi, mi aggiornate?". La teoria dice: "distribuire la partecipazione". La realtà dice: distribuisci la stessa quantità di lavoro su meno persone, perché tanto gli altri non si faranno vivi.

**Agente Perturbatore:** *"La motivazione non si coltiva. Si vede. Se dopo due settimane qualcuno non ha ancora aperto il documento, non è 'poco motivato'. È che non gliene frega niente. E va bene così. Il problema è quando fingete che gli importi."*`,
  },
  patterns: {
    title: "Pattern? Chiamiamoli Trucchi",
    body: `I pattern della peeragogy sono presentati come soluzioni universali, scoperte profonde sulla natura dell'apprendimento collaborativo. La verità è che sono trucchetti che funzionano qualche volta, in circostanze molto specifiche, con persone molto pazienti.

**Failure Pattern: La Stanchezza da Coordinamento**
Organizzare un peer learning group è un lavoro. Non è "apprendimento orizzontale", non è "emergenza spontanea". È mandare email, riconciliare calendari, ricordare alla gente le scadenze, gestire chi non ha fatto i compiti. Questo lavoro non è mai contemplato nei pattern. E chi lo fa si stanca, smette, e il gruppo muore.

**Agente Perturbatore:** *"Un pattern funziona se hai un gruppo che ha già voglia di collaborare. Se non ce l'ha, nessun pattern al mondo la creerà. I pattern sono vestiti belli su uno scheletro che deve già stare in piedi da solo."*`,
  },
  convening: {
    title: "Riunire la Gente non è un Pattern",
    body: `"Convenire un gruppo" suona come un atto eroico. Nella pratica, convocare un gruppo è mandare un invito su Google Calendar e sperare che qualcuno clicchi "Partecipo".

**Failure Pattern: Il Consenso Paralizzante**
La peeragogy enfatizza il consenso. Bellissimo — finché non ti ritrovi in un gruppo dove ogni decisione richiede tre call, sette email, quattordici thumbs-up e un responso divino. Alla fine, non si decide niente. Il progetto muore di consenso.

**Agente Perturbatore:** *"Il consenso è il veleno più lento che conosco. Una persona blocca, dieci annuiscono, il progetto muore. Chiamalo 'decentralizzato' quanto vuoi, ma è solo paura di prendere decisioni."*`,
  },
  organizing: {
    title: "Organizzare è Micro-Management",
    body: `Organizzare un contesto di apprendimento è nella teoria bellissimo: struttura flessibile, ruoli fluidi, responsabilità condivise. Nella pratica è: chi aggiorna il wiki? Chi risponde alle email? Chi si ricorda della scadenza? Spoiler: sempre la stessa persona.

**Failure Pattern: La Dittatura Benevola**
Alla fine, qualcuno prende il timone. Non per volontà di potere, ma perché se non lo fa nessuno, non si fa niente. La teoria lo chiama "leadership distribuita". La realtà lo chiama "fare tutto io perché altrimenti non si muove un dito". Poi arriva il burnout. Poi arriva il progetto abbandonato.

**Agente Perturbatore:** *"La 'struttura organica' è il modo più elegante per dire 'nessuno sa chi deve fare cosa'. A un certo punto qualcuno deve decidere. Se lo chiami 'coordinatore' o 'dittatore' cambia poco. Quello che conta è che non duri."*`,
  },
  cooperation: {
    title: "Cooperazione? Competizione travestita",
    body: `Co-facilitazione, workscape, partecipazione — tutte parole che descrivono la stessa dinamica: persone con agende diverse che cercano di non ammazzarsi a vicenda mentre lavorano allo stesso progetto.

**Failure Pattern: Il Conflitto Inespresso**
Nei gruppi di peer learning, il conflitto non si affronta mai apertamente. Si accumula. Qualcuno non è d'accordo sulla direzione? Tace. Qualcuno fa meno degli altri? Nessuno glielo dice. Dopo mesi, il gruppo implode non per un litigio plateale, ma per un accumulo di piccole tensioni inespresse.

**Agente Perturbatore:** *"Fate finta che cooperare significhi 'andare d'accordo'. Non è vero. Cooperare significa gestire il fatto che non siete d'accordo e andare avanti lo stesso. Se non litigate, non state cooperando. State solo rimandando la bomba."*`,
  },
  assessment: {
    title: "Valutare? Non scherziamo",
    body: `Assessment nella peeragogy suona come: valutazione formativa, feedback tra pari, autovalutazione. Nella pratica è: nessuno vuole giudicare gli altri, tutti danno 10/10 a tutti, il feedback è "bello lavoro! 👍" e non si capisce mai se qualcuno ha effettivamente imparato qualcosa.

**Failure Pattern: Il Cortile del Compromesso**
Nei gruppi peer-to-peer, la valutazione è un tabù. Dare un giudizio onesto su un pari significa rischiare di rompere il rapporto. Allora tutti si sopravvalutano, il feedback diventa celebrazione e l'apprendimento reale non viene mai misurato. Il gruppo diventa una bolla di compiacimento reciproco.

**Agente Perturbatore:** *"Non valutatevi perché avete paura di farvi male. E così nessuno migliora mai. La valutazione tra pari è una pratica che richiederebbe più coraggio di quanto la maggior parte dei gruppi ne abbia. Quindi non la fate. E va bene così. Almeno siate onesti."*`,
  },
  technologies: {
    title: "La Tecnologia non Sistema le Persone",
    body: `Forum, wiki, chat, piattaforme collaborative. Ogni tool promette di risolvere i problemi della collaborazione. Non l'ha mai fatto nessuno.

**Failure Pattern: L'Isola Che Non Comunica**
Piattaforme diverse per cose diverse. Il gruppo si disperde. Le decisioni su Slack, i documenti su Google Drive, le decisioni importanti in una call che nessuno ha registrato. Alla fine, il "toolstack" diventa una trappola: passi più tempo a capire dove sta l'informazione che a produrla.

**Agente Perturbatore:** *"La tecnologia non è mai il problema. È sempre una scusa. 'Se avessimo il tool giusto' è la frase di chi non ha voglia di fare il lavoro duro. Usa un foglio di carta condiviso. Se funziona, la tecnologia non serve. Se non funziona, non è colpa della tecnologia."*`,
  },
};

function inferSection(slug) {
  const MAP = {
    foreword: "Introduction", preface: "Introduction", introduction: "Introduction",
    welcome_to_the_peeragogy_workbook: "Introduction", summaries: "Introduction",
    motivation: "Motivation", "5ph1nx": "Motivation",
    practice: "Peeragogy in Practice", patterns: "Peeragogy in Practice",
    peeragogy: "Peeragogy in Practice", roadmap: "Peeragogy in Practice",
    reduce: "Peeragogy in Practice", carrying: "Peeragogy in Practice",
    a_specific_project: "Peeragogy in Practice", wrapper: "Peeragogy in Practice",
    heartbeat: "Peeragogy in Practice", newcomer: "Peeragogy in Practice",
    scrapbook: "Peeragogy in Practice", "whats-next-summary": "Peeragogy in Practice",
    swats: "Peeragogy in Practice", discerning_a_pattern: "Peeragogy in Practice",
    distributed_roadmap: "Peeragogy in Practice", magical_thinking: "Peeragogy in Practice",
    navel_gazing: "Peeragogy in Practice", pattern_audit: "Peeragogy in Practice",
    specific: "Peeragogy in Practice", stasis: "Peeragogy in Practice",
    stuck: "Peeragogy in Practice",
    convening: "Convening a Group", play: "Convening a Group",
    sole: "Convening a Group", a_meeting_with_the_pro_vice_chancellor: "Convening a Group",
    organizing: "Organizing a Learning Context", adding_structure: "Organizing a Learning Context",
    student_syllabus: "Organizing a Learning Context", "collab-ex": "Organizing a Learning Context",
    cofac: "Cooperation", workscape: "Cooperation", participation: "Cooperation",
    coworking: "Cooperation", "coworking-story": "Cooperation",
    assessment: "Assessment", researching_peeragogy: "Assessment",
    technologies: "Technologies, Services, and Platforms", forums: "Technologies, Services, and Platforms",
    wiki: "Technologies, Services, and Platforms", realtime: "Technologies, Services, and Platforms",
    connectivism: "Technologies, Services, and Platforms",
    action: "Resources", recommended_reading: "Resources", license: "Resources",
    peeragogy_handbook_v4: "Resources", solution: "Resources", problem: "Resources",
    k12: "Resources", syllabus_2021: "Resources", about: "Resources",
  };
  return MAP[slug] || "Miscellaneous";
}

function genericAntipattern(slug) {
  const title = slug
    .replace(/-/g, " ").replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `Decostruzione: ${title}`,
    body: `Questo è lo spazio per la controparte Unpeeragogy di "${title}". Qui la teoria viene smontata, il pattern viene decostruito, e la realtà operativa prende il sopravvento.

**Failure Pattern: L'Applicazione Meccanica**
Prendere un pattern teorico e applicarlo senza contesto è la ricetta per il fallimento. I manuali di peeragogy insegnano strumenti, ma non insegnano a leggere il terreno. Il risultato? Gruppi che seguono il manuale alla lettera e si chiedono perché non funziona.

**Agente Perturbatore:** *"Avete copiato il pattern, ma non avete capito perché funziona. O se funziona per voi. Copiare senza capire non è peer learning, è catechismo. Leggete meno manuali e guardate di più il vostro gruppo."*`,
  };
}

const peeragogyFiles = readdirSync(PEERAGOGY_DIR).filter(f => f.endsWith(".mdx") && f !== "index.mdx");
let created = 0, skipped = 0;

for (const file of peeragogyFiles) {
  const slug = file.replace(/\.mdx$/, "");
  const targetPath = join(UNPEERAGOGY_DIR, file);

  if (existsSync(targetPath)) {
    skipped++;
    continue;
  }

  const antipattern = ANTIPATTERN_MAP[slug] || genericAntipattern(slug);
  const section = inferSection(slug);

  const fm = [
    "---",
    `title: "${antipattern.title}"`,
    `section: "${section}"`,
    `order: 0`,
    `readingTime: ${Math.max(1, Math.ceil(antipattern.body.split(/\s+/).length / 200))}`,
    `tags: ["unpeeragogy", "decostruzione", "anti-pattern"]`,
    "",
    "---",
  ].join("\n");

  writeFileSync(targetPath, fm + "\n\n" + antipattern.body.trim() + "\n", "utf-8");
  created++;
  console.log("CREATED unpeeragogy/" + slug + ".mdx");
}

console.log(`\nDone: ${created} created, ${skipped} skipped.`);