#!/usr/bin/env python3
"""
refine_vault_voice.py — Applica obliqo-voice-engine a Summary e Sintesi Obliqua
di tutti i nodi del Vault Unpeeragogy (tranne cooperation.mdx, già rifinito).

Architettura:
  Per ogni nodo, invia a Claude Sonnet via OpenRouter:
    - Il testo teorico originale (Peeragogy Handbook)
    - Le 4 evidenze del Quadrilatero Empirico
    - Le Euristiche Operative (Positive/Negative Rule) e il Perturbatore
    - La system instruction obliqo-voice-engine
  Riscrive solo Summary e Sintesi Obliqua, preservando tutto il resto.

Usage:
    python scripts/refine_vault_voice.py --test          # test su 3 nodi pilota
    python scripts/refine_vault_voice.py --batch         # tutti gli 87 nodi
    python scripts/refine_vault_voice.py --batch --dry   # simulazione senza chiamate
    python scripts/refine_vault_voice.py --restore       # ripristina da backup
"""

import json
import os
import re
import sys
import time
import hashlib
from pathlib import Path

import requests

# ── Config ──
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
MODEL = "anthropic/claude-sonnet-4"
# MODEL = "openai/gpt-4o-mini"  # cheaper alternative for testing

PROJECT_ROOT = Path(__file__).resolve().parent.parent
UNPEER_DIR = PROJECT_ROOT / "src" / "content" / "unpeeragogy"
PEER_DIR = PROJECT_ROOT / "src" / "content" / "peeragogy"
BACKUP_PATH = PROJECT_ROOT / "runs" / "audit-v2" / "pre_voice_refine_backup.tar.gz"

# Audit v2 JSON — needed for full context
AUDIT_V2_DIR = Path("/home/coder/project/engine/engine/output/runs/audit-v2")

# ── System prompt: obliqo-voice-engine distilled ──
VOICE_SYSTEM = """You are Fabrizio Terzi — maker, autodidact, researcher. Speak peer-to-peer, never from a podium. Your register: friction-as-argument, refusal of marketing posture, zero academic boilerplate.

--- HARD RULES ---

1. NEVER open with thesis or framing context. A cold-open is a fact, a gesture, 3-5 words. Not "This pattern demonstrates…" Not "In examining the evidence…" Not "The theory suggests…"

2. NEVER use academic register. Banned: "The analysis indicates", "Evidence suggests", "This pattern validates", "It is worth noting", "We observe that", "The framework demonstrates". Use maker register: "It works when…", "The problem is…", "Theory says X. Practice does Y.", "Here's where it breaks."

3. NEVER close with a resolution, conclusion, or summary. The Sintesi Obliqua must end on a distinction, not a synthesis. If the last line works as a slide quote, it is wrong — rewrite it so it falls, not closes.

4. OUTPUT MUST BE IN ENGLISH. Fabrizio's maker register in English: colloquial, precise, anti-academic. Never solemn. Never bureaucratic. Never press-release.

5. LEXICON TO AVOID: revolutionary, seamless, leverage, empower, solution (as product-noun), game-changer, unlock, supercharge, transform your X, a playground for X, in today's world of. Also: we're excited to, thrilled to announce, don't miss out, discover more. If a sentence could be in a Series B startup's landing page, it's dead.

--- VOICE MARKERS (use 2-3 per piece) ---

- Cold-open declarative: a flat fact. "Cooperation happens because you disagree." "The emergent roadmap never emerges."
- Negative triplet / definition by exclusion — with asymmetric final element: "Not X. Not Y. Just Z." Third element breaks the pattern.
- Em-dash for sharp distinctions: "Cooperation means getting things done — despite not getting along."
- Single-sentence paragraph: 3-6 words as a beat of silence.
- Visible doubt: "Partial verification.", "The mechanism is right. But…", "I don't have a final answer yet."
- Concrete image, not abstraction: "fuel" not "catalyst", "engine" not "infrastructure", "arson" not "counterproductive intervention".

--- ANTI-POLISH ---

- No symmetric triplets. "Not easy. Not simple. Not trivial." is robotic. Last element must spiazza: "Not easy. Not simple. It needs structure."
- No slogan closes. The last sentence must NOT sound good on a slide. It should hang, remain open, be slightly unsatisfying.
- Antiphonal rhythm: alternate a long complex sentence with a short fragment that breaks the musicality of the previous one.

--- STRUCTURE FOR THE TWO SECTIONS ---

CRITICAL: DO NOT paraphrase or echo the Perturbatore quote. Your Summary and Sintesi must stand on their own voice — if they sound like the Perturbatore, they are redundant and must be rewritten.

### Summary (cold-open, maker register, 2-4 sentences, ENGLISH)
Structure: [cold fact] → [distinction: theory vs practice] → [why it matters operationally]

### Sintesi Obliqua (friction analysis, 4-6 sentences, ENGLISH)
Structure: [what the pattern claims] → [verification with caveat: partial, conditional on…] → [the evidence as argument: name the 2 confirming and 2 complicating cases as argument, not as list] → [what's missing / the real mechanism not described] → [closing distinction, not conclusion — a gesture, an image, a "quietly, if necessary…"]

Speak as someone who has seen this pattern fail and is telling the reader straight, not as someone reviewing a paper.

--- FINAL REMINDER ---

Your ENTIRE output for Summary and Sintesi Obliqua MUST BE IN ENGLISH. Not a single Italian word. The evidence cases contain Italian headers ("Caso 1 —", "Fenomeno:") but you MUST ignore them as context and write your sections in English. If the first word you write is Italian, stop and restart in English. This is the single most important instruction.
"""


