## ADDED Requirements

### Requirement: Derniers règlements filtrés par la campagne sélectionnée
Le panneau « Derniers règlements » du tableau de bord de gestion SHALL
afficher uniquement les règlements (`financialOverview.recentPayments`) de la
campagne désignée par `campaignId` quand une campagne précise est
sélectionnée dans le panneau « Périmètre des indicateurs ». Quand aucune
campagne précise n'est sélectionnée (« Toutes les campagnes ouvertes »), le
panneau SHALL afficher les règlements les plus récents des campagnes
ouvertes, plafonnés à 5 éléments conformément au contrat
(`ManagementFinancialOverview.recentPayments`, `maxItems: 5`).

#### Scenario: Campagne précise sélectionnée
- **WHEN** l'utilisateur sélectionne une campagne précise dans le sélecteur
  « Campagne de cotisation »
- **THEN** seuls les règlements de cette campagne apparaissent dans « Derniers
  règlements », et le libellé de périmètre affiché au-dessus correspond à
  cette même campagne

#### Scenario: Aucune campagne précise sélectionnée
- **WHEN** l'utilisateur choisit « Toutes les campagnes ouvertes »
- **THEN** les règlements affichés proviennent des campagnes ouvertes,
  toutes confondues, sans dépasser 5 éléments

### Requirement: Navigation vers l'historique des cotisations de la sélection en cours
Le bouton « Voir l'historique » du panneau « Derniers règlements » SHALL
naviguer vers l'onglet Cotisations de l'écran de détail de la campagne
sélectionnée quand une campagne précise est sélectionnée. Quand aucune
campagne précise n'est sélectionnée, ce bouton SHALL être masqué, faute
d'écran présentant un historique combiné de plusieurs campagnes.

#### Scenario: Campagne précise sélectionnée
- **WHEN** l'utilisateur clique sur « Voir l'historique » alors qu'une
  campagne précise est sélectionnée
- **THEN** l'application navigue vers l'écran de détail de cette campagne
  avec l'onglet Cotisations déjà actif

#### Scenario: Toutes les campagnes ouvertes sélectionnées
- **WHEN** l'utilisateur consulte le panneau « Derniers règlements » alors que
  « Toutes les campagnes ouvertes » est sélectionné
- **THEN** le bouton « Voir l'historique » n'est pas affiché
