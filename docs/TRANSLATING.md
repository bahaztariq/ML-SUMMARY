# Translating ML Hub

The site ships in **English** (source, at `/`), **French** (`/fr`) and **Arabic** (`/ar`, right-to-left).
Anything without a translation falls back to English, so partial work never breaks a page.

## Style

- Audience: learners of machine learning. Clear, friendly, precise; same tone as the English.
- **French**: standard technical French as used in French-language ML courses (e.g. « apprentissage supervisé », « surapprentissage », « taux d'apprentissage », « arbre de décision », « forêt aléatoire »). Keep widely used English terms where French practitioners do (« boosting », « embedding », « dropout »), in italics only if the English source uses them that way. Use French typography: non-breaking space before `: ; ? !` and « guillemets ».
- **Arabic**: Modern Standard Arabic. Use established Arabic ML terminology (e.g. «التعلم الآلي»، «التعلم الخاضع للإشراف»، «الانحدار»، «التصنيف»، «معدل التعلم»، «الإفراط في التخصيص»). For a technical term on its **first use in a text**, add the English in parentheses: «الإفراط في التخصيص (overfitting)». Keep library, parameter and product names in Latin script (`scikit-learn`, `n_estimators`, XGBoost).
- Numbers: Western digits (0–9) in every language, so they match code and formulas.
- Keep the meaning, not the word order. Rewrite sentences so they read naturally.

## Glossary

Use these terms consistently (the site already does):

| English | Français | العربية |
|---|---|---|
| accuracy | exactitude | الدقة (الدقة الإجمالية) |
| precision | précision | الضبط |
| recall | rappel | الاستدعاء (alias: الحساسية) |
| feature | variable / caractéristique | ميزة، الميزات |
| overfitting / underfitting | surapprentissage / sous-apprentissage | الإفراط في التخصيص / نقص التخصيص |
| regularization | régularisation | التنظيم |
| learning rate | taux d'apprentissage | معدل التعلم |
| hyperparameter | hyperparamètre | المعاملات الفائقة |
| clustering | clustering / partitionnement | التجميع |
| embedding | embedding / plongement | التضمين |
| retrieval (RAG) | récupération | الاسترجاع |

Exceptions kept on purpose in Arabic: «خصائص ACID» (database properties) and the conventional name of the ROC curve, «منحنى خاصية تشغيل المستقبِل».

## Never translate

- Concept ids, track ids, question ids, URLs, `concept:` link targets.
- Code (`codeSnippet`), formulas (`math.formula`), parameter **names**, anything in backticks.
- Mermaid syntax: node ids, arrows, `flowchart LR`, brackets. Translate only the text inside the quotes of node labels (`A["…"]`) and edge labels (`-->|…|`). Keep every label in double quotes.
- Narration markup: keep `**bold**`, `*em*`, `` `code` ``, `[label](concept:id)` (translate the label only), blank lines between paragraphs and list markers.
- `{name}` placeholders in UI strings, and `${…}` expressions in template strings.

## Arrows and direction

UI strings use `common.arrowForward` / `common.arrowBack`; in Arabic these are `←` / `→` (forward points left). Don't hard-code `→` in translated text when it means "next"; when it means "leads to" (A → B), keep it.

## Where translations live

| Content | File | Shape |
|---|---|---|
| Interface strings | `src/lib/i18n/ui/fr.ts`, `ar.ts` | same keys as `en.ts` |
| A concept | `content/i18n/<lang>/<track>/<id>.js` | `export default { name, category, task, summary, intuition, whenToUse, whenToAvoid, requirements?, parameters: [{ impact, tuningTip }…] (same order), math: { loss?, explanation? }, pros, cons, diagram }` |
| Tracks, paths, roadmap | `content/i18n/<lang>/site.js` | `{ tracks: { id: label }, paths: { id: { title, goal } }, roadmap: { stageId: { title, goal, milestones: [titles…] } } }` |
| A lesson's narration | `src/lib/explainers/<lesson>/i18n.ts` → set `i18n` on the module in `index.ts` | `{ fr: { title, steps: [ { title, body, task: { prompt }, quiz: { question, options, explain } } … ] }, ar: {…} }` — same indices as the English steps; `body`/`prompt`/`explain` may be `(s) => string` to keep live numbers |
| Strings inside a lesson scene or a page | a `local({ en: {…}, fr: {…}, ar: {…} })` dictionary in that component (`#lib/i18n/index.svelte.ts`) | call `L('key')` where the string was |
| Quiz questions | `content/quiz/<topic>.js` | every question carries `en`, `fr`, `ar` side by side |

Concept files: include only translatable fields (the English file stays the source of ids, links, code and formulas). `requirements` only needs keys whose value is a string.

## Verify

```bash
node tools/validate.js          # quiz bank + content checks (warns about missing translations)
npx vitest run                  # unit tests
npx svelte-check                # types
npm run dev                     # then open /fr/... and /ar/... and read the pages
```
