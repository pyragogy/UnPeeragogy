# Pyragogy Engine — SWARM Architecture & Implementation Plan

> **Versione:** 0.2.0 (post tripla peer review: Claude → Gemini → Kimi)
> **Stato:** Piano validato, GO per implementazione
> **Motto:** The model may propose. The evidence must dispose.
> **Stima:** ~22h totali (6 mosse, con checkpoint ogni 2h)
> **Nodo pilota:** `cooperation` (tension_index 1.6, copertura duale, failure vector densi)

---

## Indice

1. [Visione e Contesto](#1-visione-e-contesto)
2. [Scelte Architetturali](#2-scelte-architetturali)
3. [I 5 Agenti Epistemici](#3-i-5-agenti-epistemici)
4. [Schema Directory](#4-schema-directory)
5. [Contratti Pydantic (Schemi I/O)](#5-contratti-pydantic-schemi-io)
6. [Dual-Loop Orchestration](#6-dual-loop-orchestration)
7. [Reproducibility & Scientific Manifest](#7-reproducibility--scientific-manifest)
8. [Observability & Metrics](#8-observability--metrics)
9. [Safety & Rollback](#9-safety--rollback)
10. [Adversarial Validation Suite](#10-adversarial-validation-suite)
11. [Piano di Implementazione (6 Mosse)](#11-piano-di-implementazione-6-mosse)
12. [Appendice: Domande Aperte](#12-appendice-domande-aperte)

---

## 1. Visione e Contesto

### 1.1 Perché

Unpeeragogy è un **protocollo di validazione per conoscenza sociale**. Il suo Vault contiene 88+3 nodi di conoscenza (pattern teorici + anti-pattern operativi), ma la validazione è attualmente *manuale e statica*: tension_index pre-calcolati da uno script keyword-based, nessun feedback loop sistematico.

Il Pyragogy Engine è il **primo motore multi-agente progettato per stress-testare empiricamente un corpus di conoscenza sociale**, usando il Vault come griglia teorica per interrogare la memoria storica del mondo codificata nei modelli LLM.

### 1.2 Obiettivo

Costruire un engine batch CLI in grado di:

1. **Interpretare** il nodo — estrarre incidenti critici (CIT) e configurazioni CMOC
2. **Cercare evidenza empirica** — recuperare dalla memoria parametrica del modello casi, studi e fenomeni pertinenti
3. **Verificare** ogni candidato di evidenza contro fonti verificabili (Grounding Gate)
4. **Validare** l'evidenza groundata, distinguendo segnale da rumore
5. **Calcolare** un nuovo tension_index deterministico basato su attrito misurato
6. **Sintetizzare** un blocco a 4 livelli (Source, Observation, Interpretation, Failure Mode)
7. **Scoprire** gap di copertura e candidare nuovi nodi

### 1.3 Attori

| Ruolo | Chi | Funzione |
|-------|-----|----------|
| **Visione** | Fabrizio | Direzione, selezione output, pubblicazione |
| **Architetto metodologico** | Gemini (Google) | Validazione epistemologica, review dei prompt |
| **Reviewer ingegneristico** | Claude (Anthropic) | Contratti, caching, circuit breaker, staging |
| **Reviewer di fattibilità** | Kimi (Moonshot) | Validazione piano, stime, aggiunte strutturali |
| **Coding Agent** | Pi | Implementazione |

### 1.4 Sistema esistente (da non riscrivere)

| Componente | Tecnologia | Percorso |
|-----------|-----------|----------|
| Sito web | Astro 5 + Tailwind + Alpine.js | `src/` |
| Collezione peeragogy | MDX (88 file) | `src/content/peeragogy/` |
| Collezione unpeeragogy | MDX (88 file) | `src/content/unpeeragogy/` |
| Frontmatter YAML | title, order, section, readingTime, tension_index, tags, origin | Ogni file .mdx |
| Tension index statico | Keywords-based, pre-calcolato | `scripts/calculate-tension-index.js` |
| MCP server | TypeScript, SSE su 3001 | `packages/mcp-server/` |
| Grafo conoscenza | d3-force, API route | `src/pages/api/graph.json.ts` |

### 1.5 Gap attuali

- 3 slug peeragogy senza controparte unpeeragogy (cooperate, cooperation-where-it-works, newcomer-where-it-works)
- 0 slug unpeeragogy senza controparte peeragogy
- Tension_index calcolato con euristica keyword-based, non con attrito misurato
- Nessun feedback loop sistemico tra field reports e aggiornamento dei nodi

---

## 2. Scelte Architetturali

### 2.1 Stack

| Layer | Tecnologia | Motivazione |
|-------|-----------|-------------|
| **Engine** | Python 3.11+ | pydantic + instructor per structured output, httpx/aiohttp, ecosistema ML futuro |
| **MCP Server** | TypeScript (esistente) | Nessuna modifica. Serve come data layer interrogabile |
| **CLI** | Typer (Python) | Zero overhead, autocompletamento, help nativo |
| **Cache** | diskcache (Python) | Persistenza su disco, chiavi deterministiche |
| **Checkpoint** | SQLite | Zero configurazione, resume nativo |
| **LLM Provider** | OpenRouter | Accesso eterogeneo a 300+ modelli, fallback nativo |

### 2.2 Accesso ai dati: MCP-First

L'engine interroga il server MCP locale come **data layer primario**:

```
Engine → MCP Client (aiohttp + aiohttp_sse_client) → MCP Server (SSE :3001) → filesystem
```

- **MCP online:** chiamate HTTP SSE strutturate
- **MCP offline:** fallback read-only su filesystem (`src/content/`)
- **Scritture:** Mai su filesystem — solo su `engine/output/`
- **Mutazione Vault:** Solo via `apply-delta.py` → commit Git strutturato

### 2.3 Persistenza: Layer esterno

- **Tension_index** non muta mai i file .mdx a caldo
- Ogni run produce output JSON in `engine/output/runs/{run_id}/`
- `apply-delta.py` genera un commit Git con backup automatico
- Il Vault Astro è la **source of truth** per contenuti pubblici
- `engine/output/` è la **source of truth** per risultati dell'engine

### 2.4 Pipeline: Incrementale con checkpoint

- Processa 1 nodo per run (default), con flag `--all` per batch
- Checkpoint SQLite per resume: se crash, riparte dall'ultimo agente completato
- Cache L1 (content hash): se file MDX invariato, skip intera pipeline
- Cache L2 (agent output): se prompt + nodo + agente identici, output in cache
- **Cache L3 eliminata** per non-determinismo dei provider LLM (review Kimi)

### 2.5 Agenti: 1 dispatcher + 5 implementazioni

- `BaseAgent` (classe astratta): boilerplate unico (client LLM, retry, logging)
- 5 agenti concreti: estendono BaseAgent, implementano `build_prompt()` e `validate_output()`
- Nessuna separazione in processi distinti — tutti nello stesso runtime
- Aggiungere un sesto agente = 1 file Python + 1 file prompt

### 2.6 Dual Grounding

| Livello | Fonte | Vincolo | Schema |
|---------|-------|---------|--------|
| `vault-sourced` | Testo del Vault (citazione diretta) | `source_ref` obbligatorio (file:§paragrafo) | `CITIncident.source_type = "vault-sourced"` |
| `empirical-analogy` | Pesi dell'LLM (memoria storica) | `project_ref` obbligatorio (es. "debian:2014") | `CITIncident.source_type = "empirical-analogy"` |

**Regola A1:** Le analogie empiriche devono essere accompagnate da `project_ref` nel formato `"progetto:anno"`. Senza, il GroundingVerifier scarta l'incidente.

---

## 3. I 5 Agenti Epistemici

### 3.1 Panoramica

| # | Nome | Ruolo | Modello | Temperature | Costo/nodo |
|---|------|-------|---------|-------------|------------|
| A1 | RealistExtractor | Estrae CIT + CMOC + CoverageGap | `gpt-4o-mini` | 0.3 | ~$0.008 |
| A2 | EvidenceHunter | Cerca e ricostruisce evidenza empirica (parametric recall + evidence retrieval) | `deepseek/deepseek-r1-distill-qwen-32b` | 0.6 | ~$0.012 |
| A3 | EmpiricalSkeptic | Valida obiezioni, circuit breaker | `gpt-4o` | 0.2 | ~$0.015 |
| A4 | TensionEvaluator | Calcola ΔT deterministico | `deepseek/deepseek-chat` | 0.1 | ~$0.005 |
| A5 | ObliqueSynthesizer | Blocco 4 livelli + voce perturbatore | `claude-3.5-sonnet` | 0.5 | ~$0.007 |

**Costo stimato totale (88 nodi):** ~$3.90 (modelli cheap)  
**Fallback A2:** Se DeepSeek-R1-distill non disponibile → Claude 3.5 Sonnet (nessuna 2-fase)

### 3.2 A1 — RealistExtractor

```python
class A1_RealistExtractor(BaseAgent):
    agent_name = "A1"
    prompt_file = "A1_extractor_v1.md"
    model_config = LLMConfig(model="openai/gpt-4o-mini", temperature=0.3, max_tokens=2000)
    output_schema = tuple[list[CITIncident], list[CoverageGap]]
```

**Input:** Testo grezzo del nodo + empirical_breadth ∈ [0, 1]
**Output:** CITIncident[] + CoverageGap[]
**Vincoli:**
- Ogni incidente ha `source_ref` verificabile
- Se `source_type = "empirical-analogy"`, `project_ref` è obbligatorio
- CoverageGap segnala pattern peeragogy senza controparte unpeeragogy (e viceversa)

### 3.3 A2 — EvidenceHunter

```python
class A2_EvidenceHunter(BaseAgent):
    agent_name = "A2"
    prompt_file = "A2_evidence_hunter_v1.md"
    model_config = LLMConfig(model="deepseek/deepseek-r1-distill-qwen-32b", temperature=0.6, max_tokens=2500)
    output_schema = list[EvidenceCandidate]
```

**Epistemic Isolation:** NON riceve `context` o `confidence` di A1. Riceve solo:
- Testo grezzo del nodo
- `incident_id` da A1 (senza contesto)

**Mandato triplo:**
1. **Parametric recall** — cosa sa il modello su questo fenomeno?
2. **Evidence classification** — il candidato conferma, complica, contraddice o è ambiguo?
3. **Verification path** — dove cercare conferma?

**Classificazione fenomeni:** `confirming`, `complicating`, `contradicting`, `ambiguous`

**Vincolo critico:** Ogni candidato ha `recall_confidence` (0.0-1.0) che indica quanto il modello è sicuro di aver recuperato accuratamente il caso, NON quanto è vera l'evidenza. Il GroundingVerifier scarta tutto ciò che non ha `grounded_in_source=True` e un `source_ref` verificabile.

### 3.4 A3 — EmpiricalSkeptic

```python
class A3_EmpiricalSkeptic(BaseAgent):
    agent_name = "A3"
    prompt_file = "A3_skeptic_v1.md"
    model_config = LLMConfig(model="openai/gpt-4o", temperature=0.2, max_tokens=1500)
    output_schema = list[Verdict]
```

**Input:** CITIncident[] + EvidenceCandidate[] (solo candidati passati dal grounding gate)
**Output:** Verdict[] (uno per candidato)
**Soglie:**
- `plausibility < 0.3` → `rejected`
- `noise_estimate > 0.7` → `degraded`
- **Se tutti i candidati sono rejected → circuit breaker attivato** → pipeline fermata

### 3.5 A4 — TensionEvaluator

```python
class A4_TensionEvaluator(BaseAgent):
    agent_name = "A4"
    prompt_file = "A4_tension_v1.md"
    model_config = LLMConfig(model="deepseek/deepseek-chat", temperature=0.1, max_tokens=1000)
    output_schema = TensionDelta
```

**Formula:**
```
Δ = avg_plausibility_A3 · avg_asymmetry_A2 · (1 - rejection_rate)
T_new = clamp(T_old + Δ, 1.0, 2.0)
```

**Output:** `TensionDelta` con `old_tension`, `new_tension`, `delta`, `formula`, `hyperparams`

### 3.6 A5 — ObliqueSynthesizer

```python
class A5_ObliqueSynthesizer(BaseAgent):
    agent_name = "A5"
    prompt_file = "A5_synthesizer_v1.md"
    model_config = LLMConfig(model="claude-3.5-sonnet", temperature=0.5, max_tokens=2000)
    output_schema = ObliqueBlock
```

**Input:** Tutto il contesto del nodo (output A1, obiezioni migliori di A2, verdict A3, ΔT A4)
**Output:** `ObliqueBlock` a 4 livelli:
1. **Source** — citazione diretta dal documento
2. **Observation** — cosa si osserva senza interpretare
3. **Interpretation** — costruzione teorica dell'osservazione
4. **Failure Mode** — il modo specifico in cui fallisce (≠ conclusione)

---

## 4. Schema Directory

```
engine/
├── pyproject.toml              # Poetry: dipendenze + versione
├── .env.example                # OPENROUTER_API_KEY, MCP_URL, MCP_AUTH_TOKEN
├── .gitignore                  # engine/.cache/, engine/output/
│
├── engine/
│   ├── __init__.py
│   ├── main.py                 # CLI Typer: run-node, run-batch, apply-delta, rollback, test, status
│   ├── dispatcher.py           # Orchestratore a doppio anello
│   ├── base_agent.py           # Classe astratta BaseAgent
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── A1_extractor.py
│   │   ├── A2_perturbator.py
│   │   ├── A3_skeptic.py
│   │   ├── A4_tension.py
│   │   └── A5_synthesizer.py
│   │
│   ├── schemas/                # Pydantic (extra="forbid", str_to_lower=True)
│   │   ├── __init__.py
│   │   ├── incident.py         # CITIncident, CMOCConfig, CoverageGap
│   │   ├── perturbation.py     # ObliqueObjection
│   │   ├── skeptic.py          # Verdict, Loop1Result
│   │   ├── tension.py          # TensionDelta
│   │   └── synthesis.py        # ObliqueBlock
│   │
│   ├── prompts/                # Git-tracked, versionati
│   │   ├── registry.yaml       # Metadata + SHA-256 di ogni prompt
│   │   ├── A1_extractor_v1.md
│   │   ├── A2_perturbator_v1.md
│   │   ├── A3_skeptic_v1.md
│   │   ├── A4_tension_v1.md
│   │   └── A5_synthesizer_v1.md
│   │
│   ├── lib/
│   │   ├── __init__.py
│   │   ├── openrouter.py       # Client LLM con instructor + tenacity
│   │   ├── mcp_client.py       # MCP client con aiohttp + aiohttp_sse_client
│   │   ├── cache.py            # Cache L1 (content hash) + L2 (agent output)
│   │   ├── checkpoint.py       # SQLite checkpoint manager (resume)
│   │   ├── grounding.py        # GroundingVerifier (gate hard tra A2 e A3)
│   │   ├── budget.py           # TokenBudget (costo cumulativo, soglia abort)
│   │   ├── ledger.py           # EpistemicLedger (append-only audit trail)
│   │   └── health.py           # Health check all'avvio
│   │
│   ├── output/                 # gitignored
│   │   └── runs/
│   │       └── {run_id}/
│   │           ├── manifest.json        # Scientific Manifest
│   │           ├── metrics.json         # Observability metrics
│   │           ├── audit/               # Audit trail (append-only JSONL)
│   │           ├── backUps/             # Backup frontmatter prima di apply-delta
│   │           └── {slug}.json          # RunResult per ogni nodo
│   │
│   └── .cache/                 # gitignored
│       ├── l1/                 # Content hash cache
│       ├── l2/                 # Agent output cache
│       └── checkpoints.db      # SQLite resume
│
├── scripts/
│   ├── setup.sh                # pip install, .env copia, mkdir
│   ├── health-check.py         # Verifica prerequisiti prima di run
│   └── apply-delta.py          # Mutazione controllata del vault
│
└── tests/
    ├── test_schemas.py         # Pydantic validation tests
    ├── test_agents.py          # Test harness per agent singoli
    └── adversarial/            # Nodi di controllo per AVS
        ├── neutral_lorem_ipsum.mdx
        ├── high_consensus_pattern.mdx
        └── contradictory_field_report.mdx
```

---

## 5. Contratti Pydantic (Schemi I/O)

### 5.1 `schemas/incident.py`

```python
class CITIncident(BaseModel):
    model_config = ConfigDict(extra="forbid", str_to_lower=True)
    
    incident_id: str = Field(..., pattern=r"^INC-\d{4}$")
    source_ref: str           # "peeragogy/cooperation.mdx:§3" o "empirical:debian-init-system:2014"
    source_type: Literal["vault-sourced", "empirical-analogy"]
    context: str = Field(..., max_length=200)
    mechanism: str
    outcome_valence: Literal["positive", "negative", "ambiguous"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    project_ref: str | None = Field(None, description="Obbligatorio se source_type=empirical-analogy, formato 'progetto:anno'")

class CMOCConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    context_factors: list[str] = Field(..., min_length=1, max_length=5)
    mechanism: str
    outcome: str
    moderators: list[str] = Field(default_factory=list, max_length=3)

class CoverageGap(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    slug: str
    missing_side: Literal["peeragogy", "unpeeragogy"]
    suggested_title: str | None = None
    empirical_evidence_hint: str | None = None
```

### 5.2 `schemas/perturbation.py`

```python
class ObliqueObjection(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    objection_id: str = Field(..., pattern=r"^OBJ-\d{4}$")
    target_incident_id: str
    objection_type: Literal[
        "missing-context", "reverse-causality", "survivorship-bias",
        "base-rate-neglect", "ecological-fallacy", "false-analogy",
        "anecdotal-over-generalization"
    ]
    asymmetry_score: float = Field(..., ge=0.0, le=1.0)
    grounded_in_source: bool      # Se False, scartato da Grounding Gate
    source_ref: str | None = None # Se grounded, da dove viene l'obiezione
```

### 5.3 `schemas/skeptic.py`

```python
class Verdict(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    objection_id: str
    plausibility_score: float = Field(..., ge=0.0, le=1.0)
    noise_estimate: float = Field(..., ge=0.0, le=1.0)
    verdict: Literal["accepted", "rejected", "degraded"]
    degradation_note: str | None = None

class Loop1Result(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    node_slug: str
    node_hash: str               # SHA-256 del file MDX
    prompt_version: str          # es. "A1_v1"
    incidents: list[CITIncident]
    objections: list[ObliqueObjection]
    verdicts: list[Verdict]
    all_rejected: bool           # Circuit breaker flag
    execution_time_ms: int
```

### 5.4 `schemas/tension.py`

```python
class TensionDelta(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    node_slug: str
    old_tension: float = Field(..., ge=1.0, le=2.0)
    new_tension: float = Field(..., ge=1.0, le=2.0)
    delta: float
    formula: str                  # "T_new = clamp(T_old + Δ, 1.0, 2.0)"
    hyperparams: dict             # {"alpha": 1.0, "beta": 0.5, "empirical_breadth": 0.3}
    hyperparams_hash: str
```

### 5.5 `schemas/synthesis.py`

```python
class ObliqueBlock(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    node_slug: str
    source: str                   # Citazione diretta
    observation: str              # Cosa si osserva senza interpretare
    interpretation: str           # Costruzione teorica
    failure_mode: str             # Modo specifico in cui fallisce
    perturbator_quote: str | None = None
```

---

## 6. Dual-Loop Orchestration

### 6.1 Schema

```
┌─────────────────────────────────────────────────────────────┐
│                      RUN_NODE(slug)                         │
│                                                             │
│  1. Cache check L1 (content hash) → skip se invariato       │
│  2. Carica nodo da MCP (frontmatter + body + T_old)         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              LOOP 1 — ESTRATTIVO-CRITICO            │    │
│  │                                                     │    │
│  │  A1 → CITIncident[] + CoverageGap[]                 │    │
│  │       ↓ checkpoint: "A1"                            │    │
│  │  A2 → ObliqueObjection[] (info isolation)           │    │
│  │       ↓ checkpoint: "A2"                            │    │
│  │  GroundingGate → scarta non-grounded                │    │
│  │       ↓ se < 2 obiezioni valide → STOP              │    │
│  │  A3 → Verdict[]                                     │    │
│  │       ↓ checkpoint: "A3"                            │    │
│  │       ↓ se all_rejected → INSUFFICIENT-FRICTION     │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                   [circuit breaker]                          │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              LOOP 2 — SINTETICO                     │    │
│  │                                                     │    │
│  │  A4 → TensionDelta                                  │    │
│  │       ↓ checkpoint: "A4"                            │    │
│  │  A5 → ObliqueBlock                                  │    │
│  │       ↓ checkpoint: "A5"                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  3. Salva RunResult in output/runs/{run_id}/{slug}.json     │
│  4. Aggiorna cache L2                                       │
│  5. Aggiorna manifest + metrics + audit ledger              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Circuit Breaker

Il Loop 2 (A4 → A5) **non viene eseguito** se:
- A3 ha rigettato tutte le obiezioni di A2 (`all_rejected = True`)
- Il GroundingVerifier ha scartato ≥ 2 obiezioni consecutive (`< 2 valide su 5`)
- Il costo cumulativo della run supera il 90% del budget

In questi casi, il nodo viene marcato `insufficient-friction` e il risultato parziale
viene comunque salvato per audit.

### 6.3 Empirical Breadth (parametro di controllo)

Definito a 3 livelli, controlla quanto A1 può spaziare nei pesi dell'LLM:

| Valore | Comportamento A1 |
|--------|------------------|
| `0.0` | "Usa SOLO il testo del Vault. Nessuna analogia esterna." |
| `0.5` | "Puoi citare analogie empiriche SOLO se supportate da project_ref verificabile nel formato 'progetto:anno'." |
| `1.0` | "Esplora liberamente analogie empiriche, ma marca ogni incidente come source_type='empirical-analogy' con project_ref obbligatorio." |

Default: `0.3` (prevalenza vault, analogie empiriche solo se molto evidenti).

---

## 7. Reproducibility & Scientific Manifest

### 7.1 Manifest per ogni run

`engine/output/runs/{run_id}/manifest.json`:

```json
{
  "run_id": "pilot-001",
  "timestamp": "2026-09-01T19:00:00Z",
  "engine_version": "0.1.0",
  "git_commit": "a1b2c3d",
  "input": {
    "slug": "cooperation",
    "file_hash": "sha256:abc...",
    "collection": "unpeeragogy"
  },
  "prompts": {
    "A1": {"version": "v1", "hash": "sha256:def..."},
    "A2": {"version": "v1", "hash": "sha256:ghi..."},
    "A3": {"version": "v1", "hash": "sha256:jkl..."},
    "A4": {"version": "v1", "hash": "sha256:mno..."},
    "A5": {"version": "v1", "hash": "sha256:pqr..."}
  },
  "models": {
    "A1": "openai/gpt-4o-mini-2024-07-18",
    "A2": "deepseek/deepseek-r1-distill-qwen-32b",
    "A3": "openai/gpt-4o-2024-08-06",
    "A4": "deepseek/deepseek-chat",
    "A5": "claude-3.5-sonnet-20241022"
  },
  "hyperparams": {
    "empirical_breadth": 0.3,
    "alpha": 1.0,
    "beta": 0.5,
    "grounding_min_objects": 2
  },
  "audit_log_hash": "sha256:stu...",
  "results": {
    "loop1_all_rejected": false,
    "grounding_dropped": 1,
    "circuit_breaker_triggered": false,
    "total_cost_usd": 0.047,
    "total_duration_sec": 45
  }
}
```

### 7.2 Audit Ledger (append-only)

```
engine/output/runs/{run_id}/audit/
├── 20260901_190312_A1_extractor.jsonl
├── 20260901_190320_A2_perturbator.jsonl
├── 20260901_190325_grounding_gate.jsonl
├── 20260901_190328_A3_skeptic.jsonl
├── 20260901_190335_A4_tension.jsonl
└── 20260901_190340_A5_synthesizer.jsonl
```

Formato (es. `A2_perturbator.jsonl`):

```jsonl
{"ts":"2026-09-01T19:03:12Z","agent":"A2","event":"started","input_hash":"sha256:abc..."}
{"ts":"2026-09-01T19:03:15Z","agent":"A2","event":"completed","output_hash":"sha256:def...","tokens_in":3200,"tokens_out":800,"cost_usd":0.012}
{"ts":"2026-09-01T19:03:15Z","agent":"A2","event":"grounding_gate","objections_in":5,"objections_out":4,"dropped_ids":["OBJ-0003"]}
```

**Regole rigorose:**
- Append-only. Nessun file viene mai sovrascritto.
- Ogni entry ha `input_hash` e `output_hash`.
- `manifest.json` include l'hash del file di audit concatenato.

### 7.3 Prompt Registry

`engine/prompts/registry.yaml`:

```yaml
prompts:
  - id: "A2-perturbator-v1"
    role: "A2_Perturbator"
    file: "A2_perturbator_v1.md"
    hash: "sha256:a1b2c3..."
    created: "2026-09-01"
    hypothesis: "Obiezioni di tipo 'missing-context' producono più tensione rispetto a 'false-analogy'"
    deprecated: false
    success_metrics:
      - "avg_asymmetry_score > 0.6"
      - "A3_rejection_rate < 0.4"
    hyperparams:
      alpha: 1.0
      beta: 0.5
      empirical_breadth: 0.3
```

---

## 8. Observability & Metrics

### 8.1 metrics.json

Ogni run genera `engine/output/runs/{run_id}/metrics.json`:

```json
{
  "run_id": "pilot-001",
  "total_nodes": 1,
  "total_cost_usd": 0.047,
  "total_tokens_in": 12500,
  "total_tokens_out": 3200,
  "total_duration_sec": 45,
  "agent_breakdown": {
    "A1": {"calls": 1, "cost": 0.008, "success": true, "latency_ms": 3200},
    "A2": {"calls": 1, "cost": 0.012, "success": true, "latency_ms": 5100},
    "A3": {"calls": 1, "cost": 0.015, "success": true, "latency_ms": 2800},
    "A4": {"calls": 1, "cost": 0.005, "success": true, "latency_ms": 1900},
    "A5": {"calls": 1, "cost": 0.007, "success": true, "latency_ms": 4100}
  },
  "circuit_breakers_triggered": 0,
  "grounding_gates_dropped": 1,
  "coverage_gaps_found": 0
}
```

### 8.2 Health Check

`engine/scripts/health-check.py` verifica all'avvio:
- MCP server raggiungibile (`GET /health` su `:3001`)
- OpenRouter API key valida (chiamata di test a `gpt-4o-mini`)
- Python versione ≥ 3.11
- Disco con >1GB libero in `engine/output/`
- Directory `engine/prompts/` leggibile e completa (tutti i prompt presenti)

---

## 9. Safety & Rollback

### 9.1 apply-delta: mutazione controllata

```bash
# 1. Simula (obbligatorio prima di --force)
python -m engine.main apply-delta --run-id batch-001 --dry-run

# 2. Applica (con backup automatico)
python -m engine.main apply-delta --run-id batch-001 --force

# 3. Rollback (ripristina tutti i .bak)
python -m engine.main rollback --run-id batch-001
```

**Cosa fa apply-delta:**
1. Legge `engine/output/runs/{run_id}/tension_delta.json`
2. Per ogni TensionDelta:
   - Legge `src/content/unpeeragogy/{slug}.mdx`
   - Confronta `old_tension == frontmatter.tension_index` (se mismatch → segnala conflitto e salta)
   - Crea backup in `engine/output/runs/{run_id}/backups/{slug}.mdx.bak`
   - Riscrive frontmatter con `new_tension`
3. Genera commit Git con messaggio: `chore(engine): apply tension delta from run {run_id}`

**Non eseguito mai automaticamente.** Richiede `--force` esplicito.

### 9.2 Grounding Gate (hard gate tra A2 e A3)

Il GroundingVerifier non è informativo — **blocca la pipeline**:

```python
# In dispatcher.py, tra A2 e A3
grounded = [obj for obj in a2_output if obj.grounded_in_source and verifier.check(obj.source_ref)]
if len(grounded) < 2:
    checkpoint.mark_insufficient(node_slug, "insufficient-grounded-objections")
    ledger.append("grounding_gate", {"node_slug": node_slug, "dropped": len(a2_output) - len(grounded)})
    return RunResult(node_slug=node_slug, status="insufficient-friction")
```

### 9.3 Token Budget

```python
class TokenBudget(BaseModel):
    max_input_tokens_per_node: int = 8_000
    max_output_tokens_per_agent: int = 2_000
    max_total_cost_usd_per_run: float = 50.0
    model_tiers: dict[str, str] = {
        "A1": "openai/gpt-4o-mini",
        "A2": "deepseek/deepseek-r1-distill-qwen-32b",
        "A3": "openai/gpt-4o",
        "A4": "deepseek/deepseek-chat",
        "A5": "claude-3.5-sonnet",
    }
```

L'orchestratore calcola il costo stimato *prima* di ogni batch e abortisce se `estimated_cost > budget.remaining`.

---

## 10. Adversarial Validation Suite

### 10.1 Nodi di controllo

```
tests/adversarial/
├── neutral_lorem_ipsum.mdx           # Testo senza tensione → A2 deve produrre obiezioni deboli
├── high_consensus_pattern.mdx        # Pattern con alto consenso → A2 deve trovare asimmetria
└── contradictory_field_report.mdx    # Field report che contraddice la teoria → A3 deve accettare
```

### 10.2 Test harness

```bash
# Test singolo agente su fixture
python -m engine.test --agent A2 --fixture tests/adversarial/neutral_lorem_ipsum.mdx --prompt-version v1

# Test intera pipeline su nodo di controllo
python -m engine.test run --slug neutral-lorem --run-id avs-001
```

### 10.3 Assertions

```python
# tests/adversarial/test_perturbator_on_neutral_text.py
async def test_perturbator_on_neutral_text():
    """A2 deve produrre obiezioni deboli (asymmetry < 0.3) su testo neutro"""
    neutral_node = load_fixture("neutral_lorem_ipsum.mdx")
    result = await dispatcher.run_node("neutral-lorem", "test-av-001")
    assert all(obj.asymmetry_score < 0.3 for obj in result.A2.objections)

async def test_skeptic_rejects_weak_objections():
    """A3 deve rigettare >80% di obiezioni banali"""
    weak_objections = [ObliqueObjection(..., asymmetry_score=0.1)]
    verdicts = await A3.run(weak_objections)
    rate = sum(1 for v in verdicts if v.verdict == "rejected") / len(verdicts)
    assert rate > 0.8
```

---

## 11. Piano di Implementazione (6 Mosse)

### Mossa 0: SWARM_ARCHITECTURE.md (questo file) — 30min
- ✅ Già scritto

### Mossa 1: Setup ambiente + scheletro directory — 45min

| Task | Dettaglio |
|------|-----------|
| 1.1 | Creare directory `engine/` e sottodirectory con `__init__.py` stub |
| 1.2 | Scrivere `pyproject.toml` con dipendenze (pydantic, instructor, httpx, aiohttp, aiohttp-sse-client, typer, diskcache, tenacity, structlog, pytest) |
| 1.3 | Scrivere `.env.example` e `scripts/setup.sh` |
| 1.4 | Scrivere `.gitignore` per `engine/.cache/` e `engine/output/` |
| 1.5 | Scrivere `engine/__init__.py` e `engine/main.py` (CLI stub con Typer) |
| 1.6 | Scrivere `engine/base_agent.py` (classe astratta) |
| 1.7 | Scrivere `engine/agents/__init__.py` (import di tutti gli agenti) |
| 1.8 | Scrivere `engine/schemas/__init__.py` (import di tutti gli schemi) |
| 1.9 | Scrivere `engine/prompts/registry.yaml` (template vuoto) |
| 1.10 | Scrivere `engine/lib/__init__.py` |
| 1.11 | Eseguire `scripts/setup.sh` e verificare `python -m engine.main --help` |

### Mossa 2: Schemi Pydantic — 1.5h

| Task | Dettaglio |
|------|-----------|
| 2.1 | `schemas/incident.py`: CITIncident, CMOCConfig, CoverageGap |
| 2.2 | `schemas/perturbation.py`: ObliqueObjection |
| 2.3 | `schemas/skeptic.py`: Verdict, Loop1Result |
| 2.4 | `schemas/tension.py`: TensionDelta |
| 2.5 | `schemas/synthesis.py`: ObliqueBlock |
| 2.6 | `tests/test_schemas.py`: pytest per ogni schema (validazione, edge case) |

### Mossa 3: Librerie infrastrutturali — 3.5h

| Task | Dettaglio |
|------|-----------|
| 3.1 | `lib/openrouter.py`: OpenRouterClient con instructor, tenacity, logging |
| 3.2 | `lib/mcp_client.py`: MCPClient con aiohttp + aiohttp_sse_client |
| 3.3 | `lib/cache.py`: PipelineCache L1 + L2 (diskcache) |
| 3.4 | `lib/checkpoint.py`: CheckpointManager SQLite (get/save/resume) |
| 3.5 | `lib/grounding.py`: GroundingVerifier (gate hard) |
| 3.6 | `lib/budget.py`: TokenBudget (stima costo, abort) |
| 3.7 | `lib/ledger.py`: EpistemicLedger (append-only JSONL) |
| 3.8 | `lib/health.py`: Health check (MCP, API key, Python, disco) |

### Mossa 4: 5 Agenti + 5 Prompt — 6h

| Task | Dettaglio |
|------|-----------|
| 4.1 | Scrivere prompt A1 `A1_extractor_v1.md` |
| 4.2 | Implementare `agents/A1_extractor.py` |
| 4.3 | Scrivere prompt A2 `A2_perturbator_v1.md` |
| 4.4 | Implementare `agents/A2_perturbator.py` |
| 4.5 | Scrivere prompt A3 `A3_skeptic_v1.md` |
| 4.6 | Implementare `agents/A3_skeptic.py` |
| 4.7 | Scrivere prompt A4 `A4_tension_v1.md` |
| 4.8 | Implementare `agents/A4_tension.py` |
| 4.9 | Scrivere prompt A5 `A5_synthesizer_v1.md` |
| 4.10 | Implementare `agents/A5_synthesizer.py` |
| 4.11 | Aggiornare `prompts/registry.yaml` con hash |
| 4.12 | Test harness: `python -m engine.test --agent {A1..A5} --fixture cooperation.mdx` |

### Mossa 5: Dispatcher + CLI principale — 2.5h

| Task | Dettaglio |
|------|-----------|
| 5.1 | `dispatcher.py`: Dual-loop orchestration completa |
| 5.2 | `main.py`: Comandi run-node, run-batch, apply-delta, rollback, test, status |
| 5.3 | `scripts/health-check.py`: Verifica prerequisiti |
| 5.4 | `scripts/apply-delta.py`: Mutazione controllata con backup e rollback |

### Mossa 6: Test su nodo pilota + iterazione prompt — 8h

| Task | Dettaglio |
|------|-----------|
| 6.1 | Eseguire `python -m engine.main run-node --slug cooperation --run-id pilot-001 --empirical-breadth 0.3` |
| 6.2 | Valutare output: densità obiezioni, tasso accettazione A3, ΔT, qualità sintesi |
| 6.3 | Iterare prompt (massimo 3 cicli) |
| 6.4 | AVS: test su nodi di controllo (`neutral_lorem_ipsum`, `high_consensus_pattern`, `contradictory_field_report`) |
| 6.5 | Documentare risultati nel `README.md` dell'engine |

**Totale stimato: ~22h** (con checkpoint ogni 2h per ricalibrare)

---

## 12. Appendice: Domande Aperte

1. **Modello A2 su OpenRouter:** DeepSeek-R1-distill-32B è disponibile e stabile? Se no, fallback a Sonnet.

2. **MCP Server:** Va tenuto accesso per l'engine o va containerizzato insieme? (ipotesi: container separato, `docker-compose`)

3. **Pubblicazione:** L'engine produce output per pubblicazione tecnica. Serve un formato di export specifico (BibTeX, LaTeX)? O il JSON è sufficiente?

4. **Callback:** L'engine deve notificare a qualcuno (Slack, email, GitHub) quando una run è completata? O basta l'output su filesystem?

5. **Multilingua:** Il vault è in inglese. Serve interrogazione in altre lingue (es. IT per field reports)? Non ora — rimandato.

6. **Field Reports:** Come si integrano i field reports esistenti (GitHub Discussions) nella pipeline? Non ora — Fase C della roadmap.

---

*Fine del documento. Pronto per implementazione.*