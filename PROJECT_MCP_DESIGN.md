# MCP Server + Obsidian Vault — Design Document
## Unpeeragogy / Pyragogy

### 1. Visione

> L'MCP Server non è un chatbot attaccato sopra. È un nodo nel grafo
> della conoscenza cooperativa che risponde con attrito, non con consenso.

Il server MCP rende il corpus di Unpeeragogy interrogabile da qualsiasi
client AI. Ogni risposta è filtrata dall'Agente Perturbatore:
nessuna informazione senza contraddizione.

### 2. Namespace e URI

**Namespace primario (vettori di fallimento):**
```
unpeeragogy://failure/{vector-name}
```

**Namespace secondario (capitoli classici, fallback compatibilità):**
```
unpeeragogy://{slug}/
unpeeragogy://{slug}/peeragogy
unpeeragogy://{slug}/unpeeragogy
```

**Lista risorse:**
- `listResources()` → tutti gli URI disponibili
- Lettura diretta di qualsiasi URI

### 3. Tool MCP

| Tool | Input | Output | Note |
|------|-------|--------|------|
| `search` | query: string, maxResults?: number | risultati con snippet | Motore: minisearch (in-memory, Node.js nativo). Boost su titolo (3x), descrizione e tag (2x). |
| `compare` | slug: string | dual-column markdown | Teoria \| Realtà side-by-side. Legge file gemelli peeragogy/{slug}.mdx + unpeeragogy/{slug}.mdx. |
| `analyze` | slug: string | vettori di fallimento estratti | Lista strutturata di anti-pattern, tag, word count, estensione realtà vs teoria. |
| `inject-friction` | topic: string, mode?: 'soft'|'hard' | risposta con attrito strutturale | Default: 'soft'. 'hard' = massima decostruzione. Senza Hetzner fa fallback statico. |
| `agent-perturbatore` | topic: string, mode?: string | analisi critica | **Perturbator**: voce critica nativa del progetto. Mai una risposta senza contraddizione. |
| `tension-index` | slug?: string | indice di tensione (0-2.0) | Calcola su singola coppia o intero corpus. Media corpus: ~1.357. |
| **`map-failure-graph`** 🆕 | query?: string, vector?: string, minWeight?: number | grafo JSON + markdown analitico | **Knowledge graph** pesato per tensione: nodi (slug), archi (vettori condivisi). Output navigabile in markdown + JSON pronto per visualizzazione d3-force. |
| **`suggest-field-report`** 🆕 | text: string | bozza YAML precompilata + vettori rilevati | Da testo libero descrittivo: rileva vettori di fallimento per keyword matching (15 pattern, ~5 sinonimi italiani ciascuno), stima tensione, sceglie template (share-your-story vs structural-analysis), produce YAML pronto per GitHub Discussion. |
| **`gap-analysis`** 🆕 | _(nessun input)_ | mappa lacune + priorità | Scansione completa del corpus: slug orfani (realtà senza teoria o viceversa), vettori scoperti, aree a bassa tensione. Produce raccomandazioni prioritarie con urgenza e suggerimenti per nuovi field report. |

### 4. Flag globale di attrito

Ogni risposta del server MCP passa da un middleware che verifica:

- Il risultato contiene elementi di attrito? (es. contraddizioni teoria/realtà)
- Se no, inietta una "Friction Note" generata dall'antipattern più vicino

Configurabile via `MCP_FRICTION_MODE=on|off|soft|hard`

### 5. Prompt template — Agente Perturbatore

Template incluso come risorsa MCP:

```
unpeeragogy://prompt/agent-perturbatore

Sei l'Agente Perturbatore del Pattern, voce critica di Unpeeragogy.

Quando analizzi un argomento:
1. Esponi la teoria (colonna Peeragogy)
2. Esponi la realtà (colonna Unpeeragogy)
3. Calcola lo scarto
4. Concludi con una Friction Note
```

### 6. Architettura del server

