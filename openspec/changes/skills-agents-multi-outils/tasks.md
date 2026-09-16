## 1. Préparation — ticket 000 / infra / chore

Branche : `infra/chore-000-skills-agents-multi-outils`.
Périmètre : outillage IA et revue ; aucune modification applicative.
Acceptation : six skills et un reviewer disponibles avec des consignes cohérentes, parité contrôlée.
Dépendances : PR #2 puis #1 avant intégration vers `main`.

- [x] 1.1 Vérifier les règles, la branche et l'état propre ; créer la branche dédiée avant toute modification.
- [x] 1.2 Examiner l'ancien skill et les formats officiels des trois outils ; préparer proposition, design et specs.

## 2. Implémentation locale

- [x] 2.1 Adapter le skill senior et ses références aux conventions réelles du dépôt.
- [x] 2.2 Ajouter l'agent reviewer et ses profils natifs, ainsi que la synchronisation de tous les skills.
- [x] 2.3 Documenter les invocations et la maintenance ; relier les instructions Copilot et Codex aux règles communes.
- [x] 2.4 Ajouter le contrôle de parité sur PR et vérifier ses cas d'échec avec des fixtures temporaires (9 tests réussis).
- [x] 2.5 Valider le skill, les profils, la parité, les conventions Git (9 tests) et le change OpenSpec ; vérifier la découverte réelle des 6 skills par Codex depuis la racine et le frontend. Aucun appel à un modèle ; aucune session de revue Claude/Copilot lancée.
- [x] 2.6 Préparer la description de PR vers `main` avec dépendances, résultats et limites réels.

## 3. Livraison

- [ ] 3.1 Committer les fichiers de cette évolution et pousser uniquement sa branche si la livraison est demandée.
- [ ] 3.2 Ouvrir une PR vers `main` et renseigner son lien après publication.
- [ ] 3.3 Traiter la revue et fusionner uniquement sur demande explicite, après intégration des dépendances.
