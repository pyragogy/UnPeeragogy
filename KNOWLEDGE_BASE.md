# Unpeeragogy — Knowledge Base

> Welcome to the Unpeeragogy Obsidian vault.
> This vault is synced with the GitHub repository. Every change to `.mdx` files
> in `src/content/` is reflected on the site at `unpeeragogy.pyragogy.org`.

## 🌐 Vault Structure

```
📁 src/content/peeragogy/   → 88 file MDX (Teoria Peeragogy)
📁 src/content/unpeeragogy/ → 88 file MDX (Realtà Unpeeragogy)
📁 .obsidian/               → Configurazione del vault
```

## 📊 Tension Index

Every file in the Reality column has a pre-calculated `tension_index`:

| Index | Color | Meaning |
|--------|--------|-------------|
| 0.0–0.3 | 🟢 | Low tension |
| 0.3–0.6 | 🟡 | Moderate tension |
| 0.6–1.0 | 🟠 | High tension |
| 1.0–2.0 | 🔴 | Critical tension |

## 🔗 Vault Links

Use `[[wikilinks]]` to connect patterns and anti-patterns:
- `[[cooperation]]` — links to the corresponding file
- `[[antipatterns]]` — anti-patterns page

## 🔍 Search

- `Ctrl/Cmd + P` → Command Palette
- `Ctrl/Cmd + O` → Go to file
- `Ctrl/Cmd + Shift + F` → Search in all files

## 🧩 CSS Snippet

The vault includes a Deep Navy theme (`unpeeragogy.css`). Activate it in:
Settings → Appearance → CSS snippets

## ⚡ MCP Server

To query the vault via AI (Claude, Cline, VS Code):
```bash
# Local connection to MCP server
# URL: http://localhost:3001/sse
# Token: MCP_AUTH_TOKEN
```