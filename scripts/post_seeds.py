#!/usr/bin/env python3
"""
post_seeds.py — Post audit seeds to GitHub Discussions via GraphQL API.

Usage:
  export GITHUB_TOKEN="ghp_..."
  python3 post_seeds.py [--dry-run] [--node cooperation] [--node assessment] [--node distributed_roadmap]

If --node is not specified, all three are published.

Dependencies: requests (standard for this environment).
"""

import os
import sys
import json
import argparse
import textwrap

import requests


# ──────────────────────────────────────────────
# Auto-load .env if present
# ──────────────────────────────────────────────

def load_env(path=".env"):
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip().strip('\"\''))

load_env()


GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
DRY_RUN = "--dry-run" in sys.argv

if not GITHUB_TOKEN and not DRY_RUN:
    print("ERROR: export GITHUB_TOKEN='ghp_...' prima di eseguire.")
    sys.exit(1)

OWNER = "pyragogy"
REPO = "unpeeragogy"
CATEGORY_NAME = "AI Audits & Friction Reports"

GRAPHQL_URL = "https://api.github.com/graphql"
HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Content-Type": "application/json",
}

# ──────────────────────────────────────────────
# Post bodies (template + node-specific content)
# ──────────────────────────────────────────────

def build_body(node_data):
    """Build the markdown body of a Discussion from the node_data dict."""
    lines = [
        f"## [Audit v2] {node_data['title']} — Tension: {node_data['tension']} ({node_data['tension_label']})",
        "",
        f"**Slug:** `{node_data['slug']}` · **Run:** `audit-v2` · **Delta:** {node_data['old']} → {node_data['new']} ({node_data['delta']})",
        "",
        "---",
        "",
        "### The Assumption",
        "",
        f"> {node_data['assumption']}",
        "",
        "### Operational Reality",
        "",
        node_data['reality'],
        "",
        "---",
        "",
        "### Registered Evidence",
        "",
        "**Resilience (Confirming):**",
        node_data['resilience'] or "*None in this corpus.*",
        "",
        "**Fracture (Complicating):**",
        node_data['fracture'],
        "",
        "---",
        "",
        "### Fast-and-Frugal Heuristics",
        "",
        "| Boundary | Rule |",
        "|----------|------|",
        f"| **Positive** | {node_data['positive_rule']} |",
        f"| **Negative** | {node_data['negative_rule']} |",
        "",
        "---",
        "",
        "### The Perturbator",
        "",
        f"> *{node_data['perturbator']}*",
        "",
        "---",
        "",
        "### Falsification Trigger",
        "",
        node_data['falsification_trigger'],
        "",
    ]
    return "\n".join(lines)


