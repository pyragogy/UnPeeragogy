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
| `search` | query: string | risultati con snippet | Motore: minisearch (in-memory, Node.js nativo) |
| `compare` | slug: string | dual-column markdown | Teoria | Realtà side-by-side |
| `analyze` | slug: string | vettori di fallimento estratti | Lista strutturata di anti-pattern |
| `inject-friction` | topic: string, [mode: 'soft'|'hard'] | risposta con attrito strutturale | Default: 'soft'. 'hard' = massima decostruzione |
| `tension-index` | [slug: string] | indice di tensione (0-2.0) | Calcola su singolo o intero corpus |

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
│   ├── index.ts           # entrypoint, trasporto SSE
│   ├── resources/
│   │   ├── list.ts        # registra tutti gli URI
│   │   └── read.ts        # lettura MDX come risorsa
│   ├── tools/
│   │   ├── search.ts      # minisearch indicizzato
│   │   ├── compare.ts     # dual column
│   │   ├── analyze.ts     # vettori di fallimento
│   │   ├── inject-friction.ts
│   │   └── tension-index.ts
│   ├── prompts/
│   │   └── agent-perturbatore.ts
│   └── lib/
│       ├── loader.ts      # carica tutti i file MDX
│       └── friction.ts    # middleware di attrito
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

**Trasporto:** SSE (Server-Sent Events) su porta 3001
**Deploy:** Coolify come servizio interno, subpath `mcp.unpeeragogy.pyragogy.org`
**Autenticazione:** Bearer token da `MCP_AUTH_TOKEN` env

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

### 9. Roadmap

| Fase | Cosa | Tempo |
|------|------|-------|
| 1 | Scaffold `packages/mcp-server/` + loader MDX | 15 min |
| 2 | Risorse + search (minisearch) + compare | 20 min |
| 3 | inject-friction + tension-index | 15 min |
| 4 | Dockerfile + deploy su Coolify | 10 min |
| 5 | Obsidian vault `.obsidian/` + template | 15 min |
| 6 | Script tension_index pre-calcolo + grafo | 15 min |
| 7 | GitHub Action Rituale Settimanale | 20 min |

**Totale stimato: ~1h 50min**
