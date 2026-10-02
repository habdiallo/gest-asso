## Pourquoi

La campagne QA manuelle du 2 octobre 2026 a confirmé deux écarts reproductibles dans l'application locale : une session avec changement obligatoire du mot de passe peut atteindre `/mon-espace`, et deux libellés de l'espace personnel affichent leurs clés Transloco brutes.

## Changements

- Bloquer toutes les routes métier, y compris `/mon-espace`, tant que le changement obligatoire du mot de passe n'est pas terminé.
- Ajouter les deux traductions françaises manquantes dans l'espace personnel membre.
- Publier les runs QA terminés, les anomalies et les tickets locaux générés afin de suivre la campagne dans une PR dédiée.

## Découpage

- T-190, correctif frontend de la garde de session limitée.
- T-191, correctif frontend des traductions de l'espace personnel.
- T-192, traçabilité des runs QA et guide de suivi de la campagne.

## Hors périmètre

- Aucun changement backend ou contrat OpenAPI.
- Aucun ajout de journal applicatif pendant la campagne en cours.
- Aucune fusion automatique et aucune publication d'issue GitHub depuis les tickets QA locaux.
