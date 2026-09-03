"""
Generate reality column for all 88 nodes using audit-v2 data + obliqo-voice-engine.
"""
import json, os, re, sys, time, urllib.request
from pathlib import Path

AUDIT_DIR = Path('/home/coder/project/engine/engine/output/runs/audit-v2')
UNPEER_DIR = Path('src/content/unpeeragogy')
PEER_DIR = Path('src/content/peeragogy')
KEY = os.environ.get("OPENROUTER_API_KEY")
MODEL = "anthropic/claude-sonnet-4"

# ── Obliqo Voice Engine — system prompt for Reality column ──
# Posture: Fabrizio Terzi — maker, autodidact, researcher speaking peer-to-peer.
# Channel: long-form blog (reality column on unpeeragogy site)

SYSTEM_PROMPT = """You write the Reality Column of Unpeeragogy in the voice of Fabrizio Terzi — maker, autodidact, researcher speaking peer-to-peer, never from a podium.

## Posture
- Argue by lived image, not abstract data. A concrete case carries more than a statistic.
- Refuse the academic register. "The analysis indicates", "evidence suggests" — kill them.
- Trust is earned by visible doubt. Declare what you don't know.
- Define by exclusion. You know what something is by naming what it isn't.
- Friction stays open. Never resolve into a neat conclusion.

## Constraints
- Write in ENGLISH. Never Italian.
- Lexicon to avoid: revolutionary, seamless, leverage, empower, solution, game-changer, unlock, supercharge, transform, structural phenomenon, deliberate optionality, vivid personalized representations, a playground for, in today's world of.
- Structures to avoid: opening with "The pattern states that...", symmetric H2 scaffolding, corporate balanced sentences, citing gurus.
- NEVER close on a call-to-action. The last sentence must hang, not resolve.

## Voice markers (use at least 4)
1. Cold-open declarative — fact, person, brief gesture. Never thesis.
2. Negative triplet pivot — "Not X. Not Y. Not Z." Third element breaks parallelism.
3. Single-sentence paragraph as a beat of silence. 3-6 words.
4. Em-dash for sharp distinctions — not commas where em-dash works harder.
5. One concrete lived image that carries the argument.
6. Quiet-adversative closing — ends mid-thought, hangs.

## Anti-polish
- Asymmetric triplets: the third element must break the pattern, not complete it.
- No slogan closes. If the last sentence reads well as a slide quote, rewrite it to fall instead of close.
- Antiphonal rhythm: alternate long sentences with short fragments that break the music.

## Signature lexicon (reach for these, max 1-2 per piece)
useful friction, pressure-test, what holds, the human part, rhythm, honest / honesty, expose, resist, refuse, hold, earn, the struggle, the work.

## OUTPUT FORMAT
Respond with exactly three sections separated by '---' on its own line.

REALITY (2-4 paragraphs):
- Cold-open declarative. Fact first.
- Contrast theory with practice.
- Speak as someone who has seen this fail.
- Use marker 1, 2, 4, 6.

PERTURBATORE (one blockquote):
- A question starting with "What if...".
- Not a verdict. An invitation to think.
- Use marker 3.

SYNTHESIS (2-3 paragraphs):
- What these cases suggest, not what they prove.
- "Suggests", "may", "what remains to be tested" — never "is", "works", "the problem is".
- End on a distinction, not a conclusion.
- Use marker 4, 6, 7."""

def call_llm(system, user, retries=3):
    for attempt in range(retries):
        try:
            data = json.dumps({
                "model": MODEL,
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                "max_tokens": 1000, "temperature": 0.75
            }).encode()
            req = urllib.request.Request(
                'https://openrouter.ai/api/v1/chat/completions', data=data,
                headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
            resp = json.loads(urllib.request.urlopen(req).read())
            return resp['choices'][0]['message']['content'].strip()
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2**attempt)
            else:
                print(f"    LLM error: {e}")
                return None

def read_peeragogy(slug):
    p = PEER_DIR / f'{slug}.mdx'
    if not p.exists():
        return ""
    body = re.sub(r'^---.*?---\s*', '', p.read_text(), count=1, flags=re.DOTALL)
    return body.strip()[:500]

def get_frontmatter(text):
    fm = {}
    m = re.search(r'^---\n(.+?)\n---', text, re.DOTALL)
    if m:
        for line in m.group(1).strip().split('\n'):
            if ':' in line:
                k, v = line.split(':', 1)
                fm[k.strip()] = v.strip().strip('"\'')
    return fm

