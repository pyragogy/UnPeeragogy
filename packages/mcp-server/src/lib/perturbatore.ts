/**
 * Agente Perturbatore — API Hetzner Inference (OpenAI-compatible)
 *
 * Sostituisce il keyword-based friction generator con una chiamata live
 * a GLM-5.2 (reasoning_effort: max) su Hetzner — costo $0, latenza voluta
 * come phase shift cognitivo.
 *
 * Environment:
 *   HETZNER_API_KEY            — token da experiments.hetzner.com
 *   HETZNER_INFERENCE_API_KEY  — alias alternativo
 *   PERTURBATORE_MODEL         — model id (default: GLM-5.2-NVFP4)
 *   PERTURBATORE_REASONING     — reasoning_effort (default: max)
 */

const HETZNER_BASE_URL = "https://inference.hetzner.com/api/v1";

function getApiKey(): string | null {
  return (
    process.env.HETZNER_API_KEY ??
    process.env.HETZNER_INFERENCE_API_KEY ??
    null
  );
}

function getModel(): string {
  return process.env.PERTURBATORE_MODEL || "GLM-5.2-NVFP4";
}

function getReasoningEffort(): string {
  return process.env.PERTURBATORE_REASONING || "max";
}

export interface PerturbatoreInput {
  /** Il field report, pattern o argomento da analizzare */
  topic: string;
  /** Contesto aggiuntivo (testo della teoria peeragogy, se disponibile) */
  theoryContext?: string;
  /** Intensità dell'attrito */
  mode?: "soft" | "hard" | "max";
}

export interface PerturbatoreOutput {
  analysis: string;
  reasoning?: string;
  model: string;
  durationMs: number;
  error?: string;
}

export interface PerturbatoreConfig {
  apiKey: string;
  model?: string;
  reasoningEffort?: string;
}

const SYSTEM_PROMPT_HARD = `Sei l'Agente Perturbatore del Pattern — la voce critica nativa di Unpeeragogy.

Il tuo compito è iniettare frizione cognitiva e disallineamento in ogni analisi.

REGOLE:
- Parla in italiano. Sii tagliente, concreto, operativo.
- Zero formalismi. Zero ringraziamenti. Zero "grazie per aver condiviso".
- NESSUNA soluzione facile. NESSUN consenso.
- Identifica gli antipattern PER NOME: conformismo teorico, astrazione prematura, generalizzazione oltre il contesto, narrative di armonia che nascondono asimmetrie di potere.
- Se un'assunzione è debole, chiamala per nome.
- Se la teoria suona bene ma non regge il contatto con la realtà, dillo esplicitamente.
- Usa riferimenti a failure pattern noti: premature abstraction, leaky abstraction, cargo cult, ivory tower, survivorship bias.
- Ogni analisi deve contenere ALMENO UNA DOMANDA APERTA — una domanda che solo l'esperienza diretta può rispondere.

La qualità nasce dall'attrito, non dal consenso. Se tutto sembra funzionare, non stai guardando abbastanza a fondo.`;

const SYSTEM_PROMPT_MAX = SYSTEM_PROMPT_HARD + `\n\nMODALITÀ MAX: Devi produrre un'analisi volutamente prolissa, tortuosa, con digressioni. La lunghezza del ragionamento È il messaggio. Non condensare. Fai sentire il peso cognitivo del disallineamento.`;

function buildSystemPrompt(mode: "soft" | "hard" | "max"): string {
  if (mode === "max") return SYSTEM_PROMPT_MAX;
  if (mode === "hard") return SYSTEM_PROMPT_HARD;
  // soft: slightly milder version
  return SYSTEM_PROMPT_HARD + `\n\nModalità soft: mantieni l'attrito ma sii più diretto. Meno verbose, più chirurgico.`;
}

function buildUserPrompt(input: PerturbatoreInput): string {
  let prompt = `Analizza il seguente contenuto con attrito strutturale.\n\n`;

  if (input.theoryContext) {
    prompt += `## Contesto Teorico\n${input.theoryContext}\n\n`;
  }

  prompt += `## Materiale da Analizzare\n${input.topic}\n\n`;
  prompt += `### Richiesta Specifica\n`;
  prompt += `1. Identifica le assunzioni deboli o non verificate\n`;
  prompt += `2. Nomina i pattern di fallimento ricorrenti\n`;
  prompt += `3. Misura la tensione tra teoria e realtà operativa\n`;
  prompt += `4. Formula UNA domanda aperta — che solo l'esperienza diretta può rispondere\n`;
  prompt += `5. Se applicabile, suggerisci un Failure Vector specifico\n`;

  return prompt;
}

/**
 * Chiamata sincrona all'API Hetzner Inference.
 */
export async function callPerturbatore(
  input: PerturbatoreInput,
  config?: PerturbatoreConfig
): Promise<PerturbatoreOutput> {
  const apiKey = config?.apiKey ?? getApiKey();
  if (!apiKey) {
    return {
      analysis: "",
      model: "none",
      durationMs: 0,
      error: "HETZNER_API_KEY non configurata. Imposta la variabile d'ambiente o passa una config.",
    };
  }

  const model = config?.model ?? getModel();
  const reasoningEffort = config?.reasoningEffort ?? getReasoningEffort();
  const mode = input.mode ?? "hard";
  const startTime = Date.now();

  try {
    const body: Record<string, unknown> = {
      model,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(mode),
        },
        {
          role: "user",
          content: buildUserPrompt(input),
        },
      ],
    };

    // reasoning_effort: GLM-5.2 supporta none/high/max
    const supportsReasoning = ["GLM-5.2-NVFP4", "DeepSeek-V4-Flash-0731"].some(
      (m) => model.includes(m)
    );
    if (supportsReasoning) {
      body.reasoning_effort = reasoningEffort;
    }

    const response = await fetch(`${HETZNER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "unpeeragogy-perturbatore/0.1.0",
      },
      body: JSON.stringify(body),
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        analysis: "",
        model,
        durationMs,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = (await response.json()) as {
      choices: Array<{
        message: {
          content?: string;
          reasoning?: string;
        };
      }>;
    };

    const choice = data.choices?.[0];
    const analysis = choice?.message?.content ?? "(nessuna risposta)";
    const reasoning = choice?.message?.reasoning;

    return {
      analysis,
      reasoning,
      model,
      durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    return {
      analysis: "",
      model,
      durationMs,
      error: message,
    };
  }
}

/**
 * Verifica se l'API key è configurata.
 */
export function isPerturbatoreEnabled(): boolean {
  return getApiKey() !== null;
}