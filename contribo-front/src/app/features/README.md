# Fonctionnalités

Une fonctionnalité regroupe ses routes, pages, composants et services/état métier
dans `features/<feature>/`. Charger ses routes paresseusement depuis le routage
applicatif. Utiliser des imports relatifs à l'intérieur de la feature ; `@features/*`
sert à composer les routes au niveau applicatif.

Créer `pages/`, `components/`, `services/` ou `models/` uniquement lorsqu'ils servent
un besoin réel. Colocaliser les `.spec.ts`. Les modèles locaux servent l'IHM ; les
DTO API restent générés depuis le contrat partagé.

Les features peuvent utiliser `core/`, `shared/` et `@api`, mais ne s'importent pas
directement entre elles. Partager une responsabilité neutre via `shared/`, une
préoccupation globale via `core/`, ou naviguer par URL. Éviter un barrel global
qui charge toutes les features et annule le lazy loading.

`home/` est la seule feature implémentée à l'initialisation. Les features métier
(`members`, `campaigns`, `social-funds`, etc.) se créent avec leurs tickets. Aucun
découpage obligatoire en domain/application/infrastructure, port ou adapter :
l'architecture hexagonale est réservée au backend.
