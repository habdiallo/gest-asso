## Why

La sidebar desktop actuelle reprend la largeur et les couleurs du prototype, mais son bloc de marque, sa navigation et son pied ne reproduisent pas le visuel de référence. Ce change répond à la demande de corriger uniquement cet écart graphique, dans un seul ticket.

## What Changes

- Aligner la sidebar fixe sur `design/styles.css` et le bloc `.sidebar` de `design/app.js` : dimensions, espacements, fond translucide et séparation.
- Reproduire le logo, le nom Contribo et le sous-titre « Gestion associative ».
- Ajouter les icônes et la présentation des rubriques aux liens existants, avec survol et état actif fidèles au prototype.
- Reproduire le bloc d'identité en pied avec les données de session disponibles et conserver l'accès aux actions actuelles de thème et de déconnexion.
- Limiter les styles à la sidebar visible à partir du seuil existant de 821 px. Aucun nouveau breakpoint ou traitement tablette distinct.
- Exclure toute modification des pages, de la topbar, de la navigation mobile, des routes, des libellés de liens existants, des droits, de l'API ou de la logique de session. Les destinations supplémentaires et le sélecteur de rôle de démonstration du prototype ne sont pas repris.

## Capabilities

### New Capabilities

- `desktop-sidebar-visual`: critères de fidélité graphique de la sidebar existante, dans les deux thèmes, sans évolution fonctionnelle de la navigation.

### Modified Capabilities

Aucune. Les exigences de navigation par rôle du change `frontend-tickets-mvp-association` restent applicables ; aucune spec principale n'est encore présente dans `openspec/specs/`.

## Impact

- Ticket unique : **T-111**, priorité P2, scope/type `front/fix`, branche `front/fix-111-sidebar-desktop-design`, une seule PR vers `main`.
- Zones concernées : `contribo-front/src/app/app.html`, `app.css`, exposition en lecture des données de session dans `app.ts`, rendu vertical de `shared/navigation-menu/` et éventuelles métadonnées purement visuelles dans `core/navigation/`. Tests associés uniquement si nécessaires pour préserver les contrats existants.
- Références : `design/styles.css` (sidebar, brand, nav, profile), `design/app.js` (logo, icônes, sidebar) et `design/DESIGN (5).md` (typographies et thèmes).
- Prérequis : T-14 et variantes de navigation T-10/T-11/T-12 déjà intégrés. Vérifier leur présence avant l'apply, sans traiter d'autre ticket. Préserver également la correction mobile T-110, intégrée par la PR 47.
- Aucun backend, contrat API, migration, dépendance npm ou changement global des jetons de design.
- Acceptation : comparaison visuelle aux mêmes dimensions en clair/sombre, conformité des blocs de marque/navigation/pied, liens et actions utilisables au clavier, absence de régression du rendu mobile et du contenu principal.
