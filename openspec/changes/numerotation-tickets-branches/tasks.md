## 1. Adoption du catalogue — ticket d'initialisation 000

Scope/type : `infra/chore`. Branche prévue : `infra/chore-000-registre-tickets-branches`.
Change : `numerotation-tickets-branches`. Périmètre : registre, règles communes,
correspondance backlog/branches et contrôle ; aucune implémentation frontend.
Acceptation : 104 tickets stables, tous les éléments ouverts couverts, branche
correcte selon la phase, sélection identique avec Claude/Codex/Copilot.
Dépendances : intégrer les PR #2, #1 et #3, puis la proposition documentaire.

- [ ] 1.1 Vérifier l'état Git, les règles et les dépendances ; créer/réutiliser la branche de cette évolution avant toute modification.
- [ ] 1.2 Relire `tickets.json` contre le backlog courant et adopter l'attribution locale ; conserver les trois étapes déjà réalisées et la phase d'initialisation active.
- [ ] 1.3 Installer le catalogue versionné dans `openspec/tickets.json`, avec les identifiants 1 à 104 et le prochain numéro 105 ; ne pas publier d'issues GitHub.
- [ ] 1.4 Ajouter les repères `[T-<numero>]` aux étapes du backlog frontend couvertes, sans modifier leur numéro, contenu métier ou case d'exécution.

## 2. Sélection des tickets et branches — même évolution 000

- [ ] 2.1 Mettre à jour CONTRIBUTING, AGENTS et le contexte/règles OpenSpec : tickets locaux réels, attribution globale stable, références `T-<numero>` et distinction avec les issues GitHub.
- [ ] 2.2 Ajouter une résolution en lecture seule du ticket, de ses tâches/dépendances et de sa branche selon la phase ; ne créer aucune branche depuis une simple consultation.
- [ ] 2.3 Contrôler unicité, couverture des tâches, dépendances existantes sans cycle, slugs et cohérence des noms de branches ; refuser ticket inconnu ou configuration ambiguë.
- [ ] 2.4 Définir le précontrôle de l'apply : ticket unique, étapes ciblées, dépendances validées, branche conforme avant génération ; aucun apply du backlog entier sur une seule branche.
- [ ] 2.5 Documenter les invocations des trois outils, les références de commits/PR locaux et la transition depuis `000`, sans modifier les skills générés OpenSpec.

## 3. Validation locale et préparation de PR — même évolution 000

- [ ] 3.1 Vérifier le cas T-1 : branche `front/feat-000-jetons-design` pendant initialisation, puis `front/feat-1-jetons-design` après transition déclarée ; ne pas renommer de branche réelle dans un test.
- [ ] 3.2 Vérifier avec des fixtures les doublons, ticket absent, dépendance/cycle, mauvaise branche, renumérotation interdite et préservation des cases déjà cochées ; aucune publication distante pendant les tests.
- [ ] 3.3 Valider les conventions Git, la parité IA pertinente, le catalogue et le change OpenSpec ; inspecter le diff et rapporter les résultats réels.
- [ ] 3.4 Préparer la PR vers `main`, références de tickets locaux, impacts et retour arrière, avec aucun push direct sur `main`.

## 4. Publication et intégration

- [ ] 4.1 Committer explicitement les fichiers du workflow et pousser uniquement sa branche si la livraison est demandée.
- [ ] 4.2 Ouvrir sa PR vers `main`, renseigner le lien et les validations réellement exécutées.
- [ ] 4.3 Traiter la revue ; fusionner uniquement sur demande explicite après validations et intégration des dépendances.

Les tickets métier T-1 à T-104 sont planifiés dans [tickets.md](tickets.md),
avec leurs étapes et branches. Ils ne sont pas implémentés par l'apply de ce
change d'outillage. Leur implémentation se sélectionnera un ticket à la fois dans
`frontend-tickets-mvp-association` après adoption de ce workflow.