NODES = {
    "distributed_roadmap": {
        "title": "The Emergent Roadmap Never Emerges",
        "slug": "distributed_roadmap",
        "tension": "2.0",
        "tension_label": "Saturation",
        "old": "1.6",
        "new": "2.0",
        "delta": "+0.425",
        "assumption": (
            "Distributed groups can navigate toward shared goals through organic emergence, "
            "allowing multiple pathways to coexist until natural selection reveals the optimal direction."
        ),
        "reality": textwrap.dedent("""\
            The Peeragogy Handbook promises emergent roadmaps — twenty-three patterns ending with
            "What's Next" steps that supposedly aggregate into collective direction. Watch any actual
            peer project try this.

            The Linux kernel did not emerge from collective wisdom — Linus Torvalds made thousands
            of small dictatorial decisions until subsystem maintainers could carry the load.
            Wikipedia's early chaos required Jimmy Wales stepping in repeatedly until bureaucratic
            structures solidified. Not emergence. Governance.

            The roadmap that "emerges" is usually the path of least resistance — meaning the path
            that avoids the hardest conversations."""),
        "resilience": "*None in this corpus. This is a gap: no documented case of successful emergent roadmapping exists in the audit archive.*",
        "fracture": textwrap.dedent("""\
            - [Drupal Governance](https://www.drupal.org/governance) — BDFL-to-community transition
              took years of intentional institutional design, not organic emergence.
            - [WebAssembly Community Group](https://www.w3.org/community/webassembly/) — Lighter
              governance trades authority for speed, creating different failure modes."""),
        "positive_rule": "Apply only with explicit scaffolding structures that channel emergence toward actionable decisions",
        "negative_rule": "Do not apply under time pressure or governance transitions — scaffolding-free emergence produces paralysis",
        "perturbator": (
            "What if emergence is what you call it when you are too scared to make a decision and "
            "hope the universe will do it for you — and the refusal to plan is itself a plan that "
            "protects existing power by making change feel impossible?"
        ),
        "falsification_trigger": textwrap.dedent("""\
            This node hit ceiling (2.0) because the corpus contains zero confirming cases of emergent
            roadmapping succeeding without designed scaffolding. If you know a case — a DAO, a FOSS
            project, a cooperative — that scaled a distributed roadmap without hierarchy, structural
            work, or a benign dictator: **name it, link the source, and the tension gets
            recalculated.** The protocol is built to be wrong."""),
    },
    "cooperation": {
        "title": "Cooperation",
        "slug": "cooperation",
        "tension": "1.553",
        "tension_label": "Stable",
        "old": "1.6",
        "new": "1.553",
        "delta": "±0.047",
        "assumption": (
            "Cooperation is the natural expression of a well-functioning peer group — the condition "
            "you build toward through shared intention and mutual support."
        ),
        "reality": textwrap.dedent("""\
            Cooperation becomes visible only when disagreement surfaces. When everyone agrees, you
            cannot tell if the group is cooperating or just mirroring each other. When disagreement
            emerges, you see what the group is made of: does it find a way to continue acting
            together, or does it fragment?

            GitLab had boundaries ready before tension arrived — a written pact defining where
            corporate strategy ends and community autonomy begins. Wikipedia and WebAssembly built
            their processes reactively, after failure was visible. Mondragón had governance and still
            lost Fagor — governance protects networks more reliably than it protects individual units."""),
        "resilience": textwrap.dedent("""\
            - [GitLab Stewardship Handbook](https://about.gitlab.com/handbook/company/stewardship/)
              — Explicit governance boundaries between corporate sponsor and community, documented
              before conflict arrived. When tension came, the structure channeled it without
              destroying productive capacity."""),
        "fracture": textwrap.dedent("""\
            - [Fagor / Mondragón Collapse](https://www.grassrootseconomicorganizing.org/fagor-electrodomesticos-a-failure-of-cooperative-governance/)
              — The founding cooperative was liquidated despite support from the wider network.
              Governance protected the network but failed the unit.
            - [WebAssembly Community Group](https://www.w3.org/community/webassembly/) — Structured
              peer consensus with formal objection windows. Disagreements over features took years
              to resolve.
            - [Wikipedia Arbitration Committee](https://en.wikipedia.org/wiki/Arbitration_Committee_(Wikimedia))
              — Informal cooperation failed systematically in high-stakes disputes. A formal judicial
              body was created to handle what peer consensus could not."""),
        "positive_rule": "Apply cooperation patterns when governance boundaries are documented explicitly before conflict arrives",
        "negative_rule": "Do not assume cooperation survives structural mismatches between governance design and conflict type — the container must match the scale of conflict the group actually faces",
        "perturbator": (
            "What if we are confusing cooperation with harmony? A group that agrees on everything "
            "can produce nothing together. A group that disagrees openly can keep working. Maybe the "
            "point is not the absence of conflict — but the capacity to move through it without "
            "losing the ability to act."
        ),
        "falsification_trigger": textwrap.dedent("""\
            This node sits at 1.553 — stable but unresolved. The key claim is that pre-built
            containers (documented boundaries before conflict) predict cooperative resilience better
            than reactive governance. If you know a case where a group survived high-stakes conflict
            *without* pre-built governance structures — or conversely, where pre-built governance
            failed despite matching the conflict type — name it with a source. The protocol rewards
            cases that shift the resultant."""),
    },
    "assessment": {
        "title": "Assessment",
        "slug": "assessment",
        "tension": "1.48",
        "tension_label": "Negative Delta",
        "old": "1.7",
        "new": "1.48",
        "delta": "−0.220",
        "assumption": (
            "Peers can evaluate each other honestly when the assessment process is transparent, "
            "collaborative, and the goal is shared growth. Self-assessment and peer feedback "
            "function as formative practices embedded in peer learning, not as gatekeeping mechanisms."
        ),
        "reality": textwrap.dedent("""\
            Peer assessment creates quality hierarchies. And those hierarchies conflict with the peer
            governance that produced them. The problem is structural: evaluation requires someone to
            say no — to reject a contribution, to name what is not good enough. In a peer group,
            saying no risks the relationship. So the group avoids it.

            Wikipedia's Good Article process works not because peers evaluate each other, but because
            nominated reviewers with binding authority apply transparent criteria. It is not peer
            assessment. It is lightweight hierarchy operating under peer language. Moodle's plugin QA
            works the same way: nominated integrators explicitly authorized to say no.

            The Wikipedia Featured Article Candidate process tests the same community with stricter
            criteria. Result: quality tiers create an elite, and the elite conflicts with the
            egalitarian ideals the community claims."""),
        "resilience": textwrap.dedent("""\
            - [Wikipedia Good Article process](https://en.wikipedia.org/wiki/Wikipedia:Good_articles)
              — Transparent criteria plus independent reviewers with binding authority create
              sustainable quality tiers.
            - [Moodle plugin QA system](https://moodle.org/plugins/) — Nominated integrators with
              clear criteria, explicitly authorized to reject. Scales without breaking."""),
        "fracture": textwrap.dedent("""\
            - [Wikipedia Featured Article Candidate process](https://en.wikipedia.org/wiki/Wikipedia:Featured_article_candidates)
              — Same community, stricter criteria. Quality tiers create elite that conflicts with
              egalitarian ideals.
            - [Linux kernel Reviewed-by tag system](https://docs.kernel.org/process/submitting-patches.html)
              — Peer review creates accountability but concentrates bottleneck: limiting factor
              shifts from writing code to getting it reviewed."""),
        "positive_rule": "Apply peer assessment only when reviewers are explicitly authorized to reject and criteria are transparent — quality control requires structurally supported authority, not relationally negotiated",
        "negative_rule": "Do not rely on peer assessment without a binding rejection mechanism — without authorized reviewers, the social cost of rejection suppresses honest evaluation",
        "perturbator": (
            "What if the problem is not the criteria but the courage to apply them? You can have "
            "the most transparent process in the world — if nobody is willing to reject a friend's "
            "contribution, the process produces nothing but paper."
        ),
        "falsification_trigger": textwrap.dedent("""\
            This node shows a negative delta (−0.220), meaning the confirming evidence was strong
            enough to outweigh the complicating evidence. The surviving claim: assessment with
            hierarchy works; assessment without hierarchy has no documented success. If you know a
            peer group that maintains quality standards without authorized reviewers — no
            gatekeepers, no binding rejection, purely horizontal — name it with a source. That case
            would shift the tension vector upward."""),
    },
}


