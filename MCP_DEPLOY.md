# MCP Server — Deploy e gestione

> Guida per amministrare il server MCP su Coolify. Include deploy, configurazione,
> manutenzione e troubleshooting per sviluppatori.

Il server MCP espone l'intero corpus di Unpeeragogy (teoria + realtà + vettori di fallimento)
come risorse e strumenti interrogabili da qualsiasi client AI via protocollo MCP.

---

## Repository

- **Sorgente**: `packages/mcp-server/` nel repo `pyragogy/unpeeragogy`
- **Deploy automatico**: GitHub Action `.github/workflows/deploy-mcp.yml` su push in `main`
  che modifica `packages/mcp-server/**` o `src/content/**`
- **Trigger manuale**: dal Coolify Console → Projects → Unpeeragogy → App `unpeeragogy-mcp` → Deploy

---

## Stack

| Componente | Versione |
|------------|----------|
| Runtime | Node.js 22 (Alpine) |
| SDK MCP | `@modelcontextprotocol/sdk` 1.x |
| Build | TypeScript (`tsc`) |
| Container | Docker multi-stage (build + runtime) |
| Hosting | Coolify (Pyragogy self-hosted) |
| Dominio | `mcp.unpeeragogy.pyragogy.org` |
| Porta interna | `3001` |

---

## Configurazione Coolify

### Creazione dell'app

Coolify Console → Projects → Unpeeragogy → **+ New Application**

| Campo | Valore |
|-------|--------|
| **Name** | `unpeeragogy-mcp` |
| **Repository** | `pyragogy/unpeeragogy` |
| **Branch** | `main` |
| **Build Pack** | `Dockerfile` |
| **Base Directory** | `/` |
| **Dockerfile Location** | `/packages/mcp-server/Dockerfile` |
| **Port(s)** | `3001` |
| **Domain** | `mcp.unpeeragogy.pyragogy.org` |

### Variabili d'ambiente

| Variabile | Valore | Obbligatoria | Descrizione |
|-----------|--------|-------------|-------------|
| `MCP_AUTH_TOKEN` | (stringa casuale) | ✅ **Sì** | Token condiviso per autenticare i client. Senza, tutte le richieste sono negate con 401. |
| `MCP_FRICTION_MODE` | `soft` | No | `off` / `soft` / `hard`. Controlla l'iniezione automatica di attrito nelle risposte. |
| `PORT` | `3001` | No | Porta su cui il server ascolta. Coolify la mappa alla porta del container. |
| `NODE_ENV` | `production` | No | Settata automaticamente nel Dockerfile. |
| `CONTENT_ROOT` | `/app/content` | No | Percorso dei file MDX nel container. Montato come volume read-only. |

> **Nota**: `HETZNER_API_KEY` era presente nelle versioni precedenti per l'Agente Perturbatore live.
> È stata rimossa perché il tool `agent-perturbatore` ora fa **fallback automatico** all'analisi statica
> basata sul corpus. Per riattivare: aggiungi la variabile con un token da https://experiments.hetzner.com.

### UUID e GitHub Secret

Dopo la creazione, copia l'UUID dell'app dalla pagina dell'app (es. `abc123...`).
Aggiungilo come secret nel repository GitHub:

- Settings → Secrets and variables → Actions → **New repository secret**
- **Name**: `COOLIFY_MCP_UUID`
- **Value**: l'UUID copiato

### Security Headers (Coolify Proxy)

Se il server è dietro un reverse proxy (default Coolify), configura questi header
nella scheda **Proxy** dell'app:

| Header | Valore | Motivo |
|--------|--------|--------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS forzato per 2 anni |
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Non propaga URL paths |

---

## Build e deploy

### Struttura del pacchetto

```
packages/mcp-server/
├── Dockerfile              # Build multi-stage
├── package.json            # type: module
├── tsconfig.json
├── .env.example            # Template per variabili locali
├── src/
│   ├── index.ts            # Entrypoint: SSE + HTTP server + tool/prompt/resource registration
│   ├── resources/index.ts  # 90+ URI risorse (failure vectors, slug, prompt)
│   ├── tools/index.ts      # 9 strumenti MCP (vedi sotto)
│   ├── prompts/index.ts    # Template per system prompt
│   └── lib/
│       ├── loader.ts       # Caricamento MDX da content collections
│       ├── friction.ts     # Middleware di attrito strutturale
│       └── perturbatore.ts # Agente Perturbatore (static fallback)
```

### Build locale (per sviluppo)

```bash
cd /home/coder/project/unpeeragogy/packages/mcp-server
npm install
npm run build   # npx tsc
```

Il comando `tsc` compila `src/` in `dist/`. Zero errori è prerequisito per il deploy.

### Build Docker

Il `Dockerfile` ha due stage:
1. **build**: installa dipendenze, compila TypeScript
2. **runtime**: copia solo `dist/`, `node_modules/`, e `src/content/` (file MDX)

Il contenuto MDX viene copiato dal repo (non montato da volume esterno) così
il deploy è atomico: niente dipendenza da volumi persistenti.

