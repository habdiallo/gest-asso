# Stratégie d'état frontend

Le frontend distingue trois catégories d'état :

- l'état local d'une page ou d'un composant, conservé au plus près de son usage ;
- l'état métier partagé par une feature, regroupé dans `features/<feature>/` ;
- l'état applicatif transversal, limité au socle `core/`.

## Règle par défaut

Utiliser les Signals Angular et des services colocalisés pour l'état local ou le
contexte d'une feature. Les données provenant de l'API restent sous l'autorité du
serveur. Après une mutation, la feature recharge ou invalide explicitement les
données concernées ; elle ne crée pas de cache global implicite.

`core/` reste réservé aux préoccupations transversales déjà établies, comme la
session, la navigation globale, le thème et la configuration HTTP/API. Un état
propre à une seule feature ne doit pas y être promu pour éviter une dépendance
transverse artificielle.

## Promotion vers un état global

Un état peut rejoindre `core/` uniquement si les trois conditions suivantes sont
documentées :

1. plusieurs features distinctes le lisent ou l'écrivent réellement ;
2. sa durée de vie dépasse celle d'une page ou d'une feature ;
3. sa cohérence ne peut pas être garantie par le serveur et un rechargement local.

La décision doit préciser la source de vérité, les transitions autorisées, la
stratégie d'invalidation et les tests associés. Un simple besoin de partager une
valeur entre deux composants d'une même feature ne justifie pas un service global.

## Validation

Les tests vérifient les transitions observables de l'état au niveau où il est
détenu. Les services de feature testent les appels API, la transformation IHM et
les invalidations nécessaires. Le socle teste uniquement les invariants
transversaux de session, navigation ou configuration. Toute nouvelle promotion
vers `core/` doit ajouter un test et une justification dans la documentation de
la feature concernée.
