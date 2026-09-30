## 1. Ticket et branche

- [x] 1.1 Résoudre `node scripts/tickets.mjs resolve T-181 --json`, lire les prérequis et l'état Git, créer/réutiliser la branche `back/feat-181-endpoint-tableau-de-bord` depuis `origin/develop`. [T-181]
- [x] 1.2 Exécuter `node scripts/tickets.mjs verify T-181` avant toute modification de code applicatif. [T-181]

## 2. Ports de persistance (extension, sans nouveau port transverse)

- [x] 2.1 Ajouter à `MemberRepository` les méthodes de comptage nécessaires à `activeMemberCount`, `registeredMemberCount` et `newMemberCountThisMonth`, scopées par association. [T-181]
- [x] 2.2 Ajouter à `CampaignCatalogRepository` une méthode listant les campagnes ouvertes les plus récentes d'une association (limite 5) et une méthode de résolution d'une campagne ouverte précise par id et association. [T-181]
- [x] 2.3 Ajouter à `CampaignPaymentRepository` (ou port équivalent) une méthode listant les règlements les plus récents (limite 5) pour une campagne précise ou pour l'ensemble des campagnes ouvertes d'une association. [T-181]
- [x] 2.4 Ajouter les méthodes d'agrégat financier des campagnes ouvertes (`CampaignFinancialSummary` pour `allOpenCampaignsSummary`) au port approprié, en réutilisant les calculs déjà utilisés par `CampaignController`/`CampaignService` si existants. [T-181]
- [x] 2.5 Ajouter à `SocialFundRepository` les méthodes de résolution d'une cagnotte ouverte précise et d'agrégat des cagnottes ouvertes (`SocialFundsAggregateOverview`) d'une association. [T-181]
- [x] 2.6 Ajouter à `MemberDuesRepository` les méthodes nécessaires à `unpaidDueCount`, `totalRemainingAmount`, `paidDueCount`, `totalContributionAmount`, `contributedSocialFundCount` et `recentDues` pour un membre. [T-181]

## 3. Cas d'usage applicatif

- [x] 3.1 Créer le package `application/dashboard` avec `DashboardService`, consommant `AuthorizationService.requireAuthenticated` pour résoudre le rôle et l'association du compte connecté. [T-181]
- [x] 3.2 Implémenter l'assemblage du `ManagementDashboard` (Administrateur, Trésorier, Opérateur), avec `financialOverview` présent uniquement pour un Opérateur autorisé (`operatorCanRecordPayments: true`), le Trésorier ou l'Administrateur. [T-181]
- [x] 3.3 Implémenter le filtrage par `campaignId`/`socialFundId` optionnels : campagne/cagnotte précise (`selectedCampaign`/`selectedSocialFund`) ou agrégat de toutes les campagnes/cagnottes ouvertes (`allOpenCampaignsSummary`/`allOpenSocialFundsSummary`), avec rejet `404` si l'id demandé ne correspond à aucune ressource ouverte de l'association. [T-181]
- [x] 3.4 Implémenter l'assemblage du `MemberDashboard` (rôle Membre). [T-181]
- [x] 3.5 Vérifier les invariants du domaine indépendamment de Spring/JDBC (tests unitaires du service avec doubles de test des ports), selon `backend-architecture-foundation`. [T-181]

## 4. Adaptateur REST

- [x] 4.1 Créer `DashboardController` (`GET /dashboard`), paramètres `campaignId`/`socialFundId` optionnels, délégation complète à `DashboardService`, mapping des erreurs métier vers `ErrorResponse` du contrat (`401`, `403`, `404`, `500`). [T-181]
- [x] 4.2 Vérifier que le DTO généré `DashboardResponse` (discriminant `view`) est régénéré et consommé sans modification manuelle du généré (`mvn generate-sources`). [T-181]

## 5. Tests d'intégration

- [x] 5.1 Ajouter des tests `@SpringBootTest` (Testcontainers PostgreSQL, suivant `RsaIntegrationTestSupport`) couvrant chaque scénario de `specs/dashboard-api/spec.md` : vue Management par rôle, vue Membre, visibilité de `financialOverview` selon l'autorisation Opérateur, filtrage campagne/cagnotte précise vs agrégat, plafond de 5 éléments, 404 hors association, 401 non authentifié. [T-181]
- [x] 5.2 Exécuter `mvn test` puis `mvn verify` depuis `contribo-back/` et vérifier qu'aucun test existant ne régresse. [T-181] (`mvn test` et `mvn verify` passent, 53 tests.)

## 6. Validation locale et PR

- [x] 6.1 Lancer le backend et le frontend en local (sans mock) et vérifier manuellement que la connexion administrateur ne renvoie plus vers `/login`, puis que `GET /api/v1/dashboard` répond `200`; les autres rôles sont couverts par les tests d'intégration. [T-181]
- [x] 6.2 Mettre à jour les cases de ce fichier `tasks.md` pour les seules tâches réellement réalisées. [T-181]
- [ ] 6.3 Committer sur `back/feat-181-endpoint-tableau-de-bord`, pousser la branche et ouvrir une PR en brouillon vers `develop` avec le modèle `.github/pull_request_template.md`, en référençant `T-181` et ce change OpenSpec. [T-181]
