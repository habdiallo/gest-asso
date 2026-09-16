---
paths:
  - "contribo-front/src/**"
  - "contribo-front/angular.json"
  - "contribo-front/package.json"
---

# Angular — Contribo

## Contexte réel et périmètre

- Application Angular 21 dans `contribo-front/`, gérée avec npm.
- Tailwind CSS 4 via PostCSS, styles CSS, TypeScript strict, Prettier et Vitest.
- Le projet est un socle Angular : ne pas présenter des features, providers ou outils à venir comme déjà installés.
- Aucun SSR, framework de composants, système de ports/adapters ou store tiers n'est configuré.
- Fonctionnel : `besoins/cahier-user-stories-mvp-association-v2.md` ; contrat partagé : `besoins/openapi.yaml`.
- Référence visuelle/parcours : `design/`, notamment `design/DESIGN (5).md`.
- Backlog : `openspec/changes/frontend-tickets-mvp-association/`. Ses choix de stack historiques ne remplacent pas les configurations Angular présentes.
- Chaque évolution doit servir une US, une règle métier ou un besoin IHM explicite, sans fonctionnalité future.
- `design/` est un prototype statique, pas du code Angular ni un faux backend à reprendre tel quel.

## Composants et état

- Utiliser des composants standalone ; ne pas ajouter `standalone: true`, déjà implicite.
- Pour les nouveaux composants, configurer `ChangeDetectionStrategy.OnPush`.
- Garder les composants petits et centrés sur une responsabilité ; les chemins de template/style externes restent relatifs au fichier TypeScript.
- Préférer `input()`, `output()` et, pour un vrai contrat bidirectionnel, `model()`.
- Déclarer les références aux signaux et dépendances `readonly`.
- Utiliser `signal()` pour l'état local et `computed()` pour l'état dérivé.
- Garder les transformations d'état pures et utiliser `set()` ou `update()`, pas de mutation directe.
- Réserver `effect()` aux effets de bord, pas à la synchronisation entre signaux.
- Préférer `inject()` en initialiseur de champ et les bindings `host` aux décorateurs de host.
- Consommer les Observables avec `toSignal()` ou le pipe `async` selon l'usage ; protéger les souscriptions manuelles avec `takeUntilDestroyed()`.
- Dans une recherche réactive, gérer les erreurs dans la requête du `switchMap` pour permettre les recherches suivantes.

## Structure proportionnée au MVP

- L'architecture frontend est par fonctionnalités, conformément à `contribo-front/README.md`.
- Regrouper routes, pages, composants, services/état et tests dans `src/app/features/<feature>/` ; créer les sous-dossiers seulement au besoin.
- Réserver `core/` aux responsabilités transverses et `shared/` aux éléments effectivement réutilisés.
- Les features ne s'importent pas directement entre elles ; `core/` et `shared/` ne dépendent jamais des features.
- Aucun découpage hexagonal frontend : pas de couches domain/application/infrastructure, ports ou adapters systématiques. L'architecture hexagonale est réservée au backend.
- Garder les services centrés sur une responsabilité ; réserver `providedIn: 'root'` aux services dont la portée doit être globale.
- Ne pas créer systématiquement port, adapter, mapper et modèle de domaine pour chaque DTO. Voir `api-client.md`.
- Charger paresseusement les routes de fonctionnalités quand elles sont créées.
- Utiliser les formulaires réactifs typés pour la saisie métier.
- Ne pas effectuer de requêtes métier manuelles avec `httpResource()` : conserver le client issu du contrat API.
- Utiliser `NgOptimizedImage` pour les images statiques pertinentes, pas pour les SVG inline ou les données base64.

## IHM et droits

- Reprendre les deux thèmes et le responsive du prototype avec Tailwind et/ou les styles CSS.
- Employer des contrôles HTML natifs accessibles et des SVG inline ; ne pas introduire une bibliothèque de composants ou d'icônes pour appliquer ces règles.
- Les menus/actions dépendent du rôle applicatif et de `operatorCanRecordPayments`, jamais de la fonction associative.
- Le statut d'un membre change uniquement par les opérations dédiées réservées à l'Administrateur.
- Prévoir chargement, état vide, erreur, succès et rafraîchissement après mutation.
- Le sélecteur de rôle est propre à `design/`, pas un mécanisme d'autorisation de l'application.

## Commandes existantes

Depuis `contribo-front/` : `npm start`, `npm run lint`, `npm run format:check`, `npm run build`, `npm test -- --watch=false`.
`npm run generate:api` est explicite, sans hook npm au démarrage/build/tests ; voir `api-client.md`.
Utiliser `npx ng generate ...` pour créer les artefacts Angular, puis adapter le résultat à ces règles.
Ne pas modifier les dépendances lors d'une simple modification de documentation.
