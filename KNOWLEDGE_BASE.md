# Unpeeragogy — Knowledge Base

> Benvenuto nel vault Obsidian di Unpeeragogy.
> Questo vault è sincronizzato con il repository GitHub. Ogni modifica ai file
> `.mdx` in `src/content/` viene riflessa nel sito su `unpeeragogy.pyragogy.org`.

## 🌐 Struttura del Vault

```
📁 src/content/peeragogy/   → 88 file MDX (Teoria Peeragogy)
📁 src/content/unpeeragogy/ → 88 file MDX (Realtà Unpeeragogy)
📁 .obsidian/               → Configurazione del vault
```

## 📊 Tension Index (Indice di Tensione)

Ogni file nella colonna Realtà ha un `tension_index` pre-calcolato:

| Indice | Colore | Significato |
|--------|--------|-------------|
| 0.0–0.3 | 🟢 | Tensione bassa |
| 0.3–0.6 | 🟡 | Tensione moderata |
| 0.6–1.0 | 🟠 | Tensione alta |
| 1.0–2.0 | 🔴 | Tensione critica |

## 🔗 Collegamenti tra Vault

Usa `[[wikilinks]]` per connettere pattern e anti-pattern:
- `[[cooperation]]` — collega al file corrispondente
- `[[antipatterns]]` — pagina degli anti-pattern

## 🔍 Ricerca

- `Ctrl/Cmd + P` → Command Palette
- `Ctrl/Cmd + O` → Vai al file
- `Ctrl/Cmd + Shift + F` → Cerca in tutti i file

## 🧩 Css Snippet

Il vault include un tema Deep Navy (`unpeeragogy.css`). Attivalo in:
Settings → Appearance → CSS snippets

## ⚡ MCP Server

Per interrogare il vault via AI (Claude, Cline, VS Code):
```bash
# Connessione locale al server MCP
# URL: http://localhost:3001/sse
# Token: MCP_AUTH_TOKEN
```