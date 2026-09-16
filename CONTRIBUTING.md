# Contribuer à Contribo

## Principe de livraison

Toute évolution passe par **un ticket, une branche dédiée et une merge request
vers `main`**. Le dépôt est sur GitHub : la merge request est appelée pull request
(PR). `main` contient uniquement le travail intégré par PR et doit rester fonctionnelle.
Cette règle s'applique au code écrit ou généré, aux corrections, aux configurations,
aux contrats API et à la documentation, y compris les artefacts OpenSpec.

Ne jamais générer, modifier ou committer du code sur `main`, ni pousser directement
vers `main`. Ne pas utiliser de refspec tel que `HEAD:main`, de push forcé,
d'automatisation ou de désactivation de hook pour contourner cette règle.
La fusion s'effectue sur GitHub après les validations et la revue prévues.
Un agent ne fusionne pas une PR et n'active pas l'auto-merge sans demande explicite.

## Noms des branches

```text
<scope>/<type>-<numero-du-ticket>-<description>
```

| Élément | Valeurs / règle |
| --- | --- |
| `scope` | `front` : frontend ; `back` : backend ; `fullstack` : évolution indissociable front/back ; `docs` : documentation/spécifications ; `infra` : CI, déploiement, outils du dépôt |
| `type` | `feat` : fonctionnalité ; `fix` : correction ; `refactor` : restructuration sans changement de comportement ; `perf` : performance ; `test` : tests ; `chore` : maintenance/outillage |
| `numero-du-ticket` | Entier positif du ticket réel, sans `#` ni zéro initial ; exception temporaire `000` pendant l'initialisation |
| `description` | Résumé court en kebab-case ASCII minuscule, sans accent, espace ni underscore |

Exemples fictifs, à remplacer par les vrais tickets :

```text
front/feat-123-ajout-membre
back/fix-124-refus-surpaiement
docs/chore-125-regles-contribution
infra/chore-126-controles-ci
fullstack/feat-127-cloture-campagne
```

Expression régulière utilisée par les contrôles :

```regex
^(front|back|fullstack|docs|infra)/(feat|fix|refactor|perf|test|chore)-(000|[1-9][0-9]*)-[a-z0-9]+(-[a-z0-9]+)*$
```

Une évolution fonctionnelle utilise `feat`, une correction utilise `fix` ; le mot
« feature branch » désigne toute branche de travail et n'impose pas un préfixe
`feature/` supplémentaire. Pour une PR exclusivement documentaire, utiliser le
scope `docs` et le type approprié, généralement `chore` ou `fix`.

Un ticket correspond à une branche et à une PR. Choisir `fullstack` si la livraison
front/back est indissociable ; sinon créer des tickets liés et des PR distinctes.
Ne pas réutiliser une branche fusionnée pour un autre ticket.

### Exception temporaire : initialisation du projet

Sur instruction du mainteneur, utiliser **`000` tant que l'initialisation du
projet n'est pas terminée**, sans demander un vrai numéro de ticket. Ce marqueur
autorise l'implémentation, les commits et la livraison par PR sur les branches
conformes, par exemple `docs/chore-000-regles-git-openspec`.
Chaque évolution garde sa propre branche et sa propre PR vers `main`, avec une
description distincte, même si plusieurs évolutions utilisent `000`.
`000` est un marqueur d'initialisation, pas une issue GitHub : ne pas utiliser
`Closes #000`. Les valeurs `0`, `00`, `0000` et les autres numéros avec zéro initial
restent refusés. L'interdiction de push direct sur `main` reste intégrale.

Lorsque le mainteneur déclare l'initialisation terminée, retirer l'alternative
`000` des expressions régulières dans les deux hooks et le workflow CI, mettre
à jour ces consignes, les instructions agents/OpenSpec et les tests associés.
Renommer les branches `000` encore ouvertes avec leurs vrais tickets avant de
retirer l'exception. Ne pas modifier rétroactivement les commits déjà livrés.

Hors de cette exception, sans numéro réel, les agents peuvent préparer localement la documentation, les
spécifications et les règles/outils du workflow sur une branche provisoire
`docs/<type>-local-<description>` ou `infra/<type>-local-<description>`. Aucune
implémentation applicative, aucun commit, push ou PR n'est autorisé dans cet état.
Demander le numéro manquant et renommer avec `git branch -m <branche-conforme>`
avant de commencer le code applicatif, de committer ou de publier. Ne pas inventer
de ticket, utiliser `0` ou convertir une US/RG ou une tâche `2.1` en ticket.

## Préparer une évolution

1. Lire les règles applicables et les fichiers concernés. Vérifier la branche et
   l'état du dépôt. Préserver les modifications préexistantes et identifier celles
   qui appartiennent au ticket.
2. Confirmer le ticket, son périmètre et ses critères d'acceptation. Vérifier les
   dépendances avec d'autres tickets et les éventuels impacts API ou migrations.
3. Dans un dépôt propre, récupérer `origin/main` et créer la branche du ticket à
   partir de cette référence. Si des modifications sont déjà présentes, ne pas les
   effacer ou les stasher automatiquement : créer une branche locale qui les
   préserve, ou utiliser un worktree propre pour isoler le ticket.
4. Créer/réutiliser le change OpenSpec et préparer les artefacts nécessaires.
5. Implémenter uniquement le ticket, puis vérifier son comportement et le diff.
6. Ajouter explicitement les fichiers du ticket, committer, pousser cette branche
   et ouvrir une PR vers `main`. Utiliser le modèle du dépôt ; une PR incomplète
   doit rester en brouillon.

Exemple fictif, dans un dépôt propre et pour un ticket existant :