# ── Helpers ──

def read_file(path: Path, default: str = "") -> str:
    try:
        return path.read_text()
    except FileNotFoundError:
        return default


def parse_frontmatter(text: str) -> dict:
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    data = {}
    for line in m.group(1).strip().split("\n"):
        if ":" in line:
            key, _, val = line.partition(":")
            data[key.strip()] = val.strip().strip('"').strip("'")
    return data


def extract_section(text: str, heading: str) -> str:
    """Extract content of a markdown section by heading name."""
    pattern = rf"^##\s*{heading}\s*\n(.*?)(?=^##\s|\Z)"
    m = re.search(pattern, text, re.MULTILINE | re.DOTALL)
    return m.group(1).strip() if m else ""


def replace_section(text: str, heading: str, new_content: str) -> str:
    """Replace entire section content (after heading line until next heading or end)."""
    pattern = rf"^(##\s*{heading}\s*\n).*?(?=^##\s|\Z)"
    replacement = rf"\1{new_content}\n\n"
    result = re.sub(pattern, replacement, text, count=1, flags=re.MULTILINE | re.DOTALL)
    return result


def read_audit_json(slug: str) -> dict | None:
    p = AUDIT_V2_DIR / f"{slug}.json"
    return json.loads(p.read_text()) if p.exists() else None


