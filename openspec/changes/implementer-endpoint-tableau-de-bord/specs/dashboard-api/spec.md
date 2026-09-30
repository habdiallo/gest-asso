## ADDED Requirements

### Requirement: Sélection de la vue du tableau de bord selon le rôle
`GET /dashboard` SHALL retourner un `ManagementDashboard` (`view: MANAGEMENT`)
pour les rôles Administrateur, Trésorier et Opérateur, et un `MemberDashboard`
(`view: MEMBER`) pour le rôle Membre, conformément au discriminant `view` du
schéma `DashboardResponse` de `besoins/openapi.yaml`.

#### Scenario: Administrateur, Trésorier ou Opérateur connecté
- **WHEN** un compte de rôle Administrateur, Trésorier ou Opérateur appelle
  `GET /dashboard`
- **THEN** la réponse est un `ManagementDashboard` incluant `asOf`, `viewer`,
  `activeMemberCount`, `registeredMemberCount`, `newMemberCountThisMonth`,
  `openCampaignCount` et `recentCampaigns`

#### Scenario: Membre connecté
- **WHEN** un compte de rôle Membre appelle `GET /dashboard`
- **THEN** la réponse est un `MemberDashboard` incluant `asOf`, `viewer`,
  `unpaidDueCount`, `totalRemainingAmount`, `paidDueCount`,
  `totalContributionAmount`, `contributedSocialFundCount`, `currency` et
  `recentDues`

### Requirement: Visibilité du bilan financier de gestion selon l'autorisation Opérateur
`financialOverview` du `ManagementDashboard` SHALL être absent de la réponse
pour un Opérateur non autorisé à consulter le bilan financier
(`operatorCanRecordPayments: false`), et SHALL être présent pour
l'Administrateur, le Trésorier et l'Opérateur autorisé.

#### Scenario: Opérateur non autorisé
- **WHEN** un Opérateur dont `operatorCanRecordPayments` vaut `false` appelle
  `GET /dashboard`
- **THEN** le `ManagementDashboard` retourné ne contient pas de propriété
  `financialOverview`

#### Scenario: Opérateur autorisé, Trésorier ou Administrateur
- **WHEN** un Opérateur dont `operatorCanRecordPayments` vaut `true`, un
  Trésorier ou un Administrateur appelle `GET /dashboard`
- **THEN** le `ManagementDashboard` retourné contient `financialOverview`
  avec au moins `recentPayments`

### Requirement: Filtrage du bilan financier par campagne ou agrégat des campagnes ouvertes
`financialOverview.selectedCampaign` SHALL être renseigné, à l'exclusion de
`allOpenCampaignsSummary`, quand le paramètre `campaignId` désigne une
campagne ouverte de l'association du compte connecté. Sans `campaignId`,
`financialOverview.allOpenCampaignsSummary` SHALL être renseigné, à
l'exclusion de `selectedCampaign`, avec l'agrégat de toutes les campagnes
ouvertes de l'association.

#### Scenario: Campagne précise demandée
- **WHEN** `GET /dashboard?campaignId=<id d'une campagne ouverte de
  l'association>` est appelé par un rôle de gestion autorisé au bilan
  financier
- **THEN** `financialOverview.selectedCampaign` correspond à cette campagne
  et `financialOverview.allOpenCampaignsSummary` est absent

#### Scenario: Aucune campagne précise demandée
- **WHEN** `GET /dashboard` est appelé sans paramètre `campaignId` par un
  rôle de gestion autorisé au bilan financier
- **THEN** `financialOverview.allOpenCampaignsSummary` agrège toutes les
  campagnes ouvertes de l'association et `financialOverview.selectedCampaign`
  est absent

#### Scenario: Campagne demandée hors association ou introuvable
- **WHEN** `campaignId` ne correspond à aucune campagne ouverte de
  l'association du compte connecté
- **THEN** l'API répond `404` avec le modèle `ErrorResponse` du contrat, sans
  révéler l'existence d'une campagne d'une autre association

### Requirement: Filtrage du bilan financier par cagnotte ou agrégat des cagnottes ouvertes
`financialOverview.selectedSocialFund` SHALL être renseigné, à l'exclusion de
`allOpenSocialFundsSummary`, quand le paramètre `socialFundId` désigne une
cagnotte ouverte de l'association du compte connecté. Sans `socialFundId`,
`financialOverview.allOpenSocialFundsSummary` SHALL être renseigné, à
l'exclusion de `selectedSocialFund`, avec l'agrégat de toutes les cagnottes
ouvertes de l'association.

#### Scenario: Cagnotte précise demandée
- **WHEN** `GET /dashboard?socialFundId=<id d'une cagnotte ouverte de
  l'association>` est appelé par un rôle de gestion autorisé au bilan
  financier
- **THEN** `financialOverview.selectedSocialFund` correspond à cette
  cagnotte et `financialOverview.allOpenSocialFundsSummary` est absent

#### Scenario: Aucune cagnotte précise demandée
- **WHEN** `GET /dashboard` est appelé sans paramètre `socialFundId` par un
  rôle de gestion autorisé au bilan financier
- **THEN** `financialOverview.allOpenSocialFundsSummary` agrège toutes les
  cagnottes ouvertes de l'association et `financialOverview.selectedSocialFund`
  est absent

#### Scenario: Cagnotte demandée hors association ou introuvable
- **WHEN** `socialFundId` ne correspond à aucune cagnotte ouverte de
  l'association du compte connecté
- **THEN** l'API répond `404` avec le modèle `ErrorResponse` du contrat, sans
  révéler l'existence d'une cagnotte d'une autre association

### Requirement: Plafonnement des listes récentes
`recentCampaigns` du `ManagementDashboard` et `financialOverview.recentPayments`
SHALL chacun contenir au maximum 5 éléments, conformément à `maxItems: 5` du
contrat, quel que soit le nombre de campagnes ouvertes ou de règlements
disponibles pour le périmètre demandé.

#### Scenario: Plus de 5 campagnes ouvertes
- **WHEN** l'association du compte connecté a plus de 5 campagnes ouvertes
- **THEN** `recentCampaigns` contient exactement les 5 campagnes ouvertes les
  plus récentes

#### Scenario: Plus de 5 règlements dans le périmètre sélectionné
- **WHEN** le périmètre sélectionné (campagne précise ou toutes les
  campagnes ouvertes) compte plus de 5 règlements
- **THEN** `financialOverview.recentPayments` contient exactement les 5
  règlements les plus récents de ce périmètre

### Requirement: Rejet d'un appel non authentifié
`GET /dashboard` SHALL répondre `401` avec le modèle `ErrorResponse` du
contrat lorsque la requête ne porte pas de session valide, sans exécuter
aucun agrégat.

#### Scenario: Aucune session valide
- **WHEN** `GET /dashboard` est appelé sans cookie de session valide ni
  en-tête d'autorisation valide
- **THEN** l'API répond `401` avec le modèle `ErrorResponse` du contrat