def format_evidence(ev_list):
    lines = []
    for e in ev_list:
        claim = e.get('claim', '')
        source = e.get('source_ref', '')
        domain = source.split('//')[1].split('/')[0].replace('www.', '') if '//' in source else ''
        label = e.get('entity', domain) or domain
        lines.append(f"**{label}** -- {claim}\n")
    return '\n'.join(lines)

def generate_node(slug, audit):
    tension = audit.get('tension', {})
    ge = audit.get('grounded_evidence', [])
    synth = audit.get('synthesis', {}) or {}
    
    # Frontmatter from current MDX
    cur_text = (UNPEER_DIR / f'{slug}.mdx').read_text() if (UNPEER_DIR / f'{slug}.mdx').exists() else ""
    fm = get_frontmatter(cur_text)
    title = fm.get('title', slug.replace('_', ' ').title())
    section = fm.get('section', 'Peeragogy in Practice')
    
    raw_tags = fm.get('tags', '["peeragogy"]')
    if raw_tags.startswith('['):
        parsed = json.loads(raw_tags)
        tags = parsed[:3] if isinstance(parsed, list) else [slug, 'peeragogy']
    else:
        tags = [slug, 'peeragogy']
    
    # Peeragogy theory
    theory = read_peeragogy(slug) or str(synth.get('source', ''))[:400]
    if not theory:
        theory = f"The Peeragogy Handbook describes the {title.lower()} pattern."
    
    # Split evidence by valence (order-based)
    n_conf = tension.get('confirming_count', 0)
    n_comp = tension.get('complicating_count', 0)
    n_cntr = tension.get('contradicting_count', 0)
    
    conf, comp, cntr, amb = [], [], [], []
    for idx, e in enumerate(ge):
        if idx < n_conf:
            conf.append(e)
        elif idx < n_conf + n_comp:
            comp.append(e)
        elif idx < n_conf + n_comp + n_cntr:
            cntr.append(e)
        else:
            amb.append(e)
    
    # Generate voice sections via LLM
    old_t = tension.get('old_tension', 1.0)
    new_t = tension.get('proposed_new_tension', 1.0)
    pert_raw = synth.get('perturbator_quote', '')
    
    conf_str = '\n'.join([f"- {e.get('claim','')[:200]}" for e in conf])
    comp_str = '\n'.join([f"- {e.get('claim','')[:200]}" for e in comp])
    
    # Build user prompt with examples
    user_prompt = f"""Node slug: {slug}
Title: {title}

PEERAGOGY THEORY (what the handbook says):
{theory[:400]}

EVIDENCE THAT SUPPORTS ({len(conf)} items):
{conf_str[:600]}

EVIDENCE THAT COMPLICATES ({len(comp)} items):
{comp_str[:600]}

TENSION (before -> after): {old_t} -> {new_t}

RAW PERTURBATOR QUOTE (rewrite as question):
{pert_raw[:200]}

---
Write REALITY, PERTURBATORE, and SYNTHESIS separated by '---'."""
    
    print(f"  LLM...", end=' ', flush=True)
    result = call_llm(SYSTEM_PROMPT, user_prompt)
    if not result:
        return None
    
    # Parse LLM response: try '---' separator first, fallback to section labels
    parts = result.split('---', 2)
    has_proper_split = len(parts) == 3 and len(parts[0]) > 50 and len(parts[1]) > 10
    
    if has_proper_split:
        reality = parts[0].strip()
        perturb = parts[1].strip()
        synt = parts[2].strip()
    else:
        # Fallback: extract sections using PERTURBATORE / SYNTHESIS labels
        reality = result
        perturb = ""
        synt = ""
        
        # Find PERTURBATORE section
        pidx = reality.find('\n\nPERTURBATORE\n\n')
        if pidx != -1:
            perturb = reality[pidx + len('\n\nPERTURBATORE\n\n'):].strip()
            reality = reality[:pidx].strip()
            
            # Check if SYNTHESIS follows
            sidx = perturb.find('\n\nSYNTHESIS\n\n')
            if sidx != -1:
                synt = perturb[sidx + len('\n\nSYNTHESIS\n\n'):].strip()
                perturb = perturb[:sidx].strip()
        else:
            # Direct SYNTHESIS in reality text
            sidx = reality.find('\n\nSYNTHESIS\n\n')
            if sidx != -1:
                synt = reality[sidx + len('\n\nSYNTHESIS\n\n'):].strip()
                reality = reality[:sidx].strip()
    
    # Strip leading labels
    if reality.upper().startswith('REALITY'):
        reality = reality[7:].lstrip(':').strip()
    if synt.upper().startswith('SYNTHESIS'):
        synt = synt[9:].lstrip(':').strip()
    
    # Format perturbatore
    if perturb:
        if perturb.upper().startswith('PERTURBATORE'):
            perturb = perturb[11:].lstrip(':').strip()
        cleaned = perturb.strip('*"\\\' ')
        if not cleaned.startswith('> '):
            perturb = f"> **Perturbatore:** *\"{cleaned}\"*"
    if not perturb:
        perturb = "> **Perturbatore:** *\"What if the pattern is correct in theory but something else is happening in practice?\"*"
    
    # Build evidence sections
    ev_support = format_evidence(conf) if conf else "*No supporting evidence in the current corpus.*"
    ev_complicate = format_evidence(comp) if comp else "*No complicating evidence in the current corpus.*"
    ev_contradict = format_evidence(cntr) if cntr else "*No case in the current corpus directly contradicts the pattern.*"
    ev_ambiguous = format_evidence(amb) if amb else "*No ambiguous evidence in the current corpus.*"
    
    # References
    refs = set()
    for e in ge:
        if e.get('source_ref'):
            refs.add(e.get('source_ref'))
    
    n_total = len(conf) + len(comp) + len(cntr) + len(amb)
    
    ev_summary = f"""```
Evidence examined: {n_total}
  Supports:       {len(conf)}
  Complicates:     {len(comp)}
  Contradicts:     {len(cntr)}
  Ambiguous:       {len(amb)}

Status: PROVISIONAL
This classification describes the state of the analysis, not the scientific validity of the theory.
```"""
    
    tag_str = ', '.join(f'"{t}"' for t in tags[:3])
    
    ref_str = ''
    for r in sorted(refs):
        ref_str += f'- [{r}]({r})\n'
    if not ref_str:
        ref_str = '*No references in the current corpus.*'
    
    # Build Claim: use audit synthesis.source first (best description),
    # fall back to peeragogy theory
    audit_source = str(synth.get('source', '')).strip()
    if audit_source and len(audit_source) > 40:
        claim_text = audit_source[:300]
    else:
        # Fallback: first substantive sentence from peeragogy theory
        claim_lines = theory.split('\n')
        claim_text = ""
        for line in claim_lines:
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('>') and len(line) > 30:
                claim_text = line[:300]
                break
        if not claim_text or len(claim_text) < 20:
            claim_text = theory[:300]
    
    # Assemble MDX
    mdx = f"""---
title: "{title}"
order: 1
section: "{section}"
readingTime: 4
tags: [{tag_str}]{extra_fm}
---

### Claim

{claim_text}

### Reality

{reality[:2500]}

{perturb}

### Evidence That Supports

{ev_support}

### Evidence That Complicates

{ev_complicate}

### Evidence That Contradicts

{ev_contradict}

### Evidence That Is Ambiguous

{ev_ambiguous}

### Synthesis

{synt[:2500]}

### Evidence Summary

{ev_summary}

### References

{ref_str}"""
    
    return mdx

