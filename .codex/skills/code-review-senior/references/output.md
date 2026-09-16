# Rapport en français

Commencer par les constats, du plus grave au moins grave.

Pour chacun :

- `[P1] Titre concret` — `chemin:ligne`, idéalement une ligne modifiée.
- Scénario déclencheur et acteurs/valeurs nécessaires.
- Problème, preuve vérifiée dans le code/contrat et impact utilisateur ou données.
- Correction suggérée et test ciblé utile, sans modifier le dépôt.

Terminer par un paragraphe indiquant cible/base exacte, couverture examinée,
commandes réellement exécutées et résultats, limites et verdict local :
`CORRECTIONS REQUISES` pour P0/P1 ; `OBSERVATIONS À TRAITER` pour P2/P3 seuls ;
`AUCUN DÉFAUT DÉMONTRÉ` en l'absence de constat. Ce verdict n'est pas une approbation
GitHub et ne prouve pas la correction du code hors du périmètre examiné.

Sur demande de JSON, produire une liste `findings` avec les champs
`severity`, `title`, `location` (`file`, `line`), `trigger`, `problem`, `evidence`,
`impact`, `suggested_fix`, et des champs globaux `scope`, `checks`, `limitations`,
`verdict`. Une liste vide est valide. N'inventer aucune valeur pour remplir le schéma.