### Pipeline CI/CD

Su push a `main` che modifica `packages/mcp-server/**` o `src/content/**`:

1. GitHub Action `deploy-mcp.yml` triggera
2. Chiamata POST a Coolify API con UUID e API token
3. Coolify fa pull del nuovo codice, builda la Docker image, riavvia il container
4. Il server è pronto in 30-60 secondi

---

## Server: endpoint e comportamento

### Health check

```bash
curl https://mcp.unpeeragogy.pyragogy.org/health
```

Risposta attesa (HTTP 200):
```json
{"status":"ok","server":"unpeeragogy-mcp","version":"0.1.0","frictionMode":"soft"}
```

### SSE (Server-Sent Events) — endpoint principale

```
https://mcp.unpeeragogy.pyragogy.org/sse
```

Tutte le comunicazioni MCP passano da un unico endpoint SSE.
Il client stabilisce una connessione SSE e invia richieste su `POST /messages?sessionId=<id>`.

### Autenticazione

Il server accetta solo **`Authorization: Bearer`** negli header HTTP.
Query params (es. `?token=...`) **non** sono supportati per ragioni di sicurezza.

```
Authorization: Bearer <MCP_AUTH_TOKEN>
```

Senza token valido: HTTP 401 `{"error":"Unauthorized."}`

---

## I 9 strumenti MCP

| Nome | Input | Output | Descrizione |
|------|-------|--------|-------------|
| `search` | `query`, `maxResults?` | Risultati rankati con slug, titolo, sezione, score | Ricerca full-text fuzzy su tutto il corpus (MiniSearch). Titolo 3x, descrizioni/tag 2x. |
| `compare` | `slug` | Colonne Teoria + Realtà side-by-side | Legge i file MDX gemelli (peeragogy/{slug}.mdx + unpeeragogy/{slug}.mdx) e li presenta come dual-column. |
| `analyze` | `slug` | Vettori di fallimento, tag, tensione, struttura | Estrazione strutturale: scarto teoria/realtà, vettori non condivisi, word count. |
| `agent-perturbatore` | `topic`, `mode?` | Analisi critica statica o live | **Perturbator**: voce critica nativa. Fallback statico se HETZNER_API_KEY non configurato. |
| `inject-friction` | `topic`, `mode?` (`soft`/`hard`) | Attrito strutturale forzato | Inietta contraddizione sistematica in qualsiasi argomento. `soft` evidenzia, `hard` decostruisce. |
| `tension-index` | `slug?` | Indice numerico 0–2.0 + scaletta interpretativa | Tensione sistemica: media corpus o singola coppia. Scala: 0=allineamento, 2.0=incompatibilità massima. |
| **`map-failure-graph`** 🆕 | `query?`, `vector?`, `minWeight?` | Grafo JSON + markdown analitico | **Knowledge graph pesato per tensione**: nodi (slug), archi (vettori condivisi). Filtrabile per query full-text, vettore specifico, tensione minima. Output pronto per d3-force. |
| **`suggest-field-report`** 🆕 | `text` | Bozza YAML precompilata + vettori rilevati | Da testo libero descrittivo: rileva vettori di fallimento per keyword matching, sceglie template, produce YAML pronto da copiare in GitHub Discussion. |
| **`gap-analysis`** 🆕 | _(nessun input)_ | Mappa lacune epistemiche + priorità | Scansione completa del corpus: slug orfani (realtà senza teoria o viceversa), vettori scoperti, aree a bassa tensione. Raccomandazioni prioritarie per nuovi field report. |

### Workflow tipici

**Esplorazione**: `search` → `compare` → `analyze` → `tension-index`

**Contribuzione**: `suggest-field-report` → (copia YAML in GitHub Discussion) → `gap-analysis` (dopo che il report è approvato)

**Audit sistemico**: `gap-analysis` → `map-failure-graph` → `tension-index` (senza slug)

**Scrittura critica**: `agent-perturbatore` → `inject-friction`

---

## Client setup (per l'utente finale)

> Questa sezione è rivolta all'utente che vuole connettere Claude Desktop, pi o altro client.
> Se sei tu l'admin, fornisci queste istruzioni a chi richiede il token.

### Prerequisito: richiedere il token

Il server è autenticato. Scrivi a **info@pyragogy.org** specificando:
- Quale client vuoi usare (Claude Desktop, pi, Cline, VS Code, altro)
- A cosa ti serve (ricerca, contribuzione, audit)

Riceverai un token da usare come `MCP_AUTH_TOKEN`.

> **Non committare il token su GitHub. Non condividerlo in chat pubbliche.**
> È un segreto condiviso tra te e il server.

### Connessione automatica

```bash
npx @pyragogy/mcp-server --setup --token <MCP_AUTH_TOKEN>
```

Lo script configura automaticamente Claude Desktop (`claude_desktop_config.json`)
e pi (`~/.pi/config.yaml`). Poi riavvia Claude Desktop.

### Connessione manuale

