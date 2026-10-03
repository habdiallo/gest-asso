## ADDED Requirements

### Requirement: Génération d'un identifiant membre indépendant du téléphone

Le backend SHALL générer pour chaque nouveau compte membre un identifiant de connexion au format `initialesprenomnom-code`, en minuscules, sans accents ni séparateurs, avec un code numérique de quatre chiffres. Le téléphone SHALL rester une donnée de contact et SHALL NOT déterminer l'identifiant.

#### Scenario: Prénom composé et nom accentué

- **WHEN** un Administrateur ou un Trésorier crée un membre nommé « Jean-Pierre Diallo » avec ou sans téléphone
- **THEN** le compte reçoit un identifiant de la forme `jpdiallo-####`
- **AND** la modification ultérieure du téléphone ne modifie pas cet identifiant

#### Scenario: Identifiant sans téléphone

- **WHEN** un membre est créé sans numéro de téléphone
- **THEN** le compte reçoit quand même un identifiant généré selon la même politique

### Requirement: Unicité et collisions

Le backend SHALL garantir que l'identifiant est unique dans l'association du compte. En cas de collision du préfixe ou du code, il SHALL générer un autre code et SHALL refuser proprement la création uniquement si aucune valeur disponible ne peut être produite.

#### Scenario: Deux membres portent le même nom

- **WHEN** deux membres d'une même association ont le même prénom et le même nom
- **THEN** leurs identifiants sont distincts
- **AND** les deux comptes peuvent être créés sans réutiliser le numéro de téléphone comme différenciateur

### Requirement: Migration conservatrice des comptes existants

La migration SHALL être ciblée par les UUID inventoriés des comptes existants, conserver leurs UUID, mots de passe hashés, rôles, états, membres, associations et historiques, et fournir une correspondance de rollback.

#### Scenario: Migration d'un compte utilisant un téléphone

- **WHEN** la migration T-200 est exécutée avec l'inventaire validé d'un compte
- **THEN** il reçoit un identifiant au nouveau format
- **AND** aucun compte, membre, paiement, cotisation ou historique n'est supprimé
