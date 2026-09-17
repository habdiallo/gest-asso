## Why

La règle `.claude/rules/frontend/i18n.md` affirme "Aucun outil de traduction
n'est installé ou configuré" et interdit d'introduire un pipe de traduction.
Or Transloco (`@jsverse/transloco`) est installé depuis le ticket T-3 (écran
de connexion), configuré dans `app.config.ts` (`availableLangs: ['fr']`,
`defaultLang: 'fr'`) et déjà utilisé dans plusieurs features (auth, dashboard,
members, roles-users, social-funds). La règle obsolète a conduit un agent à
coder du texte français en dur dans une nouvelle vue (`my-dues.html`, PR #61)
au lieu de réutiliser le pattern Transloco déjà établi dans le même fichier
voisin (`profile-page.html`). Corriger la règle pour refléter l'état réel du
code et éviter que cette confusion se reproduise.

## What Changes

- Mettre à jour `.claude/rules/frontend/i18n.md` : Transloco est l'outil de
  traduction du projet, les nouveaux libellés doivent passer par des clés
  Transloco dans `contribo-front/src/assets/i18n/fr.json` plutôt que du texte
  en dur dans les templates, en réutilisant les clés existantes quand un
  libellé équivalent est déjà présent.
- Préciser que seul `fr.json` est maintenu par les agents pour l'instant
  (`availableLangs: ['fr']`) : ne pas créer ou anticiper `en.json` ni
  d'autres langues, le mainteneur s'en chargera lui-même en fin de projet.
- Garder les autres règles inchangées (mapping des enums API vers le
  français, montants GNF, dates, décision d'erreur sur `code`).

## Capabilities

### New Capabilities
- `regle-i18n-frontend` : règle de rédaction frontend documentant l'usage de
  Transloco pour les libellés d'interface.

### Modified Capabilities
(aucune capacité applicative modifiée : correction de règle de contribution)

## Impact

- `.claude/rules/frontend/i18n.md` : correction du contenu de la règle.
- Aucun impact sur le code applicatif, les tests ou la CI dans ce ticket.
- Les PR déjà ouvertes qui codent du texte en dur (#61 notamment) devront
  être corrigées séparément, sur leurs propres branches/tickets, une fois
  cette règle à jour.