def build_context(slug: str) -> dict | None:
    """Build full context for a node from MDX + peeragogy + audit JSON."""
    unpeer_text = read_file(UNPEER_DIR / f"{slug}.mdx")
    peer_text = read_file(PEER_DIR / f"{slug}.mdx")
    audit = read_audit_json(slug)

    if not unpeer_text:
        return None

    fm = parse_frontmatter(unpeer_text)
    title = fm.get("title", slug.replace("_", " ").title())

    # Extract current sections
    current_summary = extract_section(unpeer_text, "Summary")
    current_sintesi = extract_section(unpeer_text, "Sintesi Obliqua")

    # Evidence from unpeer MDX (already formatted)
    evidence_section = extract_section(unpeer_text, "Evidenze Grounded")

    # Euristiche from unpeer MDX
    euristiche = extract_section(unpeer_text, "Euristiche Operative")

    # Perturbatore
    pert_m = re.search(r"> \*\*Perturbatore:\*\* \*(.*?)\*", unpeer_text, re.DOTALL)
    perturbatore = pert_m.group(1).strip() if pert_m else ""

    # Tension
    tension = fm.get("tension_index", "?")
    old_t = audit.get("tension", {}).get("old_tension", 1.0) if audit else 1.0

    # Peeragogy body (strip frontmatter)
    peer_body = re.sub(r"^---.*?---\s*", "", peer_text, count=1, flags=re.DOTALL).strip()[:800] if peer_text else ""

    # Confirming/complicating entity names
    ge = audit.get("grounded_evidence", []) if audit else []
    conf_entities = [e.get("entity_name", "") for e in ge if isinstance(e, dict) and e.get("phenomenon_type") == "confirming"]
    comp_entities = [e.get("entity_name", "") for e in ge if isinstance(e, dict) and e.get("phenomenon_type") == "complicating"]

    return {
        "slug": slug,
        "title": title,
        "peer_theory": peer_body[:600] if peer_body else "N/A",
        "evidence_section": evidence_section,
        "euristiche": euristiche,
        "perturbatore": perturbatore,
        "tension": tension,
        "old_tension": old_t,
        "conf_entities": conf_entities,
        "comp_entities": comp_entities,
        "current_summary": current_summary,
        "current_sintesi": current_sintesi,
        "raw_text": unpeer_text,
    }


def build_prompt(ctx: dict) -> str:
    """Build the user prompt for the LLM."""
    return f"""NODO: {ctx['title']} (slug: {ctx['slug']})
TENSIONE: {ctx['old_tension']} → {ctx['tension']}

--- TEORIA PEERAGOGY ORIGINALE ---
{ctx['peer_theory'][:600]}

--- EVIDENZE GROUNDED (Quadrilatero Empirico) ---
{ctx['evidence_section'][:800]}

--- EURISTICHE OPERATIVE ---
{ctx['euristiche'][:600]}

--- PERTURBATORE (non riscrivere) ---
{ctx['perturbatore']}

--- SEZIONI CORRENTI (da riscrivere) ---

CURRENT Summary:
{ctx['current_summary'][:300]}

CURRENT Sintesi Obliqua:
{ctx['current_sintesi'][:300]}

---
Rewrite ONLY Summary and Sintesi Obliqua. THEY MUST BE IN ENGLISH — not one Italian word.

Respond EXCLUSIVELY in this JSON format, nothing else:
{{
  "summary": "The cold-open fact. The distinction. Why it matters operationally.",
  "sintesi_obliqua": "What the pattern claims. Partial verification with caveat. The confirming and complicating cases as argument. What's missing. Closing distinction, not conclusion."
}}
"""


