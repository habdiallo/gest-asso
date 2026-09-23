## Why

La comparaison entre `design/` et l'application montre que « Nouvelle campagne » et
les actions équivalentes des écrans métier utilisent encore des classes et des icônes
dupliquées dans les templates. Le rendu peut donc diverger d'un menu à l'autre, même
si les tokens visuels ont déjà été rapprochés dans T-126.

La même comparaison montre un écart fonctionnel et visuel dans la sidebar : le
prototype admin présente « Cotisations », « Utilisateurs & rôles » et « Catégories »,
alors que l'application affiche notamment « Campagnes », « Catégories de revenu »,
« Rôles et utilisateurs » et « Mon espace », avec un ordre et un pied de navigation
différents. Le périmètre est regroupé dans ce ticket pour que les actions et la
navigation soient cohérentes sur tous les menus, sans modifier les droits métier.

## What Changes

- Créer un composant partagé d'action réutilisable pour les liens et boutons primaires,
  secondaires et dangereux, avec les mêmes dimensions, icônes, états, focus clavier et
  sémantique native que le composant `.btn` du prototype.
- Remplacer les variantes locales des actions de création et d'opération, en commençant
  par « Nouvelle campagne » du tableau de bord, puis les actions équivalentes des menus
  Membres, Campagnes, Cagnottes, Catégories et Rôles et utilisateurs.
- Préserver les destinations, les paramètres de route comme `creer=1`, les types de
  bouton dans les formulaires et les comportements de désactivation ou de chargement.
- Aligner la définition de navigation et le rendu de la sidebar authentifiée sur le
  prototype pour chaque rôle : ordre, libellés, regroupement Administration, icônes,
  état actif, identité et actions du pied.
- Reproduire la liste Campagnes du prototype avec une grille de cartes financières,
  une recherche iconifiée et des filtres segmentés limités à Toutes, Ouvertes et
  Clôturées.
- Reproduire la liste Cagnottes sur le même motif de recherche, segments de statut
  et cartes financières, en conservant sa pagination, son filtre par type d'événement
  et ses droits d'accès.
- Conserver les autorisations, les routes existantes, les gardes, la session, les
  actions thème/déconnexion et la navigation mobile. Aucun changement API ou backend.

## Capabilities

### New Capabilities

- `reusable-action-buttons`: contrat visuel, sémantique et d'accessibilité du composant
  partagé utilisé par les actions des différents menus.

### Modified Capabilities

- `desktop-sidebar-visual`: faire évoluer la présentation et les données de navigation
  pour aligner les menus, libellés, regroupements et le pied avec le prototype, tout en
  maintenant les règles d'autorisation et les destinations existantes.

## Impact

- Frontend Angular dans `contribo-front/src/app/shared`, les pages et composants des
  features `dashboard`, `members`, `campaigns`, `social-funds`, `income-categories` et
  `roles-users`, ainsi que les traductions et tests associés.
- Navigation verticale, définition `navigation-items.ts`, `navigation-menu` et shell
  desktop, avec vérifications des variantes de rôles et du responsive existant.
- Aucun nouveau package, aucune migration et aucune modification du contrat API.
- Un ticket front/fix unique sera réservé comme T-128 dans `openspec/tickets.json`,
  avec une branche et une PR dédiées vers `main`.