```
packages/mcp-server/
├── src/
│   ├── index.ts             # entrypoint, trasporto SSE + registration
│   ├── resources/
│   │   └── index.ts         # 90+ URI risorse (failure vectors, slug, prompt)
│   ├── tools/
│   │   └── index.ts         # 9 tool MCP (search, compare, analyze, agent-perturbatore,
│   │                         #    inject-friction, tension-index,
│   │                         #    map-failure-graph, suggest-field-report, gap-analysis)
│   ├── prompts/
│   │   └── index.ts         # Template system prompt Perturbator
│   └── lib/
│       ├── loader.ts        # carica tutti i file MDX da content collections
│       ├── friction.ts      # middleware di attrito strutturale
│       └── perturbatore.ts  # Agente Perturbatore (static fallback)
├── Dockerfile               # build multi-stage
├── package.json             # type: module
├── tsconfig.json
├── .env.example
└── test-all.mjs             # test completo (opzionale, non in produzione)
```

**Trasporto:** SSE (Server-Sent Events) su porta 3001
  - `GET /sse` → connessione evento
  - `POST /messages?sessionId=<id>` → richieste JSON-RPC
  - `GET /health` → health check (senza auth)

**Deploy:** Coolify come servizio interno, subpath `mcp.unpeeragogy.pyragogy.org`
**Autenticazione:** `Authorization: Bearer` da `MCP_AUTH_TOKEN` env. Query params non supportati.
**Friction mode:** globale via `MCP_FRICTION_MODE` env (`off` / `soft` / `hard`)

### 7. Obsidian Vault

File `.obsidian/` versionati nel repo:

- `appearance.json` — tema scuro abbinato al Deep Navy
- `graph.json` — configurazione grafo con gruppi di colore
- `templates/antipattern.md` — template YAML con tension_index
- `snippets/unpeeragogy.css` — stili personalizzati

**Metadati YAML estesi:**
```yaml
---
title: "Cooperation"
section: "Cooperation"
order: 69
tension_index: 0.78     # pre-calcolato a build
vectors:
  - free-rider
  - consensus-paralysis
tags: ["cooperation", "free-rider"]
---
```

### 8. Pipeline di crescita settimanale

```yaml
# .github/workflows/knowledge-growth.yml
name: "Rituale Evolutivo Settimanale"
on:
  schedule:
    - cron: "0 8 * * 1"  # ogni lunedì 8:00 UTC
  workflow_dispatch:

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Fetch Giscus discussions
        run: gh api graphql -f query="..."
      - name: AI synthesis → new anti-pattern
        run: |
          # Prompt: "Sei l'Agente Perturbatore. Analizza queste
          # discussioni e genera un nuovo anti-pattern formale."
      - name: Create Draft PR
        run: gh pr create --draft --title "📝 Nuovo anti-pattern da Giscus"
```

**Regola:** Mai direct-to-main. Ogni PR in draft richiede revisione umana.

### 9. Roadmap — Stato attuale

| Fase | Cosa | Stato | Tempo |
|------|------|-------|-------|
| 1 | Scaffold `packages/mcp-server/` + loader MDX | ✅ Fatto | 15 min |
| 2 | Risorse + search (minisearch) + compare | ✅ Fatto | 20 min |
| 3 | inject-friction + tension-index | ✅ Fatto | 15 min |
| 4 | Dockerfile + deploy su Coolify | ✅ Fatto | 10 min |
| 5 | agent-perturbatore + prompts | ✅ Fatto | 15 min |
| 6 | **Super-tools: map-failure-graph, suggest-field-report, gap-analysis** | ✅ **Fatto (v1)** | 60 min |
| 7 | Knowledge graph visuale (d3-force dal server) | ⏳ Piano | — |
| 8 | CI/CD: deploy automatico su push main | ✅ Fatto | 10 min |

**Super-tool v2 (idea):**
- `map-failure-graph`: output SVG/d3 direttamente dal server
- `suggest-field-report`: rilevamento più fine (embeddings vs keyword)
- `gap-analysis`: trigger automatico a ogni nuovo field report
