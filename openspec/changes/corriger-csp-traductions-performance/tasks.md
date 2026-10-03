## 1. Diagnostic et cadrage [T-198]

- [x] 1.1 [T-198] Vérifier la branche `fullstack/fix-198-corriger-csp-traductions-performance`, les prérequis du ticket et l'absence de mélange avec les modifications d'autres tickets.
- [x] 1.2 [T-198] Capturer une mesure de référence sur l'environnement d'intégration : HTML, headers CSP, assets, erreurs console, temps de rendu visible et temps d'interactivité de `/login`.
- [x] 1.3 [T-198] Choisir et documenter une stratégie de pluralisation compatible CSP sans `unsafe-eval`, puis valider son impact sur les messages ICU existants.

## 2. Frontend et rendu initial [T-198]

- [x] 2.1 [T-198] Adapter le rendu Transloco MessageFormat ou son remplacement pour que les traductions et pluriels s'affichent sous `script-src 'self'` sans évaluation dynamique interdite.
- [x] 2.2 [T-198] Ajouter dans les assets frontend les variantes de polices réellement utilisées, conserver leurs licences, remplacer les références Google Fonts par des `@font-face` locaux et vérifier le rendu sous la CSP.
- [x] 2.3 [T-198] Réduire les opérations bloquantes des initializers globaux et garantir que la récupération CSRF et la session restent prêtes avant les actions ou routes qui les exigent.
- [x] 2.4 [T-198] Ajouter ou adapter les tests frontend pour les traductions, les pluriels 0/1/plusieurs, le démarrage sans session et l'absence d'erreur CSP au rendu.

## 3. Déploiement et contrôles effectifs [T-198]

- [x] 3.1 [T-198] Mettre à jour les configurations Nginx et les règles d'assets nécessaires, sans autoriser globalement `unsafe-eval`, `unsafe-inline` ou des domaines tiers non requis.
- [x] 3.2 [T-198] Vérifier les headers de cache et les références de bundles afin qu'un redéploiement ne mélange pas un HTML, un JavaScript, un CSS ou un fichier de traduction de versions différentes.
- [x] 3.3 [T-198] Compléter la procédure Portainer avec la vérification du fichier Nginx monté, des images immuables, des assets et des headers effectivement servis après rafraîchissement de la stack.

## 4. Validation et livraison [T-198]

- [x] 4.1 [T-198] Exécuter les tests frontend, le build de production, les contrôles de formatage pertinents et les vérifications de configuration Nginx, puis consigner les résultats réels.
- [ ] 4.2 [T-198] Déployer la version candidate sur l'environnement d'intégration et exécuter le smoke test navigateur de `/login`, avec cache froid puis cache chaud, en vérifiant l'interface et la console.
- [ ] 4.3 [T-198] Comparer les mesures avant/après, relire le diff ciblé et préparer une PR vers `develop` avec les preuves, les limites et la procédure de retour arrière.
