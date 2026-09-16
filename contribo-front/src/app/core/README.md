# Socle global

Réserver `core/` aux préoccupations applicatives globales : configuration HTTP/API,
session, guards et intercepteurs lorsqu'ils sont implémentés. Importer par `@core/*`.
`core/` ne dépend jamais des features. Ne pas créer de services globaux pour un
état qui appartient à une seule fonctionnalité.
