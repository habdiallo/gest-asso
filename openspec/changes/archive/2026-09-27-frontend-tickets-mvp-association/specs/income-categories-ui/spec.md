## ADDED Requirements

### Requirement: Liste des catégories de revenu
Le frontend SHALL afficher, pour l'Administrateur uniquement, la liste des catégories de revenu existantes.

#### Scenario: Consultation par l'Administrateur
- **WHEN** un utilisateur Administrateur ouvre l'écran des catégories de revenu
- **THEN** le frontend affiche la liste des catégories avec leur libellé

#### Scenario: Écran inaccessible aux autres rôles
- **WHEN** un utilisateur Trésorier, Opérateur ou Membre tente d'accéder à l'écran des catégories de revenu
- **THEN** le frontend refuse l'accès à cet écran

### Requirement: Création d'une catégorie de revenu
Le frontend SHALL permettre à l'Administrateur de créer une catégorie de revenu avec un libellé obligatoire, sans champ de montant de cotisation (US-REV-001, RG-REV-001, RG-REV-002).

#### Scenario: Création réussie
- **WHEN** un utilisateur Administrateur soumet le formulaire de création avec un libellé renseigné
- **THEN** le frontend appelle l'API de création et ajoute la nouvelle catégorie à la liste

#### Scenario: Libellé manquant
- **WHEN** un utilisateur Administrateur soumet le formulaire de création sans libellé
- **THEN** le frontend bloque la soumission et affiche une erreur de validation

#### Scenario: Aucun champ de montant proposé
- **WHEN** un utilisateur Administrateur ouvre le formulaire de création d'une catégorie
- **THEN** le frontend ne propose aucun champ de montant de cotisation, une catégorie n'ayant pas de montant permanent

### Requirement: Modification d'une catégorie de revenu
Le frontend SHALL permettre à l'Administrateur de modifier le libellé d'une catégorie existante, sans impact rétroactif sur les cotisations déjà établies (US-REV-002).

#### Scenario: Modification réussie
- **WHEN** un utilisateur Administrateur modifie le libellé d'une catégorie et soumet le formulaire
- **THEN** le frontend appelle l'API de modification et met à jour le libellé affiché partout dans l'application, sans recalculer les cotisations passées

#### Scenario: Avertissement de non-rétroactivité
- **WHEN** un utilisateur Administrateur ouvre le formulaire de modification d'une catégorie
- **THEN** le frontend affiche une information rappelant que la modification n'affecte pas les cotisations déjà établies
