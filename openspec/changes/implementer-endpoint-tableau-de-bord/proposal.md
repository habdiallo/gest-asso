## Why

Le contrat `contribo-back/src/main/resources/contribo-api.yml` définit `GET /dashboard` et le frontend Angular
en dépend dès la connexion (la page d'accueil post-connexion l'appelle
immédiatement). Aucun contrôleur backend ne l'implémente : `contribo-back/src/main/java/com/habdiallo/contribo/api/rest/`
ne contient pas de `DashboardController`. La requête retourne donc un 404
"aucun gestionnaire trouvé", que le dispatch d'erreur de Spring transforme en
401 (le filtre JWT ne rejoue pas l'authentification sur le forward `/error`).
Le frontend interprète ce 401 comme une session invalide et renvoie
systématiquement l'utilisateur vers `/login`, y compris juste après une
connexion réussie avec des identifiants valides. Le tableau de bord est donc
inutilisable pour tous les rôles tant que cet endpoint n'existe pas.

## What Changes

- Ajouter un `DashboardController` (adapter REST) qui implémente
  `GET /dashboard` conformément à `contribo-back/src/main/resources/contribo-api.yml` : paramètres
  `campaignId` et `socialFundId` optionnels, réponse `DashboardResponse`
  (`oneOf` discriminé par `view` : `ManagementDashboard` ou `MemberDashboard`).
- Ajouter le cas d'usage applicatif (ex. `DashboardService`) qui sélectionne la
  vue selon le rôle de l'utilisateur authentifié (Administrateur, Trésorier,
  Opérateur autorisé/non autorisé, Membre) et assemble les agrégats à partir
  des ports de persistance existants (membres, campagnes, cagnottes,
  règlements, cotisations) sans dupliquer leur logique métier.
- Appliquer la règle de visibilité financière du contrat : `financialOverview`
  est absent pour un Opérateur non autorisé à consulter le bilan financier.
- Implémenter le filtrage par campagne/cagnotte précise (`selectedCampaign`,
  `selectedSocialFund`) ou l'agrégat de toutes les campagnes/cagnottes
  ouvertes (`allOpenCampaignsSummary`, `allOpenSocialFundsSummary`) et le
  plafond de 5 éléments pour `recentCampaigns` et `recentPayments`.
- Implémenter la vue Membre (`MemberDashboard`) : échéances impayées/payées,
  montants restants/contribués, nombre de cagnottes contribuées,
  `recentDues`.
- Couvrir les erreurs du contrat (`401`, `403`, `404`, `500`) avec le format
  `ErrorResponse` existant, sans exposer d'exception interne.

## Capabilities

### New Capabilities
- `dashboard-api`: endpoint `GET /dashboard`, sélection de vue par rôle,
  agrégats financiers de gestion filtrés par campagne/cagnotte, vue Membre.

### Modified Capabilities

(aucune ; ce change livre l'implémentation backend d'un contrat déjà défini,
sans changer le comportement déjà spécifié côté frontend dans
`dashboard-recent-payments-scope`)

## Impact

- `contribo-back/src/main/java/com/habdiallo/contribo/api/rest/` : nouveau
  `DashboardController`.
- `contribo-back/src/main/java/com/habdiallo/contribo/application/` :
  nouveau cas d'usage (ex. package `dashboard`), consommant les ports de
  persistance membres/campagnes/cagnottes/règlements/cotisations déjà en
  place pour les autres fonctionnalités.
- Aucune migration de schéma attendue a priori (lecture agrégée de données
  existantes) ; à confirmer en design si un index ou une vue matérialisée
  s'avère nécessaire pour les agrégats.
- `contribo-front` : aucun changement de code attendu, le client généré et
  les composants consomment déjà `GET /dashboard` selon le contrat ; ce
  change débloque leur fonctionnement réel en local et en intégration.
