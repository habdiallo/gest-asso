# Contexte à vérifier dans le dépôt

- Frontend : `contribo-front/`, Angular standalone, architecture par features.
  Lire son README et les règles pertinentes de `.claude/rules/frontend/`.
  `features/<feature>` possède routes/pages/services/état métier ; `core` contient
  le socle global ; `shared` les éléments neutres réutilisés. Pas d'import direct
  entre features ni de dépendance de `core/shared` vers une feature.
- L'architecture hexagonale concerne le futur backend. Inspecter ce qui existe
  avant de demander Spring, JPA, un package backend ou un test backend.
- Ne pas exiger SSR, Transloco, des composants `ds-*` ou une bibliothèque absente.
  Le prototype `design/` fournit des références UX, pas une implémentation serveur.
- API : `besoins/openapi.yaml` ; les clients générés ne sont pas édités à la main.
  Vérifier endpoints, schémas, nullabilité, erreurs, pagination et autorisations
  contre le contrat réellement concerné.
- Métier : `besoins/cahier-user-stories-mvp-association-v2.md` et les specs du change.
  Retrouver la règle avant de conclure : montants entiers GNF, paiements partiels,
  refus de surpaiement, cotisations distinctes des cagnottes, autorisation de saisie
  de l'Opérateur. Une fonction associative n'est pas un rôle d'accès.
- Une protection UI ne prouve pas une protection serveur. Établir la portée exacte
  du diff et de l'API avant de prétendre avoir identifié une faille exploitable.
- Livraison : branche dédiée avec un vrai numéro de ticket, PR vers `main`
  (l'initialisation du projet, qui autorisait le marqueur `000`, est terminée).
  Lire la configuration Git ; ne pas déduire une protection serveur des seuls
  hooks et ne pas publier une revue à la place du mainteneur.

Ne charger que les règles pertinentes. Si une spécification ou un appelant manque,
nommer cette limite plutôt que combler le manque par une hypothèse.
