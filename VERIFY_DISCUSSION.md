# Prompt di verifica — Sistema di discussione Unpeeragogy

Esegui tutte le verifiche in ordine. Ogni passaggio deve essere confermato prima di passare al successivo. Se trovi un errore, blocca e descrivi cosa manca.

## Repository
- Owner: `pyragogy`
- Repo: `UnPeeragogy`
- Branch: `main`
- Ultimo commit: `2b8ffd1` — "Discussion system redesign: two templates + field-reports category"

## Passaggi

### 1. Categoria su GitHub
Usa GraphQL per verificare che la categoria `field-reports` esista:

```graphql
query {
  repository(owner: "pyragogy", name: "UnPeeragogy") {
    discussionCategories(first: 20) {
      nodes { name slug isAnswerable }
    }
  }
}
```

- [ ] La categoria `Field reports → field-reports` deve essere presente
- [ ] `isAnswerable` deve essere `false` (open-ended discussion, non Q&A)
- [ ] Se manca: non procedere. Segnala che va creata da Settings → Discussions.

### 2. Template su GitHub
Verifica i file presenti nella directory `.github/DISCUSSION_TEMPLATE/`:

- [ ] `share-your-story.yml` esiste
- [ ] `structural-analysis.yml` esiste
- [ ] Il vecchio `unpeeragogy-discussion.yml` **non** esiste più
- [ ] I due file hanno label coerenti: entrambi includono `"field-reports"`, e rispettivamente `"story"` e `"analysis"`

Leggi entrambi i file e verifica:

**share-your-story.yml:**
- [ ] `name` inizia con "📖 Share your story"
- [ ] `labels` = `["field-reports", "story"]`
- [ ] `entry-slug` è required, placeholder lowercase `"e.g. newcomer"`
- [ ] `what-you-tried` required
- [ ] `what-happened` required
- [ ] `relation-to-theory` opzionale, con default `"Skip this — our job"`

**structural-analysis.yml:**
- [ ] `name` inizia con "🔍 Structural analysis"
- [ ] `labels` = `["field-reports", "analysis"]`
- [ ] `position` required, opzioni: Confirms, Extends, Contradicts, Question
- [ ] `suggested-impact` opzionale

### 3. Codice — occorrenze di "discussione"
Grep su tutto il repository (escludi node_modules e `.astro_astro`):

```bash
grep -rn "discussione" --include="*.astro" --include="*.ts" --include="*.yml" --include="*.yaml" --include="*.md" --include="*.mdx" .
```

- [ ] **Zero risultati**. Se trovi occorrenze, elencale e proponi la sostituzione con `field-reports`.

### 4. Componente SectionDiscussion.astro
Leggi `src/components/SectionDiscussion.astro`.

- [ ] `newDiscussionUrl` usa `category=field-reports`
- [ ] `existingDiscussionsUrl` filtra per `label%3Afield-reports+${slug}`
- [ ] Il titolo della sezione è "Field Report: {title}"
- [ ] Tre pulsanti presenti, in quest'ordine:
  1. `✏️ Share your story` (primario, bg-teal)
  2. `🔍 Structural analysis` (secondario, border)
  3. `📋 Browse field reports` (terziario, border)
- [ ] I primi due pulsanti puntano a `newDiscussionUrl`
- [ ] Il terzo punta a `existingDiscussionsUrl`
- [ ] L'help panel dice "Your post appears in GitHub Discussions with tag `field-reports`"
- [ ] Il testo "Share your story" appare nella copy (non "Start a discussion")
- [ ] Non ci sono riferimenti a "discussione" in nessuna stringa

### 5. URL diretto — test di funzionamento
Apri nel browser (o via curl con autenticazione):

```
https://github.com/pyragogy/UnPeeragogy/discussions/new?category=field-reports
```

- [ ] GitHub mostra il picker template con due opzioni
- [ ] La prima opzione è "📖 Share your story"
- [ ] La seconda opzione è "🔍 Structural analysis"
- [ ] Selezionando "Share your story" compare il form con i campi: entry-slug, context, what-you-tried, what-happened, takeaway, relation-to-theory
- [ ] Selezionando "Structural analysis" compare il form con: entry-slug, position, analysis, suggested-impact

### 6. Build del sito
```bash
cd /home/coder/project/unpeeragogy && npm run build
```

- [ ] Build passa senza errori
- [ ] Pagefind indicizza 96+ pages / 9300+ words

### 7. Consistenza dei link — verifica su pagina reale
Apri una pagina Unpeeragogy qualsiasi (es. `[...slug].astro`) e verifica che:

- [ ] `SectionDiscussion` è importato
- [ ] Il componente è montato nella colonna Unpeeragogy (destra)
- [ ] I parametri `slug` e `title` corrispondono all'entry corrente

## Esito finale
- Se tutti i check sono ✅: sistema funzionante. Conferma con messaggio "Sistema di discussione Unpeeragogy verificato e operativo."
- Se anche un solo check è ❌: **non dichiarare completato**. Descrivi il problema e la soluzione.