```bash
git status --short
git branch --show-current
git fetch origin
git switch -c front/feat-123-ajout-membre origin/main
# Préparation OpenSpec, implémentation et validations du ticket.
git add <fichiers-du-ticket>
git commit -m "feat(front): #123 ajouter un membre"
git push -u origin front/feat-123-ajout-membre
gh pr create --base main --head front/feat-123-ajout-membre --draft
```

Si `origin/main` est inaccessible, partir de `main` locale en indiquant que sa
synchronisation reste à vérifier ; ne pas prétendre avoir récupéré les nouveautés.
Ne jamais utiliser `git add .` sans vérifier et sélectionner le périmètre.

## OpenSpec et découpage des tickets

`openspec/config.yaml` injecte le contexte et les règles dans la préparation des
artefacts. `AGENTS.md` et les instructions Claude portent les règles d'exécution.
Ne pas modifier les skills/commandes générés par OpenSpec pour y dupliquer ces
conventions : une mise à jour de l'outil pourrait les remplacer.

Un **change OpenSpec** décrit une évolution et peut couvrir plusieurs tickets.
Une **tâche OpenSpec** est une étape de travail ; son numéro n'est pas un ticket.
Chaque groupe de tâches livrable doit préciser :

- le ticket réel, `000` pendant l'initialisation, ou « à attribuer » hors de cette exception ;
- le scope, le type et la branche prévue, ainsi que le lien vers le change ;
- le périmètre, les critères d'acceptation et les dépendances ;
- les validations pertinentes et l'étape de préparation/publication de la PR.

Lors d'un apply, sélectionner le ticket à implémenter et sa branche ; ne pas
implémenter tout le backlog sur une seule branche. Mettre à jour les cases à cocher
uniquement pour les actions réellement effectuées. Distinguer l'implémentation
locale, la publication de la PR et sa fusion : un build réussi ne prouve pas une fusion.
L'archivage/synchronisation des specs passe également par une branche et une PR ;
archiver quand les tâches prévues sont terminées et vérifier les PR liées si la
livraison en fait partie. Mentionner les PR encore ouvertes.

## Commits et pull requests

Titre de commit et titre de PR recommandés : `<type>(<scope>): #<ticket> <résumé>`.
Les valeurs doivent correspondre à la branche. Faire des commits ciblés, sans
secrets, fichiers temporaires ou modifications étrangères au ticket.

La PR référence le ticket et le change OpenSpec, explique le problème et le résultat,
indique les validations réellement exécutées et les limites connues. Ajouter des
captures pour les changements visuels et des notes de migration/retour arrière
quand elles sont pertinentes. Utiliser `Closes #123` uniquement si la PR termine
effectivement une issue GitHub de ce dépôt ; sinon mettre le lien du ticket.

Avant fusion : critères d'acceptation satisfaits, validations pertinentes réussies,
contrôle `Workflow conventions` réussi, conflits résolus et conversations de revue
traitées. Effectuer une revue humaine ; pour un mainteneur seul, revoir explicitement
le diff et les validations avant de fusionner. Ne pas exiger une approbation externe
impossible dans un dépôt maintenu seul. Préférer le squash avec un titre conforme,
puis supprimer la branche fusionnée lorsque cela convient.

Pour le frontend, depuis `contribo-front/`, exécuter les tests pertinents
(`npm test -- --watch=false`) et le build (`npm run build`) selon le changement.
Ne pas annoncer un lint, des tests backend ou un outil E2E non configurés.
Pour les documents/OpenSpec, vérifier la syntaxe et la lecture des instructions
avec le CLI ; pas de build applicatif imposé pour une modification documentaire.

## Contrôles locaux et protection de main

Les hooks versionnés dans `.githooks/` refusent les commits sur une branche non
conforme et les pushes de branches non conformes ou dirigés vers `main`. Le hook
de push examine chaque ref : un push explicite `HEAD:main` est également refusé.
Ils s'appliquent à tous les contributeurs de ce clone, y compris les agents.

Après chaque nouveau clone, vérifier les hooks déjà installés puis activer ceux
du dépôt (ne pas remplacer silencieusement un autre système de hooks) :

```bash
git config --get core.hooksPath
git config --local core.hooksPath .githooks
```

Les hooks sont une protection locale et ne sont pas automatiquement installés
par Git. Ne pas les désactiver ni utiliser `--no-verify`. Le workflow GitHub
`.github/workflows/workflow-conventions.yml` contrôle le nom de la branche et
la cible `main` pour chaque PR ; il ne remplace pas les tests du produit.

Vérifier les hooks avec `node --test tests/git-workflow.test.cjs`. Les tests utilisent
des dépôts temporaires et un remote local ; ils ne poussent rien sur GitHub.

**La garantie côté serveur nécessite une protection de branche GitHub.** Les
fichiers du dépôt ne peuvent pas, à eux seuls, interdire les pushes directs.
Configurer une règle de protection/ruleset active ciblant `main` :

- imposer une PR avant fusion, sans exception de contournement pour les agents
  ou les administrateurs ;
- rendre obligatoire le statut `Workflow conventions` après sa première exécution,
  puis les contrôles applicatifs effectivement disponibles ;
- exiger la résolution des conversations, interdire les force-pushes et la
  suppression de `main` ;
- avec plusieurs mainteneurs, exiger au moins une approbation et invalider les
  approbations devenues obsolètes après de nouveaux commits.

L'activation dépend des permissions et de l'offre GitHub du dépôt. Ces réglages
doivent être vérifiés sur GitHub ; ne pas déclarer `main` protégée tant qu'ils
ne sont pas actifs. Voir la [documentation GitHub sur les branches protégées](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
