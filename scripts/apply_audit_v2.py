#!/usr/bin/env python3
"""
apply_audit_v2.py — Batch update of Unpeeragogy MDX content nodes.

Maps audit-v2 JSON output (engine/output/runs/audit-v2/...json) onto
src/content/unpeeragogy/{slug}.mdx, preserving frontmatter fields
(title, order, section, readingTime, tags) and the Perturbatore quote,
while updating tension_index, origin, and the entire body with the
standard Reality column template.

Usage:
    python scripts/apply_audit_v2.py --dry-run    # simulation only
    python scripts/apply_audit_v2.py --apply       # write changes

NOTE ON VOICE:
    This script generates content programmatically from engine JSON output.
    The voice-engine (obliqo-voice-engine skill) must be applied MANUALLY to
    refine Summary, Sintesi Obliqua, and Perturbatore sections for shipping.
    The template structure is voice-native (cold-open, concrete cases, no
    academic boilerplate), but prose from A5 output needs human refinement.
"""

import json
import os
import re
import sys
from pathlib import Path

# ── Paths ──
PROJECT_ROOT = Path(__file__).resolve().parent.parent
UNPEERAGOGY_DIR = PROJECT_ROOT / "src" / "content" / "unpeeragogy"

CANDIDATES = [
    PROJECT_ROOT / "runs" / "audit-v2",
    Path("/home/coder/project/engine/engine/output/runs/audit-v2"),
    PROJECT_ROOT / ".." / "engine" / "engine" / "output" / "runs" / "audit-v2",
]
AUDIT_V2_DIR = None
for p in CANDIDATES:
    if p.exists() and any(f.suffix == ".json" and f.name != "manifest.json" for f in p.iterdir()):
        AUDIT_V2_DIR = p
        break
if not AUDIT_V2_DIR:
    print("ERROR: Cannot find audit-v2 JSON directory. Tried:")
    for p in CANDIDATES:
        print(f"  {p}")
    sys.exit(1)

BACKUP_PATH = PROJECT_ROOT / "runs" / "audit-v2" / "pre_batch_unpeeragogy_backup.tar.gz"


# ── Helpers ──

def parse_frontmatter(text: str) -> dict:
    """Parse simple frontmatter, stripping surrounding double quotes from values."""
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    data = {}
    for line in m.group(1).strip().split("\n"):
        if ":" in line:
            key, _, val = line.partition(":")
            val = val.strip().strip('"')
            data[key.strip()] = val
    return data


def extract_perturbatore(text: str) -> str:
    m = re.search(r'\*{1,2}Perturbatore\*{0,2}:\s*["\']?\*?_{1,2}([^*]+?)_{1,2}["\']?\*?', text, re.DOTALL)
    if m:
        return m.group(1).strip()
    m = re.search(r'>\s*\*{0,2}Perturbatore.*?\n(.*?)(?:\n\n|\Z)', text, re.DOTALL)
    if m:
        return m.group(1).strip().strip(">").strip()
    return ""


def read_json(slug: str) -> dict | None:
    p = AUDIT_V2_DIR / f"{slug}.json"
    return json.loads(p.read_text()) if p.exists() else None


def fmt_evidence(ev: dict, label: str) -> str:
    """Format evidence as concrete case — uses claim if source_description is corpus metadata."""
    entity = ev.get("entity_name", "Unknown")
    desc = (ev.get("source_description", "") or "").strip()
    claim = (ev.get("claim", "") or "").strip()
    src = (ev.get("source_ref", "") or "").strip()

    # If desc is corpus metadata ("Corpus entry CRP-..."), use claim instead
    if desc.startswith("Corpus entry CRP") and claim:
        desc = claim

    if not desc:
        desc = claim[:200] if claim else "N/A"

    lines = [f"**Caso {label} — {entity}**", f"- **Fenomeno:** {desc}"]
    if src:
        lines.append(f"- **Fonte:** [{src}]({src})" if src.startswith("http") else f"- **Fonte:** {src}")
    lines.append("")
    return "\n".join(lines)


# ── Main ──

