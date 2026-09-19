## Context

`.claude/rules/frontend/i18n.md` a été écrite pendant l'initialisation du
projet, avant l'intégration effective de Transloco. Elle n'a pas été mise à
jour depuis. Le code réel (`contribo-front/package.json`,
`src/app/app.config.ts`, `src/app/core/i18n/transloco-http.loader.ts`,
`src/assets/i18n/fr.json`) montre que Transloco est en place depuis T-3 et
utilisé dans au moins sept features. La revue de la PR #61 (T-96) a mis en
évidence l'écart : un agent a codé du texte français en dur dans
`my-dues.html` en s'appuyant sur la règle obsolète, alors que le fichier
voisin `profile-page.html` du même diff utilise déjà `| transloco`.

## Goals / Non-Goals

**Goals :**
- Aligner la règle documentée sur l'état réel du code (Transloco en place).
- Donner une consigne claire : les nouveaux libellés d'interface passent par
  des clés Transloco dans `fr.json`, en réutilisant une clé existante quand
  le libellé est déjà présent ailleurs.
- Limiter le périmètre à `fr.json` : ne pas demander aux agents de maintenir
  `en.json` ou une autre langue.

**Non-Goals :**
- Ne pas migrer automatiquement les libellés déjà en dur dans les vues
  existantes (hors périmètre de ce ticket documentaire).
- Ne pas ajouter de sélecteur de langue ni de deuxième langue active.
- Ne pas corriger ici les PR #59/#60/#61 : ce ticket ne fait que corriger la
  règle ; les corrections de PR se font sur leurs propres branches/tickets.

## Decisions

- **Corriger `i18n.md` plutôt que le documenter ailleurs** : c'est le seul
  fichier de règle chargé pour le périmètre `contribo-front/src/**`, donc
  l'endroit le plus fiable pour être lu avant toute modification de vue.
- **Ne pas exiger `en.json`** : `app.config.ts` ne déclare que `fr` dans
  `availableLangs`, et le mainteneur a indiqué vouloir générer les autres
  langues lui-même en fin de projet. Anticiper `en.json` créerait un fichier
  non maintenu et potentiellement incohérent.
- **Continuer d'autoriser les contenus métier saisis par l'association**
  (noms, catégories, fonctions, titres, descriptions) hors clés Transloco :
  ce ne sont pas des libellés d'interface, la règle existante sur ce point
  reste valable et n'est pas modifiée.

## Risks / Trade-offs

- [Risque] Des vues déjà livrées avec du texte en dur restent incohérentes
  avec la nouvelle règle tant qu'elles ne sont pas retouchées. → Mitigation :
  assumé en Non-Goals ; correction au fil des tickets qui touchent ces vues,
  en commençant par les PR de revue en cours si le mainteneur le demande.
- [Risque] Un agent pourrait sur-interpréter la règle et vouloir créer
  `en.json` par anticipation. → Mitigation : la règle précise explicitement
  que seul `fr.json` est maintenu par les agents.
