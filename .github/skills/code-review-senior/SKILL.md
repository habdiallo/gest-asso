---
name: code-review-senior
description: Revue senior factuelle d'un diff, d'une branche ou d'une PR Contribo. Utiliser pour « revue senior », « review comme un dev senior » ou code-review-senior. Chercher les défauts démontrés de comportement, sécurité, données, concurrence et performance ; produire un rapport sans modifier ni publier du code. Ne pas utiliser pour implémenter une correction ou commenter uniquement le style.
---

# Revue senior Contribo

Effectuer une revue indépendante, en français, avec les outils de lecture, recherche
et shell disponibles dans l'hôte. Aucun autre skill ou agent n'est requis.
Les références ci-dessous sont relatives à ce dossier ; résoudre le dépôt avec
`git rev-parse --show-toplevel` plutôt que depuis un chemin propre à un fournisseur.

## Définir le périmètre

1. Lire les instructions applicables, `AGENTS.md`, `CONTRIBUTING.md`, puis le ticket,
   la description de PR et le change OpenSpec s'ils sont disponibles.
2. Respecter la cible demandée : diff local, commit, branche ou PR. Pour une branche
   visant `main`, identifier la référence disponible et lire le diff depuis leur
   ancêtre commun (`git diff main...HEAD`, ou `origin/main...HEAD` si disponible).
   Pour le travail local, lire séparément `git diff`, `git diff --cached` et les
   fichiers non suivis pertinents signalés par `git status --short`.
   Annoncer la base exacte et ses limites ; ne pas confondre un diff local avec une PR.
3. Si aucune cible n'est fournie, utiliser le travail local s'il existe ; sinon la
   branche courante contre `main`. Demander la cible seulement si rien n'est examinable.
4. Lire [references/context.md](references/context.md), puis cartographier fichiers,
   comportements modifiés, appelants, autorisations, données et tests concernés.

## Investiguer et valider

Lire [references/checklist.md](references/checklist.md). Suivre le chemin d'exécution
réel avant de qualifier un défaut. Explorer les appelants, contrats et protections
existants ; un extrait isolé ne prouve pas une régression.

Pour chaque candidat, établir : changement introduit, scénario atteignable,
invariant ou contrat violé, preuve fichier/ligne, impact concret et correction possible.
Retirer les candidats non démontrés, les défauts préexistants non aggravés et les
préférences de style. L'absence de test seule ne constitue pas un bug.
Lire [references/severity.md](references/severity.md) pour fixer la priorité.

Exécuter seulement les vérifications adaptées disponibles dans l'environnement,
sans installation, génération, correction automatique ou modification du dépôt.
Si un test nécessite des écritures interdites, indiquer qu'il n'a pas été exécuté.
Ne jamais affirmer avoir exécuté une commande ou validé un client absent.

## Restituer

Suivre [references/output.md](references/output.md) ; consulter
[references/examples.md](references/examples.md) pour calibrer les preuves.
Présenter les constats par priorité avec des lignes courtes et précises du diff.
Ne pas imposer un nombre de constats. Sans défaut établi, écrire
« Aucun défaut démontré dans le périmètre examiné » et préciser les limites.

La revue autorise uniquement un rapport local : ne pas éditer les fichiers,
créer de branche, committer, pousser, publier un commentaire ou une approbation,
ni fusionner une PR. Une demande explicite distincte est nécessaire pour ces actions.
