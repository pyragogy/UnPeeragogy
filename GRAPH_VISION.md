# Vault Graph & Tree — Visione di sviluppo

> *Un grafo che evolve. Un albero che si pota. Una knowledge base
>  che respira con le discussioni degli utenti e l'attrito del MCP.*

## 1. Architettura logica del grafo

### 1.1 Modello dati

Il vault si fonda su una coppia esatta di collezioni Astro `peeragogy` e `unpeeragogy`, allineate per **slug**:

```
src/content/
  peeragogy/{slug}.mdx     ← teoria (colonna azzurra)
  unpeeragogy/{slug}.mdx   ← realtà (colonna rossa)
```

Ogni entry produce **un nodo** nel grafo. Gli attributi del nodo sono:

| Campo | Tipo | Fonte | Ruolo |
|-------|------|-------|-------|
| `id` | string | slug (es. `antipatterns`) | Identificatore unico, usato per navigazione `/{id}/` |
| `name` | string | frontmatter `title` | Label visualizzata |
| `group` | `"peeragogy"` / `"unpeeragogy"` / `"unpeeragogy-only"` | presenza in collezioni | Colore: azzurro (`#3b82f6`) se solo teoria, rosso (`#ef4444`) se esiste colonna realtà |
| `val` | 1 o 2 | presenza di unpeeragogy | Raggio del nodo: 6px (solo teoria) o 8px (con realtà) |
| `tension` | number \| null | `tension_index` in frontmatter | Mostrato in tooltip + badge nell'albero |
| `section` | string | frontmatter `section` | Raggruppamento nell'albero |
| `readingTime` | number | frontmatter `readingTime` | Minuti di lettura (badge albero) |

### 1.2 Collegamenti (links)

Il vault genera **due tipi di link**:

1. **Catena di sezione** — ogni nodo `peeragogy` è linkato al successivo nella stessa sezione, ordinato per `order`. Questo crea una struttura lineare per sezione, visibile come "catena" nel grafo.

2. **Link implicito teoria↔realtà** — ogni entry che ha sia peeragogy che unpeeragogy condivide lo stesso slug. Nel grafo i due nodi **non sono separati**: esiste un solo nodo per slug, con `group="unpeeragogy"` se la coppia esiste. Il link di tensione è implicito: il nodo è rosso e il badge `T:n.n` mostra l'indice.

Non esiste **link incrociato esplicito** tra nodi di diverse sezioni. Il layout force‑directed farà emergere naturalmente la prossimità di nodi semanticamente vicini grazie alla forza `charge` e `link distance`.

### 1.3 Topologia attuale

```
87 nodi · ~86 connessioni (una per coppia nella catena di sezione)
- Sezioni: ~8-12, variabili (dipende da frontmatter section)
- Nodi rossi: ~84 (con realtà unpeeragogy) + ~1-3 unpeeragogy-only
- Nodi azzurri: solo peeragogy senza controparte unpeeragogy (pochi)
```

## 2. Rendering del grafo

### 2.1 Motore

Canvas2D + `d3-force` — nessun acceleratore grafico. Bundle JS: ~22KB.

| Parametro | Valore | Giustificazione |
|-----------|--------|-----------------|
| `charge` | -60 | Repulsione debole (ispirato Quartz: `repelForce 0.5 × -100`) |
| `link.distance` | 50 | Legami corti per cluster visibili |
| `link.strength` | 0.2 | Flessibilità: il grafo può allontanarsi dalla linea retta |
| `center.strength` | 0.3 | Attrazione verso il centro (evita fughe) |
| `collide.radius` | 12 | Separazione minima (evita sovrapposizioni) |
| `alphaDecay` | 0.03 | Assestamento lento — il grafo "balla" qualche secondo |
| `velocityDecay` | 0.4 | Smorzamento naturale |

Il posizionamento iniziale è **random** (stile Quartz), non a cerchio o a sfera. Questo evita collassi centralizzati perché ogni nodo parte già a distanza variabile dal centro.

### 2.2 Interazioni

| Input | Azione | Dettaglio |
|-------|--------|-----------|
| Hover | Tooltip + highlight | Mostra nome nodo e `T:n.n` se presente |
| Click nodo | Naviga | `window.location.href = "/{id}/"` |
| Drag nodo | Sposta | Fissa posizione, nave trascinabile; rilascio naviga se click breve |
| Scroll | Zoom | Scale factor 0.2–6 |
| Pan (drag sfondo) | Move viewport | Trasla coordinate |
| Doppio click | ZoomToFit | Re‑centra su tutti i nodi |
| Pulsanti: ＋ − ⟲ Aa | Zoom in/out/reset/label toggle | Controller 40px |