def call_llm(prompt: str, model: str = MODEL) -> dict | None:
    """Call OpenRouter with Claude Sonnet, return parsed JSON response."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://unpeeragogy.pyragogy.org",
        "X-Title": "Unpeeragogy Voice Refinement",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": VOICE_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 800,
    }

    try:
        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"].strip()

        # Parse JSON from response (handle markdown fences)
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\s*", "", content)
            content = re.sub(r"\s*```$", "", content)

        result = json.loads(content)
        return result

    except Exception as e:
        print(f"  ERRORE LLM: {e}")
        return None


def assemble_mdx(ctx: dict, summary: str, sintesi: str) -> str:
    """Replace Summary and Sintesi Obliqua sections in the original MDX."""
    text = ctx["raw_text"]

    # Replace Summary
    text = replace_section(text, "Summary", summary.strip())

    # Replace Sintesi Obliqua (before Perturbatore)
    text = replace_section(text, "Sintesi Obliqua", sintesi.strip())

    return text


def create_backup():
    import subprocess
    if not BACKUP_PATH.parent.exists():
        BACKUP_PATH.parent.mkdir(parents=True)
    subprocess.run(["tar", "-czf", str(BACKUP_PATH),
                   "-C", str(PROJECT_ROOT), "src/content/unpeeragogy/"], check=True)
    print(f"  Backup creato: {BACKUP_PATH}")


def restore_backup():
    import subprocess
    if not BACKUP_PATH.exists():
        print(f"  Nessun backup trovato: {BACKUP_PATH}")
        return
    subprocess.run(["tar", "-xzf", str(BACKUP_PATH),
                   "-C", str(PROJECT_ROOT)], check=True)
    print(f"  Backup ripristinato da: {BACKUP_PATH}")


# ── Main ──

def main():
    if "--restore" in sys.argv:
        restore_backup()
        return

    test_mode = "--test" in sys.argv
    batch_mode = "--batch" in sys.argv
    dry_run = "--dry" in sys.argv

    if not test_mode and not batch_mode:
        print("Usage:")
        print("  python scripts/refine_vault_voice.py --test          # 3 nodi pilota")
        print("  python scripts/refine_vault_voice.py --batch         # tutti gli 87 nodi")
        print("  python scripts/refine_vault_voice.py --batch --dry   # simulazione")
        print("  python scripts/refine_vault_voice.py --restore       # ripristino")
        sys.exit(1)

    # Collect slugs
    mdx_files = sorted(UNPEER_DIR.glob("*.mdx"))
    all_slugs = [f.stem for f in mdx_files if f.stem != "cooperation"]
    print(f"  Nodi totali (escluso cooperation): {len(all_slugs)}")

    if test_mode:
        slugs = ["distributed_roadmap", "assessment", "stuck"]
        print(f"  Test su: {', '.join(slugs)}")
    else:
        slugs = all_slugs
        print(f"  Batch su tutti gli {len(slugs)} nodi")
        if not dry_run:
            create_backup()

    stats = {"ok": 0, "skip": 0, "error": 0, "total": len(slugs)}

    for slug in slugs:
        ctx = build_context(slug)
        if ctx is None:
            print(f"  SKIP {slug}: nessun file MDX")
            stats["skip"] += 1
            continue

        if dry_run:
            print(f"  [DRY] {slug}: {ctx['title']}")
            print(f"        peer: {len(ctx['peer_theory'])}c, ev: {len(ctx['evidence_section'])}c")
            stats["ok"] += 1
            continue

        # Build and send prompt
        prompt = build_prompt(ctx)
        print(f"  → {slug} ({ctx['title'][:40]}...)", end=" ")

        result = call_llm(prompt)
        if result is None:
            print("❌")
            stats["error"] += 1
            continue

        summary = result.get("summary", "").strip()
        sintesi = result.get("sintesi_obliqua", "").strip()

        if not summary or not sintesi:
            print("⚠️  risposta incompleta")
            stats["error"] += 1
            continue

        # Write new MDX
        new_text = assemble_mdx(ctx, summary, sintesi)
        (UNPEER_DIR / f"{slug}.mdx").write_text(new_text)
        print("✅")
        stats["ok"] += 1

        # Rate limiting: 2 calls/second
        time.sleep(0.5)

    # Report
    print(f"\n{'=' * 50}")
    mode = "TEST" if test_mode else "BATCH"
    print(f"  {mode} completato")
    print(f"  OK: {stats['ok']} | SKIP: {stats['skip']} | ERROR: {stats['error']} | TOT: {stats['total']}")
    print(f"  Modello: {MODEL}")
    if dry_run:
        print(f"  (solo simulazione — nessuna chiamata LLM effettuata)")

    if test_mode and stats["ok"] > 0:
        print(f"\n  Verifica i risultati con: git diff src/content/unpeeragogy/")
        print(f"  Per proseguire con tutti: python scripts/refine_vault_voice.py --batch")


if __name__ == "__main__":
    main()