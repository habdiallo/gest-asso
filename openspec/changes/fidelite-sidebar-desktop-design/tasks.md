## 1. Préparer le ticket unique T-111

Ticket : T-111. Priorité : P2. Scope/type : `front/fix`.
Slug : `sidebar-desktop-design`.
Branche : `front/fix-111-sidebar-desktop-design`.
Change : `fidelite-sidebar-desktop-design`.

Périmètre : présentation de la sidebar déjà affichée à partir de 821 px, uniquement. Références : `design/styles.css` (sidebar, brand, nav, profile), `design/app.js` (sidebar et SVG), `design/DESIGN (5).md` (thèmes et typographies).

Prérequis intégrés à vérifier dans l'ascendance : T-14 (`4a57723`), T-10 (`db9307c`, PR 18), T-11 (`066921b`, PR 19), T-12 (`877e9ae`, PR 20). Préserver la correction mobile T-110 (`910d288`, PR 47). Aucun autre ticket à implémenter dans ce change.

Acceptation : blocs de marque, navigation et identité conformes à la référence, dans les deux thèmes, état actif/survol/focus visibles, identité issue de la session, menu et actions actuels préservés. Aucune nouvelle route, aucun changement de droits, aucune modification de la navigation mobile, de la topbar ou des pages métier. Les mesures et scénarios complets figurent dans `specs/desktop-sidebar-visual/spec.md`.

- [x] 1.1 [T-111] Avant l'implémentation, lire les artefacts et règles frontend pertinentes, vérifier `git status --short`, résoudre `node scripts/tickets.mjs resolve T-111 --json`, vérifier la branche attendue et l'ascendance des prérequis, puis exécuter `node scripts/tickets.mjs verify T-111`.
- [x] 1.2 [T-111] Enregistrer les captures initiales de la sidebar et du prototype aux mêmes dimensions (1440 × 900 et 1024 × 768 px), dans les deux thèmes ; relever les écarts sur les seuls blocs marque/navigation/pied et conserver la liste des liens autorisés actuelle.

## 2. Aligner uniquement le visuel de la sidebar

- [x] 2.1 [T-111] Ajuster le cadre et le bloc de marque desktop : padding, fond translucide/flou, bordure, logo SVG existant, nom et sous-titre ; conserver la largeur de 256 px, le seuil de 821 px et le décalage du contenu principal, avec styles locaux.
- [x] 2.2 [T-111] Adapter uniquement le menu vertical : icônes associées aux chemins existants, rubrique Administration sans doublons, dimensions/espacements, survol et état actif avec repère latéral ; préserver libellés, destinations, filtrage par rôle, ordre relatif des liens de chaque rubrique, navigation Angular, `aria-current` et rendu horizontal.
- [x] 2.3 [T-111] Reproduire le bloc d'identité informatif en pied à partir de la session disponible (initiales, nom, rôle), gérer l'attente et les noms longs sans nouvelle requête ni page compte, conserver dessous les composants thème/déconnexion et leur fonctionnement, et maintenir l'accès au pied lorsque le menu défile.

## 3. Vérifier la fidélité et le cloisonnement

- [x] 3.1 [T-111] Exécuter les tests existants pertinents du shell, de la navigation et des actions thème/déconnexion, ainsi que `npm run build` depuis `contribo-front/` ; vérifier lint/formatage sur les fichiers modifiés et `git diff --check`, adapter un test comportemental uniquement si un contrat observable concerné le nécessite, puis rapporter les commandes et limites réelles.
- [x] 3.2 [T-111] Comparer les captures finales recadrées de la sidebar au prototype à 1440 × 900 et 1024 × 768 px en clair/sombre pour les quatre rôles ; contrôler survol, lien actif et sous-route, Tab/Entrée, contraste, texte à 200 %, hauteur réduite et actions du pied ; vérifier 820/821 px et 375 px pour confirmer l'absence de régression mobile et de recouvrement du contenu, et documenter les seules adaptations d'accessibilité nécessaires.

## 4. Préparer puis publier une seule PR T-111

- [x] 4.1 [T-111] Relire le diff pour confirmer le périmètre exclusivement visuel de la sidebar, vérifier `node scripts/tickets.mjs check --base-ref origin/main` et la validation OpenSpec, mettre à jour uniquement les étapes réalisées et préparer la description selon `.github/pull_request_template.md` avec captures comparatives, validations et éventuels écarts justifiés.
- [x] 4.2 [T-111] Lorsque la livraison est demandée, ajouter explicitement les seuls fichiers T-111, committer avec un titre `fix(front): T-111 ...`, pousser uniquement `front/fix-111-sidebar-desktop-design` et ouvrir sa PR vers `main` ; suivre revue et CI sans fusion ni auto-merge sans demande explicite.

La génération de cette proposition ne réalise pas les tâches applicatives. La publication de la PR et sa fusion sont des étapes distinctes ; aucun second ticket n'est prévu.

Livraison demandée et publiée dans la [PR 58](https://github.com/habdiallo/gest-asso/pull/58), vers `main`. Captures comparatives et validations jointes ; revue et fusion restent à effectuer séparément.