# ──────────────────────────────────────────────
# GitHub GraphQL operations
# ──────────────────────────────────────────────

def graphql(query, variables=None):
    payload = {"query": query, "variables": variables or {}}
    resp = requests.post(GRAPHQL_URL, headers=HEADERS, json=payload)
    data = resp.json()
    if "errors" in data:
        print(f"GraphQL errors: {json.dumps(data['errors'], indent=2)}")
        sys.exit(1)
    return data["data"]


def get_repo_info():
    query = """
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id
        discussionCategories(first: 20) {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
    """
    data = graphql(query, {"owner": OWNER, "repo": REPO})
    repo = data["repository"]
    repo_id = repo["id"]
    categories = repo["discussionCategories"]["nodes"]
    return repo_id, categories


def find_category_id(categories, name):
    for cat in categories:
        if cat["name"].lower() == name.lower():
            return cat["id"]
    return None


def create_discussion(repo_id, category_id, title, body):
    query = """
    mutation($input: CreateDiscussionInput!) {
      createDiscussion(input: $input) {
        discussion {
          id
          url
        }
      }
    }
    """
    variables = {
        "input": {
            "repositoryId": repo_id,
            "categoryId": category_id,
            "title": title,
            "body": body,
        }
    }
    data = graphql(query, variables)
    discussion = data["createDiscussion"]["discussion"]
    return discussion["id"], discussion["url"]


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Post audit seeds to GitHub Discussions")
    parser.add_argument("--dry-run", action="store_true", help="Print posts without publishing")
    parser.add_argument("--node", action="append", choices=list(NODES.keys()),
                        help="Specific node (default: all)")
    args = parser.parse_args()

    nodes_to_publish = args.node if args.node else list(NODES.keys())

    if args.dry_run:
        print(f"🔍 DRY RUN — {len(nodes_to_publish)} posts to publish on {OWNER}/{REPO}")
        print(f"   Target category: '{CATEGORY_NAME}'")
        print("=" * 60)
        for slug in nodes_to_publish:
            data = NODES[slug]
            body = build_body(data)
            print(f"\n📄 [{data['title']}]")
            print(body[:500] + "...\n")
            print("=" * 60)
        print(f"\n✅ Dry run complete. No posts sent.")
        return

    # Step 1: get repo info
    print(f"📡 Querying {OWNER}/{REPO}...")
    repo_id, categories = get_repo_info()
    print(f"   Repository ID: {repo_id}")
    print(f"   Categories found: {[c['name'] for c in categories]}")

    # Step 2: find or warn about category
    cat_found = True
    cat_id = find_category_id(categories, CATEGORY_NAME)
    if not cat_id:
        cat_found = False
        print(f"\n⚠️  Category '{CATEGORY_NAME}' not found.")
        print(f"   Available categories: {[c['name'] for c in categories]}")
        fallback = next((c for c in categories if c['slug'] == 'general'), None)
        if fallback:
            cat_id = fallback["id"]
            print(f"   → Falling back to '{fallback['name']}' (slug: general)")
            print(f"   → After creating '{CATEGORY_NAME}' on GitHub, re-run.")
        else:
            print("   → No fallback category available. Create the category manually.")
            sys.exit(1)
    else:
        print(f"✅ Category '{CATEGORY_NAME}' found (ID: {cat_id})")

    # Step 3: publish
    success = 0
    for slug in nodes_to_publish:
        data = NODES[slug]
        title = f"[Audit v2] {data['title']} — Tension: {data['tension']} ({data['tension_label']})"
        body = build_body(data)
        print(f"\n📤 Publishing: '{title}'...")
        try:
            disc_id, url = create_discussion(repo_id, cat_id, title, body)
            print(f"   ✅ Published: {url}")
            success += 1
        except Exception as e:
            print(f"   ❌ Error: {e}")

    print(f"\n{'=' * 60}")
    print(f"✅ Done: {success}/{len(nodes_to_publish)} posts published successfully on {OWNER}/{REPO}.")
    if not cat_found:
        print(f"   ⚠️  Used fallback category. Create '{CATEGORY_NAME}' on GitHub for the correct format.")


if __name__ == "__main__":
    main()