## 1. T-109 (docs/chore-109-interdire-tiret-cadratin-regles)

Périmètre : ajouter dans `AGENTS.md` la règle d'absence de tiret cadratin
dans tout contenu produit par un agent IA. Aucun code applicatif, aucun
contrôle outillé (lint/hook/CI) dans ce ticket. Critères d'acceptation :
la règle est lisible dans `AGENTS.md`, elle couvre code/docs/artefacts
OpenSpec/commits/PR, elle précise les alternatives de reformulation et
qu'elle ne s'applique pas rétroactivement aux fichiers existants.

- [x] 1.1 [T-109] Créer/réutiliser la branche `docs/chore-109-interdire-tiret-cadratin-regles`
      à partir de `origin/main` (dépôt propre, aucune modification étrangère
      embarquée).
- [x] 1.2 [T-109] Ajouter dans `AGENTS.md` la règle d'absence de tiret cadratin
      (—, U+2014) dans tout contenu produit par un agent (code, commentaires,
      docs, artefacts OpenSpec, commits, PR), avec les alternatives de
      reformulation, sans réécrire les fichiers existants qui en contiennent
      déjà.

## 2. Publication

- [ ] 2.1 [T-109] Committer avec le message `docs(docs): T-109 interdire le tiret
      cadratin dans les regles agents` (ou équivalent conforme), en ajoutant
      uniquement les fichiers du ticket.
- [ ] 2.2 [T-109] Pousser la branche `docs/chore-109-interdire-tiret-cadratin-regles`
      et ouvrir une PR vers `main` avec le modèle du dépôt, seulement si la
      livraison est explicitement demandée.
