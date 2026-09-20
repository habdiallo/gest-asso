## Why

La fidélité visuelle au prototype `design/` n'a jusqu'ici été vérifiée systématiquement que pour la sidebar desktop (`desktop-sidebar-visual`, change archivé `fidelite-sidebar-desktop-design`, T-111). Les autres écrans (tableau de bord, listes, fiches, formulaires) n'ont jamais fait l'objet d'une comparaison écran par écran avec leur équivalent dans `design/` en mode desktop. Le porteur du produit a par exemple constaté qu'après connexion, l'écran affiché est censé être le tableau de bord mais qu'aucun lien de navigation « Tableau de bord » n'existe dans l'application, alors que le prototype en affiche un pour chaque rôle. Sans méthode explicite, ce type d'écart s'accumule silencieusement écran après écran.

## What Changes

- Comparer méthodiquement, en mode desktop uniquement (≥1024 px, prioritairement 1440 px), chaque écran atteint après connexion à son équivalent dans `design/`, dans l'ordre réel de navigation de l'application : tableau de bord d'abord (point d'entrée après connexion), puis chaque destination du menu latéral dans son ordre d'affichage actuel.
- Pour chaque écran : capturer une référence visuelle de l'état actuel, lister précisément les écarts avec le prototype (couleurs, espacements, typographies, composants manquants ou surnuméraires), puis corriger ces écarts avant de passer à l'écran suivant. Un écran/composant n'est considéré terminé que lorsque tous ses écarts identifiés sont traités.
- Statuer explicitement sur l'absence du lien de navigation « Tableau de bord » : le change archivé `fidelite-sidebar-desktop-design` (T-111) avait volontairement exclu toute nouvelle destination de navigation du prototype pour rester purement graphique. Ce change réexamine ce point précis à la lumière de l'écart constaté, sans rouvrir le reste du périmètre déjà traité par T-111 (marque, présentation des liens existants, pied de sidebar).
- Découper le travail en un ticket indépendant par écran/composant (une branche, une PR par ticket), traité dans l'ordre de navigation, pour permettre une revue et une validation incrémentales.
- Exclure explicitement la tablette et le mobile de ce change : ils seront traités par un change OpenSpec ultérieur, une fois la totalité des écrans desktop alignée. Ce change ne modifie pas les seuils de responsive existants (821 px pour la sidebar, breakpoints Tailwind `min-[821px]`).
- **BREAKING** : aucune. Ce change ne modifie ni les routes existantes, ni les contrats API, ni les droits par rôle ; il peut ajouter une destination de navigation (tableau de bord) si l'écart est confirmé et tranché en ce sens.

## Capabilities

### New Capabilities

- `desktop-visual-parity` : critères de fidélité visuelle desktop (≥1024 px) pour les écrans métier existants (tableau de bord, membres, catégories de revenu, campagnes, cagnottes, rôles et utilisateurs, mon espace, dialogues de formulaire), par comparaison avec `design/`, sans changement de comportement fonctionnel hors décision explicite sur le lien de navigation tableau de bord.

### Modified Capabilities

- `desktop-sidebar-visual` : la exigence issue de T-111 selon laquelle « les éléments graphiques n'ajoutent aucun lien du prototype [...] aucune rubrique Administration vide » est réexaminée pour la seule destination « Tableau de bord », identifiée par le porteur du produit comme un écart réel avec le prototype. Le reste de cette exigence (pas de nouvelle rubrique vide, pas d'autre destination du prototype comme le sélecteur de rôle de démonstration) reste inchangé.

## Impact

- Zones concernées : `contribo-front/src/app/features/*` (dashboard, members, income-categories, campaigns, social-funds, roles-users, member-space), `shared/navigation-menu/`, `shared/form-dialog/`, et `core/navigation/` si le lien tableau de bord est ajouté (nouvelle entrée `NAVIGATION_PATHS.dashboard` et route associée le cas échéant).
- Aucun impact backend, contrat API (`besoins/openapi.yaml`), migration ou dépendance npm.
- Découpage en plusieurs tickets indépendants, tous `scope front` / `type fix`, un par écran/composant, réservés dans `openspec/tickets.json` lors de la rédaction de `tasks.md` de ce change.
- Un futur change distinct couvrira la tablette et le mobile une fois ce change desktop terminé ; il n'est pas planifié ici.
