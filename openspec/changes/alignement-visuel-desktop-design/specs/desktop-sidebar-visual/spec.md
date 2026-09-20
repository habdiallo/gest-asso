## ADDED Requirements

### Requirement: Lien de navigation vers le tableau de bord

Le frontend SHALL afficher, en tête de la navigation verticale de chaque rôle authentifié, un lien « Tableau de bord » menant à l'écran de tableau de bord existant (point d'entrée après connexion, T-16), avec la même présentation `.nav-item` (icône, état actif, focus) que les autres liens de la sidebar.

#### Scenario: Lien disponible pour tous les rôles authentifiés
- **WHEN** un Administrateur, Trésorier, Opérateur ou Membre consulte sa sidebar
- **THEN** le premier lien affiché est « Tableau de bord » et mène à la route racine authentifiée existante
- **AND** les liens suivants conservent leur ordre relatif actuel issu de `navigationItemsForRole`

#### Scenario: État actif sur le tableau de bord
- **WHEN** l'utilisateur consulte l'écran de tableau de bord
- **THEN** le lien « Tableau de bord » affiche l'état actif complet (repère latéral, `aria-current="page"`) comme les autres liens de la sidebar
- **AND** aucun autre lien n'affiche l'état actif simultanément

## MODIFIED Requirements

### Requirement: Présentation des liens et de leur état actif

Le frontend SHALL appliquer aux liens verticaux existants la présentation `.nav` et `.nav-item` du prototype : icône 18 px, texte 14 px, gap 12 px, hauteur nominale 43 px, rayon 9 px et espacement entre items de 5 px. Il SHALL reproduire le survol et l'état actif avec fond gold-wash, bordure teintée, accent sur texte/icône et repère latéral lumineux. Il SHALL permettre l'agrandissement du texte sans couper les libellés. La rubrique Administration SHALL regrouper visuellement les liens Catégories de revenu et Rôles et utilisateurs, dans leur ordre relatif actuel, uniquement lorsqu'ils sont présents.

#### Scenario: Navigation vers une destination existante
- **WHEN** un utilisateur active un lien de sidebar puis consulte une sous-route couverte par ce lien
- **THEN** le lien garde sa destination et son comportement actuels et affiche l'état actif complet avec `aria-current="page"`
- **AND** le repère latéral est visible sans être coupé et le focus clavier reste perceptible

#### Scenario: Présentation selon le rôle actuel
- **WHEN** un Administrateur, Trésorier, Opérateur ou Membre consulte sa sidebar
- **THEN** les liens affichés sont ceux de `navigationItemsForRole`, complétés de la seule destination « Tableau de bord » ajoutée en tête de chaque rôle authentifié (cf. exigence « Lien de navigation vers le tableau de bord »), sans changer l'ordre relatif ni les libellés des autres liens
- **AND** les éléments graphiques n'ajoutent aucune autre destination du prototype (notamment pas de sélecteur de rôle de démonstration) ni aucune rubrique Administration vide
