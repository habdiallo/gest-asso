## 1. Audit et cadrage [T-138]

Ticket réel : T-138. Scope/type/slug : `front` / `refactor` / `harmoniser-systeme-visuel`.
Branche : `front/refactor-138-harmoniser-systeme-visuel`. Prérequis : T-137 est
fusionné et doit être présent dans l'ascendance de la branche avant l'implémentation.

- [x] 1.1 [T-138] Résoudre T-138 avec `node scripts/tickets.mjs resolve T-138 --json`, vérifier la branche attendue, confirmer la présence de T-137 fusionné dans l'ascendance et exécuter `node scripts/tickets.mjs verify T-138` avant toute modification de code.
- [x] 1.2 [T-138] Auditer `contribo-front/src/styles.css`, `app.css`, les composants `shared/` et les pages `features/`, en incluant les surfaces livrées par T-137 : relever les niveaux typographiques, rayons, paddings, margins, gaps, hauteurs, largeurs, conteneurs, media queries, règles CSS dupliquées et valeurs Tailwind arbitraires avec leur fréquence et leur contexte.
- [x] 1.3 [T-138] Produire la synthèse courte demandée, sous la forme constats, conventions existantes, incohérences, patterns récurrents, direction proposée et impact estimé, en distinguant les conventions globales des exceptions de composant et en utilisant la capture mobile comme référence d'agencement, sans transformer son contenu en périmètre fonctionnel.
- [x] 1.4 [T-138] Arrêter l'échelle typographique, la logique de rayons, les primitives d'espacement et de dimensions, les niveaux stables ou responsive, les breakpoints conservés et les éventuelles container queries, puis mettre à jour les spécifications ou le design du change si l'audit invalide une hypothèse.

## 2. Thème Tailwind et conventions partagées [T-138]

- [x] 2.1 [T-138] Exposer dans le `@theme inline` CSS-first uniquement les tokens confirmés par l'audit pour la typographie, les rayons, les espacements, les hauteurs, les largeurs ou les conteneurs, en conservant le suivi des thèmes clair et sombre et sans créer de système de styles concurrent.
- [x] 2.2 [T-138] Harmoniser les composants `shared/` concernés, notamment `page-header`, `detail-shell`, `data-table`, `form-dialog`, `action-button`, `custom-select`, `financial-card`, `stat-card`, les états vides et les contrôles de pagination, sans modifier leurs contrats fonctionnels ou d'accessibilité.
- [x] 2.3 [T-138] Migrer les usages répétés des pages `dashboard`, `members`, `income-categories`, `campaigns`, `social-funds`, `roles-users` et `member-space` vers les conventions retenues, en conservant les valeurs locales justifiées par les tableaux, dialogues, textes longs ou compositions spécifiques.
- [ ] 2.4 [T-138] Réconcilier les règles et tests des boutons, champs, tableaux et composants réutilisables avec les tokens retenus, en vérifiant la hauteur minimale, le focus visible, les labels, les erreurs, les noms accessibles et les rayons par rôle.
- [ ] 2.5 [T-138] Réduire les duplications CSS démontrées par l'audit dans `styles.css` et `app.css` sans déplacer de logique métier, sans modifier les couleurs existantes et sans reformater les fichiers hors périmètre.

## 3. Responsive et vérifications d'interface [T-138]

- [ ] 3.1 [T-138] Harmoniser les conteneurs, grilles, empilements, largeurs minimales et défilements locaux selon la stratégie responsive retenue, en conservant les données essentielles des tableaux et les actions principales à toutes les largeurs vérifiées.
- [ ] 3.2 [T-138] Ajuster uniquement les niveaux typographiques et composants dont l'audit justifie une variation responsive, en laissant stables les textes de tableaux, labels et contrôles lorsque leur lisibilité est déjà préservée.
- [ ] 3.3 [T-138] Vérifier les dialogues, formulaires, navigation, sidebars, cartes, grilles, états vides, contenus longs et actions principales, y compris les surfaces issues de T-137, sur des largeurs mobiles, tablettes, desktops intermédiaires et larges ; comparer l'agencement à la capture mobile sans ajouter ses blocs métier.
- [ ] 3.4 [T-138] N'introduire une container query ou un breakpoint supplémentaire que si un cas concret documenté l'exige, puis ajouter ou ajuster les tests DOM et responsive correspondant sans coupler les tests à des classes purement locales.

## 4. Validation et livraison [T-138]

- [ ] 4.1 [T-138] Exécuter les tests ciblés, `npm test -- --watch=false`, `npm run lint`, `npm run format:check` et `npm run build` depuis `contribo-front/`, puis corriger uniquement les régressions du périmètre T-138.
- [ ] 4.2 [T-138] Réaliser une vérification visuelle des pages et composants principaux dans les deux thèmes et sur les largeurs exactes et intermédiaires retenues, en consignant les débordements, troncatures ou exceptions restantes.
- [x] 4.3 [T-138] Relire le diff ciblé, vérifier `openspec validate`, `node scripts/tickets.mjs check`, la présence du marqueur de ticket sur les tâches et l'absence de tiret cadratin dans les productions du ticket ; ne cocher que les étapes réellement réalisées.
- [ ] 4.4 [T-138] Préparer une PR vers `main` avec le résumé de l'audit, les décisions de tokens, les captures ou limites de vérification, les commandes réellement exécutées et le lien vers le change, sans fusion ni activation de l'auto-merge.