### 2.3 Tema

| Elemento | Chiaro | Scuro |
|----------|--------|-------|
| Sfondo canvas | `--color-bg` (#ffffff) | `--color-bg` (#0c0c0e) |
| Link | `rgba(100,110,130,0.2)` | `rgba(200,210,230,0.35)` |
| Label | `rgba(80,85,95,0.6)` | `rgba(210,220,240,0.65)` |
| Legenda | Peeragogy: `#3b82f6`, Unpeeragogy: `#ef4444` | invariato |
| Tooltip | `--surface-raised` | `--surface-raised` |

## 3. Albero (Tree View)

### 3.1 Struttura

La vista alternativa è un **albero sezione-based**:

```
Sezione 1 (N nodi teoria · M nodi realtà)        ← header collassabile
├── entry 1 ● [T n.n] [Xm] →
├── entry 2 ● [T n.n] [Xm] →
└── entry 3 ● [T n.n] [Xm] →

Sezione 2 ...
```

Ogni sezione è collassabile. Nodi con `hasUnpeeragogy=true` hanno pallino rosso, gli altri azzurro. Il badge `T n.n` segue la scala colore:
- `T < 0.6`: azzurro
- `T 0.6–0.99`: arancione
- `T ≥ 1.0`: rosso

### 3.2 Filtri

- **Ricerca testuale**: filtra live su titolo e contenuto delle entry (case‑insensitive)
- **Tag filter**: ogni tag genera un bottone; cliccando si mostrano solo le entry con quel tag

### 3.3 Relazione grafo ↔ albero

```
┌─────────────────────┐     ┌─────────────────────┐
│       GRAFO         │     │       ALBERO        │
│  Force-directed     │     │  Sezione-based       │
│  Esplorativo        │     │  Navigazione lineare │
│  "Dove sono i       │     │  "Quali sono i       │
│   cluster rossi?"   │     │   capitoli?"         │
│  Legame = link      │     │  Legame = sezione    │
│  Zoom/pan/drag      │     │  Collassa/espandi    │
└─────────────────────┘     └─────────────────────┘
         ↕ toggle utente ↕
```

L'utente passa da grafo ad albero con un toggle (`view-graph-btn` / `view-tree-btn`). Il dato è lo stesso — cambia la presentazione.

## 4. Evoluzione del grafo (fasi)

L'obiettivo ambizioso: il grafo deve poter **evolvere dinamicamente** in risposta a:

1. **Nuovo contenuto** (nuove entry peeragogy/unpeeragogy scritte dall'AI o dall'editore)
2. **Interazione MCP** (tool `inject-friction`, `analyze`, `tension-index`)
3. **Discussioni utente** (Giscus / commenti sulle pagine → nuovi unpeeragogy)

### Fase A — Popolamento statico (in corso)

- Scrivere contenuti unpeeragogy per ogni slug esistente dove manca
- Ogni nuovo file unpeeragogy entra nel grafo automaticamente al rebuild della site
- Aggiornamento `tension_index` via script (pre‑calcolo statico)

**Trigger**: `git push → Coolify rebuild → nuovo grafo deployato`

### Fase B — Reattività MCP (prossima)

Il server MCP **strumentalizza** il grafo: un client AI può chiamare tool e ricevere dati che il grafo visualizzerà.

| Tool MCP | Effetto sul grafo |
|----------|------------------|
| `search(query)` | Ritorna slug + score — usabile per evidenziare nodi nel grafo |
| `compare(slug)` | Ritorna dual‑column — usabile per generare edge pesato tra teoria e realtà |
| `analyze(slug)` | Estrae vettori di fallimento — nuovi tag/nuovi gruppi nel grafo |
| `inject-friction(topic, mode)` | Produce sintesi — potrebbe generare **nuovo nodo unpeeragogy-only** se l'attrito è inedito |
| `tension-index(slug)` | Aggiorna `tension_index` — modifica raggio/colore nodo live |

Il salto evolutivo: **un tool MCP che genera attrito sufficientemente alto potrebbe creare un nuovo nodo nel grafo senza rebuild del sito**. Questo richiede:

1. Un endpoint `/api/graph/upsert-node` sul server web (Astro API route o middleware)
2. O in alternativa: MCP Server scrive su un file JSON che il client legge via fetch lato browser

**Decisione aperta**: la Fase B va implementata **dopo** che il contenuto statico è solido. Senza un corpus robusto, l'evoluzione dinamica produce solo rumore.

### Fase C — Community feedback loop (visionaria)

```
Discussione Giscus su una pagina
       ↓
Un utente segnala: "questo non funziona nella pratica"
       ↓
L'Agente Perturbatore (via MCP) analizza il commento
       ↓
Se il commento rivela un nuovo vettore di fallimento:
  → Viene creata una bozza di entry unpeeragogy
  → La bozza finisce in una Draft PR su GitHub
  → L'editore umano la valida e merge
       ↓
Al prossimo rebuild: il grafo ha un nuovo nodo rosso
```

Questo flusso è già parzialmente implementato dall'architettura MCP + GitHub Actions. Manca:

- Un **classificatore di attrito** (AI + MCP `analyze`) che decida se un commento Giscus merita una nuova entry
- Una **coda di proposizioni** (Draft PR automatica con template precompilato)
- Un **temporizzatore** (settimanale, non in tempo reale — il grafo non deve oscillare a ogni commento)

## 5. Metriche di salute del grafo

Il grafo stesso deve essere misurabile. Propongo queste metriche, calcolabili via MCP:

| Metrica | Calcolo | Soglia ideale |
|---------|---------|---------------|
| **Copertura realtà** | `|unpeeragogy| / |peeragogy|` | ≥ 0.8 (80% di slug con colonna realtà) |
| **Tensione media** | `avg(tension_index)` su tutti i nodi rossi | ≥ 0.5 (se è troppo bassa, l'attrito è finto) |
| **Densità edge** | `|links| / |nodes|` | 0.8–1.2 (grafo né troppo sparso né troppo denso) |
| **Nodi unpeeragogy-only** | `group="unpeeragogy-only"` count | ≥ 5% del totale (attrito inedito) |
| **Cluster rosso** | % nodi rossi nel raggio di 3 link da un nodo rosso | ≥ 40% (i nodi rossi devono aggregarsi) |

## 6. Piano d'azione

### Subito — Popolamento contenuti

1. Per ogni slug peeragogy senza unpeeragogy corrispondente → scrivere file `.mdx` in
   `src/content/unpeeragogy/` con:
   - Stesso `slug`
   - `title` corrispondente
   - `tension_index` calcolato (script o manuale)
   - Corpo che evidenzia il fallimento/pratica reale

2. Per ogni slug che ha solo unpeeragogy → scrivere o identificare la teoria
   peeragogy corrispondente, o lasciarlo come `unpeeragogy-only` (nodo rosso senza
   azzurro — attrito puro).

3. Ricalcolare `tension_index` globale con `scripts/calculate-tension-index.js`.

### Presto — Raffinamento grafo

1. Aggiungere **pesatura edge** in base a quanti tag condividono due nodi
   (link più spesso = più tag in comune)
2. Aggiungere **filtro sezione** nel grafo (mostra/nascondi sezioni)
3. Aggiungere **layout radial** per sezioni (opzione Quartz `enableRadial: true`)
4. Aggiungere **highlight nodi visitati** (localStorage, stile Quartz)

### Dopo — MCP bridge

1. API route `/api/graph` che serve dati grafo aggiornati
2. MCP tool `graph-status` che restituisce le metriche di salute
3. MCP tool `graph-suggest-link` che propone nuovi edge basati su similarità semantica
4. Webhook Giscus → MCP `inject-friction` → Draft PR

## 7. Regole del gioco

1. **Niente WebGL**. Mai. Canvas2D forever.
2. **Niente hub fittizi**. I nodi rappresentano solo entry reali.
3. **Il rosso è segnale, non decorazione**. Ogni nodo rosso deve avere una ragione
   (un failure vector documentato o un tension index > 0).
4. **Unpeeragogy nucleo, non periferia**. I nodi rossi non sono "errori" da ignorare,
   sono il contributo originale. Devono essere ben visibili.
5. **Popolamento prima di automazione**. La Fase A (contenuto statico) viene prima
   della Fase B (MCP bridge) e della Fase C (community feedback). Senza contenuto,
   il grafo è solo esercizio di stile.
6. **Ogni entry unpeeragogy è un atto di coraggio**. Documentare fallimenti è più
   difficile che documentare successi. Il grafo lo riflette: i nodi rossi sono
   più grandi non per vanità, ma perché pesano di più.