def main():
    dry_run = "--dry-run" in sys.argv
    apply_mode = "--apply" in sys.argv

    if not dry_run and not apply_mode:
        print("Usage: python scripts/apply_audit_v2.py --dry-run | --apply")
        sys.exit(1)

    if apply_mode:
        print("APPLY mode — files will be modified.")
        if BACKUP_PATH.exists():
            print(f"  Backup: {BACKUP_PATH} ({BACKUP_PATH.stat().st_size / 1024:.0f} KB)")
        else:
            print("  Creating backup...")
            import subprocess
            subprocess.run(["tar", "-czf", str(BACKUP_PATH),
                           "-C", str(PROJECT_ROOT), "src/content/unpeeragogy/"], check=True)

    mdx_files = sorted(UNPEERAGOGY_DIR.glob("*.mdx"))
    slugs = [f.stem for f in mdx_files]

    stats = {"updated": 0, "no_json": 0, "incomplete": 0, "unchanged": 0, "errors": 0}

    for slug in slugs:
        mdx_path = UNPEERAGOGY_DIR / f"{slug}.mdx"
        old_text = mdx_path.read_text()

        data = read_json(slug)
        if data is None:
            stats["no_json"] += 1
            if dry_run:
                print(f"  ? {slug}: no JSON")
            continue

        if data.get("status") != "completed":
            stats["incomplete"] += 1
            if dry_run:
                print(f"  - {slug}: status={data.get('status')}")
            continue

        # ── Frontmatter ──
        fm = parse_frontmatter(old_text)
        title = fm.get("title", slug.replace("_", " ").title())
        order = fm.get("order", "1")
        section = fm.get("section", "Uncategorized")
        reading_time = fm.get("readingTime", "3")

        tags_str = fm.get("tags", "[]")
        tags = [t.strip().strip('"\'') for t in tags_str.strip("[]").split(",") if t.strip()]
        if "audit-v2" not in tags:
            tags.append("audit-v2")
        tags_str = "[" + ", ".join(f'"{t}"' for t in tags) + "]"

        t = data.get("tension", {}) or {}
        new_t = t.get("proposed_new_tension", t.get("old_tension", 1.0))
        old_t = t.get("old_tension", 1.0)

        # ── Evidence ──
        ge = data.get("grounded_evidence", [])
        conf = [e for e in ge if isinstance(e, dict) and e.get("phenomenon_type") == "confirming"]
        comp = [e for e in ge if isinstance(e, dict) and e.get("phenomenon_type") == "complicating"]

        # ── Synthesis ──
        syn = data.get("synthesis", {}) or {}
        va = syn.get("vault_action", {}) or {} if isinstance(syn, dict) else {}
        pos = (va.get("positive_rule", "") or "").strip()
        neg = (va.get("negative_rule", "") or "").strip()
        patch = (va.get("patch_proposal", "") or "").strip()
        rationale = (va.get("rationale", "") or "").strip()

        # ── Perturbatore (A2 output > old content > fallback) ──
        pert = (syn.get("perturbator_quote", "") or "").strip()
        if not pert:
            pert = extract_perturbatore(old_text)
        if not pert:
            pert = "Monitorare per failure pattern emergenti."

        # ── Sintesi Obliqua ──
        sintesi = " ".join(filter(None, [patch, rationale]))
        if not sintesi:
            sintesi = "Pattern da verificare con field report — corpus non ha ancora abbastanza tensione."
        if len(sintesi) > 500:
            sintesi = sintesi[:497] + "..."

        # ── Assemble MDX ──
        delta = new_t - old_t
        lines = [
            "---",
            f'title: "{title}"',
            f"order: {order}",
            f'section: "{section}"',
            f"readingTime: {reading_time}",
            f"tension_index: {new_t:.4f}",
            f"tags: {tags_str}",
            'origin: "audit-v2"',
            "---",
            "",
            "## Summary",
            "",
            f"{title}. Tensione: {old_t} → {new_t:.4f} (Δ={delta:+.4f}).",
            "",
            "## Evidenze Grounded",
            "",
            "### 🔹 Confirming (2)",
            "",
        ]
        for i, ev in enumerate(conf[:2], 1):
            lines.append(fmt_evidence(ev, str(i)))
        if len(conf) < 2:
            lines.append(f"*Solo {len(conf)} evidenze confirming.*")
            lines.append("")

        lines.append("### 🔸 Complicating (2)")
        lines.append("")
        for i, ev in enumerate(comp[:2], 1):
            lines.append(fmt_evidence(ev, str(i)))
        if len(comp) < 2:
            lines.append(f"*Solo {len(comp)} evidenze complicating.*")
            lines.append("")

        if pos or neg:
            lines += [
                "## Euristiche Operative",
                "",
            ]
            if pos:
                lines += ["### Positive Rule", "", f"> {pos}", ""]
            if neg:
                lines += ["### Negative Rule", "", f"> {neg}", ""]

        lines += [
            "## Sintesi Obliqua",
            "",
            sintesi,
            "",
            f"> **Perturbatore:** *{pert}*",
            "",
            "## Tracciabilità",
            "",
            f"- **Audit:** `runs/audit-v2/{slug}.json`",
            f"- **Delta:** {old_t} → {new_t:.4f} ({delta:+.4f})",
            f"- **Evidenze:** {len(ge)} ({len(conf)} confirming, {len(comp)} complicating)",
            "",
        ]

        new_text = "\n".join(lines) + "\n"

        if old_text.strip() == new_text.strip():
            stats["unchanged"] += 1
            continue

        if apply_mode:
            mdx_path.write_text(new_text)

        stats["updated"] += 1

    # ── Report ──
    mode = "DRY-RUN" if dry_run else "APPLY"
    print(f"\n{'=' * 60}")
    print(f"  {mode} — Batch update results")
    print(f"{'=' * 60}")
    print(f"  Aggiornati:    {stats['updated']}")
    print(f"  Salt (no json): {stats['no_json']}")
    print(f"  Salt (no comp): {stats['incomplete']}")
    print(f"  Invariati:     {stats['unchanged']}")
    print(f"  Errori:        {stats['errors']}")
    print(f"{'=' * 60}")
    if dry_run:
        print(f"\n  Per applicare: python scripts/apply_audit_v2.py --apply")
        print(f"  POI: rifinire Summary e Sintesi Obliqua con obliqo-voice-engine per ogni nodo.")


if __name__ == "__main__":
    main()