Edita `~/.config/Claude/claude_desktop_config.json` (Claude Desktop)
o il file di configurazione del tuo client MCP:

```json
{
  "mcpServers": {
    "unpeeragogy": {
      "url": "https://mcp.unpeeragogy.pyragogy.org/sse",
      "headers": {
        "Authorization": "Bearer <MCP_AUTH_TOKEN>"
      }
    }
  }
}
```

### Verifica

```bash
curl -s https://mcp.unpeeragogy.pyragogy.org/health \
  -H "Authorization: Bearer <MCP_AUTH_TOKEN>"
```

Se risponde `{"status":"ok"...}` → funziona.

Poi chiedi al client AI: *"List all available tools"*
Dovresti vedere 9 tool.

---

## Sviluppo locale

Per lavorare sul server senza deployare:

```bash
cd /home/coder/project/unpeeragogy/packages/mcp-server

# Avvio in dev mode (hot-reload)
npm run dev   # tsx watch src/index.ts

# Build + start
npm run build && node dist/index.js
```

Il server locale usa il contenuto dalla root del repo (`../../src/content/`).
Se vuoi testare con dati reali, assicurati che la struttura sia presente.

### Variabili d'ambiente locali

Crea un file `.env` (gitignorato) o passale direttamente:

```bash
PORT=3099 \
MCP_AUTH_TOKEN="test-token-up_" \
MCP_FRICTION_MODE=soft \
node dist/index.js
```

Il server parte sulla porta specificata (default: 3001, in dev: 3099).

### Test client MCP

```bash
node -e "
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const transport = new SSEClientTransport(
  new URL('http://localhost:3099/sse'),
  { eventSourceInit: { headers: { Authorization: 'Bearer test-token-up_' } },
    requestInit: { headers: { Authorization: 'Bearer test-token-up_' } } }
);
const client = new Client({ name: 'test', version: '0.1.0' });
await client.connect(transport);
const tools = await client.listTools();
console.log('Tools:', tools.tools.map(t => t.name).join(', '));
await client.close();
"
```

---

## Troubleshooting

### Il server non risponde

- Verifica che il container Coolify sia running
- Controlla i log in Coolify (scheda **Deployments** → ultimo deploy → **Logs**)
- Prova `curl https://mcp.unpeeragogy.pyragogy.org/health` senza header — deve tornare 200

### Claude Desktop vede `"tools": []`

Causa più probabile: **configurazione errata del token o dell'URL**.

1. Verifica che `MCP_AUTH_TOKEN` corrisponda al token nel client config
2. Verifica che usi `Authorization: Bearer` negli **header**, non query params
3. Riavvia Claude Desktop dopo aver modificato la configurazione
4. Se usi URL remoto, verifica che il CDN/proxy non blocchi il contenuto

Se nulla funziona, connetti Claude al server locale (`http://localhost:3099/sse`)
per isolare il problema.

### `"error":"Unauthorized."`

Il token non corrisponde o non è stato passato. Controlla:
- La variabile `MCP_AUTH_TOKEN` in Coolify
- Il file `claude_desktop_config.json` (formato JSON valido?)
- Gli header HTTP (maiuscole: `Authorization`, non `authorization`)

### Build TypeScript fallisce

```bash
cd /home/coder/project/unpeeragogy/packages/mcp-server
npm run build
```

Errori comuni:
- Backtick non escapati dentro template literals (usa `\`\`\`` al posto di `` ``` ``)
- Import mancanti da `@modelcontextprotocol/sdk`
- Tipo errato nelle definizioni dei tool

### Deploy automatico non parte

- Il push ha toccato `packages/mcp-server/**` o `src/content/**`?
- Il secret `COOLIFY_MCP_UUID` esiste su GitHub?
- Il secret `COOLIFY_API_TOKEN` esiste su GitHub? (serve per autenticare la chiamata API a Coolify)
- Controlla [GitHub Actions](https://github.com/pyragogy/UnPeeragogy/actions) per errori

---

## Manutenzione

### Aggiornare le content collections

I file MDX in `src/content/` sono copiati nel container a ogni deploy.
Per aggiornare i dati serviti dal server:

1. Modifica o aggiungi file in `src/content/{peeragogy,unpeeragogy}/`
2. Commit e push su `main`
3. Il deploy automatico ricostruisce il container con i nuovi file

### Aggiungere un nuovo tool

1. Implementa la funzione in `src/tools/index.ts`
2. Aggiungi la definizione in `ListToolsRequestSchema` in `src/index.ts`
3. Aggiungi lo switch case in `CallToolRequestSchema` in `src/index.ts`
4. Builda (`npm run build`) e testa
5. Aggiorna la documentazione (questo file + pagine del sito)
6. Commit e push

---

## Riferimenti

- [MCP SDK](https://github.com/modelcontextprotocol/sdk) — protocollo
- [Coolify](https://coolify.io) — hosting
- [Documentazione utente del MCP →](https://unpeeragogy.pyragogy.org/mcp/)
- [PROJECT_MCP_DESIGN.md](./PROJECT_MCP_DESIGN.md) — design originale e road