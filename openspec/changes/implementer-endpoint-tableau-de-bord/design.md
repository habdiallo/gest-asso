## Context

`contribo-back/src/main/resources/contribo-api.yml` définit `GET /dashboard` (`operationId: getDashboard`)
avec une réponse `DashboardResponse` (`oneOf` discriminé par `view` :
`ManagementDashboard` pour Administrateur/Trésorier/Opérateur, `MemberDashboard`
pour Membre). Le backend expose déjà, pour les autres fonctionnalités, une
architecture hexagonale : `domain/` (modèles indépendants de Spring/JDBC),
`application/<domaine>/` (cas d'usage + ports), `outbound/persistence/<domaine>/`
(adaptateurs JDBC), `api/rest/` (contrôleurs REST au bord du système,
DTO générés en frontière). Les packages `application/campaign`,
`application/members`, `application/socialfund`, `application/categories`
exposent déjà des ports (`CampaignCatalogRepository`, `CampaignPaymentRepository`,
`CampaignDueRepository`, `MemberRepository`, `MemberDuesRepository`,
`SocialFundRepository`) consommés par `CampaignController`, `MemberController`,
`SocialFundController`, etc. `AuthorizationService.requireAuthenticated(userId)`
retourne déjà un `AuthenticatedAccount` (rôle, `associationId`,
`operatorCanRecordPayments`), utilisé par les autres services pour scoper les
requêtes par association et brancher le comportement selon le rôle.

Aucun `DashboardController` ni cas d'usage associé n'existe. Le frontend
appelle systématiquement `GET /dashboard` juste après connexion ; son absence
provoque un 404 masqué en 401 par le dispatch d'erreur de Spring (le filtre
JWT ne s'exécute pas sur le forward `/error`), que le frontend interprète
comme une session invalide et qui renvoie l'utilisateur vers `/login`.

## Goals / Non-Goals

**Goals:**
- Implémenter `GET /dashboard` conformément au contrat, pour les deux vues
  (`MANAGEMENT`, `MEMBER`) et les deux filtres optionnels (`campaignId`,
  `socialFundId`).
- Réutiliser les ports de persistance existants (campagnes, cagnottes,
  membres, règlements, cotisations) plutôt que dupliquer leur logique
  métier ou leur schéma de lecture.
- Respecter la règle de visibilité financière : `financialOverview` absent
  pour un Opérateur non autorisé à consulter le bilan financier.
- Rendre le tableau de bord utilisable pour tous les rôles dès la connexion,
  en local comme en intégration.

**Non-Goals:**
- Ne pas introduire de nouveau mécanisme de cache ou de vue matérialisée
  pour ce MVP ; les agrégats sont calculés à la demande. Une optimisation de
  performance reste un change ultérieur si un besoin réel est mesuré.
- Ne pas modifier le contrat `contribo-back/src/main/resources/contribo-api.yml` : ce change livre
  l'implémentation backend d'un contrat déjà stable et déjà consommé par le
  frontend (`dashboard-recent-payments-scope`).
- Ne pas changer le comportement du frontend : aucun fichier
  `contribo-front` n'est attendu dans ce change.

## Decisions

### Nouveau package applicatif `application/dashboard`
Un `DashboardService` orchestre l'assemblage de la réponse à partir des
ports existants, suivant le même schéma que les services actuels (ex.
`AuthenticationService.toCurrentUser`). Alternative écartée : loger cette
logique dans un service existant (ex. `CampaignService`) - rejetée car le
tableau de bord agrège plusieurs domaines et mérite sa propre frontière,
comme le reste du découpage par domaine du dépôt.

### Sélection de vue par rôle dans le service, pas dans le contrôleur
`DashboardController` délègue entièrement au `DashboardService` la
résolution du rôle (`AuthorizationService.requireAuthenticated`) et le choix
entre `ManagementDashboard` et `MemberDashboard`. Le contrôleur reste un
adaptateur REST mince qui traduit paramètres de requête et réponse du
contrat, conformément à `backend-architecture-foundation`.

### Extension des ports existants plutôt qu'un port d'agrégation transverse
Les besoins d'agrégats (nombre de membres actifs/enregistrés/nouveaux ce
mois, campagnes ouvertes récentes, règlements récents filtrés, cagnottes
ouvertes) sont couverts en ajoutant des méthodes de lecture ciblées aux
ports `MemberRepository`, `CampaignCatalogRepository`,
`CampaignPaymentRepository`, `SocialFundRepository`, `MemberDuesRepository`,
plutôt qu'en créant un port de requête transverse unique. Alternative
écartée : un `DashboardQueryPort` unique interrogeant directement le schéma
- rejetée car elle contournerait les frontières de domaine déjà posées et
dupliquerait des règles (ex. définition d'une campagne "ouverte") détenues
par les adaptateurs existants.

### Pas de nouvelle migration Flyway a priori
Les agrégats se lisent depuis les tables existantes
(`members`, `campaigns`, `payments`, `dues`, `social_funds`,
`campaign_category_amounts`). Si le profilage des requêtes en tâche
d'implémentation révèle un besoin d'index pour les filtres par date/statut,
une migration dédiée sera ajoutée à cette tâche, pas en amont par précaution.

### Erreurs du contrat
`403` (Opérateur non autorisé demandant explicitement un bilan financier non
prévu par le contrat côté paramètres) et `404` (campagne/cagnotte demandée
introuvable ou hors association) suivent le même `ApiException`/
`ErrorResponse` déjà utilisé par `CampaignController`/`SocialFundController`,
sans nouveau mécanisme d'erreur.

## Risks / Trade-offs

- [Agrégation multi-domaines dans un seul service] → Risque de couplage si
  `DashboardService` accumule trop de dépendances. Mitigation : limiter le
  service à l'orchestration et laisser le calcul métier (ex. définition
  d'une campagne ouverte, d'un règlement récent) dans les ports/adaptateurs
  de domaine existants.
- [Performance des agrégats à la demande] → Sans cache, chaque affichage du
  tableau de bord déclenche plusieurs requêtes. Mitigation : mesurer avant
  d'optimiser ; le MVP privilégie la correction fonctionnelle. Un change de
  performance dédié reste possible si un besoin réel est observé.
- [Confusion 404 vs 403 pour une campagne/cagnotte hors association] →
  Mitigation : suivre la convention déjà en place dans
  `CampaignController`/`SocialFundController` (404 plutôt que 403, pour ne
  pas révéler l'existence d'une ressource d'une autre association).

## Open Questions

- La définition exacte de « nouveaux membres ce mois » (`newMemberCountThisMonth`)
  doit-elle utiliser le fuseau horaire du serveur ou celui de l'association ?
  À trancher en tâche d'implémentation en cohérence avec les autres champs
  datés du contrat (aucune association au fuseau horaire n'existe
  actuellement dans le domaine).
- Faut-il paginer/limiter `recentCampaigns`/`recentPayments` côté requête SQL
  (`LIMIT 5`) ou en mémoire après lecture complète ? Privilégier `LIMIT 5`
  en SQL pour éviter de charger des ensembles non bornés ; à confirmer selon
  les méthodes déjà existantes sur les ports concernés.
