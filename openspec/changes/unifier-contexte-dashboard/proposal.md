## Why

Le tableau de bord mélange actuellement deux périmètres métier, les campagnes
de cotisation et les cagnottes sociales, avec des sélections indépendantes.
Cette composition rend les indicateurs, les actions et les activités difficiles
à interpréter, car une même page peut afficher des données provenant de
contextes différents. Un seul contexte sélectionné doit piloter l'ensemble du
dashboard sur desktop et mobile.

La suppression des blocs « Synthèse des cotisations » et « Synthèse de la
cagnotte » relève de T-135 et reste acquise. Ce changement ne doit pas les
réintroduire.

## What Changes

- Remplacer les sélections indépendantes par un choix unique de contexte :
  « Cotisations » ou « Cagnottes ».
- Afficher un seul sélecteur dépendant du type de contexte choisi.
- En contexte « Cotisations », afficher les indicateurs liés aux membres, aux
  cotisations, au reste à encaisser et aux paiements.
- En contexte « Cagnottes », afficher les indicateurs liés aux contributeurs,
  à l'objectif, aux contributions encaissées et au reste à collecter.
- Faire suivre la sélection unique par les activités récentes, les actions
  rapides, les libellés de périmètre et les états vides.
- Adapter les actions rapides au contexte sélectionné, tout en conservant les
  règles de droits existantes.
- Aligner le comportement et la hiérarchie visuelle entre le dashboard desktop
  et le native design mobile, dans les thèmes clair et sombre.
- Préserver la suppression des synthèses redondantes déjà portée par T-135.
- Ne modifier ni le contrat API, ni les données persistées, sauf découverte
  d'un manque bloquant documenté pendant l'implémentation.

## Capabilities

### New Capabilities

- `dashboard-unified-context`: Sélection unique du périmètre du dashboard et
  synchronisation des indicateurs, activités et actions avec ce contexte.

### Modified Capabilities

- Aucun comportement existant n'est remplacé dans une capacité spécifiée. Le
  filtrage des règlements reste applicable au contexte « Cotisations » ; le
  contexte « Cagnottes » affiche ses contributions dans son propre flux.

## Impact

- Frontend Angular : page, état, composants et tests du dashboard dans
  `contribo-front/src/app/features/dashboard/`.
- Prototypes UX/UI : `design/` et `design/native design/` comme références
  visuelles et de parcours.
- API : aucune évolution attendue ; les données existantes du dashboard et des
  cagnottes doivent être réutilisées.
- Backend, migrations et persistance : aucun changement prévu.
- Dépendance de livraison : T-135 pour conserver la composition sans panneaux
  de synthèse redondants.