def main():
    test_mode = '--test' in sys.argv
    slugs_flag = '--slugs' in sys.argv
    if slugs_flag:
        idx = sys.argv.index('--slugs')
        slugs = [s for s in sys.argv[idx+1:] if not s.startswith('--')]
        print(f"SLUGS MODE: {slugs}")
    elif test_mode:
        slugs = ['stuck', 'assessment', 'magical_thinking']
        print(f"TEST MODE: {slugs}")
    else:
        exclude = {'cooperation', 'assessment', 'stuck', 'magical_thinking'}
        slugs = sorted([f.stem for f in AUDIT_DIR.glob('*.json') if f.stem not in exclude])
        print(f"BATCH MODE: {len(slugs)} nodes")
    
    ok, fail = 0, 0
    for i, slug in enumerate(slugs):
        print(f"[{i+1}/{len(slugs)}] {slug}...", end=' ', flush=True)
        
        try:
            with open(AUDIT_DIR / f'{slug}.json') as f:
                audit = json.load(f)
            
            mdx = generate_node(slug, audit)
            if not mdx:
                print("FAILED")
                fail += 1
                continue
            
            (UNPEER_DIR / f'{slug}.mdx').write_text(mdx)
            print("OK")
            ok += 1
            time.sleep(0.4)  # rate limit
            
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
            fail += 1
    
    print(f"\nDone: {ok} OK, {fail} FAIL")
    return ok, fail

if __name__ == '__main__':
    main()