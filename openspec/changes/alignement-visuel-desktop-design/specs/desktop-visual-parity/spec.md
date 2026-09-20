## ADDED Requirements

### Requirement: Fidélité visuelle du tableau de bord en desktop

Le frontend SHALL reproduire en desktop (≥1024 px, référence 1440 px) la présentation visuelle du tableau de bord de `design/` (cartes d'indicateurs, panneau de périmètre des indicateurs, campagnes récentes, bilan financier, actions rapides, synthèses de campagne/cagnotte) pour tous les écarts identifiés lors de la revue comparative avec le prototype, dans les deux thèmes, sans changer le contenu ni le comportement fonctionnel préexistant de l'écran (T-16).

#### Scenario: Comparaison directe à l'écran atteint après connexion
- **WHEN** un utilisateur authentifié affiche le tableau de bord à 1440 px, thème sombre puis clair
- **THEN** la mise en page, les espacements, les typographies et les composants correspondent à l'équivalent dans `design/`
- **AND** les indicateurs affichés restent ceux fournis par l'API, sans donnée fictive du prototype

#### Scenario: Sélection du périmètre des indicateurs financiers
- **WHEN** un utilisateur de gestion disposant d'un bilan financier (`financialOverview`) sélectionne une campagne de cotisation ou une cagnotte sociale ouverte dans le panneau « Périmètre des indicateurs »
- **THEN** le tableau de bord recharge `GET /dashboard` avec `campaignId`/`socialFundId` correspondants et les panneaux de synthèse affichent le bilan de la sélection
- **AND** l'absence d'agrégat multi-cagnottes dans le contrat n'est jamais comblée par une donnée reconstituée côté frontend

#### Scenario: Raccourcis de navigation du panneau Actions rapides
- **WHEN** un utilisateur de gestion consulte le panneau « Actions rapides »
- **THEN** seuls les raccourcis vers des écrans que son rôle peut atteindre sont affichés, avec le même critère d'autorisation que l'écran cible
- **AND** chaque raccourci navigue vers l'écran existant correspondant, sans ouvrir à distance une boîte de dialogue d'une autre fonctionnalité

### Requirement: Fidélité visuelle des écrans Membres en desktop

Le frontend SHALL reproduire en desktop la présentation visuelle de la liste des membres et de la fiche membre (onglets inclus) telle que définie par `design/`, pour les écarts identifiés lors de la revue, sans changer les données affichées, les droits par rôle ni le comportement des actions existantes.

#### Scenario: Liste et fiche conformes au prototype
- **WHEN** un utilisateur autorisé consulte la liste des membres puis une fiche membre à 1440 px, dans les deux thèmes
- **THEN** la présentation (tableau, filtres, bloc d'informations, onglets) correspond à l'équivalent dans `design/`
- **AND** les actions et droits par rôle existants restent inchangés

### Requirement: Fidélité visuelle de l'écran Catégories de revenu en desktop

Le frontend SHALL reproduire en desktop la présentation visuelle de la liste des catégories de revenu et de ses dialogues de création/modification telle que définie par `design/`, pour les écarts identifiés lors de la revue, sans changer le comportement existant.

#### Scenario: Liste et dialogues conformes au prototype
- **WHEN** un Administrateur consulte l'écran des catégories de revenu puis ouvre le dialogue de création ou de modification à 1440 px, dans les deux thèmes
- **THEN** la présentation correspond à l'équivalent dans `design/`
- **AND** la validation et l'enregistrement existants restent inchangés

### Requirement: Fidélité visuelle des écrans Campagnes en desktop

Le frontend SHALL reproduire en desktop la présentation visuelle de la liste des campagnes et de l'écran de détail (onglets Barème, Cotisations, Bilan, dialogues associés) telle que définie par `design/`, pour les écarts identifiés lors de la revue, sans changer le comportement existant.

#### Scenario: Liste et détail conformes au prototype
- **WHEN** un utilisateur autorisé consulte la liste des campagnes puis le détail d'une campagne, chaque onglet successivement, à 1440 px, dans les deux thèmes
- **THEN** la présentation de chaque onglet et des dialogues associés correspond à l'équivalent dans `design/`
- **AND** les actions et droits par rôle existants restent inchangés

### Requirement: Fidélité visuelle des écrans Cagnottes en desktop

Le frontend SHALL reproduire en desktop la présentation visuelle de la liste des cagnottes et de l'écran de détail (suivi, contributions, dialogues associés) telle que définie par `design/`, pour les écarts identifiés lors de la revue, sans changer le comportement existant.

#### Scenario: Liste et détail conformes au prototype
- **WHEN** un utilisateur autorisé consulte la liste des cagnottes puis le détail d'une cagnotte à 1440 px, dans les deux thèmes
- **THEN** la présentation correspond à l'équivalent dans `design/`
- **AND** les actions et droits par rôle existants restent inchangés

### Requirement: Fidélité visuelle de l'écran Rôles et utilisateurs en desktop

Le frontend SHALL reproduire en desktop la présentation visuelle de la liste des utilisateurs et de leurs rôles telle que définie par `design/`, pour les écarts identifiés lors de la revue, sans changer le comportement existant.

#### Scenario: Liste conforme au prototype
- **WHEN** un Administrateur consulte l'écran Rôles et utilisateurs à 1440 px, dans les deux thèmes
- **THEN** la présentation correspond à l'équivalent dans `design/`

### Requirement: Fidélité visuelle de l'espace personnel du membre en desktop

Le frontend SHALL reproduire en desktop la présentation visuelle de l'espace personnel du membre (profil, cotisations, contributions) telle que définie par `design/`, pour les écarts identifiés lors de la revue, sans changer le comportement existant.

#### Scenario: Onglets conformes au prototype
- **WHEN** un utilisateur authentifié consulte chaque onglet de son espace personnel à 1440 px, dans les deux thèmes
- **THEN** la présentation de chaque onglet correspond à l'équivalent dans `design/`

### Requirement: Fidélité visuelle des dialogues de formulaire transverses en desktop

Le frontend SHALL reproduire en desktop la présentation visuelle du composant de dialogue de formulaire partagé (`shared/form-dialog`) telle que définie par `design/` (superposition centrée, largeur, rayon, arrière-plan), pour les écarts restant après le traitement des écrans propriétaires, sans changer le piège de focus ni la fermeture par Échap déjà vérifiés (T-103).

#### Scenario: Dialogue conforme au prototype
- **WHEN** un utilisateur ouvre un dialogue de formulaire existant à 1440 px, dans les deux thèmes
- **THEN** la présentation du dialogue correspond à l'équivalent desktop dans `design/`
- **AND** le comportement clavier existant (piège de focus, Échap, restitution du focus) reste inchangé

### Requirement: Méthode de revue comparative desktop

La revue de fidélité visuelle SHALL procéder écran par écran, dans l'ordre de navigation réel de l'application (tableau de bord, puis chaque destination du menu latéral dans son ordre d'affichage actuel), en capturant une référence visuelle de l'état courant avant de lister et de corriger ses écarts avec `design/`, exclusivement en largeur desktop (≥1024 px) pour ce change.

#### Scenario: Écran traité avant de passer au suivant
- **WHEN** un écran de la liste ci-dessus fait l'objet d'une correction visuelle
- **THEN** tous les écarts identifiés pour cet écran sont corrigés et vérifiés avant que le ticket suivant ne commence
- **AND** aucune correction de tablette ou de mobile n'est effectuée dans ce change
