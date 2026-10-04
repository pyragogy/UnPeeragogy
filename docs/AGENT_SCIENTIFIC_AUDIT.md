# Agent Scientific Audit

UnPeeragogy is maintained as a living research system. Its public monthly log is therefore not only a software changelog: it is a **scientific audit of how the project changed, what its agents challenged, and what remains unresolved**.

## Roles

### Human orchestrator

The human orchestrator defines:
- the research landscape worth inspecting;
- boundaries and non-negotiable evidence rules;
- which questions deserve further investigation;
- when a human epistemic or publication decision is required.

The orchestrator does not pre-author the conclusion.

### Agents

Agents operate as bounded scientific auditors.

They may:
- inspect the corpus and repository;
- query the MCP server;
- retrieve source material;
- compare competing interpretations;
- formulate falsifiable probes;
- run formal or computational tests;
- identify contradictions, provenance problems, missing evidence and schema drift;
- preserve traces of what they did.

Agents may propose interpretations, but their output is not evidence by itself.

### Bots and workflows

Bots execute bounded operational procedures such as:
- synchronising records;
- applying labels;
- building the site;
- generating monthly snapshots;
- validating schemas.

A bot may be complex, but it does not gain epistemic authority merely by being automated.

A useful shorthand is:

```
Bots execute rules.
Agents inspect rules and consequences.
Humans retain accountable epistemic and publication authority.
```

## Monthly audit cycle

Every month, the audit should answer:

1. **What changed?**
   - corpus changes;
   - protocol/schema changes;
   - new discussions and candidate evidence;
   - formal or computational artefacts.

2. **What did agents challenge?**
   - overclaims;
   - unsupported transitions;
   - provenance ambiguity;
   - contradictory records;
   - failed assumptions;
   - missing evidence.

3. **What survived?**
   - claims strengthened by new evidence;
   - model constraints that survived adversarial testing;
   - historical interpretations that remain supportable.

4. **What weakened or failed?**
   - claims narrowed;
   - assumptions falsified;
   - prior interpretations downgraded;
   - failed automations or broken research infrastructure.

5. **What remains unknown?**
   - unresolved semantic ambiguity;
   - incomplete provenance;
   - absent historical cases;
   - novelty questions;
   - missing external replication.

6. **What should change next?**
   - research questions;
   - protocol changes;
   - instrumentation needs;
   - candidate experiments.

## Evidence discipline

The monthly audit must keep these levels separate:

1. repository fact;
2. modelling/design assumption;
3. mechanical result;
4. historical observation;
5. interpretation;
6. generalisation.

A repeated interpretation is not additional evidence.

An agent output is not evidence unless it points to inspectable supporting material.

A failed or negative result is retained.

## Agent audit note format

Curated monthly notes live at:

`research/monthly-audits/YYYY-MM.md`

Recommended structure:

```md
## Agent Scientific Audit

### Questions examined
...

### Evidence and artefacts inspected
...

### Findings
...

### Claims strengthened
...

### Claims weakened or rejected
...

### Open uncertainties
...

### Proposed next probes
...

### Agent-use disclosure
...
```

The file is deliberately plain Markdown so it can be written by humans or agents and audited in Git history.

## Publication

The monthly audit is appended to the public entry under `/log/YYYY-MM/`.

The automatic log generator still records repository metrics and activity. The curated audit provides the scientific interpretation layer.

The two must remain distinguishable:

- automatic metrics describe what changed;
- the audit explains what was examined and what conclusions are currently defensible.

## Relationship to papers

A paper is optional.

Monthly scientific audits are the primary continuity mechanism.

If a sequence of audits eventually reveals a novel, robust and reproducible result, a paper may be derived from those records. The publication must not become the reason the underlying project is modified.

Research first. Publication second.
