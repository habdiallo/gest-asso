## ADDED Requirements

### Requirement: Liste des utilisateurs et de leurs rôles
Le frontend SHALL afficher, pour l'Administrateur uniquement, la liste des comptes utilisateurs avec leur rôle applicatif courant.

#### Scenario: Consultation par l'Administrateur
- **WHEN** un utilisateur Administrateur ouvre l'écran de gestion des rôles
- **THEN** le frontend affiche la liste des utilisateurs avec leur rôle applicatif (Administrateur, Trésorier, Opérateur, Membre) et, pour les Opérateurs, l'état de leur attribut `peut_enregistrer_paiements`

#### Scenario: Écran inaccessible aux autres rôles
- **WHEN** un utilisateur Trésorier, Opérateur ou Membre tente d'accéder à l'écran de gestion des rôles
- **THEN** le frontend refuse l'accès à cet écran (RG-ROLE-002)

### Requirement: Attribution d'un rôle applicatif
Le frontend SHALL permettre uniquement à l'Administrateur d'attribuer ou modifier le rôle applicatif d'un utilisateur parmi les quatre rôles disponibles (US-ROLE-001, RG-ROLE-001 à RG-ROLE-004).

#### Scenario: Changement de rôle
- **WHEN** un utilisateur Administrateur sélectionne un nouveau rôle applicatif pour un utilisateur et confirme
- **THEN** le frontend appelle l'API de mise à jour du rôle et reflète le nouveau rôle dans la liste et dans la navigation de l'utilisateur concerné à sa prochaine session

#### Scenario: Fonction associative non impactée
- **WHEN** un utilisateur Administrateur modifie le rôle applicatif d'un membre
- **THEN** le frontend n'affiche et ne modifie aucun champ de fonction associative (Président, Secrétaire, etc.) dans cet écran, ces deux notions étant indépendantes (RG-ROLE-006)

### Requirement: Gestion de l'autorisation de paiement d'un Opérateur
Le frontend SHALL permettre uniquement à l'Administrateur d'activer ou désactiver l'attribut `peut_enregistrer_paiements` d'un compte de rôle Opérateur (§2.3, RG-ROLE-007 à RG-ROLE-009).

#### Scenario: Activation de l'autorisation
- **WHEN** un utilisateur Administrateur active l'attribut `peut_enregistrer_paiements` sur un compte Opérateur
- **THEN** le frontend appelle l'API correspondante et l'Opérateur concerné obtient l'accès aux actions d'enregistrement de règlements et de contributions dès sa prochaine consultation

#### Scenario: Désactivation de l'autorisation
- **WHEN** un utilisateur Administrateur désactive l'attribut `peut_enregistrer_paiements` sur un compte Opérateur
- **THEN** le frontend appelle l'API correspondante et l'Opérateur concerné perd l'accès aux actions d'enregistrement de règlements et de contributions dès sa prochaine consultation

#### Scenario: Contrôle non affiché pour les autres rôles
- **WHEN** un utilisateur consulte un compte de rôle Administrateur, Trésorier ou Membre
- **THEN** le frontend n'affiche aucun contrôle `peut_enregistrer_paiements`, cet attribut étant propre au rôle Opérateur
