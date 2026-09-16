# Calibration (exemples hypothétiques)

## Constat recevable

Le diff remplace un montant GNF entier par `parseInt(form.amount, 10)` alors que
le formulaire affiche `1 000` et transmet cette chaîne. Les lectures vérifiées
du formateur, du formulaire et du constructeur de requête établissent que `1`
est envoyé à l'API au lieu de `1000`, sans normalisation intermédiaire.
Le constat cite la ligne du parseur, les appelants et le schéma entier du contrat,
explique l'erreur de saisie et propose une normalisation/validation testée.
Si le formulaire transmet déjà `1000` numériquement, retirer ce candidat.

## Candidats à écarter

- « Il manque un test d'annulation » sans chemin produisant un comportement erroné.
- « Le bouton ne cache pas une action interdite, donc accès serveur possible »
  sans preuve que l'API accepte l'acteur et réalise l'opération.
- « Ce composant devrait injecter un port hexagonal » pour le frontend par features.
- « Ajouter Transloco/SSR/un composant ds-* » alors que ces outils sont absents.
- « Cette boucle pourrait être lente » sans volume, fréquence ni coût démontré.

Les exemples n'affirment pas que ces défauts existent dans le dépôt.
