# MCP Server — Coolify Setup Guide

> Crea il server MCP come applicazione standalone nel progetto **Unpeeragogy** della Coolify Console.

## Passo 1 — Crea l'applicazione

Dalla Coolify Console (`https://console.pyragogy.org`), vai su Progetti → Unpeeragogy → **+ Nuova Applicazione**

### Configurazione:

| Campo | Valore |
|-------|--------|
| **Nome** | `unpeeragogy-mcp` |
| **Repository** | `pyragogy/unpeeragogy` |
| **Branch** | `main` |
| **Build Pack** | `Dockerfile` |
| **Base Directory** | `/` |
| **Dockerfile Location** | `/packages/mcp-server/Dockerfile` |
| **Port(s)** | `3001` |
| **Domain** | `mcp.unpeeragogy.pyragogy.org` |

### Variabili d'ambiente:

| Variabile | Valore |
|-----------|--------|
| `MCP_AUTH_TOKEN` | (genera una stringa random) |
| `MCP_FRICTION_MODE` | `soft` |
| `PORT` | `3001` |

## Passo 2 — Ottieni l'UUID

Dopo la creazione, dalla pagina dell'app prendi l'UUID (es. `abc123...`).

## Passo 3 — Configura il secret GitHub

Vai su Settings → Secrets and variables → Actions del repository `pyragogy/unpeeragogy` e aggiungi:

| Secret | Valore |
|--------|--------|
| `COOLIFY_MCP_UUID` | l'UUID dell'app MCP |

## Passo 4 — Primo deploy manuale

Dalla Coolify Console, clicca **Deploy** sull'app MCP.

Dopo il deploy, verifichi con:

```bash
curl https://mcp.unpeeragogy.pyragogy.org/health
```

Risposta attesa:
```json
{"status":"ok","server":"unpeeragogy-mcp","version":"0.1.0","frictionMode":"soft"}
```