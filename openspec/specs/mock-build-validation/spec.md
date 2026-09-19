# mock-build-validation Specification

## Purpose
TBD - created by archiving change corriger-demarrage-mock. Update Purpose after archive.
## Requirements
### Requirement: Compilation des configurations frontend

Le frontend MUST compiler en configurations production et mock avec le client généré depuis `besoins/openapi.yaml` et la version configurée du générateur.

#### Scenario: Démarrage sans backend
- **WHEN** le développeur lance `npm run start:mock` après génération du client
- **THEN** la compilation réussit et la page de connexion est servie sur localhost:4200

### Requirement: Validation du JSON du barème

Le handler mock de `updateCampaignCategoryAmounts` MUST accepter le tableau JSON prévu par le contrat, recalculer le bilan de démonstration et conserver les restrictions de rôle et de statut existantes.

#### Scenario: Tableau valide
- **WHEN** un Trésorier envoie un tableau contenant un identifiant de catégorie et un montant pour une campagne à venir
- **THEN** le handler retourne 200 et le montant ainsi que le bilan sont mis à jour

#### Scenario: Collection invalide
- **WHEN** un Trésorier envoie un objet à la place du tableau de montants
- **THEN** le handler retourne 400 avec VALIDATION_ERROR

#### Scenario: Rôle non autorisé
- **WHEN** un Membre tente de modifier le barème
- **THEN** le handler retourne 403 avec ACCESS_DENIED

### Requirement: Contrôle de compilation en PR

La CI MUST installer les dépendances, valider et générer le client API, puis compiler les configurations production et mock pour les PR vers main.

#### Scenario: Erreur présente seulement dans un mock
- **WHEN** une PR contient un mock qui ne compile pas alors que le build production réussit
- **THEN** le contrôle de compilation frontend échoue sur le build mock

