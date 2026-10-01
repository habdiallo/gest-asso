# Socle global

Réserver `core/` aux préoccupations applicatives globales : configuration HTTP/API,
session, guards et intercepteurs lorsqu'ils sont implémentés. Importer par `@core/*`.
`core/` ne dépend jamais des features. Ne pas créer de services globaux pour un
état qui appartient à une seule fonctionnalité. L'état local et l'état métier
partagé restent dans la feature, avec les Signals et services colocalisés. Les
données serveur restent sous l'autorité de l'API ; une promotion vers `core/`
doit être justifiée par un usage transversal, une durée de vie globale et une
stratégie d'invalidation documentée. Voir [la stratégie d'état frontend](../../../docs/state-management.md).
