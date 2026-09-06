#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Agente Perturbatore — Test DeepSeek-V4-Flash su Hetzner
# ═══════════════════════════════════════════════════════════════
# Uso:  export HETZNER_API_KEY="<token>"
#       bash scripts/perturbatore-test.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

API_KEY="${HETZNER_API_KEY:-${HETZNER_INFERENCE_API_KEY:-}}"
if [ -z "$API_KEY" ]; then
  echo "❌  HETZNER_API_KEY non impostata."
  echo "    export HETZNER_API_KEY=\"<token-da-experiments.hetzner.com>\""
  exit 1
fi

FIELD_REPORT=$(cat <<'ENDREPORT'
### The Assumption

The coworking story illustrates how peeragogic principles can transform workplace dynamics through collaborative learning and shared decision-making, creating environments where traditional hierarchies dissolve into peer-based cooperation. The pattern can replicate across contexts.

### Operational Reality

Julian walks into the housing association boardroom with a folder of peeragogical principles and finds twelve people who need to cut pound 2.3 million from next year's budget. The government changed the benefits formula. Construction loans dried up. Three board members represent tenant groups who will lose services.

Not collaboration theory. Not consensus building. Not dissolved hierarchies.

The work happens in the space between what sounds good in principle and what survives contact with a spreadsheet. Julian's approach assumes the luxury of exploration. But when you are managing 4,000 housing units and the funding model just collapsed, exploration feels like procrastination.
ENDREPORT
)

echo "============================================="
echo "  Agente Perturbatore su Hetzner Inference"
echo "  Modello: DeepSeek-V4-Flash-0731"
echo "  Costo: \$0 (experimental)"
echo "============================================="
echo ""
echo "Field Report: coworking-story.mdx"
echo ""

START_TIME=$(date +%s)

JSON=$(jq -n \
  --arg model "DeepSeek-V4-Flash-0731" \
  --arg system "Sei l Agente Perturbatore del Pattern. Il tuo compito e iniettare frizione cognitiva in ogni analisi. Parla in italiano, sii tagliente, concreto. Identifica gli antipattern: conformismo teorico, astrazione prematura, generalizzazione oltre il contesto, narrative di armonia che nascondono asimmetrie di potere. Non offrire soluzioni facili." \
  --arg user "Analizza il Field Report qui sotto. Identifica: 1) Assunzioni deboli 2) Pattern di fallimento 3) Tensione teoria/realtà 4) Una domanda aperta.\n\n---\n\n$FIELD_REPORT" \
  '{
    model: $model,
    reasoning_effort: "high",
    max_tokens: 2048,
    messages: [
      {role: "system", content: $system},
      {role: "user", content: $user}
    ]
  }'
)

echo "Invio richiesta a DeepSeek-V4-Flash..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  https://inference.hetzner.com/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "$JSON"
)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "Risposta in ${DURATION}s (HTTP ${HTTP_CODE})"
echo ""

if [ "${HTTP_CODE}" = "200" ]; then
  echo "============================================="
  echo "  RISPOSTA DEL PERTURBATORE"
  echo "============================================="
  echo ""
  echo "$BODY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
choice = data['choices'][0]
msg = choice['message']
if msg.get('reasoning'):
    print('--- reasoning ---')
    print(msg['reasoning'])
    print('-----------------')
    print()
print(msg['content'])
" 2>&1
else
  echo "ERRORE (HTTP ${HTTP_CODE}):"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi

echo ""
echo "============================================="
echo "  FINE TEST"
echo "============================================="